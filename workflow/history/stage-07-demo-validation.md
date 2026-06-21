<!-- Handoff 보고서 (자동 생성: npm run workflow:handoff). 기계가 채운 부분 + <!-- 직접 채우기 --> 2~3곳만 사람이 보강. -->
# Stage 07 완료 보고 — demo-validation

## 단계
Stage 7 — demo-validation

## 시작 시각 / 종료 시각 / 사용 시간
- 시작: 2026-06-20T14:59:05.049Z
- 종료: 2026-06-20T15:03:17.796Z
- 사용: 4.2분 (예산 15분)

## 완료한 내용
- Playwright(chromium headless) 캡처 스크립트(demo/capture.mjs)로 지급명령 핵심경로 **2회 완주** + assertion.
- 결과: PASS — firstStep '이의신청'+'2주/14일', source-badge href 화이트리스트(easylaw) 양 회차 충족. Wow(guide-card 안 source-badge) 캡처.
- 단계별 스크린샷 6장(run1/run2 ×3) + demo/validation-report.md 작성.

## 생성·수정한 파일
- demo/capture.mjs, demo/validation-report.md, demo/run1-0{1,2,3}.png, demo/run2-0{1,2,3}.png
- (Stage06 잔여) implementation/manifest.json, web/lib/catalog.ts·llm.ts, web/next.config.mjs, package.json(playwright devDep)

## 서브에이전트 실행 결과
- 메인이 Playwright로 직접 검증(사람 1차 확인 = Wow 캡처 육안). 데모 검증 교차검토는 클로드 리뷰어 폴백.

## Gate 결과
- 명령: npm run gate:demo → **PASS** (demo.scenario.yaml + 스크린샷 6장 존재)
- LLM Review: 클로드 리뷰어 폴백 → **PASS-with-warnings**. Wow 2회 재현·캡처·assertion 증명, 미검증 기능 둔갑 없음 확인. 반영: step4(즉석 입력) 자동검증 추가(건강보험 즉석→새 카드, run3-impromptu.png), href 검사 호스트 정확매칭, 리포트에 LLM 변동성 주의 추가.

## 사용자 결정
승인 불필요

## 적용한 폴백
- 교차검토: codex 미작동 → 클로드 리뷰어.
- 라이브 실패 대비: 단계별 스크린샷 6장을 발표 백업으로 확정(영상 미제작, 지침대로).

## 남아 있는 위험
- assertion은 LLM 출력 의존 구간(firstStep 문구) — 2회 재현됐으나 발표 라이브 시 모델 변동 가능. 백업 스크린샷으로 보완.
- 검증 범위 = 지급명령 텍스트 경로. 사진(비전)·"내 주변 라이브"는 미검증(키/권한 의존) → 발표 단정 시연 금지(manifest와 동일).

## 확정된 계약
- 데모 핵심경로 PASS(2회) = 발표 기준. Wow = guide-card 안 source-badge(run1-03-wow.png).

## 다음 단계가 읽어야 할 파일
- demo/validation-report.md, demo/run1-03-wow.png, implementation/manifest.json, concept.md, spec.md, workflow/stages/08-script.md, docs/AI_Hackathon_Operating_System.md (7·8 Stage 08 섹션)

## 다음 단계에서 하지 말아야 할 것
<!-- 직접 채우기. -->
-

## 체크포인트
- HEAD: 314278a
