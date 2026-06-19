# 트랙 C — 해외 사례 + 이식 가능한 메커니즘

> **주제**: 임산부·신생아 원스톱 지원 (임신 주차·출산예정일·거주지 입력 → 시기별 정부 지원을 "지금 받을 것 → 곧 받을 것" 순으로 자동 정렬 + AI 자격 Q&A·맞춤 요약)
> **목적**: 기능 카피가 아니라 **검증된 메커니즘** 추출 → 한국 맥락 + 4시간 MVP로 이식.
> 확인 시점: 2026-06-18 (WebSearch 실재 확인 완료, unverified 없음)

핵심 통찰 한 줄: **세계적으로 입증된 메커니즘은 3가지로 수렴한다 — (1) 라이프이벤트 타임라인 안내, (2) 자격 사전 스크리닝(질문 몇 개로 받을 수 있는 것 추림), (3) proactive(능동) 자동 신청/알림.** 우리 서비스의 "지금→곧" 정렬은 (1)과 (3)의 한국형 변형이고, AI Q&A는 (2)를 자연어로 끌어올린 레이어다.

---

## 사례 1 — Estonia 능동(Proactive) 가족·부모 급여 (★가장 중요)

- **서비스/프로젝트명**: Pro-active Family Benefits (Having-a-child life-event service)
- **국가/기관**: 에스토니아 / Social Insurance Board (Sotsiaalkindlustusamet), 개발사 Nortal
- **해결 문제**: 부모가 어떤 급여가 있는지 모르거나, 알아도 신청 절차·서류 때문에 누락. "신청해야만 받는" 구조 자체가 사각지대를 만든다.
- **핵심 사용자**: 신생아 부모 (출생 등록 직후)
- **핵심 메커니즘**: **신청을 없앤다(no-application).** 출생이 등록되고 아이 이름이 부여되면, 시스템이 부모에게 "가족 급여를 받으세요"라는 이메일을 자동 발송. 80개 이상의 고유 조건을 자동 분석해 누가·얼마를 받을지 산정. 등록 출생의 **99.99%가 자동으로 자격 판정**됨. 임신 등록부터 가족 급여까지 7개 공공기관에 걸친 **12개 서비스**를 라이프이벤트 하나로 묶음.
- **AI/자동화 역할**: 룰 기반 자동 자격 판정 엔진(80+ 조건). 데이터 연계로 사람이 신청·증빙할 필요 제거.
- **사용자 흐름**: 출생 등록 → (자동) 자격 검사 → 부모에게 능동 통지 이메일 → 확인 클릭 → 지급.
- **사용 데이터**: 출생 등록부, 인구 등록부, 기관 간 데이터 연계(X-Road).
- **차별적 이유**: "찾아오는 행정". 부모의 인지·행동 부담을 0으로. Nortal/OECD가 "세계 유일" 수준으로 평가.
- **한국 이식 킥**: 전면 자동지급은 4시간/제도상 불가하지만, **"신청 없이 받는다"는 발상**을 "받을 것을 능동적으로 알려준다"로 변형. 즉 출산예정일·주차를 입력하면 시스템이 **마감일이 임박한 제도를 먼저 밀어내는(push) 능동 타임라인**을 만든다.
- **4시간 MVP 축소안**: 자동 지급/데이터 연계 X → 입력값(주차·예정일·지역)으로 **"D-day 기반 능동 알림 카드"**를 정적 생성. "지금 신청 안 하면 놓치는 제도" 배지.
- **출처/확인 시점**: OECD OPSI, ERR News — 2026-06-18

## 사례 2 — Singapore LifeSG + Baby Bonus (라이프이벤트 단일 창구)

