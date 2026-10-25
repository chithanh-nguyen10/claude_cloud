#!/usr/bin/env python3
"""Assemble the Vietnamese editions from vi_parts/ and compile all four editions into pdf/.

    vi_parts/p0_vi.tex   preamble, cover, contents (Vietnamese labels)
    vi_parts/p1..8_vi.tex chapter bodies translated from the English book
    vi_parts/p9_en.tex   closing line

The contents page takes its chapter titles from the \\chapterhead lines, so it always
matches the chapter banners.
"""
import os
import re
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
P = os.path.join(ROOT, "vi_parts")


def read(name):
    return open(os.path.join(P, name), encoding="utf8").read()


def build_vi():
    body = "".join(read("p%d_vi.tex" % i) for i in range(1, 9))
    titles = dict(re.findall(r"\\chapterhead\{(\d+)\}\{(.*)\}\s*$", body, re.M))
    head = read("p0_vi.tex")

    def fix(m):
        n = m.group(1)
        return m.group(0).replace(m.group(2), titles[n])

    head = re.sub(r"\\makebox\[0\.9cm\]\[l\]\{(\d+)\}\}\{\\large (.*?)\}\\;\\dotfill", fix, head)
    teacher = head + body + read("p9_en.tex")
    student = teacher.replace("\\newif\\ifsol \\soltrue", "\\newif\\ifsol \\solfalse", 1)
    student = student.replace("(Bản giáo viên)", "(Bản học sinh)", 1)
    student = student.replace(" Bản dành cho giáo viên}", " Bản dành cho học sinh}", 1)
    out = {"Toan5_Tap1_Teacher_Vietnamese.tex": teacher, "Toan5_Tap1_Student_Vietnamese.tex": student}
    for name, text in out.items():
        open(os.path.join(ROOT, name), "w", encoding="utf8").write(text)
    return list(out)


def compile_all(names):
    build = os.path.join(ROOT, "_build")
    os.makedirs(build, exist_ok=True)
    os.makedirs(os.path.join(ROOT, "pdf"), exist_ok=True)
    ok = True
    for name in names:
        shutil.copy(os.path.join(ROOT, name), build)
        base = name[:-4]
        for _ in range(2):
            r = subprocess.run(["pdflatex", "-interaction=nonstopmode", "-halt-on-error", name],
                               cwd=build, capture_output=True, text=True, errors="ignore")
        log = open(os.path.join(build, base + ".log"), encoding="utf8", errors="ignore").read()
        m = re.search(r"Output written on .*\((\d+) pages", log)
        if r.returncode or not m:
            ok = False
            i = log.find("\n!")
            print("FAILED %s\n%s" % (name, log[i:i + 1200]))
            continue
        shutil.copy(os.path.join(build, base + ".pdf"), os.path.join(ROOT, "pdf"))
        print("  %-40s %s pages" % (base, m.group(1)))
    return ok


if __name__ == "__main__":
    names = build_vi()
    if "--no-pdf" not in sys.argv:
        names += ["Toan5_Tap1_Teacher_English.tex", "Toan5_Tap1_Student_English.tex"]
        sys.exit(0 if compile_all(names) else 1)
