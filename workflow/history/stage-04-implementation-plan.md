<!-- Handoff 보고서. Stage 04 완료. -->
# Stage 04 완료 보고 — implementation-plan

## 단계
04 · implementation-plan (구현 계획)

## 시작 시각 / 종료 시각 / 사용 시간
- 시작: 2026-06-18T10:38Z
- 종료: 근사
- 사용: 예산 10분 내

## 완료한 내용
- `plan.md` 작성 — 기술스택(web/ 그대로, 새 의존성 0), 작업 분해 4건+순서+폴백, 데이터 연결 계획, 파일 소유권, 사전준비 체크리스트, 체크포인트, Stage 05 Agent Task 계약 3종.
- `workflow/decisions/file-ownership.yaml` — 3개 에이전트 write 경로 교집합 0.
- 잠금 계약 확정: `Benefit` TS 타입, testid 5+2, AI API 계약, AI fixture 형태.
- 교차검토(조건부 PASS) 3건 반영.

## 생성·수정한 파일
- `plan.md` (신규)
- `workflow/decisions/file-ownership.yaml` (신규)

## 서브에이전트 실행 결과
- plan 교차검토 리뷰어: 조건부 PASS. 핵심경로 커버·충돌0·폴백·자산재사용 PASS. 지적 3건(빌드순서/곁가지컷/계약문구) 반영.

## Gate 결과
- `npm run gate:plan` (checklist) → **PASS**: plan.md + file-ownership.yaml 존재 + 체크리스트.
- LLM Review: `cross-review -- plan.md` → 클로드 리뷰어 폴백, 조건부 PASS, 반영 완료.

## 사용자 결정
- humanApproval 아님. **사용자 사전준비 안내**(plan §5): 카카오 JS키·REST키·ANTHROPIC_API_KEY를 `web/.env.local`에 (없어도 폴백으로 데모 성립). 공공데이터 다운로드 불필요.

## 적용한 폴백
- 교차검토: Codex 미사용 → 클로드 리뷰어 폴백.
- 설계상 폴백: 카카오 JS/REST·Anthropic 전부 정적 폴백(지도 fallback / facilities JSON / 규칙+qa.json). 키 셋 다 없어도 핵심 경로 + AI 본질 장면 성립.

## 교차검토 반영 상세
- **빌드 순서 명문화**: web/lib/benefits.ts(Data 소유) 타입 확정(체크포인트1) → ui/ai 통합 web:build. 디스패치 시 강제.
- **곁가지 컷 라인**: 지도(FacilityMap) → 보조제도 2건(6→4) → 슬라이더 number. 핵심경로·AI 본질 컷 금지.
- **계약 문구 정정**: plan testid는 spec §9·demo의 상위집합(필수 5 + plan전용 benefits-soon·ask-input). AI 폴백에 "5초 타임아웃→fixture" 추가.

## 남아 있는 위험 (Stage 05로 이월)
- 크리티컬 패스 = 제도 데이터셋(절벽4+보조2) 제작·검증값 반영. 정정 2건(아동수당 9세·다태아 태아당100) 필수.
- 병렬 빌드 순서: Data 타입 먼저. ui/ai는 plan 잠금계약의 Benefit 타입 기준으로 작성.
- 외부 키는 사용자 준비 전제(없으면 폴백).

## 확정된 계약 (Stage 05가 지킬 것)
- file-ownership.yaml = write 경로. 교집합 0, 메인전용/재사용자산 읽기전용.
- Benefit 타입 · testid 필수 5종(timeline-badge·benefit-timeline·benefits-now·deadline-warning·ai-answer)+`.benefit-card` · AI API(`POST /api/ask`) · qa.json fixture 형태.
- Wow = 클라이언트 즉시 재정렬 + deadline-warning 점등.

## 다음 단계가 읽어야 할 파일
- `plan.md`, `workflow/decisions/file-ownership.yaml`, `spec.md`, `demo/demo.scenario.yaml`
- `research/verified-figures.md`(데이터 진실), `research/feasibility.md`(스키마)
- `workflow/stages/05-parallel-build.md`, guidance: docs/CLAUDE_Notion_Slidev_Integration_Guide.md §3 Stage 05, §15 서브에이전트 권한

## 다음 단계에서 하지 말아야 할 것
- file-ownership 위반(남의 write 경로 침범) 금지.
- 재사용 자산(regions.ts·shelters.ts·KakaoMap.tsx) 새로 만들기 금지.
- 핵심 경로·AI 본질 장면 컷 금지. 새 의존성 추가 금지(web/package.json 메인 전용).
