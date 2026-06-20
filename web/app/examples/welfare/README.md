# 복지 도메인팩 (격리 예시)

실제 해커톤 1회 완주("우리 가족 맞춤 정부 혜택 찾기")에서 검증한 패턴을 **떼어낼 수 있는 예시**로 담았다.
기본 홈(`/`)은 범용 스캐폴드 그대로이고, 이 복지 앱은 `/examples/welfare`에서만 동작한다.

## 패턴 (주제 무관 재사용 가치)
- 자연어 입력 → AI가 폼을 채움 → 사용자 수정 → 제출 (`BenefitFinder`)
- 규칙엔진 매칭 + "왜 해당되는지" + 정보이득 기반 되묻기 (`lib/eligibility`)
- 라이브 API ↔ 샘플 폴백 (`lib/realtime`, `/api/policies`)
- 판단=규칙엔진, AI=통역(파싱·설명·문구)만 — 환각 차단 (`lib/ai`, `/api/{parse,explain,ask}`)

## 복지 전용 파일 (다른 주제면 삭제)
- `web/app/examples/welfare/`
- `web/lib/{types,eligibility,benefits,ai,realtime,explain-cache.json}`
- `web/components/{BenefitFinder,BenefitCard,CandidateCatalog,FollowUpQuestion,ParsedProfile}.tsx`
- `web/app/api/{parse,explain,ask,policies}/`

## 규칙
이건 **예시**이지 완성형 미션 답안이 아니다. 키 없으면 폴백(드롭다운·사전설명·기본문구)으로 완전 동작.
실데이터 후보 카탈로그는 `data/scripts/`(덤프) + `data/snapshots/`, 검증 엔드포인트는 `data/data-sources.md`.
