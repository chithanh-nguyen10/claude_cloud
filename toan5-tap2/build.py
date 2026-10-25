#!/usr/bin/env python3
r"""
Assemble and compile the four editions of "Toán 5 nâng cao — Quyển 2":

    Toan5_Tap2_Teacher_Vietnamese.tex   Vietnamese, teacher  (\soltrue  : full solutions)
    Toan5_Tap2_Student_Vietnamese.tex   Vietnamese, student  (\solfalse : blank "Bài làm" boxes)
    Toan5_Tap2_Teacher_English.tex      English,    teacher
    Toan5_Tap2_Student_English.tex      English,    student

Sources:
    preamble.tex            shared layout (same as Book 1), with %%SOLFLAG%%, %%LANG%%, %%EDITION%%, %%LANGBLOCK%%
    chapters/<id>_vi.tex    chapter body in Vietnamese  (no banner: build.py adds it)
    chapters/<id>_en.tex    chapter body in English

Each generated .tex is standalone (preamble + content inlined), like the G3 file.

Usage:
    python3 build.py                 # write the 4 .tex files and compile them into pdf/
    python3 build.py --no-pdf        # only write the 4 .tex files
    python3 build.py --only 05 12    # quick check: compile just these parts (all 4 variants) into _check/
"""
import os
import re
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
CH = os.path.join(ROOT, "chapters")

# (id, kind, Vietnamese title, English title)   kind: chap = numbered chapter, rev = review/test
PARTS = [
    ("01", "chap", "Các phép tính với tỉ số phần trăm", "Working with Percentages"),
    ("02", "chap", "Bài toán về tỉ số phần trăm", "Percentage Word Problems"),
    ("03", "chap", "Hình hộp chữ nhật, hình lập phương", "Cuboids and Cubes"),
    ("04", "chap", "Thể tích", "Volume"),
    ("05", "chap", "Xếp hình, sơn bề mặt", "Cube Stacks and Painted Faces"),
    ("06", "chap", "Chuyển động đều", "Uniform Motion"),
    ("07", "chap", "Gặp nhau và đuổi kịp", "Meeting and Catching Up"),
    ("08", "chap", "Tỉ số vận tốc. Vận tốc trung bình", "Speed Ratios and Average Speed"),
    ("09", "chap", "Dòng nước. Vật có chiều dài", "River Currents and Long Objects"),
    ("10", "chap", "Chuyển động vòng tròn", "Motion around a Circular Track"),
    ("11", "chap", "Thống kê, xác suất", "Statistics and Probability"),
    ("12", "chap", "Sơ đồ Venn, tính ngược", "Venn Diagrams, Working Back"),
    ("13", "chap", "Giả thiết tạm", "The Supposition Method"),
    ("rev1", "rev", "Ôn tập tổng hợp -- Đề 1", "Mixed Review -- Paper 1"),
    ("rev2", "rev", "Ôn tập tổng hợp -- Đề 2", "Mixed Review -- Paper 2"),
    ("test1", "rev", "Kiểm tra cuối Quyển 2", "End-of-Book 2 Test"),
]

LANG = {
    "vi": dict(
        block=r"""\def\DocGrade{Lớp 5}
\def\ProbWord{Bài}
\def\SolWord{Lời giải.}
\def\GuideWord{Hướng dẫn giải.}
\def\PageWord{Trang}
\def\NameWord{Họ và tên}
\def\DateWord{Ngày}
\def\SolTitle{Lời giải}
\def\WorkWord{Bài làm:}
\def\TopicWord{Chuyên đề}
\def\AnsWord{Đáp số}
\def\ExWord{Ví dụ}
\def\TagTopic{}
\def\DocFooter{}
\def\DocTopic{}""",
        cover=("TOÁN 5", "NÂNG CAO", "QUYỂN 2", "Dành cho học sinh lớp 5"),
        edition={True: "Bản dành cho giáo viên", False: "Bản dành cho học sinh"},
        contents="Mục lục", review="Ôn tập \\& Kiểm tra",
        tagline="Từ tư duy toán học đến lập trình",
    ),
    "en": dict(
        block=r"""\def\DocGrade{Grade 5}
\def\ProbWord{Problem}
\def\SolWord{Solution.}
\def\GuideWord{Guided solution.}
\def\PageWord{Page}
\def\NameWord{Name}
\def\DateWord{Date}
\def\SolTitle{Solution}
\def\WorkWord{Your work:}
\def\TopicWord{Topic}
\def\AnsWord{Answer}
\def\ExWord{Example}
\def\TagTopic{}
\def\DocFooter{}
\def\DocTopic{}""",
        cover=("GRADE 5 MATHS", "ADVANCED", "BOOK 2", "For Grade 5 students"),
        edition={True: "Teacher's edition", False: "Student's edition"},
        contents="Contents", review="Review \\& Test",
        tagline="From Math Thinking to Code",
    ),
}

