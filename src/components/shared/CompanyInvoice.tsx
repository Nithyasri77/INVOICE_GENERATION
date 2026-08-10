/**
 * Purpose: Enterprise Company Invoice Template Component
 * Design & Capabilities:
 * - Modern business aesthetic with white card, 12px rounded corners, subtle shadow, light border
 * - Displays Company Logo, Name, Tagline, Address, GSTIN, State Code, Contact Details
 * - Displays Client details (Company Name, Contact Person, Address, Phone, Email, GSTIN)
 * - Displays Invoice metadata (Invoice No, Dates, Project, Service Category, Billing Type, Stage, Quotation No)
 * - Line Items table (HSN/SAC, Qty, Rate, Amount)
 * - Financial breakdown (Sub Total, CGST 9%, SGST 9%, Total Amount, Amount Paid, Pending Amount)
 * - Amount in Words (INR)
 * - Bank Details block (Bank Name, Account Holder, Account Number, IFSC Code, Branch)
 * - Notes & Terms & Conditions
 * - Official circular company stamp & Authorised Signatory block
 * - A4 Print & PDF download optimized
 */
import { useRef, useState } from 'react';
import { Printer, Download, ArrowLeft, Send, CheckCircle2, AlertTriangle, Clock, Mail, Phone, Building2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Button } from '../ui/Button';
import { toast } from '../ui/Toast';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { amountInWordsINR } from '../../utils/numberToWords';
import type { Invoice } from '../../types/invoice.types';
import logo from '../../assets/shinecraft-logo (2).png';

export interface CompanyInvoiceProps {
  invoice: Invoice;
  companyInfo?: {
    companyName: string;
    tagline: string;
    address: string;
    gstin: string;
    stateCode: string;
    contactPhone: string;
    contactEmail: string;
  };
  bankDetails?: {
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    branch: string;
  };
  clientDetails?: {
    companyName: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    gstNumber?: string;
    address?: string;
  };
  amountPaid?: number;
  onBack?: () => void;
  showBackButton?: boolean;
  onOpenReminder?: () => void;
}

const DEFAULT_COMPANY_INFO = {
  companyName: 'Shine Craft Technologies',
  tagline: 'Craft | Code | Connect',
  address: 'No. 21, Francis Assisi Street, Kuruvikuppam, Puducherry - 605001',
  gstin: '34BJPPM7060H1ZM',
  stateCode: '34 — Puducherry',
  contactPhone: '+91 73000353789',
  contactEmail: 'solutions@shinecrafttech.com',
};

const DEFAULT_BANK_DETAILS = {
  bankName: 'HDFC Bank',
  accountHolderName: 'Shine Craft Technologies',
  accountNumber: '50100123456789',
  ifscCode: 'HDFC0001234',
  branch: 'Main Branch, Puducherry',
};

