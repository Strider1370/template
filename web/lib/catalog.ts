// web/lib/catalog.ts — 받아둔 공공/복지 서비스 데이터셋(전수 ~16,000건)을 출처 근거로 검색.
// gov24-services(보조금24, gov.kr) + welfare-central/local(복지로). 서버 전용, 모듈 1회 로드.
// 이 데이터의 url 은 모두 공식(gov.kr / bokjiro)이라 출처 배지 화이트리스트에 포함된다(LLM이 만든 URL 아님).
import { readFileSync } from 'node:fs';
import path from 'node:path';

export type CatalogDoc = {
  id: string;
  title: string;
  snippet: string;
  url: string;
  publisher: string;
  applyMethod: string;
  deadline: string;
};

function clip(s: unknown, n: number): string {
  return String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, n);
}
function decode(s: unknown): string {
  return String(s ?? '').replaceAll('&amp;', '&').trim();
}

function loadJson(rel: string): any[] {
  // dev: cwd=web/ → ../data/snapshots. 못 읽으면 빈 배열(데모는 큐레이션 SOURCES로 동작).
  for (const base of [path.resolve(process.cwd(), '..', 'data', 'snapshots'), path.resolve(process.cwd(), 'data', 'snapshots')]) {
    try {
      const d = JSON.parse(readFileSync(path.join(base, rel), 'utf8'));
      return Array.isArray(d) ? d : [];
    } catch {
      /* try next */
    }
  }
  return [];
}

let CATALOG: CatalogDoc[] | null = null;

function buildCatalog(): CatalogDoc[] {
  if (CATALOG) return CATALOG;
  const out: CatalogDoc[] = [];

  for (const r of loadJson('gov24-services.json')) {
    if (!r?.서비스명) continue;
    out.push({
      id: 'gov24:' + (r.서비스ID ?? out.length),
      title: clip(r.서비스명, 80),
      snippet: clip(
        [r.서비스목적요약, r.지원대상 && `대상: ${r.지원대상}`, r.지원내용 && `내용: ${r.지원내용}`]
          .filter(Boolean)
          .join(' / '),
        260,
      ),
      url: decode(r.상세조회URL) || 'https://www.gov.kr',
      publisher: clip(r.소관기관명, 40) || '정부24',
      applyMethod: clip(r.신청방법, 60),
      deadline: clip(r.신청기한, 40),
    });
  }

  for (const rel of ['welfare-central.json', 'welfare-local.json']) {
    for (const r of loadJson(rel)) {
      if (!r?.servNm) continue;
      out.push({
        id: 'bokjiro:' + (r.servId ?? out.length),
        title: clip(r.servNm, 80),
        snippet: clip([r.servDgst, r.ctpvNm && `(${r.ctpvNm})`].filter(Boolean).join(' '), 260),
        url: decode(r.servDtlLink) || 'https://www.bokjiro.go.kr',
        publisher: clip(r.jurMnofNm || r.jurOrgNm, 40) || '복지로',
        applyMethod: clip(r.aplyMtdNm, 60),
        deadline: '',
      });
    }
  }

  CATALOG = out;
  return out;
}

function tokenize(q: string): string[] {
  return (q || '')
    .replace(/[^가-힣a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2)
    .slice(0, 12);
}

// 입력 텍스트로 카탈로그 전수에서 키워드 매칭 → 상위 N건.
export function searchCatalog(input: string, limit = 4): CatalogDoc[] {
  const docs = buildCatalog();
  if (docs.length === 0) return [];
  const tokens = tokenize(input);
  if (tokens.length === 0) return [];
  const scored: { d: CatalogDoc; s: number }[] = [];
  for (const d of docs) {
    const title = d.title;
    const body = d.snippet;
    let s = 0;
    for (const t of tokens) {
      if (title.includes(t)) s += 3;
      else if (body.includes(t)) s += 1;
    }
    if (s > 0) scored.push({ d, s });
  }
  scored.sort((a, b) => b.s - a.s);
  return scored.slice(0, limit).map((x) => x.d);
}

export function catalogById(id: string): CatalogDoc | undefined {
  return buildCatalog().find((d) => d.id === id);
}

export function catalogSize(): number {
  return buildCatalog().length;
}
