// web/app/api/policies/route.ts — ① 실시간 후보 카탈로그 (보조금24/gov24, odcloud)
//
// 프로필 키워드로 '지원대상 LIKE' 검색 → 잠재 적격 후보 반환. 정밀 판정 아님.
// DATA_GO_KR_KEY 없거나 실패(미승인 Forbidden 등) 시 SAMPLE_CATALOG 폴백.

import { NextResponse } from 'next/server';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { profileKeywords, SAMPLE_CATALOG, type CandidatePolicy } from '@/lib/realtime';
import type { Profile } from '@/lib/types';

export const runtime = 'nodejs';

const BASE = 'https://api.odcloud.kr/api/gov24/v3/serviceList';

function sampleResponse(reason: string) {
  return NextResponse.json({
    source: 'sample' as const,
    reason,
    total: null,
    candidates: SAMPLE_CATALOG.map((c) => ({ ...c, source: 'sample' as const })),
  });
}

async function fetchByKeyword(key: string, keyword: string): Promise<{ items: any[]; total: number } | null> {
  // odcloud: cond[지원대상::LIKE]=<keyword>. serviceKey 는 인코딩 키(그대로 사용).
  const cond = encodeURIComponent('cond[지원대상::LIKE]');
  const url = `${BASE}?page=1&perPage=20&serviceKey=${key}&${cond}=${encodeURIComponent(keyword)}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(9000) });
    if (!res.ok) return null;
    const text = await res.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      return null; // "Forbidden" 등 비-JSON 응답
    }
    if (!Array.isArray(data?.data)) return null;
    return { items: data.data, total: data.matchCount ?? data.totalCount ?? data.data.length };
  } catch {
    return null;
  }
}

function mapItem(d: any): CandidatePolicy {
  const trunc = (s: string, n: number) => (s && s.length > n ? s.slice(0, n) + '…' : s || '');
  return {
    id: String(d['서비스ID'] ?? d['상세조회URL'] ?? d['서비스명']),
    name: String(d['서비스명'] ?? '').trim(),
    agency: String(d['소관기관명'] ?? d['부서명'] ?? '').trim(),
    summary: trunc(String(d['서비스목적요약'] ?? '').replace(/\s+/g, ' ').trim(), 120),
    field: String(d['서비스분야'] ?? '').trim(),
    target: trunc(String(d['지원대상'] ?? '').replace(/\s+/g, ' ').trim(), 90),
    applyMethod: trunc(String(d['신청방법'] ?? '').replace(/\s+/g, ' ').trim(), 60),
    link: String(d['상세조회URL'] ?? 'https://www.gov.kr/portal/rcvfvrSvc/main').trim(),
    source: 'live',
  };
}

// 커밋된 보조금24 전수 스냅샷(약 10,957건)을 한 번만 읽어 메모이즈. 16MB를 매 요청마다 읽지 않는다.
let _snapshot: any[] | null | undefined; // undefined=미시도, null=불가
function loadSnapshot(): any[] | null {
  if (_snapshot !== undefined) return _snapshot;
  const candidates = [
    join(process.cwd(), '..', 'data', 'snapshots', 'gov24-services.json'),
    join(process.cwd(), 'data', 'snapshots', 'gov24-services.json'),
  ];
  for (const p of candidates) {
    try {
      const arr = JSON.parse(readFileSync(p, 'utf8'));
      if (Array.isArray(arr) && arr.length) {
        _snapshot = arr;
        return _snapshot;
      }
    } catch {
      /* try next */
    }
  }
  _snapshot = null;
  return _snapshot;
}

// 스냅샷 폴백: 프로필 키워드로 산문 3필드 substring 매칭 → mapItem 재사용 → source 'snapshot'.
function snapshotResponse(profile: Profile, reason: string) {
  const rows = loadSnapshot();
  if (!rows) return sampleResponse(reason); // 스냅샷 없으면 최종 폴백
  const keywords = profileKeywords(profile);
  const seen = new Set<string>();
  const candidates: CandidatePolicy[] = [];
  for (const d of rows) {
    const hay = `${d['지원대상'] ?? ''} ${d['서비스명'] ?? ''} ${d['서비스목적요약'] ?? ''}`;
    if (!keywords.some((kw) => hay.includes(kw))) continue;
    const c = { ...mapItem(d), source: 'snapshot' as const };
    if (!c.name || seen.has(c.id)) continue;
    seen.add(c.id);
    candidates.push(c);
    if (candidates.length >= 12) break;
  }
  if (candidates.length === 0) return sampleResponse(reason);
  return NextResponse.json({ source: 'snapshot' as const, reason, total: candidates.length, keywords, candidates });
}

export async function POST(req: Request) {
  let profile: Profile;
  try {
    ({ profile } = await req.json());
  } catch {
    return sampleResponse('bad_request');
  }

  const key = process.env.DATA_GO_KR_KEY;
  if (!key) return snapshotResponse(profile, 'no_key');

  const keywords = profileKeywords(profile);
  const results = await Promise.all(keywords.map((kw) => fetchByKeyword(key, kw)));
  const ok = results.filter(Boolean) as { items: any[]; total: number }[];

  if (ok.length === 0) return snapshotResponse(profile, 'api_unavailable'); // 전부 실패(미승인 Forbidden 등)

  // 병합 + 서비스ID 중복 제거
  const seen = new Set<string>();
  const candidates: CandidatePolicy[] = [];
  for (const r of ok) {
    for (const d of r.items) {
      const c = mapItem(d);
      if (!c.name || seen.has(c.id)) continue;
      seen.add(c.id);
      candidates.push(c);
    }
  }
  const total = Math.max(...ok.map((r) => r.total || 0));

  return NextResponse.json({
    source: 'live' as const,
    reason: 'ok',
    total, // 키워드 매칭 총건수(참고)
    keywords,
    candidates: candidates.slice(0, 12),
  });
}
