/**
 * Purpose: Generic colored pill — the visual primitive behind every status badge in the app
 * Responsibilities: Render label with a color variant; StatusBadge (in shared/) maps business
 *                    statuses (Paid, Overdue, Reconciled...) onto these variants
 * Dependencies: class-variance-authority, cn()
 * Export: Badge, badgeVariants
 */
import { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';

export const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
  {
    variants: {
      variant: {
        success: 'bg-success-100 text-success-700',
        warning: 'bg-warning-100 text-warning-700',
        danger: 'bg-danger-100 text-danger-700',
        info: 'bg-info-100 text-info-700',
        neutral: 'bg-ink-900/5 text-ink-700',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  }
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
