import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  perPage: number;
  onPageChange: (p: number) => void;
  onPerPageChange: (n: number) => void;
}

export function Pagination({ page, pages, total, perPage, onPageChange, onPerPageChange }: PaginationProps) {
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  const pageNums = (): (number | '...')[] => {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, '...', pages];
    if (page >= pages - 3) return [1, '...', pages - 4, pages - 3, pages - 2, pages - 1, pages];
    return [1, '...', page - 1, page, page + 1, '...', pages];
  };

  return (
    <div className="flex items-center gap-1.5 px-4 py-3 border-t border-gray-100 bg-white flex-wrap">
      <span className="text-xs text-gray-500 mr-2">
        {total === 0 ? 'No results' : `${start}–${end} of ${total}`}
      </span>

      <div className="flex gap-1 flex-wrap">
        <button
          className="btn btn-ghost btn-sm px-1.5"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={14} />
        </button>

        {pageNums().map((p, i) =>
          p === '...' ? (
            <span key={`e${i}`} className="px-2 py-1 text-xs text-gray-400 flex items-center">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`btn btn-sm px-2.5 ${p === page ? 'bg-brand text-white border-brand' : 'btn-secondary'}`}
            >
              {p}
            </button>
          )
        )}

        <button
          className="btn btn-ghost btn-sm px-1.5"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <span className="text-xs text-gray-500">Rows:</span>
        <select
          value={perPage}
          onChange={(e) => { onPerPageChange(Number(e.target.value)); onPageChange(1); }}
          className="select h-7 text-xs py-0 px-2"
        >
          {[5, 10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
    </div>
  );
}
