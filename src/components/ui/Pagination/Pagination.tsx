/**
 * Purpose: Table pagination control — used at the bottom of every data table
 *          (matches wireframe's "Showing 1 to 8 of 45 entries" + numbered pages style)
 * Responsibilities: Render prev/next + numbered pages with ellipsis collapsing for large page counts
 * Dependencies: lucide-react (ChevronLeft/Right), cn()
 * Export: Pagination
 */
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../../utils/cn';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalEntries: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function getPageList(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const result: (number | 'ellipsis')[] = [];
  sorted.forEach((page, idx) => {
    if (idx > 0 && page - sorted[idx - 1] > 1) result.push('ellipsis');
    result.push(page);
  });
  return result;
}

export function Pagination({
  currentPage,
  totalPages,
  totalEntries,
  pageSize,
  onPageChange,
  className,
}: PaginationProps) {
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalEntries);
  const pages = getPageList(currentPage, totalPages);

  return (
    <div className={cn('flex flex-col items-center justify-between gap-3 px-4 py-3 sm:flex-row', className)}>
      <p className="text-xs text-ink-500">
        Showing {start} to {end} of {totalEntries} entries
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-8 w-8 items-center justify-center rounded-md text-ink-500 hover:bg-surface-bg disabled:opacity-40 disabled:pointer-events-none"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((page, idx) =>
          page === 'ellipsis' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-sm text-ink-400">
              …
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={cn(
                'flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium',
                page === currentPage ? 'bg-primary-600 text-white' : 'text-ink-700 hover:bg-surface-bg'
              )}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-md text-ink-500 hover:bg-surface-bg disabled:opacity-40 disabled:pointer-events-none"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
