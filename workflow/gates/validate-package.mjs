// workflow/gates/validate-package.mjs — Stage 12 Package 게이트 (checklist)
// 필수: dist/submission/ 디렉터리. 점검: 제출 패키지 구성요소 포함 여부.
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { ROOT, gateResult } from "../lib.mjs";

const subAbs = join(ROOT, "dist/submission");
const dirOk = existsSync(subAbs) && statSync(subAbs).isDirectory();
const checks = [{ label: "exists: dist/submission/ (디렉터리)", ok: dirOk }];

const notes = [
  "체크리스트 게이트(자가점검). 아래를 사람/에이전트가 확인했다고 간주하고 통과:",
  "  ☐ web/ (앱)",
  "  ☐ presentation.html",
  "  ☐ presentation.pdf",
  "  ☐ 데모 영상 (demo.webm 또는 demo.mp4)",
  "  ☐ README.md",
  "  ☐ qna.md",
  "  ☐ sources.md (sources.json 기반 생성)",
  "  ☐ spec.md",
];

gateResult("package", dirOk, { checks, notes });
