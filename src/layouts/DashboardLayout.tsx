/**
 * Purpose: The main authenticated app shell — wraps every module page (Dashboard, Clients,
 *          Projects, Billing, etc.) with the fixed Sidebar and mobile Topbar
 * Responsibilities: Provide the content offset for the desktop sidebar rail, mount <Outlet />
 *                    for nested routes, and keep a consistent page gutter/max-width
 * Dependencies: react-router-dom (Outlet), Sidebar, Topbar, SidebarProvider
 * Export: DashboardLayout
 */
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar/Topbar';
import { SidebarProvider } from '../contexts/SidebarContext';

export function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-surface-bg">
        <Sidebar />

        <div className="lg:pl-64">
          <Topbar />

          <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
