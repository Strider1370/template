#!/usr/bin/env node
/**
 * validate-slides.mjs — slides.md 존재 + 슬라이드 개수가 deck.json 과 일치하는지 검증한다.
 *
 * 실동작 스크립트(스켈레톤 아님).
 * Slidev 의 슬라이드 구분자는 '---' (frontmatter 와 구분).
 * 첫 frontmatter 블록을 제외하고 '---' 구분자 개수 + 1 = 슬라이드 수로 센다.
 *
 * 사용: node presentation/generator/validate-slides.mjs [slides.md] [deck.json]
 * 기본 대상: presentation/slides.md, presentation/deck.json
 * exit code: 통과 0 / 실패 1
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const presentationRoot = resolve(__dirname, "..");

const slidesPath = process.argv[2]
  ? resolve(process.cwd(), process.argv[2])
  : resolve(presentationRoot, "slides.md");
const deckPath = process.argv[3]
  ? resolve(process.cwd(), process.argv[3])
  : resolve(presentationRoot, "deck.json");

const errors = [];
const fail = (m) => errors.push(m);

let md;
try {
  md = readFileSync(slidesPath, "utf8");
} catch {
  fail(`slides.md 를 찾을 수 없음: ${slidesPath}`);
}

/**
 * Slidev slides.md 슬라이드 개수 계산.
 * - 줄 단위로 '---' 만 있는 라인을 구분자로 본다(앞뒤 공백 허용).
 * - 파일 맨 앞 frontmatter(--- ... ---)는 첫 슬라이드의 헤더이므로 별도 처리.
 */
function countSlides(text) {
  const lines = text.split(/\r?\n/);
  const sepIdx = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^---\s*$/.test(lines[i])) sepIdx.push(i);
  }
  // 맨 앞 frontmatter: line 0 이 '---' 이고 그 뒤 다른 '---' 로 닫히는 경우 두 개를 frontmatter 로 소비
  let separators = sepIdx.length;
  let slideCount;
  if (sepIdx.length >= 2 && sepIdx[0] === 0) {
    // 첫 두 구분자는 headmatter → 슬라이드 = 남은 구분자 + 1
    slideCount = separators - 2 + 1;
  } else {
    slideCount = separators + 1;
  }
  return Math.max(slideCount, 1);
}

let deckCount = null;
if (errors.length === 0) {
  try {
    const deck = JSON.parse(readFileSync(deckPath, "utf8"));
    deckCount = Array.isArray(deck.slides) ? deck.slides.length : null;
    if (deckCount === null) fail("deck.json 의 slides 가 배열이 아님");
  } catch (e) {
    fail(`deck.json 읽기/파싱 실패(${deckPath}): ${e.message}`);
  }
}

if (errors.length === 0) {
  const mdCount = countSlides(md);
  if (mdCount !== deckCount) {
    fail(
      `슬라이드 개수 불일치 — slides.md: ${mdCount}장, deck.json: ${deckCount}장`
    );
  } else {
    console.log(`[validate-slides] PASS — ${mdCount}장 일치.`);
    process.exit(0);
  }
}

console.error("[validate-slides] FAIL");
for (const e of errors) console.error("  - " + e);
process.exit(1);
