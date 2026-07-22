/**
 * Purpose: Layout for unauthenticated pages (currently just Login)
 * Responsibilities: Center a card on a plain background with the company logo above it —
 *                    deliberately minimal since no login wireframe was provided
 * Dependencies: react-router-dom (Outlet)
 * Export: AuthLayout
 */
import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-bg px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-lg font-bold text-white">
            SC
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-ink-900">Shine Craft Technologies</p>
            <p className="text-xs text-ink-500">Craft | Code | Connect</p>
          </div>
        </div>

        <div className="surface-card p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
