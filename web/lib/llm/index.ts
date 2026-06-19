import type { LlmProvider } from "./types";
import { OpenAiProvider } from "./openai";
import { FixtureProvider } from "./fixture";

export * from "./types";

// env 로 provider 를 고른다. 기본 openai. 키가 없으면 fixture 로 폴백.
// LLM_PROVIDER=fixture 로 강제 폴백 가능.
export function getLlmProvider(): LlmProvider {
  const choice = (process.env.LLM_PROVIDER ?? "openai").toLowerCase();
  const key = process.env.OPENAI_API_KEY;

  if (choice === "fixture") return new FixtureProvider();
  if (choice === "openai") {
    if (!key) return new FixtureProvider(); // 키 없으면 폴백
    return new OpenAiProvider(key);
  }
  // 알 수 없는 provider → 안전하게 폴백
  return new FixtureProvider();
}
