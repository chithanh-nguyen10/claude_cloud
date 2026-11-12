#!/usr/bin/env python3
"""CP Calc runner.

Chạy trên máy của bạn để tab "Stress test & Benchmark" biên dịch và chạy code.
Runs on your machine so the "Stress test & Benchmark" tab can compile and run code.

    python runner.py            (Windows: py runner.py, or double-click start-runner.bat)
    python runner.py --port 9000 --no-browser

Only standard library. Listens on 127.0.0.1 only and requires a per-session token,
so other websites cannot use it.
"""
import argparse
import hashlib
import http.server
import json
import os
import platform
import re
import secrets
import shlex
import shutil
import subprocess
import sys
import threading
import time
import webbrowser
from pathlib import Path
from urllib.parse import urlparse, parse_qs

ROOT = Path(__file__).resolve().parent
WORK = ROOT / "work"
IS_WIN = os.name == "nt"
IS_MAC = sys.platform == "darwin"
EXE = ".exe" if IS_WIN else ""
TOKEN = secrets.token_urlsafe(24)
RUN_LOCK = threading.Lock()
PREVIEW = 4096
STATIC_EXT = {".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
              ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon"}
SLOTS = {}  # slot -> {"lang", "path", "hash", "bindir"}
PORT = 8765

# --------------------------------------------------------------------------- process measurement
if IS_WIN:
    import ctypes
    from ctypes import wintypes

    class _PMC(ctypes.Structure):
        _fields_ = [("cb", wintypes.DWORD), ("PageFaultCount", wintypes.DWORD),
                    ("PeakWorkingSetSize", ctypes.c_size_t), ("WorkingSetSize", ctypes.c_size_t),
                    ("QuotaPeakPagedPoolUsage", ctypes.c_size_t), ("QuotaPagedPoolUsage", ctypes.c_size_t),
                    ("QuotaPeakNonPagedPoolUsage", ctypes.c_size_t), ("QuotaNonPagedPoolUsage", ctypes.c_size_t),
                    ("PagefileUsage", ctypes.c_size_t), ("PeakPagefileUsage", ctypes.c_size_t)]

    _k32 = ctypes.WinDLL("kernel32", use_last_error=True)
    try:
        _gpmi = _k32.K32GetProcessMemoryInfo
    except AttributeError:  # very old Windows
        _gpmi = ctypes.WinDLL("psapi").GetProcessMemoryInfo
    _gpmi.argtypes = [wintypes.HANDLE, ctypes.POINTER(_PMC), wintypes.DWORD]
    _gpmi.restype = wintypes.BOOL
    _gpt = _k32.GetProcessTimes
    _gpt.argtypes = [wintypes.HANDLE] + [ctypes.POINTER(wintypes.FILETIME)] * 4
    _gpt.restype = wintypes.BOOL

    def _win_mem(h):
        pmc = _PMC()
        pmc.cb = ctypes.sizeof(_PMC)
        if _gpmi(h, ctypes.byref(pmc), pmc.cb):
            # Peak commit charge: counts global/static arrays like most Windows judges do.
            return max(pmc.PeakPagefileUsage, pmc.PeakWorkingSetSize), pmc.PagefileUsage
        return 0, 0

    def _win_cpu_ms(h):
        c, e, k, u = (wintypes.FILETIME() for _ in range(4))
        if not _gpt(h, ctypes.byref(c), ctypes.byref(e), ctypes.byref(k), ctypes.byref(u)):
            return None
        tk = (k.dwHighDateTime << 32) | k.dwLowDateTime
        tu = (u.dwHighDateTime << 32) | u.dwLowDateTime
        return (tk + tu) / 10000.0
else:
    import resource


def _posix_preexec():
    try:
        resource.setrlimit(resource.RLIMIT_STACK, (resource.RLIM_INFINITY, resource.RLIM_INFINITY))
    except (ValueError, OSError):
        try:
            hard = resource.getrlimit(resource.RLIMIT_STACK)[1]
            resource.setrlimit(resource.RLIMIT_STACK, (hard, hard))
        except (ValueError, OSError):
            pass


def _linux_rss(pid):
    try:
        with open(f"/proc/{pid}/status") as f:
            for line in f:
                if line.startswith("VmRSS:"):
                    return int(line.split()[1]) * 1024
    except OSError:
        pass
    return 0


MEASURE_SRC = r"""
#include <sys/types.h>
#include <sys/wait.h>
#include <sys/resource.h>
#include <unistd.h>
#include <stdio.h>
int main(int argc, char** argv) {
  if (argc < 3) return 2;
  FILE* f = fopen(argv[1], "w");
  if (!f) return 2;
  pid_t pid = fork();
  if (pid < 0) return 2;
  if (pid == 0) { fclose(f); execvp(argv[2], argv + 2); _exit(127); }
  fprintf(f, "pid %d\n", (int)pid); fflush(f);
  int st = 0; struct rusage ru;
  while (wait4(pid, &st, 0, &ru) < 0) {}
  long long rss = ru.ru_maxrss;
#ifdef __APPLE__
  rss /= 1024;
#endif
  int code = WIFEXITED(st) ? WEXITSTATUS(st) : (WIFSIGNALED(st) ? -WTERMSIG(st) : -1);
  fprintf(f, "code %d\nutime %lld\nstime %lld\nmaxrss %lld\n", code,
          (long long)ru.ru_utime.tv_sec * 1000000LL + ru.ru_utime.tv_usec,
          (long long)ru.ru_stime.tv_sec * 1000000LL + ru.ru_stime.tv_usec, rss);
  fclose(f);
  return 0;
}
"""
_measure_helper = {"path": None, "tried": False}


def ensure_measure_helper():
    """Compile the measuring helper once (POSIX only). Returns its path or None."""
    if IS_WIN:
        return None
    if _measure_helper["tried"]:
        return _measure_helper["path"]
    _measure_helper["tried"] = True
    d = WORK / "build" / "_measure"
    d.mkdir(parents=True, exist_ok=True)
    exe = d / "measure"
    src = d / "measure.c"
    src.write_text(MEASURE_SRC, encoding="utf-8")
    for cc in ("cc", "gcc", "clang", "g++", "clang++"):
        path = shutil.which(cc)
        if not path:
            continue
        args = [path] + (["-x", "c"] if cc.endswith("++") else []) + ["-O2", str(src), "-o", str(exe)]
        try:
            if subprocess.run(args, capture_output=True, timeout=60).returncode == 0 and exe.exists():
                _measure_helper["path"] = str(exe)
                break
        except (OSError, subprocess.SubprocessError):
            pass
    return _measure_helper["path"]


def _measure_pid(path):
    try:
        with open(path) as f:
            line = f.readline().split()
        return int(line[1]) if len(line) == 2 and line[0] == "pid" else None
    except (OSError, ValueError):
        return None


def _measure_read(path):
    out = {}
    try:
        with open(path) as f:
            for line in f:
                k, _, v = line.strip().partition(" ")
                if k and v:
                    out[k] = int(v)
    except (OSError, ValueError):
        pass
    return out


WIN_CODES = {
    0xC00000FD: "Stack overflow", 0xC0000005: "Access violation (segfault)", 0xC0000094: "Integer division by zero",
    0xC0000409: "Stack buffer overrun / abort", 0xC0000374: "Heap corruption", 0xC000008E: "Float division by zero",
    0xC0000017: "Out of memory", 0xC0000135: "DLL not found (is the compiler's bin folder in PATH?)", 3: "abort() called",
}
SIGNALS = {6: "SIGABRT (abort / assert)", 8: "SIGFPE (division by zero)", 9: "SIGKILL", 11: "SIGSEGV (segfault)", 7: "SIGBUS"}


def explain_exit(code):
    if code is None:
        return ""
    if IS_WIN:
        u = code & 0xFFFFFFFF
        return WIN_CODES.get(u, f"exit code {code}" + (f" (0x{u:08X})" if u > 255 else ""))
    if code < 0:
        return SIGNALS.get(-code, f"signal {-code}")
    return f"exit code {code}"


def run_process(argv, cwd, stdin_path, stdout_path, stderr_path, tl_ms, ml_mb, hard_ms, env=None):
    """Run argv; returns dict(status, time_ms (CPU), wall_ms, mem_mb, exit_code, note)."""
    fin = open(stdin_path, "rb") if stdin_path else subprocess.DEVNULL
    fout = open(stdout_path, "wb")
    ferr = open(stderr_path, "wb")
    killed = None
    ml_bytes = ml_mb * 1048576 if ml_mb else 0
    try:
        kw = dict(cwd=str(cwd), stdin=fin, stdout=fout, stderr=ferr, env=env)
        measure = None
        if IS_WIN:
            kw["creationflags"] = 0x08000000  # CREATE_NO_WINDOW
        else:
            # Stack limit is raised once in main() and inherited. On Linux/macOS ru_maxrss of a child
            # started by Python includes Python's own memory (fork/vfork), so a tiny C helper starts
            # the program instead and reports its real peak memory.
            helper = ensure_measure_helper()
            if helper:
                measure = Path(cwd) / "__measure.txt"
                if measure.exists():
                    measure.unlink()
                argv = [helper, str(measure)] + list(argv)
                kw["start_new_session"] = True
        start = time.perf_counter()
        try:
            p = subprocess.Popen(argv, **kw)
        except OSError as e:
            return {"status": "RE", "time_ms": 0, "wall_ms": 0, "mem_mb": 0, "exit_code": None, "note": f"Cannot start: {e}"}

        if IS_WIN:
            h = int(p._handle)
            while True:
                try:
                    p.wait(timeout=0.004)
                    break
                except subprocess.TimeoutExpired:
                    pass
                el = (time.perf_counter() - start) * 1000
                if el > hard_ms:
                    killed = "TLE"
                elif ml_bytes:
                    _, cur = _win_mem(h)
                    if cur > ml_bytes * 1.25:
                        killed = "MLE"
                if killed:
                    p.kill()
                    p.wait()
                    break
            wall = (time.perf_counter() - start) * 1000
            cpu = _win_cpu_ms(h)
            peak, _ = _win_mem(h)
            code = p.returncode
            if cpu is None:
                cpu = wall
        elif measure is not None:
            # p is the small measuring helper; it forks the real program and reports its rusage.
            child = None
            polled = 0
            while True:
                if p.poll() is not None:
                    break
                el = (time.perf_counter() - start) * 1000
                if child is None:
                    child = _measure_pid(measure)
                if child and not IS_MAC:
                    polled = max(polled, _linux_rss(child))
                if el > hard_ms:
                    killed = "TLE"
                elif ml_bytes and polled > ml_bytes * 1.25:
                    killed = "MLE"
                if killed:
                    try:
                        os.killpg(p.pid, 9)
                    except OSError:
                        p.kill()
                    p.wait()
                    break
                time.sleep(0.002)
            wall = (time.perf_counter() - start) * 1000
            m = _measure_read(measure)
            if "code" in m:
                code = m["code"]
                cpu = (m["utime"] + m["stime"]) / 1000.0
                peak = m["maxrss"] * 1024
            else:
                code, cpu, peak = -9, wall, polled
        else:
            status = None
            ru = None
            while True:
                pid, st, r = os.wait4(p.pid, os.WNOHANG)
                if pid:
                    status, ru = st, r
                    break
                el = (time.perf_counter() - start) * 1000
                if el > hard_ms:
                    killed = "TLE"
                elif ml_bytes and not IS_MAC and _linux_rss(p.pid) > ml_bytes * 1.25:
                    killed = "MLE"
                if killed:
                    p.kill()
                    _, status, ru = os.wait4(p.pid, 0)
                    break
                time.sleep(0.002)
            wall = (time.perf_counter() - start) * 1000
            code = os.waitstatus_to_exitcode(status) if hasattr(os, "waitstatus_to_exitcode") else (
                -os.WTERMSIG(status) if os.WIFSIGNALED(status) else os.WEXITSTATUS(status))
            p.returncode = code
            cpu = (ru.ru_utime + ru.ru_stime) * 1000
            peak = ru.ru_maxrss * (1 if IS_MAC else 1024)
    finally:
        if fin is not subprocess.DEVNULL:
            fin.close()
        fout.close()
        ferr.close()

    mem_mb = peak / 1048576
    if killed == "TLE" or (tl_ms and cpu > tl_ms):
        status = "TLE"
    elif killed == "MLE" or (ml_mb and mem_mb > ml_mb):
        status = "MLE"
    elif code != 0:
        status = "RE"
    else:
        status = "OK"
    note = ""
    if status == "RE":
        note = explain_exit(code)
    elif killed == "TLE":
        note = f"killed after {hard_ms:.0f} ms wall time"
    return {"status": status, "time_ms": round(cpu, 1), "wall_ms": round(wall, 1), "mem_mb": round(mem_mb, 2),
            "exit_code": code, "note": note}


# --------------------------------------------------------------------------- helpers
def split_cmd(s):
    toks = shlex.split(s, posix=not IS_WIN)
    if IS_WIN:
        toks = [t[1:-1] if len(t) >= 2 and t[0] == t[-1] and t[0] in "\"'" else t for t in toks]
    return toks


def render(template, values, multi=()):
    """Split a command template into argv, substituting {name} placeholders.
    Placeholders listed in `multi` expand into several arguments when they stand alone."""
    out = []
    for tok in split_cmd(template):
        m = re.fullmatch(r"\{(\w+)\}", tok)
        if m and m.group(1) in multi:
            out.extend(split_cmd(str(values.get(m.group(1), ""))))
            continue
        out.append(re.sub(r"\{(\w+)\}", lambda mm: str(values.get(mm.group(1), mm.group(0))), tok))
    return [t for t in out if t != ""]


def read_preview(path, limit=PREVIEW):
    try:
        with open(path, "rb") as f:
            data = f.read(limit + 1)
    except OSError:
        return None, False
    return data[:limit].decode("utf-8", "replace"), len(data) > limit


def fresh_dir(p):
    if p.exists():
        shutil.rmtree(p, ignore_errors=True)
    p.mkdir(parents=True, exist_ok=True)
    return p


def child_env(bindirs):
    env = os.environ.copy()
    extra = [d for d in bindirs if d]
    if extra:
        env["PATH"] = os.pathsep.join(extra + [env.get("PATH", "")])
    return env


def tool_version(path):
    try:
        r = subprocess.run([path, "--version"], capture_output=True, text=True, timeout=10,
                           creationflags=0x08000000 if IS_WIN else 0)
        line = (r.stdout or r.stderr).strip().splitlines()
        return line[0] if line else ""
    except (OSError, subprocess.SubprocessError):
        return ""


def detect_tools():
    found = []
    seen = set()
    cands = ["g++", "clang++"]
    if IS_WIN:
        for base in [r"C:\msys64\ucrt64\bin", r"C:\msys64\mingw64\bin", r"C:\msys64\clang64\bin", r"C:\MinGW\bin",
                     r"C:\mingw64\bin", r"C:\TDM-GCC-64\bin", r"C:\Program Files\CodeBlocks\MinGW\bin",
                     r"C:\Program Files (x86)\CodeBlocks\MinGW\bin", r"C:\Program Files\LLVM\bin"]:
            for exe in ("g++.exe", "clang++.exe"):
                cands.append(os.path.join(base, exe))
    for c in cands:
        p = shutil.which(c) if os.sep not in c else (c if os.path.isfile(c) else None)
        if not p:
            continue
        key = os.path.normcase(os.path.realpath(p))
        if key in seen:
            continue
        seen.add(key)
        name = "clang++" if "clang" in os.path.basename(p).lower() else "g++"
        found.append({"name": name, "path": p, "version": tool_version(p), "in_path": os.sep not in c})
    py = []
    for c in (["py", "python", "python3"] if IS_WIN else ["python3", "python"]):
        p = shutil.which(c)
        if p:
            py.append(c)
    return {"compilers": found, "python": py}


# --------------------------------------------------------------------------- compile
def do_compile(req):
    slot = req["slot"]
    if not re.fullmatch(r"[a-z]+", slot):
        raise ValueError("bad slot")
    lang = req.get("lang", "cpp")
    source = req.get("source", "")
    sdir = WORK / "build" / slot
    sdir.mkdir(parents=True, exist_ok=True)
    if lang == "py":
        path = sdir / f"{slot}.py"
        path.write_text(source, encoding="utf-8")
        SLOTS[slot] = {"lang": "py", "path": str(path), "bindir": None,
                       "python": req.get("python") or ("python" if IS_WIN else "python3")}
        return {"ok": True, "cached": False, "log": "", "cmdline": "", "time_ms": 0}
    src = sdir / f"{slot}.cpp"
    exe = sdir / f"{slot}{EXE}"
    values = {"compiler": req.get("compiler") or "g++", "std": req.get("std") or "c++17", "opt": req.get("opt") or "",
              "flags": req.get("flags") or "", "src": str(src), "exe": str(exe)}
    argv = render(req.get("template") or "{compiler} -std={std} {opt} {flags} {src} -o {exe}", values, multi=("opt", "flags"))
    h = hashlib.sha256((source + "\0" + json.dumps(argv)).encode("utf-8")).hexdigest()
    old = SLOTS.get(slot)
    if old and old.get("hash") == h and exe.exists():
        return {"ok": True, "cached": True, "log": "", "cmdline": subprocess.list2cmdline(argv) if IS_WIN else shlex.join(argv), "time_ms": 0}
    src.write_text(source, encoding="utf-8")
    if exe.exists():
        try:
            exe.unlink()
        except OSError:
            pass
    comp = values["compiler"]
    comp_path = shutil.which(comp) or (comp if os.path.isfile(comp) else None)
    bindir = os.path.dirname(comp_path) if comp_path else None
    t0 = time.perf_counter()
    try:
        r = subprocess.run(argv, cwd=str(sdir), capture_output=True, timeout=120, env=child_env([bindir]),
                           creationflags=0x08000000 if IS_WIN else 0)
        log = (r.stdout + r.stderr).decode("utf-8", "replace")
        ok = r.returncode == 0 and exe.exists()
    except FileNotFoundError:
        log, ok = f"Compiler not found: {comp}\nInstall it or pick the full path to g++ / clang++ in the compile settings.", False
    except subprocess.TimeoutExpired:
        log, ok = "Compilation took longer than 120 s.", False
    dt = (time.perf_counter() - t0) * 1000
    if ok:
        SLOTS[slot] = {"lang": "cpp", "path": str(exe), "hash": h, "bindir": bindir}
    else:
        SLOTS.pop(slot, None)
    cmdline = subprocess.list2cmdline(argv) if IS_WIN else shlex.join(argv)
    return {"ok": ok, "cached": False, "log": log[-20000:], "cmdline": cmdline, "time_ms": round(dt)}


# --------------------------------------------------------------------------- run one test
def run_slot(slot, spec, rundir, input_path, tl_ms, ml_mb, hard_ms, args=None):
    """Run a compiled slot with its I/O spec. Returns (result_dict, output_path)."""
    info = SLOTS.get(slot)
    if not info:
        raise ValueError(f"'{slot}' is not compiled yet")
    io = spec.get("io") or {}
    fresh_dir(rundir)
    if info["lang"] == "py":
        argv = split_cmd(info.get("python") or "python") + [info["path"]]
    else:
        argv = [info["path"]]
    argv += args or []
    stdin_path = None
    if input_path is not None:
        if io.get("in") == "file":
            shutil.copyfile(input_path, rundir / safe_name(io.get("inName") or "input.txt"))
        else:
            stdin_path = input_path
    stdout_path = rundir / "__stdout.txt"
    stderr_path = rundir / "__stderr.txt"
    res = run_process(argv, rundir, stdin_path, stdout_path, stderr_path, tl_ms, ml_mb, hard_ms,
                      env=child_env([info.get("bindir")]))
    out_path = stdout_path
    if io.get("out") == "file":
        out_path = rundir / safe_name(io.get("outName") or "output.txt")
        if res["status"] == "OK" and not out_path.exists():
            res["status"] = "RE"
            res["note"] = f"output file {out_path.name} was not created"
    err, _ = read_preview(stderr_path, 2000)
    res["stderr"] = err or ""
    return res, out_path


def safe_name(n):
    n = os.path.basename(str(n).strip()) or "file.txt"
    if n in (".", ".."):
        n = "file.txt"
    return n


def tokens_with_lines(text):
    out = []
    for ln, line in enumerate(text.splitlines(), 1):
        for tok in line.split():
            out.append((tok, ln))
    return out


def compare(out_text, ans_text, mode, eps):
    """Returns (ok, message)."""
    if mode == "exact":
        if out_text == ans_text:
            return True, ""
        a, b = out_text, ans_text
        i = next((k for k in range(min(len(a), len(b))) if a[k] != b[k]), min(len(a), len(b)))
        line = a[:i].count("\n") + 1
        return False, f"Byte {i + 1} (line {line}) differs"
    if mode == "lines":
        la = [l.rstrip() for l in out_text.splitlines()]
        lb = [l.rstrip() for l in ans_text.splitlines()]
        while la and la[-1] == "":
            la.pop()
        while lb and lb[-1] == "":
            lb.pop()
        for k in range(max(len(la), len(lb))):
            x = la[k] if k < len(la) else "<EOF>"
            y = lb[k] if k < len(lb) else "<EOF>"
            if x != y:
                return False, f"Line {k + 1}: got '{x[:120]}', expected '{y[:120]}'"
        return True, ""
    ta, tb = tokens_with_lines(out_text), tokens_with_lines(ans_text)
    for k in range(max(len(ta), len(tb))):
        if k >= len(ta):
            return False, f"Output ended early: expected '{tb[k][0][:60]}' (token {k + 1}, line {tb[k][1]})"
        if k >= len(tb):
            return False, f"Extra output: '{ta[k][0][:60]}' (token {k + 1}, line {ta[k][1]})"
        x, y = ta[k][0], tb[k][0]
        if x == y:
            continue
        if mode == "float":
            try:
                fx, fy = float(x), float(y)
                if abs(fx - fy) <= eps or abs(fx - fy) <= eps * max(abs(fx), abs(fy)):
                    continue
            except ValueError:
                pass
        return False, f"Token {k + 1} (line {ta[k][1]}): got '{x[:60]}', expected '{y[:60]}'"
    return True, ""


def read_text(path):
    try:
        return Path(path).read_text(encoding="utf-8", errors="replace")
    except OSError:
        return ""


def do_test(req):
    tl = float(req.get("tl_ms") or 1000)
    ml = float(req.get("ml_mb") or 256)
    hard = max(tl * 3, tl + 2000)
    seed = int(req.get("seed") or 1)
    idx = int(req.get("index") or 1)
    run = WORK / "run"
    run.mkdir(parents=True, exist_ok=True)
    result = {"index": idx, "seed": seed}

    with RUN_LOCK:
        # 1. generator
        gen = req.get("gen") or {}
        input_path = run / "input.txt"
        if gen.get("use", True):
            # the generator is a normal program: no arguments unless the caller asks for some
            gargs = render(gen.get("args") or "", {"seed": seed, "i": idx, "test": idx})
            result["genArgs"] = " ".join(gargs)
            gres, gout = run_slot("gen", gen, run / "gen", None, 0, 0, float(gen.get("timeout_ms") or 30000), gargs)
            result["gen"] = gres
            if gres["status"] != "OK":
                result["verdict"] = "GEN_ERR"
                result["message"] = gres.get("note") or gres.get("stderr", "")[:500]
                return result
            shutil.copyfile(gout, input_path)
        else:
            input_path.write_text(req.get("input") or "", encoding="utf-8")
        result["inputPreview"], result["inputTrunc"] = read_preview(input_path)
        result["inputBytes"] = input_path.stat().st_size

        # 2. solution
        sol = req.get("sol") or {}
        sres, sout = run_slot("sol", sol, run / "sol", input_path, tl, ml, hard)
        result["sol"] = sres
        out_copy = run / "output.txt"
        if sout.exists():
            shutil.copyfile(sout, out_copy)
        else:
            out_copy.write_bytes(b"")
        result["outPreview"], result["outTrunc"] = read_preview(out_copy)

        # 3. brute
        brute = req.get("brute")
        ans_copy = run / "answer.txt"
        ans_copy.write_bytes(b"")
        if brute:
            bres, bout = run_slot("brute", brute, run / "brute", input_path, 0, 0, float(brute.get("timeout_ms") or 30000))
            result["brute"] = bres
            if bout.exists():
                shutil.copyfile(bout, ans_copy)
            result["ansPreview"], result["ansTrunc"] = read_preview(ans_copy)

        # 4. verdict
        verify = req.get("verify", True)
        if sres["status"] != "OK":
            result["verdict"] = sres["status"]
            result["message"] = sres.get("note") or sres.get("stderr", "")[:500]
        elif brute and result["brute"]["status"] != "OK":
            result["verdict"] = "BRUTE_ERR"
            result["message"] = (result["brute"]["status"] + ": " + (result["brute"].get("note") or result["brute"].get("stderr", "")[:300])).strip()
        elif verify and req.get("checker"):
            chk = req["checker"]
            cargs = render(chk.get("args") or "{input} {output} {answer}",
                           {"input": str(input_path), "output": str(out_copy), "answer": str(ans_copy)})
            cres, cout = run_slot("checker", {"io": {}}, run / "checker", None, 0, 0, float(chk.get("timeout_ms") or 30000), cargs)
            result["checker"] = cres
            msg, _ = read_preview(cout, 1000)
            text = ((msg or "") + "\n" + cres.get("stderr", "")).strip()
            if cres["exit_code"] == 0 and cres["status"] == "OK":
                result["verdict"] = "AC"
                result["message"] = text[:500]
            elif cres["status"] in ("TLE", "MLE") or (cres["status"] == "RE" and cres["exit_code"] is None):
                result["verdict"] = "CHK_ERR"
                result["message"] = cres.get("note") or text[:500]
            else:
                result["verdict"] = "WA"
                result["message"] = text[:500] or f"checker exit code {cres['exit_code']}"
        elif verify and brute:
            cmp = req.get("compare") or {}
            ok, msg = compare(read_text(out_copy), read_text(ans_copy), cmp.get("mode", "tokens"), float(cmp.get("eps") or 1e-6))
            result["verdict"] = "AC" if ok else "WA"
            result["message"] = msg
        else:
            result["verdict"] = "OK"
            result["message"] = ""

        # 5. save failing tests
        if result["verdict"] not in ("AC", "OK") or req.get("save"):
            tid = time.strftime("%Y%m%d-%H%M%S") + f"-{idx}"
            d = WORK / "saved" / tid
            d.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(input_path, d / "input.txt")
            shutil.copyfile(out_copy, d / "output.txt")
            if brute:
                shutil.copyfile(ans_copy, d / "answer.txt")
            (d / "info.json").write_text(json.dumps({k: v for k, v in result.items() if not k.endswith("Preview")}, indent=2), encoding="utf-8")
            result["savedId"] = tid
            result["savedDir"] = str(d)
    return result


def do_exec(req):
    """Run one compiled slot on a given input (used by the DP Check tab)."""
    slot = req.get("slot", "")
    if not re.fullmatch(r"[a-z]+", slot):
        raise ValueError("bad slot")
    tl = float(req.get("tl_ms") or 5000)
    ml = float(req.get("ml_mb") or 1024)
    run = WORK / "run"
    run.mkdir(parents=True, exist_ok=True)
    inp = run / f"exec_{slot}_input.txt"
    inp.write_text(req.get("input") or "", encoding="utf-8")
    args = req.get("args") or []
    if isinstance(args, str):
        args = split_cmd(args)
    with RUN_LOCK:
        res, out = run_slot(slot, {"io": {}}, run / f"exec_{slot}", inp, tl, ml, max(tl * 2, tl + 2000), [str(a) for a in args])
        try:
            with open(out, "rb") as f:
                data = f.read(8 * 1048576 + 1)
        except OSError:
            data = b""
    res["truncated"] = len(data) > 8 * 1048576
    res["stdout"] = data[:8 * 1048576].decode("utf-8", "replace")
    return res


# --------------------------------------------------------------------------- HTTP
class Handler(http.server.BaseHTTPRequestHandler):
    server_version = "CPCalcRunner/1.0"

    def log_message(self, fmt, *args):
        pass

    def _host_ok(self):
        host = (self.headers.get("Host") or "").lower()
        return host in (f"127.0.0.1:{PORT}", f"localhost:{PORT}")

    def _send(self, code, body, ctype="application/json; charset=utf-8", extra=None):
        if isinstance(body, (dict, list)):
            body = json.dumps(body).encode("utf-8")
        elif isinstance(body, str):
            body = body.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        for k, v in (extra or {}).items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(body)

    def _auth(self, query=None):
        tok = self.headers.get("X-Runner-Token") or ((query or {}).get("token") or [""])[0]
        return secrets.compare_digest(tok, TOKEN)

    def do_GET(self):
        if not self._host_ok():
            return self._send(403, {"error": "bad host"})
        u = urlparse(self.path)
        q = parse_qs(u.query)
        path = u.path
        if path.startswith("/api/"):
            if not self._auth(q):
                return self._send(403, {"error": "bad token"})
            if path == "/api/info":
                return self._send(200, {"ok": True, "os": platform.system(), "osRelease": platform.release(),
                                        "python": sys.version.split()[0], "root": str(ROOT), "work": str(WORK),
                                        "isWindows": IS_WIN, "tools": detect_tools()})
            m = re.fullmatch(r"/api/saved/([\w\-]+)/(input|output|answer)\.txt", path)
            if m:
                f = WORK / "saved" / m.group(1) / f"{m.group(2)}.txt"
                if not f.is_file():
                    return self._send(404, {"error": "not found"})
                return self._send(200, f.read_bytes(), "text/plain; charset=utf-8",
                                  {"Content-Disposition": f'attachment; filename="{m.group(1)}-{m.group(2)}.txt"'})
            return self._send(404, {"error": "not found"})
        # static files
        rel = "index.html" if path in ("/", "") else path.lstrip("/")
        f = (ROOT / rel).resolve()
        inside = ROOT in f.parents and WORK not in f.parents and f != WORK
        if not inside or f.suffix.lower() not in STATIC_EXT or not f.is_file():
            return self._send(404, "Not found", "text/plain; charset=utf-8")
        data = f.read_bytes()
        if f.name == "index.html":
            data = data.replace(b'<meta name="runner-token" content="">', f'<meta name="runner-token" content="{TOKEN}">'.encode())
        self._send(200, data, STATIC_EXT[f.suffix.lower()])

    def do_POST(self):
        if not self._host_ok():
            return self._send(403, {"error": "bad host"})
        if not self._auth():
            return self._send(403, {"error": "bad token"})
        try:
            n = int(self.headers.get("Content-Length") or 0)
            if n > 64 * 1048576:
                return self._send(413, {"error": "request too large"})
            req = json.loads(self.rfile.read(n) or b"{}")
        except (ValueError, json.JSONDecodeError):
            return self._send(400, {"error": "bad json"})
        path = urlparse(self.path).path
        try:
            if path == "/api/compile":
                return self._send(200, do_compile(req))
            if path == "/api/test":
                return self._send(200, do_test(req))
            if path == "/api/exec":
                return self._send(200, do_exec(req))
            if path == "/api/open":
                d = WORK / "saved" / safe_name(req.get("id", ""))
                if not d.is_dir():
                    return self._send(404, {"error": "not found"})
                if IS_WIN:
                    os.startfile(str(d))  # noqa
                else:
                    subprocess.Popen(["open" if IS_MAC else "xdg-open", str(d)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                return self._send(200, {"ok": True})
            return self._send(404, {"error": "not found"})
        except Exception as e:  # report to the page instead of crashing the server
            return self._send(500, {"error": f"{type(e).__name__}: {e}"})


def main():
    global PORT
    ap = argparse.ArgumentParser(description="CP Calc runner")
    ap.add_argument("--port", type=int, default=8765)
    ap.add_argument("--no-browser", action="store_true")
    a = ap.parse_args()
    PORT = a.port
    WORK.mkdir(exist_ok=True)
    if not IS_WIN:
        _posix_preexec()  # raise the stack limit for every program we start
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    url = f"http://127.0.0.1:{PORT}/#stress"
    print("CP Calc runner")
    print(f"  Mở / Open: {url}")
    print(f"  Thư mục làm việc / Work dir: {WORK}")
    print("  Nhấn Ctrl+C để dừng / Press Ctrl+C to stop")
    if not a.no_browser:
        threading.Timer(0.6, lambda: webbrowser.open(url)).start()
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\nĐã dừng / Stopped")


if __name__ == "__main__":
    main()
