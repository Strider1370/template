<!-- Handoff 보고서 (자동 생성: npm run workflow:handoff). 기계가 채운 부분 + <!-- 직접 채우기 --> 2~3곳만 사람이 보강. -->
# Stage 04 완료 보고 — implementation-plan

## 단계
Stage 4 — implementation-plan

## 시작 시각 / 종료 시각 / 사용 시간
- 시작: 2026-06-20T12:13:07.105Z
- 종료: 2026-06-20T12:16:14.227Z
- 사용: 3.1분 (예산 10분)

## 완료한 내용
- spec를 작업 T1~T7로 분해(우선순위=spec §16), 기능별 폴백·재사용 자산 매핑.
- file-ownership.yaml(build/data 레인, 충돌 0). 실행모드=메인 단독 권장(단일 페이지 앱).
- Stage03 교차검토 숙제(출처 fixture 코퍼스·href 화이트리스트)를 T2 핵심작업으로 박음. 사용자 사전준비(키·출처원자료·카카오키) 안내.

## 생성·수정한 파일
- plan.md (작업분해·폴백·자산·사전준비·Agent계약)
- workflow/decisions/file-ownership.yaml

## 서브에이전트 실행 결과
- 메인 단독 작성. plan 교차검토는 클로드 리뷰어 폴백(codex 미작동)로 별도 수행.

## Gate 결과
- 명령: npm run gate:plan
- 결과: PASS (plan.md + file-ownership.yaml 존재, 폴백/소유권 충족)
- LLM Review: 클로드 리뷰어 폴백 → **PASS-with-warnings, 블로커 없음**. 권고 3건 반영: T2 대표키워드 최소매칭 보장(배지 확실 렌더), T4 비전(모델가드·maxTokens 800·타임아웃 30s), T7 우선순위(배포URL>반응형>PWA>배너).

## 사용자 결정
승인 불필요 (방향·범위·AI only는 02에서 확정)

## 적용한 폴백
- 교차검토: codex 미작동 → 클로드 리뷰어 폴백.

## 남아 있는 위험
- 사용자 사전준비 2개 필수: OPENAI_API_KEY(비전 모델) + 출처 fixture 원자료(지급명령·전입신고 공식 스니펫+URL). 막힌 환경이면 사람이 수집해야 함.
- AI only = 키/네트워크 라이브 실패 시 데모 정지(코드 폴백 없음). 검증 샘플 + 녹화 필수.
- 범위(T4~T6 스트레치)는 시간 압박 시 핵심 T1~T3 사수, 스트레치 후순위.

## 확정된 계약
- 실행모드 메인 단독, file-ownership build/data 레인. T2 출처는 fixture 화이트리스트에서만 인용(환각 차단).
- 재사용: web/ 스캐폴드·llm.ts(이미지 확장만)·regions.ts·KakaoMap. 새로 만들지 말 것.

## 다음 단계가 읽어야 할 파일
- plan.md, spec.md, demo/demo.scenario.yaml, concept.md, workflow/decisions/file-ownership.yaml, docs/kit-assets.md, web/lib/llm.ts, workflow/stages/05-parallel-build.md

## 다음 단계에서 하지 말아야 할 것
- 범위를 spec §15 밖으로 늘리지 말 것. 핵심 T1~T3 전에 스트레치부터 손대지 말 것.
- 출처 URL을 LLM이 지어내게 두지 말 것(fixture 화이트리스트만). 공통/계약 파일 수정 금지.

## 체크포인트
- HEAD: (git 없음)
