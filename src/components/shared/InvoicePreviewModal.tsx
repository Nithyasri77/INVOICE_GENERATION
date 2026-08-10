/**
 * Purpose: Invoice Preview Modal Component
 * Responsibilities:
 * - Render CompanyInvoice inside a clean full-width preview modal
 * - Allows switching between Invoice View, Print, PDF Download, and Payment Reminder trigger
 * Dependencies: Modal, CompanyInvoice, PaymentReminderModal, invoice.types, clientHelper
 */
import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { CompanyInvoice } from './CompanyInvoice';
import { PaymentReminderModal } from './PaymentReminderModal';
import { getClientInfoByName } from '../../utils/clientHelper';
import type { Invoice } from '../../types/invoice.types';

export interface InvoicePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Invoice;
  amountPaid?: number;
}

export function InvoicePreviewModal({ open, onOpenChange, invoice, amountPaid }: InvoicePreviewModalProps) {
  const [reminderOpen, setReminderOpen] = useState(false);

  if (!invoice) return null;

  // Resolve client details for invoice view
  const clientInfo = getClientInfoByName(invoice.clientName);
  const clientDetails = {
    companyName: invoice.clientName,
    contactPerson: clientInfo.contactPerson,
    phone: clientInfo.phone,
    email: clientInfo.email,
    gstNumber: clientInfo.gstNumber,
    address: clientInfo.address,
  };

  return (
    <>
      <Modal open={open} onOpenChange={onOpenChange} title={`Company Invoice Preview — ${invoice.invoiceNo}`} size="xl">
        <div className="p-2 sm:p-4 bg-slate-100 min-h-[80vh] rounded-b-xl overflow-y-auto">
          <CompanyInvoice
            invoice={invoice}
            clientDetails={clientDetails}
            amountPaid={amountPaid}
            onBack={() => onOpenChange(false)}
            showBackButton={false}
            onOpenReminder={() => setReminderOpen(true)}
          />
        </div>
      </Modal>

      {/* Embedded Reminder Modal if triggered from Preview */}
      <PaymentReminderModal
        open={reminderOpen}
        onOpenChange={setReminderOpen}
        invoice={invoice}
      />
    </>
  );
}
