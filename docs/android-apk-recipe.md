# 안드로이드 APK 빌드 — 검증된 레시피 (실전 성공 기록)

> Next.js 웹앱(`web/`)을 Capacitor로 감싸 **실기기에서 도는 디버그 APK**까지 성공시킨 전체 절차. Android Studio(GUI) **없이** 명령줄만으로.
> 전제: 이 앱은 `/api/*`가 있어 **정적 export 불가** → APK는 라이브 서버를 가리키는 WebView 래퍼다.
> ⚠️ **여전히 선택 사항.** 대회 제출은 배포 URL+PWA가 기본(`docs/mobile-webview-target.md`). APK는 "네이티브 앱처럼" 꼭 보여야 할 때만.

## 0. 성공한 구성 (한눈에)
- **JDK 21** (Capacitor 7 = Java 21. JDK 17이면 막판 `invalid source release: 21` 실패).
- **Android SDK는 cmdline-tools만**(platform-tools + `platforms;android-34` + `build-tools;34.0.0`). 에뮬레이터·Studio 불필요 → ~300MB.
- **SDK는 공백 없는 경로**(`C:\Android\sdk`). 사용자 폴더 공백이면 Gradle 깨짐.
- **server.url = `http://localhost:3000` + `adb reverse`**(USB 터널). 공인 IP/LAN 의존 없이 가장 견고.
- 빌드(`gradlew`)는 **사용자 본인 터미널**에서. (AI 샌드박스는 Gradle 루프백을 막음 — §D). 설치·실행(`adb`)은 AI 터미널도 OK.

