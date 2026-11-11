import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ page, pageCount, onPage }) {
  if (pageCount < 2) return null;
  const first = Math.min(Math.max(1, page - 2), Math.max(1, pageCount - 4));
  const pages = Array.from({ length: Math.min(5, pageCount) }, (_, index) => first + index);
  return <nav className="pagination" aria-label="Catalog pages">
    <button type="button" disabled={page === 1} onClick={() => onPage(page - 1)}><ChevronLeft size={17} /> <span>Previous</span></button>
    <div className="page-numbers">{pages.map((number) => <button key={number} type="button" aria-label={`Page ${number}`} aria-current={page === number ? 'page' : undefined} className={page === number ? 'current' : ''} onClick={() => onPage(number)}>{number}</button>)}</div>
    <button type="button" disabled={page === pageCount} onClick={() => onPage(page + 1)}><span>Next</span> <ChevronRight size={17} /></button>
  </nav>;
}
