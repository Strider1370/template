// workflow/gates/validate-insight.mjs — Stage 02 Insight Selection 게이트 (enforced)
// 검사: 후보 ≥5, selected-direction(승인 후), concept.md 존재 + 6개 척추 헤딩.
import { checkFiles, checkSections, gateResult, readText } from "../lib.mjs";

const checks = [
  ...checkFiles([
    "workflow/decisions/insight-candidates.md",
    "workflow/decisions/selected-direction.md",
    "concept.md",
  ]),
];

// 후보 ≥5 (insight-candidates.md 의 ## / ### 헤딩 수로 추정)
const cand = readText("workflow/decisions/insight-candidates.md");
const candidateCount = cand ? (cand.match(/^#{2,3}\s/gm) || []).length : 0;
checks.push({ label: `insight 후보 ≥5 (측정 ${candidateCount})`, ok: candidateCount >= 5 });

// concept.md 6개 척추 헤딩
checks.push(
  ...checkSections("concept.md", [
    "## 한 문장 피치",
    "## 핵심 페르소나",
    "## 킥",
    "## Wow Moment",
    "## 기억에 남을 마지막 문장",
    "## 안 하는 것",
  ]),
);

const ok = checks.every((c) => c.ok);
gateResult("insight", ok, {
  checks,
  notes: [
    "Stage 02는 사용자 승인(humanApproval) 단계 — 승인 후에만 selected-direction.md·concept.md 생성.",
    "레드팀 교차검토(npm run cross-review -- workflow/decisions/insight-candidates.md)를 1회 수행했는지 확인.",
  ],
});
