# Claude Code 작업 지침서 v1.2
## Stage-Based Workflow 정렬판
## P0·P1 정합성 보강판
## Notion HTML + Slidev 연계형 AI 발표자료 생성 시스템

---

# 0. 문서의 역할

이 문서는 전체 해커톤 워크플로우를 정의하지 않는다.

이 문서는 `CLAUDE_Stage_Based_Workflow_Engine_Guide.md`가 정의한 단계 중, 발표자료 관련 단계에서만 읽는 **전문 구현 지침**이다.

상위 기준:

```text
실행 순서·상태·Gate·Handoff
→ Stage-Based Workflow Engine Guide

발표 엔진·템플릿·레이아웃·스타일·렌더링
→ 이 문서
```

이 문서는 다음 Stage에서만 상세히 읽는다.

```text
Stage 05 — 발표 초안과 placeholder
Stage 08 — 실제 구현 기반 발표 스크립트
Stage 09 — Scene / Deck / Slidev / Static HTML 생성
Stage 10 — 발표자료 기술·시각 검증
Stage 11 — 리허설 피드백 반영
```

다른 Stage에서는 이 문서 전체를 읽지 않는다.

이 문서는 `stages.yaml.guidance.sections`에 지정된 섹션만 읽는다.

- Stage 05: 초안·placeholder 관련 섹션
- Stage 08: 실제 구현 기반 script 동기화 섹션
- Stage 09: Scene·Deck·렌더링 섹션
- Stage 10: 검증 섹션
- Stage 11: 리허설 반영 섹션

`workflowMode=bootstrap`일 때만 템플릿 분석·이식 작업을 수행한다.  
`workflowMode=run`에서는 기존 registry와 theme을 사용해 현재 발표를 생성한다.

---

# 1. 최종 목표

사용자가 보유한 다음 자산을 재사용한다.

- Notion 스타일 HTML 템플릿
- Slidev 템플릿
- Slidev 스타일 파일
- 커스텀 레이아웃
- Vue 컴포넌트
- 참고 발표자료 캡처
- 실제 앱 캡처
- 발표 스크립트

최종 생성 흐름:

```text
presentation/script.md
→ presentation/scenes.json
→ presentation/deck.json
→ presentation/slides.md
→ Slidev build
→ 정적 HTML 백업
→ 자동 캡처 및 검증
```

AI가 매번 HTML/CSS를 자유 생성하지 않는다.

```text
사람이 만든 템플릿과 스타일을 보존
→ AI가 Scene 목적을 해석
→ 등록된 레이아웃 선택
→ 슬롯에 내용과 자산 삽입
→ 렌더러가 결과 생성
```

---

# 2. 엔진과 디자인 우선순위

## 2.1 기본 엔진

```text
Primary engine:
Slidev
```

## 2.2 디자인 소스

```text
기존 Slidev 템플릿
+
Notion HTML 디자인 토큰
+
참고 슬라이드 캡처
```

## 2.3 백업 출력

```text
Fallback:
Notion 기반 정적 HTML
```

## 2.4 Reveal / Marp

자동 생성 기본 경로에서는 사용하지 않는다.

- 참고용
- 수동 대체용
- 기존 자료 호환용

Claude가 임의로 Reveal 또는 Marp를 기본 엔진으로 선택하지 않는다.

---

# 3. Stage별 적용 범위

## Stage 05 — 병렬 구현 중 발표 초안

목적:

구현 완료를 기다리지 않고 발표 구조를 병렬로 준비한다.

생성 가능:

```text
presentation/draft-outline.md
presentation/draft-layout-plan.json
presentation/assets/placeholders/
```

포함:

- Answer First
- Problem
- Insight
- Solution
- Demo placeholder
- Mechanism 후보
- Impact
- Closing
- 레이아웃 후보

금지:

- 구현되지 않은 기능을 최종 발표 내용으로 확정
- 실제 화면이 없는 상태에서 최종 `deck.json` 확정
- placeholder를 실제 제품 화면처럼 표현
- 최종 시간 배분 확정

Stage 05의 Presentation Agent는 `spec.md`의 확정된 내용을 바꾸지 않는다.

## Stage 08 — 발표 스크립트

목적:

실제 구현 상태를 기반으로 최종 스크립트를 작성한다.

필수 입력:

