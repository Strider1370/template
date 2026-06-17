// workflow/gates/validate-presentation-generation.mjs — Stage 09 Presentation Generation 게이트 (enforced)
// 검증: scenes.json/deck.json/slides.md 존재 + JSON.parse + 정적 HTML 또는 slidev/ 디렉터리 산출.
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { ROOT, checkFiles, gateResult, readText } from "../lib.mjs";

const checks = checkFiles([
  "presentation/scenes.json",
  "presentation/deck.json",
  "presentation/slides.md",
]);

// JSON.parse 검사
for (const rel of ["presentation/scenes.json", "presentation/deck.json"]) {
  const raw = readText(rel);
  if (raw === null) {
    checks.push({ label: `parse: ${rel} (없음)`, ok: false });
  } else {
    try {
      JSON.parse(raw);
      checks.push({ label: `parse: ${rel}`, ok: true });
    } catch (e) {
      checks.push({ label: `parse: ${rel} — ${e.message}`, ok: false });
    }
  }
}

// 산출물: 정적 HTML 또는 slidev/ 디렉터리 중 하나
const staticHtml = existsSync(join(ROOT, "presentation/output/static/presentation.html"));
const slidevAbs = join(ROOT, "presentation/output/slidev");
const slidevDir = existsSync(slidevAbs) && statSync(slidevAbs).isDirectory();
checks.push({
  label: "산출물: static/presentation.html 또는 output/slidev/ (둘 중 하나)",
  ok: staticHtml || slidevDir,
});

const notes = [];
if (!staticHtml && !slidevDir) {
  notes.push("발표 산출물이 없다 — presentation/output/static/presentation.html 또는 presentation/output/slidev/ 를 생성하라.");
}

const ok = checks.every((c) => c.ok);
gateResult("presentation-generation", ok, { checks, notes });
