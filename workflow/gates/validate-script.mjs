// workflow/gates/validate-script.mjs — Stage 08 Script 게이트 (checklist)
import { checklistGate } from "../lib.mjs";

checklistGate(
  "script",
  ["presentation/script.md", "presentation/qna.md"],
  [
    "실제 구현된 기능만 주장하는가 (manifest.json 기준)",
    "데모와 킥(차별점)에 최소 50% 시간을 배분했는가",
    "5분(발표 시간) 안에 들어오는가",
    "Q&A 초안이 준비되었는가",
  ],
);
