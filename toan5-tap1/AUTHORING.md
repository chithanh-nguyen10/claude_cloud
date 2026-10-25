# Authoring guide — Toán 5 nâng cao, Quyển 1

This book uses the **same layout as the Grade 3 ThinkAlgo book**. The layout lives in
`preamble.tex` (copied from the G3 file, plus a few geometry helpers). Chapter bodies
live in `chapters/<id>_vi.tex` and `chapters/<id>_en.tex`. `build.py` adds the chapter
banner, cover and contents, and writes four standalone `.tex` files
(Vietnamese/English × teacher/student).

Never edit `preamble.tex` or `build.py` from a chapter task. If a chapter really needs an
extra macro, define it at the top of that chapter file with `\providecommand` and a
`\cNN` prefix (e.g. `\cXIIfig`).

## Source material

The content is based on *Hướng dẫn học Toán 5, Tập một* (scanned PDF). Use it **only
for the knowledge and the problem types**: rewrite the theory in a clear textbook
voice, and write **new** examples and exercises (new stories, new numbers, close to a
primary pupil's life: lớp học, sân trường, thư viện, vườn trường, hội chợ, dã ngoại,
nuôi cá, làm bánh, trồng cây, quyên góp sách...). Nothing is copied word-for-word.

| id | Chapter (VI / EN) | PDF pages | Book problems |
|----|-------------------|-----------|---------------|
| 01 | Số tự nhiên / Natural Numbers | 5–10 | 1–20 |
| 02 | Ba bài toán về phân số / Three Basic Fraction Problems | 11–14 | 21–35 |
| 03 | Phân số và hỗn số / Fractions and Mixed Numbers | 15–19 | 36–50 |
| 04 | Tỉ lệ thuận – Tỉ lệ nghịch / Direct and Inverse Proportion | 20–24 | 51–65 |
| 05 | Bài toán tổng – tỉ, hiệu – tỉ / Sum–Ratio and Difference–Ratio | 25–29 | 66–85 |
| 06 | Bài toán công việc / Work Problems | 30–35 | 86–100 |
| 07 | Bài toán hai hiệu số / The Two-Differences Method | 36–39 | 101–115 |
| 08 | Bài toán hai tỉ số / Problems with Two Ratios | 40–43 | 116–130 |
| 09 | Tính ngược từ cuối / Working Backwards | 44–49 | 131–150 |
| 10 | Số thập phân / Decimals | 50–53 | 151–170 |
| 11 | Bài toán về số thập phân / Word Problems with Decimals | 54–57 | 171–190 |
| 12 | Hình tam giác / Triangles | 58–64 | 191–205 |
| 13 | Tỉ số diện tích tam giác / Triangles: Area Ratios | 65–72 | 206–225 |
| 14 | Hình thang / Trapezoids | 73–78 | 226–240 |
| 15 | Hình tròn / Circles | 79–85 | 241–260 |
| 16 | Luyện tập tính diện tích / Area Practice | 86–91 | 261–275 |

## Shape of a chapter

1. **Theory** — 2–5 sections, each `\shead{…}` + `knowbox`, separated by `\vspace{0.45cm}`.
2. **Worked examples** — 4–6 `exbox` (`Ví dụ N` / `Example N`) with `\guide`; examples keep
   their solutions in every edition. Where the book shows two methods, show both
   (*Cách 1 / Cách 2* — *Method 1 / Method 2*).
3. **Practice** — `\needspace{6cm}\dividerbar{Luyện tập}` (`Practice`), then as many
   problems as the book's section has, each re-staged (same skill, new story and numbers).
4. **Extension** — `\needspace{6cm}\dividerbarX{Mở rộng -- Nâng cao}`
   (`Extension -- Challenge`), 6–8 extra harder problems going beyond the book, marked
   `\stars{1}` or `\stars{2}`. Numbering continues from Practice.

Problem numbers restart at 1 in every chapter. Mark book problems that were `(*)` with
`\stars{1}` (or `\stars{2}` if very hard).

## Markup (copy these patterns)

```latex
\shead{Dãy số cách đều}
\begin{knowbox}\begin{itemize}[leftmargin=1.4em,itemsep=3pt]
\item ...
\end{itemize}\end{knowbox}
\vspace{0.45cm}
\begin{exbox}{Ví dụ 1}
Đề bài ...\guide
Lời giải ...\par
\textbf{Cách 2.} ...
\end{exbox}
\vspace{0.45cm}
\needspace{6cm}
\dividerbar{Luyện tập}
\begin{probbox}{1}{\relax}Đề bài ...\end{probbox}
\probsol{Bước giải ...\par ...\ans{$120$ cây}}
\vspace{0.45cm}
\begin{probbox}{7}{\stars{1}}Đề bài khó ...\end{probbox}
\probsol{...}
```

* `\probsol{…}` is typeset twice (measured, then shown; in the student edition it becomes
  an empty "Bài làm" box of the same height). So: no `\label`, footnotes or counters in it,
  and **any figure the pupil needs must be in the `probbox`**, not in `\probsol`.
* End every solution with `\ans{…}` (prints *Đáp số:* / *Answer:* in red).
* Two-column sub-questions: copy the `tabular` pattern of the G3 book
  (`p{0.46\linewidth}` columns), or just `\textbf{a)}\ …\\[2pt]\textbf{b)}\ …`.
* Bar models (sơ đồ đoạn thẳng): `barfig` + `\blk`, `\brcup`, `\brcdn`, `\rowlab`, `\vbrace`
  (see preamble and G3 book). Colours: `tmBlue`, `tmGreen`, `tmTeal`, `tmPink`, `tmPurple`, `tmOrange`.
* Geometry: `\begin{geofig}[scale] … \end{geofig}` with TikZ styles `geo`, `geofill`,
  `geofill2`, `geolab`, `geodim`, `geodash`, `dot`, and `\ranglemark{A}{H}{C}` for a right
  angle at H. Shaded regions: `geofill` (blue) / `geofill2` (orange).
* Number of digits: `\nd{abc}`.

## Typography

| | Vietnamese | English |
|-|-----------|---------|
| decimals | `$2{,}5$` (comma) | `$2.5$` |
| thousands | `$1\,500\,000$` | `$1\,500\,000$` |
| division | `$:$` | `$:$` (same as the G3 English book) |
| units in working | `$= 120$ (cây)` | `$= 120$ (trees)` |
| answer | `\ans{$120$ cây}` | `\ans{$120$ trees}` |
| solution steps | *Bước 1.*, *Cách 1*, *Thử lại:* | *Step 1.*, *Method 1*, *Check:* |

pdfLaTeX + T5 encoding: write maths symbols in math mode (`$\le$`, `$\times$`), use `\dots`,
and plain `''`/``` `` ``` quotes. Names may stay Vietnamese in the English edition (as in G3).

## Quality bar

* Vietnamese: chuẩn văn phong sách giáo khoa — câu ngắn, rõ, xưng "em"/"các em" khi cần,
  trình bày lời giải đủ câu trả lời + phép tính + đơn vị trong ngoặc.
* English: natural British-school English, same maths as the Vietnamese file (problem
  for problem, number for number).
* Every answer is checked in `verify/<id>.py` (exact `fractions.Fraction` arithmetic;
  prints each check and exits non-zero on any mismatch). Choose numbers so answers are
  clean (whole numbers or short decimals/fractions) and every story is realistic.
* Compile check: `python3 build.py --only <id>` builds the four variants into `_check/`;
  it must finish with no errors. Look at a few rendered pages
  (`pdftoppm -png -r 60 -f N -l N file.pdf out`) to check figures.
