# Made by Hand — 자동화 제거 & 참고 라이브러리화 플랜 (작업 전 청사진)

> 목표: **엔진(자동 오케스트레이션) 제거 → "한 장 체크리스트(척추) + 정리된 참고 라이브러리(살)"**.
> 결과물은 당일 시제 받고 손으로 제작. 이 문서는 *플랜*이며, 실제 삭제/병합은 **확인 후 시작**.
> 컴플라이언스 선: 🔴 자동화(사전 워크플로우/프롬프트체인) 제거 · 🟢 일반 참고/방법/도구 유지(출처 명시).

## 0. 끝났을 때의 모습 (end-state)
```
CLAUDE.md            ← 가벼운 색인 (엔진 아님: "체크리스트+참고 라이브러리, 결과는 당일 제작")
PROCESS-CHECKLIST.md ← 척추 (주제·파일기계 0인 일반 13단계 방법)
reference/           ← 정리된 참고 라이브러리 (6묶음, 사람이 읽는 포인터)
web/                 ← 빈 스캐폴드(KRDS) — 정체성 자리표시, 주제데이터 제거
presentation/        ← Slidev 도구(+규칙) — 선택적 사용
data/                ← 공개데이터 인덱스(유지 시)
[삭제] workflow/ 엔진 전체 · 엔진가이드 · superpowers · 주제데이터/헬퍼 · WORK2
```

## 1. 5개 초점별 처리 방침

### (A) 워크플로우 자체 → "엔진 삭제, 체크리스트로 대체"
- **삭제**: `workflow/stages.yaml`, `workflow/stages/*.md`(13), `workflow/gates/*.mjs`, `workflow/scripts/*.mjs`, `workflow/lib.mjs`, `workflow/state.yaml`, `workflow/contracts/*.schema.json`, `workflow/templates/*`(아래 일부는 내용만 흡수).
- **대체**: `PROCESS-CHECKLIST.md`(이미 초안 있음)를 척추로. 13단계 *방법*은 여기 한 장에만.
- **CLAUDE.md**: 엔진 라우터 → **가벼운 색인**으로 재작성("자동 엔진 아님. 체크리스트 보고 손으로. 참고는 reference/").

### (B) 기획단계 (브레인스토밍 · 서브에이전트 병렬탐색) → "방법 지식으로 보존"
- **유지(지식)**: `AI_Hackathon_OS`의 문제정의·Insight·JTBD·**02 레드팀**·발표내러티브 → `reference/01-기획-인사이트.md`로 슬림화.
- **병렬탐색 = 기법으로 흡수**: `workflow/templates/agent-task.yaml` + `01-parallel-research.md`의 *방법*(어떻게 LLM에 병렬 리서치를 시키나, 보고서 1개씩, 메인이 통합)을 → `reference/02-기획-병렬리서치-방법.md` 짧은 포인터로. (계약 스키마·자동 스폰은 버림)
- 주의: "Stage 0X / npm run / handoff" 결합표현 제거, 턴키 프롬프트화 금지(사람용 포인터로).

### (C) 레이아웃 디자인 (KRDS · 웹 뼈대) → "빈 스캐폴드 + 사용법"
- **유지**: `web/` 스캐폴드(빈 보일러플레이트=허용), KRDS 연동, 범용 컴포넌트.
- **정리**: `kit-assets.md` + `mobile-design-checklist.md` → `reference/03-웹스캐폴드-KRDS.md`로 통합(스캐폴드/KRDS 사용법·함정·모바일 체크).
- **[결정 Q2] 폼·지도 컴포넌트 삭제**: `UserInfoForm`·`MapPanel`·`KakaoMap` + 연결된 주제 헬퍼(`shelters.ts` 거리계산 등) 제거(당일 말로 추가하면 금방). 나머지 스캐폴드(Header/Footer/layout/page/lib 일반)는 유지.
- **자동화 결합 제거**: `npm run check-identity` 게이트·배너 자동생성 의존은 "선택 도구"로 강등(없어도 됨).

