# Track D — 데이터·구현 현실성 (feasibility)

> Stage 01 병렬 리서치 / 트랙 D. 주제: **임산부·신생아 원스톱 지원**.
> 결론 먼저: **4시간 안에 시연 가능하다.** 단, 핵심 리스크는 "정부 지원 제도 고정 데이터셋"의 신규 제작 + 정확성이며, 실 API는 카카오 로컬 1건으로 최소화해야 한다.

---

## 1. 4시간 시연 가능성 판정 — 가능 (조건부)

핵심 경로를 **입력 3개 → 정렬된 제도 카드 리스트 → (선택) 시설 지도**로 좁히면 충분히 가능하다.
가장 큰 시간 비용은 코드가 아니라 **데이터 큐레이션**(제도 8~12건의 시기/자격/금액/신청처 검증)과 **시기 정렬 로직**이다.

| 구성요소 | 난이도 | 4h 내 가능? | 비고 |
|---|---|---|---|
| 입력 폼(주차/예정일/지역) | 낮음 | O | `web/lib/regions.ts` 지역 셀렉터 그대로 재사용 |
| 고정 제도 JSON 데이터셋 | **중(리스크)** | O | 신규 제작. 본 문서 스키마 + 제도 목록 사용 |
| 시기 기반 "지금→곧" 정렬 | 낮~중 | O | 순수 함수. 임신주차/아기월령 → window 매칭 |
| AI 자격 Q&A/요약 | 중 | O | Claude API 1콜 + fixture 폴백 (3절) |
| 시설 지도(카카오 로컬) | 중 | O(폴백 필수) | `KakaoMap.tsx` + `shelters.ts` 재사용, 키 없으면 fallback |

**시간 절감 1순위:** 제도 데이터셋을 "전국 공통"으로만 만들고 지자체별 차등은 시연에서 제외(범위 축소). 시기 정렬·AI 요약·지도 중 **지도는 가장 후순위**(키·도메인 등록 리스크가 가장 큼).

---

## 2. 고정 데이터셋에 담을 정부 지원 제도 (조사 결과)

아래는 WebSearch로 확인한 대표 제도. 금액·기준은 2026 기준 보도/지자체 안내 기준이며, **데모 데이터셋 주석에 "2026.6 기준, 확정 전 재검증" 표기 필수**(근거 없는 수치 금지 원칙). 출처는 맨 아래 `## 출처`.

| 제도 | 시기(window) | 금액 | 자격 | 신청처 | 검증 |
|---|---|---|---|---|---|
| 임신·출산 진료비 바우처(국민행복카드) | 임신 확인~출산 후 2년 | 단태아 100만원·다태아 140만원(통상) | 임신·출산 확인된 건강보험 가입자 | 국민건강보험공단/카드사/정부24 | 제도·신청처 verified, 금액 unverified(연도별 변동) |
| 첫만남이용권 | 출생 직후 | 첫째 200만원·둘째 이상 300만원 | 출생신고+주민등록 아동 | 정부24/복지로/주민센터 | verified |
| 부모급여 | 0세·1세 | 0세 월 100만원·1세 월 50만원 | 출생 후 신청(60일 내 권장) | 정부24/복지로/주민센터 | verified |
| 아동수당 | 0~95개월(만 8세 미만, 출처상 "만 9세 미만"표기 혼재) | 월 10만원 | 해당 연령 아동 | 정부24/복지로 | 금액 verified, 연령상한 표기 unverified |
| 산모·신생아 건강관리 지원(산후도우미) | 출산예정 40일 전~출산 후 30일 신청 | 바우처(소득·태아수별 차등) | 기준중위소득 150% 이하(+수급/차상위 우대) | 복지로/보건소 | 기준·신청기간 verified, 단가 unverified |
| 고위험 임산부 의료비 지원 | 19대 고위험 질환 입원치료 시 | 비급여·전액본인부담 90%, 한도 300만원 | **소득기준 폐지(2024~)**, 19대 질환 진단 | 보건소(정부24) | verified |
| 표준 모자보건수첩 | 임신 확인 직후 | 무료(현물) | 임신부 | 보건소 | unverified(현물·지자체별) |
| 임산부 친환경농산물 꾸러미 / 엽산·철분제 | 임신 중 | 현물 | 임신부(지자체 예산) | 보건소 | unverified(지자체별 상이) |

