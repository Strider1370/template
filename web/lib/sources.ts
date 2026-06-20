// web/lib/sources.ts — 출처 코퍼스(신뢰 레이어). AI는 이 안에서만 인용한다(URL 날조 금지).
// 각 항목 url 은 2026-06-20 WebSearch로 확인된 공식/권위 출처. (막힌 환경 대비 사전 큐레이션)
// 출처 배지 href 는 반드시 이 화이트리스트에서만 나온다.

export type SourceDoc = {
  id: string;
  scenario: '지급명령' | '전입신고';
  title: string;
  url: string;
  publisher: string;
  asOf: string; // 기준일(확인 시점)
  snippet: string; // AI가 근거로 읽을 발췌
  keywords: string[]; // 단순 키워드 매칭용
};

export const SOURCES: SourceDoc[] = [
  // ── 지급명령 (받은 무서운 법원 문서) ──
  {
    id: 'jm-1',
    scenario: '지급명령',
    title: '지급명령 — 나홀로 민사소송 (이의신청 2주)',
    url: 'https://www.easylaw.go.kr/CSP/CnpClsMainBtr.laf?csmSeq=568&ccfNo=3&cciNo=3&cnpClsNo=2&menuType=onhunqna',
    publisher: '법제처 찾기쉬운 생활법령정보',
    asOf: '2026-06-20',
    snippet:
      '채무자는 지급명령을 송달받은 날부터 2주(14일) 이내에 이의신청을 할 수 있고, 이의신청을 하면 사건은 소송으로 넘어가 다툴 수 있다. 2주 안에 이의신청을 하지 않으면 지급명령이 확정된다.',
    keywords: ['지급명령', '이의신청', '독촉', '2주', '14일', '채무', '송달'],
  },
  {
    id: 'jm-2',
    scenario: '지급명령',
    title: '확정된 지급명령의 효력',
    url: 'https://www.easylaw.go.kr/CSP/CnpClsMainBtr.laf?csmSeq=568&ccfNo=3&cciNo=3&cnpClsNo=2&menuType=onhunqna',
    publisher: '법제처 찾기쉬운 생활법령정보',
    asOf: '2026-06-20',
    snippet:
      '이의신청 없이 기간이 지나 지급명령이 확정되면 확정판결과 같은 효력이 생겨, 채권자는 이를 근거로 강제집행(압류 등)을 할 수 있다.',
    keywords: ['확정', '효력', '강제집행', '압류', '확정판결'],
  },
  {
    id: 'jm-3',
    scenario: '지급명령',
    title: '지급명령(독촉절차) 안내 — 대한민국 법원 전자소송',
    url: 'https://ecfs.scourt.go.kr/psp/index.on?m=PSP730M12',
    publisher: '대한민국 법원 (전자소송)',
    asOf: '2026-06-20',
    snippet:
      '지급명령은 법원이 채권자의 신청만으로 채무자에게 금전 지급을 명하는 독촉절차다. 이의신청은 지급명령을 한 법원에 서면으로 한다.',
    keywords: ['법원', '전자소송', '독촉절차', '관할', '서면'],
  },
  {
    id: 'jm-4',
    scenario: '지급명령',
    title: '소액사건 이행권고결정 — 이의신청 2주',
    url: 'https://www.scourt.go.kr/nm/min_8/min_8_1/index.html',
    publisher: '대한민국 법원',
    asOf: '2026-06-20',
    snippet:
      '소액사건의 이행권고결정도 송달받은 날부터 2주 이내에 이의신청을 하지 않으면 확정되어 확정판결과 같은 효력을 가진다.',
    keywords: ['이행권고결정', '소액', '이의신청', '확정'],
  },

  // ── 전입신고 (처음 닥치는 일상 민원) ──
  {
    id: 'ji-1',
    scenario: '전입신고',
    title: '전입신고 | 민원안내 및 신청 (정부24)',
    url: 'https://www.gov.kr/mw/AA020InfoCappView.do?CappBizCD=13100000016',
    publisher: '행정안전부 (정부24)',
    asOf: '2026-06-20',
    snippet:
      '새로운 거주지로 이사한 날부터 14일 이내에 전입신고를 해야 한다. 새 거주지의 읍·면사무소나 동 주민센터를 방문하거나 정부24 홈페이지에서 온라인으로 신고할 수 있다.',
    keywords: ['전입신고', '이사', '전입', '14일', '주민센터', '정부24', '온라인'],
  },
  {
    id: 'ji-2',
    scenario: '전입신고',
    title: '전입신고 지연·미신고 시 과태료 (주민등록법)',
    url: 'https://www.gov.kr/mw/AA020InfoCappView.do?CappBizCD=13100000016',
    publisher: '행정안전부 (정부24)',
    asOf: '2026-06-20',
    snippet:
      '정당한 사유 없이 14일 이내에 전입신고를 하지 않으면 5만원 이하의 과태료가 부과될 수 있다(주민등록법 제40조). 거짓 신고는 더 무거운 처벌을 받는다.',
    keywords: ['과태료', '미신고', '지연', '주민등록법', '5만원'],
  },
  {
    id: 'ji-3',
    scenario: '전입신고',
    title: '전국 어디서나 전입신고 가능 (보도자료)',
    url: 'https://www.mois.go.kr/frt/bbs/type010/commonSelectBoardArticle.do?bbsId=BBSMSTR_000000000008&nttId=76791',
    publisher: '행정안전부',
    asOf: '2026-06-20',
    snippet:
      '주민등록 전입신고는 전국 읍·면·동 주민센터 어디에서나 방문 신고할 수 있다(온라인은 정부24). 즉 새 주소지 관할이 아니어도 가까운 주민센터에서 처리 가능하다. 다만 해외체류자 등 일부는 새 거주지 관할 주민센터 방문이 필요하다.',
    keywords: ['전입신고', '이사', '전입', '관할', '주민센터', '어디서나', '가까운', '방문', '거주지'],
  },
  {
    id: 'ji-4',
    scenario: '전입신고',
    title: '전입신고 유의사항 (정부24)',
    url: 'https://www.gov.kr/minwon/inc/AA040_form_notice_13100000016_2.jsp',
    publisher: '행정안전부 (정부24)',
    asOf: '2026-06-20',
    snippet:
      '온라인 전입신고는 신청 후 처리(승인)에 시간이 걸릴 수 있고, 세대주 확인이 필요한 경우가 있다. 정확한 안내는 정부24 또는 관할 주민센터에서 확인한다.',
    keywords: ['유의사항', '처리', '승인', '세대주확인'],
  },
];

// 단순 키워드 매칭(임베딩 불필요). 입력 텍스트에 포함된 키워드 수로 점수.
export function matchSources(input: string, limit = 5): SourceDoc[] {
  const text = (input || '').toLowerCase();
  const scored = SOURCES.map((s) => {
    let score = 0;
    for (const k of s.keywords) {
      if (text.includes(k.toLowerCase())) score += 1;
    }
    return { s, score };
  }).filter((x) => x.score > 0);
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((x) => x.s);
}
