// workflow/scripts/approve-stage.mjs — 사용자 승인 처리.
// 사용: node workflow/scripts/approve-stage.mjs [decisionFile경로]
import { readState, writeState } from "../lib.mjs";
import { currentStage, fileExists } from "./_common.mjs";

try {
  const state = readState();
  const decisionFile = process.argv[2] || null;
  const stage = currentStage(state);
  const ha = state.humanApproval || {};

  if (!ha.required) {
    console.warn("⚠ 이 단계는 사용자 승인이 필요하지 않습니다 (humanApproval.required=false). 그래도 승인 기록을 남깁니다.");
  } else if (state.current.status !== "awaiting_approval") {
    console.warn(
      `⚠ 현재 status=${state.current.status} (awaiting_approval 아님). ` +
        `보통 게이트 통과 후 awaiting_approval 상태에서 승인합니다. 그래도 승인 기록을 남깁니다.`
    );
  }

  if (decisionFile && !fileExists(decisionFile)) {
    console.warn(`⚠ decision 파일이 존재하지 않습니다: ${decisionFile} (경로만 기록합니다)`);
  }

  state.humanApproval = {
    required: ha.required ?? true,
    status: "approved",
    decisionFile,
  };

  writeState(state);

  console.log(`\n[workflow:approve] Stage ${state.current.stageNumber} (${state.current.stageId}) 승인됨`);
  console.log(`humanApproval.status : approved`);
  console.log(`decisionFile : ${decisionFile || "(없음)"}`);
  console.log("\n이제 complete-stage 로 다음 단계로 진행할 수 있습니다.");
  console.log("");
} catch (err) {
  console.error("approve-stage 실패:", err.message);
  process.exit(1);
}
