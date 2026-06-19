# 리허설 점검 — Stage 11

## ① 시간 측정 (목표 5분 / 300초)
- deck 계획 시간 = 290초. 슬라이드 배분: hero 20 · problem 30 · contrast 35 · solution 20 · demo입력 25 · **Wow 60** · AI 45 · mechanism 20 · limitation 30 · closing 15.
- 낭독 추정: 순수 내레이션 ≈ 3.5분 + 데모 라이브 인터랙션(슬라이더 조작·AI 질문) ≈ 1.5분 = **약 5분**. 290초 예산 내.
- 권장: 발표자가 1회 실제 낭독으로 ±20초 미세조정. 초과 시 mechanism(08) 또는 solution(04)을 1문장 축약.

## ② 라이브 데모 ↔ 영상 폴백
- 라이브 시연 = 실앱 `localhost:3000` (dev 서버). 동선: 입력(28주·강동구) → 결과 → 슬라이더 출산직후(Wow 재정렬+경고) → AI 질문(교차케이스).
- **폴백 = `demo/demo.webm`** (Playwright 2회 완주 녹화) + slide-06 풀스크린 캡처. 라이브 5초 내 미동작 시 즉시 영상 전환.
- 키 미설정 환경에서도 핵심 경로+AI(폴백)가 동작함을 Stage07에서 확인 → 라이브 리스크 낮음.

## ③ Q&A
- `presentation/qna.md` 7문(A~G): 정부24 차별 · AI 필요성 · 데이터 출처/최신성 · 오안내 책임 · 확장 · 데이터 운영 · 사업화. 발표 중 선제 해소 질문 목록 포함.

## ④ 정직성 최종 확인
- 발표/슬라이드는 manifest 기준 — AI(slide-07)·지도는 fallback 명시, 미구현 단언 없음. 모든 수치 정부 1차출처 검증.
- Closing = concept.md 마지막 문장 그대로.

## ⑤ 리허설 중 반영 (사용자 피드백)
- 사용자 지적: 기존 대본이 번역투/어색 → **`script.md` 전체를 구어체로 재작성**(후크 질문 시작, 단문, 화면 가리키는 말투, 숫자 강조).
- 워크플로우 일관성: 대본만 고치면 deck speakerNotes(Stage 09 산출)와 어긋남 → **deck.json speakerNotes 10장 전부 새 톤으로 동기화 + 재렌더·재검증(PASS)**. script.md ↔ deck.json ↔ slides.md ↔ static HTML 일치.
- Stage 11 §6/§9의 "필요 시 script/qna 갱신·문장 조정" 범위 내.

## 상태
시간·폴백·Q&A·정직성 점검 + 대본 구어체화 + deck 동기화 완료.
**사용자 최종 승인: 승인됨**("deck 노트 동기화 후 승인" 선택, 동기화 완료). → Stage 12 패키징 진행.