- **서비스/프로젝트명**: LifeSG (앱/웹) — Baby Bonus / Child Development Account 통합
- **국가/기관**: 싱가포르 / GovTech, Ministry of Social and Family Development (MSF)
- **해결 문제**: 출생 신고·급여 신청·도서관 멤버십 등 출산 직후 해야 할 일이 기관별로 흩어져 있음.
- **핵심 사용자**: 신생아 부모
- **핵심 메커니즘**: **라이프이벤트(아기 출산)를 중심으로 여러 기관 서비스를 하나의 흐름으로 묶음.** 2024년 7월부터 LifeSG가 Baby Bonus 신청의 **단일 접점(single seamless touchpoint)**. 출생 등록 안에 Baby Bonus 신청이 포함되고, CDA 개설 시 저축계좌(CSA)가 자동 개설되어 현금 지원이 6개월마다 자동 입금(아이 6.5세까지).
- **AI/자동화 역할**: 강한 AI보다 **서비스 오케스트레이션 + 자동 계좌 개설/반복 지급**. 한 번 신청하면 후속 지급은 자동.
- **사용자 흐름**: 출생 등록(LifeSG) → 같은 흐름에서 Baby Bonus 신청 → CDA/CSA 자동 개설 → 6개월 주기 자동 입금.
- **사용 데이터**: 출생 등록 정보, 시민권/출생 순위/혼인 상태(지급액 산정).
- **차별적 이유**: "여러 번 신청"을 "한 흐름"으로. 출생 순위·시민권 등 조건에 따라 금액을 맞춤화.
- **한국 이식 킥**: **라이프이벤트 허브 UX** — 흩어진 임신·출산 제도(국민행복카드, 첫만남이용권, 부모급여, 지자체 출산축하금 등)를 "출산"이라는 한 사건의 타임라인으로 묶어 보여줌.
- **4시간 MVP 축소안**: 실제 신청 연동 X → "출산 라이프이벤트" 화면에서 제도들을 **단계(임신중/출산직후/생후 N개월)별 카드**로 묶어 표시 + 각 카드에 공식 신청 링크.
- **출처/확인 시점**: LifeSG (life.gov.sg), MSF ask.gov.sg — 2026-06-18

## 사례 3 — Canada Automated Benefits Application (ABA, 출생등록 연계 자동신청)

- **서비스/프로젝트명**: Automated Benefits Application (ABA)
- **국가/기관**: 캐나다 / Canada Revenue Agency (CRA) + 주(州) Vital Statistics
- **해결 문제**: 신생아 부모가 아동수당(CCB)을 별도로 신청해야 하는 부담·누락.
- **핵심 사용자**: 신생아 어머니/부모
- **핵심 메커니즘**: **출생 등록에 급여 신청을 끼워 넣고(piggyback) + 동의 한 번으로 기관 간 데이터 공유.** 출생 등록 시 아동수당 신청란을 채우고 주 정부→CRA 정보 공유에 동의하면, CRA가 자격을 판정해 8주 내 통지/지급. SIN(사회보험번호)만 추가로 필요.
- **AI/자동화 역할**: 룰 기반 자격 판정 + 기관 간 안전 데이터 전송. 별도 증빙(출생증명) 재제출 불필요.
- **사용자 흐름**: 출생 등록 양식 작성·서명 → 데이터 공유 동의 → SIN 제공 → CRA 자동 판정 → 8주 내 지급/통지.
- **사용 데이터**: 출생 등록 정보(출생증명 포함), SIN.
- **차별적 이유**: "동의 1회 = 신청 완료". 누리아빗(Nunavut) 제외 전국 시행.
- **한국 이식 킥**: **"동의 한 번으로 자격 매칭"** 패턴. 우리는 데이터 연계가 없으니, AI가 입력값으로 **자격 가능성 사전 판정 → 받을 제도 자동 묶음**으로 흉내. "당신은 X·Y를 받을 가능성이 높습니다" 결과 카드.
- **4시간 MVP 축소안**: 정부 DB 연계 X → 입력 기반 **룰 매칭 데모**(주차·지역·간단 소득구간 → 해당 제도 리스트). 실제 신청은 외부 링크.
- **출처/확인 시점**: canada.ca CRA ABA 페이지 — 2026-06-18

