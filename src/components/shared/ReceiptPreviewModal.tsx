/**
 * Purpose: Reusable Modal wrapper for Professional Receipt Preview
 * Responsibilities: Render Modal overlay containing ProfessionalReceipt component with print and PDF support.
 */
import { Modal, ModalBody } from '../ui/Modal';
import { ProfessionalReceipt, type ReceiptData } from './ProfessionalReceipt';

export interface ReceiptPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt?: ReceiptData;
}

export function ReceiptPreviewModal({ open, onOpenChange, receipt }: ReceiptPreviewModalProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={`Payment Receipt — ${receipt?.receiptNo || 'RCP-2026-031'}`}
      size="xl"
    >
      <ModalBody className="p-2 sm:p-4">
        <ProfessionalReceipt
          receipt={receipt}
          onBack={() => onOpenChange(false)}
          showBackButton={false}
        />
      </ModalBody>
    </Modal>
  );
}
