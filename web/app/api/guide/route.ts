import { NextResponse } from 'next/server';
import { openaiChat } from '@/lib/llm';
import { SOURCES, matchSources } from '@/lib/sources';
import { searchCatalog, catalogById } from '@/lib/catalog';
import { OFFICE_LABELS } from '@/lib/offices';

type Evidence = { id: string; title: string; snippet: string };
type ResolvedSource = { id: string; title: string; url: string; publisher: string; asOf: string };

// sourceId → 화이트리스트(큐레이션 SOURCES 또는 받아둔 카탈로그)에서만 해석. 둘 다 우리 데이터(LLM이 만든 URL 아님).
function resolveSource(id: string): ResolvedSource | undefined {
  const s = SOURCES.find((x) => x.id === id);
  if (s) return { id: s.id, title: s.title, url: s.url, publisher: s.publisher, asOf: s.asOf };
  const c = catalogById(id);
  if (c) return { id: c.id, title: c.title, url: c.url, publisher: c.publisher, asOf: '' };
  return undefined;
}

export const runtime = 'nodejs';

// 받은 행정 문서/상황 → AI가 근거(SOURCES) 안에서만 읽어
// { 뜻 · 기한 · 첫 걸음 · 관할 · 출처 } 구조화 응답. 근거 없으면 "공식 확인 필요".
// 엔진은 AI(텍스트/비전) only. 출처 URL은 SOURCES 화이트리스트에서만(날조 차단).

type Guide = {
  summary: string;
  deadline: string;
  firstStep: string;
  steps: string[];
  jurisdiction: string;
  channel: string;
  locationApplies: boolean;
  officeCategory: string;
  sourceIds: string[];
  confident: boolean;
};

const SYSTEM = `너는 한국 행정 문서 안내 도우미다. 사용자가 받은 행정/법률 문서나 막막한 상황을 읽고,
겁먹지 않게 "지금 첫 걸음"부터 "전체 경로"와 "어디로 가서 어떻게 처리하는지"까지 안내한다. 반드시 아래 규칙을 지켜라.

규칙:
1. [근거]가 해당 문서를 다루면: 근거 안의 사실로 답하고, 사용한 근거 id를 sourceIds에 넣고 confident=true 로 하라.
2. [근거]가 비었거나 이 문서를 다루지 않으면: 너의 일반 지식으로 최대한 도움이 되는 안내를 하되 confident=false, sourceIds=[] 로 두어라(= 공식 미검증, 참고용). 단 기한·금액·처벌처럼 틀리면 위험한 구체 수치는 단정하지 말고 "정확한 내용은 공식 확인 필요"로 표현하라. 모르면 firstStep을 "정부24나 관할 기관에서 확인하세요"로.
3. sourceIds에는 [근거]에 실제로 있는 id만 넣어라. 근거에 없거나 무관하면 절대 넣지 마라. 새 id·URL을 지어내지 마라.
4. 쉬운 말로, 한자어는 풀어서. deadline 은 기한이 있으면 "2주(14일) 이내"처럼, 없으면 "특별한 법정 기한 없음".
5. firstStep 은 사용자가 당장 할 수 있는 구체적 행동 한 가지.
6. steps 는 처음부터 끝까지 전체 경로를 사용자 관점의 짧은 단계 3~5개로(첫 단계 포함). 끝이 보이게.
7. jurisdiction(관할)은 근거에 따라 정확히 적어라. 근거가 "전국 어디서나/가까운 기관에서 가능"이라고 하면 그렇게, 특정 기관만 가능하면(예: 사건을 보낸 법원, 새 주소지 관할) 그렇게. 근거에 없는 걸 지어내지 마라.
8. channel 은 온라인 처리 가능 여부와 방법을 한 줄로(예: "정부24에서 온라인 신고 가능 / 또는 주민센터 방문").
9. locationApplies: 위치 기반 "내 주변 OO 찾기"가 의미 있으면 true. 온라인만으로 끝나거나 기관 방문이 무의미하면 false.
10. officeCategory: 방문할 기관을 아래 목록에서 **정확히 하나만** 골라 라벨 그대로 적어라(자유 서술 금지). 목록: [${OFFICE_LABELS.join(', ')}]. 해당 기관이 없거나 순수 온라인이면 "". 참고: 자동차세·지방세→시군구청, 국세(소득세·부가세)→세무서, 전입신고·주민등록→주민센터, 지급명령·소송→법원, 건강보험→국민건강보험공단, 국민연금→국민연금공단, 실업급여→고용센터, 산재→근로복지공단, 외국인등록·체류→출입국외국인청, 자동차등록→차량등록사업소.
11. 반드시 아래 JSON 스키마로만 답하라(다른 텍스트 금지):
{"summary": string, "deadline": string, "firstStep": string, "steps": string[], "jurisdiction": string, "channel": string, "locationApplies": boolean, "officeCategory": string, "sourceIds": string[], "confident": boolean}`;

