# 공공데이터 소스 목록 (해커톤용)

> 구분 원칙: **자주 안 바뀌는 위치/시설/조건 = 정적 다운로드**, **시시각각 바뀌는 상태/경보/측정값 = 실시간 API**
>
> ⚠️ 이 컨테이너의 네트워크 정책상 한국 정부 도메인(`data.go.kr`, `safetydata.go.kr`, `data.seoul.go.kr`)은
> 모두 403 차단됨. GitHub 등 오픈소스 미러만 접근 가능. → 정부포털 데이터는 **사람이 직접 신청/다운로드** 필요.

## ✅ 이미 받아둔 데이터 (인증 불필요, GitHub 미러)

`data/boundaries/` — 출처: southkorea/southkorea-maps (kostat 2018)

| 파일 | 내용 | 비고 |
|---|---|---|
| `skorea-provinces-geo.json` | 시도 경계 17개 (GeoJSON, props: name/code/name_eng) | 바로 사용 가능 |
| `skorea-provinces-topo.json` | 시도 경계 (TopoJSON, 경량 860KB) | topojson-client 변환 |
| `skorea-municipalities-topo.json` | 시군구 경계 (TopoJSON, 1.9MB) | topojson-client 변환 |

## 🔑 직접 신청 필요 (사용자가 미리 발급해둘 것)

### 지도
- **카카오맵 JS SDK 키** — developers.kakao.com (도메인 등록 필요). UTMK(EPSG:5179) 좌표 변환은 proj4js.

### 복지·혜택 (정적 비중 높음 — 받아서 박제)
CSV/파일 다운로드 (fileData.do):
| 데이터 | 다운로드 페이지 |
|---|---|
| 한국사회보장정보원_복지서비스정보 (복지로, 핵심) | https://www.data.go.kr/data/15083323/fileData.do |
| 한국사회보장정보원_민간복지서비스정보 | https://www.data.go.kr/data/15116392/fileData.do |

API 키 신청 (openapi.do):
| 데이터 | 페이지 |
|---|---|
| 보조금24 대한민국 공공서비스(혜택) 정보 | https://www.data.go.kr/data/15113968/openapi.do |
| 한국사회보장정보원_중앙부처복지서비스 | https://www.data.go.kr/data/15090532/openapi.do |

### 생활·안전 (실시간 API 비중 높음)
정적 — CSV/파일 바로 다운로드 (standard.do/fileData.do, 다운로드 버튼 있음):
| 데이터 | 다운로드 페이지 |
|---|---|
| 전국무더위쉼터표준데이터 (한파쉼터 통합) | https://www.data.go.kr/data/15013199/standard.do |
| 전국어린이보호구역표준데이터 | https://www.data.go.kr/data/15012891/standard.do |
| 전국CCTV표준데이터 | https://www.data.go.kr/data/15013094/standard.do |
| 전국지진옥외대피장소표준데이터 | https://www.data.go.kr/data/15072620/standard.do |
| 전국민방위대피시설표준데이터 | https://www.data.go.kr/data/15021098/standard.do |
| 전국도시공원정보표준데이터 | https://www.data.go.kr/data/15012890/standard.do |
| 전국공공시설개방정보표준데이터 | https://www.data.go.kr/data/15013117/standard.do |
| 행정안전부_안전비상벨위치정보 | https://www.data.go.kr/data/15075539/fileData.do |
| 행정안전부_CCTV정보 | https://www.data.go.kr/data/15075538/fileData.do |

정적/API — 키 신청 필요 (openapi.do, 다운로드 버튼 없음):
| 데이터 | 페이지 |
|---|---|
| 생활안전지도 치안안전시설(경찰/지구대) | https://www.data.go.kr/data/15101889/openapi.do |
| 행정안전부_민방위대피시설 | https://www.data.go.kr/data/15115459/openapi.do |
| 산사태위험지구/우려지역 | https://www.data.go.kr/data/15139763/openapi.do |

실시간 API (키 발급 + 호출코드 미리 작성):
| API | 출처 | 내용 |
|---|---|---|
| 긴급재난문자 | safetydata.go.kr (가입+활용신청) | 실시간 재난문자 |
| 대기오염정보(에어코리아) | data.go.kr/data/15073861 | 실시간 미세먼지/PM2.5 |
| 기상특보 | data.go.kr (기상청) | 한파·폭염·호우 등 12종 |
| 단기예보/초단기실황 | data.go.kr (기상청) | 동네날씨 |
| 지진정보 | data.go.kr (기상청) | 지진 통보 |
| 침수/도로통제·IoT센싱 | safetydata.go.kr | 실시간 |

## ⚠️ 리스크 메모
- data.go.kr API: 신청 후 자동승인(즉시)도 있으나 일부 1~2일 심사. **지금 미리 신청.**
- safetydata.go.kr: 별도 가입 + 활용신청 필요.
- 모든 실시간 API는 **호출 실패 시 정적 백업으로 fallback** 하도록 구현 → 데모 안정성.
