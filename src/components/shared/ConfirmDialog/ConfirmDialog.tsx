/**
 * Purpose: Generic confirmation dialog — used for every "Delete X?" prompt across all modules
 * Responsibilities: Small modal with a warning icon, message, Cancel + destructive Confirm button
 * Dependencies: Modal/ModalBody/ModalFooter (ui), Button (ui), lucide-react (AlertTriangle)
 * Export: ConfirmDialog
 */
import { AlertTriangle } from 'lucide-react';
import { Modal, ModalBody, ModalFooter } from '../../ui/Modal';
import { Button } from '../../ui/Button';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  isLoading?: boolean;
  destructive?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  isLoading,
  destructive = true,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title} size="sm">
      <ModalBody>
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger-50 text-danger-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <p className="pt-2 text-sm text-ink-700">{description}</p>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button variant={destructive ? 'danger' : 'primary'} onClick={onConfirm} isLoading={isLoading}>
          {confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
