// scripts/generate-banner.mjs — OpenAI 이미지 생성으로 상단 배너 PNG 만들기 (빌드타임/수동).
// 키: web/.env.local 의 OPENAI_API_KEY. 실행: node scripts/generate-banner.mjs [out.png] ["프롬프트"]
// 키 없으면 건너뜀(앱은 배너 없이도 동작). 출력 기본: web/public/welfare-banner.png
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function loadKey() {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
  const envPath = join(ROOT, 'web', '.env.local');
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*OPENAI_API_KEY\s*=\s*(.+?)\s*$/);
      if (m) return m[1].replace(/^["']|["']$/g, '');
    }
  }
  return null;
}

const OUT = resolve(ROOT, process.argv[2] || 'web/public/welfare-banner.png');
const PROMPT = process.argv[3] ||
  '한국 정부 공공 복지 안내 웹페이지 상단 배너 일러스트. 다양한 가족(부모·어린 아이·노인)이 ' +
  '따뜻하고 안심되는 분위기에서 함께 있는 모습. 플랫 미니멀 벡터 스타일, 차분한 블루/소프트 톤, ' +
  '넓고 밝은 여백, 가로로 긴 구도(중앙 정렬), 텍스트·글자 없음, 정부 디자인시스템에 어울리는 절제된 색감.';

async function main() {
  const key = loadKey();
  if (!key) { console.error('OPENAI_API_KEY 없음 — 배너 생성을 건너뜁니다(앱은 배너 없이 동작).'); process.exit(1); }
  const body = { model: 'gpt-image-1', prompt: PROMPT, n: 1, size: '1536x1024', quality: 'medium' };
  console.log('이미지 생성 중(gpt-image-1, 1536x1024)…');
  const t = Date.now();
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(180000),
  });
  if (!res.ok) { console.error(`이미지 생성 실패 HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`); process.exit(1); }
  const data = await res.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) { console.error('응답에 이미지 없음'); process.exit(1); }
  mkdirSync(dirname(OUT), { recursive: true });
  const buf = Buffer.from(b64, 'base64');
  writeFileSync(OUT, buf);
  console.log(`배너 저장: ${OUT} (${Math.round(buf.length / 1024)}KB, ${Date.now() - t}ms)`);
}
main().catch((e) => { console.error('generate-banner 실패:', e.message); process.exit(1); });
