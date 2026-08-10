/**
 * Purpose: Payment Pending Reminder Modal Component
 * Responsibilities:
 * - Render polite payment reminder popup for Pending, Part Paid, or Overdue invoices/payments
 * - Provide Option 1: WhatsApp sharing (via wa.me link with prefilled dynamic message)
 * - Provide Option 2: Email sharing (via mailto: link with prefilled recipient, subject, and body)
 * - Option to copy message text to clipboard
 * - Informative notification regarding backend SMTP/API configuration for direct automated emailing
 * Dependencies: Modal, ModalBody, ModalFooter, Button, Input, Textarea, Toast, formatCurrency, formatDate
 */
import { useState } from 'react';
import { Send, Mail, Copy, Check, ExternalLink, Info, AlertTriangle } from 'lucide-react';
import { Modal, ModalBody, ModalFooter } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { toast } from '../ui/Toast';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { getClientInfoByName } from '../../utils/clientHelper';
import type { Invoice } from '../../types/invoice.types';
import type { Payment } from '../../types/payment.types';

export interface PaymentReminderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Invoice;
  payment?: Payment;
  companyName?: string;
}

export function PaymentReminderModal({
  open,
  onOpenChange,
  invoice,
  payment,
  companyName = 'Shine Craft Technologies',
}: PaymentReminderModalProps) {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'email'>('whatsapp');
  const [copied, setCopied] = useState(false);

  if (!invoice && !payment) return null;

  // Resolve invoice details
  const invoiceNo = invoice?.invoiceNo || payment?.invoiceNo || 'INV-2025-001';
  const clientName = invoice?.clientName || payment?.projectName?.split('—')[0]?.trim() || 'Valued Client';
  const invoiceDate = invoice?.invoiceDate || payment?.paymentDate || '2025-02-05';
  const dueDate = invoice?.dueDate || payment?.paymentDate || '2025-02-15';

  // Resolve calculations
  const totalAmount = invoice ? invoice.amount + invoice.cgst + invoice.sgst : (payment?.amount || 0);
  let amountPaid = 0;
  if (invoice?.status === 'Paid') {
    amountPaid = totalAmount;
  } else if (invoice?.status === 'Part Paid') {
    amountPaid = Math.round(totalAmount * 0.5); // Default demo part paid if not specified
  } else if (payment && payment.status === 'Reconciled') {
    amountPaid = payment.amount;
  }

  const pendingAmount = Math.max(0, totalAmount - amountPaid);
  const status = invoice?.status || (payment?.status === 'Pending' ? 'Pending' : 'Overdue');
  const isOverdue = status === 'Overdue' || new Date(dueDate) < new Date();

  // Resolve client contact details
  const clientInfo = getClientInfoByName(clientName);
  const clientEmail = clientInfo.email || `accounts@${clientName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
  const clientPhone = clientInfo.phone || '+91 98765 43210';

  // Construct dynamic reminder message
  const reminderMessage = `Dear ${clientInfo.contactPerson || clientName},

This is a friendly reminder regarding the pending payment for Invoice #${invoiceNo}.

Invoice Amount: ${formatCurrency(totalAmount)}
Pending Amount: ${formatCurrency(pendingAmount)}
Due Date: ${formatDate(dueDate)}

${isOverdue ? 'Note: This payment is currently overdue. ' : ''}Kindly arrange the pending payment at your earliest convenience.

Thank you,
${companyName}`;

  const emailSubject = `Payment Reminder – Invoice #${invoiceNo}`;

  // WhatsApp click handler
  const handleShareWhatsApp = () => {
    const cleanPhone = clientPhone.replace(/[^0-9]/g, '');
    const encodedMsg = encodeURIComponent(reminderMessage);
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodedMsg}`
      : `https://api.whatsapp.com/send?text=${encodedMsg}`;

    window.open(waUrl, '_blank');
    toast.success('Opening WhatsApp with payment reminder message');
  };

  // Email click handler
  const handleSendEmail = () => {
    const mailtoUrl = `mailto:${encodeURIComponent(clientEmail)}?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(reminderMessage)}`;

    window.location.href = mailtoUrl;
    toast.success('Opening mail client with prefilled payment reminder');
  };

  // Copy to clipboard handler
  const handleCopyText = () => {
    navigator.clipboard.writeText(reminderMessage);
    setCopied(true);
    toast.success('Payment reminder copied to clipboard');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Payment Pending Reminder"
      description={`Send payment reminder to ${clientName} for Invoice #${invoiceNo}`}
      size="lg"
    >
      <ModalBody className="space-y-5">
        {/* Payment Status Summary Card */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Client Name</span>
              <span className="text-sm font-extrabold text-slate-900">{clientName}</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-500 block">Invoice Number</span>
              <span className="text-sm font-mono font-bold text-blue-700">{invoiceNo}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
            <div>
              <span className="text-slate-500 block font-medium">Invoice Date</span>
              <span className="font-semibold text-slate-800">{formatDate(invoiceDate)}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Due Date</span>
              <span className={`font-semibold ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-800'}`}>
                {formatDate(dueDate)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Total Amount</span>
              <span className="font-semibold text-slate-900">{formatCurrency(totalAmount)}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Pending Balance</span>
              <span className="font-bold text-amber-700 text-sm">{formatCurrency(pendingAmount)}</span>
            </div>
          </div>

          {isOverdue && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-800 font-medium">
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>
                <strong>Payment Overdue:</strong> Due date was {formatDate(dueDate)}. Urgent reminder recommended.
              </span>
            </div>
          )}
        </div>

        {/* Tab Selection Bar */}
        <div className="flex rounded-lg bg-slate-100 p-1 text-sm font-semibold">
          <button
            type="button"
            className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 transition-all ${
              activeTab === 'whatsapp'
                ? 'bg-white text-emerald-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setActiveTab('whatsapp')}
          >
            <Send className="h-4 w-4 text-emerald-600" /> Option 1: WhatsApp
          </button>
          <button
            type="button"
            className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 transition-all ${
              activeTab === 'email'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setActiveTab('email')}
          >
            <Mail className="h-4 w-4 text-blue-600" /> Option 2: Email
          </button>
        </div>

        {/* WhatsApp Tab View */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Client WhatsApp Phone Number:</span>
              <span className="font-mono font-bold text-slate-900">{clientPhone}</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Dynamic WhatsApp Message:</label>
              <Textarea
                rows={7}
                readOnly
                value={reminderMessage}
                className="font-sans text-xs leading-relaxed bg-slate-50 border-slate-200 text-slate-800"
              />
            </div>
          </div>
        )}

        {/* Email Tab View */}
        {activeTab === 'email' && (
          <div className="space-y-3">
            <Input
              label="Recipient Email"
              value={clientEmail}
              readOnly
              className="text-xs font-mono bg-slate-50"
            />
            <Input
              label="Email Subject"
              value={emailSubject}
              readOnly
              className="text-xs font-semibold bg-slate-50 text-slate-900"
            />
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Email Body:</label>
              <Textarea
                rows={6}
                readOnly
                value={reminderMessage}
                className="font-sans text-xs leading-relaxed bg-slate-50 border-slate-200 text-slate-800"
              />
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-blue-50/70 border border-blue-200 p-2.5 text-xs text-blue-900">
              <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>Note on Direct Automated Emailing:</strong> Clicking &quot;Send Email&quot; opens your default mail client with prefilled details. For automated background email delivery directly from the app server, backend API integration with an SMTP provider (e.g., SendGrid, AWS SES, or NodeMailer) is required.
              </span>
            </div>
          </div>
        )}
      </ModalBody>

      <ModalFooter className="flex flex-wrap items-center justify-between gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          leftIcon={copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          onClick={handleCopyText}
        >
          {copied ? 'Copied!' : 'Copy Text'}
        </Button>

        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>

          {activeTab === 'whatsapp' ? (
            <Button
              type="button"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              leftIcon={<Send className="h-4 w-4" />}
              rightIcon={<ExternalLink className="h-3.5 w-3.5 opacity-80" />}
              onClick={handleShareWhatsApp}
            >
              Share via WhatsApp
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
              leftIcon={<Mail className="h-4 w-4" />}
              onClick={handleSendEmail}
            >
              Send Email
            </Button>
          )}
        </div>
      </ModalFooter>
    </Modal>
  );
}
