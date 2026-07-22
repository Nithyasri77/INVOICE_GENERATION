/**
 * Purpose: Error state for failed data fetches (TanStack Query isError) across tables and detail pages
 * Responsibilities: Show what went wrong and offer a retry action, in the interface's voice (not apologetic)
 * Dependencies: cn(), Button
 * Export: ErrorState
 */
import { AlertTriangle } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { Button } from '../Button';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Couldn\u2019t load this data',
  description = 'Something went wrong while fetching this. Try again.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 px-6 py-16 text-center', className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-50 text-danger-600">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-semibold text-ink-900">{title}</p>
        <p className="mt-1 text-sm text-ink-500">{description}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
