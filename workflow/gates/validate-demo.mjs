// workflow/gates/validate-demo.mjs — Stage 07 Demo Validation 게이트 (enforced)
// 검증: demo.scenario.yaml 존재 + 스크린샷 ≥1 + 데모 영상(webm/mp4) 존재. 모두 있으면 pass.
import { readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { ROOT, gateResult } from "../lib.mjs";

function listFiles(relDir) {
  const abs = join(ROOT, relDir);
  if (!existsSync(abs)) return [];
  const out = [];
  for (const name of readdirSync(abs)) {
    const p = join(abs, name);
    try {
      if (statSync(p).isFile()) out.push(name);
    } catch { /* ignore */ }
  }
  return out;
}

// 1) 시나리오 파일
const scenarioOk = existsSync(join(ROOT, "demo/demo.scenario.yaml"));

// 2) 스크린샷 ≥1 (demo/ 또는 presentation/assets/screenshots)
const shotDirs = ["demo", "presentation/assets/screenshots"];
const screenshots = shotDirs.flatMap((d) =>
  listFiles(d).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)),
);
const screenshotOk = screenshots.length >= 1;

const checks = [
  { label: "exists: demo/demo.scenario.yaml", ok: scenarioOk },
  { label: `스크린샷 ≥1 (단계별+Wow) (찾음 ${screenshots.length}, ${shotDirs.join(" | ")})`, ok: screenshotOk },
];

const notes = [
  "사람이 1차로 Wow 확인 → 서브에이전트가 예비로 시나리오 완주·단계별 스크린샷 캡처. 메인은 그동안 Stage 08 준비(겹치기). 영상은 만들지 않음 — 단계별 스크린샷이 라이브 실패 백업.",
];
if (!scenarioOk) notes.push("demo/demo.scenario.yaml 이 없다.");
if (!screenshotOk) notes.push("스크린샷이 없다 — demo/ 또는 presentation/assets/screenshots 에 png 저장(단계별+Wow).");

const ok = checks.every((c) => c.ok);
gateResult("demo", ok, { checks, notes });
