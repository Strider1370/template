# Stage 07 — Demo Validation (데모 검증)

## 1. 목적
**사람이 데모를 직접 돌려 Wow Moment가 화면에 뜨는지 1차 확인**하고, **예비로 서브에이전트가** 시나리오를 완주하며 단계별 스크린샷을 남긴다(라이브 실패 백업). **메인은 그동안 Stage 08 준비를 겹쳐 진행**한다. 영상/GIF는 만들지 않는다 — 단계별 스크린샷이 백업이다.

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
1. **사람이 1차 확인.** 앱을 띄워 데모 핵심경로를 돌려보고 **Wow Moment가 화면에 뜨는지 사람이 눈으로 확인**한다(가장 빠르고 확실한 신호).
2. **겹치기.** Wow가 확인되면 메인은 **곧장 Stage 08(스크립트) 입력 준비를 시작**한다(서브에이전트 검증을 기다리지 않는다).
3. **예비 검증 = 서브에이전트.** 동시에 데모 검증 서브에이전트를 띄워 `demo.scenario.yaml`대로 핵심경로를 **2회 완주**(재현성)시키고 **단계별 스크린샷 + Wow 캡처 + 짧은 검증 리포트**를 남긴다.
4. **문제 발견 시 반영.** 서브에이전트가 깨짐/불일치를 보고하면 메인이 받아 수정하고, 필요하면 Stage 08 입력을 조정한다.
> 영상/GIF는 만들지 않는다 — 단계별 스크린샷이 라이브 실패 시 백업이다.

## 7. 병렬 서브에이전트 구성
- **데모 검증 에이전트 1개**(예비 검증·캡처 담당). 메인은 이 에이전트가 도는 동안 **Stage 08 준비를 병렬로** 한다. 실패 디버그가 크면 fix-agent 추가.

## 8. 각 서브에이전트의 작업 계약
- demo-validation-agent: `read`=[`demo/demo.scenario.yaml`, 앱 실행법, `implementation/manifest.json`], `write`=`demo/`(스크린샷·리포트)만, `doNotWrite`=앱 소스·spec/plan. 완료: 핵심경로 **2회 완주**, 단계별 스크린샷 + **Wow 캡처**, `demo/validation-report.md`(완주 여부·Wow 확인·발견 문제).
- (선택) fix-agent: `read`=[실패 로그, 해당 화면 코드], `write`=해당 경로만, 완료: 실패 스텝 재현 가능.

## 9. 생성해야 하는 산출물
- `demo/` 하위: **단계별 스크린샷 + Wow 캡처**(라이브 실패 백업), `demo/validation-report.md`(완주·Wow·발견 문제). **영상/GIF는 만들지 않는다.**

## 10. 파일 소유권
- 메인 전용: `demo/` 검증 산출물.

## 11. 제한 시간
- 15분(메인은 병렬로 Stage 08을 준비하므로 벽시계는 더 짧다). 초과 시 Wow Moment 1개만이라도 2회 완주 + 단계별 스크린샷 확보(생략 X, 범위 축소).

## 12. 완료 조건
- 사람이 Wow 확인 + 서브에이전트가 핵심경로 2회 완주 + 단계별 스크린샷(Wow 포함) + `demo/validation-report.md` 존재. (영상 불필요.)

## 13. 기계적 Gate (Mechanical)
- 명령: `npm run gate:demo`
- 분류: **enforced**. `demo/demo.scenario.yaml` + 단계별 스크린샷 파일 존재를 실제 검사. (완주·Wow는 사람 1차 확인 + 서브에이전트 리포트로 보강.)

## 14. LLM Review Gate
- `npm run cross-review -- demo/`(검증 리포트 요지) (Codex 우선 → 클로드 폴백).
- 검토: 검증이 spec의 Wow Moment를 실제로 증명하는가, 실패가 숨겨지지 않았는가.

## 15. 사용자 승인 여부
- `humanApproval: false`.

## 16. 실패 시 폴백
- 라이브가 불안정하면 **단계별 스크린샷을 발표 백업**으로 확정(넘기며 설명). 특정 스텝 실패 시 그 스텝을 fixture로 고정하거나 데모 범위를 축소.
- **모바일 산출물이면** 폰 미러링(scrcpy)·폰프레임 또는 설치한 APK로 시연한다. 미러링/실기가 불안정하면 위와 동일하게 단계별 스크린샷으로 백업. 상세 `docs/mobile-webview-target.md`.

## 17. 다음 단계에 전달할 정보
- 단계별 스크린샷·Wow 캡처, 검증 결과(어떤 기능이 실제로 보였는가) (Stage 08 스크립트·Stage 09 캡처 입력).

## 18. 금지 사항
- 1회만 돌고 통과 처리 금지(2회 연속 필요).
- 실패를 성공으로 기록 금지.
- 미구현 동작을 데모에 포함 금지.

## 19. 단계 완료 보고 형식
- `workflow/templates/stage-report.md` → `workflow/history/stage-07-demo-validation.md`.