export function CompanyInvoice({
  invoice,
  companyInfo = DEFAULT_COMPANY_INFO,
  bankDetails = DEFAULT_BANK_DETAILS,
  clientDetails,
  amountPaid,
  onBack,
  showBackButton = true,
  onOpenReminder,
}: CompanyInvoiceProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Financial calculations
  const subTotal = invoice.amount;
  const cgst = invoice.cgst;
  const sgst = invoice.sgst;
  const totalAmount = subTotal + cgst + sgst;

  // Determine paid and pending amounts based on status and payments
  let calculatedPaid = 0;
  if (invoice.status === 'Paid') {
    calculatedPaid = totalAmount;
  } else if (amountPaid !== undefined) {
    calculatedPaid = amountPaid;
  } else if (invoice.status === 'Part Paid') {
    // Default estimated paid for demo part-paid status if not passed explicitly
    calculatedPaid = Math.round(totalAmount * 0.5);
  }

  const pendingAmount = Math.max(0, totalAmount - calculatedPaid);
  const isPendingPayment = invoice.status !== 'Paid' && pendingAmount > 0;

  // Formatting values
  const formattedSubTotal = formatCurrency(subTotal);
  const formattedCgst = formatCurrency(cgst);
  const formattedSgst = formatCurrency(sgst);
  const formattedTotal = formatCurrency(totalAmount);
  const formattedPaid = formatCurrency(calculatedPaid);
  const formattedPending = formatCurrency(pendingAmount);
  const wordsTotal = amountInWordsINR(totalAmount);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    setIsDownloading(true);

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoice.invoiceNo}.pdf`);

      toast.success(`Invoice ${invoice.invoiceNo}.pdf downloaded`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      toast.error('Failed to generate invoice PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  // Status Badge Config
  const getStatusBadge = () => {
    switch (invoice.status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> PAID IN FULL
          </span>
        );
      case 'Part Paid':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
            <Clock className="h-3.5 w-3.5 text-amber-600" /> PARTIALLY PAID
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-800">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" /> OVERDUE
          </span>
        );
      case 'Sent':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">
            <Send className="h-3.5 w-3.5 text-blue-600" /> PAYMENT PENDING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
            DRAFT
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar (Hidden during window.print()) */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={onBack}
            >
              Back
            </Button>
          )}
          <div>
            <h2 className="text-base font-bold text-slate-900">Tax Invoice #{invoice.invoiceNo}</h2>
            <p className="text-xs text-slate-500">Official Company Invoice — Ready for Print & PDF</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isPendingPayment && onOpenReminder && (
            <Button
              variant="secondary"
              size="sm"
              className="border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 font-medium"
              leftIcon={<Send className="h-4 w-4 text-amber-600" />}
              onClick={onOpenReminder}
            >
              Payment Pending Reminder
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Printer className="h-4 w-4" />}
            onClick={handlePrint}
          >
            Print
          </Button>
          <Button
            size="sm"
            isLoading={isDownloading}
            leftIcon={<Download className="h-4 w-4" />}
            onClick={handleDownloadPDF}
          >
            Download PDF
          </Button>
        </div>
      </div>

      {/* Main Printable Company Invoice Card */}
      <div className="flex justify-center">
        <div
          ref={invoiceRef}
          className="company-invoice-container w-full max-w-[850px] rounded-[12px] border border-[#E5E7EB] bg-white p-6 sm:p-10 shadow-lg print:max-w-none print:shadow-none print:border-slate-300 print:rounded-none print:p-6"
        >
          {/* ================= HEADER SECTION ================= */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-12 sm:items-start border-b border-slate-200 pb-6">
            {/* LEFT (Cols 1-7): Company Logo & Profile */}
            <div className="sm:col-span-7 space-y-2">
              <div className="flex items-center gap-3">
                <img
                  src={logo}
                  alt={companyInfo.companyName}
                  className="h-12 w-auto max-w-[180px] object-contain"
                />
              </div>
              <div className="space-y-0.5 pt-1">
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                  {companyInfo.companyName}
                </h1>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {companyInfo.tagline}
                </p>
                <p className="text-xs text-slate-600 max-w-md leading-relaxed pt-1">
                  {companyInfo.address}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-1 font-medium">
                  <span>
                    <strong className="text-slate-700">GSTIN:</strong> {companyInfo.gstin}
                  </span>
                  <span>
                    <strong className="text-slate-700">State Code:</strong> {companyInfo.stateCode}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 font-medium">
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3 w-3 text-slate-400" /> {companyInfo.contactPhone}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-3 w-3 text-slate-400" /> {companyInfo.contactEmail}
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT (Cols 8-12): TAX INVOICE Header & Metadata */}
            <div className="sm:col-span-5 flex flex-col items-start sm:items-end justify-between space-y-3">
              <div className="text-left sm:text-right space-y-1">
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-blue-700">
                  TAX INVOICE
                </h2>
                <div className="pt-1">{getStatusBadge()}</div>
              </div>

              {/* Invoice Meta Box */}
              <div className="w-full rounded-lg border border-slate-200 bg-slate-50/80 p-3.5 space-y-2 text-xs shadow-2xs">
                <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                  <span className="font-semibold text-slate-500">Invoice No:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{invoice.invoiceNo}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-500">Invoice Date:</span>
                  <span className="font-semibold text-slate-800">{formatDate(invoice.invoiceDate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-500">Due Date:</span>
                  <span className={`font-semibold ${invoice.status === 'Overdue' ? 'text-rose-600 font-bold' : 'text-slate-800'}`}>
                    {formatDate(invoice.dueDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= BILLED TO & PROJECT DETAILS ================= */}
          <div className="my-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* CLIENT / CUSTOMER DETAILS */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 space-y-2.5">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Billed To (Client / Customer)
                </h3>
              </div>
              <div className="space-y-1">
                <p className="text-base font-extrabold text-slate-900">
                  {clientDetails?.companyName || invoice.clientName}
                </p>
                {clientDetails?.contactPerson && (
                  <p className="text-xs font-medium text-slate-700">
                    Attn: {clientDetails.contactPerson}
                  </p>
                )}
                {clientDetails?.address && (
                  <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                    {clientDetails.address}
                  </p>
                )}
                <div className="pt-1.5 space-y-1 text-xs text-slate-600">
                  {clientDetails?.phone && (
                    <p><span className="font-medium text-slate-500">Phone:</span> {clientDetails.phone}</p>
                  )}
                  {clientDetails?.email && (
                    <p><span className="font-medium text-slate-500">Email:</span> {clientDetails.email}</p>
                  )}
                  {clientDetails?.gstNumber && (
                    <p><span className="font-medium text-slate-500">GSTIN:</span> {clientDetails.gstNumber}</p>
                  )}
                </div>
              </div>
            </div>

            {/* PROJECT & BILLING DETAILS */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 space-y-2.5">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Invoice & Billing Metadata
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="block font-medium text-slate-500">Project:</span>
                  <span className="font-semibold text-slate-900">{invoice.projectName}</span>
                </div>
                <div>
                  <span className="block font-medium text-slate-500">Service Category:</span>
                  <span className="font-semibold text-slate-800">{invoice.serviceCategory}</span>
                </div>
                <div>
                  <span className="block font-medium text-slate-500">Billing Type:</span>
                  <span className="font-medium text-slate-800">{invoice.billingType}</span>
                </div>
                <div>
                  <span className="block font-medium text-slate-500">Stage / Milestone:</span>
                  <span className="font-medium text-slate-800">{invoice.billingStage}</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-200/80">
                  <span className="font-medium text-slate-500">Quotation Reference:</span>{' '}
                  <span className="font-mono font-semibold text-blue-700">{invoice.quotationNo}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= INVOICE ITEMS TABLE ================= */}
          <div className="my-6 overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-3 w-10 text-center">#</th>
                  <th className="px-4 py-3">Item Description</th>
                  <th className="px-3 py-3 w-24">HSN / SAC</th>
                  <th className="px-3 py-3 w-16 text-right">Qty</th>
                  <th className="px-4 py-3 w-28 text-right">Rate (₹)</th>
                  <th className="px-4 py-3 w-32 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item, idx) => (
                    <tr key={item.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="px-3 py-3 text-center font-medium text-slate-500">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{item.description}</td>
                      <td className="px-3 py-3 font-mono text-slate-600">{item.hsnSac || '—'}</td>
                      <td className="px-3 py-3 text-right font-medium">{item.qty}</td>
                      <td className="px-4 py-3 text-right font-mono">{item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">
                        {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                      No line items recorded
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ================= SUMMARY & PAYMENT DETAILS ================= */}
          <div className="my-6 grid grid-cols-1 gap-6 md:grid-cols-12 items-start">
            {/* LEFT (Cols 1-7): Bank Details & Amount in Words */}
            <div className="md:col-span-7 space-y-4">
              {/* Amount in Words */}
              <div className="rounded-lg bg-blue-50/50 border border-blue-100 p-3 text-xs">
                <span className="font-bold text-slate-600 block mb-0.5">Amount in Words:</span>
                <span className="font-medium italic text-blue-900">{wordsTotal}</span>
              </div>

              {/* Bank Payment Details */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2 text-xs">
                <h4 className="font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1.5">
                  Bank & Payment Details
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-slate-700 pt-1">
                  <div>
                    <span className="font-semibold text-slate-500 block">Bank Name:</span>
                    <span className="font-bold text-slate-900">{bankDetails.bankName}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block">Account Name:</span>
                    <span className="font-semibold text-slate-900">{bankDetails.accountHolderName}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block">Account Number:</span>
                    <span className="font-mono font-bold text-slate-900">{bankDetails.accountNumber}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block">IFSC Code:</span>
                    <span className="font-mono font-bold text-slate-900">{bankDetails.ifscCode}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-semibold text-slate-500 block">Branch:</span>
                    <span>{bankDetails.branch}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div className="text-xs text-slate-600 space-y-1">
                  <span className="font-semibold text-slate-700">Terms & Notes:</span>
                  <p className="italic text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-100">
                    {invoice.notes}
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT (Cols 8-12): Totals Box */}
            <div className="md:col-span-5 rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-2.5 text-xs shadow-2xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Sub Total:</span>
                <span className="font-mono font-medium text-slate-900">{formattedSubTotal}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>CGST (9%):</span>
                <span className="font-mono font-medium text-slate-900">{formattedCgst}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>SGST (9%):</span>
                <span className="font-mono font-medium text-slate-900">{formattedSgst}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 font-medium border-t border-slate-200 pt-2">
                <span>Total GST (18%):</span>
                <span className="font-mono text-slate-900">{formatCurrency(cgst + sgst)}</span>
              </div>

              <div className="flex justify-between items-center border-t-2 border-slate-900 pt-2.5 text-sm font-extrabold text-slate-900">
                <span>Total Invoice Amount:</span>
                <span className="font-mono text-blue-700 text-base">{formattedTotal}</span>
              </div>

              {/* Paid & Pending Breakdown */}
              <div className="border-t border-slate-200 pt-2.5 space-y-1.5">
                <div className="flex justify-between items-center text-emerald-800 font-semibold">
                  <span>Amount Paid:</span>
                  <span className="font-mono">{formattedPaid}</span>
                </div>
                <div className={`flex justify-between items-center font-bold p-2 rounded ${pendingAmount > 0 ? 'bg-amber-100/70 text-amber-900 border border-amber-200' : 'bg-emerald-100/50 text-emerald-900'}`}>
                  <span>Pending Amount:</span>
                  <span className="font-mono text-sm">{formattedPending}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= FOOTER SECTION ================= */}
          <div className="mt-10 border-t border-slate-200 pt-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              {/* Centered Message */}
              <div className="text-center sm:text-left space-y-1">
                <p className="text-xs font-bold text-slate-800">
                  Thank you for your business!
                </p>
                <p className="text-[11px] text-slate-500 max-w-sm">
                  Please include Invoice #{invoice.invoiceNo} on your payment reference. For queries, email {companyInfo.contactEmail}.
                </p>
              </div>

              {/* Bottom Right: Circular Company Stamp & Authorised Signatory */}
              <div className="flex flex-col items-center justify-end text-center ml-auto sm:ml-0">
                {/* Stamp */}
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-blue-600 bg-blue-50/40 p-2 shadow-inner">
                  <div className="absolute inset-1 rounded-full border border-blue-400/50" />
                  <div className="z-10 text-center text-blue-900">
                    <div className="text-[8px] font-black uppercase tracking-tighter">SHINE CRAFT</div>
                    <div className="text-[6.5px] font-bold tracking-wider text-blue-700 uppercase">TECHNOLOGIES</div>
                    <div className="text-[6px] font-medium text-emerald-700">VERIFIED</div>
                  </div>
                </div>

                <div className="mt-2 w-36 border-t border-slate-300 pt-1 text-center text-[11px] font-semibold text-slate-800">
                  Authorised Signatory
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Specific CSS */}
      <style>{`
        @media print {
          body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          .company-invoice-container {
            box-shadow: none !important;
            border: 1px solid #cbd5e1 !important;
            max-width: 100% !important;
            width: 100% !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}
