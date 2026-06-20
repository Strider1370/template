import type { LlmProvider, LlmMessage, LlmResult } from './types';

// 키가 없거나 provider 호출이 불가할 때 쓰는 결정적 폴백.
// 실제 LLM처럼 단언하지 않도록, 폴백임을 분명히 한다.
export class FixtureProvider implements LlmProvider {
  readonly name = 'fixture';
  async complete(messages: LlmMessage[]): Promise<LlmResult> {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    const echo = lastUser?.content?.slice(0, 200) ?? '';
    return {
      text: `[fixture 응답 — LLM 키 없음] 입력 요약: ${echo}`,
      provider: this.name,
    };
  }
}
