# 복지·혜택 분야 대회용 데이터셋 준비 가이드

> 목적: 2026 AI챔피언 해커톤의 복지·혜택 분야 미션을 당일에 빠르게 구현하기 위해, 사전에 준비해도 안전한 공개 데이터 후보와 확보 절차를 정리한다.  
> 원칙: 대회 당일 결과물은 새 저장소/새 프로젝트에서 만들고, 이 문서는 데이터 탐색·출처 기록·스키마 설계용 준비물로만 사용한다.

## 1. 준비 전략

복지·혜택 서비스는 데이터를 많이 모으는 것보다, 당일 미션에 맞게 바로 조립할 수 있는 공통 스키마가 중요하다. 아래 4개 계층으로 준비한다.

| 계층 | 역할 | 당일 사용 예 |
|---|---|---|
| 혜택 카탈로그 | 받을 수 있는 제도/서비스 목록 | 조건별 혜택 추천, 검색, 우선순위 정렬 |
| 사용자 조건 | 사용자의 상황을 구조화 | 청년, 노인, 장애인, 한부모, 임산부, 1인가구 등 |
| 근거/통계 | 문제의 중요성과 지역 우선순위 설명 | 발표의 문제 정의, 지역별 위험/수요 점수 |
| 실행 접점 | 신청·상담·방문 장소 | 가까운 주민센터/복지관/보건소/상담기관 연결 |

당일 데모는 `혜택 카탈로그 + 사용자 조건`만 있어도 동작해야 한다. 통계와 시설 데이터는 시간이 있을 때 붙이는 보조 계층으로 둔다.

## 2. 1순위 데이터: 대한민국 공공서비스(혜택) 정보 API

### 왜 필요한가

복지·혜택 분야의 중심 데이터다. 정부 부처, 지방자치단체, 공공기관, 교육청 등이 제공하는 공공서비스와 정부 혜택의 목록 및 상세 내용을 제공한다.

공식 페이지 기준 주요 속성:

- 제공기관: 행정안전부
- 데이터명: `행정안전부_대한민국 공공서비스(혜택) 정보`
- API 유형: REST
- 데이터포맷: JSON+XML
- 키워드: 혜택알리미, 공공서비스, 정부혜택
- 비용: 무료
- 개발계정 트래픽: 10,000
- 심의유형: 개발단계 자동승인, 운영단계 자동승인
- 업데이트 주기: 실시간
- 이용허락범위: 제한 없음

출처: <https://www.data.go.kr/data/15113968/openapi.do>

### 받는 법

1. 공공데이터포털 계정으로 로그인한다.
   - <https://www.data.go.kr/>
2. 데이터 상세 페이지로 이동한다.
   - <https://www.data.go.kr/data/15113968/openapi.do>
3. `활용신청`을 누른다.
4. 개발계정으로 신청한다.
   - 사용 목적: `AI 해커톤 복지·혜택 안내 서비스 개발 및 공개 데이터 기반 데모`
   - 활용 내용: `공공서비스/정부혜택 목록과 상세 정보를 검색·필터링·요약해 사용자 상황별 안내에 사용`
5. 자동승인 후 마이페이지 또는 활용신청 내역에서 인증키를 확인한다.
6. 상세 페이지의 `Open API 명세 확인 가이드` 또는 Swagger UI에서 상세 기능, 요청 파라미터, 응답 필드를 확인한다.
7. 대회 전에 다음 3가지를 로컬에 저장한다.
   - API 명세 캡처 또는 링크
   - 샘플 응답 JSON
   - 사용 출처/라이선스 기록

### 로컬 저장 권장 구조

```text
data/welfare/benefits/
  raw/
    public-service-benefits.sample.json
  normalized/
    benefits.normalized.sample.json
  schema/
    benefit.schema.json
  README.md
```

### 표준 스키마

API 응답 필드명은 바뀔 수 있으므로, 앱 내부에서는 아래 표준 스키마로 변환해서 사용한다.

