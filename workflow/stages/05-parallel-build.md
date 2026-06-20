# Stage 05 — Parallel Build (병렬 구현)

## 1. 목적
UI/Data/AI/Demo/Presentation 에이전트를 병렬로 돌려 데모 핵심경로를 구현한다. Presentation Agent는 구현을 기다리지 않고 발표 초안을 병렬 작성한다. 작동 상태마다 체크포인트 커밋.

## 2. 시작 조건
- Stage 04 Gate 통과, `plan.md` + `file-ownership.yaml` 존재.

## 3. 이번 단계에서 반드시 읽을 파일
- `plan.md`, `workflow/decisions/file-ownership.yaml`, `spec.md`(필요 헤딩), `demo/demo.scenario.yaml`
- **`concept.md`** — 모든 서브에이전트의 읽기 5개 중 1개로 포함시켜 같은 데모(Wow Moment)를 향하게 한다(드리프트 차단).
- guidance: `docs/CLAUDE_Notion_Slidev_Integration_Guide.md` §3 "Stage 05 — 병렬 구현 중 발표 초안" 및 §15 "서브에이전트 권한"(Stage 05 Presentation Agent). 이 섹션만.

## 4. 이번 단계에서 읽지 않아도 되는 파일
- 리서치 원문, 발표 생성 상세 규칙(§8~12은 Stage 09), 타 단계 history.

## 5. 필수 입력
- `plan.md`, `file-ownership.yaml`. 없으면 시작하지 않는다.

## 6. 메인 에이전트의 역할
- 각 에이전트에 좁은 Agent Task 계약만 전달(전체 지침 X).
- 결과를 받아 충돌 없이 모은다(통합 자체는 Stage 06).
- 작동하는 상태가 되면 체크포인트 커밋(매 변경마다 X). `state.yaml.lastSuccessfulCheckpoint`에 commit 기록.
- `web/` 스캐폴드·기존 컴포넌트/유틸 재사용을 강제(같은 것 새로 만들기 금지).
- **스캐폴드 정체성 교체(마감 필수)**: `web/`는 서비스명·nav·타이틀을 *자리표시*(예: "공공 서비스 스타터", "메뉴 1·2·3")로 둔다 — 교체 전제다. 실제 서비스 정체성으로 바꿔라: Header/Footer 서비스명, Header nav, `app/layout.tsx` metadata(title/description), `app/page.tsx` badge/heading. **`npm run web:check-identity`로 확인**(자리표시 남으면 빌드 게이트가 실패한다). 또한 **주제 맞춤 상단 배너 생성**: `npm run generate-banner -- --topic "<주제>"` (공공기관 사진풍 → `web/public/hero-banner.png` 교체, 홈 hero가 자동 렌더; `OPENAI_API_KEY` 없으면 기본 배너 유지). **공통 입력/지도 블록(`web/components/blocks/`: UserInfoForm·MapPanel)은 필요할 때만 골라 쓰는 부품**이다 — `app/page.tsx`는 주제에 맞게 새로 짜고, 기본 데모의 "폼+지도" 배치에 **종속되지 마라**(부품은 재사용, 레이아웃은 주제 기준). 또한 **모바일 반응형은 필수**로 짓는다(폰 폭 우선, Tailwind/KRDS). 모바일 주제면 **위치(`navigator.geolocation`)·알림** 자리를 마련한다(WebView APK 패키징은 Stage 06 — 상세 `docs/mobile-webview-target.md`).

## 7. 병렬 서브에이전트 구성
- UI Agent / Data Agent / AI Agent / Demo Agent / Presentation Agent (5개). 단일 세션이면 메인이 순차로.
- **범위에 맞게(속도)**: 구현이 작으면(독립 파일 <3, 단일 페이지 앱) 병렬화 오버헤드(계약 작성·통합·소유권)가 이득보다 커서 **메인 단독이 더 빠르고 품질 동일** — 굳이 5개로 쪼개지 마라. (리서치 01과 달리 UI 구현은 병렬 가치가 낮을 수 있다.)

