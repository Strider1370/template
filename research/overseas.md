# 트랙 C — 해외 사례 + 이식 가능한 메커니즘 (Stage 01 리서치)

> 주제: "민원·행정정보 접근성을 높이는 챗봇 또는 검색 서비스"
> 방향 가중치: **B(절차 안내형)** · **C(쉬운 말 번역형)**
> 이 보고서의 목적: 기능을 베끼지 않고 **검증된 메커니즘**을 추출 → 한국 맥락 이식 킥 + 4시간 MVP 축소안 제시.
> 확인 시점: 2026-06-20. 웹 검색 정상 작동(verified). 미확인 항목은 개별 표기.

---

## 요약 — 확보한 해외 사례 7개
1. **GOV.UK (영국 GDS)** — Plain English + Step-by-step 여정 + Tell Us Once
2. **Estonia Bürokratt / KrattAI** — 단일 채널 국가 AI 비서 네트워크
3. **GetCalFresh (미국 Code for America)** — 복지 신청 간소화 + 자격 사전판정
4. **Singapore Ask Jamie → VICA / LifeSG (GovTech)** — 전정부 단일 챗봇 → LLM 전환 + 생애주기 통합앱
5. **France Albert (DINUM/Etalab) + France Services** — 상담원 보조 RAG, 출처 강제
6. **NYC MyCity 챗봇** — **실패 사례(반면교사)**: 환각이 위법 조언으로
7. **GOV.UK Tell Us Once** (별도 강조) — "한 번 입력 → 다기관 전파"

핵심 결론(미리): B·C 방향에서 **가장 안전하고 데모 가능한 킥 3개**는
(1) **Plain-language 재작성**(C), (2) **'다음 할 일' 단계화 = step-by-step**(B), (3) **출처 강제 + 신뢰 출처 단일화**(B·C 공통, ⑦ 신뢰 문제 직격). NYC 실패가 (3)의 필요성을 증명한다.

---

## 1. GOV.UK — 영국 정부 단일 포털 (GDS, Government Digital Service)

- **서비스/프로젝트명**: GOV.UK (콘텐츠 디자인 표준 + Step-by-step navigation + Tell Us Once)
- **국가·기관**: 영국 / Government Digital Service (GDS, Cabinet Office 산하)
- **해결 문제**: 부처별로 흩어진 행정 정보 → 시민이 "어디 소관인지"부터 모름. 공문체·전문용어로 이해 장벽.
- **핵심 사용자**: 모든 시민(낮은 문해력 포함). "처음 겪는 일"(결혼·이혼·사망신고·출생)을 하는 first-time 사용자.
- **핵심 메커니즘**:
  - **Plain English 강제** — GOV.UK Style Guide가 피해야 할 복잡한 단어/표현을 규정. "높은 문해력 사용자도 plain English를 선호한다(빨리 이해되니까)"는 리서치 기반.
  - **Step-by-step navigation** — 복잡한 일(결혼·사망신고 등)을 **끝에서 끝까지의 논리적 단계**로 쪼개고 각 단계마다 필요한 콘텐츠 링크. 현재 40개 이상의 step-by-step 여정 운영.
  - **접근성 내장** — 400% 확대 시 텍스트 안 깨짐, 키보드/음성 네비, 색·대비·폰트 사용자 조정.
- **AI 역할**: (핵심은 AI 아님) 콘텐츠 디자인·정보구조가 본질. → **B 방향의 "AI 없이도 가치 있는 뼈대"**를 증명. AI는 plain-language 재작성·검색 매칭에 얹는 레이어.
- **사용자 흐름**: 시민 언어로 검색 → 생애 이벤트 페이지 → step-by-step 단계 리스트 → 각 단계의 "무엇을·어디서·뭘 들고".
- **사용 데이터**: 정부 공식 콘텐츠(단일 권위 출처). 비공식 블로그 배제 = ⑦ 신뢰/최신성 해결.
- **차별적 이유**: 세계 전자정부 콘텐츠 디자인의 사실상 표준. "기능"이 아니라 **글쓰기 규율 + 정보구조**가 자산.
- **한국 이식 킥**: 시민 언어 검색어 → **공문/법령 용어를 쉬운 말로 변환**(C) + **'다음 할 일' 단계 리스트**(B). KRDS 디자인과 결합하면 "공공 룩"까지 무료.
- **4시간 MVP 축소안**: 1~2개 생애 민원(예: 전입신고, 실업급여 신청)만 골라 LLM이 step-by-step 카드(단계·필요서류·관할기관·소요기간)를 생성. step 데이터는 사전 큐레이션 JSON 1개로 신뢰 고정.
- **출처/확인**: gov.uk content design guide, design-system step-by-step pattern, OECD-OPSI. 2026-06-20 확인.

