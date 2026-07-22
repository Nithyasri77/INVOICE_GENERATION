/**
 * Purpose: Standard page header used atop every module's landing/detail page
 *          (title + optional breadcrumb + primary action button, e.g. "+ Create Invoice")
 * Responsibilities: Consistent spacing/typography so every page opens identically
 * Dependencies: Breadcrumbs (ui), cn()
 * Export: PageHeader
 */
import { type ReactNode } from 'react';
import { Breadcrumbs, type BreadcrumbItem } from '../../ui/Breadcrumbs';
import { cn } from '../../../utils/cn';

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, breadcrumbs, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} className="mb-1.5" />}
        <h1 className="text-xl font-bold text-ink-900">{title}</h1>
        {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