```text
spec.md
implementation/manifest.json
workflow/history/stage-06-integration.md
workflow/history/stage-07-demo-validation.md
presentation/draft-outline.md
실제 앱 캡처 목록
```

필수 산출물:

```text
presentation/script.md
presentation/qna.md
```

규칙:

- 구현되지 않은 기능 제거
- 실제 데모 전환 시점 명시
- 발표 시간 합계 기록
- 각 구간의 화면 의도 기록
- 데모와 Wow Moment에 최소 50% 시간 배정

## Stage 09 — 발표자료 생성

Stage 09 Gate는 생성 계약만 검증한다.

검사:

- `scenes.json` Schema
- `deck.json` Schema
- semantic layout 매핑
- `slides.md` 생성
- Slidev build 성공
- Static HTML 생성

목적:

스크립트를 Scene으로 분해하고 등록된 템플릿을 사용해 최종 발표자료를 생성한다.

필수 산출물:

```text
presentation/scenes.json
presentation/deck.json
presentation/slides.md
presentation/output/slidev/
presentation/output/static/presentation.html
```

## Stage 10 — 발표자료 검증

Stage 10 Gate는 시각·출력 품질을 검증한다.

검사:

- overflow
- 깨진 자산
- 글자 크기
- 데모 화면 비율
- 레이아웃 반복
- 캡처 생성
- 발표 시간
- reference recipe 비교
- PDF export 성공

목적:

기술적·시각적 오류를 검출한다.

필수 산출물:

```text
presentation/output/captures/
presentation/output/validation-report.md
```

## Stage 11 — 리허설 반영

목적:

실제 낭독 시간, 데모 전환, 백업 전환을 기준으로 최종 수정한다.

허용:

- 문장 압축
- 슬라이드 제거
- 순서 조정
- 레이아웃 교체
- 이미지 확대
- 백업 동작 보완

금지:

- 리허설 단계에서 새로운 핵심 기능 추가
- 최종 Insight 변경
- 구현되지 않은 내용 추가

---

# 4. 원본 자산 보존

원본 파일을 직접 덮어쓰지 않는다.

```text
presentation/
└── sources/
    ├── notion-original/
    ├── slidev-original/
    └── reference-capture/
```

원본 자산은 분석과 추출에만 사용한다.

수정 가능한 결과물은 다음 경로에 둔다.

```text
presentation/theme/
presentation/generator/
presentation/slides.md
presentation/output/
```

---

# 5. 무단 재디자인 금지

Claude는 기존 템플릿을 임의로 다른 디자인으로 바꾸지 않는다.

금지:

- 새 컬러 팔레트 임의 생성
- 다른 폰트 임의 도입
- 원본과 무관한 카드 스타일
- 불필요한 그라디언트
- 과도한 글로우
- 슬라이드마다 다른 CSS 생성
- 캡처와 관계없는 새로운 시각 언어

허용:

- 발표 가독성을 위한 폰트 크기 조정
- 16:9에 맞춘 간격 조정
- 반복 가능한 레이아웃 정리
- 슬롯화
- 스타일 토큰화
- 컴포넌트화
- 접근성 및 overflow 수정

---


## 5.1 CSS 적용 우선순위

충돌 시 다음 순서를 따른다.

```text
1. Slidev engine base
2. 기존 Slidev template base
3. Notion design tokens
4. Notion component adaptation
5. project-specific overrides
6. emergency text-fit overrides
```

금지:

- 슬라이드별 inline style로 충돌 해결
- `!important` 남용
- 같은 역할의 스타일을 여러 파일에 중복 정의

# 6. 목표 저장소 구조

```text
presentation/
├── AGENTS.md
├── draft-outline.md
├── draft-layout-plan.json
├── script.md
├── qna.md
├── scenes.json
├── deck.json
├── slides.md
│
├── sources/
│   ├── notion-original/
│   ├── slidev-original/
│   ├── ASSET_LICENSES.md
│   ├── provenance.json
│   └── reference-capture/
│       ├── shots/
│       ├── RECIPE.md
│       └── manifest.json
│
├── theme/
│   ├── notion/
│   │   ├── tokens.css
│   │   ├── typography.css
│   │   ├── components.css
│   │   └── theme.json
│   └── slidev/
│       ├── styles/
│       ├── layouts/
│       ├── components/
│       └── theme-entry.ts
│
├── generator/
│   ├── layout-registry.json
│   ├── engine-registry.json
│   ├── generate-scenes.mjs
│   ├── select-layouts.mjs
│   ├── generate-slidev.mjs
│   ├── generate-static-html.mjs
│   ├── validate-deck.mjs
│   ├── validate-slides.mjs
│   └── utils/
│
├── assets/
│   ├── screenshots/
│   ├── recordings/
│   ├── images/
│   ├── icons/
│   └── charts/
│
└── output/
    ├── slidev/
    ├── static/
    ├── captures/
    └── validation-report.md
```