---

## 2. Estonia Bürokratt / KrattAI — 국가 AI 비서 네트워크

- **서비스/프로젝트명**: Bürokratt (전략명 KrattAI)
- **국가·기관**: 에스토니아 / RIA(정보시스템청). 2020년 개발 시작, 2022년 첫 공식 버전.
- **해결 문제**: 기관별로 따로 노는 서비스를 **단일·통합 채널**로. "정부가 하나처럼 느껴지게."
- **핵심 사용자**: 일상 에스토니아어를 쓰는 일반 시민. 24/7.
- **핵심 메커니즘**:
  - **단일 채널(single united channel)** — 여러 솔루션을 상호운용 네트워크로 묶어 한 입구에서 공공 절차 수행. = ① 정보 파편화 직격.
  - **에스컬레이션** — 정보 안내 후 필요하면 사람 상담원으로 연결(완전 자동화 고집 X = 신뢰 확보).
  - **상호운용 네트워크 비전** — 각 기관의 AI 비서들이 서로 연결되는 구조(2026~ 개인화 AI 에이전트, 에스토니아 특화 LLM 구축으로 확장).
- **AI 역할**: 자연어 이해 + 라우팅(어느 기관 소관인지 판단) + 음성 인터랙션.
- **사용자 흐름**: 시민이 일상어로 질문 → 비서가 공공 서비스 정보 안내/직접 수행 → 필요 시 상담원 전달.
- **사용 데이터**: 각 기관 서비스 API의 상호운용 네트워크.
- **차별적 이유**: UNESCO 글로벌 top 100 AI 프로젝트. "AI 시대에 정부가 디지털로 어떻게 작동해야 하나"의 개념 모델.
- **한국 이식 킥**: **라우팅 = "어느 기관 소관인가"를 먼저 판정**(B의 ① 파편화 해결). 시민 언어 질문 → 관할 기관 + 입구 링크.
- **4시간 MVP 축소안**: 전국 상호운용 네트워크는 불가 → "이 민원은 어느 기관/창구 소관" 라우팅을 LLM 분류 + regions.ts(시도→시군구) 매핑으로 데모. 실제 API 연동 대신 안내 카드.
- **출처/확인**: EU Interoperable Europe OSOR case study, RIA.ee, GovInsider, Digital Watch. 2026-06-20 확인.

---

## 3. GetCalFresh — 복지 신청 간소화 (미국 Code for America)

- **서비스/프로젝트명**: GetCalFresh.org (캘리포니아 SNAP/식품지원 신청 도우미)
- **국가·기관**: 미국 캘리포니아 / Code for America + CA Dept of Social Services(CDSS). 2014 시작, 58개 카운티 전역 확대.
- **해결 문제**: 복지 신청 양식이 너무 길고 행정 언어라 **자격 있어도 못 받음(③ 대상 판단 복잡 + ④ 절차 불투명)**.
- **핵심 사용자**: 저소득층 신청자(낮은 디지털 문해력 포함).
- **핵심 메커니즘**:
  - **양식 간소화** — 신청 제출 시간을 **10분 미만**으로 단축. 신청률·참여율 상승(2014년 SNAP 참여율 66% → 2022년 81%).
  - **시민 언어로 질문 재설계** — 소득을 "사람들이 이해하는 방식"으로 물음(시급으로 묻는 게 세전소득 계산에 가장 쉽다는 테스트 결과).
  - **개인화된 yes/no 자격 사전판정** — 고객 데이터로 "현금 $250 미만인가요?" 같은 단순화된 개인 맞춤 질문 생성. = 자격 기대치 사전 설정.
