/**
 * Purpose: App-wide toast notifications — success/error/info feedback after actions
 *          (e.g. "Invoice created", "Payment recorded", "Failed to save client")
 * Responsibilities: Mount the Toaster once at app root; expose typed helper functions instead of
 *                    letting every feature import react-hot-toast directly
 * Dependencies: react-hot-toast, lucide-react
 * Export: ToastProvider (mount at app root), toast (success/error/info/loading helpers)
 */
import { Toaster, toast as hotToast } from 'react-hot-toast';
import { CheckCircle2, XCircle, Info, Loader2 } from 'lucide-react';

/** Mount once near the root of the app (see App.tsx) */
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        className: '!rounded-lg !shadow-popover !text-sm !text-ink-900 !border !border-surface-border',
      }}
    />
  );
}

export const toast = {
  success: (message: string) =>
    hotToast.custom((t) => <ToastCard visible={t.visible} icon={<CheckCircle2 className="h-5 w-5 text-success-600" />} message={message} />),
  error: (message: string) =>
    hotToast.custom((t) => <ToastCard visible={t.visible} icon={<XCircle className="h-5 w-5 text-danger-600" />} message={message} />),
  info: (message: string) =>
    hotToast.custom((t) => <ToastCard visible={t.visible} icon={<Info className="h-5 w-5 text-info-600" />} message={message} />),
  loading: (message: string) =>
    hotToast.custom((t) => <ToastCard visible={t.visible} icon={<Loader2 className="h-5 w-5 animate-spin text-primary-600" />} message={message} />),
  dismiss: hotToast.dismiss,
};

function ToastCard({ visible, icon, message }: { visible: boolean; icon: React.ReactNode; message: string }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border border-surface-border bg-white px-4 py-3 shadow-popover transition-all ${
        visible ? 'animate-fade-in' : 'opacity-0'
      }`}
    >
      {icon}
      <span className="text-sm font-medium text-ink-900">{message}</span>
    </div>
  );
}
