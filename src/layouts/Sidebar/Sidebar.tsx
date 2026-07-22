/**
 * Purpose: Main app sidebar — logo, full nav tree (from sidebarConfig), and user footer.
 *          Matches wireframe: white background, "Shine Craft Technologies" logo top,
 *          blue-highlighted active item, user profile block at the bottom.
 * Responsibilities: Render SIDEBAR_NAV via SidebarItem; behave as a fixed rail on desktop
 *                    and a slide-in overlay drawer on mobile (driven by SidebarContext)
 * Dependencies: sidebarConfig, SidebarItem, UserMenu, SidebarContext, cn()
 * Export: Sidebar
 */
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useSidebar } from '../../contexts/SidebarContext';
import { SIDEBAR_NAV } from './sidebarConfig';
import { SidebarItem } from './SidebarItem';
import { UserMenu } from '../Topbar/UserMenu';

export function Sidebar() {
  const { isMobileOpen, closeMobile } = useSidebar();

  const content = (
    <div className="flex h-full flex-col bg-white">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
            SC
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-ink-900">Shine Craft Technologies</p>
            <p className="truncate text-[11px] text-ink-500">Craft | Code | Connect</p>
          </div>
        </div>
        <button
          type="button"
          onClick={closeMobile}
          className="rounded-md p-1 text-ink-400 hover:bg-surface-bg lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav tree */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {SIDEBAR_NAV.map((item) => (
          <SidebarItem key={item.label} item={item} onNavigate={closeMobile} />
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-surface-border px-3 py-3">
        <UserMenu />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: fixed rail */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block lg:w-64 lg:border-r lg:border-surface-border">
        {content}
      </aside>

      {/* Mobile: overlay drawer */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-ink-900/40 transition-opacity lg:hidden',
          isMobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={closeMobile}
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 border-r border-surface-border transition-transform lg:hidden',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {content}
      </aside>
    </>
  );
}
