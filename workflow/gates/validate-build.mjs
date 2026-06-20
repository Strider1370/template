// workflow/gates/validate-build.mjs — Stage 05 Parallel Build 게이트 (enforced)
// 검증: `npm run web:build` 실행. exit 0 이면 pass. 실패 시 마지막 로그 일부 표시.
import { execSync } from "node:child_process";
import { ROOT, gateResult } from "../lib.mjs";

let buildOk = false;
let buildNote;
try {
  // stdio inherit: 빌드 로그를 그대로 보여준다(오래 걸릴 수 있음).
  execSync("npm run web:build", { cwd: ROOT, stdio: "inherit" });
  buildOk = true;
  buildNote = "npm run web:build 가 성공적으로 종료(exit 0).";
} catch (err) {
  buildOk = false;
  // stdio inherit 이라 캡처된 출력은 없을 수 있음 — 종료 상태만 보고.
  const tail = (err.stdout || err.stderr || "").toString().split("\n").slice(-20).join("\n");
  buildNote = `npm run web:build 실패 (exit ${err.status ?? "?"}).` + (tail ? `\n  마지막 로그:\n${tail}` : " 위 inherit 로그를 확인하라.");
}

// 스캐폴드 자리표시(서비스명·nav·타이틀·footer) 교체 검사 — 남아 있으면 게이트 실패.
let identityOk = false;
let identityNote;
try {
  execSync("npm run web:check-identity", { cwd: ROOT, stdio: "inherit" });
  identityOk = true;
  identityNote = "스캐폴드 자리표시가 모두 실제 서비스 정체성으로 교체됨.";
} catch {
  identityOk = false;
  identityNote = "스캐폴드 자리표시가 남아 있음 — 위 [check-identity] 목록을 서비스명/nav/타이틀로 교체하라.";
}

const ok = buildOk && identityOk;
gateResult("build", ok, {
  checks: [
    { label: "npm run web:build exit 0", ok: buildOk },
    { label: "스캐폴드 자리표시 교체(web:check-identity)", ok: identityOk },
  ],
  notes: [buildNote, identityNote],
});
