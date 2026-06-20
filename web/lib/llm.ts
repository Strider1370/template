// web/lib/llm.ts — OpenAI(ChatGPT) Chat Completions 호출 헬퍼 (서버 전용)
//
// 키(OPENAI_API_KEY) 없으면 null → 호출부가 폴백(드롭다운/템플릿/기본문구)으로 동작.
// 모델은 OPENAI_MODEL 로 교체 (기본 gpt-4.1-mini, 비전 지원). gpt-5.x / o-시리즈는 파라미터가 달라
// 자동 대응(max_completion_tokens, temperature 미지정).
//
// 멀티모달: opts.image(dataURL 또는 https URL)을 주면 비전 경로로 동작한다(별도 OCR 엔진 없음).
// 비전 경로는 토큰·타임아웃을 상향한다(이미지+구조화 응답이 텍스트보다 무겁다).

const MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const ENDPOINT = 'https://api.openai.com/v1/chat/completions';

// gpt-5 계열·o 시리즈는 max_tokens 대신 max_completion_tokens, 커스텀 temperature 미지원.
const isNewGen = /^(gpt-5|o\d)/.test(MODEL);
// 비전 미지원이 명백한 모델(텍스트 전용 구형)일 때 이미지 입력 가드.
const VISION_BLOCKLIST = /(gpt-3\.5|text-|davinci)/i;
export const modelSupportsVision = !VISION_BLOCKLIST.test(MODEL);

type UserContent =
  | string
  | Array<
      | { type: 'text'; text: string }
      | { type: 'image_url'; image_url: { url: string } }
    >;

export async function openaiChat(opts: {
  system: string;
  user: string;
  image?: string; // dataURL(data:image/...;base64,...) 또는 https 이미지 URL
  json?: boolean; // response_format json_object 강제
  maxTokens?: number;
  temperature?: number; // 추출/충실도 중요한 경우 0 권장 (newgen 모델은 무시됨)
}): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const hasImage = Boolean(opts.image);
  // 비전 미지원 모델인데 이미지가 오면 → null(호출부가 텍스트 폴백).
  if (hasImage && !modelSupportsVision) return null;

  const userContent: UserContent = hasImage
    ? [
        { type: 'text', text: opts.user },
        { type: 'image_url', image_url: { url: opts.image as string } },
      ]
    : opts.user;

  const body: Record<string, unknown> = {
    model: MODEL,
    messages: [
      { role: 'system', content: opts.system },
      { role: 'user', content: userContent },
    ],
  };
  // 비전 경로는 토큰을 넉넉히(이미지+4칸 JSON). 텍스트 기본 600.
  const defaultMax = hasImage ? 1000 : 600;
  if (isNewGen) {
    body.max_completion_tokens = opts.maxTokens ?? defaultMax;
  } else {
    body.max_tokens = opts.maxTokens ?? defaultMax;
    body.temperature = opts.temperature ?? 0.2;
  }
  if (opts.json) body.response_format = { type: 'json_object' };

  // 비전/큰 페이로드는 타임아웃 상향(텍스트 15s, 이미지 35s).
  const timeoutMs = hasImage ? 35000 : 15000;

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text: string = data?.choices?.[0]?.message?.content ?? '';
    return text.trim() || null;
  } catch {
    return null;
  }
}
