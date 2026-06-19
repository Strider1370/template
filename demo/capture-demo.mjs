// demo/capture-demo.mjs — 데모 핵심경로를 2회 완주하며 단계별 스크린샷 + Wow 캡처.
// 실행: NODE_PATH="presentation/slidev/node_modules" node demo/capture-demo.mjs
// (dev 서버가 http://localhost:3000 에 떠 있어야 함)

import { chromium } from '../presentation/slidev/node_modules/playwright-chromium/index.mjs';
import { mkdirSync } from 'node:fs';

const BASE = process.env.DEMO_URL || 'http://localhost:3000';
const OUT = 'presentation/assets/screenshots';
mkdirSync(OUT, { recursive: true });

async function runOnce(page, runLabel) {
  const report = { run: runLabel, steps: [], ok: true, notes: [] };

  // Step 1 — 입력 화면 (로그인 없음)
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid="nl-input"]', { timeout: 60000 });
  const loginCount = await page.locator('[data-testid="login"]').count();
  if (loginCount !== 0) { report.ok = false; report.notes.push('login 화면이 렌더됨(불변식 위반)'); }
  await page.screenshot({ path: `${OUT}/${runLabel}-step1-input.png`, fullPage: true });
  report.steps.push({ step: 1, loginCount });

  // 입력: 데모 페르소나 (8개월 아기 / 월 350 / 영유아)
  await page.click('button:has-text("영유아 가구")');
  await page.fill('input[placeholder="예: 350"]', '350');
  await page.fill('input[placeholder="예: 8"]', '8');
  await page.click('[data-testid="find-benefits"]');

  // Step 2 — 구조화 칩 + 카드
  await page.waitForSelector('[data-testid="parsed-profile"]');
  await page.waitForSelector('[data-testid="benefit-card"]');
  const chipCount = await page.locator('[data-testid="parsed-profile"] span').count();
  const cardCount = await page.locator('[data-testid="benefit-card"]').count();
  await page.screenshot({ path: `${OUT}/${runLabel}-step2-results.png`, fullPage: true });
  report.steps.push({ step: 2, chipCount, cardCount });

  // Step 3 — Wow: 첫 카드의 충족 체크리스트 + 설명
  const firstCard = page.locator('[data-testid="benefit-card"]').first();
  const checklistItems = await firstCard.locator('[data-testid="eligibility-checklist"] li').count();
  const whyText = (await firstCard.locator('[data-testid="why-explanation"]').innerText()).trim();
  const applyCount = await firstCard.locator('[data-testid="apply-cta"]').count();
  const sampleLabel = await page.locator('[data-testid="sample-data-label"]').count();
  await firstCard.scrollIntoViewIfNeeded();
  await firstCard.screenshot({ path: `${OUT}/${runLabel}-step3-wow.png` });
  report.steps.push({ step: 3, checklistItems, whyLen: whyText.length, applyCount, sampleLabel });

  // 검증 (Wow 불변식)
  if (cardCount < 1) { report.ok = false; report.notes.push('benefit-card 0개'); }
  if (chipCount < 1) { report.ok = false; report.notes.push('parsed-profile 칩 0개'); }
  if (checklistItems < 1) { report.ok = false; report.notes.push('eligibility-checklist ✓ 0개'); }
  if (!whyText) { report.ok = false; report.notes.push('why-explanation 비어있음'); }
  if (applyCount < 1) { report.ok = false; report.notes.push('apply-cta 없음'); }
  if (sampleLabel < 1) { report.ok = false; report.notes.push('sample-data-label 없음'); }

  return report;
}

const browser = await chromium.launch();
const reports = [];
try {
  for (const label of ['run1', 'run2']) {
    const ctx = await browser.newContext({ viewport: { width: 1000, height: 1400 } });
    const page = await ctx.newPage();
    reports.push(await runOnce(page, label));
    await ctx.close();
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify(reports, null, 2));
const allOk = reports.every((r) => r.ok);
console.log(allOk ? '\nDEMO VALIDATION: PASS (2/2 완주)' : '\nDEMO VALIDATION: FAIL');
process.exit(allOk ? 0 : 1);
