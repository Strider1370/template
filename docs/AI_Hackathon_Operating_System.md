# AI Hackathon Operating System v1.2
## Stage-Based Workflow 정렬판
## P0·P1 정합성 보강판

---

# 0. 문서의 역할

이 문서는 전체 해커톤을 한 번에 실행시키는 마스터 프롬프트가 아니다.

이 문서는 `CLAUDE_Stage_Based_Workflow_Engine_Guide.md`가 정의한 단계 기반 워크플로우에서, 각 단계가 필요할 때 읽는 **기획·판단 품질 기준 라이브러리**다.

상위 실행 기준은 다음과 같다.

```text
실행 순서·현재 단계·상태·Gate·Handoff
→ Stage-Based Workflow Engine Guide가 결정

문제 정의·Insight·JTBD·AI Leverage·차별화·Narrative 품질
→ 이 문서가 결정
```

충돌 시 Stage-Based Workflow Engine의 단계 순서와 상태 규칙을 우선한다.

이 문서는 전체 결과를 한 번에 출력하지 않는다.  
현재 Stage가 요구하는 항목만 사용하고, 결과는 해당 Stage가 지정한 파일에 저장한다.

이 문서는 `stages.yaml.guidance.sections`에 지정된 섹션만 Just-in-Time으로 읽는다.

`workflowMode=bootstrap`일 때는 이 문서를 템플릿 구축 참고자료로 사용하고,  
`workflowMode=run`일 때는 현재 Stage에 연결된 섹션만 실행한다.

---

# 1. 핵심 철학

전체 사고 흐름은 다음과 같다.

```text
주제
→ 문제 정의
→ 관점 전환
→ Insight
→ JTBD
→ AI Leverage
→ 차별화
→ Solution
→ Demonstration
→ Impact
→ Credibility
→ Limitation
→ Guardrail
→ Value Reassertion
→ Expansion
→ Closing
```

단, 이 흐름을 한 번에 수행하지 않는다.  
Stage-Based Workflow가 지정한 단계에서 필요한 부분만 실행한다.

## 1.1 좋은 프로젝트는 기능보다 관점으로 차별화된다

같은 주제를 받은 팀은 대개 비슷한 기능을 만든다.

예:

- AI 챗봇
- 정보 추천
- 위험도 분석
- 신고 도우미
- 알림 통합

따라서 기능을 하나 더 붙이는 것만으로는 기억되기 어렵다.

좋은 프로젝트는 문제를 다르게 본다.

예:

> 재난은 정보 부족 문제가 아니라 대응 능력 격차 문제다.

이 관점은 타깃 사용자, 솔루션 구조, 시연 장면, 발표 메시지까지 바꿔야 한다.

## 1.2 좋은 AI 프로젝트는 AI를 붙인 프로젝트가 아니다

핵심 질문:

> AI가 있기 때문에 무엇이 처음 가능해졌는가?

낮은 수준:

- 챗봇
- 요약
- 추천 문장 생성

중간 수준:

- 기존 업무를 더 빠르게 수행
- 비용 절감
- 반복 작업 자동화

높은 수준:

- 사람을 많이 써야 해서 불가능했던 일
- 경우의 수가 너무 많아 불가능했던 일
- 개별화 비용이 높아 불가능했던 일
- 언어·문맥·상황을 동시에 해석해야 했던 일
- 다수 가설·시나리오·페르소나 병렬 탐색

가능하면 세 번째 수준을 지향한다.

## 1.3 좋은 발표는 설명이 아니라 사용 상상을 만든다

발표의 목표는 심사위원을 다음 상태로 이동시키는 것이다.

```text
평가자
→ 관심자
→ 잠재 사용자
```

발표 종료 후 심사위원이 다음을 생각하게 만들어야 한다.

- 우리 조직에서 쓰면 어떨까?
- 우리 문제에도 적용할 수 있지 않을까?
- 실제 도입하려면 무엇이 필요할까?

---

# 2. 심사위원 모델

## 2.1 심사위원은 피곤하다

- 첫 5초 안에 무엇을 만들었는지 이해되어야 한다.
- 첫 30초 안에 왜 필요한지 이해되어야 한다.
- 2분 안에 실제 작동 증거를 보여야 한다.
- 발표 후 한 문장으로 기억되어야 한다.

