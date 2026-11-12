#!/usr/bin/env python3
"""Đóng gói PDF Tách Ghép thành một file HTML duy nhất (không cần thư mục lib/).

    python build-standalone.py      ->  PDF-Tach-Ghep.html

File kết quả mở được bằng cách bấm đúp trên Windows / macOS / Linux, không cần mạng.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "index.html"
OUT = ROOT / "PDF-Tach-Ghep.html"


def inline(name):
    code = (ROOT / "lib" / name).read_text(encoding="utf-8")
    # an inline <script> must not contain "</script"
    code = re.sub(r"</(script)", r"<\\/\1", code, flags=re.I)
    return f"<script>/* {name} */\n{code}\n</script>"


html = SRC.read_text(encoding="utf-8")

# The loader block: pdf.js + (file:// only) worker on the main thread. In the single file the worker
# code is always inlined, so pdf.js runs it on the main thread (no separate worker file is needed).
loader = re.compile(
    r'<script src="lib/pdf\.min\.js"></script>\s*<script>.*?</script>', re.S)
assert loader.search(html), "pdf.js loader block not found"
html = loader.sub(lambda m: inline("pdf.min.js") + "\n" + inline("pdf.worker.min.js"), html, count=1)

for name in ("pdf-lib.min.js", "jszip.min.js", "Sortable.min.js"):
    tag = f'<script src="lib/{name}"></script>'
    assert tag in html, tag
    html = html.replace(tag, inline(name))

assert 'src="lib/' not in html
OUT.write_text(html, encoding="utf-8", newline="\n")
print(f"OK: {OUT.name} ({OUT.stat().st_size / 1048576:.1f} MB)")
