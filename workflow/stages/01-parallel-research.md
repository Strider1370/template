# Stage 01 — Parallel Research (병렬 리서치)

## 1. 목적
5개 트랙을 병렬로 돌려 사용자 문제·국내외 사례·구현 현실성·심사위원 관점을 한 번에 조사하고, 차별점(킥) 후보를 발굴한다. 특히 해외 메커니즘 ≥3개를 확보한다.

## 2. 시작 조건
- Stage 00 Gate 통과, `intake.yaml` 존재.

## 3. 이번 단계에서 반드시 읽을 파일
- `workflow/decisions/intake.yaml` (주제·제약)
- guidance: `docs/AI_Hackathon_Operating_System.md` §4 "Stage 01 — 병렬 리서치에서 사용하는 사고 기준"(4.1~4.6) 및 §8 "Stage 01 Review". 이 섹션만 읽는다.

## 4. 이번 단계에서 읽지 않아도 되는 파일
- spec/plan/발표 관련 docs, 타 단계 history, 이전 대화 전체. 트랙과 무관한 원문은 읽지 않는다.

## 5. 필수 입력
- `intake.yaml`의 주제. 없으면 시작하지 않는다.

## 6. 메인 에이전트의 역할
- 시작 시 `research/sources.json`을 생성한다(빈 배열로 초기화). 모든 트랙이 출처를 여기에 구조화한다.
- 5개 서브에이전트를 병렬 실행한다. **각 트랙은 자기 보고서 파일(아래 §8의 md)을 사용자가 읽을 수 있게 작성한다.**
- 결과를 모아 `research/integrated-findings.md`를 직접 작성한다(킥 후보 종합).
- **사용자에게 보고한다 — 파일 + 세션 둘 다:** ① 5개 트랙 보고서(`research/jtbd.md`·`domestic.md`·`overseas.md`·`feasibility.md`·`judge-review.md`)의 위치를 알려 사용자가 직접 읽게 하고, ② 메인이 `integrated-findings.md`의 핵심(킥 후보·해외 메커니즘 ≥3·국내 중복 회피)을 **세션 채팅에서 초보자에게 설명하듯** 요약 보고한다. (파일만 남기고 넘어가지 말 것 — 사용자가 파일을 읽는 동안 이 세션 보고가 같이 가도록.)

## 7. 병렬 서브에이전트 구성
- A. JTBD/사용자 문제, B. 국내 사례, C. 해외 사례+메커니즘(≥3), D. 데이터·구현 현실성, E. 심사위원 관점·차별화. (단일 세션이면 메인이 순차로.)

## 8. 각 서브에이전트의 작업 계약
공통 형식(`agent-task.yaml`): `read` = [`intake.yaml`, 해당 트랙 guidance 섹션], `write` = 자기 산출물 1개 + `research/sources.json`에 항목 append, `doNotWrite` = spec/plan/타 트랙 파일.
- A → `research/jtbd.md` (완료: JTBD 3개 이상, 근거 출처 연결).
- B → `research/domestic.md` (완료: 국내 유사 사례 + "이미 있는 것" 정리).
- C → `research/overseas.md` (완료: **해외 사례 ≥3, 각 핵심 메커니즘 + 이식 가능한 킥 후보**, 출처·확인시점 기록).
- D → `research/feasibility.md` (완료: 필요한 데이터/기술, 4시간 현실성, 레포 자산 매핑).
- E → `research/judge-review.md` (완료: 심사위원이 의심할 지점 + 차별화 포인트).
출처 항목 스키마: `{id,title,url,publisher,accessedAt,usedFor[],claim}`.

## 9. 생성해야 하는 산출물
- `research/sources.json`
- `research/jtbd.md`, `research/domestic.md`, `research/overseas.md`, `research/feasibility.md`, `research/judge-review.md`
- `research/integrated-findings.md`

## 10. 파일 소유권
- 메인 전용: `research/integrated-findings.md`, `research/sources.json` 초기화.
- 트랙별 전용: 위 §8의 1:1 매핑(서로 남의 파일 쓰기 금지).

## 11. 제한 시간
- 20분. 초과 시 트랙 수를 줄이지 말고 각 트랙의 조사 깊이/사례 수를 축소(단, 해외 메커니즘 ≥3은 유지).

## 12. 완료 조건
- 6개 md + sources.json 존재, 해외 사례 ≥3, integrated-findings에 킥 후보 ≥1.

## 13. 기계적 Gate (Mechanical)
- 명령: `npm run gate:research`
- 분류: **checklist**. 6개 파일 + sources.json 존재 + 체크리스트(해외≥3, 출처 연결, 킥 후보 유무) 출력 → 자가점검.

## 14. LLM Review Gate
- `npm run cross-review -- research/integrated-findings.md` (Codex 우선 → 클로드 폴백).
- 검토: 해외 메커니즘이 실재하고 이식 가능한가, 주장-출처 연결, 국내 중복 회피.

## 15. 사용자 승인 여부
- `humanApproval: false`.

## 16. 실패 시 폴백
- 외부 검색이 막히면 알려진 사례를 메모리 기반으로 기록하되 `sources.json`에 "unverified" 표기. 트랙 생략 금지, 범위만 축소.

## 17. 다음 단계에 전달할 정보
- `research/integrated-findings.md` + 5개 트랙 파일 + `sources.json` (Stage 02 인사이트 도출 입력).

## 18. 금지 사항
- 사례 없이 추측으로 채우지 마라.
- 여기서 방향을 확정하지 마라(인사이트 선택은 Stage 02).

## 19. 단계 완료 보고 형식
- `workflow/templates/stage-report.md` → `workflow/history/stage-01-parallel-research.md`.
