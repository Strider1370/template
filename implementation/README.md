# implementation/ — 구현 상태 매니페스트

`manifest.json`은 **각 기능이 실제로 어떤 상태인지**를 구조화한 단일 진실 소스다.
Stage 06(통합)에서 채우고, Stage 08(스크립트)·09(발표)가 **필수 입력**으로 읽는다.
목적: 발표가 실제 구현과 어긋나지 않게 하는 것. 구현되지 않은 기능을 발표에서 확정적으로 주장하지 않는다.

## status 5단계 의미

| status | 의미 | 발표에서의 취급 |
|---|---|---|
| `implemented` | 실제로 동작한다 | 확정적으로 시연/주장 가능 |
| `mocked` | UI·흐름은 있으나 내부는 가짜 데이터 | mock임을 흐리지 말 것. 완전 구현처럼 말하지 않는다 |
| `fallback` | 실시간/외부 연동 대신 정적 백업으로 동작 | 폴백으로 동작 중임을 명시 |
| `dropped` | 시간 부족 등으로 범위에서 제외 | **발표에 넣지 않는다** |
| `blocked` | 외부 의존(키·차단 등)으로 막힘 | 남은 위험으로 기록, 확정 주장 금지 |

## Stage별 사용

- **Stage 06 (통합):** 통합 후 모든 기능의 status를 여기에 기록한다. `spec.md`와 구현의 차이도 notes에 남긴다.
- **Stage 08 (스크립트):** `implemented`(및 허용된 `mocked`/`fallback`)만 스크립트에 넣는다. `dropped`/`blocked`는 확정 주장 금지.
- **Stage 09 (발표 생성):** 슬라이드의 데모 주장은 이 파일 status와 일치해야 한다. mocked/fallback을 완전 구현처럼 표현하지 않는다.

## 구조 (`manifest.json`)

```json
{
  "version": 1,
  "features": [
    { "id": "feature-01", "name": "...", "status": "implemented", "notes": "...", "demoPath": "demo/demo.scenario.yaml#step-1" }
  ]
}
```

- `id`: 안정적 식별자 (feature-01 …)
- `name`: 기능 이름
- `status`: 위 5단계 enum 중 하나
- `notes`: 상태 근거 / 폴백·막힌 이유
- `demoPath`: 데모 시나리오의 어느 단계에서 보이는지 (`demo/demo.scenario.yaml` 참조)

> ⚠️ 개인정보: fixture/데모 데이터는 가상 페르소나·익명만 사용한다.
