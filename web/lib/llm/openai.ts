import OpenAI from 'openai';
import type { LlmProvider, LlmMessage, LlmCompleteOptions, LlmResult } from './types';

// 기본 provider. OPENAI_API_KEY 가 있을 때만 생성된다(index.ts 가 판단).
export class OpenAiProvider implements LlmProvider {
  readonly name = 'openai';
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini') {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async complete(messages: LlmMessage[], opts: LlmCompleteOptions = {}): Promise<LlmResult> {
    const res = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens,
    });
    return {
      text: res.choices[0]?.message?.content ?? '',
      provider: this.name,
    };
  }
}