> 데이터셋 권장 규모: **전국 공통 핵심 6~8건 + 보조 2~4건**. "지자체별 상이"한 항목(꾸러미·산후조리경비)은 `regionVaries: true` 플래그로 표시하고 시연에선 서울/대표지역 1개 값만 노출.

---

## 3. 실시간 API 필요성 / 카카오 로컬 연동 현실성

**제도 데이터는 실시간이 불필요하다 → 전부 fixture(고정 JSON).** 제도 금액/기준은 분 단위로 안 바뀌고, data.go.kr는 이 환경에서 403이라 실연동 자체가 불가.

**실 API는 카카오 로컬 키워드 검색 1건만.** "보건소 / 육아종합지원센터 / 산후조리원"을 거주지역 키워드로 검색해 가까운 시설을 보여주는 데 사용.

- 엔드포인트: `GET https://dapi.kakao.com/v2/local/search/keyword.json?query=<지역+시설명>&x=<lng>&y=<lat>&radius=20000&sort=distance`
- 인증 헤더: `Authorization: KakaoAK <REST_API_KEY>` — **JS 키가 아니라 REST API 키.**
- 응답: `documents[]`에 `place_name / address_name / x(lng) / y(lat) / category_name / place_url` → 우리 `Shelter` 타입으로 매핑 후 `sortSheltersByDistance`로 정렬.

**⚠️ 구현 리스크 (실측 확인):**
1. **키가 2종이다.** `web/.env.local.example`엔 `NEXT_PUBLIC_KAKAO_MAP_KEY`(JS 지도용)만 있다. 로컬 키워드 REST API는 **별도 REST 키**가 필요 → `KAKAO_REST_API_KEY`(서버 전용, `NEXT_PUBLIC_` 금지) 추가해야 함.
2. **CORS.** 카카오 로컬 REST API를 브라우저에서 직접 호출하면 CORS/키 노출 문제 → **Next.js Route Handler(`app/api/places/route.ts`)에서 서버측 프록시**로 호출해야 안전. (지도 SDK는 클라이언트, 로컬 검색은 서버.)
3. **폴백 필수.** 키 없음/실패 시 고정 시설 목록(JSON fixture). `KakaoMap.tsx`는 이미 키 없을 때 안내 fallback이 있어 지도 자리는 안전하나, **목록 데이터 자체의 폴백**은 우리가 만들어야 함.

**재사용 가능 자산(확인됨):** `web/lib/shelters.ts`의 `distanceMeters`(Haversine)·`sortSheltersByDistance`·`formatDistance`·`shelterCenter`는 시설 도메인과 무관한 범용 함수 → 카카오 검색 결과 정렬에 그대로 사용. `KakaoMap.tsx`는 `Shelter{lat,lng,name,address,type}` 형태만 맞추면 마커·클러스터·fallback 그대로 동작.

---

## 4. 가장 위험한 외부 의존성 (우선순위)

1. **제도 데이터 정확성/최신성** (최대 리스크) — 금액·연령상한 표기가 출처마다 혼재. 폴백: 검증 안 된 수치는 데이터셋에서 "확인 필요" 라벨, 발표에선 verified 항목만 강조.
2. **카카오 키 도메인 등록 + REST 키 발급** — 당일 발급/등록 지연 위험. `docs/kit-assets.md`도 "당일엔 늦다" 경고. 폴백: 고정 시설 목록 + 지도 fallback(이미 구현됨).
3. **Claude API 키/네트워크** — AI Q&A·요약용. 폴백: 사전 생성한 요약 fixture(3~4 시나리오).
4. **data.go.kr/safetydata.go.kr 403** — 이 환경에서 자동 접근 불가. 대응: 제도 데이터는 사람이 검증한 고정 JSON, API 의존 안 함.

