# 템플릿 개선 설계 — 단계 멈춤·비동기 에이전트·전수 데이터·OpenAI 연동

> 작성일: 2026-06-20
> 대상: 해커톤 워크플로우 엔진 템플릿 (`maintenance`/`bootstrap` 성격 변경 — run-모드 Stage 진행과 분리)
> 상태: 설계 승인됨 (2026-06-20). 구현 계획(writing-plans) 단계로 진행 예정.

## 0. 배경과 목표

이 저장소는 4시간 AI 해커톤용 단계 기반 워크플로우 엔진이다. 실제 사용/테스트에서 드러난
네 가지 마찰과 한 가지 검토 요청을 템플릿 수준에서 개선한다.

1. 단계가 자동으로 다음으로 넘어가, 사용자가 중간에 방향을 잡을 틈이 없다.
2. 서브에이전트를 띄우면 메인이 결과를 기다리느라 사용자와 대화가 끊긴다.
3. 4시간 압박 탓에 데이터를 "예시 몇 개"로만 구현해, 실사용 가능한 데모가 안 나온다.
4. 앱 런타임 LLM 연동 스캐폴드가 없고(현재 fixture 기반), 복지 데이터가 번들돼 있지 않다.
5. web 상단 배너에 OpenAI 이미지 생성을 붙일 수 있는지 검토가 필요하다.

### 승인된 핵심 결정 (2026-06-20)

- **데이터 확보**: data.go.kr 혜택 API 키 보유/확보 가능 → **전수 적재** 진행.
- **LLM 연동**: **OpenAI 기본 + provider 교체 가능 추상화**.
- **단계 멈춤**: **엔진 가드(코드) + CLAUDE.md 지침** 둘 다.
- **배너 이미지**: **검토·설계 문서화만**, 구현 보류.

### 규칙 가드레일 (전 항목 공통)

해커톤 규칙상 **공개 데이터의 사전 준비는 허용되나 완성형 결과물(미션 답안) 반입은 금지**다
(`docs/welfare-benefit-dataset-prep.md`, `README.md` §6.1 기준). 따라서:

- ✅ 허용: 전수 공개 데이터 사전 적재, 스키마·정규화 스크립트·재사용 LLM/이미지 스캐폴드.
- ❌ 금지: 특정 미션 답안에 가까운 **완성된 복지 서비스**를 미리 빌드해 두는 것.

선: "전수 데이터 + 재사용 스캐폴드"까지 사전 준비, **완성 앱은 당일 조립**.

---

## 1. 단계 경계 멈춤 — 엔진 가드 + 지침

### 문제
`workflow/scripts/complete-stage.mjs`는 현재 단계를 마감한 뒤 곧바로 다음 단계를
`not_started`로 세팅해 자동 전환한다. 사용자가 "그대로 갈지 / 고칠지" 판단할 멈춤 지점이 없다.

### 설계
- **새 상태값 `awaiting_direction`** 도입. 단계 Gate 통과 + Handoff 생성 후, 엔진은
  자동으로 다음 단계로 넘기지 않고 이 상태에서 정지한다.
- **`complete`와 `next` 분리**:
  - `workflow:complete` — 현재 단계를 `completedStages`에 기록하고
    `current.status = 'awaiting_direction'`로 두고 멈춘다. **다음 단계로 전환하지 않는다.**
  - `workflow:next` (신규 스크립트) — `awaiting_direction` 상태일 때만 다음 단계로 전환한다.
    그 외 상태에서 호출하면 거부한다.
- **마지막 단계 예외**: 마지막 단계의 `complete`는 기존대로 `completed`로 마감(다음 없음).
- **상태 표시 갱신**: `status.mjs`/`resume.mjs`가 `awaiting_direction`을 인식해
  "다음 단계로 진행하려면 사용자 확인 후 `workflow:next`" 안내를 출력.
- **CLAUDE.md 지침 추가** (작업 순서 9~10번 보강):
  > 단계 Gate 통과 후 `workflow:complete`로 마감하면 엔진이 `awaiting_direction`에서 멈춘다.
  > 이때 반드시 사용자에게 ① 이 단계 결과 요약 ② 다음 단계 미리보기
  > ③ "그대로 진행할지 / 수정 후 진행할지"를 묻는다. 사용자가 진행을 택하기 전에는
  > `workflow:next`를 실행하지 않는다. (02·11 승인 단계와 별개로 모든 단계 경계에 적용.)

### 영향 파일
- `workflow/scripts/complete-stage.mjs` (자동 전환 로직 → 정지)
- `workflow/scripts/next-stage.mjs` (신규: 전환 전담)
- `workflow/scripts/status.mjs`, `resume.mjs` (새 상태 인식)
- `workflow/scripts/_common.mjs` / `lib.mjs` (상태 상수·전환 헬퍼가 있다면)
- 루트 `package.json` (`workflow:next` 스크립트 등록)
- `CLAUDE.md` (지침), `README.md` §3 절차 설명 갱신

