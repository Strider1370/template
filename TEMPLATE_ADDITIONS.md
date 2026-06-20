# 템플릿 사전 추가 자산 제안 (main 적용용)

> **목적:** 해커톤 1회 실제 완주("정부 혜택 찾기" + 실시간 보조금24 + ChatGPT 연동 + 적응형 되묻기)에서 검증한 것을 토대로, **4시간 대회에서 시간을 잡아먹는 "데이터 접근·AI 연동·매칭 패턴"을 미리 박제·스켈레톤화**하자는 제안.
> **짝 문서:** 버그 수정은 [TEMPLATE_FIXES.md](TEMPLATE_FIXES.md), 이 문서는 **신규 자산 추가**.
> **핵심 원칙:** *당일 API 승인·다운로드를 기다리지 않아도 데모가 도는 상태*를 미리 만든다 = ① 스냅샷 박제(무키/오프라인 폴백) + ② 무엇을 어디에 미리 신청할지 인덱스 + ③ 재사용 코드 스켈레톤.
> 작업 브랜치 `work-after`에 아래 파일 실물이 있음 → main에서 `git checkout work-after -- <경로>`로 가져오거나 아래 내용대로 생성.

우선순위: **AI 연동(0) · 보조금24 스냅샷(A) · API 인덱스(B)** 가 "당일 막힘"을 직접 없앤다.

---

## 0. ChatGPT(OpenAI) API 연동 ★최우선 (AI 해커톤 거의 다 필요)

현재 키트엔 LLM 헬퍼가 없다. provider 무관·무키 폴백·모델 자동대응을 갖춘 헬퍼를 기본 자산으로.

### 0-1. 모델 선택 (대회 전 1회)
- 키로 사용 가능 모델 목록 조회: `GET https://api.openai.com/v1/models` (Authorization: Bearer KEY).
- **기본 권장: `gpt-4.1-mini`** — 빠르고 저렴, 클래식 파라미터(`max_tokens`+`temperature`) 그대로. 짧은 파싱/rewrite에 충분.
- **gpt-5.x / o-시리즈는 파라미터가 다름**: `max_tokens` 거부 → `max_completion_tokens` 사용, 커스텀 `temperature` 미지원. → 헬퍼가 모델명으로 자동 분기.

### 0-2. 헬퍼 `web/lib/llm.ts` (전체 내용)
```ts
// OpenAI Chat Completions 헬퍼 (서버 전용). 키 없으면 null → 호출부가 폴백.
const MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const isNewGen = /^(gpt-5|o\d)/.test(MODEL); // 신세대: max_completion_tokens, temperature 미지정

export async function openaiChat(opts: {
  system: string; user: string; json?: boolean; maxTokens?: number; temperature?: number;
}): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const body: Record<string, unknown> = {
    model: MODEL,
    messages: [{ role: 'system', content: opts.system }, { role: 'user', content: opts.user }],
  };
  if (isNewGen) body.max_completion_tokens = opts.maxTokens ?? 300;
  else { body.max_tokens = opts.maxTokens ?? 300; body.temperature = opts.temperature ?? 0.3; }
  if (opts.json) body.response_format = { type: 'json_object' };
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify(body), signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data?.choices?.[0]?.message?.content ?? '').trim() || null;
  } catch { return null; }
}
```
> Anthropic도 쓰려면 같은 시그니처로 `anthropicChat`을 추가하고 `LLM_PROVIDER` env로 분기. (이번 키트는 OpenAI로 검증)

### 0-3. 3가지 사용 패턴 (work-after: `web/app/api/{parse,explain,ask}/route.ts`)
- **구조화 추출(parse):** `json: true` + `temperature: 0` + **결정론적 후처리 정규화**(LLM 출력을 100% 믿지 말 것). 예: 한국어 단서 정규식으로 가구유형 보정, 나이로 청년/노년 태깅, 연봉→월 환산, enum 화이트리스트.
- **설명 rewrite(explain):** 규칙엔진이 확정한 사실만 다듬게 하고, **출력 화이트리스트 검증**(fixture 외 숫자/명칭 섞이면 폴백). → 환각 차단.
- **질문 문구(ask):** `temperature: 0` + "묻는 대상 바꾸지 마라" 강제 → 드리프트(소득→직장 등) 방지.

### 0-4. 설계 원칙 (반드시)
- **판단=규칙엔진, AI=통역(파싱·문구)만.** 자격 판정·사실 생성을 LLM에 맡기지 마라(환각=거짓 안내).
- **키 없으면 폴백으로 100% 동작**(드롭다운/템플릿/기본문구). AI는 "접근성·자연스러움" 레버.
- **env:** `OPENAI_API_KEY`, `OPENAI_MODEL`(선택). `.env.local`은 gitignore.

### 0-5. 함정 (실측)
- **gpt-5.x 파라미터 차이**(위) — 헬퍼 자동분기 필수.
- **한글 API 테스트 인코딩:** Git Bash `curl -d '{"text":"한글"}'`은 CP949로 깨져 전송됨 → 서버가 mojibake 수신 → 정규식/매칭 실패. **테스트는 node `fetch` 또는 브라우저로**(UTF-8 보장). curl 쓰려면 `--data-binary @file.json`(UTF-8 파일).
- gpt-4.1-mini는 **지역(시군구) 추출을 가끔 누락** → "AI가 폼을 채우고 사용자가 수정" UX로 흡수(또는 상위 모델).

---

## A. 보조금24 카탈로그 스냅샷 ★1순위 (당일 키 승인 대기 제거)

