<!-- Handoff 보고서 (자동 생성: npm run workflow:handoff). 기계가 채운 부분 + <!-- 직접 채우기 --> 2~3곳만 사람이 보강. -->
# Stage 00 완료 보고 — intake

## 단계
Stage 0 — intake

## 시작 시각 / 종료 시각 / 사용 시간
- 시작: 2026-06-19T08:29:39.466Z
- 종료: 2026-06-19T08:31:48.121Z
- 사용: 2.1분 (예산 5분)

## 완료한 내용
- 주제 접수·구조화: "가족 맞춤 정부 혜택 찾기" → intake.yaml 작성, state.project 갱신.
- 자산 점검: web/ 스캐폴드·regions.ts(지역)·KRDS는 재사용. 대피소 데이터는 무관.
- 핵심 데이터 경로 확정: 복지로 복지서비스정보(data.go.kr 15083323). 번들엔 없어 당일 확보 필요.

## 생성·수정한 파일
- workflow/state.yaml

## 서브에이전트 실행 결과
메인 단독 실행 (단순 기록 단계).

## Gate 결과
- 명령: npm run gate:intake
- 결과: PASS (체크리스트 — intake.yaml 존재 + 필수 필드 채움)
- 리포트: workflow/history/stage-00-gate.md

## 사용자 결정
승인 불필요

## 적용한 폴백
<!-- 직접 채우기: 없으면 "없음". -->
-

## 남아 있는 위험
- 데이터 의존: 복지로 CSV가 fileData.do 로그인 벽 → 못 받으면 데모가 비거나 "샘플" 강등 필요. Stage 01에서 확보 가능성 우선 확인.
- 자격 매칭 정확도: 혜택 자격요건이 복잡(소득분위·가구원수 등) → 범위를 줄이더라도 "정확히 맞는 것만" 보여줘야 신뢰. 과장/날조 금지.

## 확정된 계약
- 주제·기술스택(Next.js+KRDS)·데이터 단일소스(복지로 15083323) 잠정 확정. 시간/필수조건은 기본값(사용자 확정 대기).

## 다음 단계가 읽어야 할 파일
- workflow/decisions/intake.yaml, data/data-sources.md(복지 섹션), workflow/stages/01-research.md

## 다음 단계에서 하지 말아야 할 것
- 방향(A/B/C 각도) 확정 금지 — 본격 발산/수렴/승인은 Stage 02.
- spec/구현 선행 금지.

## 체크포인트
- HEAD: 96ab0f7
