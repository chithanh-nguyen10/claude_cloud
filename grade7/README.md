# ThinkAlgo — Toán lớp 7 / Grade 7 worksheets

Four topics, each with theory, 8 worked examples, and 50 problems (1–30 rewritten from
the CEMC Gauss worksheets, 31–50 extension and challenge) with detailed step-by-step solutions.

| # | Tiếng Việt | English |
|---|------------|---------|
| 1 | Đại số và Phương trình | Algebra and Equations |
| 2 | Hình học và Đo lường | Geometry and Measurement |
| 3 | Đếm và Xác suất | Counting and Probability |
| 4 | Số học và Tư duy số | Number Sense |

Each topic comes in four standalone editions in `tex/` (compiled PDFs in `pdf/`):
`HS_VI` (học sinh), `GV_VI` (giáo viên, có lời giải), `Student_EN`, `Teacher_EN`.

Edit the content in `body/` (`<topic>_<lang>_<part>.tex`, parts a–d), the look in
`preamble.tex`, the words in `labels_vi.tex` / `labels_en.tex`, then rebuild:

```bash
python3 build_grade7.py --pdf      # all 16 files   (python3 build_grade7.py --pdf 2  -> topic 2 only)
```

If a `logo.png` is placed in this folder it is used in the header; otherwise a drawn logo is used.
