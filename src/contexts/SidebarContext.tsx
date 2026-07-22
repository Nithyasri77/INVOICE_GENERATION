/**
 * Purpose: Track sidebar open/collapsed state across the app (mobile drawer toggle,
 *          desktop collapse-to-icons toggle)
 * Responsibilities: Provide isMobileOpen (mobile overlay sidebar) and isCollapsed (desktop
 *                    icon-only mode) plus their setters via context, since both Topbar
 *                    (hamburger button) and Sidebar itself need to read/write this state
 * Dependencies: react
 * Export: SidebarProvider, useSidebar()
 */
import { createContext, useContext, useState, type ReactNode } from 'react';

interface SidebarContextValue {
  isMobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
  isCollapsed: boolean;
  toggleCollapsed: () => void;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const value: SidebarContextValue = {
    isMobileOpen,
    openMobile: () => setIsMobileOpen(true),
    closeMobile: () => setIsMobileOpen(false),
    isCollapsed,
    toggleCollapsed: () => setIsCollapsed((prev) => !prev),
  };

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within a SidebarProvider');
  return ctx;
}