### 검증
- `complete` 후 `state.yaml.current.status == 'awaiting_direction'`이고 stageNumber가 그대로인지.
- `awaiting_direction`이 아닐 때 `next` 호출 시 거부되는지.
- `next` 후 다음 단계로 정상 전환되는지.
- 마지막 단계 `complete`가 `completed`로 끝나는지(회귀 없음).

---

## 2. 비동기 서브에이전트 — 메인 대화 유지

### 핵심
메인 에이전트의 Agent 도구는 `run_in_background: true`를 지원한다. 서브에이전트를
백그라운드로 띄우면 도는 동안 메인은 사용자와 대화를 유지하고, 완료 시 알림을 받는다.
**엔진 코드 변경이 아니라 운영 방식(지침/템플릿) 변경**이다.

### 설계
- **CLAUDE.md 작업 순서 6번 수정**:
  > 서브에이전트는 백그라운드로 띄운다. 즉시 사용자에게 "조사/작업이 도는 중이며 그동안
  > 다른 질문·작업이 가능하다"고 알리고 메인은 대화 가능 상태를 유지한다. 결과 도착 시 통합한다.
- **`workflow/templates/agent-task.yaml` 보강**: 백그라운드 실행 전제, 각 서브에이전트는
  자기 보고서 파일(읽기 쉬운 md 1개)을 남긴다는 규약 명시.
- **남길 주의(문서에 명시)**: Stage 01 통합은 5개 보고서가 모두 도착해야 가능하다.
  "통합" 자체는 결과를 기다리지만, **대기 시간 동안 메인이 멈추지 않고 사용자와 상호작용**하는
  것이 이 변경의 본질이다. 통합 직전에는 누락 보고서가 없는지 확인한다.

### 영향 파일
- `CLAUDE.md` (작업 순서 6, 19번 관련 서술)
- `workflow/templates/agent-task.yaml`
- 관련 Stage 지침 (`workflow/stages/01-research.md` 등 병렬 단계)

### 검증
- 지침이 "백그라운드 띄움 → 사용자에게 알림 → 대화 유지 → 완료 시 통합" 순서를 명확히 담는지(문서 리뷰).

---

## 3. 실사용 가능한 데모 + 전수 데이터 방향성

### 문제
4시간 압박으로 데이터 모집단을 "예시 3~5개"로 줄여 구현해, 검색·필터가 빈약한
시연용 껍데기가 되는 경향.

### 설계 (지침 문서 + §4 데이터 파이프라인이 짝)
- **원칙을 지침에 추가** (`docs/AI_Hackathon_Operating_System.md` 또는 `kit-assets.md` + `CLAUDE.md`):
  > 데이터는 **전수(전체 카탈로그)** 를 기본 모집단으로 적재한다. "예시 N개"는 화면 표시
  > 개수일 뿐이며, 검색·필터·매칭의 모집단은 전체여야 한다. 모집단을 샘플로 줄여 구현하지 말 것.
  > 시간이 부족하면 데이터를 줄이지 말고 **기능 범위(보여줄 화면 수)** 를 줄인다.
- **규칙 가드 동시 명시**: 전수 *데이터*는 사전 적재 OK, *완성형 미션 답안 서비스*는 당일 조립.

### 영향 파일
- `docs/AI_Hackathon_Operating_System.md` (데이터/구현 품질 기준 절)
- `docs/kit-assets.md` (데이터 재사용 안내)
- `CLAUDE.md` (속도 원칙/금지 사항 절에 "모집단 축소 금지" 추가)

### 검증
- 지침에 "모집단=전수, 표시=일부" 구분과 "샘플로 모집단 축소 금지"가 명시됐는지(문서 리뷰).

---

## 4. OpenAI 연동 + 복지 전수 데이터 사전 적재

### 4-A. LLM 스캐폴드 (OpenAI 기본 + 교체 가능)

#### 설계
- **`web/lib/llm/` 신설**:
  - `types.ts` — `LlmProvider` 인터페이스(`complete(messages, opts)` 등 최소 표면).
  - `openai.ts` — 기본 구현. `OPENAI_API_KEY` 사용.
  - `fixture.ts` — 키 없을 때 폴백(고정 응답/규칙 기반).
  - `index.ts` — env(`LLM_PROVIDER`, 기본 `openai`)로 provider 선택, 키 없으면 fixture로 폴백.
- **서버사이드 전용**: 호출은 Next.js **API route**(`web/app/api/llm/route.ts` 등)에서만.
  키를 클라이언트 번들에 노출하지 않는다.
- **환경변수**: `.env.local`에 `OPENAI_API_KEY`, `LLM_PROVIDER`(선택). `.env.local`은 커밋 금지.