---

# 7. 템플릿 인벤토리

템플릿 분석은 초기 구축 시 1회 수행하고, 자산이 추가될 때 갱신한다.

## 7.1 Notion HTML 분석

추출:

- 폰트
- 크기 체계
- 행간
- 배경색
- 카드색
- 강조색
- 경계선
- 그림자
- radius
- 섹션 여백
- 표
- 인용문
- 이미지 프레임
- 헤더/푸터

산출물:

```text
presentation/theme/notion/tokens.css
presentation/theme/notion/typography.css
presentation/theme/notion/components.css
presentation/theme/notion/theme.json
```

## 7.2 Slidev 템플릿 분석

목록화:

- 모든 layout 이름
- 각 layout의 slot
- 커스텀 component
- 글로벌 CSS
- UnoCSS/Tailwind 설정
- 전환 효과
- 애니메이션
- 아이콘
- 발표자 노트
- build/export 명령

산출물:

```text
presentation/sources/slidev-original/README.md
presentation/generator/layout-registry.json
```

## 7.3 참고 캡처 분석

각 캡처를 다음 기준으로 분류한다.

- semantic role
- 화면 구성
- 제목 위치
- 텍스트 밀도
- 이미지 비율
- 카드 수
- 강조 방식
- 배경 유형
- 시각적 강도
- 반복 가능한 레이아웃 여부

캡처는 최종 발표에 그대로 삽입하지 않는다.  
레이아웃·밀도·리듬의 품질 기준으로만 사용한다.

---

# 8. 공통 Semantic Layout

AI는 실제 Slidev layout 이름을 먼저 고르지 않는다.

다음 공통 ID 중 하나를 고른다.

```text
hero
problem-flow
contrast
insight-statement
product-overview
demo-fullscreen
demo-callout
architecture
before-after
big-number
card-grid
timeline
quote
limitation-guardrail
expansion-map
closing
```

이후 엔진별 실제 구현으로 매핑한다.

```json
{
  "semanticId": "contrast",
  "renderers": {
    "slidev": "two-cols",
    "notion-html": "notion-two-column"
  }
}
```

등록되지 않은 semantic layout을 임의로 만들지 않는다.

---

# 9. 중간 데이터 계약

## 9.1 `scenes.json`

발표 스크립트를 시각 장면으로 분해한 파일이다.

```json
{
  "version": 1,
  "title": "프로젝트명",
  "totalDurationSeconds": 300,
  "scenes": [
    {
      "id": "scene-01",
      "role": "answer-first",
      "durationSeconds": 20,
      "message": "가족 상황에 맞는 행동계획을 30초 안에 생성한다.",
      "script": "저희는...",
      "visualIntent": "첫 5초 안에 서비스 가치를 이해시킨다.",
      "contentType": "hero-message",
      "requiredAssets": []
    }
  ]
}
```

## 9.2 `deck.json`

Slidev와 정적 HTML이 함께 사용하는 단일 계약이다.

```json
{
  "version": 1,
  "meta": {
    "title": "프로젝트명",
    "engine": "slidev",
    "theme": "notion-slidev",
    "aspectRatio": "16:9",
    "language": "ko"
  },
  "slides": [
    {
      "id": "slide-01",
      "sceneId": "scene-01",
      "role": "answer-first",
      "semanticLayout": "hero",
      "engineLayout": "cover",
      "referenceCapture": "ref-01",
      "content": {
        "eyebrow": "AI 생활안전 서비스",
        "title": "내 가족에게 필요한 행동만, 30초 안에",
        "subtitle": "지역과 가족 구성에 맞는 재난 행동계획"
      },
      "assets": {},
      "speakerNotes": "저희는...",
      "durationSeconds": 20
    }
  ]
}
```

두 엔진용 내용을 별도로 작성하지 않는다.

