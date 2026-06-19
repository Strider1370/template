<!-- Handoff 보고서. Stage 11 완료. -->
# Stage 11 완료 보고 — rehearsal

## 단계
11 · rehearsal (리허설) — **사용자 승인 단계**

## 시작 시각 / 종료 시각 / 사용 시간
- 시작: 2026-06-18T11:~Z / 예산 10분 내

## 완료한 내용
- 리허설 점검(시간·라이브↔영상 폴백·Q&A·정직성) → `presentation/rehearsal-notes.md`.
- **사용자 피드백 반영**: 대본이 번역투라는 지적 → `presentation/script.md` 전체를 구어체로 재작성.
- **워크플로우 일관성 유지**: deck.json speakerNotes 10장 전부 새 톤으로 동기화 + 재렌더·재검증(PASS). script.md ↔ deck.json ↔ slides.md ↔ static HTML 일치.
- 사용자 최종 승인 획득.

## 생성·수정한 파일
- `presentation/script.md` (구어체 재작성)
- `presentation/deck.json` (speakerNotes 10장 동기화), `slidev/slides.md`·`output/static/presentation.html` 재생성
- `presentation/rehearsal-notes.md` (리허설 기록 + 승인)
- `workflow/state.yaml` (humanApproval=approved)

## 리허설 점검 결과
- 시간: deck 290초 ≤ 300초. 낭독 추정 ~5분(내레이션 ~3.5분 + 데모 인터랙션 ~1.5분).
- 폴백: 라이브 `localhost:3000` 실패 시 `demo/demo.webm` + slide-06 풀스크린 캡처로 전환.
- Q&A: qna.md 7문 준비.
- 정직성(§14 재확인): 구어체본도 모든 수치 검증값(60일·200만원·태아당100·300만원), AI는 "검증된 데이터 안에서만/지어내지 않아요"로 fallback 정합, 미구현 단언 0, Closing=concept 마지막 문장 그대로.

## Gate 결과
- `npm run gate:rehearsal` (checklist) → **PASS** (시간·폴백·Q&A·승인 체크리스트).
- LLM Review(§14): 대본 변경은 톤 한정, 주장·수치·가드레일 불변(Stage 08 PASS 유지) → 메인 자가검증으로 과장/누락 0 확인.

## 사용자 결정
- **승인됨**(humanApproval=approved, decisionFile=presentation/rehearsal-notes.md).
- 결정 경로: "deck 노트 동기화 후 승인" 선택 → 동기화 완료 후 승인 확정.

## 적용한 폴백
- 라이브 데모 실패 대비 demo.webm 백업 확정.

## 남아 있는 위험 (경미)
- slide-05·07 callout 쉼표 뒤 공백 없음(생성기 렌더, 가독 지장 적음) — 선택 보정.
- 라이브 키 미설정 → AI·지도는 폴백(발표 대본에 정직 반영됨).

## 확정된 계약 (Stage 12가 패키징)
- 확정 발표자료: `presentation/output/static/presentation.html`(10장, 290초) + `slides.md` + `script.md`(구어체) + `qna.md` + `demo/demo.webm` + 캡처.
- 발표 정직성: manifest 기준(AI·지도 fallback 명시).

## 다음 단계가 읽어야 할 파일
- `presentation/output/`, `presentation/script.md`, `presentation/qna.md`, `demo/`, `implementation/manifest.json`, `concept.md`, `research/sources.json`
- `workflow/stages/12-package.md`

## 다음 단계에서 하지 말아야 할 것
- 승인된 발표 내용·Closing 문장 변경 금지. 미구현 기능 추가 주장 금지.
