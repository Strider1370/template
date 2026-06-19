# 임신·출산 지원의 시계 — 제출 패키지

> 임신 주차·출산예정일·거주지를 넣으면, 흩어진 임신·출산 정부 지원을 **"지금 신청 → 곧 열림" 시간순으로 정렬**하고 **놓치면 사라질 돈을 D-day로 경고**하는 서비스.
> **"받을 수 있는 지원이 아니라, 지금 받아야 하는 지원을 알려줍니다."**

## 패키지 구성
| 파일/폴더 | 내용 |
|---|---|
| `web/` | 웹 앱 소스 (Next.js 14 + KRDS). `node_modules`·`.next` 제외 |
| `slidev/` | **Slidev 발표 빌드(primary)** — HTTP 서빙해서 시연 (`serve-slidev.mjs`) |
| `serve-slidev.mjs` | Slidev 빌드 서빙용 무의존 스크립트 |
| `presentation.html` | 발표 슬라이드 10장 (단일 HTML, file://로도 열림 / 오프라인 백업) |
| `presentation.pdf` | 발표 슬라이드 PDF (10p, 백업) |
| `demo.webm` | 데모 영상 (Playwright 2회 완주 녹화, 라이브 실패 시 백업) |
| `script.md` | 5분 발표 대본 (구어체) |
| `qna.md` | 예상 Q&A |
| `spec.md` | 제품 스펙 |
| `sources.md` | 데이터·주장 출처 (정부 1차출처 검증) |
| `concept.md` | 프로젝트 북극성(컨셉) |

## 앱 실행법
```bash
cd web
npm install
npm run dev      # http://localhost:3000
```
- **API 키 없이도** 핵심 경로(입력 → 시간축 정렬 → Wow 재정렬·마감 손실경고 → AI 자격 Q&A)가 동작합니다(폴백 내장).
- (선택) 실 API 활성화: `web/.env.local`에 키 추가
  - `NEXT_PUBLIC_KAKAO_MAP_KEY` / `KAKAO_REST_API_KEY` — 가까운 시설 지도·검색
  - `ANTHROPIC_API_KEY` — AI 자격 Q&A 실시간 LLM (없으면 검증된 답변 폴백)
  - (키·`.env.local`은 패키지에 포함하지 않음)

## 발표
**방법 A — Slidev (primary, 권장):** Vite 빌드라 **HTTP 서빙 필요**(file:// 직접 열기는 CORS로 안 뜸).
```bash
node serve-slidev.mjs        # → http://localhost:4173, 브라우저로 열고 ←/→ 이동, F 전체화면
```
**방법 B — 정적 HTML (백업, 오프라인):** `presentation.html`을 브라우저로 그냥 열기(`←/→` 이동, `?edit=1`/`e` 편집 오버레이). 인터넷·서버 불필요.
**방법 C — PDF:** `presentation.pdf` (10p).

- 라이브 데모는 `web` 앱(localhost:3000), 실패 시 `demo.webm` + 슬라이드로 대체.
- (참고) Slidev 소스에서 다시 빌드/dev하려면 `web/`이 아닌 별도 Slidev 프로젝트가 필요하며, **경로에 공백이 있으면 Vite가 실패**하므로 공백 없는 경로(예: `subst` 가상 드라이브)에서 실행한다.

## 데모 시나리오 (요약)
1. 임신 주차·거주지 입력 → "지금 받을 수 있어요 / 곧 받게 돼요" 시간순 카드
2. 주차를 출산 직후로 옮기면 **실시간 재정렬 + 마감 손실 경고 점등** ("지나면 200만원 소멸")
3. 자유 질문(예: "쌍둥이인데 고위험이고 전입 3개월") → 검증된 제도 데이터 기반 AI 답변

## 정직성 / 한계
- 모든 금액·기한은 **정부 1차출처로 검증**(`sources.md`). 데이터셋 밖 수치는 생성하지 않음.
- 자격 *안내*까지 — 실제 신청은 공식 창구 링크로 연결.
- 현재 데모: AI 실시간 LLM·카카오 지도는 키 연동 시 활성, 미설정 시 폴백 동작.
- 데모 데이터: 가상 페르소나·검증된 공통 제도 6건 + 대표 지역 시설 샘플.

## 기술 스택
Next.js 14 (App Router) · React 18 · TypeScript · Tailwind · @krds-ui/core (정부 디자인) · (선택) 카카오 로컬 API · Anthropic API
