# plan.md — 구현 계획

> **Stage 04 산출물.** `spec.md`를 **어떻게 만드는가**로 분해. 각 작업마다 폴백을 미리 정한다.
> 기준선: [concept.md](concept.md) · [spec.md](spec.md) · [demo/demo.scenario.yaml](demo/demo.scenario.yaml). 소유권: `workflow/decisions/file-ownership.yaml`.

## 1. 기술 스택 결정
`web/` 스캐폴드 그대로(Next 14 App Router + React 18 + TS + Tailwind + `@krds-ui/core`, install·build 통과 확인됨). 새 의존성 최소.
- 단일 페이지·무로그인·무저장 → **서버/DB 없음.** AI만 서버 API 라우트 2개(Anthropic `claude-sonnet-4-6`), **키 없거나 실패 시 폴백으로 100% 동작.**
- 자격 *판정*은 클라이언트 규칙엔진(결정론적). AI는 입력 구조화 + 확정 텍스트 다듬기만(사실 생성 금지).

## 2. 작업 분해 + 구현 순서
> 데모 핵심 경로(spec §8: 입력→구조화→매칭→카드)를 먼저 끝까지 연결. 코어 먼저, UI·AI는 그 위에.

| # | 작업 | 산출물(파일/화면) | 담당(Agent) | 폴백 (시간 내 안 되면) |
|---|---|---|---|---|
| 1 | 결정론적 코어 | `web/lib/types.ts`, `web/lib/benefits.ts`(혜택 fixture 8~10), `web/lib/eligibility.ts`(매칭) | Data Agent (또는 메인) | 외부 의존 0(순수함수·정적). 시간 부족 시 혜택 6건으로 축소 |
| 2 | UI (KRDS) | `web/app/page.tsx`, `components/BenefitFinder.tsx`·`ParsedProfile.tsx`·`BenefitCard.tsx` | UI Agent | 드롭다운 입력+규칙결과+템플릿설명만으로 완결(AI 0 의존) |
| 3 | AI 레이어 | `web/app/api/parse/route.ts`, `web/app/api/explain/route.ts`, `web/lib/ai.ts`, `web/lib/explain-cache.json` | AI Agent | 무키/실패/환각 → 드롭다운 파싱 + 폴백 템플릿 + 사전 캐시 |

**구현 순서:** ① 코어(메인 먼저, 타입 확정) → ② UI + AI **병렬**(코어 타입 의존, 서로 파일 안 겹침) → ③ 통합·Wow 불변식 확인(Stage 06).
**Wow 불변식:** 입력경로·LLM 생사 무관하게 `parsed-profile·benefit-card·eligibility-checklist·why-explanation` 항상 렌더. 로그인 화면(`login` testid) 미존재.

### WP3 환각 가드 알고리즘 (필수 — AI Agent가 `lib/ai.ts`에 구현)
explain 라우트는 규칙엔진이 확정한 `{혜택명, met 조건, 금액}`만 입력받아 **문장만 다듬는다(rewrite).** 다듬은 출력은 **검증을 통과해야** 화면에 나간다:
1. 화이트리스트 = 해당 fixture 레코드의 `{혜택명, 금액, 조건 토큰}` 값들.
2. 출력에서 숫자/금액 토큰·혜택명을 추출 → 화이트리스트에 **없는 값이 하나라도 있으면 거부.**
3. 거부 시 **폴백 템플릿**(`{혜택명}은 {met를 사람말로}라서 해당됩니다`)으로 자동 대체.
→ LLM은 새 사실을 만들 권한이 없다(spec §5·§13의 실행 절차).

### AI 후순위 + parsed-profile 폴백 소유 (권장)
- 시간 압박 시 **`parse`(자연어 구조화)를 먼저 희생**(드롭다운으로 강등), **`explain`(Wow 핵심)을 사수.**
- **`parsed-profile` 구조화 칩 생성 책임은 클라이언트 코어/UI 측**(AI 아님). AI 폴백 경로(드롭다운/규칙 파싱)에서도 칩이 항상 렌더되도록 — Wow 불변식 보장.