---

## 5. 데모에 직접 안 보이는 구현

- 임신주차/출산예정일 → **표준 시간축(D-day, 아기 월령)** 정규화 유틸. 정렬·필터의 기반인데 화면엔 안 보임.
- 제도별 `eligibilityWindow`(시작/종료 기준)와 사용자 시간축 매칭 → "지금/곧/지난" 분류 로직.
- 카카오 로컬 서버 프록시 Route Handler(키 보호·CORS 회피).
- AI 응답 캐시/폴백 스위치(키 없을 때 fixture로 무중단 데모).

---

## 6. AI 레버리지 구현 방법 (4h 현실안)

**범위를 2개로 한정:** (a) 자격 Q&A — "나 지금 뭐 받을 수 있어?" 자연어 질문, (b) 개인화 요약 — 정렬된 제도 리스트를 한 문단 브리핑.

- **호출 구조:** 서버 Route Handler(`app/api/ask/route.ts`)에서 Claude API 호출. 사용자 입력(주차·지역·질문) + **선별된 제도 JSON을 컨텍스트로 주입**(RAG 대신 전체 데이터셋이 작아 통째로 프롬프트에 넣음 — 8~12건이면 토큰 여유).
- **프롬프트 골격:** system = "너는 한국 임신·출산 지원제도 안내자. 아래 JSON에 있는 제도만 근거로 답하고, 없는 내용은 모른다고 답하라. 금액/자격은 JSON 값 그대로 인용." + user 입력 + 제도 JSON. → **환각 방지**(데이터셋 밖 수치 생성 금지, 본 키트의 "근거 없는 수치 금지"와 정합).
- **폴백:** `ANTHROPIC_API_KEY` 없거나 실패 시 → 규칙 기반 요약(정렬 결과를 템플릿 문장으로 조립) + 사전 생성 Q&A fixture 3~4건. 데모 무중단 보장.
- 모델/엔드포인트 상세는 구현 단계에서 `claude-api` 스킬 참조 권장(이 트랙은 설계만).

---

## 7. 권장 데이터셋 스키마 초안 (JSON)

```jsonc
// web/public/data/benefits/benefits.json  (전국 공통 고정 데이터셋)
{
  "version": "2026-06-18",
  "disclaimer": "2026.6 기준 조사값. 확정 전 재검증 필요.",
  "benefits": [
    {
      "id": "first-meeting-voucher",
      "name": "첫만남이용권",
      "category": "현금성",            // 현금성 | 의료비 | 서비스(바우처) | 현물
      "phase": "after_birth",          // pregnancy | near_due | after_birth | infant
      "window": {                       // 사용자 시간축 매칭용
        "anchor": "birth",             // due_date | birth | pregnancy_week
        "startOffsetDays": 0,
        "endOffsetDays": 365,
        "pregnancyWeekFrom": null,
        "pregnancyWeekTo": null
      },
      "amount": {
        "type": "lump",                // lump | monthly | voucher | in_kind
        "value": 2000000,
        "unit": "KRW",
        "note": "첫째 기준. 둘째 이상 300만원",
        "verified": true
      },
      "eligibility": {
        "summary": "출생신고+주민등록된 아동",
        "incomeLimit": null,           // null = 소득무관
        "conditions": ["birth_registered"]
      },
      "apply": {
        "channels": ["정부24", "복지로", "주민센터"],
        "url": "https://www.bokjiro.go.kr",
        "deadlineNote": "출생 후 신청"
      },
      "regionVaries": false,
      "source": "feasibility-src-03",
      "priorityScore": 90               // 정렬 가중치(금액·시급성)
    }
  ]
}
```

**정렬 규칙(핵심 로직):** 사용자 시간축 t를 계산 → 각 제도 `window`로 `now`(받을 수 있음)/`soon`(곧)/`past`(지남) 분류 → `now` 우선, 그 안에서 `priorityScore` 내림차순. "지금 받을 것 → 곧 받을 것"이 화면 정렬과 1:1로 매핑됨.

