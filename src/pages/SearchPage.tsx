import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, FileText, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { searchApi, documentsApi } from '../api/services';
import type { SearchResult, DocType, Document } from '../types';
import { TypeBadge, StatusBadge } from '../components/ui/Badge';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { formatDateTime, highlightMatch, getErrorMessage, renderMarkdown } from '../utils/helpers';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [mode, setMode] = useState<'content' | 'title'>('content');
  const [filterType, setFilterType] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(5);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [displayQuery, setDisplayQuery] = useState('');

  // View modal
  const [viewDoc, setViewDoc] = useState<Document | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const doSearch = useCallback(async (q: string, p: number) => {
    if (!q.trim()) return;
    setLoading(true);
    setDisplayQuery(q);
    try {
      const { data } = await searchApi.search({ q, mode, page: p, per_page: perPage, type: filterType });
      setResults(data.results);
      setTotal(data.total);
      setPages(data.pages);
      setSearched(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [mode, perPage, filterType]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) { setQuery(q); doSearch(q, 1); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearchParams(query ? { q: query } : {});
    doSearch(query, 1);
  }

  function handlePageChange(p: number) {
    setPage(p);
    doSearch(query, p);
  }

  async function handleView(doc: SearchResult) {
    setViewDoc(doc);
    setViewLoading(true);
    try {
      const { data } = await documentsApi.get(doc.id);
      setViewDoc(data);
    } catch { /* show basic info already in state */ }
    finally { setViewLoading(false); }
  }

  return (
    <div className="max-w-3xl space-y-5">

      {/* Search form */}
      <div className="card">
        <div className="p-4">
          <form onSubmit={handleSubmit} className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text" className="input pl-8"
                placeholder="Search the knowledge base…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>

            {/* Mode toggle */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
              {(['content', 'title'] as const).map((m) => (
                <button
                  type="button" key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1.5 font-medium transition-colors whitespace-nowrap ${mode === m ? 'bg-brand text-white' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  {m === 'content' ? 'Full content' : 'Title only'}
                </button>
              ))}
            </div>

            <select className="select h-9 text-sm" value={filterType}
              onChange={(e) => setFilterType(e.target.value)}>
              <option value="">All types</option>
              {(['url', 'pdf', 'excel', 'md'] as DocType[]).map(t =>
                <option key={t} value={t}>{t.toUpperCase()}</option>
              )}
            </select>

            <button type="submit" className="btn-primary btn"
              disabled={loading || !query.trim()}>
              {loading ? 'Searching…' : 'Search'}
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      {searched && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">
              {loading ? 'Searching…' : (
                total === 0
                  ? `No results for "${displayQuery}"`
                  : `${total} result${total !== 1 ? 's' : ''} for "${displayQuery}"`
              )}
            </p>
          </div>

          {loading ? (
            <div className="card divide-y divide-gray-100">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-4 space-y-2">
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-1/3" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-full" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-4/5" />
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={Search}
                title="No matching documents"
                description={`Try different keywords or switch to "${mode === 'content' ? 'title' : 'content'}" mode.`}
              />
            </div>
          ) : (
            <div className="card divide-y divide-gray-100">
              {results.map((r) => (
                <div key={r.id} className="p-4 hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => handleView(r)} >
                  <div className="flex items-start gap-3">
                    <FileText size={16} className="text-gray-300 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className="text-sm font-semibold text-gray-900"
                          dangerouslySetInnerHTML={{ __html: highlightMatch(r.name, displayQuery) }}
                        />
                        <TypeBadge type={r.source_type} />
                        <StatusBadge status={r.status} />
                      </div>
                      <div className="flex flex-wrap gap-3 text-[11px] text-gray-400 mb-2">
                        {r.source_url && (
                          <a href={r.source_url} target="_blank" rel="noreferrer" className="text-brand hover:underline truncate max-w-xs" onClick={(e) => e.stopPropagation()}>
                            {r.source_url}
                          </a>
                        )}
                        <span>{formatDateTime(r.last_updated)}</span>
                        <span>by {r.created_by}</span>
                      </div>
                      {r.snippet && (
                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-3" dangerouslySetInnerHTML={{ __html: highlightMatch(r.snippet, displayQuery) }} />
                      )}
                    </div>
                    {/* View icon — visible on hover */}
                    <button
                      title="View document"
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity btn-ghost btn btn-sm px-1.5 mt-0.5"
                      onClick={(e) => { e.stopPropagation(); handleView(r); }}
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pages > 1 && (
            <div className="card mt-2">
              <Pagination page={page} pages={pages} total={total} perPage={perPage} onPageChange={handlePageChange} onPerPageChange={() => { }} />
            </div>
          )}
        </div>
      )}

      {!searched && (
        <div className="card">
          <EmptyState
            icon={Search}
            title="Search your knowledge base"
            description="Enter keywords above. Use 'Full content' to search inside documents, or 'Title only' to match names."
          />
        </div>
      )}

      {/* View document modal */}
      <Modal
        open={!!viewDoc}
        onClose={() => setViewDoc(null)}
        title={viewDoc?.name ?? ''}
        subtitle={viewDoc ? `${viewDoc.source_type.toUpperCase()} · ${formatDateTime(viewDoc.last_updated)}` : ''}
        footer={<button className="btn-secondary btn" onClick={() => setViewDoc(null)}>Close</button>}
      >
        {viewLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-3.5 bg-gray-100 rounded animate-pulse" style={{ width: `${65 + (i * 7) % 30}%` }} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {viewDoc?.source_url && (
              <a href={viewDoc.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-brand hover:underline bg-brand-light px-3 py-1.5 rounded-lg">
                🔗 {viewDoc.source_url}
              </a>
            )}
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 max-h-[420px] overflow-y-auto">
              {viewDoc?.content ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(viewDoc.content),
                  }}
                />
              ) : (
                'No content available.'
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
