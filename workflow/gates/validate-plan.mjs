// workflow/gates/validate-plan.mjs — Stage 04 Implementation Plan 게이트 (checklist)
import { checklistGate } from "../lib.mjs";

checklistGate(
  "plan",
  ["plan.md", "workflow/decisions/file-ownership.yaml"],
  [
    "작업 분해(Work Breakdown)가 있는가",
    "각 기능마다 폴백(fallback)이 정해졌는가",
    "파일 소유권(file-ownership)으로 충돌 방지가 되었는가",
    "외부 연동 폴백이 명시되었는가",
  ],
);