#### 영향 파일
- `web/lib/llm/{types,openai,fixture,index}.ts` (신규)
- `web/app/api/llm/route.ts` (신규 예시 라우트)
- `web/package.json` (`openai` 의존성 추가)
- `README.md` 키 표 + `docs/kit-assets.md` (OpenAI 기준으로 갱신, Anthropic 가정 제거)

### 4-B. 복지 전수 데이터 파이프라인

#### 설계
- **`data/welfare/benefits/`** 구조 (`welfare-benefit-dataset-prep.md`의 권장 구조 준수):
  - `fetch.mjs` — 혜택 API(15113968)를 페이지네이션으로 **전수** 호출 → `raw/public-service-benefits.json`.
    `.env.local`의 `DATA_GO_KR_KEY`를 읽는다.
  - `normalize.mjs` — 표준 `Benefit` 스키마로 변환 → `normalized/benefits.full.json`.
  - `schema/benefit.schema.json` — 표준 스키마.
  - `README.md` + `SOURCE_LOG` 항목(출처·라이선스·기준일).
- **앱 소비**: `web/public/data/welfare/benefits.full.json`로 복사(또는 빌드 스텝)해 전수 로드.
- **실행 흐름**: 사용자가 `.env.local`에 `DATA_GO_KR_KEY`를 넣으면 메인이 `fetch.mjs` →
  `normalize.mjs`를 실행해 전수 적재. **키는 채팅에 노출하지 않는다.**

#### 미해결 결정 (구현 중 데이터 크기 확인 후 확정)
- **전수 JSON 커밋 여부**: 수천 건이면 용량이 클 수 있다. 옵션:
  (a) 저장소 커밋(사전 준비물로 재사용), (b) `.gitignore`로 로컬만 두고 fetch로 재생성.
  → fetch 후 실제 크기를 보고 사용자와 결정. 기본값: **샘플 fixture는 커밋, 전수 full은 크면 gitignore**.

#### 영향 파일
- `data/welfare/benefits/{fetch.mjs,normalize.mjs,schema/benefit.schema.json,README.md}` (신규)
- `web/public/data/welfare/` (생성물 또는 복사 스텝)
- `.gitignore` (전수 full 처리 방침에 따라)
- `data/data-sources.md` / `SOURCE_LOG` (출처 기록)

### 검증
- 키 있을 때: `fetch.mjs`가 전수(전체 페이지)를 받고 `normalize.mjs`가 `Benefit[]` full JSON을 만드는지.
- 키 없을 때: LLM·데이터 모두 fixture 폴백으로 앱이 깨지지 않는지.
- `web` `npm run build` 통과(회귀 없음).

---

## 5. 배너 이미지 OpenAI 생성 — 검토·설계 문서화만

### 설계 (구현 보류, 문서 1개 작성)
`docs/banner-image-generation-design.md`에 다음을 정리:
- **가능성**: OpenAI `gpt-image-1`로 배너 생성 가능. 입력=주제/톤 프롬프트, 출력=PNG.
- **Header 슬롯**: 현재 `web/components/Header.tsx`는 엠블럼+서비스명만. 배너 이미지 슬롯
  (히어로 영역 배경/상단 띠) 추가 방식 스케치.
- **생성 시점**: (a) 빌드타임 스크립트로 생성→`web/public/banner.png` 저장(추천: 런타임 비용·지연 없음),
  (b) 런타임 API route 생성(유연하나 과금·지연).
- **비용/제약**: 이미지당 과금, 생성 지연(수초), 폴백(정적 기본 배너), 텍스트 렌더 한계.
- **규칙**: 생성물 출처·도구를 `SOURCE_LOG`에 기록. KRDS 톤·접근성(대비) 고려.
- **권고**: 빌드타임 생성 + 정적 폴백. 실제 구현은 별도 작업으로.

### 영향 파일
- `docs/banner-image-generation-design.md` (신규, 문서만)

---

## 6. 구현 순서 (작은 것·독립적부터)

1. ① 엔진 가드 (`complete`/`next` 분리 + 새 상태 + 지침)
2. ② 비동기 서브에이전트 지침 (CLAUDE.md + 템플릿)
3. ③ 전수 방향성 지침 (docs + CLAUDE.md)
4. ⑤ 배너 검토 문서 (docs 1개)
5. ④-A OpenAI LLM 스캐폴드 (web/lib/llm + API route + 의존성)
6. ④-B 복지 전수 데이터 파이프라인 (fetch/normalize + 키 투입 후 전수 적재)

각 묶음은 독립적이며 순차로 체크포인트 커밋한다.

## 7. 비범위 (YAGNI)

- 멀티 프로바이더 동시 지원(Anthropic+OpenAI 라우팅)은 하지 않는다 — OpenAI 기본 + 교체 가능 추상화까지만.
- 배너 이미지 실제 구현은 이번 범위 밖(검토 문서만).
- 복지 외 다른 분야 데이터 전수 적재는 이번 범위 밖.
- 완성형 복지 서비스/미션 답안 사전 구현은 규칙상 금지(명시적 비범위).
