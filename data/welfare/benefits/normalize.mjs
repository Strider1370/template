// data/welfare/benefits/normalize.mjs
// raw/public-service-benefits.json → 표준 Benefit[] → normalized/benefits.full.json
// 사용: node data/welfare/benefits/normalize.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const RAW = join(HERE, 'raw', 'public-service-benefits.json');
const OUT = join(HERE, 'normalized', 'benefits.full.json');

const str = (v) => (v == null ? '' : String(v).trim());
const tags = (v) => str(v).split(/[,/;]/).map((s) => s.trim()).filter(Boolean);

// 원본 필드명은 명세에 맞춰 매핑한다(아래 키는 흔한 후보; 명세 확인 후 확정).
function toBenefit(row, i) {
  return {
    id: str(row.servId ?? row.SVC_ID ?? row.id ?? `benefit-${i}`),
    title: str(row.servNm ?? row.SVC_NM ?? row.title),
    provider: str(row.jurMnofNm ?? row.provider ?? '행정안전부'),
    category: str(row.servDgst ?? row.category),
    targetText: str(row.sprtTrgtCn ?? row.targetText),
    targetTags: tags(row.trgterIndvdlArray ?? row.targetTags),
    regionTags: tags(row.ctpvNm ?? row.regionTags),
    lifeEventTags: tags(row.lifeArray ?? row.lifeEventTags),
    eligibilityText: str(row.slctCritCn ?? row.eligibilityText),
    supportText: str(row.alwServCn ?? row.supportText),
    applicationText: str(row.aplyMtdCn ?? row.applicationText),
    deadlineText: str(row.enfcBgngYmd ?? row.deadlineText) || undefined,
    onlineUrl: str(row.servDtlLink ?? row.onlineUrl) || undefined,
    contactText: str(row.rprsCtadr ?? row.contactText) || undefined,
    sourceName: '행정안전부_대한민국 공공서비스(혜택) 정보',
    sourceUrl: 'https://www.data.go.kr/data/15113968/openapi.do',
    license: '이용허락범위 제한 없음',
    asOf: new Date().toISOString().slice(0, 10),
  };
}

function main() {
  if (!existsSync(RAW)) {
    console.error(`raw 없음: ${RAW} — 먼저 fetch.mjs 를 실행하세요.`);
    process.exit(1);
  }
  const raw = JSON.parse(readFileSync(RAW, 'utf8'));
  const rows = raw.data ?? raw.items ?? [];
  const benefits = rows.map(toBenefit);
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(benefits, null, 2));
  console.log(`정규화 완료: ${OUT} (${benefits.length}건)`);
}

main();
