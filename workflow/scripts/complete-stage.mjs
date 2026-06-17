// workflow/scripts/complete-stage.mjs — 현재 단계 완료 → 다음 단계로 이동.
// 사용: node workflow/scripts/complete-stage.mjs
import { execSync } from "node:child_process";
import { readState, writeState, ROOT, getStage } from "../lib.mjs";
import {
  gateForStage,
  requiredReadsForStage,
  handoffPathFor,
  fileExists,
  currentStage,
  isLastStage,
} from "./_common.mjs";

try {
  const state = readState();
  const stage = currentStage(state);
  if (!stage) {
    console.error("current 단계를 stages.yaml 에서 찾지 못했습니다.");
    process.exit(1);
  }

  // 가드: gate_failed 면 완료 거부
  if (state.current.status === "gate_failed") {
    console.error(
      `\n[workflow:complete] 거부 — current.status=gate_failed.\n` +
        `먼저 문제를 고치고 게이트(${state.nextGate?.command || stage.gate})를 통과시킨 뒤 다시 완료하세요.`
    );
    process.exit(1);
  }

  // handoff 존재 확인 (없어도 경고만)
  const handoff = handoffPathFor(stage);
  if (fileExists(handoff)) {
    state.lastHandoff = handoff;
  } else {
    console.warn(`⚠ Handoff 보고서가 없습니다: ${handoff} (권장: 단계 완료 보고서를 작성하세요)`);
  }

  // completedStages 에 push (중복 방지)
  state.completedStages = state.completedStages || [];
  if (!state.completedStages.some((s) => s && s.stageId === stage.id)) {
    state.completedStages.push({ stageNumber: stage.number, stageId: stage.id });
  }

  // 체크포인트 커밋 기록 (실패해도 무시)
  let commit = null;
  try {
    commit = execSync("git rev-parse HEAD", { cwd: ROOT }).toString().trim();
  } catch {
    /* git 없음/리포 아님 → 무시 */
  }
  state.lastSuccessfulCheckpoint = {
    stageNumber: stage.number,
    stageId: stage.id,
    commit,
  };

  console.log(`\n[workflow:complete] Stage ${stage.number} (${stage.id}) 완료`);
  if (commit) console.log(`체크포인트 커밋 : ${commit.slice(0, 8)}`);

  // 마지막 단계인가?
  if (isLastStage(stage)) {
    state.current.status = "completed";
    writeState(state);
    console.log("\n🎉 워크플로우 완료 — 마지막 단계까지 끝났습니다.");
    console.log("");
    process.exit(0);
  }

  // 다음 단계로 이동
  const nxt = getStage(stage.number + 1);

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

  console.log(`\n다음 단계 : Stage ${nxt.number} (${nxt.id}) — ${nxt.budgetMinutes}분`);
  console.log("먼저 읽어라:");
  for (const r of state.requiredReads) console.log(`  - ${r}`);
  console.log("\n시작하려면 : node workflow/scripts/start-stage.mjs");
  if (nxt.humanApproval) {
    console.log("\n⚠ 다음 단계는 사용자 승인이 필요합니다. 게이트 통과 후 approve-stage 로 승인받으세요.");
  }
  console.log("");
} catch (err) {
  console.error("complete-stage 실패:", err.message);
  process.exit(1);
}
