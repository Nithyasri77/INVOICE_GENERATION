/**
 * Purpose: Slide-in side panel — used for quick-view details, mobile filter panels
 * Responsibilities: Accessible dialog anchored to the right edge with slide-in animation
 * Dependencies: @radix-ui/react-dialog, lucide-react (X), cn()
 * Export: Drawer, DrawerBody, DrawerFooter
 */
import { type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../../utils/cn';

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  width?: 'sm' | 'md' | 'lg';
}

const widthClasses: Record<NonNullable<DrawerProps['width']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function Drawer({ open, onOpenChange, title, children, width = 'md' }: DrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink-900/40 animate-fade-in" />
        <Dialog.Content
          className={cn(
            'fixed right-0 top-0 z-50 h-full w-full overflow-y-auto bg-white shadow-modal animate-slide-in-right',
            widthClasses[width]
          )}
        >
          <div className="flex items-center justify-between border-b border-surface-border px-6 py-4">
            <Dialog.Title className="text-base font-semibold text-ink-900">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-md p-1 text-ink-400 hover:bg-surface-bg hover:text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function DrawerBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('px-6 py-5', className)}>{children}</div>;
}

export function DrawerFooter({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('flex items-center justify-end gap-3 border-t border-surface-border px-6 py-4', className)}>
      {children}
    </div>
  );
}
