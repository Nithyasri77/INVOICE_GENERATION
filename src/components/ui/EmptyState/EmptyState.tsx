/**
 * Purpose: "No data" state for tables and lists (e.g. no clients yet, no invoices match filters)
 * Responsibilities: Show icon, message, and an optional primary action (e.g. "Create Invoice")
 * Dependencies: cn(), Button
 * Export: EmptyState
 */
import { type ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '../../../utils/cn';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 px-6 py-16 text-center', className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-bg text-ink-400">
        {icon ?? <Inbox className="h-6 w-6" />}
      </div>
      <div>
        <p className="text-sm font-semibold text-ink-900">{title}</p>
        {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}
