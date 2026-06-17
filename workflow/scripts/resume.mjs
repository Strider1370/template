// workflow/scripts/resume.mjs — 새 세션 복원용. 상태 요약 + 다음 행동 안내.
// 사용: node workflow/scripts/resume.mjs
import { readState } from "../lib.mjs";
import { printStatusSummary } from "./_common.mjs";

try {
  const state = readState();
  console.log("\n[workflow:resume] 세션 복원");
  printStatusSummary(state);

  const c = state.current;
  const ng = state.nextGate || {};
  const ha = state.humanApproval || {};
  const useHandoffFirst = state.contextPolicy?.useHandoffBeforeHistory;

  console.log("다음 행동:");
  let step = 1;

  if (state.lastHandoff && useHandoffFirst) {
    console.log(`  ${step++}. 먼저 Handoff 를 읽어 맥락 복원: ${state.lastHandoff}`);
    console.log(`     (전체 history 보다 Handoff 우선 — contextPolicy.useHandoffBeforeHistory=true)`);
  }

  console.log(`  ${step++}. requiredReads 의 파일/섹션만 읽는다 (그 외는 읽지 않는다).`);

  if (c.status === "in_progress") {
    console.log(`  ${step++}. 이미 in_progress — start-stage 생략하고 작업을 이어간다.`);
  } else if (c.status === "gate_failed") {
    console.log(`  ${step++}. status=gate_failed — 문제를 고친 뒤 게이트 재실행: ${ng.command}`);
  } else if (c.status === "awaiting_approval") {
    console.log(`  ${step++}. status=awaiting_approval — 사용자 승인 후 approve-stage 실행.`);
  } else {
    console.log(`  ${step++}. 단계 시작: node workflow/scripts/start-stage.mjs`);
  }

  console.log(`  ${step++}. 작업 수행 → 게이트 실행: ${ng.command || "(stages.yaml 참고)"}`);

  if (ha.required) {
    console.log(`  ${step++}. (승인 필요 단계) 게이트 통과 후 approve-stage 로 사용자 승인 기록.`);
  }

  console.log(`  ${step++}. Handoff 작성 후 완료: node workflow/scripts/complete-stage.mjs`);
  console.log("");
} catch (err) {
  console.error("resume 실패:", err.message);
  process.exit(1);
}
