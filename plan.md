<!--
plan.md — Stage 04 산출물. spec.md를 작업으로 분해 + 순서 + 기능별 폴백 + 파일 소유권.
기준선: concept.md(북극성), spec.md(16헤딩), demo/demo.scenario.yaml.
원칙: 엔진 AI only(멀티모달+LLM), 단 출처는 검증된 fixture에서만 인용(환각 차단). 데이터 코드 폴백 없음 — 데모 보험은 사전준비/샘플/녹화.
-->
# plan.md — 구현 계획 (행정 온램프)

## 0. 실행 모드
**Stage 05는 메인 단독 권장.** 단일 페이지 앱(통합 입력 1칸 + 결과 카드)이라 작업이 공통 상태(입력→/api/llm→카드)에 강하게 얽혀 병렬화 시 충돌·오버헤드가 더 큼(트랙 D·키트 속도원칙과 일치). 출처 fixture 수집만 별도 레인으로 분리 가능(코드와 무충돌).

## 1. 작업 분해 (우선순위 = spec §16. ①~③ 핵심, ④~⑥ 스트레치, ⑦ 마감)

### T1 [핵심] 단일 페이지 + 통합 입력 + 가이드 카드
- `web/app/page.tsx`: 통합 입력칸(textarea: "문서를 붙여넣거나 상황을 적으세요") + '예시로 해보기'(지급명령 샘플) + '분석' 버튼.
- `web/components/GuideCard.tsx`: 4칸 카드 — ①뜻 ②기한 ③첫 걸음(`data-testid="step-first-action"`) ④어디로(관할). 컨테이너 `data-testid="guide-card"`.
- `/api/llm` 호출(`json:true`)로 구조화 응답 바인딩.
- **폴백:** 코드 규칙 폴백 없음(AI only). 로딩/에러 상태 UI만. 데모 보험=검증 샘플.

### T2 [핵심] 출처 fixture 코퍼스 + 인용 (환각 차단 — 교차검토 치명지적)
- `data/sources/jipgeup-myeongryeong.json`, `jeonipsingo.json`: 항목 `{id,title,url,publisher,asOf,snippet,keywords[]}` 각 5~15건(공식 안내/법령 발췌).
- 호출 전 사용자 입력 키워드로 fixture에서 **단순 키워드 매칭 1~5건** 추려 user 메시지에 근거로 주입(임베딩 불필요).
- **데모 보장:** 지급명령·전입신고 **대표 키워드는 반드시 1건 이상 매칭**되게 fixture keywords 구성(데모 step3의 source-badge가 확실히 렌더 — 0건 폴백으로 배지가 안 뜨는 위험 제거).
- `web/components/SourceBadge.tsx`: `data-testid="source-badge"`, href는 **fixture URL 화이트리스트에서만**.
- **폴백:** 매칭 근거 없으면 카드에 "공식 확인 필요 + 공식 포털 링크"(spec §13). URL 지어내기 금지.

### T3 [핵심] 즉석 입력 동작 + 환각 가드 + 응답 스키마
- system 프롬프트: *"주어진 근거 안에서만 답하라. 근거 없으면 '공식 확인 필요'라 말하고 지어내지 마라. 답변 끝에 사용한 근거 id를 적어라."*
- JSON 스키마: `{summary, deadline, firstStep, jurisdiction, sourceIds[]}` → 카드 바인딩.
- 즉석(미리 안 짜둔) 입력도 동일 경로로 처리됨을 확인(데모 step4).
- **폴백:** JSON 파싱 실패 시 재요청 1회 → 실패면 원문 표시 + "확인 필요".

### T4 [스트레치] 사진 입력 = 멀티모달 비전
- `web/lib/llm.ts` 확장: `image?: string`(dataURL) 받으면 user content를 `[{type:text},{type:image_url}]` 배열로. 모델은 비전 가능(gpt-4.1-mini 기본 OK).
- `web/app/api/llm/route.ts`: `image` 패스스루. 입력칸에 `<input type="file" accept="image/*" capture="environment">`.
- **llm.ts 건드릴 때 함께(교차검토 권고):** ① 비전 모델 가드(`OPENAI_MODEL`이 비전 미지원이면 붙여넣기 폴백) ② 비전 경로 `maxTokens` 상향(예: 800 — 이미지+4칸 JSON에 300은 빠듯) ③ 비전 경로 타임아웃 상향(예: 30초 — 큰 base64는 12초 초과 가능).
- **폴백:** 비전 실패/키 없음 → 붙여넣기 경로. 라이브 의존 X(검증 샘플 이미지 준비).

