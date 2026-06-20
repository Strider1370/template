// LLM provider 추상화 — OpenAI 기본, fixture 폴백. provider 교체 가능.
export type LlmMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type LlmCompleteOptions = {
  temperature?: number;
  maxTokens?: number;
};

export type LlmResult = {
  text: string;
  provider: string; // 실제 응답을 만든 provider 이름 ("openai" | "fixture" | ...)
};

export interface LlmProvider {
  readonly name: string;
  complete(messages: LlmMessage[], opts?: LlmCompleteOptions): Promise<LlmResult>;
}
