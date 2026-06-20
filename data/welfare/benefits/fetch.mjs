// data/welfare/benefits/fetch.mjs
// 행정안전부_대한민국 공공서비스(혜택) 정보 API(15113968) 전수 호출 → raw/ 저장.
// 키: web/.env.local 의 DATA_GO_KR_KEY (채팅에 노출 금지).
// 사용: node data/welfare/benefits/fetch.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const RAW = join(HERE, 'raw', 'public-service-benefits.json');

// web/.env.local 에서 DATA_GO_KR_KEY 로드 (의존성 없이 직접 파싱)
function loadKey() {
  if (process.env.DATA_GO_KR_KEY) return process.env.DATA_GO_KR_KEY;
  const envPath = join(HERE, '..', '..', '..', 'web', '.env.local');
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*DATA_GO_KR_KEY\s*=\s*(.+?)\s*$/);
      if (m) return m[1].replace(/^["']|["']$/g, '');
    }
  }
  return null;
}

// 실제 엔드포인트/파라미터는 활용신청 후 받은 명세에 맞춘다.
const BASE = process.env.DATA_GO_KR_BENEFITS_URL
  ?? 'https://api.odcloud.kr/api/15113968/v1/uddi'; // TODO: 명세의 실제 경로로 확정

async function fetchPage(key, page, perPage) {
  const url = `${BASE}?page=${page}&perPage=${perPage}&serviceKey=${encodeURIComponent(key)}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} @ page ${page}`);
  return res.json();
}

async function main() {
  const key = loadKey();
  if (!key) {
    console.error('DATA_GO_KR_KEY 없음 — web/.env.local 에 키를 넣으세요(채팅에 노출 금지).');
    process.exit(1);
  }
  const perPage = 1000;
  let page = 1;
  const all = [];
  while (true) {
    const body = await fetchPage(key, page, perPage);
    const rows = body.data ?? body.items ?? [];
    all.push(...rows);
    const total = body.totalCount ?? body.matchCount ?? all.length;
    console.log(`page ${page}: +${rows.length} (누적 ${all.length} / 총 ${total})`);
    if (rows.length === 0 || all.length >= total) break;
    page++;
  }
  mkdirSync(dirname(RAW), { recursive: true });
  writeFileSync(RAW, JSON.stringify({ retrievedAt: new Date().toISOString(), count: all.length, data: all }, null, 2));
  console.log(`\n전수 저장: ${RAW} (${all.length}건)`);
}

main().catch((e) => { console.error('fetch 실패:', e.message); process.exit(1); });