## 2.2 심사위원은 이해하려고 노력하지 않는다

피해야 할 것:

- 긴 배경 설명
- 기술 용어 선행
- 기능 나열
- 추상적 가치
- 핵심 주장 지연

## 2.3 심사위원은 계속 의심한다

- 왜 필요한가?
- 기존 방식은 왜 부족한가?
- 왜 AI인가?
- 진짜 동작하는가?
- 무엇이 다른가?
- 한계는 무엇인가?
- 확장 가능한가?

낮은 수준 질문은 발표 안에서 제거하고, 높은 수준 질문만 Q&A에 남긴다.

---

# 3. Stage별 사용 매핑

| 사고 영역 | 사용 Stage | 주요 산출물 |
|---|---|---|
| Theme Analysis | Stage 01 | `research/integrated-findings.md` |
| 국내 사례 해석 | Stage 01 | `research/domestic.md` |
| 해외 사례 해석 | Stage 01 | `research/overseas.md` |
| 사용자 문제·JTBD 탐색 | Stage 01 | `research/jtbd.md` |
| 구현 현실성 | Stage 01 | `research/feasibility.md` |
| 심사위원 관점 | Stage 01 | `research/judge-review.md` |
| Common Assumption | Stage 02 | `workflow/decisions/insight-candidates.md` |
| Observed Reality | Stage 02 | `workflow/decisions/insight-candidates.md` |
| Tension | Stage 02 | `workflow/decisions/insight-candidates.md` |
| Insight 후보 | Stage 02 | `workflow/decisions/insight-candidates.md` |
| 최종 방향 | Stage 02 | `workflow/decisions/selected-direction.md` |
| JTBD 확정 | Stage 03 | `spec.md` |
| AI Leverage 확정 | Stage 03 | `spec.md` |
| Differentiation 확정 | Stage 03 | `spec.md` |
| Solution | Stage 03 | `spec.md` |
| Demo Narrative | Stage 03 | `demo/demo.scenario.yaml` |
| Impact | Stage 03 | `spec.md` |
| Limitation / Guardrail | Stage 03 | `spec.md` |
| 발표 Narrative | Stage 08 | `presentation/script.md` |
| 발표 자기비평 | Stage 08~11 | 각 Stage의 LLM Review Gate |

---

# 4. Stage 01 — 병렬 리서치에서 사용하는 사고 기준

Stage 01에서는 다음 트랙을 병렬로 수행한다.

```text
A. 사용자 문제와 JTBD
B. 국내 사례
C. 해외 사례와 이식 가능한 메커니즘
D. 데이터와 구현 현실성
E. 심사위원 관점과 차별화
```

이 문서는 각 트랙의 품질 기준만 제공한다.  
실행 순서, 서브에이전트 배분, 파일 소유권은 Stage-Based Workflow가 결정한다.

## 4.1 Theme Analysis

반드시 다음을 정리한다.

- 주제의 표면적 의미
- 주최 측이 실제로 기대하는 가치
- 대부분 팀이 선택할 접근 최소 5개
- 이미 흔한 아이디어
- 기술적으로 화려하지만 가치가 약한 방향
- 공공성·실현 가능성·시연 가능성의 균형

## 4.2 국내 사례

단순 서비스 목록이 아니라 다음을 본다.

- 이미 존재하는 기능
- 공공기관과 민간 서비스의 차이
- 사용자가 실제로 겪는 마찰
- 국내 규제·데이터 제약
- 해커톤에서 중복될 가능성이 높은 접근

## 4.3 해외 사례

최소 3개 이상의 실제 사례를 조사한다.

각 사례는 다음을 포함한다.

- 서비스 또는 프로젝트명
- 국가와 기관
- 해결 문제
- 핵심 사용자
- 핵심 메커니즘
- AI 역할
- 사용자 흐름
- 사용 데이터
- 차별적 이유
- 한국 맥락에 이식 가능한 킥
- 4시간 MVP 축소안
- 출처와 확인 시점

기능을 베끼지 말고 **검증된 메커니즘**을 추출한다.

## 4.4 JTBD 탐색

다음 질문에 답한다.