---

# 10. 레이아웃 선택

선택 방식:

```text
규칙 기반 우선
+
AI 보조
```

기본 규칙:

```text
answer-first → hero
closing → closing
demo → demo-fullscreen
demo + wowMoment → demo-callout
mechanism → architecture
insight + assumption/reality → contrast
insight + strong statement → insight-statement
impact + process comparison → before-after
impact + verified number → big-number
limitation / guardrail → limitation-guardrail
expansion → expansion-map
```

후보가 여러 개일 때 고려:

- 메시지 길이
- 비교 구조
- 숫자 존재
- 이미지 존재
- 이전 슬라이드 레이아웃
- 반복 여부
- 시각적 강도
- 참고 캡처 적합성
- 슬롯 제한

선택 이유를 `deck.json` 또는 별도 로그에 기록한다.

---

# 11. Slidev 생성 규칙

`deck.json`을 읽어 `presentation/slides.md`를 생성한다.

우선순위:

```text
기존 layout
→ 기존 component
→ 기존 style class
→ 필요한 최소 확장
```

금지:

- 슬라이드별 독립 CSS 대량 생성
- 기존 컴포넌트와 같은 기능의 중복 컴포넌트 생성
- 템플릿의 시각 정체성을 바꾸는 수정

발표자 노트는 반드시 포함한다.

실제 앱 캡처가 있으면 placeholder나 목업보다 우선한다.

`implementation/manifest.json`에서 상태가 `implemented`가 아닌 기능은 실제 구현처럼 표현하지 않는다.

- `mocked`: 목업 또는 시뮬레이션임을 표시
- `fallback`: 폴백 모드임을 표시
- `dropped` / `blocked`: 발표에서 제거

---

# 12. Notion Static HTML 생성 규칙

목적:

- Slidev build 실패 대비
- 오프라인 발표
- 단일 HTML 전달
- 최소 기능 백업

지원 우선 semantic layout:

```text
hero
contrast
card-grid
demo-fullscreen
before-after
limitation-guardrail
closing
```

정적 HTML도 동일한 `deck.json`을 사용한다.

---

# 13. 캡처 레퍼런스 활용

참고 캡처의 역할:

- 레이아웃 선택
- 텍스트 밀도
- 제목 크기
- 여백
- 이미지 비율
- 카드 개수
- 시각 리듬

생성 결과를 다시 캡처해 다음을 검토한다.

- 원본과 비슷한 여백인가?
- 제목 크기가 지나치게 작지 않은가?
- 카드 밀도가 비슷한가?
- 색상 사용이 일관적인가?
- 강조색이 과하지 않은가?
- 이미지가 충분히 큰가?
- 텍스트가 과도하지 않은가?

픽셀 단위 복제가 아니라 동일한 디자인 언어 유지가 목표다.

---

# 14. Stage 10 검증 기준

## 14.1 Mechanical Gate

- Slidev build 성공
- 모든 layout 존재
- 필수 slot 존재
- 모든 자산 경로 정상
- 이미지 404 없음
- JS 오류 없음
- speaker notes 존재
- 총 발표 시간 제한 이내
- overflow 없음

## 14.2 Visual Review Gate

- 동일 layout 3장 연속 사용 경고
- 제목 3줄 초과 경고
- 본문 과다 경고
- 스크립트 전체 복사 경고
- 데모 이미지가 화면의 60% 미만이면 경고
- 강조색 과다 경고
- 원본 recipe와 다른 폰트 경고
- 정보 밀도 과다 경고
- 실제 구현 화면 대신 목업만 사용한 경우 경고

## 14.3 산출물

```text
presentation/output/validation-report.md
presentation/output/captures/slide-01.png
presentation/output/captures/slide-02.png
...
```

---

# 15. 서브에이전트 권한

## Stage 05 Presentation Agent

읽기:

```text
spec.md
plan.md
presentation 관련 task contract
```

쓰기:

```text
presentation/draft-outline.md
presentation/draft-layout-plan.json
presentation/assets/placeholders/
```

수정 금지:

```text
spec.md
workflow/state.yaml
공통 package.json
최종 scenes.json
최종 deck.json
```

## Stage 09 Presentation Agent

읽기:

```text
spec.md
presentation/script.md
demo validation report
layout registry
reference manifest
```

쓰기:

