// demo/run-demo.mjs — Stage 07 데모 검증.
// demo.scenario.yaml 의 핵심 경로를 Playwright로 2회 연속 완주 + Wow assertion + 영상/스크린샷.
// 사용: (루트에서) node demo/run-demo.mjs   ← dev 서버(localhost:3000)가 떠 있어야 함.
import { chromium } from 'playwright';
import { mkdirSync, copyFileSync, rmSync, existsSync } from 'node:fs';

const BASE = 'http://localhost:3000';
const OUT = 'demo';
const REC = 'demo/_rec';
if (existsSync(REC)) rmSync(REC, { recursive: true, force: true });
mkdirSync(REC, { recursive: true });

const browser = await chromium.launch();
const results = [];
let videoPath = null;

for (let run = 1; run <= 2; run++) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    recordVideo: { dir: REC, size: { width: 1280, height: 900 } },
  });
  const page = await context.newPage();
  const video = page.video();

  await page.goto(BASE, { waitUntil: 'networkidle' });
  // 데이터 로드 → 타임라인 렌더 대기 (step 1~2)
  await page.waitForSelector('[data-testid="benefit-timeline"]', { timeout: 15000 });
  await page.waitForSelector('[data-testid="benefits-now"] .benefit-card', { timeout: 10000 });

  const badge0 = await page.locator('[data-testid="timeline-badge"]').innerText();
  const nowBefore = await page.locator('[data-testid="benefits-now"] .benefit-card').count();
  const warnBefore = await page.locator('[data-testid="deadline-warning"]').count();
  if (run === 1) await page.screenshot({ path: `${OUT}/01-initial.png`, fullPage: true });

  // Wow (step 3): 슬라이더를 출산 직후로 라이브 변경 → 재정렬 + 손실경고 점등
  await page.evaluate(() => {
    const s = document.querySelector('[data-testid="weeks-slider"]');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(s, '41');
    s.dispatchEvent(new Event('input', { bubbles: true }));
    s.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.waitForSelector('[data-testid="deadline-warning"]', { timeout: 6000 });
  await page.waitForTimeout(400);

  const nowAfter = await page.locator('[data-testid="benefits-now"] .benefit-card').count();
  const warnEls = page.locator('[data-testid="deadline-warning"]');
  const warnAfter = await warnEls.count();
  const warnTexts = (await warnEls.allInnerTexts()).map((t) => t.replace(/\s+/g, ' ').trim());
  const badge1 = await page.locator('[data-testid="timeline-badge"]').innerText();
  if (run === 1) await page.screenshot({ path: `${OUT}/02-wow-deadline.png`, fullPage: true });

  // assertion (spec §9): 재정렬 발생 + deadline-warning 중 'D-' & ('소멸'|'마감') 토큰을 가진 게 1개 이상
  const reSorted = nowAfter !== nowBefore;
  const warnText = warnTexts.find((t) => /D-\d+/.test(t) && /(소멸|마감)/.test(t)) ?? warnTexts[0] ?? '';
  const warnOk = warnAfter >= 1 && warnTexts.some((t) => /D-\d+/.test(t) && /(소멸|마감)/.test(t));

  // AI 본질 장면 (step 4): 교차 케이스 질문 → ai-answer
  await page.fill('[data-testid="ask-input"]', '쌍둥이인데 고위험이고 3개월 전 이사 왔어요');
  await page.getByRole('button', { name: /질문/ }).click();
  await page.waitForSelector('[data-testid="ai-answer"]', { timeout: 8000 });
  await page
    .waitForFunction(() => {
      const a = document.querySelector('[data-testid="ai-answer"]');
      return a && a.innerText.replace(/\s+/g, '').length > 40 && !a.innerText.includes('찾고 있어요');
    }, { timeout: 8000 })
    .catch(() => {});
  const aiText = (await page.locator('[data-testid="ai-answer"]').innerText()).replace(/\s+/g, ' ').trim();
  // 계약(scenario step4): 데이터셋 제도명 1개 이상 포함 + 충분한 길이
  const aiOk = aiText.length > 30 && /(다태아|고위험|첫만남|부모급여|산모|신생아|진료비|아동수당)/.test(aiText);
  if (run === 1) await page.screenshot({ path: `${OUT}/03-ai-answer.png`, fullPage: true });

  results.push({ run, badge0, badge1, nowBefore, nowAfter, warnBefore, warnAfter, reSorted, warnOk, aiOk, warnSample: warnText.slice(0, 70), aiSample: aiText.slice(0, 60) });

  await context.close(); // 영상 flush
  const p = await video.path().catch(() => null);
  if (run === 1 && p) videoPath = p;
}

await browser.close();

// 영상 1개를 demo/demo.webm 으로 (게이트는 demo/ 직속 webm/mp4 를 봄)
if (videoPath && existsSync(videoPath)) {
  copyFileSync(videoPath, `${OUT}/demo.webm`);
}

const allPass = results.every((r) => r.reSorted && r.warnOk && r.aiOk);
console.log(JSON.stringify({ allPass, results }, null, 2));
console.log('ALL_PASS=' + allPass);
process.exit(allPass ? 0 : 1);