- 사용자는 어떤 상황에서 이 서비스를 필요로 하는가?
- 사용자가 실제로 해결하려는 일은 무엇인가?
- 현재 어떤 대안을 쓰는가?
- 그 대안은 왜 충분하지 않은가?
- 성공했다고 느끼는 기준은 무엇인가?

정리 형식:

```text
Functional Job
Emotional Job
Social Job
Current Alternative
Failure Cost
Success Criteria
```

## 4.5 구현 현실성

- 4시간 안에 시연 가능한가?
- 실시간 API가 꼭 필요한가?
- 정적 데이터나 fixture로 대체 가능한가?
- 가장 위험한 외부 의존성은 무엇인가?
- 데모에 직접 보이지 않는 구현은 무엇인가?
- 핵심 경로를 가장 짧게 만들 수 있는가?

### 데이터 모집단 원칙 — 전수 우선

실사용 가능한 데모는 "검색·필터·매칭의 모집단이 전수(전체 카탈로그)"여야 한다.

- 데이터는 **전수**를 기본 모집단으로 적재한다. "예시 N개"는 **화면 표시 개수**일 뿐, 검색·필터·매칭의 대상은 전체여야 한다.
- 모집단을 샘플 몇 개로 줄여 구현하지 말 것 — 그건 실사용이 아니라 시연용 껍데기가 된다.
- 시간이 부족하면 데이터를 줄이지 말고 **보여줄 화면 수(기능 범위)** 를 줄인다.
- 규칙 가드: 전수 *데이터*의 사전 적재는 허용되나, 완성형 *미션 답안 서비스*는 당일 조립한다.

## 4.6 심사위원 관점

- 심사위원이 이미 여러 번 봤을 기능은 무엇인가?
- 첫 30초에 무엇을 이해해야 하는가?
- 가장 강한 의심은 무엇인가?
- 데모에서 보이는 킥은 무엇인가?
- 기억에 남는 한 문장은 무엇인가?

---

# 5. Stage 02 — Insight 선택에서 사용하는 사고 기준

## 5.1 Insight 구조

좋은 Insight는 다음 구조를 가진다.

```text
Common Assumption
→ Observed Reality
→ Tension
→ Reframing
```

예:

```text
Common Assumption:
재난 상황에서는 더 많은 정보를 제공해야 한다.

Observed Reality:
정보는 이미 많지만 사람마다 실제 행동은 다르다.

Tension:
같은 정보가 모든 사람에게 같은 대응을 가능하게 하지 않는다.

Reframing:
재난은 정보 부족 문제가 아니라 대응 능력 격차 문제다.
```

## 5.2 Insight 후보 생성

최소 5개 후보를 만든다.

각 후보 평가 항목:

- 새로움
- 설득력
- 근거 가능성
- AI 연결성
- 시연 가능성
- 4시간 구현 가능성
- 위험한 전제

## 5.3 나쁜 Insight

다음은 Insight가 아니다.

- AI로 더 편리하게 만든다.
- 정보를 한곳에 모은다.
- 사용자 맞춤형 서비스를 제공한다.
- 사회적 가치를 높인다.

이런 문장은 Solution이나 Benefit일 수 있지만, 문제를 새롭게 보는 관점은 아니다.

## 5.4 최종 방향 선택

Stage 02에서는 최종 방향을 2~3개로 압축해 사용자에게 제시한다.

사용자 승인 전에는 `selected-direction.md`를 확정본으로 처리하지 않는다.

---

# 6. Stage 03 — Spec 확정에서 사용하는 사고 기준

`spec.md`에는 확정된 내용만 넣는다.

포함:

- Answer First
- Problem
- 최종 Insight
- JTBD
- AI Leverage
- Differentiation
- Solution
- 핵심 기능
- Demo Scenario
- Wow Moment
- Impact
- Credibility
- Limitation
- Guardrail
- Closing Message
- 범위 밖
- 4시간 현실성

제외:

- 전체 리서치 원문
- 탈락한 Insight 후보
- 상세 구현 계획
- 발표 전체 스크립트
- 레이아웃 메타데이터

## 6.1 Answer First

한 문장으로 다음을 포함한다.

```text
누구를 위해
무엇을
어떻게 해결하는가
```

## 6.2 Problem

- 사용자
- 사용 상황
- 현재 방식
- 현재 방식의 실패
- 실패 비용

