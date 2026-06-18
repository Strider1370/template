# Stage 09 — Presentation Generation (발표자료 생성)

## 1. 목적
발표 스크립트를 슬라이드로 만든다. **방식 = 반자동(B안):** 판단(슬라이드에 무엇을 담나)은 AI가 `deck.json`을 직접 작성하고, 변환(슬라이드/HTML 렌더)은 렌더러가 자동 처리한다. Slidev(기본) + Notion 정적 HTML(오프라인 백업) 둘 다 같은 `deck.json` 하나로 생성한다.

## 2. 시작 조건
- Stage 08 Gate 통과, `presentation/script.md`·`presentation/qna.md`·`implementation/manifest.json` 존재.

## 3. 이번 단계에서 반드시 읽을 파일
- `presentation/script.md`, `implementation/manifest.json`, Stage 07 캡처 목록, `presentation/generator/layout-registry.json`(16 layout·slot), `concept.md`(척추)
  - 레이아웃 어휘 참조(선택): `presentation/slidev/presets/GALLERY.md` — BaizeAI 카드 언어 12종(생성기가 자동 적용). 미리보기는 `presentation/slidev/presets-preview.md`. 16 semantic 밖의 커스텀 슬라이드를 손으로 짤 때 스니펫을 복사해 쓴다.
- guidance: `docs/CLAUDE_Notion_Slidev_Integration_Guide.md` §8(공통 Semantic Layout)·§9(중간 데이터 계약)·§10(레이아웃 선택)·§11(Slidev 생성)·§12(Notion Static HTML). 이 섹션만.

## 4. 이번 단계에서 읽지 않아도 되는 파일
- 리서치 원문, AI_Hackathon_OS 사고기준, 타 단계 history.

## 5. 필수 입력
- `presentation/script.md`, `implementation/manifest.json`. 없으면 시작하지 않는다.

## 6. 메인 에이전트의 역할 — B안 흐름
1. **deck.json 작성(판단).** `script.md`를 슬라이드로 분해해 `presentation/deck.json`을 직접 쓴다. 각 슬라이드:
   - `semanticLayout`은 `layout-registry.json`의 16개 중에서만 고른다(임의 layout 금지). 규칙(§10): answer-first→hero, demo+wow→demo-callout, insight→contrast/insight-statement, impact+숫자→big-number, 한계→limitation-guardrail, 마지막→closing.
   - `content` 슬롯은 해당 layout의 slot 이름에 맞춰 채운다.
   - `assets` 이미지는 **Stage 07 실제 앱 캡처 우선**(목업보다). 각 자산은 `{ "src": "...", "status": "real|placeholder" }`.
   - `speakerNotes` 반드시 포함. `durationSeconds` 배분(데모+킥 ≥50%).
   - `implementationStatus`가 implemented가 아니면 표시(mocked/fallback) 또는 제거(dropped/blocked) — manifest 기준.
   - **Closing 문구 = `concept.md`의 "기억에 남을 마지막 문장".**
   - `meta.engine`="slidev", `meta.presentationMinutes`는 state.yaml 값 반영.
