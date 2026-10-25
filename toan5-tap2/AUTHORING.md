# Authoring guide — Toán 5 nâng cao, Quyển 2

Same layout and conventions as Book 1 (`../toan5-tap1-v1/`). `preamble.tex` is Book 1's
preamble (with the fraction line-spacing fix). `build.py` adds cover, contents and
chapter banners and writes four standalone files:
`Toan5_Tap2_{Teacher,Student}_{Vietnamese,English}.tex` (+ PDFs in `pdf/`).

Chapter bodies: `chapters/<id>_en.tex` and `chapters/<id>_vi.tex` (same content, problem
for problem, number for number). Answer checks: `verify/<id>.py`.

**Style reference — copy its markup exactly:** Book 1 chapter 1–2 in
`../toan5-tap1-v1/vi_parts/p1_en.tex` and its Vietnamese twin `p1_vi.tex`
(`\shead` + `knowbox`, `\gap`, `exbox{\ExWord\ 1}` + `\guide`, `probbox{N}{\relax}` /
`{\stars{1}}`, `\probsol{... \dapso{...}}`, `\pa{a}`, `cols2`/`cols3`, `\note{}`,
`\dividerbar{Practice}` / `\dividerbar{Challenge -- Extension}`
(VI: `Luyện tập` / `Thử thách -- Nâng cao`), bar models `\blk \brcup \brcdn \rowlab \vbrace`,
TikZ styles `geo shade lbl dim` and `\ramark`).

## Source book: `../G5.pdf` (Hướng dẫn học Toán 5, Tập hai; PDF page = book page)

| id | Chapter | Book pages |
|----|---------|-----------|
| 01 | Các phép tính với tỉ số phần trăm | 5–12 |
| 02 | Bài toán về tỉ số phần trăm | 13–15 |
| 03 | Hình hộp chữ nhật, hình lập phương (diện tích xung quanh, toàn phần) | 16–17 (+ surface-area problems from 18–29) |
| 04 | Thể tích | 18–29 |
| 05 | Xếp hình, sơn bề mặt | 30–42 |
| 06 | Chuyển động đều (dạng 1) | 43–49 |
| 07 | Chuyển động cùng chiều, ngược chiều (dạng 2) | 50–57 |
| 08 | Quan hệ v, s, t (dạng 3) + vận tốc trung bình, rút về đơn vị (dạng 4) | 58–66 |
| 09 | Chuyển động trên sông (dạng 5) + vật có chiều dài đáng kể (dạng 6) | 67–73 |
| 10 | Chuyển động vòng tròn (dạng 7) | 74–77 |
| 11 | Thống kê, xác suất | 78–86 |
| 12 | Sơ đồ Venn, tính ngược | 87–96 |
| 13 | Giả thiết tạm | 97–end |

## Shape of a chapter (as in Book 1)
Theory (2–5 `\shead` sections) → 4–5 worked examples (two methods where the book shows
two) → `Practice` problems 1–30 → `Challenge -- Extension` problems 31–50 (harder, beyond
the book, `\stars{1}`/`\stars{2}`). Use the book only for knowledge and problem types:
rewrite theory in textbook style; every example/problem is NEW (new story, new numbers,
close to primary pupils' life). Nothing copied.

Typography: VI decimals `$2{,}5$`, VI lists `$3;\ 7;\ 11$`, EN `$2.5$`, `$3,\ 7,\ 11$`;
thousands `$1\,500\,000$`; division `:`; Vietnamese names with diacritics in both files.
Figures the pupil needs go in `probbox`, never only in `\probsol` (student edition
replaces `\probsol` with an empty box of the same height).

Check: `python3 verify/<id>.py` (exact Fractions; non-zero exit on mismatch) and
`python3 build.py --only <id>` (four variants, must compile without errors).
