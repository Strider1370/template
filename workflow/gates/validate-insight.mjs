// workflow/gates/validate-insight.mjs — Stage 02 Insight Selection 게이트 (checklist)
// 정책: 필수파일 존재 + 자가점검. selected-direction.md 는 사용자 승인(humanApproval) 후 생성.
import { checkFiles, gateResult, readText } from "../lib.mjs";

const required = ["workflow/decisions/insight-candidates.md"];
const checks = checkFiles(required);

const notes = [
  "체크리스트 게이트(자가점검). 아래를 사람/에이전트가 확인했다고 간주하고 통과:",
  "  ☐ Insight 후보가 최소 5개인가",
  "  ☐ 각 후보에 AI Leverage 평가가 있는가",
  "  ☐ 사용자 승인(humanApproval)을 받았는가",
  "  ☐ 승인 후 workflow/decisions/selected-direction.md 를 생성하라",
];

const cand = readText("workflow/decisions/insight-candidates.md");
if (cand) {
  const items = (cand.match(/^#{2,3}\s/gm) || []).length;
  notes.push(`  • 측정: insight-candidates.md 후보 헤딩 약 ${items}개 (목표 ≥5)`);
}

const ok = checks.every((c) => c.ok);
gateResult("insight", ok, { checks, notes });