EDITIONS = [
    ("Toan5_Tap2_Teacher_Vietnamese", "vi", True),
    ("Toan5_Tap2_Student_Vietnamese", "vi", False),
    ("Toan5_Tap2_Teacher_English", "en", True),
    ("Toan5_Tap2_Student_English", "en", False),
]


def title(part, lang):
    return part[2] if lang == "vi" else part[3]


def cover(lang, sol):
    L = LANG[lang]
    big, adv, book, who = L["cover"]
    return (r"\thispagestyle{empty}\begingroup\centering\vspace*{2.2cm}\logocover\par\vspace{1.4cm}"
            r"{\fontsize{44}{48}\selectfont\bfseries\color{Navy} %s}\par\vspace{0.35cm}"
            r"{\Huge\bfseries\color{tmOrange} %s}\par\vspace{0.55cm}"
            r"\textcolor{tmBlue}{\rule{7cm}{2pt}}\par\vspace{2pt}\textcolor{tmOrange}{\rule{7cm}{1pt}}\par\vspace{0.6cm}"
            r"{\LARGE\bfseries\color{Navy} %s}\par\vspace{0.5cm}{\large\bfseries\color{tmOrange} %s}\par\vspace{1.9cm}"
            r"{\large\color{Ink} %s}\par\vfill"
            r"{\large\bfseries\color{Navy}ThinkAlgo}\;{\color{Ink}--- %s}\par\vspace{3pt}"
            r"{\color{tmBlue}\faGlobe}\ \textcolor{Ink}{thinkalgo.com}\par\vspace{0.8cm}\endgroup"
            r"\begin{tikzpicture}[remember picture,overlay]\draw[tmBlue,line width=1.4pt,rounded corners=13pt] "
            r"([xshift=1.0cm,yshift=1.0cm]current page.south west) rectangle ([xshift=-1.0cm,yshift=-1.0cm]current page.north east);"
            r"\draw[tmOrange,line width=0.6pt,rounded corners=11pt] ([xshift=1.2cm,yshift=1.2cm]current page.south west) "
            r"rectangle ([xshift=-1.2cm,yshift=-1.2cm]current page.north east);\end{tikzpicture}\clearpage"
            % (big, adv, book, L["edition"][sol], who, L["tagline"]))


def toc(parts, lang):
    L = LANG[lang]
    out = [r"\thispagestyle{empty}\par\vspace*{0.4cm}\noindent{\Huge\bfseries\color{Navy} %s}\par\vspace{2pt}"
           r"\noindent\textcolor{tmBlue}{\rule{\linewidth}{1.5pt}}\par\vspace{0.7cm}" % L["contents"]]
    n = 0
    first_rev = True
    for p in parts:
        if p[1] == "chap":
            n += 1
            out.append(r"\noindent{\large\color{tmBlue}\bfseries\makebox[0.9cm][l]{%d}}{\large %s}\;\dotfill\;"
                       r"{\large\bfseries\pageref{chap:%d}}\par\vspace{5.5pt}" % (n, title(p, lang), n))
        else:
            if first_rev:
                out.append(r"\vspace{0.4cm}\noindent{\large\bfseries\color{tmOrange} %s}\par\vspace{5pt}"
                           r"\noindent\textcolor{tmOrange}{\rule{\linewidth}{1.2pt}}\par\vspace{0.4cm}" % L["review"])
                first_rev = False
            out.append(r"\noindent\makebox[0.9cm][l]{}{\large %s}\;\dotfill\;{\large\bfseries\pageref{toc:%s}}"
                       r"\par\vspace{5.5pt}" % (title(p, lang), p[0]))
    out.append(r"\clearpage")
    return "\n".join(out)


def banner(part, lang, n):
    t = title(part, lang)
    if part[1] == "chap":
        return (r"\titlehead" "\n" r"\begingroup\setbox0=\vbox{\section*{%s}}\endgroup" "\n"
                r"\chapterhead{%d}{%s}" % (t, n, t))
    icon = r"\faClipboardCheck" if part[0].startswith("test") else r"\faPen"
    return (r"\begingroup\setbox0=\vbox{\section*{%s}}\endgroup\renewcommand{\CurTopic}{%s}\setcounter{seccnt}{0}"
            r"\phantomsection\pdfbookmark[0]{%s}{%s}\label{toc:%s}\par\vspace{0.1cm}\noindent"
            r"\begin{tikzpicture}[baseline=-0.5ex]\node[circle,fill=tmOrange,text=white,font=\large\bfseries,"
            r"minimum size=0.95cm,inner sep=0pt](cn){%s};\node[anchor=west,font=\LARGE\bfseries,text=tmOrange] "
            r"at ([xshift=12pt]cn.east){%s};\end{tikzpicture}\par\vspace{4pt}\noindent"
            r"\textcolor{tmOrange}{\rule{\linewidth}{2pt}}\par\vspace{0.5cm}"
            % (t, t, t, part[0], part[0], icon, t))


