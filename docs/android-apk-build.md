# 안드로이드 APK 빌드 — 검증된 레시피 (실전 성공 기록)

> Next.js 웹앱(`web/`)을 Capacitor로 감싸 **실기기에서 도는 디버그 APK**까지 성공시킨 전체 절차.
> Android Studio(GUI) **없이** 명령줄만으로. 시행착오에서 건진 함정·해결을 함께 적는다.
> 전제: 이 앱은 `/api/*`(AI 엔진)가 있어 **정적 export 불가** → APK는 라이브 서버를 가리키는 WebView 래퍼다.
>
> ⚠️ 여전히 **선택 사항**이다. 대회 제출은 배포 URL+PWA가 기본(`docs/mobile-webview-target.md`). APK는 "네이티브 앱처럼" 꼭 보여야 할 때만.

---

## 0. 한눈에 — 성공한 구성
- **JDK 21** (Capacitor 7은 Java 21 컴파일 요구. JDK 17이면 빌드 막판에 `invalid source release: 21`로 실패).
- **Android SDK는 cmdline-tools만** (platform-tools + platforms;android-34 + build-tools;34.0.0). 에뮬레이터·Studio 불필요 → 수 GB가 아니라 ~300MB.
- **SDK는 공백 없는 경로**(`C:\Android\sdk`)에. (사용자 폴더에 공백 있으면 Gradle 깨짐)
- **server.url = `http://localhost:3000` + `adb reverse`** (USB 터널). 공인 IP/LAN 의존 없이 가장 견고.
- 빌드(`gradlew`)는 **사용자 본인 터미널**에서. (AI 샌드박스 터미널은 Gradle 루프백을 막음 — 아래 D)
- 설치·실행(`adb`)은 AI 터미널에서 OK (adb는 네이티브 바이너리).

---

## 1. 빌드 환경 설치 (1회)

### 1-1. JDK 21
```powershell
winget install --id Microsoft.OpenJDK.21 -e --accept-source-agreements --accept-package-agreements
# 설치 경로 예: C:\Program Files\Microsoft\jdk-21.0.x-hotspot
```

### 1-2. Android SDK (명령줄 도구만)
```powershell
# 1) cmdline-tools 내려받아 latest/ 구조로 배치
#    (zip은 cmdline-tools/ 로 풀리므로 latest/ 로 옮겨야 sdkmanager가 인식)
$sdk='C:\Android\sdk'
New-Item -ItemType Directory -Force "$sdk\cmdline-tools" | Out-Null
Invoke-WebRequest 'https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip' -OutFile "$env:TEMP\clt.zip"
Expand-Archive "$env:TEMP\clt.zip" "$sdk\cmdline-tools\_t" -Force
Move-Item "$sdk\cmdline-tools\_t\cmdline-tools" "$sdk\cmdline-tools\latest"

# 2) 라이선스: stdin 자동동의(echo y | ...)는 Windows/PowerShell에서 잘 깨짐.
#    → 라이선스 동의 파일을 직접 작성하는 편이 확실.
$lic="$sdk\licenses"; New-Item -ItemType Directory -Force $lic | Out-Null
"`n8933bad161af4178b1185d1a37fbf41ea5269c55`nd56f5187479451eabf01fb78af6dfcb131a6481e`n24333f8a63b6825ea9c5514f83c2829b004d1fee" |
  Set-Content -NoNewline -Encoding ascii "$lic\android-sdk-license"

