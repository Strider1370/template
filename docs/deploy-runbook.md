# 배포 런북 — 서버 https 배포 + APK(USB 미러링 기본 / 무선 폴백)

> 새 환경에서 처음부터 따라 하는 실전 절차. 결정 배경 → `workflow/decisions/deployment-target.md`.
> ✅ 2026-06-21 전 과정 검증 완료(서버 빌드 → apk → USB 설치 → scrcpy 미러링).
> ⚠️ 인프라 식별자(계정ID·IP)는 들어있으나 **액세스 키/시크릿은 절대 적지 않는다.**

## 0. 확정된 환경 값 (한눈에)
| 항목 | 값 |
|---|---|
| AWS 계정 / 리전 | `632752099407` / `ap-northeast-2`(서울) |
| IAM 사용자 | `Me` (**AdministratorAccess** — EIC 포함 전부 허용) |
| EC2 인스턴스 | `i-02e07f23649fd05fe` (Name `ejy`, t3.small, **Amazon Linux 2023**) |
| 보안그룹 | `sg-0144bd538dfba7047` (80·443 전체, 22 특정 IP) |
| 고정 IP (EIP) | **`3.34.113.37`** |
| 도메인 | **`projectamo.co.kr`** (가비아, A: @·www → 3.34.113.37) |
| 서버 빌드환경 | **설치됨**: JDK21(corretto) + Android SDK `~/android-sdk`(platform-36, build-tools-36) + 2G swap |
| 앱(pm2) | `work2` (`~/work2/web`, 포트 3000), appId `kr.firststep.app`, appName `첫걸음` |
| 로컬 SSH 키 | `~/.ssh/projectamo_rsa` (RSA — EIC CLI가 RSA만 받음) |
| 로컬 adb/scrcpy | `C:\Users\John\scrcpy\` |
| AWS CLI(Win) | `C:\Program Files\Amazon\AWSCLIV2\aws.exe` |

---

# A. 한 번만 하는 세팅 (이미 완료 — 새 환경/재구축 시 참고)

## A1. AWS CLI + 로그인
```powershell
winget install -e --id Amazon.AWSCLI      # 또는 https://awscli.amazonaws.com/AWSCLIV2.msi
aws configure                              # 기존 액세스 키 입력, region ap-northeast-2, format json
aws sts get-caller-identity                # Account 632752099407 나오면 OK
```
> 기존 액세스 키가 있으면 **IAM 사용자 새로 안 만들어도 됨**(키는 PC가 아니라 사용자 종속). 분실 시만 IAM에서 새 키 발급 + `AdministratorAccess` 부여.

## A2. 고정 IP / DNS (완료)
- EIP `3.34.113.37` → `ejy` 연결됨. (새 인스턴스 때만 `allocate-address`+`associate-address`)
- 가비아 DNS A레코드: `@`·`www` → `3.34.113.37` (TTL 600). 확인: `nslookup projectamo.co.kr`.

## A3. 서버 배포 환경 (완료)
- nginx + Next(`next start` 3000) + pm2(`work2`) + certbot https.
- 서버 빌드환경(JDK21+Android SDK36) 설치됨.
> 이 앱은 `/api/*` 때문에 정적 export 불가 → Node 상주(next start) 필요.

---

# B. 서버 접속하는 법 (.pem 없이, 어느 컴퓨터에서든)

서버 OS=Amazon Linux 2023 → **EC2 Instance Connect 내장.** 대회장에서 챙길 건 **AWS 액세스 키 하나뿐.**
> 권한: IAM 사용자에 **AdministratorAccess** 있으면 EIC 자동 포함(별도 인라인 정책 불필요).
> ⚠️ **EIC CLI는 RSA 키만 받는다**(구버전 CLI가 ed25519 거부). 반드시 `-t rsa`.

```powershell
$AWS="C:\Program Files\Amazon\AWSCLIV2\aws.exe"
# 1) 이 컴퓨터 공인 IP를 SSH(22) 허용에 추가
$myip=(Invoke-WebRequest https://checkip.amazonaws.com -UseBasicParsing).Content.Trim()
& $AWS ec2 authorize-security-group-ingress --group-id sg-0144bd538dfba7047 --protocol tcp --port 22 --cidr "$myip/32"
# 2) RSA 키 생성
ssh-keygen -t rsa -b 2048 -f $HOME\.ssh\projectamo_rsa -N '""'
# 3) EIC로 공개키 푸시(60초 창) → 즉시 접속
& $AWS ec2-instance-connect send-ssh-public-key --instance-id i-02e07f23649fd05fe `
  --availability-zone ap-northeast-2c --instance-os-user ec2-user `
  --ssh-public-key (Get-Content $HOME\.ssh\projectamo_rsa.pub -Raw)
ssh -i $HOME\.ssh\projectamo_rsa ec2-user@3.34.113.37    # 60초 안에
# 4) 한 번 들어가서 키를 영구 등록하면 이후 60초 제한 없이 접속
#    (서버에서) mkdir -p ~/.ssh; cat >> ~/.ssh/authorized_keys  ← 공개키 붙여넣기
```

---

# C. 🏁 대회 당일 워크플로우

## C0. 대회 컴퓨터 준비 (시작 시 1회)
1. **AWS CLI 설치 + `aws configure`** (액세스 키 지참)
2. **scrcpy+adb** 받아 압축 풀기 (github Genymobile/scrcpy, adb 포함됨)
3. **삼성 USB 드라이버 설치** → developer.samsung.com/android-usb-driver  ← **USB 미러링의 핵심**
4. **서버 접속 키 확보** (위 B절)

## C1. 앱 개발 → 서버 배포 (계속 반복)
```bash
# 로컬 앱폴더 → 서버로 전송
tar -C <앱폴더> -cf - . | ssh -i ~/.ssh/projectamo_rsa ec2-user@3.34.113.37 "rm -rf ~/work2 && mkdir ~/work2 && tar -x -C ~/work2"
# 서버에서 빌드+재시작
ssh -i ~/.ssh/projectamo_rsa ec2-user@3.34.113.37 "cd ~/work2/web && npm install && npm run build && ln -sfn .next-build .next && pm2 restart work2"
```
- 확인: 브라우저 `https://projectamo.co.kr`
- ⚠️ `.next-build` → `.next` 심볼릭 링크 필수(이 앱의 next.config가 빌드를 `.next-build`에 넣음).
> 💡 **웹 기능만 바꾸면 C1만 반복.** APK는 그대로 둬도 폰 앱이 자동으로 최신 화면을 불러옴.

## C2. APK 빌드 — ★ 서버에서 (이름·아이콘·권한 바꿀 때만)
> 로컬에서 gradlew는 AI 샌드박스가 막지만(loopback), **서버 SSH로 빌드하면 정상.** 서버에 빌드환경 이미 있음.
```bash
ssh -i ~/.ssh/projectamo_rsa ec2-user@3.34.113.37 'bash -s' <<'EOS'
export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java))))
export ANDROID_HOME=$HOME/android-sdk
cd ~/work2/web
# (이름/아이콘 바꿨으면 capacitor.config.ts·아이콘 먼저 수정 — server.url 은 https://projectamo.co.kr 유지)
npx cap sync android
cd android
sed -i 's/\r$//' gradlew          # ⚠️ CRLF 줄바꿈 고치기(윈도우 체크아웃 시 필수)
chmod +x gradlew
./gradlew assembleDebug --no-daemon
EOS
# apk 내려받기 (서버 → 이 컴퓨터)
scp -i ~/.ssh/projectamo_rsa ec2-user@3.34.113.37:~/work2/web/android/app/build/outputs/apk/debug/app-debug.apk .
```
- AndroidManifest 권한 이미 포함: INTERNET, 위치(FINE/COARSE), 알림(POST_NOTIFICATIONS).
- 위치/알림은 https라 WebView에서 그대로 작동.

## C3. 폰 설치 + 미러링 — ★ USB 기본
```powershell
$adb="C:\Users\John\scrcpy\adb.exe"; $env:ADB=$adb
& $adb devices                                   # USB 시리얼(예 R3CY300E0FB)이 device로 떠야 함
& $adb -s <시리얼> install -r app-debug.apk
#  서명 충돌나면:  & $adb -s <시리얼> uninstall kr.firststep.app   먼저, 다시 install
# 미러링 (풀 화질)
& "C:\Users\John\scrcpy\scrcpy.exe" -s <시리얼>
```
- 폰: **USB 연결 + USB 디버깅 ON + (MTP 모드)** + "USB 디버깅 허용" 한 번 수락.
- 데모: 위치·카메라·푸시 미러 창에서 시연. 그 창을 빔 출력으로.

## C4. 🔌 USB가 안 잡힐 때 — 무선(페어링 코드) 폴백
> 삼성 드라이버 설치 불가/USB 인식 실패 시. 반응성은 USB보다 떨어짐(가급적 5GHz wifi).
**폰:** 개발자 옵션 → **무선 디버깅 ON** → 탭 → **"페어링 코드로 기기 페어링"** → 화면에 *페어링 IP:포트* + *6자리 코드*. 메인 화면엔 *연결용 IP:포트*(다른 포트).
```powershell
$adb="C:\Users\John\scrcpy\adb.exe"; $env:ADB=$adb
& $adb pair <폰IP>:<페어링포트> <6자리코드>      # 예: pair 192.168.0.5:46553 972141
& $adb connect <폰IP>:<연결포트>                 # 메인 화면의 포트(페어링 포트와 다름)
& $adb -s <폰IP>:<연결포트> install -r app-debug.apk
# 저지연 미러링(무선)
& "C:\Users\John\scrcpy\scrcpy.exe" -s <폰IP>:<연결포트> --max-size 1024 --max-fps 30 --video-bit-rate 4M --no-audio
```
- PC·폰이 **같은 wifi** 여야 함. 페어링 코드는 일회용(매번 바뀜).

---

# D. 현재 서버 상태 & 대회 후 복구

**상황:** 이 서버엔 원래 사용자 `projectamo`(항공/기상 앱)이 돌고 있었음 → 대회 동안만 **잠시 내리고** WORK2로 운영. **기존 앱 삭제 안 함, 복구 가능.**
- 현재 라이브: `https://projectamo.co.kr` = WORK2(pm2 `work2`, 3000, https)
- 보존: `/opt/projectamo`(파일 그대로), pm2 `projectamo-backend`=stopped, nginx `projectamo.conf.disabled`(+`.orig-bak`)
- 환경변수 미설정 → 폴백 모드 동작(OPENAI_API_KEY·DATA_GO_KR_KEY 넣으면 실기능: `~/work2/web/.env.local` 후 `pm2 restart work2`)

**대회 후 원래 앱 복구:**
```bash
ssh -i ~/.ssh/projectamo_rsa ec2-user@3.34.113.37 'bash -s' <<"R"
pm2 stop work2
sudo mv /etc/nginx/conf.d/work2.conf /etc/nginx/conf.d/work2.conf.disabled
sudo mv /etc/nginx/conf.d/projectamo.conf.disabled /etc/nginx/conf.d/projectamo.conf
sudo nginx -t && sudo systemctl reload nginx
pm2 start projectamo-backend
pm2 save
R
# 원래 앱은 http(80) 구성이었음 — https 원하면 그 conf에 certbot 재실행
```

---

# E. 자주 막히는 곳
| 증상 | 원인/해결 |
|---|---|
| 도메인 접속 안 됨 | DNS 전파 대기 / **EC2 중지됨(서버 켜둘 것)** |
| 502 Bad Gateway | `next start` 안 돎 → `pm2 logs work2` |
| SSH 안 됨 | 현재 IP가 SG 22 허용에 없음(B-1) / EIC는 **RSA 키** 필요 |
| EIC 권한 거부 | IAM 사용자에 AdministratorAccess(또는 ec2-instance-connect:SendSSHPublicKey) |
| **gradlew loopback 오류** | **로컬 AI 빌드 불가 → 서버에서 빌드**(C2) |
| gradlew `cannot execute` | gradlew가 CRLF → `sed -i 's/\r$//' gradlew` |
| **USB 폰 안 잡힘** | **삼성 USB 드라이버 미설치**(C0-3) → 설치 후 재연결. 안되면 무선 폴백(C4) |
| `INSTALL_FAILED_UPDATE_INCOMPATIBLE` | 다른 키로 설치된 동일 앱 → `adb uninstall kr.firststep.app` 먼저 |
| 무선 미러링 렉 | wifi 한계 → USB 권장 / scrcpy 저지연 옵션(C4) |
| 카카오 지도 401 (쓸 경우) | 콘솔 JS SDK 도메인에 `https://projectamo.co.kr` 등록 |
