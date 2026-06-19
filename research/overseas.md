# 리서치 트랙 C — 해외 사례 + 이식 가능한 메커니즘

> 주제: "우리 가족 맞춤 정부 혜택 찾기" (가구 구성·지역·소득 입력 → 받을 수 있는 혜택 목록 + 신청 안내)
> 목적: 기능 베끼기가 아니라 **검증된 메커니즘** 추출. 4시간 해커톤 데모 + 한국(복지로) 맥락 이식.
> 조사 사례: 6개 (모두 실재 확인, URL·확인 시점 명시). 확인 시점: 2026-06-19.

---

## 사례 1 — ACCESS NYC + Benefits Screening API (가장 핵심)

- **서비스/프로젝트명**: ACCESS NYC / NYC Benefits Screening API (NYC Benefits Platform)
- **국가·기관**: 미국 뉴욕시 / Mayor's Office for Economic Opportunity (NYC Opportunity)
- **해결하려는 문제**: 시·주·연방에 흩어진 80여 개 복지 프로그램을 시민이 일일이 찾기 어렵고, 자격 여부를 사전에 알 수 없어 신청을 포기/미수령(under-enrollment)하는 문제.
- **핵심 사용자**: 저소득 가구, 이민자(11개 언어 지원), 복지 상담사.
- **핵심 메커니즘**: **10단계 스크리닝 설문 → 규칙 엔진(Drools 기반)이 40여 개 프로그램의 자격요건을 조건논리로 평가 → "잠재 자격" 목록 반환**. 핵심은 자격요건을 사람이 읽는 문서가 아니라 **기계가 읽는 규칙(machine-readable rules)으로 표준 문법화**한 점. 분석가/PM이 자격기준을 조건논리로 해석 → 개발자가 규칙문으로 구현 → 자동화 테스트(Ghost Inspector)로 시나리오 통과/탈락 검증.
- **AI/기술의 역할**: AI 아님. **규칙 엔진(rules-as-code)** + 단일페이지 앱(SPA)이 API로 규칙엔진 호출. 프런트와 자격 로직을 분리 → 여러 인터페이스가 같은 로직 재사용.
- **사용자 흐름**: 계정 없이 익명으로 짧은 스크리너 → 잠재 자격 결과 + 평이한 언어의 프로그램 안내(plain-language guides) → 결과를 문자/이메일로 저장 → 신청 안내·문서 목록·근처 도움 위치 제공.
- **사용 데이터**: 혼인상태·소득·가구 등 수십 개 입력값 + 40여 개 프로그램의 자격 규칙·계산식.
- **차별적 이유**: 자격 로직을 **공개 API**로 개방 → NYC의 차세대 포털 MyCity가 이 API를 재사용. 즉 "한 번 코드화한 규칙을 여러 서비스가 공유"하는 구조.
- **한국 이식 킥**: **자격요건의 규칙화(rules-as-code) + 규칙엔진/프런트 분리.** 복지로 서비스의 "지원대상·선정기준" 텍스트를 JSON 규칙(소득기준·가구원수·연령·지역 조건)으로 변환해 매칭 엔진을 만든다. 데이터(규칙)와 UI를 분리하면 혜택 추가가 데이터 추가로 끝난다.
- **4시간 MVP 축소안**: Drools 같은 엔진 대신 **TS 객체 배열로 규칙 표현**(예: `{id, name, conditions:{incomeMax, householdMin, region, age}}`) + 단순 술어 함수로 필터. 10단계 대신 가구·지역·소득 3~5개 입력. 결과는 "받을 수 있음/조건 확인 필요"로 분기.
- **출처·확인 시점**: https://digitalgovernmenthub.org/publications/access-nyc-benefits-screening-api/ , https://access.nyc.gov/ (2026-06-19 확인)

---

## 사례 2 — GetCalFresh (Code for America)

