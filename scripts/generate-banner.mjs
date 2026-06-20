// scripts/generate-banner.mjs — OpenAI 이미지 생성으로 넓은 hero 배너 PNG 만들기 (빌드타임/수동).
// 키: web/.env.local 의 OPENAI_API_KEY. 실행: node scripts/generate-banner.mjs [out.png] ["프롬프트"]
// 기본: DALL·E 3 1792x1024 (OpenAI 최대 가로비). 넓고 낮은 hero 띠에 배경으로 깔기 좋게,
//        피사체는 오른쪽, 왼쪽은 텍스트가 올라갈 여백으로 비운다.
// 키 없으면 건너뜀(앱은 배너 없이도 동작). 출력 기본: web/public/hero-banner.png
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

const OUT = resolve(ROOT, process.argv[2] || 'web/public/hero-banner.png');
const PROMPT = process.argv[3] ||
  '한국 정부 공공 서비스 웹사이트 상단의 넓은 가로 배너 일러스트. 다양한 시민(가족·청년·노인)이 ' +
  '밝고 안심되는 공공 공간에서 함께하는 모습. 플랫 미니멀 벡터 스타일, KRDS 톤의 차분한 블루/소프트 파스텔, ' +
  '피사체와 주요 요소는 화면 오른쪽에 배치하고 왼쪽 절반은 텍스트가 올라갈 수 있도록 밝고 깨끗한 여백(연한 블루)으로 비움. ' +
  '가로로 매우 긴 배너 구도, 텍스트·글자 없음, 절제되고 신뢰감 있는 색감.';

async function main() {
  const key = loadKey();
  if (!key) { console.error('OPENAI_API_KEY 없음 — 배너 생성을 건너뜁니다(앱은 배너 없이 동작).'); process.exit(1); }
  const model = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
  const size = process.env.OPENAI_IMAGE_SIZE || '1536x1024';
  const body = { model, prompt: PROMPT, n: 1, size };
  if (model === 'dall-e-3') body.quality = 'standard';
  console.log(`이미지 생성 중(${model}, ${size})…`);
  const t = Date.now();
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(180000),
  });
  if (!res.ok) { console.error(`이미지 생성 실패 HTTP ${res.status}: ${(await res.text()).slice(0, 400)}`); process.exit(1); }
  const data = await res.json();
  const d = data.data?.[0];
  let buf;
  if (d?.b64_json) {
    buf = Buffer.from(d.b64_json, 'base64');
  } else if (d?.url) {
    const ir = await fetch(d.url, { signal: AbortSignal.timeout(60000) });
    if (!ir.ok) { console.error(`이미지 URL 다운로드 실패 HTTP ${ir.status}`); process.exit(1); }
    buf = Buffer.from(await ir.arrayBuffer());
  } else {
    console.error('응답에 이미지 없음'); process.exit(1);
  }
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, buf);
  console.log(`배너 저장: ${OUT} (${Math.round(buf.length / 1024)}KB, ${Date.now() - t}ms)`);
}
main().catch((e) => { console.error('generate-banner 실패:', e.message); process.exit(1); });