- **무엇:** 보조금24(행안부) 공공서비스(혜택) 정보 — **약 10,957건**(중앙+지자체). 필드: 서비스명·목적요약·서비스분야·**지원대상·선정기준**(산문)·신청방법·소관기관·상세조회URL·서비스ID.
- **검증된 엔드포인트(odcloud, JSON):**
  - 목록: `GET https://api.odcloud.kr/api/gov24/v3/serviceList?page=1&perPage=N&serviceKey=KEY`
  - **부분검색 작동:** `cond[지원대상::LIKE]=청년` (URL 인코딩). `cond[서비스분야::EQ]=보육·교육`도 됨.
  - 자동승인이라 **활용신청 즉시 사용 가능**(이번에 확인). data.go.kr 15113968.
- **왜 박제:** data.go.kr 활용신청은 데이터셋에 따라 **승인 1~2일**. 스냅샷이 있으면 **무키/승인 전에도 실데이터 데모**가 돌고, 키 있으면 라이브 최신화.
- **방법:**
  1. 덤프 스크립트 `data/scripts/dump-gov24.mjs`: 키로 perPage=1000씩 페이징해 전체를 `data/gov24-services.json`(또는 분할)으로 저장.
  2. 클라이언트(`/api/policies`)는 **키 있으면 라이브 LIKE 검색 → 없거나 실패면 스냅샷에서 키워드 필터**. (work-after `web/lib/realtime.ts` + `web/app/api/policies/route.ts` 패턴 재사용)
- **지금 만들 수 있음:** 작동 키가 살아있을 때 덤프 떠두면 키 만료·회수와 무관하게 영구 자산.

---

## B. 공공데이터 API 인덱스 보강 ★2순위

- **무엇:** `data/data-sources.md`에 **"검증된 작동 엔드포인트 + 자동승인 여부 + 응답형식 + 핵심필드 + 샘플"** 표를 추가. 대회 전날 5분에 미리 신청하게.
- **이번에 검증/확인한 것 (그대로 등재):**
  | 데이터셋 | ID | 엔드포인트 | 형식 | 승인 | 비고 |
  |---|---|---|---|---|---|
  | 보조금24 공공서비스 혜택 | 15113968 | `api.odcloud.kr/api/gov24/v3/serviceList` | JSON | 자동(즉시) | LIKE/EQ 필터, 10,957건 |
  | 중앙부처복지서비스 | 15090532 | `apis.data.go.kr/B554287/...NationalWelfarelistV001` | XML | **활용신청 필요(미승인 시 Forbidden)** | 대분류 코드 필터 |
  | 지자체복지서비스 | 15108347 | `.../LocalGovernmentWelfareInformations/LcgvWelfarelist` | XML | 활용신청 필요 | 지역 필터 |
  | 복지로 복지서비스정보 | 15083323 | data.go.kr fileData | CSV | 로그인 다운로드 | **자격요건 필드 없음**(명칭·링크만) |
- **교훈 명시:** ① 정밀 자격기준은 대부분 *산문*이라 자동 전수 판정 불가 → 큐레이션 fixture 병행. ② 진짜 개인 자격 판정(보조금24 맞춤안내)은 행정정보 연계라 외부 API로 안 옴.

---

## C. 코드 데이터 (범용)

- **법정동/행정구역 코드** `data/region-codes.json` — 정부 데이터의 지역 필드와 조인용. 현재 `web/lib/regions.ts`는 이름만(코드 없음).
- **생애주기·대상특성 코드표** — 복지 API의 `lifeArray`(영유아/아동/청년/노년…)·`trgterIndvdlArray`(저소득/장애/한부모/다자녀…) 코드. 대분류 후보 필터에 즉시 사용.

---

## D. 재사용 코드 스켈레톤 (work-after에 실물 있음)

- **LLM 헬퍼** — `web/lib/llm.ts` (위 0-2).
- **rules-as-code 매칭 엔진** — `web/lib/types.ts`(Profile·EligibilityRule.slots), `web/lib/eligibility.ts`(`matchBenefits` + `nextBestQuestion` 정보이득 되묻기), `web/lib/benefits.ts`(헬퍼로 규칙 생성). "조건 입력→자격 매칭→왜→다음 질문" 패턴은 복지 외에도 재사용.
- **공개 API 클라이언트 + 스냅샷 폴백** — `web/lib/realtime.ts` + `web/app/api/policies/route.ts`(키워드 LIKE 조회·병합·폴백).
- **입력 폼 패턴** — `web/components/BenefitFinder.tsx`(자연어→AI가 폼 채움→사용자 수정→제출, 단위 토글, 조건부 필드).

---

## E. 큐레이션 fixture 템플릿

- 자격요건이 산문이라 자동 전수 매칭 불가(A에서 확인) → **대표 항목 8~15개를 손으로 규칙화하는 빈 양식**을 제공.
- 필드: `id·name·agency·summary·amount·rules(eligibility 술어 + slots)·applyChannel·applyHowOneLine·applyUrl·source·sampleData:true`. (work-after `web/lib/benefits.ts` 참조)
- 주제 받으면 이 양식만 채우면 정밀 매칭 카드가 동작.

---

## 적용 체크리스트 (main에서)
- [ ] 0. `web/lib/llm.ts` 추가 + `/api/parse·explain·ask` 패턴 + `.env.local.example`에 OPENAI_API_KEY/OPENAI_MODEL
- [ ] A. `data/scripts/dump-gov24.mjs` + `data/gov24-services.json` 스냅샷 + `/api/policies` 폴백
- [ ] B. `data/data-sources.md`에 검증 엔드포인트·자동승인 표 보강
- [ ] C. `data/region-codes.json`, 생애주기·대상특성 코드표
- [ ] D. 스켈레톤 4종 가져오기(`git checkout work-after -- web/lib/llm.ts web/lib/eligibility.ts web/lib/realtime.ts ...`)
- [ ] E. fixture 빈 템플릿
- [ ] 전부 후: `npm run web:build` 확인 후 커밋
