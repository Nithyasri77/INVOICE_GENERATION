/**
 * Purpose: Content-shaped loading placeholders shown while data fetches (TanStack Query isLoading)
 * Responsibilities: Base shimmer block + a ready-made TableSkeleton for list pages
 * Dependencies: cn()
 * Export: Skeleton, TableSkeleton
 */
import { cn } from '../../../utils/cn';

export interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-ink-900/[0.06]',
        'before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer',
        'before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent',
        className
      )}
    />
  );
}

export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

/** Drop-in loading state for any data table — matches typical row height/spacing */
export function TableSkeleton({ rows = 6, columns = 5 }: TableSkeletonProps) {
  return (
    <div className="w-full">
      <div className="flex gap-4 border-b border-surface-border px-4 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 border-b border-surface-border px-4 py-4">
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
