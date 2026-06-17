# Stage 09 — Presentation Generation (발표자료 생성)

## 1. 목적
스크립트를 `scenes.json → deck.json → slides.md → Slidev build → 정적 HTML 백업`으로 변환한다. 기존 layout/component를 우선 쓰고, 실제 앱 캡처를 삽입하며, speaker notes를 포함한다.

## 2. 시작 조건
- Stage 08 Gate 통과, `presentation/script.md` 존재.

## 3. 이번 단계에서 반드시 읽을 파일
- `presentation/script.md`, Stage 07 캡처/영상, `implementation/manifest.json`
- guidance: `docs/CLAUDE_Notion_Slidev_Integration_Guide.md` §8 "공통 Semantic Layout", §9 "중간 데이터 계약", §10 "레이아웃 선택", §11 "Slidev 생성 규칙", §12 "Notion Static HTML 생성 규칙". 이 섹션만.

## 4. 이번 단계에서 읽지 않아도 되는 파일
- 리서치 원문, AI_Hackathon_OS의 사고기준 섹션, 무관한 구현 세부.

## 5. 필수 입력
- `presentation/script.md`. 없으면 시작하지 않는다.

## 6. 메인 에이전트의 역할
- 변환 파이프라인 실행: script.md → `presentation/scenes.json` → `presentation/deck.json` → `presentation/slides.md` → Slidev 빌드 → `presentation/output/`(정적 HTML 백업 포함).
- 기존 Slidev layout/component를 우선 사용(무단 재디자인 금지). CSS 우선순위(engine→template→Notion tokens→adaptation→overrides) 준수.
- 실제 앱 캡처(Stage 07 산출)를 삽입(placeholder 대체). speaker notes 포함.
- 킥(차별점)을 중심 슬라이드로, 벤치마킹 서사(해외 메커니즘 이식)를 함께 배치.

## 7. 병렬 서브에이전트 구성
- presentation-agent 1개(또는 메인 직접). 자산/캡처 처리가 크면 capture 보조 1개.

## 8. 각 서브에이전트의 작업 계약
- presentation-agent: `read`=[script.md, scenes/deck 계약 섹션, 캡처 경로], `write`=`presentation/`(slides·output·scenes·deck), `doNotWrite`=spec/plan/web 코드. 완료: Slidev 빌드 통과 + 정적 HTML 생성 + 캡처 삽입.

## 9. 생성해야 하는 산출물
- `presentation/scenes.json`, `presentation/deck.json`, `presentation/slides.md`, `presentation/output/`(Slidev 빌드 + 정적 HTML 백업).

## 10. 파일 소유권
- 메인/presentation-agent: `presentation/` 전체. web 코드·spec·plan은 건드리지 않음.

## 11. 제한 시간
- 20분. 초과 시 슬라이드 수를 줄이되(데모+킥 슬라이드 보존) 정적 HTML 백업은 반드시 생성.

## 12. 완료 조건
- slides.md + Slidev 빌드 산출 + 정적 HTML 백업 존재, 실제 캡처 삽입, speaker notes 포함.

## 13. 기계적 Gate (Mechanical)
- 명령: `npm run gate:presentation-generation`
- 분류: **enforced**. scenes/deck/slides 존재·파싱 + Slidev 빌드 산출 + 정적 HTML 존재를 실제 검사.

## 14. LLM Review Gate
- `npm run cross-review -- presentation/slides.md` (Codex 우선 → 클로드 폴백).
- 검토: 슬라이드가 script와 일치하는가, 무단 재디자인/placeholder 잔존 없는가, 킥 슬라이드 부각.

## 15. 사용자 승인 여부
- `humanApproval: false`.

## 16. 실패 시 폴백
- Slidev 빌드 실패 시 정적 HTML(단일 파일·안전) 백업으로 전환해 데모 발표를 보장. 캡처 없으면 fixture 화면 스크린샷으로 대체.

## 17. 다음 단계에 전달할 정보
- `presentation/slides.md`, `presentation/output/`(빌드·HTML) (Stage 10 검증 입력).

## 18. 금지 사항
- inline style·`!important` 남용으로 충돌 해결 금지.
- 미구현 화면을 캡처처럼 위조 금지.
- script에 없는 내용 추가 금지.

## 19. 단계 완료 보고 형식
- `workflow/templates/stage-report.md` → `workflow/history/stage-09-presentation-generation.md`.
