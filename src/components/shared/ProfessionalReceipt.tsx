/**
 * Purpose: Professional ERP/CRM Receipt Voucher Component
 * Design Requirements:
 * - Modern business design with white card, subtle shadow, rounded corners (12px), light gray border (#E5E7EB)
 * - Suitable for A4 printing with window.print() & PDF download with html2canvas + jsPDF
 * - Header: Logo, Company Name ("Shine Craft Technologies"), Tagline ("Create | Code | Connect"), centered "RECEIPT" title, right-bordered info box (Receipt No & Date)
 * - Body: 2 equal columns (Left: "Received From" client info; Right: 2-column key/value layout for Payment ID, Invoice No, Payment Mode, Reference No, Amount Received, Amount in Words)
 * - Footer: Centered "Thank you for your payment!", Bottom-Right circular company stamp placeholder with blue border & "Authorised Signatory"
 */
import { useRef, useState } from 'react';
import { Printer, Download, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Button } from '../ui/Button';
import { toast } from '../ui/Toast';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { numberToWordsRupees } from '../../utils/numberToWords';
import logo from '../../assets/shinecraft-logo (2).png';

export interface ReceiptData {
  receiptNo?: string;
  receiptDate?: string;
  companyName?: string;
  companyTagline?: string;
  clientName?: string;
  clientAddress?: string;
  paymentId?: string;
  invoiceNo?: string;
  paymentMode?: string;
  referenceNo?: string;
  amountReceived?: number;
  amountInWords?: string;
  signatoryTitle?: string;
}

export const SAMPLE_RECEIPT_DATA: ReceiptData = {
  receiptNo: 'RCP-2026-031',
  receiptDate: '2026-04-26',
  companyName: 'Shine Craft Technologies',
  companyTagline: 'Create | Code | Connect',
  clientName: 'ABC Industries',
  clientAddress: 'No.20,\nFirst Floor,\nUruvaiyar Main Road,\nUruvaiyar,\nPuducherry - 605110',
  paymentId: 'PAY-2026-030',
  invoiceNo: 'INV-2026-044',
  paymentMode: 'NEFT',
  referenceNo: 'UTR456789123456',
  amountReceived: 50000,
  amountInWords: 'Fifty Thousand Only',
  signatoryTitle: 'Authorised Signatory',
};