## 6.3 JTBD

- Functional Job
- Emotional Job
- Social Job
- Current Alternative
- Success Criteria

## 6.4 AI Leverage

반드시 다음을 구분한다.

```text
AI 없이도 가능한 것
AI로 더 빠르고 싸지는 것
AI 때문에 처음 가능해지는 것
```

그리고 다음을 명시한다.

- AI가 맡는 역할
- AI가 하지 않는 역할
- 오류 가능성
- 사람이 최종 판단해야 하는 부분

## 6.5 Differentiation

차별화는 다음 순서로 평가한다.

```text
기능 차별화
< 사용자 흐름 차별화
< 시연 차별화
< Insight 차별화
< Narrative 차별화
```

가능하면 상위 단계의 차별화를 만든다.

## 6.6 Solution

다음 구조를 따른다.

```text
입력
→ AI/시스템 처리
→ 출력
→ 사용자의 다음 행동
```

추상 흐름만 적지 말고, **이 화면에 실제로 보이는 입력 요소(필드·컨트롤)와 출력 요소(결과 표시)를 구체적으로 나열**한다. 데모 시나리오(§8)·Wow Moment(§9)와 일치시킨다.

```text
입력 요소:  [지역 선택, 나이, 가구원수, ...]
출력 요소:  [혜택 카드 목록(이름·금액·신청처), 지도, "왜 해당되는지", ...]
```

## 6.7 Demonstration

데모는 기능 목록이 아니라 하나의 짧은 이야기여야 한다.

- 구체적 사용자
- 구체적 상황
- 구체적 입력
- 구체적 변화
- Wow Moment
- 성공 기준
- 실패 시 폴백

## 6.8 Impact

근거 없는 숫자를 만들지 않는다.

정량 근거가 없으면 다음처럼 표현한다.

- 단계 감소
- 검토 범위 증가
- 개인화 수준 상승
- 의사결정 시간 단축 가능성
- 누락 가능성 감소

## 6.9 Credibility

가장 강한 의심 하나를 먼저 다룬다.

- 데이터 근거
- 실제 작동 증거
- 제한된 사용 범위
- 사람 검토 지점

## 6.10 Limitation

다음 세 수준으로 나눈다.

```text
Soft Limitation
Bounded Limitation
Hard Limitation
```

## 6.11 Guardrail

- 잘못된 결과를 어떻게 표시하는가
- 최종 책임은 누구에게 있는가
- 어떤 경우 사용하지 않아야 하는가
- 사람이 개입하는 지점은 어디인가
- **핵심 경로는 AI 자유분류에 맡기지 않는다.** 관청·처리 URL·대분류 같은 결정적이어야 하는 것은 키워드 라우팅 등으로 **고정**한다 — 데모 밖 입력에서 AI가 엉뚱하게 분류한다(실측). 사안별로 위치 성격도 다름(관할고정·온라인처리 vs 방문형).

---

# 7. Stage 08 — 발표 스크립트에서 사용하는 사고 기준

Stage 08은 실제 구현 상태를 기준으로 한다.

필수 입력:

```text
implementation/manifest.json
workflow/history/stage-06-integration.md
workflow/history/stage-07-demo-validation.md
```

`implementation/manifest.json`에서 `implemented` 또는 허용된 `mocked/fallback` 상태가 아닌 기능은 발표에서 확정적으로 주장하지 않는다.

구현되지 않은 기능을 스크립트에 넣지 않는다.

권장 흐름:

```text
Answer First
→ Problem
→ Insight
→ Solution
→ Demo
→ Mechanism
→ Impact
→ Limitation / Guardrail
→ Expansion
→ Closing
```

## 7.1 시간 배분

5분 발표 기준:

- Answer First + Problem: 40~50초
- Insight + Solution: 40~50초
- Demo + Wow Moment: 최소 2분
- Mechanism: 20~30초
- Impact + Guardrail: 30~40초
- Closing: 15~20초

## 7.2 발표 질문 수준

발표 안에서 제거해야 하는 질문:

- 그래서 뭐 하는 서비스인가요?
- 사용자는 누구인가요?
- 왜 AI인가요?
- 실제로 작동하나요?
- 기존 방식과 뭐가 다른가요?

Q&A에 남겨도 좋은 질문:

- 실제 도입 시 책임 구조
- 다른 기관으로 확장 방법
- 데이터 운영 체계
- 장기적 사업화 또는 정책 적용

## 7.3 발표 문장 규칙

- 한 문장을 짧게 쓴다.
- 기능명보다 사용자 변화를 말한다.
- 첫 문장에서 결과물을 설명한다.
- 긴 배경설명을 하지 않는다.
- 데모 전환 문장을 명시한다.
- 마지막 문장은 최종 Insight와 연결한다.

---

# 8. 단계별 LLM Review Gate 기준

기존의 마지막 Self-Critique를 각 단계로 분산한다.

## Stage 01 Review

- 출처 없는 해외 사례가 있는가?
- 단순 기능 목록에 그쳤는가?
- 구현 현실성 검토가 빠졌는가?

## Stage 02 Review

- Insight가 수사적 문장에 불과한가?
- Solution을 Insight처럼 포장했는가?
- AI 연결이 억지인가?
- 사용자의 승인 없이 확정했는가?

## Stage 03 Review

- spec에 후보와 확정안이 섞였는가?
- AI가 하지 않는 역할이 명시됐는가?
- Demo Wow Moment가 화면에서 검증 가능한 형태로 정의되었고 selector/assertion 계획이 존재하는가?
- 범위가 4시간을 초과하는가?

## Stage 07 Review

- Wow Moment가 실제 화면에 존재하는가?
- Playwright assertion이 통과하는가?
- 캡처에서 Wow Moment가 명확하게 보이는가?

## Stage 08 Review

- 발표와 실제 구현이 일치하는가?
- 낮은 수준 질문이 남아 있는가?
- 데모 시간이 충분한가?
- 근거 없는 숫자가 있는가?

## Stage 11 Review

- 제한 시간을 초과하는가?
- 라이브 데모 실패 시 대체 가능한가?
- 심사위원이 기억할 한 문장이 남는가?
- 한계와 Guardrail이 신뢰를 높이는 방식으로 제시됐는가?

---

# 9. 금지 사항

- 이 문서를 읽고 전체 결과를 한 번에 출력하지 않는다.
- 현재 Stage 밖의 산출물을 미리 확정하지 않는다.
- 사용자 승인 전 최종 Insight를 확정하지 않는다.
- 모든 리서치를 `spec.md`에 넣지 않는다.
- AI를 붙였다는 이유만으로 AI Leverage가 있다고 주장하지 않는다.
- 기능 수로 차별화를 설명하지 않는다.
- 구현되지 않은 기능을 발표에 넣지 않는다.
- 근거 없는 수치를 만들지 않는다.
- 한계를 숨기지 않는다.

---

# 10. 최종 요약

이 문서는 다음 질문에 답한다.

```text
무엇을 어떻게 생각해야 하는가?
```

Stage-Based Workflow Engine은 다음 질문에 답한다.

```text
언제 무엇을 읽고, 어떤 파일을 만들며, 언제 다음 단계로 넘어가는가?
```

두 문서는 함께 사용하되, 실행 순서와 상태 전환은 항상 Stage-Based Workflow Engine이 우선한다.


---

# 11. P1 품질 보강 규칙

## 11.1 Claim–Source 연결

문제 정의, 시장·사회 현황, 정책·통계 수치 등 검증 가능한 주장은 `research/sources.json`의 출처 ID와 연결한다.

근거 없는 수치나 최신 사실을 만들지 않는다.

## 11.2 개인정보와 안전

- 실제 개인정보를 데모 입력값으로 사용하지 않는다.
- 가상 페르소나와 익명 fixture를 사용한다.
- 외부 LLM에 민감정보를 전송하지 않는다.
- 의료·법률·재난 등 고위험 영역에서는 AI의 역할과 최종 판단 주체를 명시한다.

## 11.3 구현 상태의 표현

기능 상태를 다음처럼 구분한다.

```text
implemented
mocked
fallback
dropped
blocked
```

발표에서는 mocked/fallback을 실제 완전 구현처럼 표현하지 않는다.

## 11.4 시간 부족 시 판단 원칙

시간이 부족하면:

```text
단계 생략
X

기능 범위 축소
→ 데모 경로 유지
→ 검증과 발표 시간 확보
O
```