```ts
export type Benefit = {
  id: string
  title: string
  provider: string
  category: string
  targetText: string
  targetTags: string[]
  regionTags: string[]
  lifeEventTags: string[]
  eligibilityText: string
  supportText: string
  applicationText: string
  deadlineText?: string
  onlineUrl?: string
  contactText?: string
  sourceName: string
  sourceUrl: string
  license: string
  asOf: string
}
```

### 당일 데모에 바로 쓰는 방식

- API가 정상 동작하면 실시간 호출 또는 빌드 전 캐싱.
- API 키/네트워크가 막히면 `benefits.normalized.sample.json` fixture로 동작.
- 발표에서는 `실시간 API`인지 `사전 캐시/fallback`인지 구분해서 말한다.

## 3. 2순위 데이터: KOSIS 지역·인구·복지 통계

### 왜 필요한가

KOSIS는 통계정보를 웹/모바일앱 개발에 활용할 수 있도록 API를 제공한다. 통계목록, 통계자료, 통계설명, 통계주요지표 등을 제공하므로, 서비스 본체보다는 문제 정의와 발표 근거에 강하다.

공식 페이지 기준:

- 서비스명: KOSIS 공유서비스
- 제공 내용: 통계정보 API
- 이용 절차: 인증키 신청 → API 검색 및 이용방법 확인 → API 이용 → 애플리케이션 등록
- 개발 가이드: 통계목록, 통계자료, 대용량통계자료, 통계설명, 통계표설명, KOSIS통합검색, 통계주요지표

출처: <https://kosis.kr/openapi/>

### 받는 법

1. KOSIS 공유서비스 페이지에 접속한다.
   - <https://kosis.kr/openapi/>
2. 회원가입/로그인 후 `OPEN API 인증키 신청`을 진행한다.
3. 개발 가이드에서 필요한 API를 확인한다.
   - 통계목록: 어떤 통계표가 있는지 탐색
   - 통계자료: 특정 통계표의 실제 값 조회
   - 통계주요지표: 발표용 핵심 지표 탐색
4. 대회 전에 “복지·혜택 서비스에 자주 쓰는 지표 후보”만 골라둔다.
5. 실제 숫자는 당일 미션에 맞는 것만 사용하고, 발표에는 출처 ID와 기준일을 함께 적는다.

### 미리 준비할 지표 후보

| 미션 가능성 | 유용한 지표 예 |
|---|---|
| 청년 | 청년 고용률, 실업률, 1인가구, 월세/주거비 관련 통계 |
| 노인 | 고령인구 비율, 독거노인, 기초연금 수급 관련 지표 |
| 아동/가족 | 출생아 수, 한부모 가구, 아동 인구, 돌봄 수요 |
| 장애인 | 등록장애인 수, 장애인 복지시설/고용 관련 지표 |
| 위기가구 | 소득분위, 기초생활보장, 실업, 지역 취약지표 |

### 로컬 저장 권장 구조

```text
data/welfare/statistics/
  raw/
    kosis-indicators.sample.json
  normalized/
    regional-indicators.sample.json
  README.md
```

표준 스키마:

```ts
export type EvidenceStat = {
  id: string
  title: string
  region?: string
  value: number | string
  unit: string
  period: string
  sourceName: "KOSIS"
  sourceUrl: string
  tableId?: string
  asOf: string
}
```

## 4. 3순위 데이터: 신청·상담 접점 시설 데이터

### 왜 필요한가

혜택 추천만 하면 정부24/보조금24와 차별화가 약하다. “다음 행동”을 보여주려면 신청·상담 접점이 필요하다.

미션에 따라 아래 시설 데이터를 후보로 준비한다.

| 시설 유형 | 쓸 수 있는 서비스 장면 |
|---|---|
| 주민센터/행정복지센터 | 신청·상담 장소 연결 |
| 고용복지플러스센터 | 실직·청년·취업 지원 |
| 가족센터 | 한부모·다문화·가족 돌봄 |
| 보건소 | 임신·출산·건강 지원 |
| 노인복지관 | 고령자 복지/돌봄 |
| 장애인복지관 | 장애인 복지/상담 |
| 지역아동센터 | 아동 돌봄/방과후 지원 |