- **서비스/프로젝트명**: GetCalFresh.org
- **국가·기관**: 미국 캘리포니아 / Code for America (비영리) × California Dept. of Social Services(CDSS) 파트너십
- **해결하려는 문제**: SNAP(식료품 지원) 신청 절차가 복잡하고 길어 자격자가 신청을 중도 포기. 캘리포니아 SNAP 참여율이 낮았던 문제.
- **핵심 사용자**: 저소득 가구(다국어), 신청 보조가 필요한 사람.
- **핵심 메커니즘**: 자격 판단 자체보다 **신청 동선의 인간 중심 단순화**. 소득·임대료/공과금 등 지출·가구원수를 반영한 자격 추정 → 단계별 안내로 실제 주(州) 신청까지 연결.
- **AI/기술의 역할**: 모바일 친화 웹 + 다국어. 핵심은 UX 단순화·문자 리마인더 등 동선 설계.
- **사용자 흐름**: 단계별 질문 → 자격 추정 → 신청서 제출 보조 → 후속 안내.
- **사용 데이터**: 소득, 지출(임대료·공과금), 가구 규모.
- **차별적 이유**: 단일 주(州) 공식 접근점으로 확장. 2019~2025 캘리포니아 온라인 SNAP 신청의 70%+가 GetCalFresh 경유, 참여율 66%(2014)→81%(2022), 누적 700만+ 이용.
- **한국 이식 킥**: **"찾기에서 끝내지 말고 신청까지 한 동선"(intake.yaml 앵글 B).** 혜택 카드마다 "어디서·무엇을 들고·어떻게 신청"을 한 화면에 붙인다. 신청 마찰을 줄이는 plain-language 안내.
- **4시간 MVP 축소안**: 결과 카드에 "신청 채널(복지로/주민센터) + 필요서류 + 한 줄 신청법" 고정 표기. 실제 제출 연동은 생략, 외부 링크로 대체.
- **출처·확인 시점**: https://www.getcalfresh.org/en/ , https://codeforamerica.org/news/reflecting-on-10-years-of-getcalfresh/ (2026-06-19 확인)

---

## 사례 3 — mRelief (텍스트 기반 자격 스크리너)

- **서비스/프로젝트명**: mRelief
- **국가·기관**: 미국 시카고 발 비영리 / SNAP 참여 53개 주·준주 대상
- **해결하려는 문제**: 자격 여부 확인이 어려워 신청을 시도조차 못하는 진입 장벽.
- **핵심 사용자**: 스마트폰만 있는 저소득층, 디지털 접근성 낮은 사용자.
- **핵심 메커니즘**: **문자(SMS)/웹으로 3분짜리 초간단 스크리너.** "Food" 문자 발송 → 객관식·예/아니오만으로 질문 수 최소화 → 자격 가능성 판정 → 가장 적절한 신청 방법으로 연결(일부 주는 간이 신청, 지역 파트너 연결).
- **AI/기술의 역할**: SMS 채널 + 규칙 기반 스크리너("Rules as Code" 데모로 소개됨). 화려한 AI 없이 접근성에 집중.
- **사용자 흐름**: 문자/웹 시작 → 소수 질문 → 자격 가능성 → 신청 경로 안내.
- **사용 데이터**: 소득, 가구, 학력 등 최소 항목.
- **차별적 이유**: **질문 수를 극단적으로 줄여** 3분 내 완료. "묻는 질문이 적을수록 완주율이 높다"를 입증.
- **한국 이식 킥**: **질문 최소화 원칙 — 자격 판정에 꼭 필요한 3~5개 질문만.** 가구원수·거주 시군구·소득구간(또는 기준 중위소득 %) 정도로 1차 매칭. "정확한 금액"보다 "구간/예/아니오"로 마찰 감소.
- **4시간 MVP 축소안**: 입력 폼을 5개 이하 질문으로 제한, 모두 드롭다운/라디오. 자유 입력 최소화 → 데모 안정성↑.
- **출처·확인 시점**: https://www.mrelief.com/ , https://digitalgovernmenthub.org/publications/mrelief/ , https://digitalbenefitshub.org/resources/rules-as-code-demo-day-demo-5-mrelief-snap-eligibility-screener-zareena-meyn-and-dize-hacioglu (2026-06-19 확인)

---

## 사례 4 — Turn2us Benefits Calculator (영국)