### (D) 발표자료 (Slidev) → "도구 + 규칙은 유지, 단계 배선만 제거"
- **유지**: Slidev는 공개 도구라 사용 OK. `CLAUDE_Notion_Slidev_Integration_Guide` + `presentation-authoring`(AI초안+사람덮어쓰기) + `tone-guide` → `reference/04-발표-Slidev.md`로 통합.
- **[결정 Q1] 생성기 유지**: `presentation/generator`(deck.json→렌더) + `presentation:*` 스크립트는 **도구로 남긴다**(편의). 단 문서에서 "Stage 09/10·게이트" 결합표현은 제거하고 "선택적 도구"로 서술.

### (E) 배포방법 → "3종 통합 참고 + 개인 인프라 분리"
- **통합**: `deploy-runbook` + `android-apk-recipe` + `mobile-webview-target` → `reference/05-배포-모바일-APK.md` 1개(겹침 심함).
- **AI 연동**: `llm-key-input` + `voice-realtime-notes` → `reference/06-AI연동-키-음성.md`.
- **[결정 Q5] 개인 인프라값 문서로 유지**: `deployment-target.md`의 계정·IP·도메인은 분리하지 않고 **참고 문서(reference/05)에 그대로 둔다**(시크릿 아님, 본인 인프라).

## 2. 파일별 처리표 (요약)
| 현재 | 처리 |
|---|---|
| `workflow/` 전체(stages·gates·scripts·state·contracts) | 🗑 삭제 |
| `workflow/templates/agent-task·env-setup` | 방법만 reference로 흡수 후 삭제 |
| `workflow/decisions/*`(3) | 내용 reference로 흡수(배포/AI/발표), 인프라값은 개인메모로 |
| `docs/CLAUDE_Stage_Based_Workflow_Engine_Guide` | 🗑 삭제(엔진 전용) |
| `docs/AI_Hackathon_OS` | → reference/01 (슬림) |
| `docs/Slidev guide` + tone + presentation-authoring | → reference/04 |
| `docs/kit-assets` + `mobile-design-checklist` | → reference/03 |
| `docs/deploy-runbook` + `android-apk-recipe` + `mobile-webview-target` | → reference/05 |
| `docs/voice-realtime-notes` + `llm-key-input` | → reference/06 |
| `docs/welfare-benefit-dataset-prep` | 일반화("공개데이터 받는 법") 후 reference 또는 🗑 |
| `docs/banner-image-generation-design` | 🗑(또는 03에 한 줄) |
| `docs/superpowers/*` | 🗑 |
| `PROCESS-CHECKLIST.md` | 척추로 유지·보강 |
| `CLAUDE.md` | 가벼운 색인으로 재작성 |
| 주제 데이터/헬퍼, WORK2 | 🗑 (이미 합의) |

## 3. 자동화 "결합표현" 제거 규칙 (남기는 문서 전부에 적용)
- 제거: `npm run gate:*` / `workflow:*`, "Stage 0X Gate", `state.yaml`/`stages.yaml` 참조, handoff 자동생성, `guidance 섹션` 지정.
- 변환: "게이트 통과" → "스스로 점검(체크리스트)", "단계 자동 진행" → "다음 단계로 넘어감(사람 판단)".
- 금지: 단계별 "이 프롬프트 넣으면 결과" 식 턴키 시퀀스 → "사람이 읽는 포인터"로.

## 4. 작업 순서 (확인 후)
1. `reference/` 폴더 + 6개 통합 문서 생성(내용 합치며 결합표현 제거·주제중립화).
2. `PROCESS-CHECKLIST.md` 보강(척추 확정).
3. `CLAUDE.md` 가벼운 색인으로 재작성.
4. `workflow/` 엔진 · 엔진가이드 · superpowers · 주제데이터/헬퍼 삭제.
5. web/ 정체성 자리표시 확인 + 주제 컴포넌트 제거.
6. (D 결정에 따라) presentation 도구 유지/슬림.
7. 개인 인프라값 → `*.local.md`(gitignore) 분리.
8. 최종 검수: 자동화 잔재 0 · 주제 흔적 0 · 출처 목록 정리.

## 5. 확인된 결정
- **Q1 ✅ 생성기 유지**(도구로, 단계배선만 제거)
- **Q2 ✅ 폼·지도 컴포넌트 삭제**(나머지 스캐폴드 유지)
- **Q3 ✅ data/ 공개데이터 레포 유지**(출처 명시)
- **Q5 ✅ 개인 인프라값 문서로 유지**(분리 안 함)
- **Q4 ✅ 새 `reference/` 폴더에 통합**
