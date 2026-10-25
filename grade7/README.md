# ThinkAlgo — Toán lớp 7 / Grade 7 worksheets

One book, five chapters. Each chapter has theory, worked examples, and 50 problems
(core practice rewritten from the CEMC Gauss worksheets, then extension and challenge)
with detailed step-by-step solutions.

| # | Tiếng Việt | English |
|---|------------|---------|
| 1 | Đại số và Phương trình | Algebra and Equations |
| 2 | Hình học và Đo lường | Geometry and Measurement |
| 3 | Đếm và Xác suất | Counting and Probability |
| 4 | Số học và Tư duy số | Number Sense |
| 5 | Tư duy logic và Câu đố | Logic and Puzzles |

The whole book comes in four standalone editions in `tex/` (compiled PDFs in `pdf/`):
`ThinkAlgo_Toan7_HS_VI` (sách học sinh), `ThinkAlgo_Toan7_GV_VI` (sách giáo viên, có lời giải),
`ThinkAlgo_Math7_Student_EN`, `ThinkAlgo_Math7_Teacher_EN`.

Edit the content in `body/` (`<topic>_<lang>_<part>.tex`, parts a–d), the look in
`preamble.tex`, the words in `labels_vi.tex` / `labels_en.tex`, then rebuild:

```bash
python3 build_grade7.py --pdf      # the four books   (python3 build_grade7.py --pdf 2  -> test build of chapter 2 only)
```

If a `logo.png` is placed in this folder it is used in the header; otherwise a drawn logo is used.
