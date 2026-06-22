# modules/ — 단계별 드롭인 번들

해커톤 워크플로우(13단계)를 무게/시점별로 쪼갠 **복사본 묶음**이다.
원본(`web/`·`data/`·`presentation/` 등 루트)은 그대로 있고, 여기엔 사본만 둔다.

## 왜 나눴나
시작 시점(기획·리서치)엔 무거운 코드/데이터가 필요 없다. 무거운 54MB(`data` 41.7 + `web` 9.8 + `presentation` 2.3)는 **그 단계에 와서 투입**해도 빌드가 안 깨진다 — `web/`·`presentation/`이 각각 독립 프로젝트라서.

## 구성

| 폴더 | 용량 | 언제 | 내용 |
|---|---|---|---|
| `0-base/` | ~0.3MB | **항상(처음부터)** | CLAUDE·README·CHECKLIST · reference 6 · data/INDEX·data-sources · research · scripts · package.json |
| `2-build/` | ~51MB | 모듈2(빌드)부터 | `web/` · 무거운 `data/`(snapshots·boundaries·welfare·scripts) · `design/`(KRDS) |
| `3-present/` | ~3MB | 모듈3(발표)부터 | `presentation/`(Slidev 전체) · `docs/`(예시 이미지) |
| `4-deploy/` | 안내문 | 모듈4(배포) | 새 무거운 자산 없음 — 모듈2의 `web/`를 재사용. `4-deploy/README.md` 참고 |

> 모듈1(기획·리서치)은 무거운 자산이 없어 `0-base/`만으로 진행한다(reference 01·02 사용).

## "넣는" 방식 — 루트 원위치로 복원
번들은 **루트의 원래 경로로 되돌려야** 동작한다(예: `web`는 런타임에 `../data/snapshots`를 읽음).

```powershell
# 모듈2 시작할 때 (빌드 자산 투입)
Copy-Item modules\2-build\web    web    -Recurse -Force
Copy-Item modules\2-build\data\* data\  -Recurse -Force   # snapshots/boundaries/welfare 복원
Copy-Item modules\2-build\design design -Recurse -Force
cd web; npm install              # node_modules는 안 들고 다니므로 1회 설치

# 모듈3 시작할 때 (발표 도구 투입)
Copy-Item modules\3-present\presentation presentation -Recurse -Force
cd presentation\slidev; npm install
```

## 주의
- **web + data는 함께** 투입(검색 API가 `../data/snapshots`를 읽는다).
- `design/krds`는 web 런타임 의존이 아니라 **참고/스타일 자산**이다(web은 `@krds-ui/*` npm 플러그인 사용).
- 번들에 `node_modules`는 없다 — 투입 후 각 프로젝트에서 `npm install` 1회.
