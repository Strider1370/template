/**
 * theme/slidev/theme-entry.ts — Slidev 테마 진입점 (최소 스캐폴드).
 *
 * Notion 디자인 토큰(theme/notion/tokens.css)을 Slidev 측에서 참조하기 위한 자리.
 * ※ Stage 09 첫 실사용 때 실제 Slidev 테마 패키징(layouts/, components/, styles/)과 연결.
 *
 * Slidev 테마 규약상 styles/index.ts 또는 setup/ 에서 토큰 CSS 를 import 한다.
 * 여기서는 경로 상수만 노출한다(빌드 의존성 추가 없이 안전).
 */

export const notionTokensPath = "../notion/tokens.css";
export const notionTypographyPath = "../notion/typography.css";
export const notionComponentsPath = "../notion/components.css";

/**
 * layout-registry.json 의 renderers.slidev 값과 매칭되는 Slidev layout 이름들.
 * TODO(Stage 09): 실제 커스텀 layout 을 layouts/ 에 추가하고 여기에 등록.
 */
export const slidevLayouts = [
  "cover",
  "default",
  "two-cols",
  "image",
  "image-right",
  "center",
  "statement",
  "quote",
  "end",
] as const;

export default {
  /* TODO(Stage 09): Slidev 테마 config(fonts, defaults) 정의. */
};