- **서비스/프로젝트명**: Turn2us Benefits Calculator (엔진은 entitledto 등과 동종 계열)
- **국가·기관**: 영국 / Turn2us (자선단체)
- **해결하려는 문제**: 자산조사형(means-tested) 복지의 자격·금액이 복잡해 시민이 받을 수 있는 걸 모름.
- **핵심 사용자**: 저소득·연금 수급 대상 가구.
- **핵심 메커니즘**: **연속 질문 → 자산조사 규칙으로 자격 + 예상 수령액 산출.** 각 질문에 "왜 이걸 묻는지" 도움말 링크. 결과 페이지에 "어떤 혜택 / 얼마 / 어떻게 신청"까지 제시. 비영국 시민·특수 규칙군은 추가 질문 또는 "상담사 찾기"로 분기.
- **AI/기술의 역할**: 규칙 기반 계산기. AI 아님.
- **사용자 흐름**: 질문(소득·저축·자본·파트너 소득) → 자격+금액 → 신청 방법 / 분기.
- **사용 데이터**: 전체 소득(급여·연금·기존 혜택), 저축·투자·자본, 파트너 소득.
- **차별적 이유**: **자격뿐 아니라 예상 금액**을 보여줘 "신청할 가치"를 체감시킴. 질문마다 맥락 도움말로 신뢰·완주율↑.
- **한국 이식 킥**: (1) **질문 옆 "왜 묻나요?" 인라인 도움말** — 정부 서비스 신뢰감. (2) **결과에 자격+예상 혜택(가능하면 금액/지원 내용) 함께 표기.** (3) 자격 애매하면 "상담/주민센터" 폴백 분기.
- **4시간 MVP 축소안**: 금액 계산은 데모 데이터에 한해 "지원 내용 요약"만, 정밀 금액은 생략. 도움말은 툴팁 한 줄로.
- **출처·확인 시점**: https://benefits-calculator.turn2us.org.uk/ , https://www.turn2us.org.uk/get-support/information-about-benefits/using-the-benefits-calculator (2026-06-19 확인)

---

## 사례 5 — SupportGoWhere / LifeSG (싱가포르)

- **서비스/프로젝트명**: SupportGoWhere (LifeSG 앱 통합 기능)
- **국가·기관**: 싱가포르 / GovTech Singapore
- **해결하려는 문제**: 100여 개 정부 지원제도가 흩어져 시민이 자기 상황에 맞는 걸 찾기 어려움.
- **핵심 사용자**: 일반 시민·가구(가족 지원, 재정·육아·훈련 등 카테고리).
- **핵심 메커니즘**: **eligibility checker — "가능한 적은 질문으로 정확한 결과 반환"을 설계 목표로** 인구통계·생활상황 기반 맞춤 제도 목록 큐레이션. 기존 family support calculator 경험을 재사용해 구축.
- **AI/기술의 역할**: 정부 단일 슈퍼앱(LifeSG)에 통합, 100+ 서비스 한 곳. 체커/계산기 위주.
- **사용자 흐름**: 카테고리(재정·육아·훈련 등) 또는 체커 → 인구통계/상황 입력 → 자격 제도 목록 → 각 제도 안내.
- **사용 데이터**: 인구통계, 생활/가족 상황.
- **차별적 이유**: **카테고리 탐색 + 자격 체커 결합**, 그리고 단일 정부 슈퍼앱에 통합된 일관 경험.
- **한국 이식 킥**: (1) **"최소 질문으로 정확히"라는 명시적 설계 원칙.** (2) **카테고리(가족/육아/주거/소득) 진입 + 자격 매칭 병행** — 사용자가 막연할 때 카테고리로, 구체적이면 체커로.
- **4시간 MVP 축소안**: 카테고리는 2~3개 탭(예: 양육/주거/생계)으로 축소, 체커 1개로 통합.
- **출처·확인 시점**: https://supportgowhere.life.gov.sg/ , https://www.developer.tech.gov.sg/communities/events/stack-meetups/past-webinars/supporting-the-community-part-2.html (2026-06-19 확인)

---

## 사례 6 — USAGov / Benefits.gov Benefit Finder (미국 연방)