### T5 [스트레치] 전입신고 2번째 시나리오
- `data/sources/jeonipsingo.json` 활용. 상황 입력("이사했는데…") → 같은 엔진. "같은 엔진이 일상 민원도" 시연.

### T6 [스트레치] 위치/지도 관할 표시
- `web/lib/regions.ts`(시도→시군구) + `web/components/KakaoMap.tsx`(무키 폴백). **관할=주소/사건 기준**(거리 최근접 아님). 확신 없으면 "정확한 소관 확인" 링크.
- **폴백:** 카카오키 없으면 키트 fallback UI(텍스트 관할명만).

### T7 [마감] KRDS·모바일·PWA·배포
- KRDS 룩(`@krds-ui/core`, 함정: Badge `label` prop, native select — kit-assets 준수) + 정부 엠블럼.
- **내부 우선순위(교차검토 권고, 시간 압박 시 위→아래):** ① **배포 Vercel https URL(대회 규정 필수 — 사수)** → ② 모바일 반응형 → ③ PWA(manifest·홈 화면·카메라) → ④ 배너(`npm run generate-banner`). PWA는 미뤄도 배포는 뺄 수 없음.
- 네이티브 APK 스킵.

## 2. 재사용 자산 (새로 만들지 말 것)
| 자산 | 위치 | 용도 |
|---|---|---|
| Next.js+KRDS 스캐폴드 | `web/` | 그대로 시작(init 생략) |
| LLM 헬퍼 `openaiChat` | `web/lib/llm.ts` | 두뇌 — **T4에서 이미지 지원만 확장** |
| LLM 라우트 | `web/app/api/llm/route.ts` | image 패스스루만 추가 |
| 지역 데이터 | `web/lib/regions.ts` | T6 관할 |
| 지도 | `web/components/KakaoMap.tsx` | T6(무키 폴백 내장) |
| 큐레이션 양식 | `data/welfare/curated-benefits.example.json` | T2 출처 fixture 스키마 참고 |
| 배너 생성 | `scripts/generate-banner.mjs` | T7 hero |
| 안 씀 | shelters/*, 경계 GeoJSON | 이 주제 핵심 아님 |

## 3. 기능별 폴백 요약
- **엔진(AI):** 코드 규칙 폴백 없음(AI only 베팅). 보험 = 키 사전준비 + 검증 샘플 + 시연 녹화.
- **출처:** fixture 매칭 없으면 "공식 확인 필요"(URL 날조 금지).
- **사진 비전:** 실패 → 붙여넣기/샘플.
- **지도:** 카카오키 없음 → 텍스트 관할명.
- **JSON 파싱:** 실패 1회 재시도 → 원문+확인필요.

## 4. 사용자 사전준비 (안내)
1. **`OPENAI_API_KEY` (필수)** — 비전 가능 모델(기본 `gpt-4.1-mini`로 충분). `web/.env.local`에 설정. 키 없으면 데모 핵심이 안 돔(AI only).
2. **출처 fixture 원자료 (필수, T2)** — 지급명령·전입신고 공식 안내/법령 스니펫. 막힌 환경이면 data.go.kr/법령 직접 접근이 막히니 **사람이 공식 페이지에서 스니펫+URL 5~15건 수집해 `data/sources/`에 넣기**(권위 단일 출처 우선, 못 구하면 "샘플" 명시).
3. **카카오맵 JS 키 (선택, T6)** — developers.kakao.com + 도메인 등록. 없으면 지도 폴백.

## 5. Stage 05 Agent Task 계약 (메인 단독이면 메인이 순차 수행; 분리 시)
- **build-agent** (필요 시): `read`=[spec.md, demo/demo.scenario.yaml, plan.md, web/lib/llm.ts], `write`=`web/app/**`·`web/components/**`·`web/lib/llm.ts`, `doNotWrite`=spec/plan/concept/workflow/state·data/sources, `deadlineMinutes`=120, `completion`=[demo.scenario step1~4 화면 동작, guide-card+source-badge 렌더, `npm run web:build` 통과], `report`=completed/changedFiles/verification/blockers/fallbackUsed/decisionsNeeded.
- **data-agent**(무충돌 레인): `write`=`data/sources/**`만, `completion`=fixture 5~15건/시나리오 + URL 화이트리스트.
