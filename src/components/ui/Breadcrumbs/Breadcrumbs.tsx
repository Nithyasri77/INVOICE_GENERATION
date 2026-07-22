/**
 * Purpose: Breadcrumb trail shown at the top of nested pages (e.g. "Projects / AMC Portal")
 * Responsibilities: Render a chain of links with the last item as plain (non-clickable) current page
 * Dependencies: react-router-dom (Link), lucide-react (ChevronRight), cn()
 * Export: Breadcrumbs
 */
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../../utils/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1.5 text-sm', className)}>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <span key={idx} className="flex items-center gap-1.5">
            {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-ink-400" />}
            {isLast || !item.href ? (
              <span className={cn(isLast ? 'font-medium text-ink-900' : 'text-ink-500')}>{item.label}</span>
            ) : (
              <Link to={item.href} className="text-ink-500 hover:text-primary-600">
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
