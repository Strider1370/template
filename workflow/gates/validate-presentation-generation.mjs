// workflow/gates/validate-presentation-generation.mjs — Stage 09 Presentation Generation 게이트 (enforced)
// B안: deck.json은 AI가 직접 작성(scenes.json은 선택적 보조). 검증: deck.json(파싱)+slides.md+산출물.
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { ROOT, checkFiles, gateResult, readText } from "../lib.mjs";

const checks = checkFiles([
  "presentation/deck.json",
  "presentation/slidev/slides.md",
]);

// deck.json JSON.parse + 최소 구조
const raw = readText("presentation/deck.json");
if (raw === null) {
  checks.push({ label: "parse: presentation/deck.json (없음)", ok: false });
} else {
  try {
    const deck = JSON.parse(raw);
    checks.push({ label: "parse: presentation/deck.json", ok: true });
    checks.push({ label: "deck.slides ≥1", ok: Array.isArray(deck.slides) && deck.slides.length > 0 });
  } catch (e) {
    checks.push({ label: `parse: presentation/deck.json — ${e.message}`, ok: false });
  }
}

// 산출물: 정적 HTML 백업(필수) + (선택) slidev/ 빌드 디렉터리
const staticHtml = existsSync(join(ROOT, "presentation/output/static/presentation.html"));
const slidevAbs = join(ROOT, "presentation/output/slidev");
const slidevDir = existsSync(slidevAbs) && statSync(slidevAbs).isDirectory();
checks.push({ label: "산출물: output/static/presentation.html (오프라인 백업)", ok: staticHtml });

const notes = [
  "deck.json 무결성은 `npm run presentation:validate-deck`, slides.md 정합은 `npm run presentation:validate-slides`로 별도 확인.",
  "scenes.json은 선택(B안: deck.json을 AI가 직접 작성).",
];
if (slidevDir) notes.push("slidev/ 빌드본도 존재함(라이브 발표용).");
else notes.push("slidev/ 빌드본 없음 — 라이브는 정적 HTML로 시연 가능(인터넷 불필요).");

const ok = checks.every((c) => c.ok);
gateResult("presentation-generation", ok, { checks, notes });
