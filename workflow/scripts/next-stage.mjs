// workflow/scripts/next-stage.mjs — awaiting_direction 에서만 다음 단계로 전환.
// 사용: node workflow/scripts/next-stage.mjs
// (complete-stage 는 더 이상 자동 전환하지 않는다. 사용자 확인 후 이 스크립트로 진행.)
import { readState, writeState, getStage } from "../lib.mjs";
import {
  gateForStage,
  requiredReadsForStage,
  currentStage,
} from "./_common.mjs";

try {
  const state = readState();
  const stage = currentStage(state);
  if (!stage) {
    console.error("current 단계를 stages.yaml 에서 찾지 못했습니다.");
    process.exit(1);
  }

  // 가드: awaiting_direction 이 아니면 전환 거부
  if (state.current.status !== "awaiting_direction") {
    console.error(
      `\n[workflow:next] 거부 — current.status=${state.current.status} (awaiting_direction 아님).\n` +
        `먼저 현재 단계를 마감하세요: node workflow/scripts/complete-stage.mjs\n` +
        `그 뒤 사용자 확인을 거쳐 이 스크립트로 다음 단계로 진행합니다.`
    );
    process.exit(1);
  }

  const nxt = getStage(stage.number + 1);
  if (!nxt) {
    console.error("다음 단계가 없습니다(마지막 단계). 전환할 대상이 없습니다.");
    process.exit(1);
  }

  state.current.stageNumber = nxt.number;
  state.current.stageId = nxt.id;
  state.current.status = "not_started";
  state.current.startedAt = null;
  state.current.budgetMinutes = nxt.budgetMinutes;

  state.requiredReads = requiredReadsForStage(nxt);
  state.nextGate = gateForStage(nxt);
  state.humanApproval = {
    required: !!nxt.humanApproval,
    status: nxt.humanApproval ? "pending" : "not_required",
    decisionFile: null,
  };

  writeState(state);

  console.log(`\n[workflow:next] → Stage ${nxt.number} (${nxt.id}) — ${nxt.budgetMinutes}분`);
  console.log("먼저 읽어라:");
  for (const r of state.requiredReads) console.log(`  - ${r}`);
  console.log("\n시작하려면 : node workflow/scripts/start-stage.mjs");
  if (nxt.humanApproval) {
    console.log("\n⚠ 이 단계는 사용자 승인이 필요합니다. 게이트 통과 후 approve-stage 로 승인받으세요.");
  }
  console.log("");
} catch (err) {
  console.error("next-stage 실패:", err.message);
  process.exit(1);
}
