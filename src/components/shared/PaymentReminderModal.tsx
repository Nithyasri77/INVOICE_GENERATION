/**
 * Purpose: Payment Pending Reminder Modal Component
 * Responsibilities:
 * - Render polite payment reminder popup for Pending, Part Paid, or Overdue invoices/payments
 * - Provide Option 1: WhatsApp sharing (via wa.me link with normalized recipient phone & dynamic message)
 * - Provide Option 2: Email sharing (via mailto: link with recipient email, subject, and body)
 * - Display Client Verification details before sharing (Client Name, Phone, Email, Invoice No, Pending Amount, Due Date)
 * - Validate Phone & Email to ensure no silent default/dummy fallbacks and show user-friendly error notifications
 * - Option to copy message text to clipboard
 * Dependencies: Modal, ModalBody, ModalFooter, Button, Input, Textarea, Toast, formatCurrency, formatDate, phoneUtils, clientHelper
 */
import { useState, useEffect } from 'react';
import { Send, Mail, Copy, Check, ExternalLink, Info, AlertTriangle, UserCheck, ShieldAlert } from 'lucide-react';
import { Modal, ModalBody, ModalFooter } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { toast } from '../ui/Toast';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { getClientInfoByName } from '../../utils/clientHelper';
import { normalizePhoneNumber, isValidWhatsAppPhone, isValidEmail } from '../../utils/phoneUtils';
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

  // Dynamic fields
  const invoiceNo = invoice?.invoiceNo || payment?.invoiceNo || 'INV-2025-001';
  const clientName = invoice?.clientName || payment?.clientName || payment?.projectName?.split('—')[0]?.trim() || 'Valued Client';
  const invoiceDate = invoice?.invoiceDate || payment?.paymentDate || '2025-02-05';
  const dueDate = invoice?.dueDate || payment?.paymentDate || '2025-02-15';

  // Resolve calculations
  const totalAmount = invoice ? invoice.amount + invoice.cgst + invoice.sgst : (payment?.amount || 0);
  let amountPaid = 0;
  if (invoice?.status === 'Paid') {
    amountPaid = totalAmount;
  } else if (invoice?.status === 'Part Paid') {
    amountPaid = Math.round(totalAmount * 0.5);
  } else if (payment && payment.status === 'Reconciled') {
    amountPaid = payment.amount;
  }

  const pendingAmount = Math.max(0, totalAmount - amountPaid);
  const status = invoice?.status || (payment?.status === 'Pending' ? 'Pending' : 'Overdue');
  const isOverdue = status === 'Overdue' || new Date(dueDate) < new Date();

  // Resolve real client contact details dynamically
  const projectName = payment?.projectName || invoice?.projectName;
  const clientInfo = getClientInfoByName(clientName, invoiceNo, projectName);
  const displayClientName = clientInfo.companyName || clientName;
  const defaultEmail = clientInfo.email || '';
  const defaultPhone = clientInfo.phone || '';

  const defaultMessage = `Dear ${clientInfo.contactPerson || displayClientName},

This is a friendly reminder regarding the pending payment for Invoice #${invoiceNo}.

Invoice Amount: ${formatCurrency(totalAmount)}
Pending Amount: ${formatCurrency(pendingAmount)}
Due Date: ${formatDate(dueDate)}

${isOverdue ? 'Note: This payment is currently overdue. ' : ''}Kindly arrange the pending payment at your earliest convenience.

Thank you,
${companyName}`;

  // Editable local state for custom phone numbers / email / message
  const [phone, setPhone] = useState(defaultPhone);
  const [email, setEmail] = useState(defaultEmail);
  const [message, setMessage] = useState(defaultMessage);

  useEffect(() => {
    if (open) {
      setPhone(defaultPhone);
      setEmail(defaultEmail);
      setMessage(defaultMessage);
    }
  }, [open, defaultPhone, defaultEmail, defaultMessage]);

  if (!invoice && !payment) return null;

  const emailSubject = `Payment Reminder – Invoice #${invoiceNo}`;

  // Phone and Email Validations
  const isPhoneValid = isValidWhatsAppPhone(phone);
  const isEmailValid = isValidEmail(email);
  const normalizedPhone = normalizePhoneNumber(phone);

  // WhatsApp click handler
  const handleShareWhatsApp = () => {
    if (!isPhoneValid) {
      toast.error('WhatsApp reminder cannot be sent because this client does not have a phone number.');
      return;
    }
    const encodedMsg = encodeURIComponent(message);
    const waUrl = `https://wa.me/${normalizedPhone}?text=${encodedMsg}`;

    window.open(waUrl, '_blank');
    toast.success(`Opening WhatsApp for +${normalizedPhone}`);
  };

  // Email click handler
  const handleSendEmail = () => {
    if (!isEmailValid) {
      toast.error('Email reminder cannot be sent because this client does not have an email address.');
      return;
    }
    const mailtoUrl = `mailto:${encodeURIComponent(email.trim())}?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(message)}`;

    window.location.href = mailtoUrl;
    toast.success(`Opening mail client for ${email.trim()}`);
  };

  // Copy to clipboard handler
  const handleCopyText = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    toast.success('Payment reminder copied to clipboard');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Payment Pending Reminder"
      description={`Verify client contact details and send reminder for Invoice #${invoiceNo}`}
      size="lg"
    >
      <ModalBody className="space-y-5">
        {/* Client & Payment Verification Banner */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/90 p-4 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Verified Client Contact & Invoice Details
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {invoiceNo}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 font-medium block">Client Company:</span>
              <span className="font-extrabold text-slate-900 text-sm">{displayClientName}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Attention / Contact Person:</span>
              <span className="font-semibold text-slate-800">{clientInfo.contactPerson || 'Accounts Team'}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">WhatsApp Phone:</span>
              <span className={`font-mono font-bold ${isPhoneValid ? 'text-emerald-700' : 'text-rose-600 font-semibold'}`}>
                {phone ? phone : 'No phone number available'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Email Address:</span>
              <span className={`font-mono font-bold ${isEmailValid ? 'text-blue-700' : 'text-rose-600 font-semibold'}`}>
                {email ? email : 'No email address available'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs pt-2 border-t border-slate-200/80">
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
            <Input
              label="Recipient WhatsApp Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 91234 56789"
              className="text-xs font-mono"
            />

            {/* Validation Notice if Phone is Missing / Invalid */}
            {!isPhoneValid ? (
              <div className="flex items-start gap-2 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
                <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  <strong>WhatsApp reminder cannot be sent because this client does not have a phone number.</strong> Please update the client&apos;s phone number to send WhatsApp reminders.
                </span>
              </div>
            ) : (
              <div className="text-[11px] text-emerald-800 font-mono bg-emerald-50/70 p-2 rounded border border-emerald-200">
                Normalized WhatsApp recipient: <strong>+{normalizedPhone}</strong>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Dynamic WhatsApp Message:</label>
              <Textarea
                rows={7}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="font-sans text-xs leading-relaxed border-slate-200 text-slate-800"
              />
            </div>
          </div>
        )}

        {/* Email Tab View */}
        {activeTab === 'email' && (
          <div className="space-y-3">
            <Input
              label="Recipient Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@company.com"
              className="text-xs font-mono"
            />

            {/* Validation Notice if Email is Missing / Invalid */}
            {!isEmailValid && (
              <div className="flex items-start gap-2 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
                <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Email reminder cannot be sent because this client does not have an email address.</strong> Please update the client&apos;s email address to send email reminders.
                </span>
              </div>
            )}

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
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="font-sans text-xs leading-relaxed border-slate-200 text-slate-800"
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
              disabled={!isPhoneValid}
              className={`font-bold text-white ${isPhoneValid ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-300 opacity-60 cursor-not-allowed'}`}
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
              disabled={!isEmailValid}
              className={`font-bold text-white ${isEmailValid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-300 opacity-60 cursor-not-allowed'}`}
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
