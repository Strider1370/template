#!/usr/bin/env node
/**
 * generate-static-html.mjs — deck.json → presentation/output/static/presentation.html
 *
 * ⚠️ 스켈레톤(스캐폴드). 단일 HTML 백업 생성 로직 미구현 — Stage 09 첫 실사용 때 완성.
 * 현재는 deck.json 을 읽고 점검하며 안내만 출력한다(throw 금지, 파일 미생성).
 *
 * 완성 시 책임 (Doc2 §12):
 *  - 동일한 deck.json 사용(엔진별 내용 중복 작성 금지)
 *  - theme/notion/{tokens,typography,components}.css 를 <style> 로 인라인 → 인터넷 없이 단일 파일 시연
 *  - 자산은 로컬 복사/인라인(외부 URL 금지, Doc2 §17 #9·#10)
 *  - 우선 지원 semantic layout: hero, contrast, card-grid, demo-fullscreen,
 *    before-after, limitation-guardrail, closing (renderers["notion-html"] 매핑)
 *  - Slidev build 실패/오프라인 대비 최소 기능 백업
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const presentationRoot = resolve(__dirname, "..");
const deckPath = resolve(presentationRoot, "deck.json");
const registryPath = resolve(__dirname, "layout-registry.json");
const outPath = resolve(presentationRoot, "output", "static", "presentation.html");

const BANNER = "[generate-static-html] 아직 미구현(스캐폴드) — Stage 09 첫 실사용 때 완성";

if (!existsSync(deckPath)) {
  console.log(BANNER);
  console.log(`  입력 없음: ${deckPath} (deck.json 생성 후 다시 실행)`);
  process.exit(0);
}

const deck = JSON.parse(readFileSync(deckPath, "utf8"));
const registry = JSON.parse(readFileSync(registryPath, "utf8"));
const rendererByLayout = new Map(
  registry.layouts.map((l) => [l.semanticId, l.renderers["notion-html"]])
);

console.log(BANNER);
console.log(`  입력 읽음: ${deckPath} (slides ${deck.slides?.length ?? 0}개)`);
console.log(`  출력 예정: ${outPath}`);
for (const s of deck.slides ?? []) {
  const cls = rendererByLayout.get(s.semanticLayout) ?? "default";
  console.log(`    ${s.id} ${s.semanticLayout} → notion-html:section.${cls}`);
}

// TODO(Stage 09): theme/notion CSS 인라인 + slide 섹션 HTML 조립 후
//   mkdirSync(dirname(outPath), {recursive:true}); writeFileSync(outPath, html).
console.log("  (presentation.html 미생성 — 렌더 로직 미구현)");
process.exit(0);
