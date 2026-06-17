// workflow/gates/cross-review.mjs — LLM Review Gate 헬퍼.
// 사용: node workflow/gates/cross-review.mjs <검토대상(파일/설명)> [...추가]
// 동작:
//   1) codex CLI 가 있으면 `codex exec` 로 교차검토 실행.
//   2) 없으면 exit 2 + 메인 에이전트가 별도 클로드 리뷰어 서브에이전트로 교차검토하라는 안내 출력.
// 절대 가짜로 통과(exit 0)시키지 않는다. 검토는 실제 리뷰어가 수행해야 한다.
import { execSync, spawnSync } from "node:child_process";

const REVIEW_LENS = [
  "Insight 가 수사(rhetoric)에 그치는가, 검증 가능한 통찰인가",
  "AI 필요성이 약한가 (AI 없이도 되는 기능인가)",
  "데모와 차별점(킥)이 서로 연결되는가",
  "구현 상태와 발표 내용이 일치하는가 (구현 안 된 기능 주장 금지)",
  "범위가 4시간에 비해 과도한가",
];

const target = process.argv.slice(2).join(" ").trim();
if (!target) {
  console.error("[cross-review] 검토 대상이 없다.");
  console.error("사용: node workflow/gates/cross-review.mjs <검토대상(파일경로 또는 설명)>");
  process.exit(2);
}

// codex CLI 존재 확인 (실패 허용)
let hasCodex = false;
try {
  execSync("which codex", { stdio: "ignore" });
  hasCodex = true;
} catch {
  hasCodex = false;
}

const prompt =
  `다음 산출물을 교차검토하라: ${target}\n\n` +
  `검토 관점:\n${REVIEW_LENS.map((l, i) => `${i + 1}. ${l}`).join("\n")}\n\n` +
  `각 관점별로 통과/경고/실패와 근거를 제시하라.`;

if (hasCodex) {
  console.log(`[cross-review] codex 발견 → codex exec 로 교차검토 실행: ${target}`);
  const res = spawnSync("codex", ["exec", prompt], { stdio: "inherit" });
  // codex 결과의 종료코드를 그대로 전달. 리뷰 결과는 사람/에이전트가 판단.
  process.exit(res.status ?? 1);
} else {
  console.log("[cross-review] Codex 미사용 환경 → 메인 에이전트가 별도 클로드 리뷰어 서브에이전트로 교차검토를 수행하라.");
  console.log(`\n검토 대상: ${target}`);
  console.log("\n검토 관점:");
  for (const [i, l] of REVIEW_LENS.entries()) console.log(`  ${i + 1}. ${l}`);
  console.log("\n→ 작성자와 다른 Agent(리뷰어)가 위 관점으로 검토하고, 결과를 게이트 판단에 반영하라.");
  console.log("→ 이 스크립트는 자동 통과시키지 않는다 (exit 2).");
  process.exit(2);
}
