#!/usr/bin/env python3
"""
Inverse-vignette correction pro rastrové fotografie z legacy importu.

Vícero historických článků (importováno z hodinarium.eu) má fotky
s ztemnělými rohy — vignette efekt z post-processingu galérií 90s/2000s.
Tento script ten efekt měkce zobrátí: cetra zůstávají, rohy zesvětlí
proporcionálně k vzdálenosti od středu.

Algoritmus:
  1. Pro každý pixel spočítat normalizovanou vzdálenost od středu (0-1).
  2. Násobit jas faktorem 1 + r * STRENGTH, kde STRENGTH řídí intenzitu.
  3. Clip na 0-255 a uložit do JPEG quality 92.

Použití:
    python3 scripts/devignette.py img1.jpg img2.jpg ... [--strength 0.4] [--in-place]

  --strength N        velikost korekce v rozích (default 0.4 = +40%)
  --in-place          přepsat vstup; jinak uloží jako *_devign.jpg
"""
from __future__ import annotations
import argparse
import sys
from pathlib import Path
import numpy as np
from PIL import Image


def remove_vignette(in_path: Path, out_path: Path, strength: float = 0.4) -> None:
    im = Image.open(in_path).convert('RGB')
    arr = np.array(im).astype(np.float32)
    h, w = arr.shape[:2]

    cx, cy = w / 2.0, h / 2.0
    max_r = np.sqrt(cx * cx + cy * cy)

    yy, xx = np.mgrid[0:h, 0:w]
    r = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / max_r  # 0 center → 1 corner

    correction = (1.0 + r * strength)[..., None]  # broadcast přes RGB
    arr = arr * correction
    arr = np.clip(arr, 0, 255).astype(np.uint8)

    Image.fromarray(arr).save(out_path, quality=92, optimize=True)
    print(f'  ✓ {out_path.name} ({out_path.stat().st_size // 1024} KB)')


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('images', nargs='+', type=Path, help='JPEG file(s) to de-vignette')
    p.add_argument('--strength', type=float, default=0.4, help='vignette correction strength (default 0.4)')
    p.add_argument('--in-place', action='store_true', help='overwrite input file')
    args = p.parse_args()

    print(f'→ De-vignette {len(args.images)} obrázků (strength={args.strength})')
    for path in args.images:
        if not path.exists():
            print(f'  ! {path} neexistuje', file=sys.stderr)
            continue
        if args.in_place:
            out = path
        else:
            out = path.with_name(path.stem + '_devign' + path.suffix)
        remove_vignette(path, out, args.strength)
    print('Hotovo.')


if __name__ == '__main__':
    main()
