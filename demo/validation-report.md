# 데모 검증 리포트 (Stage 07)

> demo/demo.scenario.yaml 핵심경로를 Playwright로 **2회 완주**. 라이브 실패 시 아래 스크린샷이 발표 백업.

## 결과: ✅ PASS (2/2 완주, 재현성 확인)

| 항목 | run1 | run2 | 기준 |
|---|---|---|---|
| 로그인 화면(`login`) | 0 (없음) | 0 (없음) | 없어야 함 ✓ |
| 구조화 칩(`parsed-profile`) | 5 | 5 | ≥1 ✓ |
| 혜택 카드(`benefit-card`) | 5 | 5 | ≥1 ✓ |
| 충족 체크리스트 ✓(`eligibility-checklist`) | 있음 | 있음 | ≥1 ✓ |
| 근거 설명(`why-explanation`) | 38자 | 38자 | 비어있지 않음 ✓ |
| 신청 동선(`apply-cta`) | 있음 | 있음 | ≥1 ✓ |
| 예시 데이터 라벨(`sample-data-label`) | 있음 | 있음 | 있어야 함 ✓ |

## 데모 입력 (가상 페르소나)
"영유아 가구" 선택 + 월 350만원 + 막내 8개월 (= 박지은 페르소나).
→ 매칭 5건: 부모급여 · 첫만남이용권 · 아동수당 · 기저귀·조제분유 지원 · 근로장려금.

## Wow Moment 확인
입력 직후 **로그인 화면 없이** 혜택 카드마다 "왜 해당되나요? ✓ 막내 자녀가 8개월로 만 2세 미만 조건을 충족" 체크리스트 + 근거 설명이 즉시 렌더됨. spec §9 assertion 충족.
- Wow 캡처: `presentation/assets/screenshots/run1-step3-wow.png`, `run2-step3-wow.png`

## 단계별 스크린샷 (발표 백업)
- step1 입력 화면(로그인 없음): `presentation/assets/screenshots/run{1,2}-step1-input.png`
- step2 구조화 칩 + 카드 목록: `presentation/assets/screenshots/run{1,2}-step2-results.png`
- step3 Wow(근거 카드): `presentation/assets/screenshots/run{1,2}-step3-wow.png`

## 검증 조건/환경
- 검증 경로: **폴백 경로**(ANTHROPIC_API_KEY 없음). 설명은 사전작성 캐시(사실 기반)에서 옴 → 키 없어도 데모 완주.
- 재현 스크립트: `demo/capture-demo.mjs` (playwright-chromium, dev 서버 localhost:3000).
- 발견 문제: 없음. (단, 개발 중 `next build`와 dev 서버가 `.next`를 공유하면 dev가 깨질 수 있음 → dev 재시작으로 복구. 발표 땐 dev만 띄울 것.)