# 3) 패키지 설치
$env:JAVA_HOME='C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot'
& "$sdk\cmdline-tools\latest\bin\sdkmanager.bat" --sdk_root="$sdk" "platform-tools" "platforms;android-34" "build-tools;34.0.0"
```

---

## 2. Capacitor 스캐폴드 (`web/`에서)
```powershell
cd web
npm install -D @capacitor/core @capacitor/cli @capacitor/android
npm install @capacitor/geolocation   # 위치 기능 쓸 때(아래 G). 안 쓰면 생략.
```

`web/capacitor.config.ts`:
```ts
import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'kr.firststep.app',
  appName: '첫걸음',
  webDir: 'capacitor-www',          // server.url 쓰므로 자리표시 폴더면 됨 (index.html 한 장)
  server: { url: 'http://localhost:3000', cleartext: true },
};
export default config;
```
`web/capacitor-www/index.html` 한 장(자리표시) 만들어 두고:
```powershell
npx cap add android
```

### 2-1. 네이티브 프로젝트 손보기
- `android/local.properties` — SDK 경로(공백 이스케이프):
  ```
  sdk.dir=C\:\\Android\\sdk
  ```
- `android/app/src/main/AndroidManifest.xml` — `<application ...>`에 `android:usesCleartextTraffic="true"` 추가(http 로드용), 권한 추가:
  ```xml
  <uses-permission android:name="android.permission.INTERNET" />
  <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
  <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
  ```

> **중요(함정 E):** `capacitor.config.ts`를 고친 뒤엔 반드시 **`npx cap sync android`**. 안 하면 `android/app/src/main/assets/capacitor.config.json`(번들된 설정)이 옛 server.url 그대로라 APK가 엉뚱한 주소를 가리킨다. 플러그인 추가 시에도 `cap sync` 필수.

---

## 3. 빌드 — **반드시 사용자 본인 터미널에서**
```powershell
$env:JAVA_HOME = 'C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot'
$env:ANDROID_HOME = 'C:\Android\sdk'
cd web\android
.\gradlew.bat assembleDebug
# → web\android\app\build\outputs\apk\debug\app-debug.apk
```
> **함정 D — Gradle `Unable to establish loopback connection`:** AI(Claude)의 명령 실행 샌드박스는 JDK NIO Selector가 쓰는 AF_UNIX 셀프파이프(JDK 16+)를 막아 Gradle이 못 돈다(`dangerouslyDisableSandbox`로도 안 풀림). **사람이 연 일반 PowerShell/터미널에서 빌드하면 정상.** 설치·실행용 `adb`는 네이티브라 AI 터미널에서도 OK.

---

## 4. 설치·실행 (adb — AI 터미널 가능)
```powershell
$adb='C:\Android\sdk\platform-tools\adb.exe'
# 폰: 개발자 옵션 → USB 디버깅 ON, 케이블 연결, "USB 디버깅 허용" 허용
& $adb devices                                   # device 로 잡히는지
npm run dev                                       # (web/) 별도로 dev 서버 localhost:3000
& $adb reverse tcp:3000 tcp:3000                  # 폰 localhost:3000 → PC 3000 (네트워크 무관)
& $adb install -r ...\app-debug.apk
& $adb shell pm grant kr.firststep.app android.permission.ACCESS_FINE_LOCATION
& $adb shell pm grant kr.firststep.app android.permission.ACCESS_COARSE_LOCATION
& $adb shell am start -n kr.firststep.app/.MainActivity
```
> USB 터널 방식은 **케이블 연결 + dev 서버 켜짐** 동안만 동작. 가장 견고하고 공인 IP 노출 없음.

---

## 5. 시행착오에서 건진 함정 (재발 방지)

| # | 증상 | 원인 | 해결 |
|---|------|------|------|
| A | `invalid source release: 21` (빌드 막판) | Capacitor 7 = Java 21인데 JDK 17 사용 | **JDK 21** 설치·사용 |
| B | Gradle이 경로에서 깨짐 | 사용자 폴더 공백(`Jond Doe`) | SDK를 **`C:\Android\sdk`**(공백 없는 곳)에 |
| C | sdkmanager 라이선스에서 멈춤 | `echo y \| --licenses` stdin 불안정 | **라이선스 해시 파일 직접 작성** |
| D | `Unable to establish loopback connection` | AI 샌드박스가 AF_UNIX(NIO Selector) 차단 | **사용자 본인 터미널에서 빌드** |
| E | APK가 옛 server.url을 가리킴 | 설정 바꾸고 `cap sync` 안 함 | 설정/플러그인 변경 후 **`npx cap sync android`** |
| F | LAN IP로 폰이 접속 못 함 | PC(공인IP·랜선)와 폰(모뎀 WiFi 사설망)이 **다른 망** | **`localhost` + `adb reverse`**(USB 터널) |
| G | 현재 위치 안 됨(권한 줘도) | `navigator.geolocation`은 **http(비보안 출처) 차단**(OS 권한 무관) | **`@capacitor/geolocation`** 네이티브 플러그인으로 우회(아래) / 또는 https 배포 |
| H | 카카오 "검색 결과 못 불러옴" | 페이지 origin이 카카오 **JS SDK 도메인 미등록** | 카카오 콘솔에 **실제 origin**(server.url) 등록 |
| I | 무엇이 진짜 origin인지 모를 때 | 번들 설정·터널 혼동 | `console.error(window.location.origin)` 한 줄로 확인 |
| J | 작은 수정마다 재빌드해 느림 | server.url 방식은 APK가 **dev 서버에서 JS를 실시간 로드** | **JS만 바뀌면 재빌드 불필요** — 앱 재실행만(아래 7-3) |

### G 상세 — 위치를 http에서 살리기 (네이티브 플러그인)
브라우저(WebView)는 https가 아니면 `navigator.geolocation`을 원천 차단한다. `@capacitor/geolocation`은 **WebView를 거치지 않고 네이티브 안드로이드 위치 API**를 호출해 좌표를 JS로 돌려주므로 http에서도 된다(OS 위치 권한만 필요). 웹/PWA는 기존 그대로 두고 **네이티브일 때만** 분기:
```ts
function useMyLocation() {
  setStatus('loading');
  const cap = (window as any).Capacitor;
  if (cap?.isNativePlatform?.()) {                       // 네이티브 APK
    import('@capacitor/geolocation')
      .then(({ Geolocation }) => Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 8000 }))
      .then((pos) => search({ coord: { lat: pos.coords.latitude, lng: pos.coords.longitude } }))
      .catch(() => setStatus('denied'));
    return;
  }
  // 웹/PWA: 기존 navigator.geolocation (https에서 동작)
  navigator.geolocation.getCurrentPosition(/* ... */);
}
```
변경 후 `npx cap sync android` → 재빌드 → 재설치.

### H 상세 — 카카오 JS SDK 도메인
카카오 개발자 콘솔 → 앱 → 플랫폼 키 → JavaScript 키 → **JS SDK 도메인**에, 앱이 실제로 띄우는 **origin을 그대로** 등록한다. server.url이 `http://localhost:3000`이면 그걸, 공인 IP면 그걸(`http://220.80.x.x:3000`), 배포면 `https://...vercel.app`. 외부 https(dapi.kakao.com) 호출 자체는 폰 네트워크로 잘 가고, 막히는 건 **referer(=origin) 미등록 → 401**이다.

