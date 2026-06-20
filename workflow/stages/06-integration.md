# Stage 06 — Integration (통합)

## 1. 목적
병렬 결과를 하나의 앱으로 통합하고, 데모 핵심경로를 끝까지 연결한다. spec과 구현 차이를 기록하고, 각 기능 상태를 `implementation/manifest.json`에 구조화한다.

## 2. 시작 조건
- Stage 05 Gate 통과(빌드 OK), 병렬 산출물 존재.

## 3. 이번 단계에서 반드시 읽을 파일
- `spec.md`, `demo/demo.scenario.yaml`, `plan.md`, Stage 05 각 에이전트 보고(history/stage-05).
- guidance: 없음.

## 4. 이번 단계에서 읽지 않아도 되는 파일
- 리서치 원문, 발표 docs, 무관한 구현 세부.

## 5. 필수 입력
- Stage 05 산출물(`web/`, fixture). 없으면 시작하지 않는다.

## 6. 메인 에이전트의 역할
- 병렬 결과를 병합하고 import/라우팅/데이터 흐름을 연결한다.
- fixture 모드로 데모 핵심경로를 처음부터 끝까지 한 번 통과시킨다.
- `npm run web:build` 통과 확인.
- spec과 실제 구현의 차이를 기록.
- `implementation/manifest.json`에 각 기능 상태를 기록: `implemented | mocked | fallback | dropped | blocked`.
- **룩 마감 점검**: 스캐폴드 정체성 교체 완료 + 주제 맞춤 상단 배너(`npm run generate-banner -- --topic "<주제>"`) 적용 여부 확인 — 데모 캡처(Stage 07) 전에 배너가 있어야 한다.
- **배포 + (선택) 앱화**: 통합 웹앱을 **배포(Vercel/Netlify 등 — https URL)** 한다 = 제출 기본. "앱처럼"이면 **PWA(매니페스트+아이콘, 홈 화면 추가)** 동작을 확인. **네이티브 APK(Capacitor)는 선택**이며 환경·시간 안 되면 스킵(배포 URL/PWA로 충분). 상세 `docs/mobile-webview-target.md`.
- 작동 상태가 되면 체크포인트 커밋.

## 7. 병렬 서브에이전트 구성
- 없음(통합은 메인 집약). 빌드 오류 분담이 크면 임시 fix 에이전트 1~2개.

## 8. 각 서브에이전트의 작업 계약
- (선택) fix-agent: `read`=[빌드 로그, 해당 파일], `write`=오류 난 자기 경로만, 완료: 빌드/타입 오류 해소.

## 9. 생성해야 하는 산출물
- 통합된 동작 앱(`web/`)
- `implementation/manifest.json` (기능별 상태 + 비고)

## 10. 파일 소유권
- 메인 전용: `implementation/manifest.json`, 통합·라우팅 코드, `spec.md` 차이 메모.

## 11. 제한 시간
- 20분. 초과 시 데모 핵심경로만 연결하고 나머지는 manifest에 `dropped`/`fallback`으로 표기.

## 12. 완료 조건
- 빌드 통과, fixture로 데모 핵심경로 완주, manifest.json에 모든 주요 기능 상태 기록.

## 13. 기계적 Gate (Mechanical)
- 명령: `npm run gate:integration`
- 분류: **checklist**. manifest.json 존재 + 상태값 유효성 + 빌드 산출 + 체크리스트 출력 → 자가점검.

## 14. LLM Review Gate
- `npm run cross-review -- implementation/manifest.json` (Codex 우선 → 클로드 폴백).
- 검토: manifest가 실제 구현과 일치하는가(과장된 implemented 없는가), 데모경로 단절 없는가.

## 15. 사용자 승인 여부
- `humanApproval: false`.

## 16. 실패 시 폴백
- 통합 충돌이 크면 데모 핵심경로 모듈만 살리고 나머지는 fixture/드롭. 빌드 안 되면 마지막 체크포인트 롤백.

## 17. 다음 단계에 전달할 정보
- `implementation/manifest.json` (Stage 07/08/09 필수 입력), 통합 앱.

## 18. 금지 사항
- 미구현 기능을 implemented로 표기 금지(발표 정직성의 근거가 됨).
- 데모와 무관한 통합에 시간 쓰기 금지.

## 19. 단계 완료 보고 형식
- `workflow/templates/stage-report.md` → `workflow/history/stage-06-integration.md`.