function buildUser(input: string, docs: Evidence[]): string {
  const evidence = docs.length
    ? docs.map((s) => `- id:${s.id} | ${s.title} | ${s.snippet}`).join('\n')
    : '(이 문서를 다루는 공식 근거 없음 — 규칙 2에 따라 일반 지식으로 안내하고 confident=false)';
  return `[사용자가 받은 문서/상황]\n${input || '(이미지로 첨부됨 — 이미지를 읽고 판단)'}\n\n[근거]\n${evidence}`;
}

function parseGuide(raw: string): Guide | null {
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const obj = JSON.parse(cleaned);
    if (typeof obj.summary !== 'string') return null;
    return {
      summary: String(obj.summary ?? ''),
      deadline: String(obj.deadline ?? ''),
      firstStep: String(obj.firstStep ?? ''),
      steps: Array.isArray(obj.steps) ? obj.steps.map(String).slice(0, 6) : [],
      jurisdiction: String(obj.jurisdiction ?? ''),
      channel: String(obj.channel ?? ''),
      locationApplies: Boolean(obj.locationApplies),
      officeCategory: String(obj.officeCategory ?? ''),
      sourceIds: Array.isArray(obj.sourceIds) ? obj.sourceIds.map(String) : [],
      confident: Boolean(obj.confident),
    };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  let body: { text?: string; image?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }
  const text = (body.text ?? '').trim();
  const image = body.image;
  if (!text && !image) {
    return NextResponse.json({ error: '문서 텍스트나 이미지를 입력하세요.' }, { status: 400 });
  }

  // 근거 = 큐레이션 민원(SOURCES) + 받아둔 공공/복지 카탈로그(전수 ~1.6만)에서 키워드 매칭한 것만.
  // 매칭 0건이면 빈 근거 → AI가 일반 지식으로 답하되 confident=false(엉뚱한 출처 인용 방지).
  const curated: Evidence[] = text ? matchSources(text) : [];
  const catalog: Evidence[] = text
    ? searchCatalog(text, 4).map((c) => ({
        id: c.id,
        title: c.title,
        snippet: [c.snippet, c.applyMethod && `신청방법: ${c.applyMethod}`, c.deadline && `신청기한: ${c.deadline}`]
          .filter(Boolean)
          .join(' / '),
      }))
    : [];
  const evidence: Evidence[] = [...curated, ...catalog];

  const raw = await openaiChat({
    system: SYSTEM,
    user: buildUser(text, evidence),
    image,
    json: true,
    maxTokens: image ? 1000 : 700,
  });

  // 키 없음/네트워크 실패/비전 미지원 → AI only이므로 코드로 답을 지어내지 않는다.
  if (raw == null) {
    return NextResponse.json({
      provider: 'unavailable',
      needsConfirmation: true,
      guide: {
        summary: 'AI 응답을 받지 못했습니다(키 또는 네트워크).',
        deadline: '',
        firstStep: '정부24(www.gov.kr) 또는 관할 기관에서 직접 확인하세요.',
        steps: [],
        jurisdiction: '',
        channel: '',
      },
      actionUrl: 'https://www.gov.kr',
      sources: [],
    });
  }

  const guide = parseGuide(raw);
  if (!guide) {
    return NextResponse.json({
      provider: 'openai',
      needsConfirmation: true,
      guide: {
        summary: '문서를 정확히 해석하지 못했습니다.',
        deadline: '',
        firstStep: '정부24 또는 관할 기관에서 직접 확인하세요.',
        steps: [],
        jurisdiction: '',
        channel: '',
      },
      actionUrl: 'https://www.gov.kr',
      sources: [],
    });
  }

  // 출처는 화이트리스트(큐레이션 SOURCES + 받아둔 카탈로그)에 실재하는 id만 노출 → 환각 URL 차단.
  const sources = guide.sourceIds
    .map((id) => resolveSource(id))
    .filter((s): s is ResolvedSource => Boolean(s));

  const needsConfirmation = !guide.confident || sources.length === 0;

  return NextResponse.json({
    provider: 'openai',
    needsConfirmation,
    guide: {
      summary: guide.summary,
      deadline: guide.deadline,
      firstStep: guide.firstStep,
      steps: guide.steps,
      jurisdiction: guide.jurisdiction,
      channel: guide.channel,
      locationApplies: guide.locationApplies,
      officeCategory: guide.officeCategory,
    },
    // "처리하러 가기" 공식 링크 — 인용된 출처 화이트리스트에서만(없으면 정부24).
    actionUrl: sources[0]?.url ?? 'https://www.gov.kr',
    sources,
  });
}