---

## 6. 더 견고한 종착지 — https 배포
USB 터널은 시연엔 충분하나 케이블·dev서버에 묶인다. **Vercel https 배포 후 `server.url = https://...`** 로 바꾸면(→ `cap sync` → 재빌드):
- 위치(geolocation) **자동 해결**(secure context).
- 카카오는 배포 도메인만 JS SDK 도메인에 등록.
- USB·공인IP 의존 사라짐. 케이블 없이 WiFi로 동작.

즉 **위치까지 포함한 완성형은 결국 https 배포가 정답**이고, 위 USB 레시피는 배포 전 로컬 검증·시연용으로 가장 빠른 길이다.

---

## 7. 로컬 알림 + 앱 이벤트 연동 (실전 추가)

### 7-1. "푸시" 두 종류 — 테스트엔 로컬 알림
- **푸시(FCM)**: 서버가 원격으로 보냄 → Firebase 프로젝트 + 서버 필요. "결과 나오면 알림" 테스트엔 **과함**.
- **로컬 알림**: 앱이 기기에서 직접 띄움 → 서버 불필요. 앱 내 이벤트(분석 완료 등)에 딱 맞음. → **`@capacitor/local-notifications`**.

```powershell
cd web; npm install @capacitor/local-notifications
```
- `AndroidManifest.xml` 권한: `<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />` (Android 13+ 런타임 권한).
- `npx cap sync android` → **재빌드 1회**(네이티브 플러그인 추가라 필요) → 설치 후 `adb shell pm grant <appId> android.permission.POST_NOTIFICATIONS`.

### 7-2. 의미 있는 이벤트에 붙여라 (네이티브 전용 분기)
알림은 "검색 결과"가 아니라 **사용자가 기대하는 핵심 이벤트**(예: 메인 "분석하기" 결과)에 붙인다. 웹/PWA에선 no-op이 되도록 네이티브 분기:
```ts
// 분석 결과가 나온 직후 호출 (page.tsx 의 analyze() else 분기)
function notifyAnalysisDone(firstStep?: string) {
  const cap = (window as any).Capacitor;
  if (!cap?.isNativePlatform?.()) return;            // 네이티브 APK 에서만
  import('@capacitor/local-notifications').then(async ({ LocalNotifications }) => {
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== 'granted') return;
    await LocalNotifications.schedule({
      notifications: [{ id: Date.now() % 100000, title: '첫걸음 분석 완료', body: firstStep ? `지금, 첫 걸음: ${firstStep}` : '안내가 준비됐어요.' }],
    });
  }).catch(() => {});
}
```
> **자식 컴포넌트 동작을 자동 실행**하고 싶으면(예: 결과가 뜨면 '현재 위치 찾기' 자동), 그 컴포넌트가 결과와 함께 마운트되는 점을 이용해 마운트 `useEffect`에서 실행:
> ```ts
> useEffect(() => { useMyLocation(); /* 마운트 시 1회 자동 */ }, []); // eslint-disable-line
> ```

### 7-3. ★ JS만 바뀌면 재빌드 불필요 (가장 큰 시간 절약)
`server.url` 방식의 APK는 화면을 **dev 서버에서 실시간으로 로드**한다. 따라서:
- **JS/JSX/CSS만 수정** → `cap sync`·재빌드 **불필요**. dev 서버가 HMR로 반영 → **앱 재실행(`adb shell am force-stop` → `am start`)** 만 하면 새 코드가 뜬다.
- **재빌드가 필요한 경우만**: 네이티브 플러그인 추가/제거, `AndroidManifest`·`capacitor.config`·아이콘 등 **네이티브 측 변경**. 이땐 `npx cap sync android` → 본인 터미널 재빌드 → `adb install -r`.

