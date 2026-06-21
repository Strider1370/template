# 배포·산출물 전략 — "자체 AWS https + APK 기본, PWA 폴백" (사용자 결정 2026-06-21)

> ⚠️ 이 결정은 키트 기본값(PWA 우선·APK 보통 스킵, `CLAUDE.md` 고정제약 / `docs/mobile-webview-target.md`)을 **의도적으로 뒤집는다.**
> Stage 00(intake.yaml에 반영)·05(구현)·09(시연 매체)·12(패키지/배포)에서 이 문서를 기준으로 한다.

## 결정
- **배포**: Vercel/Netlify 아님. **사용자 보유 AWS 클라우드 서버에 https로 직접 배포.**
- **기본 산출물**: **네이티브 안드로이드 APK** (Capacitor WebView 래퍼, `server.url = 배포 https URL`).
- **폴백**: **PWA** — APK 세팅/빌드가 막힐 때만. (키트 PWA 자산 이미 존재: `web/app/manifest.ts`·아이콘)

## 왜 (배경)
사용자가 운영 중인 AWS 서버가 있어 자체 호스팅 선호. "진짜 앱처럼" 보이기 위해 APK를 기본으로.
→ https 배포가 전제되면 APK도 견고해진다(위치 secure context 자동·USB/터널 의존 제거 — 레시피 §6).

## AWS https 배포에 필요한 것 (Vercel과 다른 점)
> 이 앱은 `/api/*`가 있어 **정적 export 불가** → Node 런타임에서 `next start`가 돌아야 한다.
- [ ] **도메인 + DNS** A레코드 → 서버 공인 IP (Route53 또는 임의 DNS)
- [ ] **TLS 인증서** — nginx + Let's Encrypt(certbot) 또는 ALB+ACM. (APK·위치·카카오 모두 https 필수)
- [ ] **Node 런타임** + `next build && next start`(포트 3000), **PM2 등으로 상주화**
- [ ] **리버스 프록시**(nginx 443 → localhost:3000), 보안그룹 **443/80 오픈**
- [ ] **환경변수**(카카오 JS 키 등)를 서버에 설정 (코드 하드코딩 금지)
- [ ] **카카오 콘솔**: JS SDK 도메인에 **배포 origin(https://도메인)** 등록 (미등록 시 지도 401 — recipe 함정 H)
- [ ] 외부/공식 URL **실제 접속 확인**(죽은 링크 — recipe §9)

## APK 쪽 (https라서 단순해지는 부분)
- 빌드 환경: **JDK 21 + Android SDK cmdline-tools + Capacitor** (recipe §1~2)
- `capacitor.config.ts`: `server.url = https://도메인` — **`cleartext:true` 불필요**(https라서). 변경 후 **`npx cap sync android`**.
- 권한: INTERNET (+ 위치 쓰면 FINE/COARSE_LOCATION)
- **위치**: https secure context라 WebView에서 `navigator.geolocation` 그대로 작동 → **`@capacitor/geolocation` 플러그인 없어도 될 가능성** (확인 필요, recipe 함정 G)
- ⚠️ **빌드(`gradlew assembleDebug`)는 사용자 본인 터미널에서.** AI 샌드박스는 Gradle loopback 차단(recipe 함정 D). 설치·실행(`adb`)은 AI 가능.
- 시연: scrcpy 미러링 또는 (https라 USB 터널 불필요하니) 폰에서 바로 URL 접속도 가능.

## 알려진 리스크 (정직하게)
- APK 기본 = **사람이 Gradle 빌드해야 하는 하드 의존** + 4시간 제약에서 고위험(키트가 경고하는 지점). → **PWA 폴백을 안전망으로 유지**하는 이유.
- "웹을 그대로 감싸면 안 됨"(recipe §8) — 모바일 앱 UX 재설계 필요(데스크톱 크롬 제거 등).

## 확정된 인프라 (2026-06-21)
- 도메인: **`projectamo.co.kr`** (가비아) → A레코드 @·www → 고정 IP **`3.34.113.37`**
- AWS 계정 632752099407 / 서울 / EC2 `i-02e07f23649fd05fe`(ejy, t3.small) / SG `sg-0144bd538dfba7047`
- 상세 절차 → `docs/deploy-runbook.md`

## 배포 시점에 확정할 미정 항목 (Stage 12 직전)
- AWS 인스턴스 OS(Ubuntu/AL2?), 인증서 발급 방식은 certbot(nginx)로 가정.
- appId(`kr.example.app` → 실제값), 앱이름.
