// workflow/gates/validate-research.mjs — Stage 01 Parallel Research 게이트 (checklist)
// 정책: 필수파일 존재 + 자가점검 체크리스트. 추가로 해외사례/출처 수를 안내로 측정.
import { checkFiles, gateResult, readText } from "../lib.mjs";

const required = [
  "research/integrated-findings.md",
  "research/sources.json",
  "research/overseas.md",
];
const checks = checkFiles(required);

// 안내용 측정: 해외사례 ≥3, 출처 기록 여부 (실패시키지 않고 notes 로만 표시)
const notes = [
  "체크리스트 게이트(자가점검). 아래를 사람/에이전트가 확인했다고 간주하고 통과:",
  "  ☐ 해외 사례를 최소 3개 이상 조사했는가",
  "  ☐ 모든 출처를 sources.json 에 기록했는가",
  "  ☐ integrated-findings 에 통합 인사이트가 정리되었는가",
];

const sources = readText("research/sources.json");
if (sources) {
  try {
    const parsed = JSON.parse(sources);
    const arr = Array.isArray(parsed) ? parsed : parsed.sources ?? [];
    notes.push(`  • 측정: sources.json 출처 ${Array.isArray(arr) ? arr.length : "?"}건`);
  } catch {
    notes.push("  • 측정: sources.json 이 JSON.parse 안 됨 (형식 확인 권장)");
  }
}
const overseas = readText("research/overseas.md");
if (overseas) {
  const cases = (overseas.match(/^#{2,3}\s/gm) || []).length;
  notes.push(`  • 측정: overseas.md 해외사례 헤딩 약 ${cases}개 (목표 ≥3)`);
}

const ok = checks.every((c) => c.ok);
gateResult("research", ok, { checks, notes });
