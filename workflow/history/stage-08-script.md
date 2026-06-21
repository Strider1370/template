<!-- Handoff 보고서 (자동 생성: npm run workflow:handoff). 기계가 채운 부분 + <!-- 직접 채우기 --> 2~3곳만 사람이 보강. -->
# Stage 08 완료 보고 — script

## 단계
Stage 8 — script

## 시작 시각 / 종료 시각 / 사용 시간
- 시작: 2026-06-20T15:07:37.043Z
- 종료: 2026-06-20T15:10:23.544Z
- 사용: 2.8분 (예산 10분)

## 완료한 내용
- presentation/script.md(5분): Answer First→문제→인사이트/킥→데모/Wow(130s≥50%)→메커니즘→임팩트/가드레일→Closing(concept 마지막 문장).
- presentation/qna.md: 차별점·AI필요성·환각책임·데이터운영·확장·사진/배포.
- manifest 정직성 반영: 사진비전·내주변 라이브는 단정 금지("방향"), dropped 미언급.

## 생성·수정한 파일
- presentation/script.md, presentation/qna.md (Stage08 산출물)
- (이전 단계 잔여) implementation/manifest.json, web/lib/*, web/next.config.mjs, demo/*

## 서브에이전트 실행 결과
- 메인 단독 작성. 스크립트 교차검토는 클로드 리뷰어 폴백.

## Gate 결과
- 명령: npm run gate:script → **PASS** (script.md + qna.md 존재, 자가점검 충족)
- LLM Review: 클로드 리뷰어 폴백 → **PASS, 블로커 없음**(6렌즈 통과: 정직성·데모50%·Closing 척추일치·문장규칙·제거질문 해소·Q&A 커버). 반영: 절대시각 마커 정리, 배포=blocked 발표자 노트 추가. 리뷰 리스크: deploy blocked는 Stage 12 전 해소 필요(제출 URL 기준 시).

## 사용자 결정
승인 불필요

## 적용한 폴백
- 교차검토: codex 미작동 → 클로드 리뷰어.
- 라이브 실패 대비: demo/run1~3 스크린샷으로 데모 백업(스크립트에 명시).

## 남아 있는 위험
- 라이브 데모는 LLM 출력 변동 가능 → 백업 스크린샷 전제. 사진·내주변 라이브 단정 금지(발표·Q&A 모두 정직 처리).

## 확정된 계약
<!-- 직접 채우기: 이후 단계가 바꾸면 안 되는 것(없으면 생략). -->

## 다음 단계가 읽어야 할 파일
<!-- 직접 채우기 또는 다음 단계 requiredReads 참조. -->
-

## 다음 단계에서 하지 말아야 할 것
<!-- 직접 채우기. -->
-

## 체크포인트
- HEAD: 314278a
