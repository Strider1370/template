import type { CapacitorConfig } from '@capacitor/cli';

/**
 * APK(WebView 래퍼) 설정.
 * 이 앱은 /api/* (AI 엔진) 때문에 정적 export 불가 → server.url 로 라이브 Next 서버를 가리킨다.
 *
 * server.url 후보:
 *  - 같은 LAN: http://<노트북LAN_IP>:3000  (폰·노트북이 동일 사설망일 때)
 *  - USB(adb reverse tcp:3000 tcp:3000): http://localhost:3000  (네트워크 무관, 케이블)
 *  - 배포: https://<vercel-url>  (가장 안정적, cleartext 불필요)
 */
const config: CapacitorConfig = {
  appId: 'kr.firststep.app',
  appName: '첫걸음',
  webDir: 'capacitor-www',
  server: {
    // USB + adb reverse tcp:3000 tcp:3000 → 폰 localhost:3000 이 PC 의 3000 으로 터널.
    // PC(공인IP·랜선)와 폰(모뎀 WiFi 사설망)이 다른 망이라 LAN IP 직접접속 불가 → localhost 터널이 정답.
    url: 'http://localhost:3000',
    cleartext: true,
  },
};

export default config;
