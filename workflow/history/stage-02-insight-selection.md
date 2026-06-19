<!-- Handoff 보고서 (자동 생성: npm run workflow:handoff). 기계가 채운 부분 + <!-- 직접 채우기 --> 2~3곳만 사람이 보강. -->
# Stage 02 완료 보고 — insight-selection

## 단계
Stage 2 — insight-selection

## 시작 시각 / 종료 시각 / 사용 시간
- 시작: 2026-06-19T08:45:24.656Z
- 종료: 2026-06-19T08:56:20.921Z
- 사용: 10.9분 (예산 15분)

## 완료한 내용
- 인사이트 후보 6개 도출 + 발산 2라운드(사용자 주고받기) → insight-candidates.md.
- 레드팀 cross-review(깐깐한 심사위원) 1회 → "조건부 통과" 4개 조건 반영.
- 사용자 최종 승인 → concept.md(6헤딩 북극성) + selected-direction.md 받아적기.

## 생성·수정한 파일
- concept.md
- research/domestic.md
- research/feasibility.md
- research/integrated-findings.md
- research/jtbd.md
- research/judge-review.md
- research/overseas.md
- research/sources.json
- workflow/history/stage-01-parallel-research.md
- workflow/state.yaml

## 서브에이전트 실행 결과
- 레드팀 리뷰어 1명(insight-candidates.md 적대 검토) → 조건부 통과, 치명 공격 Top3 + 4개 조건 반환. 메인이 전부 반영.
- 발산·판단은 메인+사용자 주고받기로 수행(서브에이전트 아님).

## Gate 결과
- 명령: npm run gate:insight
- 결과: PASS (enforced — 후보 12, concept.md 6헤딩 전부, selected-direction 존재) + 레드팀 조건부 통과 반영
- 리포트: workflow/history/stage-02-gate.md

## 사용자 결정
승인 필요 — 상태: approved.
- 방향: "무엇을이 아니라 왜 당신이"(③+⑤ 척추, ②④ 보조) 확정.
- 간판 문장: "정부는 '받을 수 있다'고만 합니다. 우리는 '왜 당신인지'를 보여줍니다."
- decision 파일: workflow/decisions/selected-direction.md, concept.md(확정).

## 적용한 폴백
<!-- 직접 채우기: 없으면 "없음". -->
-

## 남아 있는 위험
- AI 본질성 입증은 "rewrite-only + 폴백" 설계에 달림 → Stage 03 spec/05 구현에서 반드시 구체화. 안 되면 "AI 장식" 공격에 베임.
- fixture 8~10개 큐레이션 품질(출처·eligibility 규칙·신청링크)이 데모 신뢰를 좌우. "예시 데이터" 라벨 화면 상시 필수.

## 확정된 계약
- concept.md(북극성) 확정 — Stage 03·05·08의 기준선. 바꾸려면 명시적 rollback.
- 차별화 축(무로그인 + 왜 당신인지), AI 사용 경계(구조화·rewrite만, 판정/사실생성 금지)는 불변.

## 다음 단계가 읽어야 할 파일
- concept.md, workflow/decisions/selected-direction.md, research/integrated-findings.md(데이터 가드)
- workflow/stages/03-*.md

## 다음 단계에서 하지 말아야 할 것
- concept.md 척추(킥·페르소나·마지막 문장)를 임의 변경 금지.
- spec에 자동 전수 매칭/전국 DB/AI 자격판정을 넣지 말 것(범위 밖).
- 레드팀 4개 조건을 누락하지 말 것.

## 체크포인트
- HEAD: 4cafbb2