- **AI 역할**: (초기엔 룰 기반 UX 중심) AI보다 **사용자 중심 설계 + 자격 로직 코드화("policy becomes code")**가 본질.
- **사용자 흐름**: 시민 언어 질문 위저드 → 자격 사전판정(yes/no) → 간소화된 신청 → 제출.
- **사용 데이터**: SNAP 자격 규정을 코드로 변환한 룰.
- **차별적 이유**: "delivery-driven government"의 대표작. 측정 가능한 임팩트(참여율 +15%p).
- **한국 이식 킥**: **자격 사전판정 위저드**(A 보조 방향과 연결) + **시민 언어로 질문 재작성**(C). "받을 수 있나?"를 몇 개 질문으로 즉답.
- **4시간 MVP 축소안**: 1개 지원금(예: 청년월세, 긴급복지)에 대해 5~7개 질문 위저드 → 자격 yes/no + "다음 할 일". 룰은 하드코딩 JSON(전수 모집단, 화면만 1개 제도로 축소).
- **출처/확인**: codeforamerica.org success stories / news, StateScoop. 2026-06-20 확인.

---

## 4. Singapore Ask Jamie → VICA / LifeSG (GovTech)

- **서비스/프로젝트명**: Ask Jamie(전정부 챗봇) → VICA(차세대 LLM 챗봇 플랫폼) + LifeSG(생애주기 통합 앱)
- **국가·기관**: 싱가포르 / GovTech. Ask Jamie 2014 구상, 70+ 기관 사이트 적용. VICA로 2023년 LLM 전환.
- **해결 문제**: 방문자 문의의 약 절반이 "일반 문의" → 반복 단순 질문을 자동화. 흩어진 서비스를 생애주기로 통합.
- **핵심 사용자**: 일반 시민/거주자(출생·육아·사망·일상).
- **핵심 메커니즘**:
  - **전정부 단일 챗봇** — 한 봇을 70+ 기관에 배치, 각 도메인 내 질의 응답하도록 학습. (단, 도메인 격리 = 환각 위험 관리)
  - **음성 확장(Ask Jamie Voice)** — 전화도 음성인식으로 응대.
  - **LLM 전환(VICA)** — 룰 기반 → LLM 엔진으로 전체 이전. NLP/ML 기반 차세대 플랫폼.
  - **LifeSG 생애주기 통합** — 주택 신청부터 진료 예약 확인·민원 신고까지 200개 서비스를 한 앱에.
- **AI 역할**: NLU + 도메인별 응답. VICA부터 본격 LLM.
- **사용자 흐름**: 기관 사이트 위젯에서 질문 → 도메인 내 답변 → (LifeSG는) 생애 이벤트별 서비스 묶음.
- **사용 데이터**: 각 기관 FAQ/콘텐츠.
- **차별적 이유**: 전정부 스케일 + 룰→LLM 전환의 실제 운영 사례. 단, 과거 COVID 오답으로 MOH가 일시 중단한 적 있음 = **도메인 밖 질문의 위험**을 보여줌(NYC와 같은 교훈).
- **한국 이식 킥**: **생애 이벤트(LifeSG) 단위 묶음**(B) + 위젯형 단일 챗봇. 단, 도메인 격리 필수.
- **4시간 MVP 축소안**: LifeSG식 "생애 이벤트 1개"(예: 전입/출산) 카드 묶음 + 그 안에서만 답하는 챗봇(범위 밖이면 "담당 창구 안내"로 폴백).
- **출처/확인**: tech.gov.sg, GovInsider, vica.gov.sg, Tech Wire Asia(COVID 사례). 2026-06-20 확인.

---

## 5. France Albert (DINUM/Etalab) + France Services

- **서비스/프로젝트명**: Albert (프랑스 국가 주권 LLM) + France Services 창구 보조
- **국가·기관**: 프랑스 / DINUM 내 Etalab. 2024-04-24 공식 출시.
- **해결 문제**: 시민의 온라인 행정 요청에 상담원이 **정확·검증가능·행정 톤**으로 빠르게 답하도록 보조.
- **핵심 사용자**: France Services 상담 직원(시민 직접 대면 X = 안전 설계).
- **핵심 메커니즘**:
  - **상담원 보조(공무원 대체 아님)** — 답변 후보 + **출처(state 정보 출처) + 유용한 링크/실무 시트**를 함께 제시. = 사람이 최종 검증.
  - **출처·검증가능성 강제** — 국가 정보를 올바르게 사용하고 verifiable content 생산하도록 설계. ⑦ 신뢰 직격.
  - **주권 AI(오픈소스)** — Meta Llama 3.1 + Mistral 생태계 기반으로 데이터·실행환경 통제.
