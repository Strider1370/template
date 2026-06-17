// workflow/gates/validate-build.mjs — Stage 05 Parallel Build 게이트 (enforced)
// 검증: `npm run web:build` 실행. exit 0 이면 pass. 실패 시 마지막 로그 일부 표시.
import { execSync } from "node:child_process";
import { ROOT, gateResult } from "../lib.mjs";

let ok = false;
let note;
try {
  // stdio inherit: 빌드 로그를 그대로 보여준다(오래 걸릴 수 있음).
  execSync("npm run web:build", { cwd: ROOT, stdio: "inherit" });
  ok = true;
  note = "npm run web:build 가 성공적으로 종료(exit 0).";
} catch (err) {
  ok = false;
  // stdio inherit 이라 캡처된 출력은 없을 수 있음 — 종료 상태만 보고.
  const tail = (err.stdout || err.stderr || "").toString().split("\n").slice(-20).join("\n");
  note = `npm run web:build 실패 (exit ${err.status ?? "?"}).` + (tail ? `\n  마지막 로그:\n${tail}` : " 위 inherit 로그를 확인하라.");
}

gateResult("build", ok, {
  checks: [{ label: "npm run web:build exit 0", ok }],
  notes: [note],
});
