<!-- Handoff 보고서 (자동 생성: npm run workflow:handoff). 기계가 채운 부분 + <!-- 직접 채우기 --> 2~3곳만 사람이 보강. -->
# Stage 11 완료 보고 — rehearsal

## 단계
Stage 11 — rehearsal

## 시작 시각 / 종료 시각 / 사용 시간
- 시작: 2026-06-19T09:51:54.114Z
- 종료: 2026-06-19T10:05:11.548Z
- 사용: 13.3분 (예산 10분)  ⚠ 예산 초과

## 완료한 내용
- 리허설 점검: 발표 시간 5분(데모+킥 58%), 라이브↔스크린샷 백업 전환, Q&A 7문항 확인 → rehearsal-notes.md.
- 사용자가 직접 확인 요청 → 웹앱·Slidev·Notion HTML 3종 서빙. Slidev dev 검은화면/글자깨짐 디버그 후 정적 빌드+UTF-8 서버로 해결.
- 사용자 최종 승인 완료.

## 생성·수정한 파일
- presentation/rehearsal-notes.md, presentation/serve-static.mjs, presentation/slidev/dist/(빌드본), .claude/launch.json

## 서브에이전트 실행 결과
- 메인 단독. (예산 10분 → 13.3분 초과: Slidev dev 렌더 이슈 디버그·정적 빌드 전환 때문)

## Gate 결과
- 명령: npm run gate:rehearsal
- 결과: PASS (checklist) + 사용자 최종 승인(approved)
- 리포트: workflow/history/stage-11-gate.md

## 사용자 결정
승인 필요 — 상태: approved

## 적용한 폴백
<!-- 직접 채우기: 없으면 "없음". -->
-

## 남아 있는 위험
- 발표는 Slidev 빌드본(serve-static, 3030) 사용 권장. dev 서버는 이 환경 미리보기에서 마운트 불안정.

## 확정된 계약
- 사용자 최종 승인 완료 → 발표 확정. 발표 매체 = Slidev 빌드본(UTF-8 서버), 백업 = Notion 정적 HTML.

## 다음 단계가 읽어야 할 파일
- README.md, presentation/output/, demo/, implementation/manifest.json, workflow/stages/12-*.md

## 다음 단계에서 하지 말아야 할 것
- 승인된 발표 내용을 임의 변경 금지. (패키징은 정리·문서화 중심)

## 체크포인트
- HEAD: b6407f7
