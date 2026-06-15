# 한국 공공 서비스 해커톤 스타터 키트

> 4시간 AI 해커톤에서 **새 주제를 받자마자 바로 구현**하기 위한 출발점.
> 검증된 Next.js + KRDS 스택, 한국 지역·지도 공공데이터, 재사용 코드 패턴, 그리고
> AI 에이전트용 운영 워크플로우(`AGENTS.md`)가 한 묶음으로 들어있다.

## 빠른 시작 (대회 당일)

```bash
cd web
npm install
npm run dev      # http://localhost:3000
```

빌드 검증은 `npm run build`. **이 스캐폴드는 `install`+`build` 통과 확인됨** (Node 24 / npm 11).

그다음 순서:
1. `AGENTS.md` 읽고 워크플로우 시작
2. `spec.md`에 **데모 시나리오**부터 작성
3. `web/app/page.tsx`(스켈레톤) 교체하며 구현
4. 단계마다 `PROGRESS.md` 갱신 + 작동 상태마다 체크포인트 커밋

## 들어있는 것

| 묶음 | 내용 |
|---|---|
| **워크플로우** | `AGENTS.md` (운영 지침 · 단계별 Gate · 사전 준비된 자산) |
| **계약서 템플릿** | `spec.md` · `plan.md` · `PROGRESS.md` (빈 템플릿) |
| **스택** | `web/` — Next.js 14 + React 18 + TS + Tailwind + KRDS, 셋업 완료 |
| **데이터** | 전국 시도/시군구 경계, 시도→시군구 매핑, 민방위 대피소 ~17,000곳 |
| **디자인** | `design/krds/` — KRDS 공식 토큰(CSS/JSON/Figma) + 정부 엠블럼 |
| **재사용 코드** | 카카오맵 컴포넌트, 위치/거리 유틸, 공공 CSV 변환 스크립트 |
| **참고 완성본** | `examples/disaster-guide/` — 연습 결과물(재난 대비 가이드) 소스 |

상세 사용법·KRDS 함정·사전 준비는 **`CLAUDE.md`** 참고.

## 주제가 공공 성격이 아니라면
`AGENTS.md` 워크플로우 + `web/` Next 스캐폴드만 가져가고, KRDS·공공데이터 묶음은 떼어내면 된다.

## 사전 준비 (대회 전 권장)
- 카카오맵 JS 키 발급 + 도메인 등록 (지도 쓸 경우, 당일엔 늦음)
- 필요할 법한 공공데이터 미리 신청 — `data/data-sources.md` 참고 (`data.go.kr` 차단 환경 대비)

## 라이선스 / 출처
KRDS 이용약관 · `@krds-ui/core`(Apache-2.0) · 공공데이터포털. 상세는 `design/krds/SOURCE.md`, `data/data-sources.md`.
