/**
 * Purpose: Render a printable Tax Invoice PDF matching the new enterprise Company Invoice design
 *          Company header, Bill To client block with GSTIN/Phone/Email, Project meta, line-items
 *          table, Sub Total/CGST/SGST/Total, Amount Paid, Pending Amount, Amount in Words, Bank
 *          details block, thank-you footer & official circular stamp.
 * Responsibilities: generateInvoicePDF(invoice, amountPaid) -> triggers browser download of PDF
 * Dependencies: jspdf, jspdf-autotable, invoice.types, formatDate, numberToWords, clientHelper
 * Export: generateInvoicePDF
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Invoice } from '../types/invoice.types';
import { formatDate } from './formatDate';
import { amountInWordsINR } from './numberToWords';
import { getClientInfoByName } from './clientHelper';

const COMPANY = {
  name: 'Shine Craft Technologies',
  tagline: 'Craft | Code | Connect',
  address: 'No. 21, Francis Assisi Street, Kuruvikuppam, Puducherry - 605001',
  gstin: 'GSTIN: 34BJPPM7060H1ZM',
  stateCode: 'State Code: 34',
  contact: 'Contact: +91 73000353789  |  Email: solutions@shinecrafttech.com',
};

const BANK_DETAILS = {
  bankName: 'HDFC Bank',
  accountHolderName: 'Shine Craft Technologies',
  accountNumber: '50100123456789',
  ifscCode: 'HDFC0001234',
  branch: 'Main Branch, Puducherry',
};

export function generateInvoicePDF(invoice: Invoice, amountPaid?: number): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.width;
  const margin = 14;

  const clientInfo = getClientInfoByName(invoice.clientName);

  // Financial calculations
  const subTotal = invoice.amount;
  const cgst = invoice.cgst;
  const sgst = invoice.sgst;
  const totalAmount = subTotal + cgst + sgst;

  let calculatedPaid = 0;
  if (invoice.status === 'Paid') {
    calculatedPaid = totalAmount;
  } else if (amountPaid !== undefined) {
    calculatedPaid = amountPaid;
  } else if (invoice.status === 'Part Paid') {
    calculatedPaid = Math.round(totalAmount * 0.5);
  }
  const pendingAmount = Math.max(0, totalAmount - calculatedPaid);

  // --- Header: Company Block (Left) + TAX INVOICE title & meta box (Right) ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(COMPANY.name, margin, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(COMPANY.tagline, margin, 21);
  doc.text(COMPANY.address, margin, 25.5);
  doc.text(`${COMPANY.gstin}  |  ${COMPANY.stateCode}`, margin, 30);
  doc.text(COMPANY.contact, margin, 34.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(29, 78, 216); // blue-700
  doc.text('TAX INVOICE', pageWidth - margin, 16, { align: 'right' });

  // Status Badge
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  if (invoice.status === 'Paid') {
    doc.setTextColor(22, 101, 52); // emerald-800
    doc.text('[ PAID IN FULL ]', pageWidth - margin, 21.5, { align: 'right' });
  } else if (invoice.status === 'Part Paid') {
    doc.setTextColor(146, 64, 14); // amber-800
    doc.text('[ PARTIALLY PAID ]', pageWidth - margin, 21.5, { align: 'right' });
  } else if (invoice.status === 'Overdue') {
    doc.setTextColor(153, 27, 27); // rose-800
    doc.text('[ OVERDUE ]', pageWidth - margin, 21.5, { align: 'right' });
  } else {
    doc.setTextColor(30, 64, 175); // blue-800
    doc.text('[ PAYMENT PENDING ]', pageWidth - margin, 21.5, { align: 'right' });
  }

  // Invoice Meta Box
  const metaX = pageWidth - margin;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Invoice No: ${invoice.invoiceNo}`, metaX, 27, { align: 'right' });
  doc.text(`Invoice Date: ${formatDate(invoice.invoiceDate)}`, metaX, 31.5, { align: 'right' });
  doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, metaX, 36, { align: 'right' });

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, 39.5, pageWidth - margin, 39.5);

  // --- Billed To (Left Column) + Project & Billing Details (Right Column) ---
  let y = 46;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('BILLED TO (CLIENT / CUSTOMER)', margin, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.clientName, margin, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  let cy = y + 9.5;
  if (clientInfo.contactPerson) {
    doc.text(`Attn: ${clientInfo.contactPerson}`, margin, cy);
    cy += 4;
  }
  if (clientInfo.address) {
    doc.text(clientInfo.address, margin, cy);
    cy += 4;
  }
  if (clientInfo.phone) {
    doc.text(`Phone: ${clientInfo.phone}`, margin, cy);
    cy += 4;
  }
  if (clientInfo.email) {
    doc.text(`Email: ${clientInfo.email}`, margin, cy);
    cy += 4;
  }
  if (clientInfo.gstNumber) {
    doc.text(`GSTIN: ${clientInfo.gstNumber}`, margin, cy);
    cy += 4;
  }

  // Right Column: Project & Billing Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('PROJECT & BILLING METADATA', metaX, y, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Project: ${invoice.projectName}`, metaX, y + 5, { align: 'right' });
  doc.text(`Service Category: ${invoice.serviceCategory}`, metaX, y + 9.5, { align: 'right' });
  doc.text(`Billing Type: ${invoice.billingType}`, metaX, y + 14, { align: 'right' });
  doc.text(`Milestone / Stage: ${invoice.billingStage}`, metaX, y + 18.5, { align: 'right' });
  doc.text(`Quotation No: ${invoice.quotationNo}`, metaX, y + 23, { align: 'right' });

  y = Math.max(cy + 4, y + 28);

  // --- Line items table ---
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['#', 'Item Description', 'HSN/SAC', 'Qty', 'Rate (₹)', 'Amount (₹)']],
    body: (invoice.items || []).map((item, idx) => [
      String(idx + 1),
      item.description,
      item.hsnSac || '—',
      String(item.qty),
      item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
    ]),
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 8.5, halign: 'left' },
    bodyStyles: { fontSize: 8.5, textColor: [51, 65, 85] },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      2: { cellWidth: 22 },
      3: { halign: 'right', cellWidth: 14 },
      4: { halign: 'right', cellWidth: 28 },
      5: { halign: 'right', cellWidth: 32 },
    },
    tableLineColor: [226, 232, 240],
    tableLineWidth: 0.1,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const afterTableY = (doc as any).lastAutoTable.finalY + 6;

  // --- Left: Amount in Words + Bank Details; Right: Totals Box ---
  let ty = afterTableY;

  // Totals Box (Right aligned)
  const boxWidth = 72;
  const boxX = pageWidth - margin - boxWidth;

  const totalsRow = (label: string, value: string, bold = false, color = [15, 23, 42]) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(bold ? 9.5 : 8.5);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(label, boxX, ty);
    doc.text(value, boxX + boxWidth, ty, { align: 'right' });
    ty += bold ? 6.5 : 5;
  };

  totalsRow('Sub Total', `₹${subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
  totalsRow('CGST (9%)', `₹${cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
  totalsRow('SGST (9%)', `₹${sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
  totalsRow('Total GST (18%)', `₹${(cgst + sgst).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);

  doc.setDrawColor(15, 23, 42);
  doc.line(boxX, ty - 1.5, boxX + boxWidth, ty - 1.5);
  totalsRow('Total Invoice Amount', `₹${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, true, [29, 78, 216]);

  totalsRow('Amount Paid', `₹${calculatedPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, false, [22, 101, 52]);
  totalsRow('Pending Amount', `₹${pendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, true, pendingAmount > 0 ? [180, 83, 9] : [22, 101, 52]);

  // Left Column (Amount in Words + Bank Details)
  let ly = afterTableY;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('AMOUNT IN WORDS:', margin, ly);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 58, 138); // blue-900
  doc.text(amountInWordsINR(totalAmount), margin, ly + 4.5);

  ly += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('BANK & PAYMENT DETAILS', margin, ly);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Bank Name: ${BANK_DETAILS.bankName}`, margin, ly + 4.5);
  doc.text(`Account Name: ${BANK_DETAILS.accountHolderName}`, margin, ly + 8.5);
  doc.text(`Account Number: ${BANK_DETAILS.accountNumber}`, margin, ly + 12.5);
  doc.text(`IFSC Code: ${BANK_DETAILS.ifscCode}  |  Branch: ${BANK_DETAILS.branch}`, margin, ly + 16.5);

  const finalY = Math.max(ty + 6, ly + 24);

  // --- Notes & Thank you Footer ---
  let footerY = finalY;
  if (invoice.notes) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Terms / Notes: ${invoice.notes}`, margin, footerY);
    footerY += 6;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Thank you for your business!', margin, footerY + 2);

  // Authorised Signatory block (Right)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Authorised Signatory', pageWidth - margin, footerY + 2, { align: 'right' });

  doc.save(`${invoice.invoiceNo}.pdf`);
}
