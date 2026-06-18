// workflow/scripts/_common.mjs — 상태 전환 스크립트들이 공유하는 작은 출력/조회 헬퍼.
// 실제 상태/단계 로직은 모두 ../lib.mjs 의 API 를 재사용한다.
import { join } from "node:path";
import { existsSync } from "node:fs";
import { ROOT, getStage } from "../lib.mjs";

export function now() {
  return new Date().toISOString();
}

// ISO 두 시각 사이 경과(분, 소수 1자리). 입력이 비거나 유효하지 않으면 null.
export function minutesBetween(startIso, endIso) {
  if (!startIso || !endIso) return null;
  const a = new Date(startIso).getTime();
  const b = new Date(endIso).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return Math.round(((b - a) / 60000) * 10) / 10;
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
  // ⏱ 시간 추적: 현재 단계 경과 / 전체 해커톤 경과 vs 마감
  const nowIso = now();
  const proj = state.project || {};
  const deadline = proj.deadlineMinutes ?? 240;
  const curElapsed = c.status === "in_progress" ? minutesBetween(c.startedAt, nowIso) : null;
  console.log(
    `⏱ 현재 단계 : ${curElapsed != null ? `${curElapsed}분 경과` : "미시작"} / 예산 ${c.budgetMinutes ?? "-"}분`
  );
  const totalElapsed = minutesBetween(proj.startedAt, nowIso);
  if (totalElapsed != null) {
    const remaining = Math.round((deadline - totalElapsed) * 10) / 10;
    console.log(`⏱ 전체 경과 : ${totalElapsed}분 / ${deadline}분  (남음 ${remaining}분)`);
  } else {
    console.log(`⏱ 전체 경과 : 미시작  (마감 예산 ${deadline}분)`);
  }
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
  // 완료 단계별 걸린 시간 (기록된 actualMinutes)
  const done = state.completedStages || [];
  if (done.length) {
    line();
    console.log("완료 단계 시간:");
    let sum = 0;
    for (const s of done) {
      const a = typeof s.actualMinutes === "number" ? s.actualMinutes : null;
      if (a != null) sum += a;
      const budget = s.budgetMinutes != null ? ` / 예산 ${s.budgetMinutes}분` : "";
      const over = a != null && s.budgetMinutes != null && a > s.budgetMinutes ? "  ⚠초과" : "";
      console.log(`  ✓ Stage ${s.stageNumber} (${s.stageId}) : ${a != null ? `${a}분` : "-"}${budget}${over}`);
    }
    console.log(`  합계 : ${Math.round(sum * 10) / 10}분`);
  }
  if ((state.blockedBy || []).length) {
    line();
    console.log("blockedBy:");
    for (const b of state.blockedBy) console.log(`  ✗ ${b}`);
  }
  line();
}
