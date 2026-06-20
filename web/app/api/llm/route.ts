import { NextResponse } from 'next/server';
import { getLlmProvider, type LlmMessage } from '@/lib/llm';

export const runtime = 'nodejs';

// 서버사이드에서만 LLM 키 사용. 클라이언트는 이 라우트로만 호출한다.
export async function POST(req: Request) {
  let body: { messages?: LlmMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }
  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'messages[] required' }, { status: 400 });
  }
  const provider = getLlmProvider();
  try {
    const result = await provider.complete(messages);
    return NextResponse.json(result);
  } catch (err) {
    console.error('llm complete failed', err);
    return NextResponse.json({ error: 'llm provider failed' }, { status: 502 });
  }
}
