# ▶ 결과물 실행하기 (work_first) — 임신·출산 지원의 시계

> 임신 주차·출산예정일·거주지를 넣으면 정부 지원을 "지금 신청 → 곧 열림" 시간순으로 정렬하고
> 놓치면 사라질 돈을 D-day로 경고하는 데모 + 발표 산출물. 아래대로 바로 실행할 수 있다.

## 1) 웹 앱 (라이브 데모)
```bash
cd web
npm install
npm run dev        # → http://localhost:3000
```
- 흐름: 입력(주차·거주지) → "지금/곧" 시간순 카드 → 임신 주차 슬라이더를 출산 직후로 옮기면 **카드 재정렬 + 마감 손실경고 점등(Wow)** → 자유 질문으로 **AI 자격 Q&A**.
- **API 키 없이도 핵심 기능이 동작**한다(폴백 내장). 실 API를 쓰려면 `web/.env.local`에 `NEXT_PUBLIC_KAKAO_MAP_KEY` · `KAKAO_REST_API_KEY` · `ANTHROPIC_API_KEY`.

## 2) 발표 (Slidev) — 설치 없이 바로 보기
```bash
node dist/submission/serve-slidev.mjs    # → http://localhost:4173
```
- **Node만 있으면 된다**(빌드본·이미지 포함, npm 설치 불필요). 브라우저로 열고 `←/→` 이동, `F` 전체화면.
- 슬라이드마다 글로우 배경이 움직인다. (Slidev는 웹 렌더라 `file://` 직접 열기는 안 되고 HTTP 서빙이 필요 — 이 스크립트가 그 역할.)
- 오프라인 백업: `dist/submission/presentation.pdf` (10장, 그냥 열기).

## (선택) Slidev를 소스에서 재빌드
```bash
cd presentation/slidev
npm install
npx slidev build slides.md --out ../output/slidev --base ./
node ../serve-slidev.mjs                 # → http://localhost:4173
```
- ⚠️ **경로에 공백이 있으면**(예: `C:\Users\Hong Gildong\...`) Vite 빌드가 깨진다. 공백 없는 경로에서 빌드할 것 — Windows에서는 `subst X: "<repo 절대경로>"` 후 `X:\presentation\slidev`에서 빌드하고 끝나면 `subst X: /D`.

> 제출 패키지 전체 구성·실행은 [`dist/submission/README.md`](dist/submission/README.md) 참고.

---

# 한국 공공 서비스 해커톤 스타터 키트

> 4시간 AI 해커톤에서 **새 주제를 받자마자 바로 구현**하기 위한 출발점.
> 검증된 Next.js + KRDS 스택, 한국 지역·지도 공공데이터, 재사용 코드 패턴, 그리고
> AI 에이전트용 **단계 기반 워크플로우 엔진**(`workflow/` + `CLAUDE.md` 라우터)이 한 묶음으로 들어있다.

## 빠른 시작 (대회 당일)

```bash
cd web
npm install
npm run dev      # http://localhost:3000
```

빌드 검증은 `npm run build`. **이 스캐폴드는 `install`+`build` 통과 확인됨** (Node 24 / npm 11).

그다음 순서 (워크플로우 엔진):
1. `npm install` (루트 — 워크플로우 도구) → `npm run workflow:status` 로 현재 단계 확인
2. `CLAUDE.md`(라우터) 읽고 → 현재 단계 지침(`workflow/stages/NN-*.md`)대로 진행
3. 단계마다 Gate 실행(`npm run gate:<stage>`) → 통과 시 Handoff 후 `npm run workflow:complete`
4. 새 세션은 `npm run workflow:resume` 로 복원 (이전 대화 추측 금지, `state.yaml`로 복원)

## 들어있는 것

| 묶음 | 내용 |
|---|---|
| **워크플로우 엔진** | `workflow/` (state.yaml · stages.yaml · 13단계 지침 · Gate · 상태전환 스크립트) + `CLAUDE.md` 라우터 |
| **운영 지침** | `docs/` (기획 품질 기준 · 발표 생성 · 엔진 구조) |
| **계약서 템플릿** | `spec.md` · `plan.md` · `PROGRESS.md` (빈 템플릿) |
| **스택** | `web/` — Next.js 14 + React 18 + TS + Tailwind + KRDS, 셋업 완료 |
| **데이터** | 전국 시도/시군구 경계, 시도→시군구 매핑, 민방위 대피소 ~17,000곳 |
| **디자인** | `design/krds/` — KRDS 공식 토큰(CSS/JSON/Figma) + 정부 엠블럼 |
| **재사용 코드** | 카카오맵 컴포넌트, 위치/거리 유틸, 공공 CSV 변환 스크립트 |
| **참고 완성본** | `examples/disaster-guide/` — 연습 결과물(재난 대비 가이드) 소스 |

상세 사용법·KRDS 함정·사전 준비는 **`CLAUDE.md`** 참고.

## 주제가 공공 성격이 아니라면
`CLAUDE.md` 워크플로우 + `web/` Next 스캐폴드만 가져가고, KRDS·공공데이터 묶음은 떼어내면 된다.

## 사전 준비 (대회 전 권장)
- 카카오맵 JS 키 발급 + 도메인 등록 (지도 쓸 경우, 당일엔 늦음)
- 필요할 법한 공공데이터 미리 신청 — `data/data-sources.md` 참고 (`data.go.kr` 차단 환경 대비)

## 라이선스 / 출처
KRDS 이용약관 · `@krds-ui/core`(Apache-2.0) · 공공데이터포털. 상세는 `design/krds/SOURCE.md`, `data/data-sources.md`.
