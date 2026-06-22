# 4-deploy — 배포·모바일·패키지 (단계 11~12)

**새로 넣을 무거운 폴더가 없다.** 배포는 모듈2의 `web/`(이미 루트에 복원돼 있음)를 그대로 쓴다.

## 이 단계에 하는 일
- AWS https 배포: 서버에 `next start` 상주 + nginx + certbot. (`/api/*`가 있어 정적 export 불가)
- APK: `web/`에 Capacitor 추가(`capacitor.config.ts`·`capacitor-www/`·`android/`) — **이 시점에 새로 생성**.
- 폴백: PWA(`web/app/manifest.ts` 이미 있음, 홈 화면 추가).
- 제출물: 출처·라이선스(`data/data-sources.md` · `presentation/sources/`).

## 지침
- `0-base/reference/05-배포-모바일-APK.md` — AWS 배포·APK 빌드·scrcpy 미러링 전 과정.
- `0-base/reference/06-AI연동.md` §B-7 — WebView 마이크 권한(음성 쓸 때).
- **AWS 자격증명 게이트**(`CLAUDE.md`): 첫 명령 전 `aws sts get-caller-identity` 확인. 실패 시 멈추고 사용자에게 `aws configure`만 요청. 시크릿은 AI가 받지 않는다.

## 전제
- 모듈2 번들이 이미 투입돼 `web/`가 루트에 있어야 한다.
- Capacitor 빌드는 서버 SSH 또는 사람 본인 터미널에서(로컬 AI 샌드박스는 gradlew loopback 차단).
