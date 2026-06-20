// workflow/scripts/handoff.mjs — 현재 단계 Handoff 보고서를 자동 생성한다.
//
// 기계가 채우는 부분(자동): 시작/종료/사용 시간, 바뀐 파일(git diff), 커밋 목록,
//   게이트 결과(리포트에서 PASS/FAIL 추출), 승인 상태, HEAD.
// 사람이 채우는 부분(<!-- 직접 채우기 --> 표시): 완료 내용 다듬기 + 결정 + 위험 1~2줄.
//
// 사용: node workflow/scripts/handoff.mjs [--force]
//   기본은 이미 있으면 덮어쓰지 않는다(사람이 채운 내용 보존). --force 로 강제.
import { execSync } from "node:child_process";
import { existsSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { readState, ROOT } from "../lib.mjs";
import { now, minutesBetween, currentStage, handoffPathFor, gateForStage } from "./_common.mjs";

function git(cmd) {
  try {
    return execSync(`git ${cmd}`, { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

try {
  const force = process.argv.includes("--force");
  const state = readState();
  const stage = currentStage(state);
  if (!stage) {
    console.error("current 단계를 stages.yaml 에서 찾지 못했습니다.");
    process.exit(1);
  }

  const rel = handoffPathFor(stage);
  const abs = join(ROOT, rel);
  if (existsSync(abs) && !force) {
    console.log(`[workflow:handoff] 이미 있음: ${rel}`);
    console.log("  덮어쓰려면 --force. (사람이 채운 내용을 보존하려고 기본은 덮지 않음)");
    process.exit(0);
  }

  const num = String(stage.number).padStart(2, "0");
  const startedAt = state.current.startedAt;
  const endedAt = now();
  const used = minutesBetween(startedAt, endedAt);
  const budget = stage.budgetMinutes;
  const over = used != null && budget != null && used > budget ? "  ⚠ 예산 초과" : "";

  // 직전 체크포인트(이전 단계) → 지금까지 바뀐 파일 + 커밋 목록
  const prev = state.lastSuccessfulCheckpoint?.commit || null;
  const head = git("rev-parse --short HEAD");
  const changed = (prev ? git(`diff --name-only ${prev}`) : git("diff --name-only HEAD")) || "";
  const files = changed.split("\n").map((s) => s.trim()).filter(Boolean);
  const commits = (prev ? git(`log --oneline ${prev}..HEAD`) : git("log --oneline -5")) || "";
  const commitLines = commits.split("\n").map((s) => s.trim()).filter(Boolean);

  // 게이트 결과: 리포트 파일에서 PASS/FAIL 추출 시도
  const gate = gateForStage(stage);
  let gateResult = "미확인";
  const gateReportAbs = join(ROOT, gate.report);
  if (existsSync(gateReportAbs)) {
    const t = readFileSync(gateReportAbs, "utf8");
    if (/\bPASS\b/.test(t)) gateResult = "PASS";
    else if (/\bFAIL\b/.test(t)) gateResult = "FAIL";
  }

  const ha = state.humanApproval || {};
  const approvalLine = ha.required
    ? `승인 필요 — 상태: ${ha.status}${ha.decisionFile ? ` (decision: ${ha.decisionFile})` : ""}`
    : "승인 불필요";

  const fileBlock = files.length ? files.map((f) => `- ${f}`).join("\n") : "- (변경 파일 없음/감지 안 됨)";
  const commitBlock = commitLines.length ? commitLines.map((c) => `- ${c}`).join("\n") : "- (커밋 없음)";

  const md = `<!-- Handoff 보고서 (자동 생성: npm run workflow:handoff). 기계가 채운 부분 + <!-- 직접 채우기 --> 2~3곳만 사람이 보강. -->
# Stage ${num} 완료 보고 — ${stage.id}

## 단계
Stage ${stage.number} — ${stage.id}

## 시작 시각 / 종료 시각 / 사용 시간
- 시작: ${startedAt || "(미기록)"}
- 종료: ${endedAt}
- 사용: ${used != null ? `${used}분` : "(계산 불가)"} (예산 ${budget ?? "-"}분)${over}

## 완료한 내용
<!-- 직접 채우기: 한 일 1~3줄. 아래 커밋 목록을 참고해 다듬어라. -->
${commitBlock}

## 생성·수정한 파일
${fileBlock}

## 서브에이전트 실행 결과
<!-- 직접 채우기: 병렬 실행했으면 역할별 completed/blockers. 단독이면 "메인 단독 실행". -->

## Gate 결과
- 명령: ${gate.command}
- 결과: ${gateResult}
- 리포트: ${gate.report}

## 사용자 결정
${approvalLine}

## 적용한 폴백
<!-- 직접 채우기: 없으면 "없음". -->
-

## 남아 있는 위험
<!-- 직접 채우기(중요): 다음 단계가 알아야 할 위험 1~2줄. -->
-

## 확정된 계약
<!-- 직접 채우기: 이후 단계가 바꾸면 안 되는 것(없으면 생략). -->

## 다음 단계가 읽어야 할 파일
<!-- 직접 채우기 또는 다음 단계 requiredReads 참조. -->
-

## 다음 단계에서 하지 말아야 할 것
<!-- 직접 채우기. -->
-

## 체크포인트
- HEAD: ${head || "(git 없음)"}
`;

  writeFileSync(abs, md, "utf8");
  console.log(`\n[workflow:handoff] 자동 생성: ${rel}`);
  console.log(`  시간 ${used != null ? `${used}분` : "?"} / 예산 ${budget ?? "-"}분${over}, 바뀐 파일 ${files.length}개, 커밋 ${commitLines.length}개 채움.`);
  console.log("  → 남은 일: '완료한 내용' 다듬기 + '결정/위험' 1~2줄 채우고  npm run workflow:complete");
  console.log("");
} catch (err) {
  console.error("handoff 생성 실패:", err.message);
  process.exit(1);
}
