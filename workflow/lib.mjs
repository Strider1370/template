// workflow/lib.mjs — 상태 전환 스크립트와 게이트가 공유하는 헬퍼.
// 의존성: js-yaml (루트 package.json). 모든 경로는 레포 루트 기준.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const STATE_PATH = join(ROOT, "workflow/state.yaml");
export const STAGES_PATH = join(ROOT, "workflow/stages.yaml");

export const VALID_STATUS = [
  "not_started", "in_progress", "blocked", "awaiting_approval",
  "awaiting_direction", "gate_failed", "completed",
];

export function readState() {
  return yaml.load(readFileSync(STATE_PATH, "utf8"));
}

export function writeState(state) {
  state.lastUpdatedAt = new Date().toISOString();
  writeFileSync(STATE_PATH, yaml.dump(state, { lineWidth: 100, noRefs: true }));
}

export function readStages() {
  return yaml.load(readFileSync(STAGES_PATH, "utf8"));
}

export function getStage(ref) {
  const { stages } = readStages();
  return stages.find((s) => s.id === ref || s.number === Number(ref));
}

export function nextStage(numberOrId) {
  const cur = getStage(numberOrId);
  if (!cur) return null;
  return getStage(cur.number + 1);
}

// 게이트 정책: 이 게이트가 실로직(enforced)인가 체크리스트인가
export function gatePolicy(stageId) {
  const { gatePolicy: gp } = readStages();
  if (!gp) return "checklist";
  return gp.enforced?.includes(stageId) ? "enforced" : "checklist";
}

// 게이트 공통 출력 + 종료코드. ok=false면 exit 1.
export function gateResult(stageId, ok, { checks = [], notes = [] } = {}) {
  const tag = ok ? "PASS" : "FAIL";
  console.log(`\n[gate:${stageId}] ${tag}`);
  for (const c of checks) console.log(`  ${c.ok ? "✓" : "✗"} ${c.label}`);
  for (const n of notes) console.log(`  • ${n}`);
  if (!ok) {
    console.log(`\n→ Gate 실패. state.yaml.current.status 를 gate_failed 로 두고, 위 ✗ 항목을 고친 뒤 재실행.`);
  }
  process.exit(ok ? 0 : 1);
}

// 필수 파일 존재 검사 → [{label, ok}]
export function checkFiles(paths) {
  return paths.map((p) => ({ label: `exists: ${p}`, ok: existsSync(join(ROOT, p)) }));
}

// 파일에 필수 섹션 문자열이 모두 있는가
export function checkSections(relPath, sections) {
  const abs = join(ROOT, relPath);
  if (!existsSync(abs)) return sections.map((s) => ({ label: `${relPath} :: ${s}`, ok: false }));
  const text = readFileSync(abs, "utf8");
  return sections.map((s) => ({ label: `${relPath} :: "${s}"`, ok: text.includes(s) }));
}

export function readText(relPath) {
  const abs = join(ROOT, relPath);
  return existsSync(abs) ? readFileSync(abs, "utf8") : null;
}

export function writeReport(relPath, content) {
  const abs = join(ROOT, relPath);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content);
}

// 체크리스트 게이트: 필수 파일만 존재하면 통과 + 점검목록을 안내로 출력
export function checklistGate(stageId, requiredFiles, checklist = []) {
  const checks = checkFiles(requiredFiles);
  const ok = checks.every((c) => c.ok);
  gateResult(stageId, ok, {
    checks,
    notes: [
      "체크리스트 게이트(자가점검). 아래를 사람/에이전트가 확인했다고 간주하고 통과:",
      ...checklist.map((c) => `  ☐ ${c}`),
    ],
  });
}
