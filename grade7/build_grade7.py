#!/usr/bin/env python3
r"""
Build the ThinkAlgo Grade 7 book: all chapters in ONE volume, four editions.

Sources
  preamble.tex            shared look (taken from the ThinkAlgo reference worksheet)
  labels_vi.tex/en.tex    language-dependent words (Bài/Problem, Lời giải/Solution, ...)
  body/<n>_<lang>_<part>.tex
                          content of chapter n, parts a-d (a: theory, examples, first problems;
                          b, c, d: the rest of the 50 problems)

Outputs (standalone, each compiles on its own with pdflatex)
  tex/ThinkAlgo_Toan7_HS_VI.tex        student book, Vietnamese
  tex/ThinkAlgo_Toan7_GV_VI.tex        teacher book (with solutions), Vietnamese
  tex/ThinkAlgo_Math7_Student_EN.tex   student book, English
  tex/ThinkAlgo_Math7_Teacher_EN.tex   teacher book (with solutions), English
  pdf/  the compiled PDFs (with --pdf)

  python3 build_grade7.py            # assemble the four book .tex files only
  python3 build_grade7.py --pdf      # assemble and compile the four books (two pdflatex passes)
  python3 build_grade7.py --pdf 2    # test build: chapter 2 alone, four editions
  G7_TEXDIR=/some/dir python3 ...    # build in a private folder (PDFs stay there)
"""
import os
import shutil
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.abspath(__file__))

CHAPTERS = {
    1: {"vi": "Đại số và Phương trình", "en": "Algebra and Equations"},
    2: {"vi": "Hình học và Đo lường", "en": "Geometry and Measurement"},
    3: {"vi": "Đếm và Xác suất", "en": "Counting and Probability"},
    4: {"vi": "Số học và Tư duy số", "en": "Number Sense"},
    5: {"vi": "Chủ đề khác: Tư duy logic và Câu đố", "en": "Others: Logic and Puzzles"},
}
BOOK = {
    "vi": {"slug": "ThinkAlgo_Toan7", "title": "Toán Tư duy Lớp 7",
           "sub": "Lý thuyết -- Ví dụ mẫu -- 250 bài tập luyện tập và nâng cao",
           "toc": "Mục lục",
           "ed": {False: "Sách học sinh", True: "Sách giáo viên -- có lời giải chi tiết"},
           "how": [r"Mỗi chương gồm: \textbf{cơ sở lý thuyết} (có giải thích, chứng minh), "
                   r"\textbf{ví dụ mẫu} có hướng dẫn giải, và \textbf{50 bài tập}: "
                   r"phần \emph{Luyện tập cơ bản} và phần \emph{Mở rộng -- Nâng cao}.",
                   r"Bài có dấu \stars{1} là bài khó, \stars{2} là bài rất khó.",
                   r"Hãy tự làm bài trước, sau đó mới đối chiếu với lời giải."]},
    "en": {"slug": "ThinkAlgo_Math7", "title": "Thinking Mathematics Grade 7",
           "sub": "Theory -- Worked examples -- 250 practice and challenge problems",
           "toc": "Contents",
           "ed": {False: "Student book", True: "Teacher book -- with detailed solutions"},
           "how": [r"Each chapter contains: \textbf{theory} (with explanations and proofs), "
                   r"\textbf{worked examples} with guided solutions, and \textbf{50 problems}: "
                   r"\emph{Core practice} followed by \emph{Extension and challenge}.",
                   r"Problems marked \stars{1} are hard, \stars{2} very hard.",
                   r"Try each problem on your own first, then compare with the solution."]},
}
EDITIONS = {"vi": (("HS", False), ("GV", True)),
            "en": (("Student", False), ("Teacher", True))}
PARTS = "abcd"


def read(path):
    with open(os.path.join(ROOT, path), encoding="utf8") as fh:
        return fh.read()


def chapter(n, lang):
    title = CHAPTERS[n][lang]
    out = [r"%% ================= CHAPTER %d: %s =================" % (n, title),
           r"\clearpage",
           # each chapter starts from the same table spacing (some chapters change it locally)
           r"\renewcommand{\arraystretch}{1.35}",
           r"\chapterhead{%d}{%s}" % (n, title), ""]
    for p in PARTS:
        f = "body/%d_%s_%s.tex" % (n, lang, p)
        if os.path.exists(os.path.join(ROOT, f)):
            out.append("%% ---------------- part %s ----------------\n%s" % (p, read(f)))
        else:
            out.append("%% (part %s not written yet)\n" % p)
    return "\n".join(out)


