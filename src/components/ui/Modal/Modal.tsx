/**
 * Purpose: App-wide animated modal/popup — Create Invoice, Receive Payment, Create Milestone, etc.
 * Responsibilities: Accessible dialog (focus trap, ESC to close, overlay click to close) with
 *                    consistent header/body/footer slots and enter/exit animation
 * Dependencies: @radix-ui/react-dialog, lucide-react (X), cn()
 * Export: Modal, ModalBody, ModalFooter
 */
import { type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../../utils/cn';

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

export function Modal({ open, onOpenChange, title, description, children, size = 'md' }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink-900/40 animate-fade-in" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2',
            'max-h-[90vh] overflow-y-auto rounded-card bg-white shadow-modal animate-scale-in',
            sizeClasses[size]
          )}
        >
          <div className="flex items-start justify-between border-b border-surface-border px-6 py-4">
            <div>
              <Dialog.Title className="text-base font-semibold text-ink-900">{title}</Dialog.Title>
              {description && (
                <Dialog.Description className="mt-0.5 text-xs text-ink-500">{description}</Dialog.Description>
              )}
            </div>
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

export function ModalBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('px-6 py-5', className)}>{children}</div>;
}

export function ModalFooter({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('flex items-center justify-end gap-3 border-t border-surface-border px-6 py-4', className)}>
      {children}
    </div>
  );
}
