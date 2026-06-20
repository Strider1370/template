// workflow/gates/validate-rehearsal.mjs — Stage 11 Rehearsal 게이트 (checklist)
// 필수 파일 없음(점검 중심). 사용자 최종 승인(humanApproval) 필요.
import { checklistGate } from "../lib.mjs";

checklistGate(
  "rehearsal",
  [],
  [
    "실제 낭독 시간을 측정했는가 (발표 시간 제한 이내)",
    "라이브 데모 → 영상 폴백 전환이 준비되었는가",
    "Q&A 대비가 되었는가",
    "사용자 최종 승인(humanApproval)을 받았는가",
  ],
);
