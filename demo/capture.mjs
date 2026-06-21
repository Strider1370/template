// demo/capture.mjs — Stage 07 데모 검증. demo.scenario.yaml 핵심경로를 Playwright로 2회 완주하며
// 단계별 스크린샷 + Wow 캡처 + assertion. 실행: 앱(localhost:3000) 켠 상태에서 `node demo/capture.mjs`.
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DIR = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.DEMO_URL || 'http://localhost:3000';
const WHITELIST = ['easylaw.go.kr', 'scourt.go.kr', 'gov.kr', 'bokjiro.go.kr'];
const shot = (name) => join(DIR, name);

// 부분일치 대신 호스트 정확매칭(서브도메인 허용) → 위장 도메인 차단.
function hostAllowed(href) {
  try {
    const h = new URL(href).hostname;
    return WHITELIST.some((d) => h === d || h.endsWith('.' + d));
  } catch {
    return false;
  }
}

async function runOnce(page, tag, assertResults) {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.screenshot({ path: shot(`${tag}-01-home.png`), fullPage: false });

  // step1: 예시(지급명령) 채우고 분석
  await page.click('text=예시: 지급명령서');
  await page.click('[data-testid="analyze"]');

  // step2: 가이드 카드 + 첫 걸음
  await page.waitForSelector('[data-testid="guide-card"]', { timeout: 30000 });
  await page.waitForSelector('[data-testid="step-first-action"]', { timeout: 30000 });
  await page.waitForSelector('[data-testid="source-badge"]', { timeout: 30000 });
  await page.screenshot({ path: shot(`${tag}-02-result.png`), fullPage: true });

  // assertion (demo.scenario step2/step3)
  const firstStep = (await page.textContent('[data-testid="step-first-action"]')) || '';
  const a1 = firstStep.includes('이의신청') && (firstStep.includes('2주') || firstStep.includes('14일'));
  const href = (await page.getAttribute('[data-testid="source-badge"]', 'href')) || '';
  const a2 = hostAllowed(href);
  assertResults.push({ tag, firstStepOk: a1, sourceWhitelistOk: a2, href });

  // step: Wow 캡처 — 가이드 카드 안에 출처 배지
  const card = page.locator('[data-testid="guide-card"]');
  await card.scrollIntoViewIfNeeded();
  await card.screenshot({ path: shot(`${tag}-03-wow.png`) });
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
const assertResults = [];
let impromptuOk = false;
try {
  await runOnce(page, 'run1', assertResults); // 1회차
  await runOnce(page, 'run2', assertResults); // 2회차(재현성)

  // step4(즉석 입력): 예시가 아닌 미리 안 짜둔 입력 → 같은 엔진이 새 카드 생성(대본 아님).
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.fill('#doc-input', '건강보험료 체납 독촉 고지서가 왔어요. 어떻게 해야 하나요?');
  await page.click('[data-testid="analyze"]');
  await page.waitForSelector('[data-testid="guide-card"]', { timeout: 30000 });
  await page.waitForSelector('[data-testid="step-first-action"]', { timeout: 30000 });
  const impromptuStep = (await page.textContent('[data-testid="step-first-action"]')) || '';
  // 즉석 입력(건강보험)이 결과에 반영됐는지(지급명령 대본이 아님)
  impromptuOk = impromptuStep.length > 0 && !impromptuStep.includes('지급명령');
  await page.locator('[data-testid="guide-card"]').screenshot({ path: shot('run3-impromptu.png') });

  console.log('ASSERTIONS:', JSON.stringify(assertResults, null, 2));
  console.log('IMPROMPTU(step4) ok:', impromptuOk, '/', impromptuStep.slice(0, 50));
  const allOk = assertResults.every((r) => r.firstStepOk && r.sourceWhitelistOk) && impromptuOk;
  console.log(allOk ? 'DEMO VALIDATION: PASS (2회 완주 + 즉석입력, assertion 충족)' : 'DEMO VALIDATION: FAIL');
  process.exitCode = allOk ? 0 : 1;
} catch (e) {
  console.error('DEMO VALIDATION ERROR:', e.message);
  process.exitCode = 1;
} finally {
  await browser.close();
}