## 사례 4 — Code for America GetCalFresh (마찰 제거 + 마일스톤 알림)

- **서비스/프로젝트명**: GetCalFresh.org (현재 BenefitsCal로 전환)
- **국가/기관**: 미국 캘리포니아 / Code for America + CA Dept. of Social Services
- **해결 문제**: 식품 지원(SNAP/CalFresh) 신청이 길고 복잡해 중도 이탈.
- **핵심 사용자**: 저소득 가구 신청자
- **핵심 메커니즘**: **신청 시간을 10분 이하로 줄이는 마찰 제거(plain language·모바일 우선·서류 업로드 간소화) + 신청 후 문자 알림으로 핵심 마일스톤(서류 제출 기한 등) 리마인드.** 이탈 방지의 핵심이 "다음에 뭘 해야 하는지 제때 알려주는 것".
- **AI/자동화 역할**: 동적 폼/조건부 질문, 문자 자동 리마인더(상태·기한).
- **사용자 흐름**: 간단 신청(10분) → 제출 확인 문자 → 서류·인터뷰 등 마일스톤 문자 리마인드.
- **사용 데이터**: 신청자 입력, 신청 상태/마일스톤 일정.
- **차별적 이유**: "신청을 쉽게"가 아니라 **"신청 이후의 후속 행동까지 끌고 가는" 리마인더 루프**가 차별점.
- **한국 이식 킥**: **마일스톤 리마인더** — "임신 12주: 국민행복카드 / 출산 후 60일 내: 출생신고+첫만남이용권 / 생후 N개월: 영유아 검진" 처럼 **기한이 있는 할 일을 D-day로 리마인드**. 우리 "지금→곧" 정렬의 정당성 근거.
- **4시간 MVP 축소안**: 실제 문자 발송 X → 화면 내 **"마감 임박 / 곧 다가옴" 정렬 + D-day 배지**로 리마인더 개념 시각화.
- **출처/확인 시점**: codeforamerica.org — 2026-06-18

## 사례 5 — mRelief (3분 자격 스크리너, 본 신청 전 분류)

- **서비스/프로젝트명**: mRelief SNAP Eligibility Screener
- **국가/기관**: 미국 / mRelief (비영리, Code for America 생태계 연관)
- **해결 문제**: "내가 받을 수 있나?"를 몰라서 신청 자체를 안 함 → 거대한 미수령.
- **핵심 사용자**: SNAP 잠재 수급자
- **핵심 메커니즘**: **본 신청 전 초경량 사전 스크리닝.** 질문 수를 최소화하고 **예/아니오·객관식만** 사용 → **3분 내 자격 가능성 판정**. 웹 또는 문자(74544로 "Food" 발송)로 접근. 가능성이 높으면 "가장 좋은 신청 방법"으로 안내. 누적 270만 명 / SNAP 10억 달러+ 연결.
- **AI/자동화 역할**: 룰 기반(Rules as Code) 스크리닝 엔진을 대화형으로 단순화. (LLM은 아니지만 "자격 룰의 대화형 추상화"가 핵심)
- **사용자 흐름**: 짧은 질문 응답 → 자격 가능성 결과 → 적합한 신청 경로 안내.
- **사용 데이터**: 가구원 수·소득 구간 등 최소 입력.
- **차별적 이유**: **신청(고관여)과 분리된 저관여 사전 스크리너**. 심리적 진입장벽을 먼저 허문다.
- **한국 이식 킥**: **AI 자격 Q&A를 mRelief식 "최소 질문 스크리너"로 설계** — 우리 서비스의 자연어 Q&A 레이어가 바로 이것의 LLM 업그레이드판. "주차·지역·소득구간 3개 질문 → 받을 가능성 높은 제도 Top N".
- **4시간 MVP 축소안**: 3~4개 핵심 질문 → 룰 매칭으로 후보 제도 출력. AI는 결과를 자연어로 풀어 설명("왜 받을 수 있는지").
- **출처/확인 시점**: Digital Government Hub, mRelief.com — 2026-06-18