def cover(lang, teacher, chapters):
    b = BOOK[lang]
    rows = "\n".join(r"\tocline{%d}{%s}" % (n, CHAPTERS[n][lang]) for n in chapters)
    how = "\n".join(r"\item %s" % h for h in b["how"])
    return r"""
%% ---------------- cover + contents ----------------
\renewcommand{\CurTopic}{%(title)s}
\thispagestyle{empty}
\begin{tikzpicture}[remember picture,overlay]
  \fill[tmBlue] (current page.north west) rectangle ([yshift=-9.5cm]current page.north east);
  \fill[tmBlue!80!black] ([yshift=-9.5cm]current page.north west) rectangle ([yshift=-9.9cm]current page.north east);
  \fill[KidOrange] ([yshift=-9.9cm]current page.north west) rectangle ([yshift=-10.1cm]current page.north east);
  \node[anchor=north west,text=white,font=\fontsize{34}{40}\selectfont\bfseries,text width=16cm]
     at ([xshift=2cm,yshift=-2.6cm]current page.north west) {%(title)s};
  \node[anchor=north west,text=white,font=\large,text width=16cm]
     at ([xshift=2cm,yshift=-6.2cm]current page.north west) {%(sub)s};
  \node[anchor=north west,fill=white,text=tmBlue,font=\bfseries,rounded corners=6pt,inner xsep=10pt,inner ysep=6pt]
     at ([xshift=2cm,yshift=-7.6cm]current page.north west) {%(ed)s};
  \node[anchor=south,text=Slate,font=\small] at ([yshift=1.6cm]current page.south)
     {ThinkAlgo --- From Math Thinking to Code \quad\textbullet\quad thinkalgo.com};
\end{tikzpicture}\par
\vspace*{7.0cm}
{\Large\bfseries\color{Navy}%(toc)s}\par\vspace{2pt}
{\color{tmBlue}\rule{\linewidth}{1.5pt}}\par\vspace{0.4cm}
%(rows)s
\vspace{0.4cm}
\begin{tipbox}
\begin{itemize}[leftmargin=1.2em,itemsep=2pt,topsep=2pt]
%(how)s
\end{itemize}
\end{tipbox}
""" % dict(title=b["title"], sub=b["sub"], ed=b["ed"][teacher], toc=b["toc"], rows=rows, how=how)


TOCLINE = r"""
% table-of-contents line: \tocline{n}{title} -> badge, title, dotted leader, page (via \label{chap:n})
\newcommand{\tocline}[2]{\par\noindent
  \begin{tikzpicture}[baseline=-0.6ex]\node[circle,fill=tmBlue,text=white,font=\bfseries,
    minimum size=0.75cm,inner sep=0pt]{#1};\end{tikzpicture}\hspace{0.6em}%
  {\large\bfseries\color{Ink}\hyperref[chap:#1]{#2}}\ \dotfill\ {\large\bfseries\color{tmBlue}\pageref{chap:#1}}\par\vspace{0.3cm}}
"""


def assemble(lang, teacher, chapters, book=True):
    pre = read("preamble.tex").split("\n", 1)
    head = [
        "%% ThinkAlgo — %s — %s" % (BOOK[lang]["title"], BOOK[lang]["ed"][teacher]),
        "%% Generated by build_grade7.py — edit grade7/body/ and rebuild.",
        pre[0],
        r"\newif\ifsol \sol%s" % ("true" if teacher else "false"),
        pre[1],
        TOCLINE,
        read("labels_%s.tex" % lang),
        r"\def\DocTopic{%s}" % BOOK[lang]["title"],
        r"\begin{document}",
        cover(lang, teacher, chapters) if book else r"\titlehead",
    ]
    body = [chapter(n, lang) for n in chapters]
    return "\n".join(head + body + [r"\end{document}", ""])


def compile_pdf(texdir, name):
    cmd = ["pdflatex", "-interaction=nonstopmode", "-halt-on-error", name + ".tex"]
    for _ in range(2):
        res = subprocess.run(cmd, cwd=texdir, capture_output=True, text=True,
                             encoding="utf8", errors="replace")
        if res.returncode != 0:
            sys.stderr.write(res.stdout[-4000:])
            raise SystemExit("ERROR: %s failed to compile" % name)
    log = open(os.path.join(texdir, name + ".log"), encoding="utf8", errors="replace").read()
    pages = [l for l in log.splitlines() if l.startswith("Output written")]
    over = log.count("Overfull \\hbox")
    return "  %-40s %s  (overfull hbox: %d)" % (
        name, pages[-1].split("(")[-1].rstrip(").") if pages else "?", over)


def main():
    args = sys.argv[1:]
    want_pdf = "--pdf" in args
    only = [int(a) for a in args if a.isdigit()]
    book = not only
    chapters = only or sorted(CHAPTERS)
    texdir = os.environ.get("G7_TEXDIR") or os.path.join(ROOT, "tex")
    pdfdir = texdir if os.environ.get("G7_TEXDIR") else os.path.join(ROOT, "pdf")
    os.makedirs(texdir, exist_ok=True)
    if os.path.exists(os.path.join(ROOT, "logo.png")):
        shutil.copy(os.path.join(ROOT, "logo.png"), texdir)
    jobs = []
    for lang in ("vi", "en"):
        for tag, teacher in EDITIONS[lang]:
            if book:
                name = "%s_%s_%s" % (BOOK[lang]["slug"], tag, lang.upper())
            else:
                name = "chapter%s_%s_%s" % ("-".join(map(str, chapters)), tag, lang.upper())
            with open(os.path.join(texdir, name + ".tex"), "w", encoding="utf8") as fh:
                fh.write(assemble(lang, teacher, chapters, book))
            jobs.append(name)
            if not want_pdf:
                print("  wrote %s.tex" % name)
    if not want_pdf:
        return
    with ThreadPoolExecutor(max_workers=4) as ex:
        for line in ex.map(lambda nm: compile_pdf(texdir, nm), jobs):
            print(line)
    for name in jobs:
        if pdfdir != texdir:
            os.makedirs(pdfdir, exist_ok=True)
            shutil.copy(os.path.join(texdir, name + ".pdf"), pdfdir)
        for ext in ("aux", "log", "out", "toc") + (("pdf",) if pdfdir != texdir else ()):
            f = os.path.join(texdir, name + "." + ext)
            if os.path.exists(f):
                os.remove(f)


if __name__ == "__main__":
    main()
