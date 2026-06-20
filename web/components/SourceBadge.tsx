// 출처 배지 — href 는 서버가 SOURCES 화이트리스트에서만 채워 보낸다(환각 URL 차단).
export type SourceItem = {
  id: string;
  title: string;
  url: string;
  publisher: string;
  asOf: string;
};

export function SourceBadge({ source }: { source: SourceItem }) {
  return (
    <a
      data-testid="source-badge"
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-primary-20 bg-primary-5 px-3 py-1 text-label-s text-primary-60 hover:bg-primary-10"
      title={`${source.title} (${source.publisher}, 기준일 ${source.asOf})`}
    >
      <svg className="h-3.5 w-3.5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v5h5M9 13h6M9 17h4" />
      </svg>
      <span className="truncate">
        {source.publisher} · {source.title}
      </span>
    </a>
  );
}