## 사례 6 — USA Benefits.gov / USAGov Benefit Finder (라이프이벤트 기반 통합 매칭)

- **서비스/프로젝트명**: Benefits.gov "Benefit Finder" (현 USA.gov benefit finder)
- **국가/기관**: 미국 연방 / 다부처 공동
- **해결 문제**: 1,000개 이상 연방 급여가 부처별로 흩어져 무엇이 있는지 모름.
- **핵심 사용자**: 모든 시민 (라이프이벤트별)
- **핵심 메커니즘**: **이름·SSN 없이(완전 익명) 상황 질문에 답하면 1,000+ 프로그램과 자격 기준을 대조해 맞춤 후보 리스트 + 신청 기관으로 라우팅.** "라이프이벤트(having a baby 등)" 축으로 묶어 안내. 단, 매칭 엔진일 뿐 실제 신청은 각 기관에서 별도.
- **AI/자동화 역할**: 자격 룰 매칭 엔진. (LLM 아님, 룰 기반)
- **사용자 흐름**: 익명 질문 응답 → 자격 가능 프로그램 맞춤 리스트 → 해당 기관 신청 페이지 라우팅.
- **사용 데이터**: 사용자가 입력한 상황 정보(저장 안 함, 종료 시 삭제).
- **차별적 이유**: **익명성·개인정보 비수집**이 신뢰·진입장벽을 동시에 해결. 라이프이벤트 분류.
- **한국 이식 킥**: **"로그인·민감정보 없이 받을 것을 보여준다"** — 데모에서 개인정보 없이 즉시 결과를 내는 가벼움. + 라이프이벤트 분류 UX.
- **4시간 MVP 축소안**: 로그인/저장 없는 1페이지 매칭. 결과를 "지금/곧" 타임라인으로 정렬해 차별화.
- **출처/확인 시점**: USA.gov benefit finder, Benefits.gov 관련 자료 — 2026-06-18

## 사례 7 — UK GOV.UK "Check benefits and financial support" + 라이프이벤트 안내

- **서비스/프로젝트명**: GOV.UK "Check what benefits you can get" + "Having a baby" 가이드 (Sure Start Maternity Grant 등)
- **국가/기관**: 영국 / GDS, DWP
- **해결 문제**: 급여 제도가 많고 자격 규칙이 복잡 → 신청 가능 여부 판단 어려움.
- **핵심 사용자**: 모든 잠재 수급자 (출산 가구 포함)
- **핵심 메커니즘**: **상황 질문 기반 자격 체커**(Welfare Reform Act 등 최신 법규 룰 반영) + **라이프이벤트별 단계 안내 + 기한 명시.** 예: Sure Start Maternity Grant는 "출산예정일 11주 전 ~ 출산 후 6개월" 같은 **명확한 클레임 윈도우**를 제시 → 사용자가 언제까지 뭘 해야 하는지 안다.
- **AI/자동화 역할**: 룰 기반 자격 체커, 구조화된 안내 콘텐츠.
- **사용자 흐름**: 상황 질문 → 자격 가능 급여 목록 → 각 급여 상세(기한·신청법) → 신청.
- **사용 데이터**: 사용자 입력 상황, 법규 기반 자격 규칙.
- **차별적 이유**: **"기한(클레임 윈도우)"을 1급 정보로 노출** — 우리 "지금→곧" 정렬의 직접 근거.
- **한국 이식 킥**: **각 제도의 신청 기한을 카드에 명시 + 기한순 정렬.** "출산 후 60일 내 신청" 같은 윈도우를 D-day로 변환.
- **4시간 MVP 축소안**: 제도별 기한 데이터를 표로 정리 → 입력 예정일 기준 D-day 계산 → 기한 임박순 정렬.
- **출처/확인 시점**: gov.uk/check-benefits-financial-support, gov.uk/sure-start-maternity-grant — 2026-06-18

