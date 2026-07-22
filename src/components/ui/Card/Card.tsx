/**
 * Purpose: Base surface container — rounded card with subtle shadow, used as the building
 *          block for StatCard, ChartCard, form panels, and list containers
 * Responsibilities: Provide consistent padding/border/shadow; expose Header/Body/Footer slots
 * Dependencies: cn()
 * Export: Card, CardHeader, CardTitle, CardDescription, CardBody, CardFooter
 */
import { type HTMLAttributes } from 'react';
import { cn } from '../../../utils/cn';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('surface-card', className)} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center justify-between border-b border-surface-border px-5 py-4', className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-sm font-semibold text-ink-900', className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('mt-0.5 text-xs text-ink-500', className)} {...props} />;
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5', className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center justify-end gap-2 border-t border-surface-border px-5 py-4', className)} {...props} />
  );
}