export interface ProfessionalReceiptProps {
  receipt?: ReceiptData;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function ProfessionalReceipt({
  receipt = SAMPLE_RECEIPT_DATA,
  onBack,
  showBackButton = true,
}: ProfessionalReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Merge provided props with default sample values
  const data: ReceiptData = {
    ...SAMPLE_RECEIPT_DATA,
    ...receipt,
  };

  const formattedAmount = data.amountReceived !== undefined ? formatCurrency(data.amountReceived) : '₹0.00';
  const computedWords =
    data.amountInWords ||
    (data.amountReceived !== undefined ? numberToWordsRupees(data.amountReceived) : 'Zero Only');

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    setIsDownloading(true);

    try {
      const canvas = await html2canvas(receiptRef.current, {
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
      pdf.save(`${data.receiptNo || 'Receipt'}.pdf`);

      toast.success('Receipt PDF downloaded successfully');
    } catch (err) {
      console.error('Failed to download PDF:', err);
      toast.error('Failed to generate receipt PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Toolbar (Hidden during browser print) */}
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
            <h2 className="text-base font-bold text-slate-900">Receipt Voucher Preview</h2>
            <p className="text-xs text-slate-500">Official Payment Voucher — Ready for Print & PDF</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Printer className="h-4 w-4" />}
            onClick={handlePrint}
          >
            Print Receipt
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

      {/* Printable Receipt Card (Pixel-perfect design for A4) */}
      <div className="flex justify-center">
        <div
          ref={receiptRef}
          className="receipt-card-container w-full max-w-[800px] rounded-[12px] border border-[#E5E7EB] bg-white p-6 sm:p-10 shadow-md print:max-w-none print:shadow-none print:border-slate-300 print:rounded-none print:p-6"
        >
          {/* ================= HEADER ================= */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:items-center border-b border-slate-200 pb-6">
            {/* LEFT: Company Logo */}
            <div className="flex items-center sm:col-span-1">
              <img
                src={logo}
                alt="Company Logo"
                className="h-14 w-auto max-w-[200px] object-contain"
              />
            </div>

            {/* CENTER: Large Bold Title */}
            <div className="text-center sm:col-span-1">
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-slate-900">
                RECEIPT
              </h2>
              <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="h-3 w-3" /> PAYMENT CONFIRMED
              </span>
            </div>

            {/* RIGHT: Bordered Information Box */}
            <div className="sm:col-span-1">
              <div className="rounded-lg border border-[#E5E7EB] bg-slate-50/80 p-3 text-right space-y-1.5 shadow-2xs">
                <div className="flex justify-between sm:justify-end gap-3 text-xs">
                  <span className="font-semibold text-slate-500">Receipt No:</span>
                  <span className="font-mono font-bold text-slate-900">{data.receiptNo}</span>
                </div>
                <div className="flex justify-between sm:justify-end gap-3 text-xs border-t border-slate-200/80 pt-1.5">
                  <span className="font-semibold text-slate-500">Receipt Date:</span>
                  <span className="font-medium text-slate-900">{formatDate(data.receiptDate || '')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= BODY ================= */}
          <div className="my-8 grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* LEFT COLUMN: Received From */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1.5">
                Received From
              </h3>
              <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-4 space-y-2">
                <p className="text-base font-extrabold text-slate-900">{data.clientName}</p>
                <p className="whitespace-pre-line text-xs font-normal leading-relaxed text-slate-600">
                  {data.clientAddress}
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN: Two-column Key/Value Layout */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1.5">
                Payment Details
              </h3>
              <div className="rounded-xl border border-[#E5E7EB] bg-slate-50/60 p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-200/60">
                  <span className="font-medium text-slate-500">Payment ID:</span>
                  <span className="font-mono font-bold text-slate-900">{data.paymentId}</span>
                </div>

                <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-200/60">
                  <span className="font-medium text-slate-500">Invoice No:</span>
                  <span className="font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {data.invoiceNo}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-200/60">
                  <span className="font-medium text-slate-500">Payment Mode:</span>
                  <span className="font-semibold text-slate-800">{data.paymentMode}</span>
                </div>

                <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-200/60">
                  <span className="font-medium text-slate-500">Reference No:</span>
                  <span className="font-mono text-xs text-slate-800">{data.referenceNo}</span>
                </div>

                <div className="flex items-center justify-between text-sm pt-1 pb-1.5 border-b border-slate-200/60">
                  <span className="font-bold text-slate-700">Amount Received:</span>
                  <span className="font-extrabold text-emerald-700 text-base">{formattedAmount}</span>
                </div>

                <div className="flex items-start justify-between text-xs pt-1">
                  <span className="font-medium text-slate-500 shrink-0 mr-2">Amount in Words:</span>
                  <span className="font-semibold text-slate-800 italic text-right">{computedWords}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= FOOTER ================= */}
          <div className="mt-10 border-t border-slate-200 pt-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              {/* Centered Message */}
              <div className="text-center sm:text-left">
                <p className="text-sm font-bold text-slate-700">
                  Thank you for your payment!
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  This receipt is computer-generated and constitutes official confirmation of payment.
                </p>
              </div>

              {/* Bottom Right: Circular Company Stamp & Authorised Signatory */}
              <div className="flex flex-col items-center justify-end text-center ml-auto sm:ml-0">
                {/* Circular Stamp Placeholder */}
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-blue-600 bg-blue-50/40 p-2 shadow-inner">
                  <div className="absolute inset-1 rounded-full border border-blue-400/50" />
                  <svg className="absolute inset-0 h-full w-full text-blue-600 opacity-90" viewBox="0 0 100 100">
                    <path
                      id="stampArc"
                      d="M 18,50 A 32,32 0 1,1 82,50"
                      fill="none"
                      stroke="none"
                    />
                    <text className="text-[7px] font-extrabold uppercase tracking-widest fill-blue-800">
                      <textPath href="#stampArc" startOffset="50%" textAnchor="middle">
                        Shine Craft Technologies
                      </textPath>
                    </text>
                  </svg>
                  <div className="z-10 text-center text-blue-900">
                    <div className="text-[9px] font-black uppercase tracking-tighter">OFFICIAL</div>
                    <div className="my-0.5 flex justify-center text-blue-600">
                      <Sparkles className="h-3 w-3" />
                    </div>
                    <div className="text-[7.5px] font-bold tracking-wider text-blue-700">STAMP</div>
                  </div>
                </div>

                {/* Authorised Signatory */}
                <div className="mt-2 w-32 border-t border-slate-300 pt-1 text-center text-[11px] font-semibold text-slate-800">
                  {data.signatoryTitle || 'Authorised Signatory'}
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
          .receipt-card-container {
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
