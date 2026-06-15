# CLAUDE.md

한국 공공 서비스용 **해커톤 스타터 키트**. 새 세션 AI가 이 파일을 먼저 읽고 맥락을 잡는다.

## 이게 뭔가
4시간 AI 해커톤에서 **새 주제를 받자마자 바로 구현**하기 위한 출발점.
검증된 Next.js + KRDS 스택, 한국 지역·지도 데이터, 재사용 코드 패턴이 미리 셋업돼 있다.

> 운영 지침(역할/단계별 Gate/하지 말 것)은 **`AGENTS.md`** 에 있다. 작업 흐름은 거기를 따른다.

## 명령어
```bash
cd web
npm install      # 최초 1회 (검증됨: Node 24 / npm 11)
npm run dev      # http://localhost:3000
npm run build    # 프로덕션 빌드 검증
npm run lint
```
실행 설정: `.claude/launch.json` (`npm --prefix web run dev`, 포트 3000).

## 구조
```
.
├── AGENTS.md                  # 운영 지침 (워크플로우 본체) — 먼저 읽기
├── 해커톤_워크플로우.md         # 4시간 타임라인 + 황금 규칙
├── 해커톤_협업_워크플로우.md     # 2인 역할분담 버전
├── spec.md / plan.md / PROGRESS.md  # 계약서 템플릿 (주제 정해지면 채움)
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

## 스택
Next.js 14 (App Router) · React 18 · TypeScript · Tailwind 3 · `@krds-ui/core` (Apache-2.0).

## 재사용 자산 (그대로 가져다 쓰기)
- **지역**: `web/lib/regions.ts` — 전국 시도→시군구 전체 매핑. (시도 목록 = `Object.keys(SIGUNGU_BY_SIDO)`)
- **위치 유틸**: `web/lib/shelters.ts` — 거리계산(Haversine)·정렬·포맷·지역필터. 위치 기반 서비스 범용.
- **지도**: `web/components/KakaoMap.tsx` — 카카오 SDK 1회 로드, 클러스터링, **키 없을 때 graceful fallback**.
- **대피소 데이터**: `web/public/data/shelters/civildefense/<시도>.json` (전국 ~17,000곳).
- **경계 데이터**: `data/boundaries/` GeoJSON/TopoJSON.
- **데이터 가공 패턴**: `web/scripts/build-shelters.mjs` — 다른 공공 CSV도 이 패턴으로.

## KRDS 주의사항 (실측 함정)
- `@krds-ui/tailwindcss-plugin` v0.6.0은 CSS 변수(`var(--krds-color-*)`)가 아니라 **리터럴 테마 프리셋**을 주입한다. `web/tailwind.config.ts`가 정답 설정 — `design/krds/`의 드롭인 config는 참고용(변수 방식이라 그대로 쓰면 색 깨짐).
- 컴포넌트 스타일은 `globals.css`의 `@krds-ui/core/dist/style.css` import로 들어온다.
- `Badge`는 children이 아니라 **`label` prop** 사용: `<Badge label="위험" variant="danger" size="small" />`.
- `@krds-ui/core`의 `Select`는 비제어형 → 폼 상태 연동 필요하면 KRDS 토큰 입힌 native `<select>` 사용 (스켈레톤 page.tsx 참고).
- 커스텀 토큰: `rounded-krds`(6px)·`rounded-krds-lg`(12px)·`max-w-container`(1200px).

## 사전 준비 (대회 전에 미리!)
- **카카오맵 JS 키**: developers.kakao.com에서 발급 + **도메인 등록**(localhost:3000). 당일에 하면 늦다. `web/.env.local.example` → `.env.local` 복사 후 `NEXT_PUBLIC_KAKAO_MAP_KEY` 채움. (지도 안 써도 fallback으로 앱은 돈다.)
- **공공데이터**: 이 환경에서 `data.go.kr`·`safetydata.go.kr`은 **403 차단**. 새 주제가 새 데이터를 필요로 하면 **사람이 브라우저로 직접 다운로드** → `scripts/`의 변환 패턴으로 가공. 신청 경로는 `data/data-sources.md`.

## 하드 룰 (요약, 자세히는 AGENTS.md)
- 데모에 보이는 것 우선. 스펙에 없는 기능 추가 금지. 과한 추상화 금지.
- 작동하는 상태가 되면 체크포인트 커밋. 진짜 연동이 막히면 하드코딩 데이터로 데모를 살린다.
