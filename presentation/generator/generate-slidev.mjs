#!/usr/bin/env node
/**
 * generate-slidev.mjs — deck.json → presentation/slides.md (Slidev)
 *
 * ⚠️ 스켈레톤(스캐폴드). 슬라이드 마크다운 생성 로직 미구현 — Stage 09 첫 실사용 때 완성.
 * 현재는 deck.json 을 읽고 구조만 점검하며 안내만 출력한다(throw 금지, 파일 미생성).
 *
 * 완성 시 책임 (Doc2 §11):
 *  - deck.meta → headmatter(frontmatter): theme, aspectRatio(16:9), title, lang
 *  - 각 slide:
 *      semanticLayout → layout-registry.renderers.slidev 로 engineLayout 결정
 *      content slot → 기존 layout/component/style 재사용해 마크다운 본문 생성
 *      assets → 로컬 경로 이미지 삽입(실제 앱 캡처 우선)
 *      speakerNotes → Slidev 발표자 노트(<!-- ... -->) 로 반드시 포함
 *      implementationStatus != implemented → mocked/fallback 표시, dropped/blocked 제거
 *  - 슬라이드 사이 '---' 구분자
 *  - 슬라이드별 독립 CSS 대량 생성 금지(테마/토큰 재사용)
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const presentationRoot = resolve(__dirname, "..");
const deckPath = resolve(presentationRoot, "deck.json");
const registryPath = resolve(__dirname, "layout-registry.json");
const outPath = resolve(presentationRoot, "slides.md");

const BANNER = "[generate-slidev] 아직 미구현(스캐폴드) — Stage 09 첫 실사용 때 완성";

if (!existsSync(deckPath)) {
  console.log(BANNER);
  console.log(`  입력 없음: ${deckPath} (deck.json 생성 후 다시 실행)`);
  process.exit(0);
}

const deck = JSON.parse(readFileSync(deckPath, "utf8"));
const registry = JSON.parse(readFileSync(registryPath, "utf8"));
const rendererByLayout = new Map(
  registry.layouts.map((l) => [l.semanticId, l.renderers.slidev])
);

console.log(BANNER);
console.log(`  입력 읽음: ${deckPath} (slides ${deck.slides?.length ?? 0}개)`);
console.log(`  출력 예정: ${outPath}`);
for (const s of deck.slides ?? []) {
  const engineLayout = s.engineLayout ?? rendererByLayout.get(s.semanticLayout) ?? "default";
  console.log(`    ${s.id} ${s.semanticLayout} → slidev:${engineLayout}`);
}

// TODO(Stage 09): headmatter + slide 본문 + speaker notes 생성 후 writeFileSync(outPath).
console.log("  (slides.md 미생성 — 렌더 로직 미구현)");
process.exit(0);
