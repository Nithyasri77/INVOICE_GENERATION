/**
 * Purpose: Slim top bar — mobile hamburger toggle (sidebar is hidden on mobile) + dynamic
 *          page title. Kept deliberately minimal: the wireframe shows user profile in the
 *          Sidebar footer (not a topbar) and page-specific controls (search, date range,
 *          Filters) live inside each page's own PageHeader — this component doesn't
 *          duplicate either, to avoid inventing UI beyond what's documented.
 * Responsibilities: Mobile nav trigger; resolve + display the current page's title from
 *                    the route, satisfying the "Dynamic Page Titles" requirement
 * Dependencies: react-router-dom (useLocation), sidebarConfig (SIDEBAR_NAV), SidebarContext, lucide-react
 * Export: Topbar
 */
import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useSidebar } from '../../contexts/SidebarContext';
import { SIDEBAR_NAV, type NavItem } from '../Sidebar/sidebarConfig';

function findPageTitle(pathname: string, items: NavItem[]): string {
  for (const item of items) {
    if (item.path && (item.path === pathname || (item.path !== '/' && pathname.startsWith(item.path)))) {
      return item.label;
    }
    if (item.children) {
      const childMatch = item.children.find((child) => child.path && pathname.startsWith(child.path));
      if (childMatch) return childMatch.label;
    }
  }
  return 'Dashboard';
}

export function Topbar() {
  const location = useLocation();
  const { openMobile } = useSidebar();
  const title = findPageTitle(location.pathname, SIDEBAR_NAV);

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-surface-border bg-white/80 px-4 py-3 backdrop-blur lg:hidden">
      <button
        type="button"
        onClick={openMobile}
        className="rounded-md p-1.5 text-ink-700 hover:bg-surface-bg"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <h2 className="text-base font-semibold text-ink-900">{title}</h2>
    </header>
  );
}
