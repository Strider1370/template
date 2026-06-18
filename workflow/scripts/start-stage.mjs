// workflow/scripts/start-stage.mjs — 단계 시작.
// 사용: node workflow/scripts/start-stage.mjs [stage번호|stageId]
//   인자 없으면 current 단계를 시작.
import { readState, writeState, getStage } from "../lib.mjs";
import {
  now,
  gateForStage,
  requiredReadsForStage,
  currentStage,
} from "./_common.mjs";

try {
  const state = readState();
  const arg = process.argv[2];

  // 시작할 stage 결정
  let stage;
  if (arg != null && arg !== "") {
    stage = getStage(arg);
    if (!stage) {
      console.error(`알 수 없는 단계: "${arg}". stages.yaml 의 number 또는 id 를 쓰세요.`);
      process.exit(1);
    }
  } else {
    stage = currentStage(state);
    if (!stage) {
      console.error("current 단계를 stages.yaml 에서 찾지 못했습니다.");
      process.exit(1);
    }
  }

  // current 를 해당 stage 로 맞춘다
  state.current.stageNumber = stage.number;
  state.current.stageId = stage.id;
  state.current.status = "in_progress";
  state.current.startedAt = now();
  state.current.budgetMinutes = stage.budgetMinutes;

  // 전체 해커톤 시계: 최초 단계 시작 시각을 1회 기록(이후 전체 경과/남은 시간 계산 기준).
  state.project = state.project || {};
  if (!state.project.startedAt) state.project.startedAt = state.current.startedAt;

  // requiredReads / nextGate / humanApproval 갱신
  state.requiredReads = requiredReadsForStage(stage);
  state.nextGate = gateForStage(stage);
  state.humanApproval = {
    required: !!stage.humanApproval,
    status: stage.humanApproval ? "pending" : "not_required",
    decisionFile: null,
  };

  writeState(state);

  console.log(`\n[workflow:start] Stage ${stage.number} (${stage.id}) 시작`);
  console.log(`시작 시각 : ${state.current.startedAt}`);
  console.log(`시간 예산 : ${stage.budgetMinutes}분`);
  console.log("\n먼저 읽어라 (requiredReads):");
  if (state.requiredReads.length === 0) console.log("  (없음)");
  for (const r of state.requiredReads) console.log(`  - ${r}`);
  console.log(`\n작업 후 게이트 : ${state.nextGate.command}`);
  if (stage.humanApproval) {
    console.log("\n⚠ 이 단계는 사용자 승인이 필요합니다. 게이트 통과 후 approve-stage 로 승인받으세요.");
  }
  console.log("");
} catch (err) {
  console.error("start-stage 실패:", err.message);
  process.exit(1);
}
