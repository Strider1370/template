# Stage 07 — Demo Validation (데모 검증)

## 1. 목적
Playwright로 데모 시나리오를 2회 연속 완주하고 Wow Moment assertion을 통과시킨다. 스크린샷·영상/GIF·실패로그를 남겨 라이브 실패에 대비한다.

## 2. 시작 조건
- Stage 06 Gate 통과, 통합 앱 + `implementation/manifest.json` 존재.

## 3. 이번 단계에서 반드시 읽을 파일
- `demo/demo.scenario.yaml`, `spec.md` §9(Wow Moment), `implementation/manifest.json`
- guidance: 없음.

## 4. 이번 단계에서 읽지 않아도 되는 파일
- 리서치 원문, 발표 docs, 무관한 구현 세부.

## 5. 필수 입력
- 실행되는 앱 + `demo.scenario.yaml`. 없으면 시작하지 않는다.

## 6. 메인 에이전트의 역할
- 앱을 띄우고 Playwright로 demo.scenario.yaml의 스텝/selector/assertion을 실행.
- **데모를 2회 연속 완주**시킨다(재현성 확인).
- Wow Moment assertion 통과 확인, 스크린샷 저장, 데모 영상/GIF 캡처.
- 실패 시 로그를 구체적으로 기록하고 폴백(fixture 강제/단계 축소)을 적용.

## 7. 병렬 서브에이전트 구성
- 없음(검증 집약). 실패 디버그가 크면 fix-agent 1개.

## 8. 각 서브에이전트의 작업 계약
- (선택) fix-agent: `read`=[실패 로그, 해당 화면 코드], `write`=해당 경로만, 완료: 실패 스텝 재현 가능.

## 9. 생성해야 하는 산출물
- `demo/` 하위: 스크린샷, 데모 영상(`demo.webm`/`demo.mp4`), GIF(선택), Playwright 결과/로그.

## 10. 파일 소유권
- 메인 전용: `demo/` 검증 산출물.

## 11. 제한 시간
- 15분. 초과 시 Wow Moment 1개만이라도 2회 완주 + 영상 확보(생략 X, 범위 축소).

## 12. 완료 조건
- 데모 2회 연속 완주, Wow Moment assertion pass, 영상/GIF + 스크린샷 존재.

## 13. 기계적 Gate (Mechanical)
- 명령: `npm run gate:demo`
- 분류: **enforced**. Playwright 실행 결과(완주·assertion pass) + 영상/스크린샷 파일 존재를 실제 검사.

## 14. LLM Review Gate
- `npm run cross-review -- demo/`(검증 리포트 요지) (Codex 우선 → 클로드 폴백).
- 검토: 검증이 spec의 Wow Moment를 실제로 증명하는가, 실패가 숨겨지지 않았는가.

## 15. 사용자 승인 여부
- `humanApproval: false`.

## 16. 실패 시 폴백
- 라이브가 불안정하면 영상/GIF를 발표 백업으로 확정. 특정 스텝 실패 시 그 스텝을 fixture로 고정하거나 데모 범위를 축소.

## 17. 다음 단계에 전달할 정보
- 데모 영상/GIF·스크린샷, 검증 결과(어떤 기능이 실제로 보였는가) (Stage 08 스크립트·Stage 09 캡처 입력).

## 18. 금지 사항
- 1회만 돌고 통과 처리 금지(2회 연속 필요).
- 실패를 성공으로 기록 금지.
- 미구현 동작을 데모에 포함 금지.

## 19. 단계 완료 보고 형식
- `workflow/templates/stage-report.md` → `workflow/history/stage-07-demo-validation.md`.
