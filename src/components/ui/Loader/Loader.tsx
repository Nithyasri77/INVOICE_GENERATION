/**
 * Purpose: Spinner for inline or full-page loading states (distinct from Skeleton, which mimics content shape)
 * Responsibilities: Render a sized, colored spinner with optional label and full-page centering
 * Dependencies: lucide-react (Loader2), cn()
 * Export: Loader
 */
import { Loader2 } from 'lucide-react';
import { cn } from '../../../utils/cn';

export interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  fullPage?: boolean;
  className?: string;
}

const sizeClasses: Record<NonNullable<LoaderProps['size']>, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
};

export function Loader({ size = 'md', label, fullPage, className }: LoaderProps) {
  const content = (
    <div className={cn('flex flex-col items-center justify-center gap-2 text-ink-500', className)}>
      <Loader2 className={cn('animate-spin text-primary-600', sizeClasses[size])} />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );

  if (fullPage) {
    return <div className="flex min-h-[50vh] w-full items-center justify-center">{content}</div>;
  }

  return content;
}
