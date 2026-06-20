# sources/notion-original/ — Notion HTML 원본 템플릿 보관소

> Doc2 §4. **원본 자산은 분석·추출에만 쓴다. 직접 덮어쓰지 않는다.**

## 무엇을 두나
- 보유한 **Notion 스타일 HTML 템플릿 원본**(`.html` / 동반 CSS·이미지).
- 추출 대상: 폰트, 크기 체계, 행간, 배경색, 카드색, 강조색, 경계선, 그림자, radius,
  섹션 여백, 표, 인용문, 이미지 프레임, 헤더/푸터 (Doc2 §7.1).

## 어떻게 쓰나
1. 원본을 여기 그대로 둔다(수정 금지).
2. 분석해 디자인 토큰을 뽑아 → `presentation/theme/notion/`
   (`tokens.css` / `typography.css` / `components.css` / `theme.json`)에 **이식**한다.
3. 원본은 변경하지 않고, 결과물(theme/)만 수정한다.

## 현재 상태
- 비어 있음(스캐폴드). 시드 토큰은 `presentation/marp/themes/propca-notion-style.css`에서
  먼저 추출해 `theme/notion/tokens.css`에 반영해 둠.
- Notion HTML 원본을 확보하면 여기에 넣고 위 절차로 토큰을 보강한다.

## 출처/라이선스
새 원본을 넣으면 `../ASSET_LICENSES.md` 와 `../provenance.json` 에 출처를 기록한다.