```text
presentation/scenes.json
presentation/deck.json
presentation/slides.md
presentation/output/
```

최종 Insight나 제품 범위를 변경할 권한은 없다.

---

# 16. 자동 명령어

```json
{
  "scripts": {
    "presentation:analyze-templates": "node presentation/generator/analyze-templates.mjs",
    "presentation:scenes": "node presentation/generator/generate-scenes.mjs",
    "presentation:layouts": "node presentation/generator/select-layouts.mjs",
    "presentation:slidev": "node presentation/generator/generate-slidev.mjs",
    "presentation:static": "node presentation/generator/generate-static-html.mjs",
    "presentation:validate": "node presentation/generator/validate-slides.mjs",
    "presentation:export-pdf": "slidev export presentation/slides.md --output presentation/output/presentation.pdf",
    "presentation:build": "npm run presentation:scenes && npm run presentation:layouts && npm run presentation:slidev",
    "presentation:build-all": "npm run presentation:build && npm run presentation:static && npm run presentation:validate && npm run presentation:export-pdf"
  }
}
```

Stage-Based Workflow의 Gate 명령이 이 명령들을 호출하도록 연결한다.

---

# 17. Hard Rules

1. 원본 템플릿을 덮어쓰지 않는다.
2. 등록되지 않은 layout을 임의로 생성하지 않는다.
3. 기존 style과 component를 먼저 재사용한다.
4. 참고 캡처를 최종 발표에 그대로 삽입하지 않는다.
5. 발표 스크립트를 슬라이드에 그대로 복사하지 않는다.
6. AI가 CSS를 매 슬라이드마다 새로 생성하지 않는다.
7. Slidev build 실패 결과를 완료 처리하지 않는다.
8. 실제 앱 캡처가 있으면 목업보다 우선한다.
9. 외부 URL 자산은 로컬로 복사한다.
10. 인터넷 없이 발표 가능해야 한다.
11. Stage 05 초안을 최종 덱으로 취급하지 않는다.
12. Stage 09 Presentation Agent가 Insight나 제품 범위를 바꾸지 않는다.
13. Reveal/Marp를 자동 생성 기본 엔진으로 선택하지 않는다.
14. `deck.json`을 엔진별로 중복 작성하지 않는다.
15. Stage 10 검증 보고서 없이 발표자료를 완료 처리하지 않는다.

---

# 18. 최종 요약

이 문서는 다음 질문에 답한다.

```text
발표자료를 어떤 엔진과 템플릿으로, 어떤 계약을 통해, 어떻게 생성하고 검증하는가?
```

Stage-Based Workflow Engine은 다음을 결정한다.

```text
언제 이 문서를 읽고, 어떤 Stage에서 어떤 산출물을 만들며, 언제 다음 단계로 이동하는가?
```

발표 구현 방식은 이 문서를 따르되, 실행 순서와 상태 전환은 항상 Stage-Based Workflow Engine을 우선한다.


---

# 19. P1 운영 안정성 규칙

## 19.1 영상 백업

필수:

```text
demo.webm 또는 demo.mp4 중 하나
```

선택:

```text
demo.gif
```

GIF 변환 실패는 전체 발표 Gate 실패로 처리하지 않는다.

## 19.2 자산 라이선스와 출처

다음을 유지한다.

```text
presentation/sources/ASSET_LICENSES.md
presentation/sources/provenance.json
```

외부 Slidev 템플릿, 폰트, 아이콘, 이미지의 사용·수정·배포 가능 여부를 기록한다.

참고 캡처는 시각 기준으로만 사용하고 최종 슬라이드에 그대로 삽입하지 않는다.

## 19.3 부분 재실행

Stage 09와 Stage 10 산출물은 임시 경로에 먼저 생성할 수 있다.

```text
workflow/tmp/stage-09/
workflow/tmp/stage-10/
```

Gate 성공 후 `presentation/`과 `presentation/output/`에 반영한다.

Stage 10 실패 시 Stage 09 전체를 다시 만들지 말고, 실패한 슬라이드와 관련 자산만 수정한다.

## 19.4 출처 기반 발표

검증 가능한 문제 주장과 수치는 `research/sources.json`의 source ID와 연결한다.

`deck.json`에 선택적으로 다음을 기록한다.

```json
{
  "claimIds": ["problem-01"],
  "sourceIds": ["source-03"]
}
```
