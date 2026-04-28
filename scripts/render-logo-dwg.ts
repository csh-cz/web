/**
 * Render the spolek logo from the source DWG into SVG + PNG variants.
 *
 * Pipeline:
 *   1. dwg2dxf (libredwg) on zdroje/logospolkufinal.dwg → /tmp/logo.dxf
 *   2. ezdxf (Python) loads DXF, drops the right-half "outline" copy,
 *      renders modelspace via the SVG backend.
 *   3. Three colour variants are produced from the base SVG by simple
 *      string substitution:
 *        - logo-csh-dark.svg     dark background, white strokes (default)
 *        - logo-csh.svg          transparent bg, white strokes (for dark UIs)
 *        - logo-csh-black.svg    transparent bg, near-black strokes
 *   4. Each SVG → PNG via @resvg/resvg-js at 800 px wide.
 *
 * Output is dropped into apps/horologie-cz/public/img/ and
 * apps/hodinarium-eu/public/img/ for cross-site use.
 *
 * Run with:  pnpm tsx scripts/render-logo-dwg.ts
 *
 * Prerequisites:
 *   - Python 3 with `ezdxf` (pip install ezdxf)
 *   - libredwg's `dwg2dxf` available somewhere; default path searched is
 *     /tmp/libredwg/programs/dwg2dxf — override with DWG2DXF env var.
 */
import { execFileSync } from 'node:child_process';
import { writeFileSync, readFileSync, copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'zdroje', 'logospolkufinal.dwg');
const TMP_DXF = '/tmp/logospolkufinal.dxf';
const TMP_DIR = '/tmp/logo-render';
const DWG2DXF = process.env.DWG2DXF ?? '/tmp/libredwg/programs/dwg2dxf';
const SPOLEK = join(ROOT, 'apps', 'horologie-cz', 'public', 'img');
const HODINARIUM = join(ROOT, 'apps', 'hodinarium-eu', 'public', 'img');

if (!existsSync(SRC)) {
  console.error(`Missing source DWG: ${SRC}`);
  process.exit(1);
}
if (!existsSync(DWG2DXF)) {
  console.error(`dwg2dxf not found at ${DWG2DXF}.`);
  console.error(`Build libredwg from source: git clone https://github.com/LibreDWG/libredwg /tmp/libredwg && cd /tmp/libredwg && ./autogen.sh && ./configure --disable-bindings && make -j4 programs/dwg2dxf`);
  console.error(`Or set DWG2DXF env var to a working binary.`);
  process.exit(1);
}

mkdirSync(TMP_DIR, { recursive: true });

console.log('1) DWG → DXF');
execFileSync(DWG2DXF, ['-m', SRC], { stdio: 'inherit' });
const dxfBeside = join(dirname(SRC), 'logospolkufinal.dxf');
if (existsSync(dxfBeside)) {
  copyFileSync(dxfBeside, TMP_DXF);
}

console.log('2) DXF → SVG via ezdxf (Python)');
const py = `
import ezdxf
from ezdxf.addons.drawing import RenderContext, Frontend
from ezdxf.addons.drawing import svg as svg_backend, layout
from ezdxf import bbox

doc = ezdxf.readfile('${TMP_DXF}')
msp = doc.modelspace()

# The DWG holds two copies of the logo side by side — a filled (left)
# and an outline-only (right) version. Drop everything whose entity bbox
# starts on the right side.
HALF_X = 4476  # midpoint of full bbox
to_delete = []
for e in list(msp):
    try:
        eb = bbox.extents([e])
        if eb.has_data and eb.extmin.x >= HALF_X:
            to_delete.append(e)
    except Exception:
        pass
for e in to_delete:
    msp.delete_entity(e)

ctx = RenderContext(doc)
backend = svg_backend.SVGBackend()
Frontend(ctx, backend).draw_layout(msp, finalize=True)
page = layout.Page(0, 0, layout.Units.mm, margins=layout.Margins.all(2))
with open('${TMP_DIR}/base.svg', 'w') as f:
    f.write(backend.get_string(page))
print('SVG OK')
`;
execFileSync('python3', ['-c', py], { stdio: 'inherit' });

console.log('3) Variant SVGs');
const base = readFileSync(`${TMP_DIR}/base.svg`, 'utf-8');
const dark = base;
const transparentWhite = base.replace(/<rect fill="#212830"[^/]+\/>/, '');
const transparentBlack = transparentWhite.replace(/#ffffff/g, '#14110c');

writeFileSync(`${TMP_DIR}/logo-csh-dark.svg`, dark);
writeFileSync(`${TMP_DIR}/logo-csh.svg`, transparentWhite);
writeFileSync(`${TMP_DIR}/logo-csh-black.svg`, transparentBlack);

console.log('4) PNG via resvg (800 px)');
for (const v of ['dark', '', 'black'] as const) {
  const name = v ? `logo-csh-${v}` : 'logo-csh';
  const svg = readFileSync(`${TMP_DIR}/${name}.svg`);
  const r = new Resvg(svg, { fitTo: { mode: 'width', value: 800 } });
  writeFileSync(`${TMP_DIR}/${name}.png`, r.render().asPng());
}

console.log('5) Deploy');
for (const v of ['dark', '', 'black'] as const) {
  const name = v ? `logo-csh-${v}` : 'logo-csh';
  for (const ext of ['svg', 'png']) {
    copyFileSync(`${TMP_DIR}/${name}.${ext}`, join(SPOLEK, `${name}.${ext}`));
  }
}
// Cross-site: only the standard white-on-transparent variant
for (const ext of ['svg', 'png']) {
  copyFileSync(`${TMP_DIR}/logo-csh.${ext}`, join(HODINARIUM, `logo-csh.${ext}`));
}

console.log('Done. Files:');
for (const v of ['dark', '', 'black'] as const) {
  const name = v ? `logo-csh-${v}` : 'logo-csh';
  console.log(`  ${join(SPOLEK, `${name}.svg`)}`);
  console.log(`  ${join(SPOLEK, `${name}.png`)}`);
}
