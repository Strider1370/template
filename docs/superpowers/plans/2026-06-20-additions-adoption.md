# ADDITIONS 적용 구현 계획 (work-after 자산 → 템플릿)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`).

**Goal:** 실제 해커톤 1회 완주(work-after)에서 검증된 자산을, 템플릿을 과특화·규칙위반하지 않게 **코어 인프라**와 **떼어낼 복지 도메인팩**으로 분리해 main에 적용한다.

**Architecture:** 두 묶음. 묶음1=주제 무관 코어(LLM 헬퍼 교체, 검증 엔드포인트표, 덤프 스크립트, fixture 양식). 묶음2=복지 도메인팩(work-after의 복지 lib/컴포넌트/라우트를 라벨된 예시로, 기본 홈은 불변). 작업 대상 브랜치는 **main**(사용자 지시).

**Source:** `origin/work-after` (fetch 완료). 파일은 `git show origin/work-after:<path>` 또는 `git checkout origin/work-after -- <path>`로 가져온다. 문서 인라인 자산은 `TEMPLATE_ADDITIONS.md` 참조.

**확정된 결정(2026-06-20):** 구조=코어+도메인팩 분리 · 중복=work-after로 교체 · D=복지 라벨 예시 · 브랜치=main 직접.

**정정 사항(실측):** ① `realtime.ts`는 복지 결합(코어 아님→도메인팩) ② 덤프 스크립트·전수 스냅샷은 미존재(문서에서 작성+키로 실행) ③ `region-codes.json`(§C) 출처 없음→보류.

**검증:** 테스트 러너 없음. web은 `npm --prefix web run build`(타입체크 포함)가 하드 게이트. 스크립트는 `node --check` + 샘플 동작.

---

## 묶음 1 — 코어 인프라 (키 불필요)

### Task A1: LLM 헬퍼 교체 (우리 web/lib/llm/ → work-after web/lib/llm.ts)

**Files:**
- Delete: `web/lib/llm/{types,fixture,openai,index}.ts`
- Create: `web/lib/llm.ts` (from work-after)
- Modify: `web/app/api/llm/route.ts` (use openaiChat)
- Replace: `web/.env.local.example` (from work-after)
- Modify: `web/package.json` (remove `openai` SDK dep — work-after llm.ts uses fetch, no SDK), `README.md` (모델명)

- [ ] **Step 1: work-after llm.ts 가져오기**
```bash
cd "C:/Users/Jond Doe/Desktop/hackathon/template"
git checkout origin/work-after -- web/lib/llm.ts
git rm -r web/lib/llm
```
- [ ] **Step 2: /api/llm 라우트를 openaiChat 기반으로 교체**
`web/app/api/llm/route.ts` 전체를 다음으로 교체(서버사이드, 키 없으면 폴백 문구):
```ts
import { NextResponse } from 'next/server';
import { openaiChat } from '@/lib/llm';

export const runtime = 'nodejs';

// 서버사이드 전용. messages 대신 system/user 한 쌍을 받는 얇은 라우트.
export async function POST(req: Request) {
  let body: { system?: string; user?: string; json?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }
  if (!body.user) {
    return NextResponse.json({ error: 'user required' }, { status: 400 });
  }
  const text = await openaiChat({
    system: body.system ?? '',
    user: body.user,
    json: body.json,
  });
  if (text == null) {
    return NextResponse.json({ text: null, provider: 'fallback' });
  }
  return NextResponse.json({ text, provider: 'openai' });
}
```
- [ ] **Step 3: .env.local.example 교체**
```bash
git checkout origin/work-after -- web/.env.local.example
```
- [ ] **Step 4: openai SDK 의존성 제거** (llm.ts는 fetch 사용, SDK 불필요)
```bash
cd "C:/Users/Jond Doe/Desktop/hackathon/template/web"
npm uninstall openai
```
- [ ] **Step 5: README 모델명 정합**
`README.md`의 키표 OpenAI 행에서 모델 기본값을 `gpt-4.1-mini`로 표기(work-after 기준). 기존 `OPENAI_API_KEY`/`LLM_PROVIDER` 언급 중 `LLM_PROVIDER`는 새 llm.ts엔 없으므로 `OPENAI_MODEL`로 교체.
- [ ] **Step 6: 빌드 검증**
```bash
cd "C:/Users/Jond Doe/Desktop/hackathon/template"
npm --prefix web run build 2>&1 | tail -15
```
Expect: 성공, `/api/llm` 라우트 포함, 타입에러 없음. (이전 우리 llm/ 참조가 어디서도 안 깨지는지 확인 — grep `@/lib/llm/` 0건이어야.)
- [ ] **Step 7: 커밋**
```bash
git add web/lib/llm.ts web/app/api/llm/route.ts web/.env.local.example web/package.json web/package-lock.json README.md
git rm -r --cached web/lib/llm 2>/dev/null; true
git commit -m "feat(web): LLM 헬퍼를 work-after openaiChat로 교체 (모델 자동분기·json·SDK 제거)"
```

