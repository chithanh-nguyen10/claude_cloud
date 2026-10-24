#!/usr/bin/env python3
r"""
Build both editions of the ThinkAlgo "Speed — Chapters 8 & 9" supplement
from the single source speed-ch8-ch9.tex.

  Teacher edition : full step-by-step solutions          (\solutiontrue, default)
  Student edition : solutions hidden, blank working space (\def\STUDENT{})

Each edition is compiled twice (so the running head / counters settle),
then the two PDFs are copied into ./out.  The build fails loudly if either
edition does not finish with "0 errors".
"""
import os
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = "speed-ch8-ch9.tex"
OUT = os.path.join(ROOT, "out")

EDITIONS = [
    # (jobname,                       pdflatex argument)
    ("speed-ch8-ch9-teacher", SRC),
    ("speed-ch8-ch9-student", r"\def\STUDENT{}\input{%s}" % SRC),
]


def run(jobname, arg):
    cmd = [
        "pdflatex",
        "-interaction=nonstopmode",
        "-halt-on-error",
        "-jobname", jobname,
        arg,
    ]
    # two passes
    for _ in range(2):
        res = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)
        if res.returncode != 0:
            sys.stderr.write(res.stdout[-3000:])
            raise SystemExit("ERROR: %s failed to compile" % jobname)
    # report page count + warnings
    log = os.path.join(ROOT, jobname + ".log")
    pages = "?"
    with open(log, encoding="utf8", errors="ignore") as fh:
        text = fh.read()
    for line in text.splitlines():
        if "Output written on" in line and ".pdf" in line:
            # e.g. "Output written on speed-...pdf (18 pages, ...)."
            import re
            m = re.search(r"\((\d+) pages", line)
            if m:
                pages = m.group(1)
    bad = sum(1 for ln in text.splitlines()
              if ln.startswith("Overfull") or ln.startswith("Underfull"))
    print(f"  {jobname}: {pages} pages, {bad} over/underfull boxes")
    return pages


def main():
    os.makedirs(OUT, exist_ok=True)
    print("Building editions:")
    page_counts = {}
    for jobname, arg in EDITIONS:
        page_counts[jobname] = run(jobname, arg)
        shutil.copy(os.path.join(ROOT, jobname + ".pdf"),
                    os.path.join(OUT, jobname + ".pdf"))
    print("\nPDFs copied to ./out :")
    for jobname in page_counts:
        print(f"  out/{jobname}.pdf  ({page_counts[jobname]} pages)")
    print("\nBoth editions compiled with 0 errors.")


if __name__ == "__main__":
    main()
