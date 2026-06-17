// workflow/gates/validate-spec.mjs — Stage 03 Spec 게이트 (enforced)
// 검증: spec.md 16개 필수 헤딩 존재 + demo/demo.scenario.yaml 존재 + spec.md 가 빈 템플릿 수준이면 경고.
import { checkSections, checkFiles, gateResult, readText } from "../lib.mjs";

const HEADINGS = [
  "## 1. Answer First",
  "## 2. Problem",
  "## 3. 최종 Insight",
  "## 4. JTBD",
  "## 5. AI Leverage",
  "## 6. Differentiation",
  "## 7. Solution",
  "## 8. 데모 시나리오",
  "## 9. Wow Moment",
  "## 10. Impact",
  "## 11. Credibility",
  "## 12. Limitation",
  "## 13. Guardrail",
  "## 14. Closing Message",
  "## 15. 범위 밖",
  "## 16. 4시간 현실성",
];

const headingChecks = checkSections("spec.md", HEADINGS);
const fileChecks = checkFiles(["demo/demo.scenario.yaml"]);
const checks = [...headingChecks, ...fileChecks];

const notes = [];
const spec = readText("spec.md");
if (spec === null) {
  notes.push("spec.md 가 없다 — Stage 03에서 생성하라.");
} else {
  // 빈 채로 헤딩만 있는 템플릿 수준인지 경고 (내용 글자 수가 매우 적으면)
  const stripped = spec.replace(/^#.*$/gm, "").replace(/\s+/g, "");
  if (stripped.length < 400) {
    notes.push(`경고: spec.md 본문이 비어 보임(본문 ${stripped.length}자). 헤딩만 있는 템플릿일 수 있다 — 실제 내용을 채워라.`);
  }
}

const ok = checks.every((c) => c.ok);
gateResult("spec", ok, { checks, notes });
