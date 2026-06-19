// workflow/scripts/complete-stage.mjs — 현재 단계 완료 → 다음 단계로 이동.
// 사용: node workflow/scripts/complete-stage.mjs
import { execSync } from "node:child_process";
import { readState, writeState, ROOT, getStage } from "../lib.mjs";
import {
  now,
  minutesBetween,
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
    console.warn(
      `⚠ Handoff 보고서가 없습니다: ${handoff}\n` +
        `  → 자동 생성: npm run workflow:handoff (기계가 시간·파일·커밋·게이트 채움) 후 '결정/위험' 1~2줄만 보강.`
    );
  }

  // 걸린 시간 계산 (시작 시각 → 지금)
  const completedAt = now();
  const actualMinutes = minutesBetween(state.current.startedAt, completedAt);

  // completedStages 에 push (중복 방지) — 걸린 시간 함께 기록
  state.completedStages = state.completedStages || [];
  if (!state.completedStages.some((s) => s && s.stageId === stage.id)) {
    state.completedStages.push({
      stageNumber: stage.number,
      stageId: stage.id,
      startedAt: state.current.startedAt,
      completedAt,
      actualMinutes,
      budgetMinutes: stage.budgetMinutes,
    });
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
  if (actualMinutes != null) {
    const over =
      stage.budgetMinutes != null && actualMinutes > stage.budgetMinutes ? "  ⚠ 예산 초과" : "";
    console.log(`걸린 시간 : ${actualMinutes}분 (예산 ${stage.budgetMinutes ?? "-"}분)${over}`);
  }
  const totalElapsed = minutesBetween(state.project?.startedAt, completedAt);
  if (totalElapsed != null) {
    const deadline = state.project?.deadlineMinutes ?? 240;
    const remaining = Math.round((deadline - totalElapsed) * 10) / 10;
    console.log(`전체 경과 : ${totalElapsed}분 / ${deadline}분  (남음 ${remaining}분)`);
  }
  if (commit) console.log(`체크포인트 커밋 : ${commit.slice(0, 8)}`);

  // 마지막 단계인가?
  if (isLastStage(stage)) {
    state.current.status = "completed";
    writeState(state);
    console.log("\n🎉 워크플로우 완료 — 마지막 단계까지 끝났습니다.");
    console.log("");
    process.exit(0);
  }

  // 자동 전환하지 않는다. awaiting_direction 으로 멈추고 사용자 확인을 기다린다.
  state.current.status = "awaiting_direction";
  writeState(state);

  const nxt = getStage(stage.number + 1);
  console.log(`\n[workflow:complete] Stage ${stage.number} (${stage.id}) 마감 — 다음 단계로 자동 전환하지 않습니다.`);
  console.log("상태 : awaiting_direction (사용자 방향 결정 대기)");
  console.log("\n반드시 사용자에게 다음을 확인하세요:");
  console.log("  ① 이 단계 결과 요약");
  console.log(`  ② 다음 단계 미리보기 : Stage ${nxt.number} (${nxt.id}) — ${nxt.budgetMinutes}분`);
  console.log("  ③ '그대로 진행' vs '수정 후 진행'");
  console.log("\n사용자가 진행을 택하면 : node workflow/scripts/next-stage.mjs");
  console.log("");
} catch (err) {
  console.error("complete-stage 실패:", err.message);
  process.exit(1);
}