## 사례 8 — Australia myGov / Centrelink (출산 전 사전 신청 + 출생 후 자동 완성)

- **서비스/프로젝트명**: myGov "Having a baby" / Centrelink Parental Leave Pay·Parenting Payment
- **국가/기관**: 호주 / Services Australia
- **해결 문제**: 출산 직후 정신없는 시기에 신청을 놓침.
- **핵심 사용자**: 예비/신생아 부모
- **핵심 메커니즘**: **출산 전 최대 3개월 사전 신청(pre-claim)** → 출생 후 "Add Newborn"으로 출생 증빙만 추가하면 신청 완성. 즉 **번거로운 작업을 한가한 시기(출산 전)로 앞당기고, 출산 후엔 최소 액션만.** "Before the birth of your baby" 라이프스테이지 가이드로 시기별 할 일 안내.
- **AI/자동화 역할**: 단계형 클레임 플로우 + 시기 기반 안내 + 상태 추적.
- **사용자 흐름**: 출산 전 사전 신청(소득·신원 등) → 출산 → Add Newborn(출생 증빙) → 지급.
- **사용 데이터**: 신원·소득·고용·배우자 정보, 출생 증빙.
- **차별적 이유**: **"미리 준비 → 출산 후 한 번에 완성"**. 시기별(임신중/출산직후) 할 일 분리.
- **한국 이식 킥**: **시기 기반 분리 — "지금(임신중) 미리 할 것" vs "출산 후 할 것".** 우리 "지금→곧" 정렬이 바로 이 시간축 분리와 일치. + 사전 준비 체크리스트.
- **4시간 MVP 축소안**: 입력 주차에 따라 화면을 "지금 준비할 것 / 출산 직후 할 것 / 생후 N개월" 3구간으로 자동 분기.
- **출처/확인 시점**: my.gov.au, servicesaustralia.gov.au — 2026-06-18

---

## 이식 가능한 킥(메커니즘) 후보 Top 3 — 우리 서비스 기준

### 🥇 Top 1 — 기한 기반 "지금→곧" 라이프이벤트 타임라인 (Estonia 능동성 + UK 클레임윈도우 + AU 시간축 분리 + GetCalFresh 리마인더)
- **무엇**: 출산예정일·주차를 입력하면, 각 제도의 **신청 기한(클레임 윈도우)을 D-day로 계산해 임박순으로 정렬**. 화면을 "지금 받을 것(기한 임박) → 곧 받을 것(예정)" 2~3구간으로 분기.
- **왜 검증됨**: UK는 기한을 1급 정보로 노출, 호주는 임신중/출산후로 시간축 분리, GetCalFresh는 기한 리마인더로 이탈 방지, Estonia는 "능동적으로 밀어주기"의 정점.
- **우리 차별점**: 한국엔 제도는 많은데(국민행복카드·첫만남이용권·부모급여·지자체 출산축하금) "언제까지 뭘"이 흩어져 있다 → 이걸 **하나의 D-day 타임라인**으로 통합.
- **4시간 MVP**: 제도별 기한 룰 + 예정일 입력 → D-day 정렬 + "마감 임박" 배지. (정적 데이터로 충분)

