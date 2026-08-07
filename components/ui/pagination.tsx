import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconButton } from './icon-button';

export interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

function getPageList(page: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set([1, totalPages, page, page - 1, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const result: (number | 'ellipsis')[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - (sorted[i - 1] as number) > 1) result.push('ellipsis');
    result.push(p);
  });
  return result;
}

export function Pagination({ page, totalPages, onChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = getPageList(page, totalPages);

  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-center gap-1', className)}>
      <IconButton label="Previous page" size="sm" disabled={page === 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft />
      </IconButton>
      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`e-${i}`} className="px-1 text-foreground-subtle">…</span>
        ) : (
          <button
            key={p}
            type="button"
            aria-current={p === page ? 'page' : undefined}
            onClick={() => onChange(p)}
            className={cn(
              'flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-body-sm font-medium transition-colors duration-fast',
              p === page ? 'bg-accent text-accent-foreground' : 'text-foreground-muted hover:bg-surface-hover hover:text-foreground'
            )}
          >
            {p}
          </button>
        )
      )}
      <IconButton label="Next page" size="sm" disabled={page === totalPages} onClick={() => onChange(page + 1)}>
        <ChevronRight />
      </IconButton>
    </nav>
  );
}
