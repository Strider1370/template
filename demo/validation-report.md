# 데모 검증 리포트 (Stage 07)

> demo.scenario.yaml 핵심경로를 Playwright(chromium headless)로 **2회 완주** + 단계별 스크린샷 + assertion.
> 실행: 앱(localhost:3000) 켠 상태에서 `node demo/capture.mjs`. 검증일 2026-06-21.

## 결과: ✅ PASS (2회 완주 + 즉석입력, assertion 충족)

| 회차 | firstStep('이의신청'+'2주/14일') | source-badge href (호스트 정확매칭) |
|---|---|---|
| run1 | ✅ | ✅ easylaw.go.kr |
| run2 | ✅ | ✅ easylaw.go.kr |
| step4 즉석입력(건강보험 체납) | ✅ 새 카드 생성·건강보험 안내(지급명령 대본 아님) | — |

## 시나리오 완주 (demo.scenario.yaml 대조)
- **step1** 통합 입력에 지급명령 예시 채우고 '분석하기' → `guide-card` 렌더 ✅
- **step2** 4칸 카드 + `step-first-action`에 "2주(14일) 이내 … 이의신청" ✅
- **step3** `source-badge` href = 법제처(easylaw) 화이트리스트(호스트 정확매칭) ✅ (환각 URL 아님)
- **step4** 미리 안 짜둔 즉석 입력("건강보험료 체납…") → 같은 엔진이 새 카드 생성 ✅ (run3-impromptu.png) = 대본 아님 증명
- **Wow Moment** `[data-testid="guide-card"] [data-testid="source-badge"]` 동시 렌더 ✅ (run1-03-wow.png)

## 산출물 (라이브 실패 시 발표 백업)
- `demo/run1-01-home.png` · `run1-02-result.png` · `run1-03-wow.png`
- `demo/run2-01-home.png` · `run2-02-result.png` · `run2-03-wow.png`
- 캡처 스크립트: `demo/capture.mjs`

## 발견 문제 / 주의
- 핵심경로 2회 + 즉석입력 모두 통과(차단 문제 없음).
- **AI only = LLM 출력 의존**: firstStep 문구·출처는 매 호출 생성이라 표현이 흔들릴 수 있음(예: '2주' vs '14일'). 2회+즉석으로 재현 확인했으나 표본이 작음 → **라이브 보험: 검증 샘플 재실행 + 백업 스크린샷**(scenario fallback과 동일).
- 검증 범위는 **텍스트 입력 경로**(지급명령+즉석 건강보험). **사진(비전)·"내 주변 찾기 라이브"는 미검증**(키/권한 의존) → 발표 단정 시연 금지(manifest와 동일).
- 영상/GIF 미제작(지침대로) — 단계별 스크린샷이 백업.
