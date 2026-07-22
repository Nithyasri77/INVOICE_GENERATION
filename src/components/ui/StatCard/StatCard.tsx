/**
 * Purpose: Dashboard stat widget — Total Revenue, Outstanding Amount, Invoices Due, Overdue, etc.
 * Responsibilities: Show a label, big value, optional trend delta (up/down %), and optional icon
 * Dependencies: lucide-react (TrendingUp/TrendingDown), cn(), Card
 * Export: StatCard
 */
import { type ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { Card } from '../Card';

export interface StatCardProps {
  label: string;
  value: string;
  /** Positive = upward trend (green), negative = downward trend; omit to hide the delta row */
  trend?: number;
  /** Overrides automatic green/red trend coloring — e.g. Overdue Invoices should read red even if trend is "up" */
  tone?: 'default' | 'danger';
  icon?: ReactNode;
  className?: string;
}

export function StatCard({ label, value, trend, tone = 'default', icon, className }: StatCardProps) {
  const valueColor = tone === 'danger' ? 'text-danger-600' : 'text-ink-900';
  const isPositiveTrend = (trend ?? 0) >= 0;

  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-ink-500">{label}</span>
        {icon && <span className="text-ink-400">{icon}</span>}
      </div>

      <div className={cn('mt-2 text-2xl font-bold tracking-tight', valueColor)}>{value}</div>

      {trend !== undefined && (
        <div
          className={cn(
            'mt-1.5 inline-flex items-center gap-1 text-xs font-medium',
            tone === 'danger' ? 'text-danger-600' : isPositiveTrend ? 'text-success-600' : 'text-danger-600'
          )}
        >
          {isPositiveTrend ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          <span>{Math.abs(trend)}%</span>
        </div>
      )}
    </Card>
  );
}