### testid 계약 (작업 정의 시점에 고정 — UI Agent 누락 방지)
| testid | 책임 작업/컴포넌트 |
|---|---|
| `nl-input`, `find-benefits` | WP2 `BenefitFinder.tsx` |
| `parsed-profile` | WP2 `ParsedProfile.tsx` (코어 파싱 결과, 폴백 포함) |
| `benefit-card` | WP2 `BenefitCard.tsx` |
| `eligibility-checklist` | WP2 `BenefitCard.tsx` (WP1 eligibility의 met[] 렌더) |
| `why-explanation` | WP2 `BenefitCard.tsx` (WP3 설명 or 폴백 템플릿) |
| `apply-cta` | WP2 `BenefitCard.tsx` (신청 채널) |
| `sample-data-label` | WP2 `page.tsx` (상시 라벨) |
| `login` (부정) | 어디에도 렌더하지 않음 — Wow 불변식 |

## 3. 데이터 연결 계획 (실시간 → 정적 폴백)
| 데이터 | 출처 | 실시간/정적 | 폴백(정적 백업) | 확보 상태 |
|---|---|---|---|---|
| 혜택 목록·자격규칙 | 복지로 실제 제도(부모급여·첫만남·아동수당·기저귀바우처·청년월세·기초연금 등) 근거 | **정적 fixture** | 해당 없음(처음부터 정적) | 큐레이션 작성 예정, "예시 데이터" 라벨 |
| 지역(시도·시군구) | `web/lib/regions.ts` | 정적(번들) | — | ✅ 확보됨(재사용) |
| 복지로 상세 링크 | bokjiro.go.kr | 정적 링크 | — | 카드 신청 동선용 |
| (미사용) 복지로 CSV 15083323 | data.go.kr | — | 자격 필드 없어 매칭 불가 → 명칭·링크 보강용만 | 당일 불필요 |

## 4. 파일 소유권 (Ownership)
> 한 파일은 한 주체만. 메인 전용은 서브에이전트 수정 금지. 확정본 = `workflow/decisions/file-ownership.yaml`.

### 메인 에이전트 전용 (서브에이전트 수정 금지)
- `workflow/state.yaml`, `workflow/stages.yaml`, `spec.md`, `plan.md`, `PROGRESS.md`, `README.md`, `concept.md`
- 루트 `package.json`, `web/package.json`, 공통 설정/Schema
- `web/app/layout.tsx`, `web/app/globals.css`, `web/tailwind.config.ts`(공통 스타일/레이아웃)

### 에이전트별 소유 경로
| Agent | 쓰기 허용(write) | 읽기(read) | 쓰기 금지(doNotWrite) |
|---|---|---|---|
| Data Agent | `web/lib/types.ts`, `web/lib/benefits.ts`, `web/lib/eligibility.ts` | spec.md, plan.md, concept.md | 메인 전용 전체, page/components/api |
| UI Agent | `web/app/page.tsx`, `web/components/BenefitFinder.tsx`·`ParsedProfile.tsx`·`BenefitCard.tsx` | spec.md, plan.md, demo.scenario.yaml, lib/types.ts, regions.ts | 메인 전용 전체, lib/benefits·eligibility, api/ |
| AI Agent | `web/app/api/parse/route.ts`, `web/app/api/explain/route.ts`, `web/lib/ai.ts`, `web/lib/explain-cache.json`, `web/.env.local.example` | spec.md, plan.md, lib/types.ts, lib/benefits.ts | 메인 전용 전체, page/components, lib/eligibility |

> 충돌 검사: 세 Agent의 write 경로 교집합 = ∅. `lib/types.ts`는 Data Agent 단독 소유(UI·AI는 read만) → 코어 먼저 완성 후 병렬.

## 5. 사용자 사전 준비 체크리스트 (사람이 할 일)
- [ ] **(선택) Anthropic API 키** → `web/.env.local`에 `ANTHROPIC_API_KEY=...`. **없어도 데모는 폴백으로 완전 동작**(드롭다운+템플릿). 있으면 자연어 입력·자연스러운 설명 ON.
- [x] 카카오맵 키 — **불필요**(지도 미사용)
- [x] 공공데이터 다운로드 — **불필요**(혜택은 큐레이션 fixture, 당일 다운로드 안 함)
- [ ] `.env.local`은 커밋 금지(`.env.local.example`만 커밋)

## 6. 체크포인트 계획
- 체크포인트 1: WP1 코어 완성(규칙엔진이 데모 페르소나로 ≥3건 매칭) 직후
- 체크포인트 2: WP2 UI가 폴백 경로로 데모 완주(build 통과·testid 렌더) 직후
- 체크포인트 3: WP3 AI 연결 + Wow 불변식(통합 빌드 통과) 직후 — push는 마지막 한 번
