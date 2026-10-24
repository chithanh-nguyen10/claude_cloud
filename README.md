# Speed — Chapters 8 & 9 (Supplement)

A polished, self-contained LaTeX worksheet booklet for the **ThinkAlgo _Speed_**
course (upper-primary, Grades 4–6, English). It fills in the two missing chapters
of the main course:

- **Chapter 8 — Fractions of a journey (the units method).** Draw a journey as a
  row of equal units, find one unit, then scale up to the whole. Theory, 2 worked
  examples and **20 practice problems**, each with its own bar-model figure.
- **Chapter 9 — Journeys with a change of speed.** There-and-back trips, partial
  legs, differences in average speed, and speed changes mid-journey. Theory, 2
  worked examples and **20 practice problems**, each with a timeline / bar figure.

## One source, two editions

Everything lives in a single source file, `speed-ch8-ch9.tex`, which produces two
editions via the `\ifsolution` boolean:

| Edition | Flag | Contents |
|---------|------|----------|
| **Teacher** | `\solutiontrue` (default) | full step-by-step solutions |
| **Student** | `\def\STUDENT{}` | solutions hidden, blank working space |

In both editions the worked examples keep their solutions (they teach the method)
and every practice problem keeps its figure.

## Design

Elegant, editorial look (navy + amber), sans-serif body (Source Sans Pro):

- Light, thin-bordered boxes with small-caps labels and a small amber tick breaking
  the top border — **Key idea — …** and **Example N**.
- Solutions are not boxed: a thin amber left rule, a small-caps _Solution_ label,
  then steps each opened by a bold navy mini-label.
- Answers sit in a subtle light-navy strip with a thin navy left border.
- Flat TikZ figures only (no 3D / shadows / gradients): bar models drawn as
  separate rounded units with a tiny gap, navy borders and light fill (the known
  part shaded darker), labelled with amber double-headed arrows and navy labels.
- Clock times are written with a dot (e.g. `15.21`).

## Build

Requires a TeX Live toolchain (`pdflatex`). Install on Debian/Ubuntu:

```bash
sudo apt-get install -y --no-install-recommends \
  texlive-latex-recommended texlive-latex-extra texlive-pictures \
  texlive-fonts-recommended texlive-fonts-extra texlive-lang-other latexmk
```

Then build **both** PDFs into `out/`:

```bash
python3 build.py
```

Or compile a single edition by hand:

```bash
# Teacher
pdflatex -jobname speed-ch8-ch9-teacher speed-ch8-ch9.tex
# Student
pdflatex -jobname speed-ch8-ch9-student "\def\STUDENT{}\input{speed-ch8-ch9.tex}"
```

## Answer checking

Every numeric answer in the booklet is verified independently with exact rational
arithmetic:

```bash
python3 verify-answers.py
```

(The three lines it marks with `XX` are checker artifacts, not math errors: one is a
signed difference that the booklet states as an absolute value, and three are values
of exactly `x.25` that round **half-up** to `x.3`, as shown in the solutions.)

## Files

```
speed-ch8-ch9.tex        single LaTeX source (both editions)
build.py                 builds both editions into out/
verify-answers.py        independent Python check of all answers
out/speed-ch8-ch9-teacher.pdf   teacher edition (full solutions)
out/speed-ch8-ch9-student.pdf   student edition (blank working space)
```