## 1. 빌드 환경 설치 (1회)
**JDK 21**
```powershell
winget install --id Microsoft.OpenJDK.21 -e --accept-source-agreements --accept-package-agreements
```
**Android SDK (cmdline-tools만)**
```powershell
$sdk='C:\Android\sdk'
New-Item -ItemType Directory -Force "$sdk\cmdline-tools" | Out-Null
Invoke-WebRequest 'https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip' -OutFile "$env:TEMP\clt.zip"
Expand-Archive "$env:TEMP\clt.zip" "$sdk\cmdline-tools\_t" -Force
Move-Item "$sdk\cmdline-tools\_t\cmdline-tools" "$sdk\cmdline-tools\latest"
# 라이선스: stdin 자동동의가 Windows에서 잘 깨짐 → 해시 파일 직접 작성이 확실
$lic="$sdk\licenses"; New-Item -ItemType Directory -Force $lic | Out-Null
"`n8933bad161af4178b1185d1a37fbf41ea5269c55`nd56f5187479451eabf01fb78af6dfcb131a6481e`n24333f8a63b6825ea9c5514f83c2829b004d1fee" | Set-Content -NoNewline -Encoding ascii "$lic\android-sdk-license"
$env:JAVA_HOME='C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot'
& "$sdk\cmdline-tools\latest\bin\sdkmanager.bat" --sdk_root="$sdk" "platform-tools" "platforms;android-34" "build-tools;34.0.0"
```

## 2. Capacitor 스캐폴드 (`web/`에서)
```powershell
cd web
npm install -D @capacitor/core @capacitor/cli @capacitor/android
npm install @capacitor/geolocation   # 위치 쓸 때(§G). 안 쓰면 생략.
```
`web/capacitor.config.ts`:
```ts
import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'kr.example.app', appName: '<앱이름>',
  webDir: 'capacitor-www',               // server.url 쓰므로 자리표시 폴더(index.html 한 장)면 됨
  server: { url: 'http://localhost:3000', cleartext: true },
};
export default config;
```
`web/capacitor-www/index.html` 한 장 만들고 → `npx cap add android`.

**네이티브 손보기:**
- `android/local.properties`: `sdk.dir=C\:\\Android\\sdk`
- `android/app/src/main/AndroidManifest.xml`: `<application ... android:usesCleartextTraffic="true">` + 권한:
  ```xml
  <uses-permission android:name="android.permission.INTERNET" />
  <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
  <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
  ```
> **함정 E:** `capacitor.config.ts`나 플러그인을 바꾸면 **반드시 `npx cap sync android`**. 안 하면 번들된 `assets/capacitor.config.json`이 옛 server.url 그대로라 APK가 엉뚱한 주소를 가리킨다.

## 3. 빌드 — **반드시 사용자 본인 터미널에서**
```powershell
$env:JAVA_HOME = 'C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot'
$env:ANDROID_HOME = 'C:\Android\sdk'
cd web\android; .\gradlew.bat assembleDebug
# → web\android\app\build\outputs\apk\debug\app-debug.apk
```
> **함정 D — `Unable to establish loopback connection`:** AI(Claude)의 명령 샌드박스는 JDK NIO Selector의 AF_UNIX 셀프파이프(JDK 16+)를 막아 Gradle이 못 돈다(`dangerouslyDisableSandbox`로도 안 풀림). **사람이 연 일반 터미널에서 빌드.** `adb`는 네이티브라 AI 터미널 OK.

## 4. 설치·실행 (adb — AI 터미널 가능)
```powershell
$adb='C:\Android\sdk\platform-tools\adb.exe'
& $adb devices                          # 폰: 개발자옵션→USB 디버깅 ON, "허용"
# (web/) 별도로: npm run dev  → localhost:3000
& $adb reverse tcp:3000 tcp:3000        # 폰 localhost:3000 → PC 3000 (네트워크 무관)
& $adb install -r ...\app-debug.apk
& $adb shell pm grant <appId> android.permission.ACCESS_FINE_LOCATION
& $adb shell am start -n <appId>/.MainActivity
```
USB 터널은 **케이블 연결 + dev 서버 켜짐** 동안만. 가장 견고, 공인 IP 노출 없음.

## 5. 함정표 (재발 방지)
| # | 증상 | 원인 | 해결 |
|---|---|---|---|
| A | `invalid source release: 21` | Capacitor 7=Java 21인데 JDK 17 | **JDK 21** |
| B | Gradle 경로에서 깨짐 | 사용자 폴더 공백 | SDK를 **공백 없는 경로** |
| C | sdkmanager 라이선스 멈춤 | `echo y` stdin 불안정 | **라이선스 해시 파일 직접 작성** |
| D | `loopback connection` 실패 | AI 샌드박스가 AF_UNIX 차단 | **사용자 본인 터미널 빌드** |
| E | APK가 옛 server.url 가리킴 | `cap sync` 안 함 | 설정/플러그인 변경 후 **`cap sync`** |
| F | 폰이 LAN IP 접속 못 함 | PC와 폰이 다른 망 | **`localhost`+`adb reverse`** |
| G | 위치 안 됨(권한 줘도) | `navigator.geolocation`은 **http 차단** | **`@capacitor/geolocation`** 또는 https 배포 |
| H | 카카오 "결과 못 불러옴" | origin이 카카오 JS SDK 도메인 미등록 | 콘솔에 **실제 origin 등록** |
| I | 진짜 origin 모름 | 번들설정·터널 혼동 | `console.error(window.location.origin)` |
| J | 수정마다 재빌드 느림 | server.url=dev서버 실시간 로드 | **JS만 바뀌면 재빌드 불필요**(§7) |

**G 상세** — WebView는 https 아니면 `navigator.geolocation` 원천 차단. `@capacitor/geolocation`은 네이티브 위치 API를 직접 호출해 http에서도 됨. 웹/PWA는 그대로 두고 네이티브만 분기:
```ts
const cap = (window as any).Capacitor;
if (cap?.isNativePlatform?.()) {
  const { Geolocation } = await import('@capacitor/geolocation');
  const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 8000 });
  // pos.coords.latitude / longitude
} else {
  navigator.geolocation.getCurrentPosition(/* 웹/PWA: https에서 동작 */);
}
```
**H 상세** — 카카오 콘솔 → JS SDK 도메인에 앱이 실제 띄우는 **origin 그대로** 등록(localhost:3000 / 공인IP / vercel.app). 막히는 건 referer(origin) 미등록 → 401.

## 6. 더 견고한 종착지 — https 배포
USB 터널은 시연엔 충분하나 케이블·dev서버에 묶인다. **Vercel https 배포 후 `server.url='https://...'`**(→`cap sync`→재빌드):
- 위치 **자동 해결**(secure context), 카카오는 배포 도메인만 등록, USB·공인IP 의존 사라짐.
- **위치까지 포함한 완성형은 결국 https 배포가 정답.** USB 레시피는 배포 전 로컬 검증·시연용 최단 경로.

## 7. ★ 재빌드가 필요한 때 / 아닌 때 (시간 절약)
`server.url` APK는 화면을 **dev 서버에서 실시간 로드**한다.
| 바꾼 것 | 필요한 것 |
|---|---|
| React 컴포넌트/로직(JS/CSS) | **재빌드 X** — 앱 재실행만 (`adb shell am force-stop <id>` → `am start ...`) |
| 새 Capacitor 플러그인 | `cap sync` → 재빌드 → 재설치 |
| Manifest 권한·config·아이콘 | `cap sync` → 재빌드 → 재설치 |

**로컬 알림**(서버 불필요, 앱 내 이벤트용): `npm i @capacitor/local-notifications` + `POST_NOTIFICATIONS` 권한 + `cap sync`+재빌드 1회. "검색 결과"가 아니라 사용자가 기대하는 **핵심 이벤트**(분석 완료 등)에 붙이고, 웹/PWA에선 no-op이 되게 `isNativePlatform()` 분기.

## 8. ★ 웹앱을 APK로 감싸면 "레이아웃·UX"를 다시 설계해야 한다 (가장 자주 놓침)
반응형 웹이 폰 폭에서 "안 깨진다"고 모바일 앱이 되는 게 아니다. 데스크톱 흔적(상단 GNB·정부 Masthead·큰 히어로)을 그대로 두면 "폰에 욱여넣은 웹사이트"로 보인다.
- **웹 크롬을 모바일에선 걷어내라**: Masthead·GNB → `hidden md:block`. 앱은 컴팩트 헤더 1줄. 데스크톱은 `md:` 분기로 보존.
- **히어로**: 모바일 패딩·폰트 축소, **핵심 입력이 첫 화면(fold)에 보이게**.
- **하단 탭바는 목적지가 있을 때만**(단일 입력→결과 앱엔 과함).
- **한국어 줄바꿈**: 제목에 `break-keep`(word-break: keep-all) — 안 주면 음절 중간에서 깨진다.
- 사진 입력은 작은 "첨부됨" 배지보다 **입력창을 미리보기 블록으로 대체**가 명확. 칩 라벨은 짧게.

**검증법(§8.3):** 폰 `adb shell screencap`은 WebView가 보안 서피스라 **검은 화면**. → **playwright 모바일 뷰포트(390px)** 로 fold(스크롤 0)·full 캡처. 파일첨부는 `setInputFiles`로 시뮬. 레이아웃은 전부 JS라 재빌드 불필요(§7).

## 9. 기기 실사용에서 드러나는 "매칭 품질" (제품 원칙)
APK로 실제 입력을 넣으면 데모 밖 입력에서 **AI가 엉뚱하게 분류**하는 게 보인다. **AI 자유분류에 의존하지 말고 핵심 라우팅(관청·처리 URL)은 결정적 안전망**으로 둔다(키워드 대분류 매핑 등). 사안별 위치 성격도 다르다 — 관할 고정+온라인 처리(세금·전자소송)는 "최근접 지도"가 오히려 틀리니 **온라인 처리 버튼**, 방문형(전입·복지)만 최근접 지도. 공식 URL은 **실제 접속 확인**(죽은 링크 주의). (원칙 상세 → `docs/AI_Hackathon_Operating_System.md §1.2.1`, 위치 함정 → `docs/kit-assets.md`)

## 10. ★ 시연: 폰 화면 미러링 (scrcpy)
빔프로젝터에 **폰 앱이 실시간으로 움직이는 걸** 그대로 보여주는 표준 방법. AI가 기기화면을 못 봐도 **사람이 발표 때 직접** 쓴다.
- **scrcpy** = 안드로이드 화면을 USB로 노트북에 저지연 미러링(+노트북 마우스로 폰 조작). 무료·오픈소스·인터넷 불필요. 이미 깔린 adb를 그대로 쓴다.
```powershell
winget install --id Genymobile.scrcpy -e        # 1회 설치(~15MB)
# 시연 시(폰 USB 연결 상태):
$env:ADB = 'C:\Android\sdk\platform-tools\adb.exe'   # scrcpy가 우리 adb를 쓰게(서버 충돌 방지)
& $env:ADB reverse tcp:3000 tcp:3000                  # 앱이 PC dev 서버 접속(USB 터널)
scrcpy                                                # 폰 화면 미러 창 → 이 창을 빔으로
```
- **주의**: `--window-title` 등 옵션에 **한글/공백 인자**를 주면 `Start-Process`에서 쪼개져 실패한다 — 옵션 없이 띄우거나 공백 없는 값.
- 전제: `web` **dev 서버 실행 중** + USB 케이블 + `adb reverse`. (server.url=localhost라 케이블 끊기면 앱이 데이터 못 받음.)
- **시연 체크리스트**: 폰 화면 꺼짐 시간 늘리기·잠금 해제 유지 · scrcpy 창을 빔 출력에 배치 · 사진 찍어 올리기→분석→결과 카드→**상단바 내려 알림** 보여주기 · 라이브 흔들리면 캡처(`demo/`)로 전환.
- 무선(같은 와이파이)도 가능(`scrcpy --tcpip`)하나 **USB가 가장 안정적** — 발표엔 USB 권장.
