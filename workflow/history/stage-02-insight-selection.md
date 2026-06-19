<!-- Handoff 보고서. Stage 02 완료. -->
# Stage 02 완료 보고 — insight-selection

## 단계
02 · insight-selection (인사이트 선택 + 기획 확정) — **사용자 승인 단계**

## 시작 시각 / 종료 시각 / 사용 시간
- 시작: 2026-06-17T16:52Z
- 종료: 근사
- 사용: 예산 15분 내 (발산→수렴→레드팀→승인→받아적기)

## 완료한 내용
- (a) 발산: Insight 후보 6개(I1~I6, 구조 = 통념→관찰→긴장→리프레이밍) 제시.
- (b) 수렴: `insight-candidates.md`에 후보 ≥5 + 방향 3개(A/B/C) + 각 AI Leverage·킥 기록.
- (c) 레드팀: 적대적 심사위원 cross-review 1회 → **조건부 통과**, 보강 3건(P1/P2/P3) 도출.
- (d) 사용자 승인: 방향 A + 레드팀 보강 3건 확정. 마지막 문장 사용자 선택.
- (e) 받아적기: `selected-direction.md` + `concept.md`(6헤딩) 작성, 승인 기록.

## 생성·수정한 파일
- `workflow/decisions/insight-candidates.md` (후보·방향)
- `workflow/decisions/selected-direction.md` (확정 방향 + 레드팀 보강 + 데모 윤곽)
- `concept.md` (루트 북극성 — 6헤딩)
- `workflow/state.yaml` (humanApproval = approved)

## 서브에이전트 실행 결과
- 레드팀 리뷰어(클로드 폴백): 조건부 통과. 지적 — ①킥이 "결합"이라 한 컷에 안 잡히면 분해됨, ②AI가 "가산점"이면 AI 트랙에서 약함, ③핵심 숫자 2차출처, ④제도 8~12개 과욕, ⑤피치 밋밋. → P1/P2/P3로 정리해 방향에 반영.

## Gate 결과
- `npm run gate:insight` (enforced) → **PASS**: insight-candidates 존재, 후보 12(≥5), selected-direction 존재, concept.md 6헤딩 전부 존재.
- LLM Review(레드팀) = `cross-review -- insight-candidates.md` 1회 수행(조건부 통과, 반영 완료).

## 사용자 결정
- **승인됨**(humanApproval=approved, decisionFile=workflow/decisions/selected-direction.md).
- 방향 A "임신·출산 지원의 시계" 확정 + 레드팀 보강 3건 수용.
- 마지막 문장(사용자 선택): **"받을 수 있는 지원이 아니라, 지금 받아야 하는 지원을 알려줍니다."**

## 적용한 폴백
- 교차검토: Codex 미사용 → 클로드 레드팀 리뷰어 폴백.

## 남아 있는 위험 (Stage 03로 이월)
- **P1 (치명)**: 핵심 숫자(60일 소급, 부모급여·아동수당 금액) 1차출처 교체 — spec 확정 전 필수. 불가 시 화법 완화 + asof 배지.
- **P2**: AI 라이브 1장면(교차 케이스)을 데모 cut 금지로 유지.
- **P3**: 제도 3~4개로 한정(첫만남·부모급여·산모신생아건강관리·고위험임산부).
- 데이터셋 신규 제작이 여전히 크리티컬 패스.

## 확정된 계약 (이후 단계가 바꾸면 안 됨)
- `concept.md` = 북극성. 한 문장 피치 / 페르소나(박지은 32세 서울 임신8주) / 킥(시간축 내비) / Wow(라이브 재정렬+손실경고 점등) / 마지막 문장 / 안 하는 것.
- 범위: 신청·본인인증·결제 제외, 데모 지역 2~3개, 제도 3~4개.

## 다음 단계가 읽어야 할 파일
- `concept.md` (북극성 — 반드시), `workflow/decisions/selected-direction.md`
- `research/integrated-findings.md`, `research/sources.json` (수치·출처)
- `workflow/stages/03-spec.md`, guidance: `docs/AI_Hackathon_Operating_System.md` §6, §8 Stage 03 Review

## 다음 단계에서 하지 말아야 할 것
- concept.md를 임의로 변경하지 말 것(변경은 명시적 rollback).
- spec에 미검증 수치를 단언으로 넣지 말 것(P1).
- 제도 수를 다시 늘리지 말 것(P3). AI 시연 1장면을 빼지 말 것(P2).