### Task A2: 검증 엔드포인트 인덱스 (§B)

**Files:** Modify `data/data-sources.md`

- [ ] **Step 1:** `data/data-sources.md`에 "검증된 작동 엔드포인트" 표 섹션을 추가(파일 끝 또는 관련 섹션 뒤). 내용은 `TEMPLATE_ADDITIONS.md` §B의 표 + §A 승인상태 표를 합쳐 등재:

| 데이터셋 | ID | 엔드포인트 | 형식 | 승인 | 전체건수 | 비고 |
|---|---|---|---|---|---|---|
| 보조금24 공공서비스(혜택) | 15113968 | `https://api.odcloud.kr/api/gov24/v3/serviceList` | JSON | 자동(즉시) | 10,957 | LIKE/EQ 필터 |
| 중앙부처복지서비스 | 15090532 | `https://apis.data.go.kr/B554287/NationalWelfareInformationsV001/NationalWelfarelistV001` | XML | 활용신청 필요 | 452 | 대분류 코드 필터 |
| 지자체복지서비스 | 15108347 | `https://apis.data.go.kr/B554287/LocalGovernmentWelfareInformations/LcgvWelfarelist` | XML | 활용신청 필요 | 4,569 | 지역 필터 |
| 복지로 복지서비스정보 | 15083323 | data.go.kr fileData | CSV | 로그인 다운로드 | - | 자격요건 필드 없음(명칭·링크만) |

교훈 2줄 명시: ① 정밀 자격기준은 대부분 산문→자동 전수판정 불가, 큐레이션 fixture 병행. ② 개인 맞춤 자격판정은 행정정보 연계라 외부 API로 안 옴.
- [ ] **Step 2: 검증** `grep -n "odcloud\|15090532\|활용신청" data/data-sources.md` → 매칭.
- [ ] **Step 3: 커밋** `git add data/data-sources.md && git commit -m "docs(data): 검증된 공공데이터 엔드포인트 인덱스 추가 (보조금24·복지 3종)"`

### Task A3: 복지 데이터 덤프 스크립트 (§A) + 우리 placeholder 제거

**Files:**
- Create: `data/scripts/dump-gov24.mjs`, `data/scripts/dump-welfare.mjs`, `data/scripts/README.md`
- Delete: `data/welfare/benefits/` (우리 placeholder 파이프라인 — 교체)
- Modify: `.gitignore` (스냅샷 산물)

- [ ] **Step 1: 우리 placeholder 제거**
```bash
git rm -r data/welfare/benefits
```
(.gitignore의 `data/welfare/benefits/...` 라인도 제거하고 아래 새 라인으로 대체.)
- [ ] **Step 2: `data/scripts/dump-gov24.mjs`** — `TEMPLATE_ADDITIONS.md` §A 1-a 코드 그대로(검증 엔드포인트 `api.odcloud.kr/api/gov24/v3/serviceList`). 출력 `data/snapshots/gov24-services.json`.
- [ ] **Step 3: `data/scripts/dump-welfare.mjs`** — §A 1-b 코드 그대로(중앙부처·지자체 XML→JSON). 출력 `data/snapshots/welfare-central.json`·`welfare-local.json`.
- [ ] **Step 4: `data/scripts/README.md`** — 실행법(키=`web/.env.local`의 `DATA_GO_KR_KEY`, Decoding 키), 출처/라이선스, "스냅샷은 공개데이터 사전준비로 허용·완성형 서비스는 당일" 명시.
- [ ] **Step 5: `.gitignore`** — `data/snapshots/` 추가(전수 산물 로컬만; 단 사용자가 커밋 원하면 해제 가능하다는 주석).
- [ ] **Step 6: 검증** `node --check data/scripts/dump-gov24.mjs && node --check data/scripts/dump-welfare.mjs`.
- [ ] **Step 7: 커밋** `git add data/scripts .gitignore && git commit -m "feat(data): 보조금24·복지 전수 덤프 스크립트 (검증 엔드포인트) + placeholder 제거"`

### Task A4: 큐레이션 fixture 빈 양식 (§E)

**Files:** Create `data/welfare/curated-benefits.template.json` + 짧은 주석 README 항목(또는 파일 상단 주석 불가하니 동반 md)

