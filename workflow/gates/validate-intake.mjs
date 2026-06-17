// workflow/gates/validate-intake.mjs — Stage 00 Intake 게이트 (checklist)
// 정책: 필수파일 존재 + 자가점검 체크리스트 출력 후 통과.
import { checklistGate } from "../lib.mjs";

checklistGate(
  "intake",
  ["workflow/decisions/intake.yaml"],
  [
    "주제(topic)가 기록되었는가",
    "제약 조건(constraints)이 기록되었는가",
    "발표 시간 / 구현 시간 예산이 기록되었는가",
    "사용 가능한 저장소 자산을 확인했는가",
  ],
);
