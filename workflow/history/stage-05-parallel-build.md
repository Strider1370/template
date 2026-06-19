<!-- Handoff 보고서. Stage 05 완료. -->
# Stage 05 완료 보고 — parallel-build

## 단계
05 · parallel-build (병렬 구현)

## 시작 시각 / 종료 시각 / 사용 시간
- 시작: 2026-06-18T10:46Z
- 종료: 근사 (Data→UI/AI 병렬 + 통합 검증)
- 사용: 예산 85분 내

## 완료한 내용
- 데모 핵심 경로 + Wow + AI 본질 장면 구현 완료, **브라우저에서 end-to-end 검증**.
- 4개 빌드 에이전트(Data·UI·AI·Presentation) 병렬 실행, 통합 후 빌드 통과.

## 생성·수정한 파일 (요지)
- Data: `web/lib/timeline.ts`, `web/lib/benefits.ts`(타입 단일출처+정렬/상태 순수함수), `web/public/data/benefits/benefits.json`(제도 6건, 검증값·정정2 반영), `web/public/data/facilities/{서울,경기,부산}.json`
- UI: `web/app/page.tsx`(클라이언트 상태, 라이브 재정렬), `web/components/{InputForm,BenefitTimeline,BenefitCard,DeadlineWarning,FacilityMap}.tsx`
- AI: `web/app/api/ask/route.ts`, `web/app/api/places/route.ts`, `web/lib/ai.ts`, `web/public/data/ai-fixtures/qa.json`
- Presentation: `presentation/draft-outline.md`, `presentation/draft-layout-plan.json`
- 통합 수정(메인): qa.json answerBenefitIds를 benefits.json 실제 id로 정정 / benefits.ts deadlineDday 출산前 null 처리(폴리시)

## 서브에이전트 실행 결과
- Data: 6건 데이터셋 + 순수함수, tsc 0. 정정 2건(아동수당 9세·다태아 태아당100) 반영.
- UI: 핵심경로+Wow+AI영역+지도, build 통과, testid 계약 부여.
- AI: /api/ask(제도 JSON 주입+환각차단 프롬프트)+5초 타임아웃 폴백+qa.json 4건, /api/places 프록시+폴백.
- Presentation: 발표 초안 10장 윤곽(placeholder, 미구현 단언 없음).
- 통합 교차검토 리뷰어: 조건부 PASS, 차단 이슈 0.

## Gate 결과
- `npm run gate:build` (enforced) → **PASS** (`npm run web:build` exit 0, 타입체크 통과, 라우트 4개 빌드).
- LLM Review: `cross-review -- spec.md` → 클로드 리뷰어, 조건부 PASS(비차단 3건). P1만 반영(출산前 deadline null), P2/P3는 데드코드/미발동이라 보류.

## 브라우저 검증 (preview, 키 없이)
- 입력→타임라인→**Wow 확인**: 슬라이더를 출산 직후로 옮기면 "지금" 카드 2→5건 재정렬 + deadline-warning 0→3건 점등("D-53 지나면 200만원 소멸 위험"·"D-53 100만원 소멸"·"D-23 신청 마감").
- **AI 본질 장면 확인**: "쌍둥이+고위험+전입" 질문 → 데이터셋 근거 응답(다태아 태아당100·고위험 90%/300만원, 정정값 그대로, 환각 0).
- 키(카카오·Anthropic) 없이 전 경로 동작(폴백).

## 적용한 폴백
- 교차검토: Codex 미사용 → 클로드 리뷰어 폴백.
- AI: 키 없음/5초 타임아웃 → qa.json fixture + 규칙 브리핑(본질 장면 cut 금지 유지).

## 남아 있는 위험 / 운영 주의
- ⚠️ **dev 서버 가동 중 `npm run build`(프로덕션) 실행 금지** — 공유 `.next` 캐시 충돌로 dev가 500/`Cannot find module './NNN.js'` 깨짐. 이번에 발생→ dev 중지+`.next` 삭제+재시작으로 복구. Stage 07 검증은 dev 서버로만, 프로덕션 빌드 필요 시 dev 먼저 중지.
- `deadlineDday` 경계(38~40주)는 출산前 null로 정리됨. Stage 07 Playwright에서 경계 확인.
- 카카오/Anthropic 키는 미설정(폴백 동작). 실 API 시연 원하면 사용자 키 필요.

## 확정된 계약 (이후 단계가 지킬 것)
- testid: `timeline-badge·benefit-timeline·benefits-now·benefits-soon·deadline-warning·ai-answer·weeks-slider·ask-input`, card class `.benefit-card`.
- 데이터 단일 진실: `web/public/data/benefits/benefits.json` ↔ `research/verified-figures.md`.
- 데모 happy path: 입력(주차 슬라이더+지역) → 결과 → 슬라이더 라이브 변경 → 재정렬+손실경고.

## 다음 단계가 읽어야 할 파일
- `web/`(구현), `demo/demo.scenario.yaml`, `spec.md`, `concept.md`
- `presentation/draft-outline.md`(Stage 08 입력)
- `workflow/stages/06-integration.md`

## 다음 단계에서 하지 말아야 할 것
- dev 서버 가동 중 프로덕션 빌드 금지(위 주의).
- testid·데이터 계약 변경 금지. 미구현 기능 발표 단언 금지.
