<!-- Handoff 보고서. Stage 00 완료. -->
# Stage 00 완료 보고 — intake

## 단계
00 · intake (주제 접수)

## 시작 시각 / 종료 시각 / 사용 시간
- 시작: 2026-06-17T16:34:55Z
- 종료: 2026-06-17T16:40Z (근사)
- 사용: 약 5분 (예산 5분 내)

## 완료한 내용
- 주제 접수: **임산부·신생아 원스톱 지원** (임신 주차·출산예정일·거주지역 입력 → 시기별 정부 지원 순차 안내).
- 사용자 제약 확정: 데이터 전략 = **혼합**(고정 JSON 시연 + 핵심 1~2건 실 API), 시간 = **기본값**(구현 240분+버퍼 10, 발표 5분), 기술 = **키트 기본 스택**(별도 제약 없음).
- 키트 자산 점검: regions.ts·shelters.ts·KakaoMap.tsx·data/boundaries·KRDS·build-shelters.mjs 존재 확인, 주제 적합성 매핑. 민방위 대피소 데이터는 무관 → 명시적 배제.
- `intake.yaml` 작성 + 교차검토 반영(아래).

## 생성·수정한 파일
- `workflow/decisions/intake.yaml` (신규 — Stage 00 산출물)
- `workflow/state.yaml` (project.name/topic/startedAt 갱신)
- 루트 `node_modules/` (엔진 의존성 `js-yaml` 설치 — 워크플로우 스크립트 구동 위해 `npm install` 1회 실행)

## 서브에이전트 실행 결과
- **교차검토 리뷰어(클로드 폴백, Codex 미사용 환경)**: 종합 **조건부 PASS**. 필수 보강 1 + 권장 2 제시.
  - 반영 완료: (1) AI 레버리지 1줄 명시 — 자격 자연어 Q&A·개인화 요약·서류 안내 생성. (2) 정부 지원 제도 데이터셋 = 키트에 없음 → 신규 제작, Stage 01 1순위 산출물로 명시. (3) 실 API 후보 구체화 — 카카오 로컬 키워드 검색(가까운 보건소·육아종합지원센터·산후조리원), 폴백=고정 목록.

## Gate 결과
- 명령: `npm run gate:intake` → **PASS** (checklist 게이트: intake.yaml 존재 + 4개 자가점검 항목 확인).
- LLM Review: `npm run cross-review -- workflow/decisions/intake.yaml` → Codex 미사용 환경, 클로드 리뷰어 폴백으로 수행 → 조건부 PASS, 지적사항 반영 완료.

## 사용자 결정
- humanApproval 단계 아님(false). 단, intake 제약은 AskUserQuestion으로 사용자가 직접 선택: 혼합 데이터 전략 / 기본 시간 / 키트 기본 스택.

## 적용한 폴백
- 교차검토: Codex 자동 불가 → 클로드 리뷰어 서브에이전트 폴백(예정된 폴백).

## 남아 있는 위험
- **핵심 콘텐츠 데이터(지원 제도 목록)가 기존 자산에 없음** → Stage 01 리서치에서 조사·검증·제작 필요. 시연 콘텐츠 확보 시점이 곧 크리티컬 패스.
- 실 API(카카오 로컬)는 키 미설정/도메인 미등록 시 폴백 필요 — Stage 01/05에서 확인.
- data.go.kr·safetydata.go.kr 403 차단 → 새 공공데이터는 사람이 직접 다운로드해야 함.
- AI 레버리지가 아직 "후보" 수준 → Stage 02 인사이트/Stage 03 스펙에서 차별점으로 확정 필요(안 하면 규칙 엔진에 그칠 위험).

## 확정된 계약
- 주제·범위·시간 예산·데이터 전략(혼합)·스택(키트 기본)은 `intake.yaml` 기준으로 고정. 이후 단계가 임의 변경 금지.

## 다음 단계가 읽어야 할 파일
- `workflow/decisions/intake.yaml` (Stage 01 리서치 입력)
- `workflow/stages/01-parallel-research.md`
- guidance: `docs/AI_Hackathon_Operating_System.md` §"4. Stage 01", §"8. Stage 01 Review"

## 다음 단계에서 하지 말아야 할 것
- 스펙/인사이트를 미리 확정하지 마라(Stage 01은 리서치만).
- 403 차단 사이트를 자동 크롤링하려 시도하지 마라.
- intake에서 고정한 범위·시간·스택을 임의로 늘리지 마라.
