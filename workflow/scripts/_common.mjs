// workflow/scripts/_common.mjs — 상태 전환 스크립트들이 공유하는 작은 출력/조회 헬퍼.
// 실제 상태/단계 로직은 모두 ../lib.mjs 의 API 를 재사용한다.
import { join } from "node:path";
import { existsSync } from "node:fs";
import { ROOT, getStage } from "../lib.mjs";

export function now() {
  return new Date().toISOString();
}

// stage 의 gate 명령 문자열("npm run gate:spec") → state.nextGate 객체로 변환.
// report 경로는 workflow/history/stage-XX-gate.md 규약을 따른다.
export function gateForStage(stage) {
  const num = String(stage.number).padStart(2, "0");
  return {
    command: stage.gate,
    report: `workflow/history/stage-${num}-gate.md`,
  };
}

// stage 의 instruction + guidance(file/sections) 를 requiredReads 배열로.
export function requiredReadsForStage(stage) {
  const reads = [];
  if (stage.instruction) reads.push(stage.instruction);
  for (const g of stage.guidance || []) {
    if (!g || !g.file) continue;
    if (g.sections && g.sections.length) {
      for (const s of g.sections) reads.push(`${g.file} :: ${s}`);
    } else {
      reads.push(g.file);
    }
  }
  return reads;
}

// handoff 경로 규약: workflow/history/stage-XX-<id>.md
export function handoffPathFor(stage) {
  const num = String(stage.number).padStart(2, "0");
  return `workflow/history/stage-${num}-${stage.id}.md`;
}

export function fileExists(rel) {
  return existsSync(join(ROOT, rel));
}

// 현재 state.current 를 기준으로 stages.yaml 의 stage 객체를 찾는다.
export function currentStage(state) {
  return getStage(state.current.stageId) || getStage(state.current.stageNumber);
}

// 마지막 단계(다음이 없는) 여부
export function isLastStage(stage) {
  return getStage(stage.number + 1) == null;
}

export function line() {
  console.log("─".repeat(56));
}

// 상태 요약을 콘솔에 출력 (status.mjs / resume.mjs 공용)
export function printStatusSummary(state) {
  const c = state.current;
  line();
  console.log(`현재 단계 : Stage ${c.stageNumber} (${c.stageId})`);
  console.log(`상태      : ${c.status}`);
  console.log(`workflowMode : ${state.workflowMode}`);
  console.log(`남은 예산 : ${c.budgetMinutes}분  (시작: ${c.startedAt || "미시작"})`);
  line();
  const ng = state.nextGate || {};
  console.log(`다음 게이트 : ${ng.command || "(없음)"}`);
  if (ng.report) console.log(`게이트 보고 : ${ng.report}`);
  line();
  console.log("requiredReads (이것만 읽어라):");
  if ((state.requiredReads || []).length === 0) {
    console.log("  (없음)");
  } else {
    for (const r of state.requiredReads) console.log(`  - ${r}`);
  }
  line();
  const ha = state.humanApproval || {};
  console.log(`humanApproval : required=${ha.required} status=${ha.status}`);
  if (ha.decisionFile) console.log(`  decisionFile: ${ha.decisionFile}`);
  console.log(`lastHandoff : ${state.lastHandoff || "(없음)"}`);
  const cp = state.lastSuccessfulCheckpoint || {};
  console.log(
    `마지막 체크포인트 : ${cp.stageId ? `Stage ${cp.stageNumber} (${cp.stageId})` : "(없음)"}` +
      `${cp.commit ? ` @ ${cp.commit.slice(0, 8)}` : ""}`
  );
  if ((state.blockedBy || []).length) {
    line();
    console.log("blockedBy:");
    for (const b of state.blockedBy) console.log(`  ✗ ${b}`);
  }
  line();
}