- **AI 역할**: RAG 기반 답변 후보 + 출처 제시(휴먼 인 더 루프).
- **사용자 흐름**: 시민 요청 → 상담원이 Albert로 답변 후보+출처 확인 → 검증 후 시민에게 전달.
- **사용 데이터**: 국가 행정 데이터/실무 시트.
- **차별적 이유**: "시민에게 직접 LLM을 노출하지 않고 상담원을 증강"하는 **안전한 배치 모델**. (단, 2026 초 France Services 적용이 중단/축소됐다는 보도 있음 — *partially unverified*, 운영 지속성은 불확실하나 **설계 원칙은 유효**.)
- **한국 이식 킥**: **출처 강제 RAG** — 모든 답변에 공식 출처 링크를 붙여 환각·불신을 차단(B·C 공통). 시민 직접 노출 버전이면 "이 답의 근거" 칩을 항상 표시.
- **4시간 MVP 축소안**: 챗봇 답변마다 "근거: [공식 페이지 제목·링크]"를 강제 표시. 근거 없으면 "확실하지 않음 → 담당 창구" 폴백. (LLM 프롬프트에 출처 인용 의무화 + 사전 큐레이션 문서 N개.)
- **출처/확인**: blog.economie-numerique.net, info.gouv.fr, ai.gov.uk 블로그, Acteurs Publics(중단 보도). 2026-06-20 확인.

---

## 6. NYC MyCity 챗봇 — 실패 사례 (반면교사, 필수)

- **서비스/프로젝트명**: MyCity 비즈니스 지원 챗봇
- **국가·기관**: 미국 뉴욕시 / NYC Dept of Small Business Services + Microsoft Azure AI. 2023-10 출시.
- **해결 문제**: 소상공인이 복잡한 지역 규제를 헤쳐나가게 돕겠다는 의도.
- **핵심 메커니즘(실패한)**:
  - **공식 출처 없이 LLM이 자유 생성** → 환각이 **위법 조언**으로. 예: "직원 팁을 떼도 되나?" → "네 가능합니다"(실제 노동법 위반). 성희롱 신고자 해고·임신 미고지 해고가 합법이라 답변. 현금 안 받는 영업 가능하다고 답(2020년 뉴욕시 금지).
  - **면책 문구에만 의존** — "부정확할 수 있음, 법률 자문 아님" 디스클레이머는 있었으나 본질적 안전장치 부재.
- **결과**: 대규모 비판 → 검토. 이후 폐지(차기 시장이 종료).
- **차별적 이유(교훈)**:
  - **출처 강제 + 도메인 격리 없이 LLM을 시민에게 직접 노출하면 위법·위해 답변이 나온다.**
  - 행정/법 도메인은 환각 비용이 특히 크다(시민이 실제로 따라 행동).
- **한국 이식 킥(안티패턴 → 설계 원칙)**:
  1. **답변은 반드시 큐레이션된 공식 출처에 근거**(프랑스 Albert식). 근거 없으면 답하지 말 것.
  2. **도메인 격리** — 범위 밖 질문은 "담당 창구 안내"로 폴백(싱가포르 교훈).
  3. **확신 없으면 '모름' + 사람 연결**(에스토니아 에스컬레이션).
  4. 면책 문구는 보조일 뿐, 안전장치가 아니다.
- **4시간 MVP 함의**: 우리 데모에서 **"근거 칩 + 범위 밖 폴백 + 모름 인정"**을 반드시 보여주면, 심사위원에게 "NYC 실패를 피한 설계"로 차별화 가능.
- **출처/확인**: The Markup, SHRM, Futurism, Envive case study. 2026-06-20 확인.

---

## 7. GOV.UK Tell Us Once (별도 강조 — "한 번 입력, 다기관 전파")