시설 데이터(카카오 폴백)는 기존 `Shelter` 타입 재사용:
```jsonc
// web/public/data/facilities/<시도>.json (카카오 실패 시 폴백)
[{ "id":"...", "type":"phc", "name":"○○구보건소", "address":"...", "sido":"서울특별시", "sigungu":"○○구", "lat":37.5, "lng":127.0 }]
```

---

## 8. 가장 짧은 핵심 경로 (데모 happy path)

```
1. 랜딩 → 입력 폼: [출산예정일 or 임신주차] + [시/도·시군구(regions.ts)]
2. "내 지원금 보기" 클릭
3. 결과 화면:
   ├─ 상단: 시간축 배지 ("임신 28주 · D-84")
   ├─ "지금 받을 수 있어요" 카드 리스트 (now, priorityScore 정렬)
   ├─ "곧 받게 돼요" 카드 리스트 (soon)
   └─ AI 한 줄 브리핑 ("28주차시면 지금 ○○·○○ 신청 가능, 출산 후 △△ 준비하세요")  ← Wow
4. (선택) 제도 카드 → 신청처 링크 / "가까운 보건소 보기" → 카카오 지도+목록
5. (선택) 자유 질문 입력 → AI Q&A 답변 (데이터셋 근거)
```

**최소 시연 경로(키·API 전부 실패해도 도는 버전):** 1→2→3까지. 제도 데이터(고정 JSON)·시간축 정렬·규칙 기반 브리핑만으로 Wow가 성립. 카카오 지도와 Claude API는 **있으면 가산점, 없어도 데모 성립**하도록 폴백 분리.

---

## 출처

- [임신·출산진료비지원사업 — 보건복지부](https://www.mohw.go.kr/menu.es?mid=a10705020100) — 임신·출산 진료비 바우처(국민행복카드) 제도·신청처. accessed 2026-06-18.
- [출산 진료비 제도 — 국민건강보험공단](https://www.nhis.or.kr/static/html/wbma/c/wbmac0212.html) — 바우처 사용기한(분만예정일 2년)·신청 방식. accessed 2026-06-18.
- [2026 부모급여 첫만남이용권 아동수당 총정리 — 복지맘](https://welfare-mom.com/korea-child-benefit-guide-2026/) — 부모급여/첫만남이용권/아동수당 2026 금액. accessed 2026-06-18 (블로그, 2차 출처 — 금액 재검증 권장).
- [2026 아동수당·부모급여 개정사항 — 3o3](https://blog.3o3.co.kr/2026_parental_child_allowance/) — 부모급여 0세 월100/1세 월50·아동수당 월10만원. accessed 2026-06-18 (2차 출처).
- [산모·신생아 건강관리 지원사업 — 사회서비스 전자바우처](https://www.socialservice.or.kr/user/htmlEditor/view2.do?p_sn=7) — 사업 개요·바우처. accessed 2026-06-18.
- [산모신생아 건강관리 서비스 — 정부24](https://www.gov.kr/mw/AA020InfoCappView.do?CappBizCD=13520000043) — 소득기준(중위 150%)·신청기간(예정 40일 전~출산 후 30일). accessed 2026-06-18.
- [고위험 임산부 의료비 지원 — 정부24](https://www.gov.kr/portal/service/serviceInfo/135200000114) — 소득기준 폐지·19대 질환·90% 한도 300만원. accessed 2026-06-18.
- [고위험 임산부 진료비 지원받기 — 찾기쉬운 생활법령정보](https://www.easylaw.go.kr/CSP/CnpClsMain.laf?popMenu=ov&csmSeq=735&ccfNo=2&cciNo=2&cnpClsNo=4) — 고위험 임산부 의료비 지원 법령 근거. accessed 2026-06-18.
- [카카오 로컬 REST API 개발가이드 — Kakao Developers](https://developers.kakao.com/docs/latest/ko/local/dev-guide) — 키워드 장소 검색 엔드포인트·KakaoAK 헤더·파라미터. accessed 2026-06-18.
