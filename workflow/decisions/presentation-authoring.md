# 발표 카피 작성 방식 — "사람이 카피라이터, AI가 편집·배치" (사용자 결정 2026-06-21)

> Stage 08(script)·09(presentation-generation) 진입 시 **반드시 이 문서를 먼저 읽고** 이 방식대로 진행한다.
> 기본 동작("AI가 카피를 다 쓰고 사람이 검수")을 **역전**한다: 화면에 박히는 카피는 사람이 쓰고, AI는 구조·배치·렌더·안전점검만 한다.

## 0. 왜 (배경)
사용자: "AI가 만드는 발표 문구가 오글거리고 이상하다. 내가 직접 넣고 싶다."
→ 화면 카피의 **저작권을 사람에게 넘기고**, AI는 카피를 침범하지 않는다.

## 1. 두 층 구분 (어디를 사람이 쓰나)
- **① 화면에 박히는 글 = `presentation/deck.json`의 슬롯** (제목·콜아웃·불릿 등). ← **사람이 쓴다. 오글거림의 본진.**
- **② 말로 하는 대본 = `presentation/script.md` 스피커 노트.** ← AI 초안 허용(애드립 가능). 단 톤 가이드는 적용.

## 2. 채택안 — "AI 초안 + 사람 덮어쓰기 + 잠금"
> 빈칸이 아니다. **AI가 초안을 다 채워두고**, 사용자는 마음에 안 드는 칸만 갈아끼운다. 손 안 댄 칸은 AI 초안이 그대로 남는다.

### (a) AI가 초안을 채운 양식을 깐다 — Stage 09
- AI는 구조(슬라이드 수·`semanticLayout`·슬롯·**슬롯별 글자 수 한도**)를 정하고, **각 슬롯에 tone-guide 적용 초안을 채워 넣는다.**
- 산출물 `presentation/copy.md`(사람 검토·수정용) — 슬롯마다 AI 초안 + 수정 자리. 예:
  ```
  slide-03 (hero)
    title     [≤22자] | AI초안: 신청서 3장, 30초에 끝   | 내수정:
    subtitle  [≤40자] | AI초안: 복지 신청, 더 안 헤매게  | 내수정:
  slide-04 (demo-callout)
    title     [≤20자] | AI초안: 실제로 돌려보면         | 내수정:
    callout   [≤30자] | AI초안: 사진 한 장이면 자동 분류 | 내수정:
  ```
  → 사용자는 "내수정:" 칸에 **고치고 싶은 것만** 적는다. 비워두면 AI초안 채택.
- 슬롯 이름은 `presentation/generator/layout-registry.json` 기준 (hero=eyebrow/title/subtitle/footnote, demo-callout=title/callout/points, big-number=label/number/caption, insight-statement=title/subtitle, closing=title/subtitle/cta/tags/contact 등).

### (b) 사용자가 문구를 주는 3통로 (조합 가능)
- **A. 채팅 주소 지정**: "slide-03 title을 '○○'로." → AI가 `deck.json`의 해당 필드만 고침.
- **B. 편집 오버레이 클릭**: 렌더 후 `?edit=1`에서 슬롯 클릭→주소 복사(`slide-04.content.callout`)→채팅에 붙여+새 문구.
- **C. `copy.md` 직접 편집**: 양식 빈칸을 한꺼번에 채움 → AI가 deck.json에 반영.

### (c) 잠금 — 사람 카피 보호 (핵심)
- 사용자가 **고친/지정한 슬롯만** `deck.json`에서 **`"authoredBy": "user"`(또는 `"locked": true`)** 로 표시.
- 손 안 댄 슬롯은 `authoredBy:ai` — AI 초안 유지, AI가 이후 다듬어도 됨.
- 잠긴(user) 슬롯은 AI 재렌더/재생성이 **글자를 절대 안 바꾼다.** 배치·렌더만. 잠긴 칸에 대한 AI의 유일한 행동 = **경고**(아래 §3).

## 3. AI가 유지하는 안전망 (잠금돼 있어도 침범 아님 — 경고만)
- **오버플로우 경고**: 사람이 쓴 글이 슬롯 글자수/박스를 넘치면 "넘침 — 줄일지?" 알림(자동 삭제 X).
- **허위주장 경고**: `implementation/manifest.json`에 없는 기능을 카피가 주장하면 경고(해커톤 규칙: 미구현 발표 금지).
- 둘 다 **사용자에게 묻고**, 사용자가 결정. AI가 임의로 카피를 고치지 않는다.

## 4. 톤 가이드 (오글거림 예방) — 채택
- 파일: `presentation/tone-guide.md` (시작본 존재). **Stage 02 승인 후** 프로젝트 목소리에 맞게 한 번 더 다듬는다.
- Stage 08(script)·09(deck.json) 작성 시 AI는 이 가이드를 적용해 **초안부터 덜 오글거리게** 쓴다.
- 사람이 잠근 슬롯은 톤 가이드 위반이어도 AI가 고치지 않는다(사람 결정 우선).

## 5. 적용 지점 요약
- **Stage 08**: script.md 작성 시 `tone-guide.md` 적용. 화면 카피는 여기서 확정하지 않음(09에서 사람이).
- **Stage 09**: deck.json 뼈대 + `copy.md` 빈칸 양식 생성 → 사람 입력(A/B/C) → 잠금 → 렌더 → 오버플로우/허위 경고 루프.

## 6. 아직 구현 안 된 것 (Stage 09에서 만들 것)
- `copy.md` 양식 자동 생성, deck.json `authoredBy/locked` 플래그를 렌더러·검증이 존중하게 하는 처리.
- (지금은 Stage 00 — 여기선 "방식 결정"만 기록. 실제 도구화는 Stage 09에서.)
