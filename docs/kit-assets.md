# 키트 자산 & 스택 가이드 (kit-assets)

> 기존 `CLAUDE.md`(모놀리식)에서 보존·이관한 **실전 키트 지식**.
> 워크플로우 실행 규칙은 `CLAUDE.md`(라우터) + `workflow/`가 담당하고, 이 문서는
> **"무엇이 이미 준비돼 있고, 어떻게 재사용하는가"** 만 다룬다.
> 주로 **Stage 00(intake, 자산 점검)** 과 **Stage 05(parallel-build, 재사용)** 에서 참조.

한국 공공 서비스용 **해커톤 스타터 키트**. 4시간 AI 해커톤에서 "데모가 확실히 돌아가는" 결과물을 빠르게 만드는 게 목표.

---

## 명령어
```bash
cd web
npm install      # 최초 1회 (검증됨: Node 24 / npm 11)
npm run dev      # http://localhost:3000
npm run build    # 프로덕션 빌드 검증
npm run lint
```
루트에서: `npm run web:dev` / `npm run web:build` / `npm run web:lint` 도 동일하게 동작.
실행 설정: `.claude/launch.json` (`npm --prefix web run dev`, 포트 3000).

스택: Next.js 14 (App Router) · React 18 · TypeScript · Tailwind 3 · `@krds-ui/core` (Apache-2.0).

## 구조 (자산 위치)
```
.
├── data/                      # 공공데이터 자산
│   ├── boundaries/            # 전국 시도/시군구 경계 GeoJSON·TopoJSON (확보됨)
│   └── data-sources.md        # 공공데이터 신청 경로 + 정적/실시간 전략
├── design/krds/               # KRDS 토큰 원본(CSS/JSON/Figma) + SOURCE.md
├── examples/disaster-guide/   # 연습 완성본(재난 가이드) 참고 소스
└── web/                       # 작업할 Next.js 앱 (깨끗한 스켈레톤)
    ├── app/                   # layout.tsx, page.tsx(스켈레톤), globals.css
    ├── components/            # Header/Footer(범용) · KakaoMap(재사용)
    ├── lib/                   # regions.ts(시도→시군구) · shelters.ts(위치 유틸)
    ├── public/                # gov 엠블럼 · data/shelters(민방위 대피소 JSON)
    └── scripts/build-shelters.mjs  # CP949 CSV → 정제 JSON 변환 패턴
```

---

## 사전 준비된 자산 (재사용 — 처음부터 만들지 마라)
새로 만들기 전에 **아래 자산이 주제에 쓸 수 있는지 먼저 확인**하라.

| 자산 | 위치 | 쓸 수 있으면 |
|------|------|------|
| 검증된 스택 스캐폴드 | `web/` (Next.js+KRDS, `install`+`build` 통과 확인됨) | init 생략하고 이걸로 시작 |
| 지역 데이터 | `web/lib/regions.ts` (전국 시도→시군구), `data/boundaries/` (경계 GeoJSON) | 지역 선택/지도에 그대로 |
| 위치 유틸 | `web/lib/shelters.ts` (거리계산·정렬·필터) | 위치 기반 서비스에 재사용 |
| 지도 | `web/components/KakaoMap.tsx` (SDK 로드·클러스터·키없을때 fallback) | 지도 화면에 그대로 |
| 대피소 데이터 | `web/public/data/shelters/civildefense/<시도>.json` (~17,000곳) | 시설/POI 예시로 |
| 데이터 가공 패턴 | `web/scripts/build-shelters.mjs` (CP949 CSV→정제 JSON) | 당일 받은 공공 CSV 가공에 |
| KRDS 디자인 | `design/krds/` (토큰), `web/public/gov/` (정부 엠블럼) | 정부 서비스 룩에 |
| 공공데이터 신청 경로 | `data/data-sources.md` | 당일 데이터 다운로드/신청 |
| 참고 완성본 | `examples/disaster-guide/` | 코드 패턴 참고 |

사용 디테일:
- 시도 목록 = `Object.keys(SIGUNGU_BY_SIDO)` (`web/lib/regions.ts`).
- `shelters.ts`의 거리계산은 Haversine — 위치 기반 정렬에 범용.

> ⚠️ 주제가 공공/지역 기반이 **아니면** KRDS·공공데이터 자산은 짐이 된다. `web/` 스캐폴드와 워크플로우만 쓰고 나머지는 떼어내라.
> ⚠️ `data.go.kr`·`safetydata.go.kr`은 이 환경에서 **403 차단**. 새 데이터는 **사람이 브라우저로 직접 다운로드** 필요.

---

## KRDS 주의사항 (실측 함정)
- `@krds-ui/tailwindcss-plugin` v0.6.0은 CSS 변수(`var(--krds-color-*)`)가 아니라 **리터럴 테마 프리셋**을 주입한다. `web/tailwind.config.ts`가 정답 설정 — `design/krds/`의 드롭인 config는 참고용(변수 방식이라 그대로 쓰면 색 깨짐).
- 컴포넌트 스타일은 `globals.css`의 `@krds-ui/core/dist/style.css` import로 들어온다.
- `Badge`는 children이 아니라 **`label` prop** 사용: `<Badge label="위험" variant="danger" size="small" />`.
- `@krds-ui/core`의 `Select`는 비제어형 → 폼 상태 연동 필요하면 KRDS 토큰 입힌 native `<select>` 사용(스켈레톤 page.tsx 참고).
- 커스텀 토큰: `rounded-krds`(6px)·`rounded-krds-lg`(12px)·`max-w-container`(1200px).

---

## 사전 준비 (대회 전에 미리!)
- **카카오맵 JS 키**: developers.kakao.com 발급 + **도메인 등록**(localhost:3000). 당일엔 늦다. `web/.env.local.example` → `.env.local` 복사 후 `NEXT_PUBLIC_KAKAO_MAP_KEY` 채움. (지도 안 써도 fallback으로 앱은 돈다.)
- **공공데이터**: 위 403 차단 때문에 새 데이터는 사람이 직접 다운로드 → `web/scripts/build-shelters.mjs` 변환 패턴으로 가공. 경로는 `data/data-sources.md`.

---

## 발표 자산
- 발표 파이프라인·엔진은 `presentation/AGENTS.md` 참고 (기본: Slidev primary + Notion 정적 HTML 백업).
- 벤치마킹 캡처 도구: `presentation/slidev/reference-capture/` (해외 사례 덱 캡처 → 레퍼런스).