2. **검증.** `npm run presentation:validate-deck` (미등록 layout·필수필드·primary 엔진 검사).
3. **렌더(자동).** `npm run presentation:slidev`(→ `presentation/slidev/slides.md`) + `npm run presentation:static`(→ `output/static/presentation.html`, 편집 오버레이 내장). **둘 다 같은 deck.json 하나로 동시 생성** — `npm run presentation:build` 한 번이면 Slidev·Notion 양쪽이 함께 나온다.
4. **정합 검증.** `npm run presentation:validate-slides` (slides.md ↔ deck.json 슬라이드 수 일치).
5. **Slidev 빌드·프리뷰(기본 발표 매체).** `cd presentation/slidev && npm install && npm run build`(또는 `npm run dev` 로 localhost 프리뷰 — 실제 발표는 이 화면). **이게 default.** Slidev 빌드가 막힐 때만 Notion 정적 HTML로 시연(폴백).
6. **사람이 다듬기(보조).** 빠른 필드 지정·편집 피드백이 필요하면 Notion 정적 HTML의 편집 오버레이(`presentation/output/static/presentation.html?edit=1`)를 연다 — 번호/주소 배지·클릭복사·오버플로우경고·편집맵 내보내기. 사용자가 주소(예: `slide-04.content.callout`)로 지칭하면 deck.json의 그 필드를 고치고 3·5·7을 다시 돌린다. (발표 자체는 Slidev로 한다.)
7. **캡처 보고 크기 맞추기(LLM 루프).** **렌더 → `npm run presentation:capture`(= Slidev 빌드·캡처가 기본, 미설치 시 Notion HTML 폴백) → 캡처(`presentation/output/captures/NN-<layout>.png`)를 *직접 보고* 슬라이드별 `contentScale`(deck.json slide 속성, 0.5~2, 미지정=1)과 내용을 조정 → 재렌더**. 1~2회 반복.
   - 원칙: **내용을 공간에 맞추지 말고(억지 채움 금지), 공간을 내용에 맞춰라** — 여백이 많으면 `contentScale`로 키우고, 빽빽하거나 오버플로우면 줄여라.
   - `contentScale`(기본 1=변화 없음): **Slidev는 본문 블록 전체를 `zoom`으로 키우고/줄인다(슬라이드 여백은 고정).** Notion 폴백은 본문 글자만 배율 조정.

> `npm run presentation:build` = validate-deck → slidev → static → validate-slides 한 번에.

## 7. 병렬 서브에이전트 구성
- 없음(deck.json 작성은 판단 집약). 렌더는 스크립트가 처리.

## 8. 각 서브에이전트의 작업 계약
- 해당 없음.

## 9. 생성해야 하는 산출물
- `presentation/deck.json`(단일 계약), `presentation/slidev/slides.md`, `presentation/output/static/presentation.html`(+ 선택 `output/slidev/`).

## 10. 파일 소유권
- 메인 전용: `presentation/deck.json`. 렌더 산출물은 스크립트가 생성.

## 11. 제한 시간
- 20분. 초과 시 슬라이드 수를 줄이되(데모+킥 보존) deck.json→렌더 흐름은 유지.

## 12. 완료 조건
- deck.json(검증 통과) + slides.md(정합) + output/static/presentation.html 존재. speakerNotes 모든 슬라이드 포함.

## 13. 기계적 Gate (Mechanical)
- 명령: `npm run gate:presentation-generation`
- 분류: **enforced**. deck.json 파싱·slides.md·정적 HTML 산출물 존재 검사. (deck 무결성/슬라이드 정합은 presentation:validate-deck/-slides로 보강)

## 14. LLM Review Gate
- `npm run cross-review -- presentation/deck.json` (Codex 우선 → 클로드 폴백).
- 검토: 실제 캡처 우선 적용, 미구현 기능 과장 없음(manifest), 데모 슬라이드 비중, 레이아웃 반복, 척추(concept.md)와 일치.

## 15. 사용자 승인 여부
- `humanApproval: false`. (단 편집 오버레이로 사람 피드백 반영 루프 권장)

## 16. 실패 시 폴백
- 렌더러가 막히면 정적 HTML만이라도 확보(라이브는 HTML로). 그래도 안 되면 기존 `presentation/marp`·`reveal`로 수기 작성(대체 엔진, 보존됨).

## 17. 다음 단계에 전달할 정보
- `presentation/deck.json`, `slides.md`, `output/` (Stage 10 검증 입력).

## 18. 금지 사항
- 등록 안 된 layout 임의 생성 금지(Doc2 §17 #2). deck.json 엔진별 중복 작성 금지.
- 실제 캡처가 있으면 목업 우선 금지(캡처 우선). 외부 URL 자산 금지(로컬 복사).
- 미구현 기능을 implemented처럼 표현 금지.

## 19. 단계 완료 보고 형식
- `workflow/templates/stage-report.md` → `workflow/history/stage-09-presentation-generation.md`.
