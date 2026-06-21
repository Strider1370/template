# 음성 입력 기능 — GPT Realtime 레퍼런스 (실제 구현 시 참고)

> 기능: 말로 양식 자동 채움 + 어르신 자연어 입력 보조 + 단계별 자격대화(양방향).
> 결정: **모델 `gpt-realtime-2`, reasoning effort `low`** (판정은 코드가 하므로 높은 추론 불필요).
> ⚠️ 모델 라인업은 자주 갱신 → 배포 직전 `https://developers.openai.com/api/docs/models`에서 정확한 ID 재확인.

## 0. 철칙 — AI는 듣고·말하고·값 뽑기 / 판정·계산은 코드
복지 자격 여부를 LLM이 자유 결정하면 안 됨(환각=사고). LLM은 **언어 이해 + 값 추출 + 대화**만, **자격 판정은 결정론적 코드**(규칙/결정트리)가 한다. = 키트의 "결정적 안전망" 원칙.

## 1. 모델
- **`gpt-realtime-2`** (reasoning `low`) — speech-to-speech, 128k 컨텍스트, 추론강도 조절. 음성↔음성 직결.
- 저지연/저가 필요 화면은 `mini` 변형 고려. 통역만 필요하면 `gpt-realtime-translate`.
- 한국어: 양호하나 보장 아님 → **실제 화자·실제 잡음으로 사전 테스트**.

## 2. 임시키(ephemeral key) — 브라우저 인증
- 진짜 `OPENAI_API_KEY`는 **브라우저에 절대 노출 금지**. 대신 **1분짜리 임시키** 사용(호텔 카드키 개념).
- 흐름: ① 앱 → 내 AWS 서버에 토큰 요청 → ② 서버(진짜 키 보관)가 OpenAI에서 임시키 발급 → ③ 앱에 전달 → ④ 앱이 임시키로 OpenAI Realtime에 **WebRTC 직접 연결**.
- 구현: 우리 서버(이미 `OPENAI_API_KEY` 보유)에 `/api/realtime-token` 라우트 하나 추가.

## 3. 연결 — WebRTC + Agents SDK
- 브라우저/모바일은 **WebRTC**(WebSocket 아님 — 그건 서버-서버용).
- 공식 SDK **`@openai/agents-realtime`**: `RealtimeAgent`(행동·도구) + `RealtimeSession`(연결·오디오·인터럽션·이력). `tool()`로 도구 정의.
- 참고 앱: github.com/openai/openai-realtime-agents

## 4. 양식 채우기 — 함수호출 + strict 스키마
- 필드별 작은 도구: `set_field(name, value)` + `get_missing_fields()` + `submit_application()`.
- 모든 도구 **`strict: true`** + JSON 스키마(enum) → 허용값에 딱 맞춰 채움(환각 방지). strict 규칙: 모든 object `additionalProperties:false`, 모든 property `required`(선택은 타입에 `null` 허용).
- UI는 **도구호출 이벤트 구독**해 입력칸 실시간 반영.
- 한 번에 한 값씩 보수적으로, 숫자·이름·금액 등 고정밀 값은 **도구 호출 전 read-back 확인**.

## 5. 양방향(단계별) 대화 베스트프랙티스
- **턴 감지: `semantic_vad` + `eagerness: low`** — 침묵이 아니라 내용으로 끝 판단 → 어르신 머뭇거림에 안 끊김. (빠른 응답 필요한 단계만 high.)
- **흐름은 코드 주도**: VAD 켜되 `turn_detection.create_response=false` → 코드가 결정트리 따라 `response.create`로 다음 질문 유도(자격 단계 진행을 코드가 운전).
- **바지인(끼어들기)**: WebRTC는 `output_audio_buffer.clear`로 미재생 오디오 제거.
- **확인은 out-of-band**(`conversation:"none"`)로 본 대화 오염 없이 검증/확인.

## 6. 접근성·정확도 (어르신/한국어)
- 이중 채널: 들은 값을 **화면 표시 + 음성 read-back** → 시각/청각 동시 확인 후 제출.
- 숫자·이름은 한 자리씩/철자로 재확인. 정정은 항상 되돌릴 수 있게.
- rapid-fire 질문 지양, 자연스러운 확인 대화.

## 7. ⚠️ APK(WebView) 마이크 권한 — 놓치면 데모날 실패
안드로이드 WebView 마이크는 **이중 권한**:
- 매니페스트: **`RECORD_AUDIO` + `MODIFY_AUDIO_SETTINGS`** (후자 없으면 권한 줘도 마이크가 WebView로 안 넘어감)
- **HTTPS 필수** (우리 `projectamo.co.kr` OK)
- 네이티브 `WebChromeClient.onPermissionRequest` **override**로 WebView 요청 승인
- Capacitor에서 `getUserMedia({audio:true})`가 매니페스트만으론 `NotAllowedError` 나는 사례 많음 → 위 작업 필수.

## 8. 데모 안전
- 발표장 소음·wifi 리스크 → **타이핑 폴백 + 녹화 백업** 필수. 핵심 1동작만 음성으로 시연.

## 9. 아키텍처 한 장
```
앱(React, PWA/WebView) ─getUserMedia─WebRTC─▶ gpt-realtime-2 (reasoning low)
   ▲ 임시키(1분)                                │ ① 음성이해 ② strict 도구로 값추출
AWS 서버(진짜 키 + 결정로직) ◀───────────────────┘   set_field / get_missing_fields
   ├─ /api/realtime-token (임시키 발급)
   ├─ check_eligibility(fields)  ← 자격판정 = 결정론적 코드 (LLM 아님)
   ├─ 번들 데이터 매칭 (data/INDEX.md, 키 불필요)
   └─ submit_application
```

## 10. 출처 (배포 전 재확인)
- 모델: https://developers.openai.com/api/docs/models/gpt-realtime-2 · https://developers.openai.com/api/docs/models
- WebRTC+임시키: https://developers.openai.com/api/docs/guides/realtime-webrtc
- 함수호출/strict: https://developers.openai.com/api/docs/guides/function-calling
- 대화/턴/인터럽션: https://developers.openai.com/api/docs/guides/realtime-conversations
- VAD: https://developers.openai.com/api/docs/guides/realtime-vad
- 프롬프트 가이드(엔티티 수집·read-back): https://developers.openai.com/cookbook/examples/realtime_prompting_guide
- 데이터 집약 앱(코드 vs LLM): https://developers.openai.com/cookbook/examples/data-intensive-realtime-apps
- Agents SDK 음성: https://openai.github.io/openai-agents-js/guides/voice-agents/quickstart/
- APK 마이크: https://github.com/ionic-team/capacitor/issues/6967
