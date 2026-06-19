# research/ — Stage 01 산출물 (병렬 리서치)

Stage 01(`workflow/stages/01-parallel-research.md`)에서 서브에이전트를 병렬로 돌려 채우는 디렉터리다.
품질 기준은 `docs/AI_Hackathon_Operating_System.md` §4(Stage 01)·§8(Stage 01 Review)를 따른다.
리서치 시작 시 **가장 먼저 `sources.json`을 만들고**, 검증 가능한 모든 주장을 출처와 연결한다(근거 없는 수치 금지).

## 생성되는 파일 (6개 + sources.json)

| 파일 | 트랙 | 내용 |
|---|---|---|
| `overseas.md` | C. 해외 사례 | **최소 3개** 실제 사례. 사례별: 서비스명·국가/기관·해결 문제·핵심 사용자·핵심 메커니즘·AI 역할·사용자 흐름·사용 데이터·차별 이유·**한국에 이식 가능한 킥**·4시간 MVP 축소안·출처/확인 시점. (기능을 베끼지 말고 검증된 메커니즘을 추출) |
| `domestic.md` | B. 국내 사례 | 이미 있는 기능·공공 vs 민간 차이·사용자 마찰·규제/데이터 제약·해커톤 중복 가능성 |
| `jtbd.md` | A. 사용자·JTBD | Functional / Emotional / Social Job · Current Alternative · Failure Cost · Success Criteria |
| `feasibility.md` | D. 구현 현실성 | 4시간 시연 가능성·실시간 API 필요 여부·fixture 대체 가능성·가장 위험한 외부 의존성·데모에 안 보이는 구현·핵심 경로 최단화 |
| `judge-review.md` | E. 심사위원 관점 | 이미 흔한 기능·첫 30초에 이해시킬 것·가장 강한 의심·데모에서 보이는 킥·기억에 남는 한 문장 |
| `integrated-findings.md` | 통합 | 위 5개를 종합한 Theme Analysis + 차별점 후보 정리. Stage 02 Insight 선택의 입력. |
| `sources.json` | 전 트랙 | 출처·Claim 구조화 (스키마: `workflow/contracts/research-output.schema.json`). Stage 12에서 `sources.md`로 변환. |

## 사용처
- Stage 02(Insight 선택)가 `integrated-findings.md`를 읽어 Insight 후보를 만든다.
- `spec.md`의 Problem·Impact 수치는 `sources.json`의 출처 ID와 연결한다.
- Stage 12(패키지)가 `sources.json` → `dist/submission/sources.md`로 변환한다.

> ⚠️ `data.go.kr`·`safetydata.go.kr`은 이 환경에서 403 차단. 새 데이터는 사람이 브라우저로 직접 다운로드.
