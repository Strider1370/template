// workflow/gates/validate-integration.mjs — Stage 06 Integration 게이트 (checklist)
// 필수: implementation/manifest.json. 점검: 각 기능 status 가 5개 enum 중 하나인가 + 핵심 데모 경로 연결.
import { checkFiles, gateResult, readText } from "../lib.mjs";

const STATUS_ENUM = ["implemented", "mocked", "fallback", "dropped", "blocked"];
const required = ["implementation/manifest.json"];
const checks = checkFiles(required);

const notes = [
  "체크리스트 게이트(자가점검). 아래를 사람/에이전트가 확인했다고 간주하고 통과:",
  "  ☐ 핵심 데모 경로가 끝까지 연결되는가",
  "  ☐ spec.md 와의 구현 차이를 기록했는가",
];

const raw = readText("implementation/manifest.json");
if (raw) {
  try {
    const parsed = JSON.parse(raw);
    const features = Array.isArray(parsed) ? parsed : parsed.features ?? [];
    const bad = features.filter((f) => !STATUS_ENUM.includes(f.status));
    if (bad.length) {
      // manifest 가 깨졌으면 게이트 실패 처리
      checks.push({ label: `manifest status enum 위반 ${bad.length}건`, ok: false });
      notes.push(`  • 위반 status: ${bad.map((f) => `${f.name ?? f.id ?? "?"}=${f.status}`).join(", ")}`);
      notes.push(`  • 허용 enum: ${STATUS_ENUM.join(" | ")}`);
    } else {
      checks.push({ label: `manifest 기능 ${features.length}개 status 모두 유효`, ok: true });
    }
  } catch (e) {
    checks.push({ label: "manifest.json JSON.parse", ok: false });
    notes.push(`  • parse 오류: ${e.message}`);
  }
}

const ok = checks.every((c) => c.ok);
gateResult("integration", ok, { checks, notes });