### 받는 법

1. 공공데이터포털에서 시설명을 검색한다.
   - <https://www.data.go.kr/>
2. 검색어 예시:
   - `전국 주민센터 표준데이터`
   - `전국 보건소 표준데이터`
   - `전국 노인복지관 표준데이터`
   - `전국 장애인복지관 표준데이터`
   - `전국 지역아동센터 표준데이터`
   - `전국 가족센터`
   - `고용복지플러스센터`
3. 파일데이터면 CSV를 다운로드한다.
4. OpenAPI면 활용신청 후 샘플 응답을 저장한다.
5. 좌표가 있는 데이터만 지도/거리순 정렬에 사용한다.
6. 좌표가 없으면 주소 문자열만 표시하고, 지도 기능은 fallback 처리한다.

공공데이터포털 이용가이드에 따르면 데이터목록 검색, 상세검색, 데이터정보 확인, 파일데이터 다운로드, OpenAPI 개발계정 신청 방식으로 데이터를 받을 수 있다.  
출처: <https://www.data.go.kr/ugs/selectPublicDataUseGuideView.do>

### 로컬 저장 권장 구조

```text
data/welfare/facilities/
  raw/
    community-centers.sample.csv
    health-centers.sample.csv
  normalized/
    facilities.sample.json
  README.md
```

표준 스키마:

```ts
export type Facility = {
  id: string
  name: string
  type: "community_center" | "health_center" | "welfare_center" | "employment_center" | "family_center" | "child_center" | "other"
  region: string
  address: string
  lat?: number
  lng?: number
  phone?: string
  sourceName: string
  sourceUrl: string
  asOf: string
}
```

## 5. 4순위 데이터: 정책/법령/공식 안내 근거

### 왜 필요한가

LLM이 혜택 조건을 설명할 때 환각을 막으려면 공식 근거 텍스트가 필요하다. 다만 전체 문서를 많이 모으기보다, 당일 미션에 맞는 정책 페이지 3–5개만 근거로 쓰는 편이 안전하다.

후보 출처:

- 정부24/혜택알리미: <https://plus.gov.kr/portal/benefitV2/>
- 보건복지부: <https://www.mohw.go.kr/>
- 고용노동부: <https://www.moel.go.kr/>
- 여성가족부: <https://www.mogef.go.kr/>
- 법제처 생활법령정보: <https://www.easylaw.go.kr/>

### 받는 법

1. 당일 미션 대상자를 정한다.
2. 관련 부처 공식 페이지에서 제도명/지원대상/신청방법을 확인한다.
3. 페이지 URL, 기준일, 핵심 문장만 `sources.json`에 기록한다.
4. LLM에는 원문 전체보다 정리된 JSON 조각을 넣는다.
5. 공식 페이지에 없는 수치나 조건은 발표에서 단언하지 않는다.

## 6. 대회 전 체크리스트

### 계정/키

- [ ] 공공데이터포털 계정 로그인 확인
- [ ] `행정안전부_대한민국 공공서비스(혜택) 정보` 활용신청 완료
- [ ] KOSIS 공유서비스 인증키 신청
- [ ] 지도 API를 쓸 경우 카카오/네이버 지도 키 준비
- [ ] 키는 `.env.local`에만 저장하고 저장소에 커밋하지 않음

### 샘플 데이터

- [ ] 혜택 API 샘플 응답 저장
- [ ] 표준 `Benefit` 스키마로 변환 테스트
- [ ] KOSIS 지표 샘플 3–5개 저장
- [ ] 시설 데이터 샘플 1–2종 저장
- [ ] 각 데이터의 출처 URL, 라이선스, 기준일 기록

### fallback

- [ ] API 키가 없어도 동작하는 fixture JSON 준비
- [ ] 지도 키가 없어도 목록 UI로 동작
- [ ] LLM 키가 없어도 규칙 기반 요약/FAQ fixture로 동작
- [ ] 개인정보 없이 가상 persona만 사용

