# 복지 혜택 전수 데이터

행정안전부_대한민국 공공서비스(혜택) 정보 API(15113968) 전수 적재.

## 절차
1. `web/.env.local` 에 `DATA_GO_KR_KEY=<서비스키>` (커밋 금지). **Decoding 키를 넣으세요 — Encoding 키는 이중 인코딩되어 인증 실패.**
2. 활용신청 후 받은 명세로 `fetch.mjs` 의 `BASE`·응답 필드, `normalize.mjs` 의 매핑을 확정.
3. `node data/welfare/benefits/fetch.mjs` → `raw/public-service-benefits.json` (전수).
4. `node data/welfare/benefits/normalize.mjs` → `normalized/benefits.full.json` (표준 Benefit[]).
5. 앱에서 쓰려면 `normalized/benefits.full.json` 을 `web/public/data/welfare/` 로 복사.

## 출처
- https://www.data.go.kr/data/15113968/openapi.do (이용허락범위 제한 없음)
- 전수 데이터는 공개 데이터의 사전 준비로 허용됨. 완성형 미션 답안 서비스는 당일 조립.