### 🥈 Top 2 — 최소질문 자격 사전 스크리너 → AI 자연어 결과 (mRelief + Benefits.gov + Canada ABA)
- **무엇**: 로그인·민감정보 없이 **3~4개 질문(주차·지역·소득구간)** → 받을 가능성 높은 제도 Top N을 매칭. **AI가 "왜 받을 수 있는지"를 자연어로 설명**(우리 서비스의 자격 Q&A 레이어 = mRelief 스크리너의 LLM 업그레이드).
- **왜 검증됨**: mRelief 270만 명·10억$ 연결, Benefits.gov는 익명 매칭으로 진입장벽 제거, Canada는 "동의 1회 = 자격 매칭".
- **우리 차별점**: 룰 매칭 + LLM 설명을 결합 → 단순 리스트가 아니라 "당신 상황엔 이게 핵심" 맞춤 요약.
- **4시간 MVP**: 룰 매칭(if-then) + LLM 요약 프롬프트. 핵심 질문 4개로 제한.

### 🥉 Top 3 — 라이프이벤트 단일 허브 + 능동 알림 카드 (Singapore LifeSG + Estonia proactive)
- **무엇**: 흩어진 제도를 "출산"이라는 **한 라이프이벤트 흐름**으로 묶고, 마감 임박 제도를 **능동적으로 밀어주는 알림 카드**("지금 신청 안 하면 놓치는 제도").
- **왜 검증됨**: LifeSG가 출생등록+Baby Bonus+멤버십을 한 흐름으로, Estonia가 능동 통지로 "신청해야 받는" 구조 자체를 해체.
- **우리 차별점**: 전면 자동지급(데이터 연계)은 불가하지만 **"능동적으로 알려주는" UX**로 발상을 이식 — 사용자가 찾지 않아도 먼저 제시.
- **4시간 MVP**: "출산 라이프이벤트" 단일 화면 + 마감 임박 제도 상단 고정 배지.

---

## 출처

| id | 사례 | URL | 발행처 | 확인시점 |
|----|------|-----|--------|----------|
| overseas-src-01 | Estonia proactive family benefits | https://oecd-opsi.org/innovations/proactive-family-benefits/ | OECD OPSI | 2026-06-18 |
| overseas-src-02 | Estonia 자동 신청(부모 신청 불필요) | https://news.err.ee/991789/parents-no-longer-have-to-apply-for-family-benefits | ERR News | 2026-06-18 |
| overseas-src-03 | Singapore LifeSG Baby Bonus | https://www.life.gov.sg/family-parenting/benefits-support/baby-bonus-scheme | LifeSG (GovTech Singapore) | 2026-06-18 |
| overseas-src-04 | Singapore 출생등록+Baby Bonus 통합 | https://www.life.gov.sg/about-us/birth-registration | LifeSG | 2026-06-18 |
| overseas-src-05 | Canada Automated Benefits Application | https://www.canada.ca/en/revenue-agency/services/child-family-benefits/automated-benefits-application.html | Canada Revenue Agency | 2026-06-18 |
| overseas-src-06 | GetCalFresh 신청 간소화·마일스톤 문자 | https://codeforamerica.org/programs/social-safety-net/food-benefits/ | Code for America | 2026-06-18 |
| overseas-src-07 | mRelief 3분 자격 스크리너 | https://digitalgovernmenthub.org/publications/mrelief/ | Digital Government Hub | 2026-06-18 |
| overseas-src-08 | Benefits.gov / USAGov Benefit Finder | https://www.usa.gov/benefit-finder | USAGov | 2026-06-18 |
| overseas-src-09 | UK 급여 자격 체커 | https://www.gov.uk/check-benefits-financial-support | GOV.UK (GDS/DWP) | 2026-06-18 |
| overseas-src-10 | UK Sure Start Maternity Grant 기한 | https://www.gov.uk/sure-start-maternity-grant | GOV.UK (DWP) | 2026-06-18 |
| overseas-src-11 | Australia 출산 전 사전 신청 | https://www.servicesaustralia.gov.au/before-birth-your-baby?context=60001 | Services Australia | 2026-06-18 |
| overseas-src-12 | Australia 출산 후 Add Newborn | https://www.servicesaustralia.gov.au/how-to-claim-parental-leave-pay?context=64479 | Services Australia | 2026-06-18 |
