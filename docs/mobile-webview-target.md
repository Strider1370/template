# 모바일 / 배포 / "앱처럼 보이기" — 방법

> 산출물 형태(사용자 결정 — `workflow/decisions/deployment-target.md`): **자체 AWS 서버 https 배포 + 네이티브 APK가 기본.** PWA는 APK가 안 될 때의 폴백.
> 배포·시연 **전체 절차·명령 = `docs/deploy-runbook.md`(C절 대회 당일).** APK 빌드 함정·재빌드 규칙 = `docs/android-apk-recipe.md`.
> 단계 매핑: 반응형+위치/알림 = **Stage 05** · 배포 = **Stage 06/12** · APK·미러링 시연 = **Stage 07**.

## 0. 웹에서 챙길 3가지
1. **모바일 반응형** — 필수. 폰 폭(≈390px) 우선, Tailwind/KRDS. (앱답게 만드는 체크리스트 → `docs/mobile-design-checklist.md`)
2. **위치** — `navigator.geolocation`(https에서 동작). `MapPanel`/`KakaoMap`이 `userLocation`을 받음.
3. **알림** — 데모는 인앱 배너 + (APK면) `@capacitor/local-notifications`로 폰 알림창에 띄움.

> ⚠️ **반응형 ≠ 앱.** 폰 폭에서 "안 깨진다"고 앱처럼 보이는 게 아니다. 데스크톱 크롬(정부 Masthead·상단 GNB·큰 히어로)을 **모바일에선 `md:` 분기로 걷어내고** 컴팩트 헤더 + 핵심 입력을 첫 화면(fold)에. 한국어 제목엔 `break-keep`. (상세 `docs/android-apk-recipe.md §8`.)

## 1. 배포 (제출 기본) ★ — 자체 AWS https
- **자체 AWS 서버에 https로 직접 배포** → `https://projectamo.co.kr`. Next `/api/*` 때문에 정적 export 불가 → `next start` 상주(PM2) + nginx + certbot.
- **전체 절차·명령은 `docs/deploy-runbook.md`** (A 세팅 / B 서버접속 / C 대회당일). 고정 IP·도메인·서버 빌드환경 이미 구성됨.
- 비용(도메인·SSL)은 **지원금 인정 항목**. (Vercel/Netlify 같은 외부 호스팅은 쓰지 않는다 — 자체 서버 운영.)

## 2. 시연 기본 = APK + 미러링 ★
- 통합 앱을 **서버에서 빌드한 APK**(WebView 래퍼, `server.url=https://projectamo.co.kr`)로 폰에 설치 → **USB+scrcpy 미러링**으로 시연. 폰은 인터넷만 있으면 됨(케이블은 미러링용).
- **위치·알림·카메라**를 실기기에서 그대로 시연 가능(https라 secure context).
- 절차: `docs/deploy-runbook.md` C2(서버 빌드)·C3(USB 설치+미러링)·C4(무선 폴백).

## 3. 폴백 = PWA (홈 화면에 추가)
- APK가 막힐 때만. 웹앱에 **매니페스트(`app/manifest.ts`) + 아이콘(192·512)** 이 이미 있어 폰 크롬에서 **"홈 화면에 추가"** → 앱 아이콘·전체화면. 위치·알림은 https라 동작.
- 템플릿은 PWA 매니페스트·아이콘을 **기본 포함**. 이름/아이콘만 교체.

## 4. 위치·알림 (웹/네이티브)
- 위치: `navigator.geolocation.getCurrentPosition` → `{lat,lng}` → `MapPanel`/`KakaoMap`. **https 필요**(배포 URL이면 OK). APK도 https라 그대로 동작.
- 알림: 데모는 인앱 배너로 안정적. APK면 `@capacitor/local-notifications`(핵심 이벤트에). 웹은 `Notification.requestPermission()`.
- 카카오맵 JS키는 **배포 도메인 등록** 필요(카카오 콘솔). 없으면 `KakaoMap`이 안내 패널로 폴백.

## 5. 데모/시연 우선순위
| 방법 | 진짜같음 | 준비 | 비고 |
|---|---|---|---|
| **APK + scrcpy 미러링** | ★★★★★ | 서버 빌드 + 폰 | **기본** (위치·카메라·푸시 실기기 시연) |
| 무선(페어링) 미러링 | ★★★★ | adb pair | USB 안 될 때 폴백 |
| PWA(홈 화면 추가) | ★★★★ | 매니페스트(기본 포함) | APK 막힐 때 폴백 |
- **백업**: 시연 화면을 단계별 스크린샷(`demo/`)으로 — 라이브 실패 대비(규정상 녹화/스크린샷도 인정).

## 6. 한 줄 결론
**자체 AWS https 배포 + 네이티브 APK(미러링 시연)** 가 기본. 막히면 무선 미러링 → PWA 순으로 폴백. **Vercel 등 외부 호스팅은 쓰지 않는다.**
