# Writing guide — ThinkAlgo Grade 7 worksheets

Four topics, each built from one CEMC (Gauss Grade 7/8) worksheet of 30 problems.
Each topic becomes 4 standalone `.tex` files (HS/GV × VI/EN) assembled by
`build_grade7.py` from body parts that you write:

| file | content |
|------|---------|
| `body/<n>_<lang>_a.tex` | big-idea box, theory sections, worked examples, divider "Luyện tập cơ bản", **problems 1–15** |
| `body/<n>_<lang>_b.tex` | **problems 16–30** |
| `body/<n>_<lang>_c.tex` | divider "Mở rộng – Nâng cao", **problems 31–40** |
| `body/<n>_<lang>_d.tex` | **problems 41–50** |

`<lang>` is `vi` or `en`. The build script already writes the preamble, the
`\begin{document}` and the chapter banner `\chapterhead{n}{Title}`. Body files
contain **only content** — never `\documentclass`, `\usepackage`,
`\begin{document}`, `\chapterhead`, or new `\newcommand`s that clash with
`preamble.tex` (read it: all macros you may use are defined there). If you
truly need a helper macro for figures, define it in your own part with a
topic-specific prefix (e.g. `\gmTri`) and guard it: `\providecommand`.

Audience: **Vietnamese Grade 7 students** (and their parents). The original
worksheet is only a source of ideas: **rewrite everything** in clear, warm,
textbook-style ("văn phong sách giáo khoa") language. Never copy the CEMC wording.

## Rules

1. **Problems 1–30** = the 30 original problems, same order, re-written
   (re-phrase; you may change names to Vietnamese names and money to
   "đồng"/"nghìn đồng", scaling numbers sensibly, and re-solve accordingly).
   Keep multiple-choice options (A)–(E) where the original has them, with
   `\choices{..}{..}{..}{..}{..}` (short), `\choicesII` (medium), `\choicesL`
   (long, one per line). Re-check that exactly one option is correct after any
   change of numbers.
2. **Problems 31–50** = new problems written by you: 31–40 consolidate and extend
   the ideas of problems 1–15; 41–50 are advanced ("nâng cao") extensions of the
   ideas of problems 16–30 (olympiad-flavoured but solvable by a strong Grade 7
   student). They may be multiple-choice or open-ended (open-ended preferred for
   41–50). Mark difficulty in the second argument of `probbox`:
   `{\relax}` normal, `{\stars{1}}` hard, `{\stars{2}}` very hard.
3. **Both languages must be the same worksheet**: same problems, same numbers,
   same figures, same answers; the English file is a faithful, natural
   translation of the Vietnamese one (EN names stay Vietnamese, money stays in
   dong: "22 500 dong").
4. Number format — VI: decimal comma `$1{,}5$`, thousands `$22\,500$`;
   EN: decimal point `$1.5$`, thousands `$22\,500$`. Division may be written
   `:` (Vietnamese habit) in VI and `\div` in EN. Clock times `6\,h\,30` / `6:30 a.m.`.
5. Every figure from the original must be re-drawn in **TikZ** (`figC`
   environment, flat style, palette colours `tmBlue`, `tmOrange`, `tmGreen`,
   `tmPurple`, `tmTeal`, `Navy`, `Ink`). Add figures to solutions whenever a
   picture helps (bar models, tables, number lines, tree diagrams, grids).
6. Solutions (`\probsol{...}`) must be **very detailed, step by step, never
   skipping**:
   - start with what is given / what is asked (Phân tích đề),
   - `\step{1}{...}`, `\step{2}{...}` … each step explained in words, every
     calculation written out,
   - `\begin{recallbox}...\end{recallbox}` whenever a fact/formula is used
     (e.g. "tổng ba góc trong tam giác bằng $180^\circ$"),
   - `\begin{proofbox}...\end{proofbox}` when a claim needs justification,
   - `\begin{warnbox}...\end{warnbox}` for typical traps,
   - `\verify{...}` a check of the answer where possible,
   - for multiple choice: also explain why the answer matches option (X),
   - end with `\ans{...}`.
   A parent who is not a teacher must be able to read it and teach the child.
   Use `\begin{parentbox}...\end{parentbox}` occasionally (in theory/examples
   and some harder problems) with a tip on how to explain at home.
   Typical length: 10–25 lines for easy problems, up to a full page for hard ones.
7. Theory (part a): a `knowbox` "Ý tưởng lớn" first, then 5–8 `\shead{...}`
   sections, each with a `knowbox` of definitions/rules/formulas **with short
   proofs or explanations** (why it is true), small inline examples, a
   `tipbox` or `warnbox` when useful. Then 6–8 worked examples (`exbox` with
   `\guide` and a full solution + `\ans`) covering the main methods needed for
   the 50 problems. Then `\clearpage\dividerbar{Luyện tập cơ bản}` (EN:
   `Core practice`) before problem 1. Part c starts with
   `\clearpage\dividerbar{Mở rộng -- Nâng cao}` (EN: `Extension and challenge`).
8. LaTeX hygiene: the solution is a macro argument, so no `\verb`, no
   unbalanced braces, no `%` at end-of-line issues; do not put `\begin{figC}`
   inside `tabular`. In VI write all Vietnamese with full diacritics (the font
   encoding T5 supports them). Avoid characters outside Vietnamese/Latin
   (no emoji, no “smart” symbols outside math); use `--` for dashes, `''`/``` `` ```
   for quotes. `$` for money is forbidden (it is math mode) — write "đồng"/"dong".
9. Verify every numerical answer (use `python3` for arithmetic/brute force if
   useful). Wrong answers are the worst possible defect.
10. Compile-check your topic with `python3 build_grade7.py --pdf <n>` from the
    `grade7/` folder (runs pdflatex twice for the four editions); fix all
    errors. Also look at a page or two of the PDF (`pdftoppm -r 60 -png -f 3 -l 4`
    then Read the PNG) to check figures look right.

## Skeleton

```latex
\begin{knowbox}\textbf{Ý tưởng lớn.} ... \end{knowbox}
\vspace{0.3cm}

\shead{Biểu thức đại số và giá trị của biểu thức}
\begin{knowbox}
...
\end{knowbox}
\begin{proofbox} ... \end{proofbox}
\begin{tipbox} ... \end{tipbox}

\begin{exbox}{Ví dụ 1}
Đề bài ...\guide
\step{1}{Tìm ...} ...
\ans{...}
\end{exbox}

\clearpage
\dividerbar{Luyện tập cơ bản}

\begin{probbox}{1}{\relax}
Một ô tô chạy đều với vận tốc $85$ km/h ...
\choices{$5$ giờ}{$425$ giờ}{$12$ giờ}{$1{,}5$ giờ}{$3$ giờ}
\end{probbox}
\probsol{
\textbf{Phân tích đề.} ...
\step{1}{Tính quãng đường còn lại}
...
\begin{recallbox}Quãng đường $=$ vận tốc $\times$ thời gian, nên thời gian $=$ quãng đường $:$ vận tốc.\end{recallbox}
\step{2}{...}
...
\verify{$85\times 3=255$ km, đúng bằng nửa quãng đường.}
Vậy chọn \textbf{(E)}.
\ans{(E) $3$ giờ}
}
```
