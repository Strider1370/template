# 자산 라이선스 및 출처 (ASSET_LICENSES)

> Doc2 §4·§19.2. 외부 Slidev 템플릿·폰트·아이콘·이미지의 **사용/수정/배포 가능 여부**를 기록한다.
> 참고 캡처는 시각 기준으로만 쓰고 최종 슬라이드에 그대로 삽입하지 않는다.
> 기계 판독용 메타는 `provenance.json` 참조.

## 디자인 / 테마

| 자산 | 출처 | 라이선스 | 사용 범위 | 비고 |
|------|------|----------|-----------|------|
| propca-notion-style 테마 | github.com/procpalee/Marp_Templates | 원저자 라이선스 미명시 | 해커톤 참고/사용 | 재배포 시 출처 확인 권장. `theme/notion/tokens.css` 시드로 토큰만 추출. |
| Notion DESIGN.md (브랜드 언어 참조) | VoltAgent/awesome-design-md | MIT | 사용/수정/배포 가능 | 디자인 원칙 참조 |

## 폰트

| 폰트 | 출처 | 라이선스 | 비고 |
|------|------|----------|------|
| Pretendard | orioncactus/pretendard | OFL-1.1 | 본문 기본 |
| Noto Sans KR | Google Fonts | OFL-1.1 | 한글 폴백 |
| Inter | Google Fonts | OFL-1.1 | 라틴 |
| Fraunces | Google Fonts | OFL-1.1 | 세리프 강조 |

> ⚠️ 오프라인 발표(Doc2 §17 #10): 위 폰트는 CDN 의존이 아니라 **로컬 번들**로 가져와야 인터넷 없이 깨지지 않는다. (현재 propca 원본은 CDN @import — 정적 HTML 백업 만들 때 로컬화 필요.)

## 아이콘

| 세트 | 출처 | 라이선스 | 비고 |
|------|------|----------|------|
| Carbon | @iconify-json/carbon | Apache-2.0 | slidev 의존성에 포함 |
| Phosphor (ph) | @iconify-json/ph | MIT | |
| Twemoji | @iconify-json/twemoji | CC-BY-4.0 | 출처표기 필요 |

## 참고 캡처

| 자산 | 출처 | 라이선스 | 사용 범위 |
|------|------|----------|-----------|
| BaizeAI KubeCon 덱 | slidev/reference-capture/RECIPE.md 링크 | Apache-2.0 | **시각 기준만** — 최종 슬라이드 삽입 금지 |

## TODO (실사용 시 채울 것)
- [ ] 당일 추가한 외부 이미지/스크린샷/녹화의 출처·라이선스
- [ ] 데모 화면 캡처(자체 제작 → 팀 소유)
- [ ] 외부 URL 자산을 로컬 복사했는지 체크(Doc2 §17 #9)
