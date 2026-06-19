// presentation/generator/make-pdf.mjs — 슬라이드 캡처(PNG)들을 묶어 PDF 생성.
// Slidev export가 이 환경에서 dev 마운트 이슈로 실패할 때의 폴백(Stage 12 §16).
// 실행: node presentation/generator/make-pdf.mjs
import { chromium } from '../slidev/node_modules/playwright-chromium/index.mjs';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const capDir = resolve('presentation/output/captures');
const out = resolve('presentation/output/presentation.pdf');

const pngs = readdirSync(capDir).filter((f) => /\.png$/i.test(f)).sort();
if (!pngs.length) { console.error('캡처 없음'); process.exit(1); }

const slides = pngs.map((f) => {
  const b64 = readFileSync(resolve(capDir, f)).toString('base64');
  return `<div class="page"><img src="data:image/png;base64,${b64}"></div>`;
}).join('\n');

const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  * { margin:0; padding:0; box-sizing:border-box; }
  .page { width:1280px; height:720px; page-break-after:always; display:flex; align-items:center; justify-content:center; background:#fff; }
  .page img { max-width:100%; max-height:100%; }
</style></head><body>${slides}</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'load' });
await page.pdf({ path: out, width: '1280px', height: '720px', printBackground: true, pageRanges: '' });
await browser.close();
console.log(`[make-pdf] ${pngs.length}페이지 → ${out}`);
