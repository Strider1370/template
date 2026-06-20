# 모바일 WebView 앱 (Android) — 방법·준비물·함정

> 산출물 형태(고정): **기본 웹앱(모바일 반응형 필수) → WebView 안드로이드 APK(Capacitor, 네이티브 위치·알림)**.
> ⚠️ **APK는 환경·시간·검증 리스크가 크다. 안 되면 폰 미러링/폰프레임 데모로 폴백** — APK 실패가 데모를 죽이지 않게.
> 단계 매핑: 반응형+위치/알림 = **Stage 05(구현)** · APK 패키징 = **Stage 06(통합)** · 시연 = **Stage 07(데모)**.

## 0. 웹에서 챙길 3가지 (이게 핵심)
1. **모바일 반응형** — 필수. 폰 폭(≈390px) 우선, Tailwind/KRDS. (이것만 잘하면 WebView는 거의 공짜)
2. **위치** — `navigator.geolocation` 또는 Capacitor `@capacitor/geolocation`. `MapPanel`/`KakaoMap`이 `userLocation`을 받음.
3. **알림** — 데모는 인앱 배너로 충분. 진짜 네이티브는 `@capacitor/local-notifications`(쉬움) / push(FCM, 어려움 — 데모엔 비추).

## 1. 시간 현실 (AI가 작업 가정)
- Capacitor 설정·플러그인·매니페스트(코드): **15~30분**.
- 안드로이드 빌드 환경(SDK·JDK·gradle) + 첫 빌드: **30분~2시간+**, 오류 잦음.
- **AI는 기기 화면을 직접 못 봄** → "실제로 위치·알림이 뜨나" 검증이 약함(사람/에뮬레이터 스크린샷 필요).
- → **4시간 대회에선 보통 APK를 끝까지 안 만들고 미러링으로 시연.** APK는 시간 여유 있을 때.

## 2. APK 만들기 (Capacitor) — 체크리스트
전제: Android SDK + JDK 설치(Android Studio가 가장 쉬운 설치 경로, GUI는 안 써도 됨).
```bash
cd web
npm i @capacitor/core @capacitor/cli
npx cap init "<앱이름>" "com.example.app" --web-dir=out   # 또는 server.url 방식(아래)
npm i @capacitor/geolocation @capacitor/local-notifications
npx cap add android
npx cap sync
cd android && ./gradlew assembleDebug   # → app/build/outputs/apk/debug/app-debug.apk
# 설치: adb install -r app-debug.apk
```
**웹 빌드 방식 2택:**
- **A. server.url(라이브 로드)** — `capacitor.config`에 `server: { url: 'http://<PC LAN IP>:3000', cleartext: true }`. dev 서버를 그대로 봄 → **API route(`/api/llm`) 작동**, 정적 export 불필요. 같은 Wi-Fi 필요. (데모에 가장 간단)
- **B. 정적 export 번들** — `next.config`에 `output: 'export'`, `npx cap copy`. **API route 안 됨**(서버 없음) → LLM 등은 외부/클라이언트로. 오프라인 가능.

## 3. 권한 (AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>  <!-- Android 13+ -->
<!-- http(dev 서버) 로드 시 -->
<application android:usesCleartextTraffic="true" ...>
```
런타임 권한(위치·알림)은 앱에서 **버튼 트리거로 요청**(자동 팝업 차단됨).

## 4. 함정 (실측 기반)
- **http 차단**: 안드로이드/브라우저는 평문 http에서 위치·알림을 막는다. dev 서버(http) 쓰려면 `usesCleartextTraffic` + (브라우저 미러링이면) **https 터널**(`cloudflared`/`ngrok`). 네이티브 플러그인은 이 제약 없음.
- **localhost ≠ 폰**: 폰에선 PC의 **LAN IP(192.168.x.x)** 를 써야 함. 같은 Wi-Fi + 방화벽 포트 허용.
- **카카오맵 도메인**: 카카오 JS키는 도메인 등록 필요. 호스팅/터널 도메인을 카카오 콘솔에 등록해야 지도가 뜸(없으면 `KakaoMap`이 안내 패널로 폴백).
- **검증**: AI가 화면 못 봄 → 에뮬레이터 스크린샷이나 사람 확인으로 보강.

## 5. 데모 방법 (시연)
| 방법 | 진짜같음 | 준비 | 폰 |
|---|---|---|---|
| 폰프레임(CSS) + 인앱 알림 시뮬 | ★★ | 0 | ❌ |
| 에뮬레이터(가상폰, GPS 좌표 주입) | ★★★★ | SDK+AVD | ❌ |
| scrcpy 미러링(실폰) | ★★★★★ | scrcpy+USB | ✅ |
- **추천**: 폰 있으면 scrcpy 미러링, 없으면 에뮬레이터(좌표 주입으로 위치 데모 안정). 둘 다 부담이면 폰프레임.
- **백업**: 미러링/실기 화면을 짧게 녹화/스크린샷해 두면 라이브 실패 시 대체.

## 6. 한 줄 결론
**웹을 모바일 반응형으로 잘 만들고 위치·알림을 웹/플러그인으로 붙이면 APK는 거의 공짜.** 단 빌드·검증 리스크 때문에 **데모는 미러링이 안전**, APK는 시간 여유 시.