- **서비스/프로젝트명**: Tell Us Once (사망 신고 통합)
- **국가·기관**: 영국 / HM Government. GOV.UK step-by-step에 통합.
- **핵심 메커니즘**: 사망을 **한 번만 신고**하면 HMRC·DWP·여권청·DVLA·지방의회·연금 등 다수 기관에 **자동 전파**. = ① 파편화 + ④ 절차 반복 직격.
- **한국 이식 킥**: 실제 다기관 연동은 4시간 불가지만, **"한 입력 → 관련 기관·절차 전부 펼쳐줌"**의 UX는 데모 가능. 시민 언어 1개 상황 → 연관된 모든 후속 절차 체크리스트 자동 생성(B의 step-by-step + 통합).
- **4시간 MVP 축소안**: "출산했어요" 입력 → 출생신고·아동수당·육아휴직·예방접종 등 후속 절차를 한 화면 체크리스트로 펼침(데이터는 큐레이션 JSON).
- **출처/확인**: gov.uk/after-a-death, OECD-OPSI step-by-step. 2026-06-20 확인.

---

## 이식 가능한 킥 후보 — B·C 방향과 연결 (최종 정리)

> 추출 원칙: 기능 복제 X, **검증된 메커니즘** O. 각 킥에 출처 사례·정조준 원인(intake ①~⑦)·데모 난이도 표기.

### C 방향 (쉬운 말 번역형) — 정조준 원인 ②용어난해 ⑥디지털격차
- **K1. Plain-language 재작성** (출처: GOV.UK, GetCalFresh, France Albert)
  - 공문/법령 한자어 → 쉬운 말 + "이게 무슨 뜻인지" 풀이. **데모 난이도: 낮음(LLM 1콜).** C의 핵심 킥.
- **K2. '그래서 뭘 해야 하나' 행동지시화** (출처: GetCalFresh 시민언어 질문, GOV.UK step)
  - 번역에 그치지 않고 "당신이 지금 할 일 1·2·3"로 변환. **데모 난이도: 낮음.**

### B 방향 (절차 안내형) — 정조준 원인 ①파편화 ④절차불투명 ⑤검색미스매치
- **K3. '다음 할 일' 단계화 (step-by-step)** (출처: GOV.UK step-by-step, Tell Us Once)
  - 민원을 끝까지의 단계 카드(무엇·어디서·필요서류·소요기간)로. **데모 난이도: 중(큐레이션 JSON + LLM).** B의 핵심 킥.
- **K4. 관할 기관 라우팅("어디 소관인가")** (출처: Estonia Bürokratt)
  - 시민 언어 질문 → 담당 기관/창구 판정 + 입구 링크. regions.ts와 결합. **데모 난이도: 중.**
- **K5. "한 입력 → 연관 절차 전부 펼침"** (출처: Tell Us Once, LifeSG 생애주기)
  - 1개 생애 이벤트 입력 → 후속 절차 체크리스트 자동 생성. **데모 난이도: 중(Wow 큼).**

### B·C 공통 — ⑦ 신뢰·최신성 직격 (★ 가장 중요, 차별화 포인트)
- **K6. 출처 강제 RAG + '근거 칩'** (출처: France Albert; 반면교사: NYC MyCity)
  - 모든 답변에 공식 출처 링크 표시. 근거 없으면 답 안 함. **데모 난이도: 중. 신뢰=심사 차별화 핵심.**
- **K7. 도메인 격리 + 범위 밖 폴백 + '모름' 인정 + 사람 연결** (출처: Singapore, Estonia; 반면교사: NYC)
  - 범위 밖이면 "담당 창구 안내", 확신 없으면 솔직히 모름. **데모 난이도: 낮음. 위험 회피 = 데모 안정성.**

### 메인 에이전트께 추천(트랙 C 관점, 결정은 Stage 02)
- **가장 안전+임팩트 조합**: C의 **K1(쉬운 말 재작성)** + B의 **K3(단계화)** + 공통 **K6(근거 칩)/K7(폴백)**.
  - 이유: K1·K3은 데모가 확실히 돌아가고(LLM + 큐레이션 JSON), K6·K7은 NYC 실패를 피한 "신뢰되는 행정 AI"로 심사 차별화. ⑦ 신뢰 문제(intake가 "둘 다 직결"이라 명시)를 정면으로 푼다.
- **Wow를 키우려면** K5("한 입력 → 절차 전부 펼침")를 1개 생애 이벤트로 추가 — 단 화면 수를 줄이고 데이터는 전수 큐레이션.

---

## 출처(sources)

