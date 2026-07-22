/**
 * Purpose: Render one sidebar nav entry — either a direct link (Dashboard, Clients...) or an
 *          expandable group with sub-items (Agreements > NDA/MSA/Work Orders, Billing > ...)
 * Responsibilities: Active-state highlighting via NavLink, auto-expand a group when a child
 *                    route is active, collapse/expand toggle with chevron, icon-only mode support
 * Dependencies: react-router-dom (NavLink, useLocation), lucide-react (ChevronDown), cn(), NavItem type
 * Export: SidebarItem
 */
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { NavItem } from './sidebarConfig';

export interface SidebarItemProps {
  item: NavItem;
  isCollapsed?: boolean;
  onNavigate?: () => void;
}

export function SidebarItem({ item, isCollapsed, onNavigate }: SidebarItemProps) {
  const location = useLocation();
  const hasChildren = !!item.children?.length;
  const isChildActive = hasChildren && item.children!.some((child) => location.pathname.startsWith(child.path!));
  const [isExpanded, setIsExpanded] = useState(isChildActive);
  const Icon = item.icon;

  if (!hasChildren) {
    return (
      <NavLink
        to={item.path!}
        end={item.path === '/'}
        onClick={onNavigate}
        title={isCollapsed ? item.label : undefined}
        className={({ isActive }) =>
          cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            isActive ? 'bg-primary-600 text-white shadow-card' : 'text-ink-700 hover:bg-surface-bg'
          )
        }
      >
        <Icon className="h-[18px] w-[18px] shrink-0" />
        {!isCollapsed && <span className="truncate">{item.label}</span>}
      </NavLink>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        title={isCollapsed ? item.label : undefined}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-surface-bg',
          isChildActive && !isExpanded && 'text-primary-600'
        )}
        aria-expanded={isExpanded}
      >
        <Icon className="h-[18px] w-[18px] shrink-0" />
        {!isCollapsed && (
          <>
            <span className="flex-1 truncate text-left">{item.label}</span>
            <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform', isExpanded && 'rotate-180')} />
          </>
        )}
      </button>

      {!isCollapsed && isExpanded && (
        <div className="ml-4 mt-1 space-y-0.5 border-l border-surface-border pl-4">
          {item.children!.map((child) => (
            <NavLink
              key={child.path}
              to={child.path!}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'block rounded-md px-3 py-2 text-sm transition-colors',
                  isActive ? 'bg-primary-50 font-medium text-primary-700' : 'text-ink-500 hover:bg-surface-bg hover:text-ink-900'
                )
              }
            >
              <span className="truncate">{child.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
