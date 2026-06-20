# 모바일 / 배포 / "앱처럼 보이기" — 방법

> 산출물 형태(고정): **기본 웹앱(모바일 반응형 필수) → 배포된 https URL이 제출 기본.** "앱처럼"은 **PWA(홈 화면에 추가)** 로 충족(네이티브 빌드 0).
> 대회 규정(§12): **외부 접속 URL 권장(필수 아님), 현장 시연·녹화도 인정.** 배포·도메인·SSL 비용은 **지원금 인정**.
> ⚠️ **네이티브 안드로이드 APK는 선택**이며 주는 노트북·4시간·기기검증(AI가 화면 못 봄) 제약상 보통 **스킵**한다.
> 단계 매핑: 반응형+위치/알림 = **Stage 05** · 배포/PWA(+선택 APK) = **Stage 06** · 시연 = **Stage 07**.

## 0. 웹에서 챙길 3가지
1. **모바일 반응형** — 필수. 폰 폭(≈390px) 우선, Tailwind/KRDS.
2. **위치** — `navigator.geolocation`(https/배포 URL에서 동작). `MapPanel`/`KakaoMap`이 `userLocation`을 받음.
3. **알림** — 데모는 인앱 배너로 충분. PWA면 웹 알림(Notification API)이 폰 알림 내림창에 뜸.

## 1. 배포 (제출 기본) ★
- **Vercel/Netlify** 에 배포 → **https URL** 나옴. 심사위원이 URL로 직접 사용(규정 권장 형태). API route(`/api/llm`)도 작동.
- 비용(배포·도메인·SSL)은 **지원금 인정 항목**. 도메인 붙이면 시연 완성도↑.
- 배포가 어려우면 **현장 로컬 실행 + 화면 시연**도 규정상 인정(작동만 하면 됨).

## 2. "앱처럼" = PWA (홈 화면에 추가) ★
- 웹앱에 **매니페스트(`app/manifest.ts`) + 아이콘(192·512 PNG)** 만 있으면, 폰 크롬에서 **"홈 화면에 추가"** → **앱 아이콘 · 전체화면(주소창 없음) · 스플래시**. 미러링/시연하면 **설치된 앱처럼** 보인다.
- **위치·알림은 https(배포 URL)에서 동작** — 배포만 하면 자동 충족.
- 템플릿은 PWA 매니페스트·아이콘을 **기본 포함**(`web/app/manifest.ts`, `web/public/icon-192.png`·`icon-512.png`). 주제에 맞게 이름/아이콘만 교체.

## 3. 위치·알림 (웹)
- 위치: `navigator.geolocation.getCurrentPosition` → `{lat,lng}` → `MapPanel`/`KakaoMap`. **secure context(https) 필요** — 배포 URL이면 OK, 로컬은 `localhost`만.
- 알림: 데모는 인앱 배너(직접 구현)로 안정적. 진짜 웹 알림은 `Notification.requestPermission()`(버튼 트리거).
- 카카오맵 JS키는 **도메인 등록** 필요 — 배포 도메인을 카카오 콘솔에 등록(없으면 `KakaoMap`이 안내 패널로 폴백).

## 4. (선택) 네이티브 APK — 보통 스킵
진짜 네이티브 앱이 꼭 필요할 때만. **고위험**: 빌드환경(JDK17 + Android SDK, 멀티GB) + 첫 빌드 + **AI가 기기화면 못 봐 검증 약함**. 주는 노트북·4시간엔 비현실적.
- 전제(미리 깔려있어야): JDK 17, Android SDK(Platform API 34·Build-Tools·Platform-Tools[adb]·cmdline-tools) + 라이선스 동의 + `ANDROID_HOME`. (Android Studio가 한 방 설치)
- Capacitor: `npm i @capacitor/core @capacitor/cli @capacitor/geolocation @capacitor/local-notifications` → `npx cap init` → `npx cap add android` → `cd android && ./gradlew assembleDebug`.
- 권한(AndroidManifest): `ACCESS_FINE_LOCATION`·`INTERNET`·`POST_NOTIFICATIONS`, dev 서버(http) 로드 시 `usesCleartextTraffic="true"`.
- 로드 방식: `server.url`(라이브 dev 서버) 또는 정적 export. server.url이면 API route 작동.

## 5. 데모/시연
| 방법 | 진짜같음 | 준비 | 비고 |
|---|---|---|---|
| **배포 URL을 폰/심사기기에서 열기** | ★★★ | 배포만 | 규정 권장 |
| **PWA(홈 화면 추가)** | ★★★★ | 매니페스트+아이콘 | 앱처럼, 빌드 0 ★ |
| 에뮬레이터/실폰 미러링(scrcpy) + 설치 APK | ★★★★★ | APK 빌드 | 선택, 고비용 |
- **백업**: 시연 화면(웹/PWA)을 짧게 녹화/스크린샷 — 라이브 실패 대비(규정상 녹화영상도 인정).

## 6. 한 줄 결론
**배포된 https 웹 URL + PWA(홈 화면 추가)** 가 규정·지원금·리스크 모두에서 정답. **앱처럼 보이는 건 PWA로, 네이티브 APK는 보통 안 만든다.**