```json
[
  {"id":"govuk-content-design","title":"Content design: writing for GOV.UK","url":"https://www.gov.uk/guidance/content-design/writing-for-gov-uk","publisher":"GOV.UK / GDS","accessedAt":"2026-06-20","usedFor":["case-1","K1"],"claim":"Plain English 강제; 높은 문해력 사용자도 plain English 선호(빨리 이해)."},
  {"id":"govuk-stepbystep-pattern","title":"Step by step navigation pattern","url":"https://design-system.service.gov.uk/patterns/step-by-step-navigation","publisher":"GOV.UK Design System","accessedAt":"2026-06-20","usedFor":["case-1","K3"],"claim":"복잡한 일을 끝에서 끝까지 논리적 단계로 분해, 단계마다 콘텐츠 링크."},
  {"id":"opsi-govuk-stepbystep","title":"GOV.UK step-by-step navigation","url":"https://oecd-opsi.org/innovations/gov-uk-step-by-step-navigation/","publisher":"OECD-OPSI","accessedAt":"2026-06-20","usedFor":["case-1","case-7","K3"],"claim":"40개 이상 step-by-step 여정 운영."},
  {"id":"govuk-tell-us-once","title":"What to do after someone dies: Tell Us Once","url":"https://www.gov.uk/after-a-death/organisations-you-need-to-contact-and-tell-us-once","publisher":"GOV.UK","accessedAt":"2026-06-20","usedFor":["case-7","K5"],"claim":"사망 1회 신고로 HMRC·DWP·여권청·DVLA·지방의회·연금에 자동 전파."},
  {"id":"govuk-accessibility","title":"How we made GOV.UK more accessible","url":"https://accessibility.blog.gov.uk/2020/12/17/how-we-made-gov-uk-more-accessible/","publisher":"GOV.UK Accessibility blog","accessedAt":"2026-06-20","usedFor":["case-1"],"claim":"400% 확대 시 비파괴, 키보드/음성 네비, 색·대비 사용자 조정."},
  {"id":"burokratt-osor","title":"Digital public services based on open source: case study on Bürokratt","url":"https://interoperable-europe.ec.europa.eu/collection/open-source-observatory-osor/document/digital-public-services-based-open-source-case-study-burokratt","publisher":"EU Interoperable Europe (OSOR)","accessedAt":"2026-06-20","usedFor":["case-2","K4"],"claim":"상호운용 솔루션 네트워크로 단일 플랫폼에서 공공 절차 수행, 2020 시작·2022 첫 버전."},
  {"id":"burokratt-ria","title":"Bürokratt | RIA","url":"https://www.ria.ee/en/state-information-system/personal-services/burokratt","publisher":"RIA (Estonia)","accessedAt":"2026-06-20","usedFor":["case-2","K4","K7"],"claim":"일상 에스토니아어 이해, 24/7, 정보 안내 후 필요 시 상담원 연결."},
  {"id":"burokratt-govinsider","title":"Estonia eyes cross-border interoperability for Bürokratt","url":"https://govinsider.asia/intl-en/article/estonia-eyes-cross-border-interoperability-for-burokratt-its-siri-of-public-services","publisher":"GovInsider","accessedAt":"2026-06-20","usedFor":["case-2"],"claim":"2026~ 개인화 AI 에이전트·에스토니아 특화 LLM·국경 간 상호운용 확장."},
  {"id":"getcalfresh-success","title":"Simplifying California's Online Application for Food Benefits","url":"https://codeforamerica.org/success-stories/simplifying-californias-online-application-for-food-benefits/","publisher":"Code for America","accessedAt":"2026-06-20","usedFor":["case-3","K1","K2"],"claim":"신청 시간 10분 미만으로 단축; 시민이 이해하는 방식으로 소득 질문(시급)."},
  {"id":"getcalfresh-eligibility","title":"Overcoming Barriers: Setting Expectations for CalFresh Eligibility","url":"https://codeforamerica.org/news/overcoming-barriers-setting-expectations-for-calfresh-eligibility/","publisher":"Code for America","accessedAt":"2026-06-20","usedFor":["case-3"],"claim":"고객 데이터로 개인화된 yes/no 자격 사전판정 질문 생성."},
  {"id":"getcalfresh-statewide","title":"California Launches GetCalFresh in all 58 Counties","url":"https://codeforamerica.org/news/california-launches-code-for-americas-getcalfresh-in-all-58-counties/","publisher":"Code for America","accessedAt":"2026-06-20","usedFor":["case-3"],"claim":"전 카운티 확대; SNAP 참여율 2014년 66%→2022년 81%."},
  {"id":"askjamie-govtech","title":"Get to know the GovTech team behind Ask Jamie","url":"https://www.tech.gov.sg/technews/govtech-team-behind-ask-jamie-government-chatbot/","publisher":"GovTech Singapore","accessedAt":"2026-06-20","usedFor":["case-4","K7"],"claim":"문의 절반이 일반 문의; 70+ 기관 적용; 도메인별 학습; 음성 응대."},
  {"id":"vica-govinsider","title":"Inside GovTech's refresh of government chatbots (VICA)","url":"https://govinsider.asia/intl-en/article/is-it-time-to-say-goodbye-to-ask-jamie-inside-govtechs-refresh-of-government-chatbots","publisher":"GovInsider","accessedAt":"2026-06-20","usedFor":["case-4"],"claim":"2023년까지 모든 챗봇을 LLM 엔진(VICA)으로 전환 목표."},
  {"id":"askjamie-covid-fail","title":"Singapore's Ask Jamie AI chatbots may need fine tuning","url":"https://techwireasia.com/2021/10/singapores-ask-jamie-ai-chatbots-may-need-some-fine-tuning/","publisher":"Tech Wire Asia","accessedAt":"2026-06-20","usedFor":["case-4","K7"],"claim":"COVID 오답으로 MOH가 일시 중단 — 도메인 밖 질문 위험."},
  {"id":"albert-economie","title":"Say hello to Albert! The new AI in French public services","url":"https://blog.economie-numerique.net/2024/05/06/say-hello-to-albert-the-new-ai-in-french-public-service/","publisher":"Blog Economie Numerique","accessedAt":"2026-06-20","usedFor":["case-5","K6"],"claim":"2024-04-24 출시; 상담원 보조; 출처·검증가능 콘텐츠·행정 톤 강제."},
  {"id":"albert-dinum","title":"IA : connaissez-vous Albert ?","url":"https://www.info.gouv.fr/actualite/ia-connaissez-vous-albert","publisher":"info.gouv.fr (DINUM/Etalab)","accessedAt":"2026-06-20","usedFor":["case-5","K6"],"claim":"France Services 상담원에게 답변 후보+출처+유용한 링크/실무 시트 제시; Llama 3.1·Mistral 기반 주권 AI."},
  {"id":"albert-discontinue","title":"De chatbot experimental a socle interministeriel — le parcours d'Albert","url":"https://acteurspublics.fr/articles/de-chatbot-experimental-a-socle-interministeriel-pour-lia-de-letat-le-parcours-dalbert-ia/","publisher":"Acteurs Publics","accessedAt":"2026-06-20","usedFor":["case-5"],"claim":"France Services 적용 중단/축소 보도 (partially unverified — 설계 원칙은 유효)."},
  {"id":"nyc-mycity-markup","title":"NYC's AI Chatbot Tells Businesses to Break the Law","url":"https://themarkup.org/news/2024/03/29/nycs-ai-chatbot-tells-businesses-to-break-the-law","publisher":"The Markup","accessedAt":"2026-06-20","usedFor":["case-6","K6","K7"],"claim":"환각이 위법 조언으로(팁 갈취·해고·현금거부 가능이라 오답)."},
  {"id":"nyc-mycity-shrm","title":"NYC AI Chatbot Gives Faulty Legal Advice, Prompting Review","url":"https://www.shrm.org/topics-tools/employment-law-compliance/nyc-ai-chatbot-faulty-legal-advice","publisher":"SHRM","accessedAt":"2026-06-20","usedFor":["case-6","K7"],"claim":"면책 문구 있었으나 부정확 답변; 검토 착수."},
  {"id":"nyc-mycity-launch","title":"Mayor Adams Releases First-of-Its-Kind Plan for Responsible AI Use","url":"https://home4.nyc.gov/office-of-the-mayor/news/777-23/mayor-adams-releases-first-of-its-kind-plan-responsible-artificial-intelligence-use-nyc","publisher":"NYC Office of the Mayor","accessedAt":"2026-06-20","usedFor":["case-6"],"claim":"2023-10 MyCity 챗봇 출시(Azure AI, SBS 정보 기반)."}
]
```
