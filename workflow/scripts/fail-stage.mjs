// workflow/scripts/fail-stage.mjs — 게이트/단계 실패 기록.
// 사용: node workflow/scripts/fail-stage.mjs "실패 사유"
import { readState, writeState } from "../lib.mjs";

try {
  const state = readState();
  const reason = process.argv.slice(2).join(" ").trim();

  if (!reason) {
    console.error('사유를 입력하세요. 예: node workflow/scripts/fail-stage.mjs "빌드 실패: 타입 에러"');
    process.exit(1);
  }

  state.current.status = "gate_failed";
  state.blockedBy = state.blockedBy || [];
  state.blockedBy.push(reason);

  writeState(state);

  console.log(`\n[workflow:fail] Stage ${state.current.stageNumber} (${state.current.stageId}) 실패 기록`);
  console.log(`status : gate_failed`);
  console.log(`사유 : ${reason}`);
  console.log(`\n→ 위 사유를 고친 뒤 게이트를 재실행하세요: ${state.nextGate?.command || "(stages.yaml 참고)"}`);
  console.log("  통과하면 complete-stage 로 진행할 수 있습니다.");
  console.log("");
} catch (err) {
  console.error("fail-stage 실패:", err.message);
  process.exit(1);
}
