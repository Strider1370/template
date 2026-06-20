<!-- Handoff 보고서 (자동 생성: npm run workflow:handoff). 기계가 채운 부분 + <!-- 직접 채우기 --> 2~3곳만 사람이 보강. -->
# Stage 03 완료 보고 — spec

## 단계
Stage 3 — spec

## 시작 시각 / 종료 시각 / 사용 시간
- 시작: 2026-06-20T12:03:36.901Z
- 종료: 2026-06-20T12:08:13.915Z
- 사용: 4.6분 (예산 10분)

## 완료한 내용
- concept.md를 16헤딩 spec.md로 풀어씀(배신 없음). 데모 시나리오=지급명령+즉석입력.
- demo.scenario.yaml에 스텝별 화면·selector·assertion + Wow Moment 검증 계획 작성.
- "AI only + 출처 근거 유지" 원칙을 §5 AI Leverage·§13 Guardrail에 반영. 데모형태=모바일 PWA.

## 생성·수정한 파일
- spec.md (16헤딩, 확정)
- demo/demo.scenario.yaml (스텝/selector/assertion/Wow/폴백)

## 서브에이전트 실행 결과
- 메인 단독 작성. spec 교차검토는 클로드 리뷰어 폴백(codex 미작동)로 별도 수행.

## Gate 결과
- 명령: npm run gate:spec
- 결과: PASS (16헤딩 + demo.scenario.yaml 존재)
- LLM Review: 클로드 리뷰어 폴백 수행 → **PASS-with-warnings**. 치명 지적(출처 코퍼스 부재 = 환각 URL 위험) 반영: spec §11/§16에 "사전 수집 공식 출처 스니펫 fixture(URL)에서만 인용" 명문화, demo step3 assertion에 href 화이트리스트 검증 추가.
  - Stage 04 plan 필수 반영 3건: ①출처 fixture 코퍼스(지급명령·전입신고 5~15건, URL) 인덱싱을 핵심작업으로 견적 ②source-badge href는 화이트리스트에서만 ③출처-href 신뢰성 작업을 ③(즉석입력) 이전 핵심에 포함.

## 사용자 결정
승인 불필요 (방향·범위·AI only는 Stage 02에서 확정됨)

## 적용한 폴백
- 교차검토: codex 미작동 → 클로드 리뷰어 폴백.

## 남아 있는 위험
- 범위(2데모+사진비전+지도)는 여전히 넓음 — Stage 04 plan에서 우선순위 빌드·시간배분을 엄격히(③ 즉석입력까지가 핵심선).
- AI only = 라이브 키/네트워크 실패 시 데모 정지(의식적 베팅). 키 사전준비 + 검증 샘플 + 녹화 필수.
- 멀티모달 비전: web/lib/llm.ts(텍스트 전용) 확장 필요 — Stage 04에서 작업으로 명시.
- 관할=주소/사건 기준(거리 아님). 틀린 관할 1회 = 신뢰 메시지 붕괴.

## 확정된 계약
- spec.md 16헤딩 + concept.md = 구현/발표 기준선. Wow=즉석입력→[뜻·기한·첫걸음·관할·출처]+출처배지 한 화면.
- 범위 밖(spec §15): 신청 대행·전수 시연·알림·본인인증·최근접 관할 추천.

## 다음 단계가 읽어야 할 파일
- spec.md, demo/demo.scenario.yaml, concept.md, workflow/decisions/selected-direction.md, research/feasibility.md, docs/kit-assets.md, workflow/stages/04-implementation-plan.md

## 다음 단계에서 하지 말아야 할 것
- 구현 선행 금지(plan은 작업분해·소유권·폴백·시간배분만).
- 범위를 spec §15 밖으로 늘리지 말 것. concept/spec의 Wow를 무뎌뜨리지 말 것.

## 체크포인트
- HEAD: (git 없음)
