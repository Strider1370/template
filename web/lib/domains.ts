// web/lib/domains.ts — 대분류 라우팅 테이블.
// 입력(+AI 출력)을 키워드로 대분류에 매핑 → 지도 관청(officeCategory) + 처리 공식 URL(actionUrl)을 결정적으로 채운다.
// AI 가 officeCategory 를 틀려도(예: 자동차세→보건소) 이 안전망이 교정한다.
// actionUrl 은 2026-06-21 실제 접속 확인된 공식 루트(ecar.go.kr 만 死 → 정부24 로 대체).
// 새 행정 영역은 여기 한 줄 추가로 확장.

export type Domain = {
  id: string;
  label: string; // 사람용 이름
  keywords: string[]; // 입력/AI출력 텍스트 매칭(안전망)
  officeCategory: string; // 지도 검색용 (offices.ts 라벨, '' = 위치 무관)
  actionUrl: string; // "처리하기" 공식 채널 (검증된 루트 URL)
  // 위치 안내 방식. 기본 'nearest'(전국 어디서나 방문 가능 → 내 주변 최근접).
  // 'jurisdiction' = 관할 고정 + 온라인 처리(자동차세·국세·지급명령) → 내 주변 지도 숨기고
  //   관할 텍스트 + 온라인 처리 버튼만(엉뚱한 최근접 관청 표시 방지).
  locationMode?: 'nearest' | 'jurisdiction';
};

export const DOMAINS: Domain[] = [
  {
    id: 'local-tax',
    label: '세무·납부(지방세)',
    keywords: ['자동차세', '재산세', '지방세', '주민세', '취득세', '등록면허세', '지방소득세', '과태료', '세목', '납세고지', '위택스'],
    officeCategory: '시군구청',
    actionUrl: 'https://www.wetax.go.kr',
    locationMode: 'jurisdiction', // 관할(차량 등록지) 고정 + 위택스 온라인 납부 → 내 주변 지도 숨김
  },
  {
    id: 'national-tax',
    label: '국세',
    keywords: ['종합소득세', '부가가치세', '부가세', '연말정산', '양도소득세', '원천세', '국세', '홈택스', '세무서'],
    officeCategory: '세무서',
    actionUrl: 'https://www.hometax.go.kr',
    locationMode: 'jurisdiction', // 홈택스 온라인 처리 → 내 주변 지도 숨김
  },
  {
    id: 'resident',
    label: '주민·거주',
    keywords: ['전입신고', '전입', '등본', '초본', '주민등록', '인감', '확정일자', '세대주', '이사'],
    officeCategory: '주민센터',
    actionUrl: 'https://www.gov.kr/mw/AA020InfoCappView.do?CappBizCD=13100000016',
  },
  {
    id: 'legal',
    label: '법률·소송',
    keywords: ['지급명령', '이의신청', '소액', '독촉', '소송', '전자소송', '압류', '강제집행', '이행권고'],
    officeCategory: '법원',
    actionUrl: 'https://ecfs.scourt.go.kr',
    locationMode: 'jurisdiction', // 사건 보낸 법원(특정 관할) + 전자소송 → 내 주변 지도 숨김
  },
  {
    id: 'welfare',
    label: '복지·지원금',
    keywords: ['지원금', '수당', '바우처', '복지', '보조금', '돌봄', '기초연금', '생계', '의료급여', '긴급복지'],
    officeCategory: '주민센터',
    actionUrl: 'https://www.bokjiro.go.kr',
  },
  {
    id: 'health-ins',
    label: '건강보험',
    keywords: ['건강보험', '건보료', '건보', '지역가입', '피부양', '보험료'],
    officeCategory: '국민건강보험공단',
    actionUrl: 'https://www.nhis.or.kr',
  },
  {
    id: 'pension',
    label: '국민연금',
    keywords: ['국민연금', '연금보험료', '노령연금'],
    officeCategory: '국민연금공단',
    actionUrl: 'https://www.nps.or.kr',
  },
  {
    id: 'employment',
    label: '고용·노동',
    keywords: ['실업급여', '고용보험', '구직급여', '워크넷', '고용센터', '육아휴직', '직업훈련'],
    officeCategory: '고용센터',
    actionUrl: 'https://www.work24.go.kr',
  },
  {
    id: 'immigration',
    label: '출입국·외국인',
    keywords: ['체류', '비자', '외국인등록', '출입국', '체류연장', '하이코리아'],
    officeCategory: '출입국외국인청',
    actionUrl: 'https://www.hikorea.go.kr',
  },
  {
    id: 'car-reg',
    label: '자동차등록',
    keywords: ['자동차등록', '명의이전', '이전등록', '말소등록', '번호판', '자동차 등록'],
    officeCategory: '차량등록사업소',
    actionUrl: 'https://www.gov.kr',
  },
];

// 입력+AI출력 텍스트 → 대분류. 키워드 포함 점수 최고 1개(없으면 null).
export function classifyDomain(input: string): Domain | null {
  const t = (input || '').toLowerCase();
  let best: Domain | null = null;
  let bestScore = 0;
  for (const d of DOMAINS) {
    let score = 0;
    for (const k of d.keywords) {
      if (t.includes(k.toLowerCase())) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = d;
    }
  }
  return bestScore > 0 ? best : null;
}