## 7. 당일 30분 데이터 플로우

대회 당일 미션 공개 후 데이터 작업은 길게 끌지 않는다.

1. 미션 대상자를 정한다.
   - 예: 청년, 노인, 장애인, 한부모, 위기가구, 1인가구
2. `Benefit` 필터 기준을 정한다.
   - 대상, 지역, 생애사건, 소득/고용/가구 조건
3. 혜택 API 또는 샘플 캐시에서 관련 혜택 10–30개만 추린다.
4. 데모에 실제로 보여줄 혜택은 3–6개로 줄인다.
5. `sources.json`에 출처를 즉시 기록한다.
6. 통계는 1–2개만 골라 문제의 크기를 설명한다.
7. 시설 데이터는 “다음 행동”이 필요할 때만 붙인다.

## 8. SOURCE_LOG 템플릿

대회 지침상 외부 코드, 템플릿, 데이터, API의 출처와 라이선스를 제출해야 한다. 아래 양식을 그대로 `SOURCE_LOG.md`에 복사해 사용한다.

```md
# SOURCE_LOG

## Public Data

| Name | Provider | URL | Type | License / Terms | Used For | Retrieved At |
|---|---|---|---|---|---|---|
| 행정안전부_대한민국 공공서비스(혜택) 정보 | 행정안전부 | https://www.data.go.kr/data/15113968/openapi.do | OpenAPI JSON/XML | 이용허락범위 제한 없음 | 혜택 목록/상세 검색 | YYYY-MM-DD HH:mm |
| KOSIS 공유서비스 | 국가데이터처/KOSIS | https://kosis.kr/openapi/ | OpenAPI | KOSIS 이용약관 확인 | 문제 근거 통계 | YYYY-MM-DD HH:mm |

## APIs

| Name | Provider | URL | Auth | Used For | Notes |
|---|---|---|---|---|---|
| 공공서비스 혜택 API | 행정안전부 | https://www.data.go.kr/data/15113968/openapi.do | Service key | 혜택 데이터 조회 | API 실패 시 fixture 사용 |

## Open Source / Templates

| Name | URL | License | Used For | Changes |
|---|---|---|---|---|
| Hackathon starter template | <template repo URL> | <license> | Workflow, Next/KRDS scaffold, presentation pipeline | 당일 미션에 맞게 신규 구현 |

## AI Usage Summary

| Tool | Used For | Human Review |
|---|---|---|
| Codex / Claude / ChatGPT | 코드 생성, 데이터 정규화, 발표 초안 | 팀원이 코드와 출처 확인 |
```

## 9. 추천 데이터 우선순위

| 우선순위 | 데이터 | 준비 이유 | 당일 생략 가능성 |
|---|---|---|---|
| 1 | 대한민국 공공서비스(혜택) 정보 API | 혜택 서비스의 본체 | 낮음 |
| 2 | 혜택 API 샘플 캐시/fixture | 네트워크/키 실패 대비 | 낮음 |
| 3 | KOSIS 지표 샘플 | 문제 중요성/발표 근거 | 중간 |
| 4 | 시설 POI 데이터 | 다음 행동/지도 데모 | 높음 |
| 5 | 공식 정책 페이지 근거 | LLM 답변 신뢰성 | 중간 |

## 10. 금지/주의

- 실제 개인정보, 민감정보, 비공개 행정자료를 수집하거나 LLM/API에 입력하지 않는다.
- 복지 수급 여부, 장애, 건강, 민원 원문 등 개인에게 영향을 줄 수 있는 민감한 실제 데이터는 쓰지 않는다.
- API Key, 토큰, 비밀번호는 저장소에 커밋하지 않는다.
- 사전에 만든 완성형 서비스나 특정 미션 답안을 반입하지 않는다.
- 미검증 수치와 조건은 발표에서 단언하지 않는다.
- mocked/fallback 데이터를 실제 실시간 연동처럼 표현하지 않는다.