| 무엇을 바꿨나 | 필요한 것 |
|---|---|
| React 컴포넌트/로직(JS) | 앱 재실행만 (`am force-stop`+`am start`) |
| 새 Capacitor 플러그인 | `cap sync` → 재빌드 → 재설치 |
| Manifest 권한·config·아이콘 | `cap sync` → 재빌드 → 재설치 |

---

## 8. ★ 웹앱을 APK로 감싸면 "레이아웃·UX"를 다시 설계해야 한다
**가장 자주 놓치는 부분.** 반응형 웹이 폰 폭에서 "안 깨진다"고 모바일 앱이 되는 게 아니다. 데스크톱 웹사이트의 흔적(상단 GNB·정부 Masthead·큰 히어로 배너)을 그대로 두면 "폰에 욱여넣은 웹사이트"로 보인다. 실제로 빌드 끝난 뒤 이 레이아웃 재설계에 시간이 꽤 들었다.

### 8-1. 웹사이트 크롬을 모바일에선 걷어내라 (반응형 분기)
- 정부 **Masthead 바·상단 GNB 탭** → 모바일 숨김(`hidden md:block`). 앱은 **컴팩트 헤더 1줄**(로고+서비스명)로 충분.
- **큰 히어로 배너** → 모바일에서 패딩·폰트 축소(`pb-5 pt-6 md:pb-16`, `text-heading-m md:text-display-m`). **핵심 입력이 첫 화면(fold)에 보이게.**
- 데스크톱 레이아웃은 `md:` 분기로 **그대로 보존** — 모바일만 앱 셸로.
- **하단 탭바는 목적지가 있을 때만.** 단일 행동 앱(입력→결과)엔 과함. "최근 내역" 같은 기능이 생기면 그때.

### 8-2. 한국어·터치·입력 디테일
- **제목 줄바꿈**: `break-keep`(word-break: keep-all) — 안 주면 "쉬운 첫 걸**음**"처럼 음절 중간에서 깨진다.
- **하단 고정(sticky) CTA는 양날의 검**: 엄지 접근성은 좋지만 **결과가 길어지면 스크롤 중 오탭** 위험 → 우리는 결과적으로 **인라인(사진 버튼 옆)으로 회귀**. 사안에 맞게 선택.
- **사진 입력**: 작은 "첨부됨" 배지보다 **입력창(textarea)을 사진 미리보기 블록으로 대체**하는 게 첨부 상태가 분명. (빼기 버튼 같이)
- 칩/버튼 라벨은 짧게(`예시: 지급명령서`→`지급명령서`) — 모바일 한 줄에 들어가게.

### 8-3. 모바일 화면 검증법 (WebView는 screencap이 안 됨)
- 폰 `adb shell screencap` 은 **WebView가 보안 서피스라 검은 화면**만 나온다.
- → **playwright 로 모바일 뷰포트(390px) 캡처**해서 fold(스크롤 0)·full 을 본다. 파일 첨부 상태도 `setInputFiles` 로 시뮬레이션해 검증 가능.
- 레이아웃·UX는 전부 JS라 **재빌드 불필요**(§7-3) — dev 서버 HMR + 앱 재실행으로 즉시.

---

## 9. 기기에서 실사용하면 "매칭 품질"이 드러난다 (제품 로직)
APK로 실제 입력을 넣어보면, 데모용 2~3 시나리오 밖에서 **AI가 결과를 엉뚱한 자원에 매칭**하는 게 보인다(예: 자동차세 사진 → 관청을 "보건소"로 분류). AI에 자유 분류를 맡기면 흔들리므로 **결정적 안전망**을 둔다.
- **대분류 라우팅**(`web/lib/domains.ts`): 입력+AI출력 텍스트를 키워드로 대분류에 매핑 → **지도 관청(officeCategory)·처리 URL(actionUrl)을 결정적으로 주입**. (사진은 text가 비므로 **AI 출력 요약까지 스캔**해야 잡힘)
- **사안별 위치 성격이 다르다**: 관할 고정+온라인 처리(자동차세·국세·지급명령)는 "**내 주변 최근접**"이 오히려 틀림(목포시청을 띄우는 식) → **지도 숨기고 온라인 처리 버튼**(위택스/홈택스/전자소송). 어디서나 방문형(전입·복지)만 최근접 지도.
- **농촌 거리**: 카카오 위치검색 반경 5km면 군 단위에서 0건 → **20km(카카오 최대) + 반경 제거 전국 최근접 폴백**.
- "처리하기" 공식 URL은 **실제 접속 확인**하고 넣어라(죽은 링크 주의: ecar.go.kr 死 → 정부24 대체).
