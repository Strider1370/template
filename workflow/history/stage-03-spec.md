<!-- Handoff 보고서. Stage 03 완료. -->
# Stage 03 완료 보고 — spec

## 단계
03 · spec (스펙 확정)

## 시작 시각 / 종료 시각 / 사용 시간
- 시작: 2026-06-18T10:24Z
- 종료: 근사 (spec 작성 + 숫자 검증 병렬 + 교차검토 반영)
- 사용: 예산 10분 내(검증은 백그라운드 병렬)

## 완료한 내용
- `spec.md` 16헤딩 작성 — concept.md를 풀어쓰되 배신 없음(피치·킥·Wow·마지막문장 보존).
- `demo/demo.scenario.yaml` 작성 — 4스텝 + Wow Moment(selector/assertion) + 폴백.
- **숫자 검증 병렬 서브에이전트** 완료 → 7개 제도 정부 1차출처 검증, `research/verified-figures.md` 생성, 출처 9건 sources.json 병합.
- 교차검토(조건부 PASS) 3건 반영.

## 생성·수정한 파일
- `spec.md` (신규 작성)
- `demo/demo.scenario.yaml` (작성)
- `research/verified-figures.md` (검증 에이전트 생성)
- `research/sources.json` (verify-src 9건 병합 + problem-02 claim 1차출처로 교체)
- `research/integrated-findings.md` (§9 재검증 결과로 갱신)

## 서브에이전트 실행 결과
- **숫자 검증 리서처(백그라운드)**: 7제도 1차출처 검증 완료. **정정 2건** — 아동수당 8세→**9세 미만**(+비수도권 월3만원, 2026~), 다태아 진료비 정액 140→**태아당 100만원**(쌍둥이 ≈200만원). "60일 소급"은 정책브리핑·복지로 1차출처로 승격(Wow 안전).
- **spec 교차검토 리뷰어**: 조건부 PASS. P0 selector 불일치 / P1 AI 장면 cut 위험 / P2 아동수당 9세 화면 미검증 → 모두 처리.

## Gate 결과
- `npm run gate:spec` (enforced) → **PASS**: 16헤딩 전부 + demo.scenario.yaml 존재.
- LLM Review: `cross-review -- spec.md` → 클로드 리뷰어 폴백, 조건부 PASS, 반영 완료.

## 사용자 결정
- humanApproval 아님(false). (앞 Stage 02 승인 방향을 풀어쓴 것)

## 적용한 폴백
- 교차검토: Codex 미사용 → 클로드 리뷰어 폴백.
- 검증 에이전트: data.go.kr 403 회피, 정책브리핑/정부24/복지로/복지부/건보 1차출처만 사용. NHIS 구버전 금액 페이지는 인용 금지 표기.

## 교차검토 반영 상세
- **P0 (selector 계약 통일)**: spec §9와 demo.scenario.yaml을 단일 testid 계약으로 정렬 — `timeline-badge`·`benefit-timeline`·`benefits-now`·`deadline-warning`·`ai-answer`. Stage 05 구현/Stage 07 검증 공유.
- **P1 (AI 본질 장면 cut 금지)**: demo step4를 "cut 금지"로 명시 + successCriteria에 "키 없어도 사전 생성 Q&A fixture로 항상 표시" 추가. → §5 "AI 때문에 처음 가능"이 데모에서 사라지지 않음.
- **P2 (아동수당 9세 가드)**: 데이터셋엔 9세로 들어가되 데모 카드엔 미노출 → 발표에서 "9세" 사용 시 Stage 05/09에서 데이터셋과 교차확인(아래 위험에 이월).

## 남아 있는 위험 (Stage 04/05로 이월)
- **데이터셋 정정 2건 반영 필수**: 아동수당 9세 미만(+비수도권 월3만원), 다태아 진료비 태아당 100만원. `verified-figures.md`가 단일 진실.
- AI 본질 장면용 **사전 생성 Q&A fixture**를 폴백 필수 자산으로 plan에서 못박을 것.
- 카카오 REST 키(서버 프록시) / Claude 키 — 폴백 분리 유지.
- 산모·신생아 2026 지침 PDF 본문 미열람(현행 정부24/복지로 값은 사용 가능, 정밀 인용 시 PDF 필요).

## 확정된 계약 (이후 단계가 바꾸면 안 됨)
- spec.md 16헤딩 + demo.scenario.yaml = Stage 04 계획·Stage 07 검증의 기준.
- **testid 계약**: `timeline-badge`·`benefit-timeline`·`benefits-now`·`deadline-warning`·`ai-answer`.
- Wow = 입력 라이브 변경 시 재정렬 + deadline-warning 점등(텍스트 `D-`+`소멸/마감`).
- 검증된 수치(`verified-figures.md`)만 발표에 단언.

## 다음 단계가 읽어야 할 파일
- `spec.md`, `demo/demo.scenario.yaml`, `concept.md`
- `research/verified-figures.md`(데이터셋 진실), `research/feasibility.md`(스키마·happy path)
- `workflow/stages/04-implementation-plan.md` (guidance 없음)

## 다음 단계에서 하지 말아야 할 것
- 16헤딩·testid 계약·검증 수치를 바꾸지 말 것.
- 구현(코드)을 Stage 04에서 선행하지 말 것(계획만).
- AI 본질 장면(step4)을 cut 대상으로 두지 말 것.
