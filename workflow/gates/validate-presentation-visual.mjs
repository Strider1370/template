// workflow/gates/validate-presentation-visual.mjs — Stage 10 Presentation Validation 게이트 (enforced)
// 검증: validation-report.md 존재 + output/captures/ 에 png ≥1.
import { readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { ROOT, checkFiles, gateResult } from "../lib.mjs";

const checks = checkFiles(["presentation/output/validation-report.md"]);

const capturesAbs = join(ROOT, "presentation/output/captures");
let pngCount = 0;
if (existsSync(capturesAbs) && statSync(capturesAbs).isDirectory()) {
  pngCount = readdirSync(capturesAbs).filter((f) => /\.png$/i.test(f)).length;
}
checks.push({ label: `output/captures/ png ≥1 (찾음 ${pngCount})`, ok: pngCount >= 1 });

const notes = [];
if (pngCount < 1) {
  notes.push("캡처 png 가 없다 — presentation/output/captures/slide-XX.png 를 생성하라.");
}

const ok = checks.every((c) => c.ok);
gateResult("presentation-visual", ok, { checks, notes });