def assemble(lang, sol, parts):
    pre = open(os.path.join(ROOT, "preamble.tex"), encoding="utf8").read()
    pre = pre.replace("%%SOLFLAG%%", r"\soltrue" if sol else r"\solfalse")
    pre = pre.replace("%%LANGBLOCK%%", LANG[lang]["block"]).replace("%%LANG%%", lang)
    pre = pre.replace("%%EDITION%%", "Teacher's edition" if sol else "Student's edition")
    body = [pre.rstrip(), "", r"\begin{document}", cover(lang, sol), toc(parts, lang)]
    n = 0
    for i, p in enumerate(parts):
        if p[1] == "chap":
            n += 1
        src = os.path.join(CH, "%s_%s.tex" % (p[0], lang))
        if not os.path.exists(src):
            continue
        if i:
            body.append(r"\clearpage")
        body.append(banner(p, lang, n))
        body.append(open(src, encoding="utf8").read().strip())
    body.append(r"\end{document}")
    return "\n".join(body) + "\n"


def compile_tex(path, workdir):
    name = os.path.splitext(os.path.basename(path))[0]
    cmd = ["pdflatex", "-interaction=nonstopmode", "-halt-on-error", os.path.basename(path)]
    for _ in range(2):
        r = subprocess.run(cmd, cwd=workdir, capture_output=True, text=True, errors="ignore")
        if r.returncode != 0:
            log = r.stdout
            i = log.find("\n!")
            sys.stderr.write("---- %s failed ----\n%s\n" % (name, log[i:i + 1500] if i >= 0 else log[-2500:]))
            return None
    log = open(os.path.join(workdir, name + ".log"), encoding="utf8", errors="ignore").read()
    m = re.search(r"Output written on .*\((\d+) pages", log)
    over = len(re.findall(r"^Overfull \\hbox \((\d+\.\d+)pt", log, re.M))
    big = [float(x) for x in re.findall(r"^Overfull \\hbox \((\d+\.\d+)pt", log, re.M) if float(x) > 3]
    print("  %-34s %s pages, %d overfull hbox (%d > 3pt)" % (name, m.group(1) if m else "?", over, len(big)))
    return os.path.join(workdir, name + ".pdf")


def main(argv):
    only = None
    if "--only" in argv:
        only = argv[argv.index("--only") + 1:]
    parts = [p for p in PARTS if only is None or p[0] in only]
    if only is not None:
        out = os.path.join(ROOT, "_check")
    else:
        out = ROOT
    os.makedirs(out, exist_ok=True)
    if os.path.exists(os.path.join(ROOT, "logo.png")) and out != ROOT:
        shutil.copy(os.path.join(ROOT, "logo.png"), out)
    files = []
    for name, lang, sol in EDITIONS:
        if only is not None:
            name = "check_%s_%s_%s" % ("-".join(only), lang, "T" if sol else "S")
        path = os.path.join(out, name + ".tex")
        with open(path, "w", encoding="utf8") as fh:
            fh.write(assemble(lang, sol, parts))
        files.append(path)
    print("Wrote:", *[os.path.relpath(f, ROOT) for f in files], sep="\n  ")
    if "--no-pdf" in argv:
        return
    print("Compiling:")
    build = os.path.join(ROOT, "_build") if only is None else out
    os.makedirs(build, exist_ok=True)
    ok = True
    for f in files:
        if build != out:
            shutil.copy(f, build)
            if os.path.exists(os.path.join(ROOT, "logo.png")):
                shutil.copy(os.path.join(ROOT, "logo.png"), build)
        pdf = compile_tex(os.path.join(build, os.path.basename(f)), build)
        if pdf is None:
            ok = False
        elif only is None:
            os.makedirs(os.path.join(ROOT, "pdf"), exist_ok=True)
            shutil.copy(pdf, os.path.join(ROOT, "pdf", os.path.basename(pdf)))
    if not ok:
        raise SystemExit("ERROR: some editions failed to compile")


if __name__ == "__main__":
    main(sys.argv[1:])
