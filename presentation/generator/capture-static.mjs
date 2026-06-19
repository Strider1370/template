// 임시 시각 점검: 정적 HTML 발표를 슬라이드별로 스크린샷 (contentScale 튜닝용).
// 실행: node presentation/generator/capture-static.mjs
import { chromium } from '../slidev/node_modules/playwright-chromium/index.mjs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { mkdirSync } from 'node:fs';

const htmlPath = resolve('presentation/output/static/presentation.html');
const url = pathToFileURL(htmlPath).href;
const OUT = 'presentation/output/captures';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(500);

const N = 9;
for (let i = 1; i <= N; i++) {
  await page.screenshot({ path: `${OUT}/${String(i).padStart(2, '0')}.png` });
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(250);
}
await browser.close();
console.log(`[capture-static] ${N}장 캡처 → ${OUT}`);
