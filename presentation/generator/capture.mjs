#!/usr/bin/env node
/**
 * capture.mjs — presentation/output/static/presentation.html → 슬라이드별 PNG.
 *
 * 목적: LLM이 렌더된 슬라이드를 *직접 보고* per-slide contentScale(및 내용)을
 *       조정할 수 있도록 캡처를 생성한다(판단=LLM, 적용=코드).
 *
 *  - Playwright(전역, createRequire 로 로드 — package.json 의존성 추가 금지)로 1280x720 캡처.
 *  - 슬라이드 전환은 .ee-active 클래스 토글(뷰어 JS 와 동일 메커니즘).
 *  - 저장: presentation/output/captures/NN-<layout>.png
 *  - 브라우저 경로: PLAYWRIGHT_BROWSERS_PATH env 우선.
 *  - 입력(HTML) 없음/Playwright 미설치/브라우저 미설치 시: 안내 후 exit 0 (throw 금지).
 */
import { existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const presentationRoot = resolve(__dirname, "..");
const htmlPath = resolve(presentationRoot, "output", "static", "presentation.html");
const capturesDir = resolve(presentationRoot, "output", "captures");

const BANNER = "[capture]";
const VIEWPORT = { width: 1280, height: 720 };

function info(msg) { console.log(BANNER + " " + msg); }

// 전역 playwright 를 createRequire 로 로드. npm root -g → /opt/node22/... 순으로 시도.
function loadPlaywright() {
  const candidates = [];
  try {
    const root = execSync("npm root -g", { encoding: "utf8" }).trim();
    if (root) candidates.push(root);
  } catch { /* ignore */ }
  candidates.push("/opt/node22/lib/node_modules");

  for (const base of candidates) {
    try {
      const req = createRequire(resolve(base, "_.js"));
      return req("playwright");
    } catch { /* try next */ }
  }
  // 마지막 시도: 현재 모듈 기준 일반 resolve
  try {
    const req = createRequire(import.meta.url);
    return req("playwright");
  } catch {
    return null;
  }
}

async function main() {
  if (!existsSync(htmlPath)) {
    info("입력 없음: " + htmlPath);
    info("  먼저 `npm run presentation:static` 으로 HTML 을 생성하세요.");
    process.exit(0);
  }

  if (!process.env.PLAYWRIGHT_BROWSERS_PATH) {
    info("PLAYWRIGHT_BROWSERS_PATH 미설정 — 기본 경로를 사용합니다.");
    info("  권장: `npm run presentation:capture` (PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers 포함).");
  }

  const playwright = loadPlaywright();
  if (!playwright) {
    info("Playwright 모듈을 찾지 못했습니다(전역 설치 필요). 캡처를 건너뜁니다.");
    info("  설치 예: npm i -g playwright (브라우저는 PLAYWRIGHT_BROWSERS_PATH 에).");
    process.exit(0);
  }

  let browser;
  try {
    browser = await playwright.chromium.launch();
  } catch (e) {
    info("브라우저 실행 실패(브라우저 미설치 가능). 캡처를 건너뜁니다.");
    info("  PLAYWRIGHT_BROWSERS_PATH=" + (process.env.PLAYWRIGHT_BROWSERS_PATH || "(미설정)"));
    info("  원인: " + (e && e.message ? e.message.split("\n")[0] : e));
    process.exit(0);
  }

  try {
    mkdirSync(capturesDir, { recursive: true });
    const page = await browser.newPage({ viewport: VIEWPORT });
    await page.goto("file://" + htmlPath, { waitUntil: "networkidle" });

    // 슬라이드 메타(레이아웃) 수집.
    const slides = await page.$$eval(".slide", (els) =>
      els.map((el) => el.getAttribute("data-layout") || "slide")
    );

    if (!slides.length) {
      info("슬라이드를 찾지 못했습니다(.slide 0개). 캡처를 건너뜁니다.");
      await browser.close();
      process.exit(0);
    }

    const pad2 = (n) => String(n).padStart(2, "0");
    for (let i = 0; i < slides.length; i++) {
      // i 번째 슬라이드만 .ee-active 로 토글(뷰어 JS 와 동일).
      await page.$$eval(".slide", (els, idx) => {
        els.forEach((el, k) => el.classList.toggle("ee-active", k === idx));
      }, i);
      await page.waitForTimeout(120); // 레이아웃/폰트 적용 안정화
      const layout = String(slides[i]).replace(/[^a-z0-9-]/gi, "");
      const file = resolve(capturesDir, pad2(i + 1) + "-" + (layout || "slide") + ".png");
      await page.screenshot({ path: file, clip: { x: 0, y: 0, ...VIEWPORT } });
    }

    info("캡처 완료: " + slides.length + "장 → " + capturesDir);
    info("  파일명: NN-<layout>.png. 이 PNG 들을 직접 보고 슬라이드별 contentScale 을 조정하세요.");
    await browser.close();
    process.exit(0);
  } catch (e) {
    info("캡처 중 오류 — 건너뜁니다: " + (e && e.message ? e.message.split("\n")[0] : e));
    try { if (browser) await browser.close(); } catch { /* ignore */ }
    process.exit(0);
  }
}

main();