## 8. 각 서브에이전트의 작업 계약
`agent-task.yaml` 형식, `read`≤5(**`concept.md` 포함**), `write`=file-ownership.yaml의 자기 경로만, `doNotWrite`=concept.md/spec/plan/package.json/state.yaml/타 에이전트 경로.
- UI: `web/app/<feature>/`,`web/components/<feature>/` — 완료: fixture로 렌더, Wow Moment 화면에 보임, 타입 OK, `npm run web:build` 통과.
- Data: `web/lib/`,`web/public/data/`,`web/scripts/` — 완료: fixture/정제 JSON 제공. **입수 원칙**(`data/data-sources.md`): 권위 단일 소스 1개 받아 변환(웹 크롤 X) · 막힌 환경은 사람이 미리 받아둔 파일 사용(없으면 사용자에 요청) / 열린 환경은 직접 다운로드 시도 · **못 받으면 "샘플" 명시하고 수치 지어내기 금지**.
- AI: AI 호출 모듈 경로 — **재사용 헬퍼 `web/lib/llm.ts`(`openaiChat`: OpenAI 기본·모델 자동분기·키 없으면 null) + `/api/llm` 라우트를 그대로 쓴다(같은 것 새로 만들지 마라)**. 완료: 폴백(하드코딩 응답) 포함, 키 없을 때도 동작.
- Demo: `demo/` — 완료: demo.scenario.yaml 경로대로 클릭 흐름 준비.
- Presentation: `presentation/draft-outline.md` 등 — 완료: Problem/Insight/Solution/Closing + 데모 placeholder + 발표 구조 초안(구현 안 기다림).

## 9. 생성해야 하는 산출물
- 데모 핵심경로 구현 코드(`web/`), fixture 데이터, AI 폴백, `presentation/draft-outline.md`(발표 초안).

## 10. 파일 소유권
- 메인 전용: `spec.md`,`plan.md`,`package.json`,`state.yaml`,`stages.yaml`.
- 에이전트별: §8의 write 경로(상호 침범 금지). `presentation/`은 Presentation Agent + 메인만.

## 11. 제한 시간
- 85분(최대 구간). 초과 시 데모 핵심경로 외 기능을 폴백/드롭(단계 생략 X, 범위 축소).

## 12. 완료 조건
- `npm run web:build` 통과, **`npm run web:check-identity` 통과(스캐폴드 자리표시 모두 교체)**, fixture로 데모 핵심경로가 화면에서 끝까지 이어짐, 발표 초안 존재.

## 13. 기계적 Gate (Mechanical)
- 명령: `npm run gate:build`
- 분류: **enforced**. `web/` 빌드 실제 실행 + 타입체크 + **스캐폴드 자리표시 교체(web:check-identity)** 검사. 자리표시가 남으면 게이트 실패.

## 14. LLM Review Gate
- `npm run cross-review -- spec.md` 대비 구현 요지(또는 변경 요약) (Codex 우선 → 클로드 폴백).
- 검토: 구현이 spec의 데모경로/Wow Moment를 반영하는가, 범위 일탈 없는가.

## 15. 사용자 승인 여부
- `humanApproval: false`.

## 16. 실패 시 폴백
- 외부 연동 막히면 즉시 fixture/하드코딩으로 데모를 살린다(붙잡지 않음). 빌드 깨지면 마지막 체크포인트로 롤백 후 범위 축소.

## 17. 다음 단계에 전달할 정보
- 구현된 `web/`, fixture, `presentation/draft-outline.md`, 각 에이전트 보고(구현/모킹/폴백/드롭 상태) (Stage 06 통합 입력).

## 18. 금지 사항
- spec에 없는 기능 추가 금지, 과한 리팩토링/추상화 금지.
- 데모에 안 보이는 곳(인증·설정)에 시간 쓰기 금지.
- 매 변경 커밋 금지(작동 시점에만).

## 19. 단계 완료 보고 형식
- `workflow/templates/stage-report.md` → `workflow/history/stage-05-parallel-build.md`.