- **서비스/프로젝트명**: Benefit Finder (Benefits.gov → USA.gov로 통합 중)
- **국가·기관**: 미국 연방 / GSA·USA.gov (구 Benefits.gov, DOL/HHS)
- **해결하려는 문제**: 1,000+ 연방 지원 프로그램 중 자기가 받을 수 있는 것을 모름.
- **핵심 사용자**: 전 국민, 생애 사건(life event) 기반 탐색자.
- **핵심 메커니즘**: **익명 사전 스크리닝 설문 → 답변을 1,000+ 프로그램 자격기준과 대조 → 맞춤 후보 목록 + 담당 기관 안내.** 생애 사건(출산·실직·재난 등) 단위로 묻고, 답이 많을수록 정밀해짐.
- **AI/기술의 역할**: 익명 매칭 엔진. **개인식별정보 미저장·미공유·미추적**의 엄격한 프라이버시 프레임.
- **사용자 흐름**: 기본 질문(생애 사건 + 상황) → 후보 프로그램 목록 → 각 기관으로 신청 연결.
- **사용 데이터**: 인구통계·상황 지표(주/연방 프로그램 자격기준과 대조).
- **차별적 이유**: **"자격 보장 아님, 잠재 후보 안내"임을 명시** + 익명·무저장으로 신뢰 확보. 생애 사건 진입점.
- **한국 이식 킥**: (1) **익명·무저장 사전 스크리닝** — 공공 서비스 신뢰의 핵심, 데모에서도 "입력값 저장 안 함" 명시. (2) **"보장 아님, 추정"이라는 면책 카피** — 근거 없는 단정 회피(intake 제약과 일치). (3) 생애 사건 진입점(선택).
- **4시간 MVP 축소안**: 전부 클라이언트(브라우저) 내 계산 → 서버·DB 불필요, "저장 안 함" 자연 충족. 결과에 "추정이며 정확한 자격은 기관 확인 필요" 배너.
- **출처·확인 시점**: https://www.usa.gov/benefit-finder , https://www.dol.gov/newsroom/releases/oasam/oasam20240807 (2026-06-19 확인)

---

## 이식 가능한 킥 후보 종합 (우리가 쓸 메커니즘)

1. **자격요건의 규칙화(rules-as-code) + 데이터/UI 분리** [ACCESS NYC, mRelief]
   복지로 "지원대상·선정기준"을 JSON 규칙(`incomeMax`, `householdMin/Max`, `region`, `age`, `category`)으로 변환. 매칭은 단순 술어 함수. 혜택 추가 = 데이터 추가. → **데모의 "정확도 Wow"(앵글 A)의 기술적 근거.**

2. **질문 최소화 — 자격 판정에 꼭 필요한 3~5개만** [mRelief, SupportGoWhere]
   가구원수 · 거주 시군구(regions.ts 재사용) · 소득구간(기준 중위소득 %) 중심. 전부 드롭다운/라디오 → 데모 안정성 + 완주율.

3. **"찾기 → 신청"까지 한 동선** [GetCalFresh, Turn2us]
   결과 카드마다 "신청 채널 + 필요서류 + 한 줄 신청법". 실제 제출은 외부 링크 폴백. → 앵글 B "행동 전환 Wow".

4. **익명·무저장 + "추정이지 보장 아님" 면책** [Benefits.gov]
   전부 클라이언트 계산 → 서버·DB 불필요(4시간 적합) + 공공 신뢰 + intake "근거 없는 수치 금지" 제약 충족. 결과 상단 면책 배너.

5. **질문 옆 "왜 묻나요?" 인라인 도움말 + 결과에 지원 내용/금액 병기** [Turn2us]
   정부 서비스 룩(KRDS)과 어울리는 신뢰 요소. 금액 계산이 어려우면 "지원 내용 요약"만이라도.

> 권고 조합(데모): **킥 1(규칙엔진) + 킥 2(최소 질문) + 킥 3(신청 동선) + 킥 4(무저장/면책)** 을 골조로. 킥 5는 여유 시 폴리시.

---

## 출처

- ACCESS NYC / Benefits Screening API — https://digitalgovernmenthub.org/publications/access-nyc-benefits-screening-api/ , https://access.nyc.gov/ (2026-06-19)
- GetCalFresh / Code for America — https://www.getcalfresh.org/en/ , https://codeforamerica.org/news/reflecting-on-10-years-of-getcalfresh/ (2026-06-19)
- mRelief — https://www.mrelief.com/ , https://digitalgovernmenthub.org/publications/mrelief/ , https://digitalbenefitshub.org/resources/rules-as-code-demo-day-demo-5-mrelief-snap-eligibility-screener-zareena-meyn-and-dize-hacioglu (2026-06-19)
- Turn2us Benefits Calculator — https://benefits-calculator.turn2us.org.uk/ , https://www.turn2us.org.uk/get-support/information-about-benefits/using-the-benefits-calculator (2026-06-19)
- SupportGoWhere / LifeSG (GovTech Singapore) — https://supportgowhere.life.gov.sg/ , https://www.developer.tech.gov.sg/communities/events/stack-meetups/past-webinars/supporting-the-community-part-2.html (2026-06-19)
- USAGov / Benefits.gov Benefit Finder — https://www.usa.gov/benefit-finder , https://www.dol.gov/newsroom/releases/oasam/oasam20240807 (2026-06-19)