- [ ] **Step 1:** `data/welfare/curated-benefits.example.json` 생성 — §E 필드의 빈 양식 1~2개 예시:
```json
[
  {
    "id": "",
    "name": "",
    "agency": "",
    "summary": "",
    "amount": "",
    "rules": { "eligibility": [], "slots": [] },
    "applyChannel": "",
    "applyHowOneLine": "",
    "applyUrl": "",
    "source": "",
    "sampleData": true
  }
]
```
+ `data/welfare/README.md`에 "주제 받으면 이 양식 8~15개를 손으로 규칙화하면 정밀 매칭 카드 동작" 1~2줄.
- [ ] **Step 2: 검증** `node -e "JSON.parse(require('fs').readFileSync('data/welfare/curated-benefits.example.json','utf8')); console.log('valid json')"`.
- [ ] **Step 3: 커밋** `git add data/welfare && git commit -m "feat(data): 큐레이션 혜택 fixture 빈 양식 (당일 정밀매칭용)"`

---

## 묶음 2 — 복지 도메인팩 (떼어낼 라벨 예시)

> 묶음 1 완료 후 착수. 기본 홈(`web/app/page.tsx`)·Header·layout는 **건드리지 않는다.** 복지 앱은 `/examples/welfare` 경로로만 접근하는 격리된 예시.

### Task B1: 복지 lib + 컴포넌트 + 라우트 가져오기 (격리 위치)
**Files (work-after에서 가져옴):**
- `web/lib/{types,eligibility,benefits,ai,realtime,explain-cache.json}` → 그대로 (work-after 경로 유지; 도메인 코드)
- `web/components/{BenefitFinder,BenefitCard,CandidateCatalog,FollowUpQuestion,ParsedProfile}.tsx`
- `web/app/api/{parse,explain,ask,policies}/route.ts`

- [ ] **Step 1: 파일 확보**
```bash
cd "C:/Users/Jond Doe/Desktop/hackathon/template"
git checkout origin/work-after -- web/lib/types.ts web/lib/eligibility.ts web/lib/benefits.ts web/lib/ai.ts web/lib/realtime.ts web/lib/explain-cache.json
git checkout origin/work-after -- web/components/BenefitFinder.tsx web/components/BenefitCard.tsx web/components/CandidateCatalog.tsx web/components/FollowUpQuestion.tsx web/components/ParsedProfile.tsx
git checkout origin/work-after -- web/app/api/parse/route.ts web/app/api/explain/route.ts web/app/api/ask/route.ts web/app/api/policies/route.ts
```
- [ ] **Step 2:** 각 가져온 lib/route가 `@/lib/llm` 등 우리 새 경로와 맞는지 확인. work-after의 `ai.ts`/라우트가 `openaiChat`(llm.ts)을 import하면 정합 OK. import 경로 깨지면 수정.
- [ ] **Step 3: 빌드** `npm --prefix web run build` — 타입/참조 에러 잡기(특히 page.tsx가 아직 이 컴포넌트들을 안 쓰면 미사용일 수 있음).

### Task B2: 격리 예시 라우트 + 라벨링
- [ ] **Step 1:** `web/app/examples/welfare/page.tsx` 생성 — work-after `web/app/page.tsx`의 복지 앱 로직을 이 경로로 옮겨 담는다(기본 홈은 기존 스캐폴드 유지). 상단에 "⚠ 복지 주제 예시 — 다른 주제면 `examples/`·복지 lib/컴포넌트/라우트 삭제" 배너.
- [ ] **Step 2:** `web/app/examples/welfare/README.md`(또는 docs) — 활성화/삭제 방법, 어떤 파일이 복지 전용인지 목록.
- [ ] **Step 3: 빌드 + 스모크** `npm --prefix web run build`; dev로 `/`(기본 스캐폴드 그대로)와 `/examples/welfare`(복지앱) 둘 다 뜨는지 확인(키 없으면 폴백 동작).
- [ ] **Step 4: 커밋** 묶음 2 일괄 커밋.

### Task B3: 도메인팩 문서화
- [ ] `docs/kit-assets.md` 또는 `README.md` §6에 "복지 도메인팩(examples/welfare): 무엇이 들었고, 어떻게 활성화/제거하는가" 1문단 추가. 규칙 가드(완성형 아님·예시) 명시.

---

## Self-Review
- 결정 커버: LLM 교체(A1)·검증표(A2)·덤프(A3)·fixture(A4)·복지 예시 격리(B1-3) 모두 포함. region-codes(§C)·전수 실제데이터=보류(키/출처 의존, 명시).
- 규칙 가드: 기본 홈 불변 + 복지는 격리 예시 + 스냅샷은 데이터 사전준비 → "완성형 반입" 회피.
- 위험: 묶음2에서 work-after page.tsx 로직 이식 시 import/경로 정합이 관건 → 빌드 게이트로 확인.
