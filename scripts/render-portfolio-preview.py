"""Render the company PDF for a responsive browser preview, including iOS Safari.

Run after build-portfolio.py. Dependencies: PyMuPDF, Pillow.
The original PDF remains the accessible, downloadable document.
"""
from pathlib import Path
import json
import fitz
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'public/documents/portfolio-v3'
DEST.mkdir(parents=True, exist_ok=True)
pages = []
with fitz.open(ROOT / 'public/documents/LA-Construction-Portfolio.pdf') as doc:
    for index, page in enumerate(doc):
        scale = 1200 / page.rect.width
        pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale), alpha=False)
        name = f'page-{index + 1:02}.webp'
        Image.frombytes('RGB', [pix.width, pix.height], pix.samples).save(
            DEST / name, 'WEBP', quality=88, method=6)
        pages.append({'src': f'/documents/portfolio-v3/{name}',
                      'width': pix.width, 'height': pix.height})
(ROOT / 'lib/portfolio-pages.json').write_text(json.dumps(pages, indent=2) + '\n')
print(f'Rendered {len(pages)} portfolio pages')
