// workflow/scripts/status.mjs — 현재 상태 요약. 새 세션이 가장 먼저 실행한다.
// 사용: node workflow/scripts/status.mjs
import { readState } from "../lib.mjs";
import { printStatusSummary } from "./_common.mjs";

try {
  const state = readState();
  console.log("\n[workflow:status] 현재 상태");
  printStatusSummary(state);
} catch (err) {
  console.error("상태를 읽지 못했습니다:", err.message);
  process.exit(1);
}
