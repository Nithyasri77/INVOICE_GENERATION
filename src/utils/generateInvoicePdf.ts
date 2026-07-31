/**
 * Purpose: Render a printable Tax Invoice PDF matching the approved UI mockup ("Invoice Preview /
 *          PDF" screen) — company header, Bill To block, Project/Quotation meta, line-items
 *          table, Sub Total/CGST/SGST/Total, amount in words, thank-you footer
 * Responsibilities: generateInvoicePDF(invoice) -> triggers a browser download of the PDF
 * Dependencies: jspdf, jspdf-autotable, invoice.types, formatCurrency, formatDate, numberToWords
 * Export: generateInvoicePDF
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Invoice } from '../types/invoice.types';
import { formatDate } from './formatDate';
import { amountInWordsINR } from './numberToWords';

const COMPANY = {
  name: 'Shine Craft Technologies',
  tagline: 'Craft | Code | Connect',
  address: 'No. 21, Francis Assisi Street, Kuruvikuppam, Puducherry - 605001',
  gstin: 'GSTIN: 34BJPPM7060H1ZM',
  stateCode: 'State Code: 34',
  contact: 'Contact: +91 73000353789',
  email: 'Email: solutions@shinecrafttech.com',
};

export function generateInvoicePDF(invoice: Invoice): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.width;
  const margin = 14;

  // --- Header: Company block (left) + TAX INVOICE title & meta box (right) ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text(COMPANY.name, margin, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(COMPANY.tagline, margin, 21);
  doc.text(COMPANY.address, margin, 26);
  doc.text(COMPANY.gstin, margin, 30.5);
  doc.text(COMPANY.stateCode, margin, 35);
  doc.text(`${COMPANY.contact}  |  ${COMPANY.email}`, margin, 39.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(37, 99, 235); // primary-600
  doc.text('TAX INVOICE', pageWidth - margin, 16, { align: 'right' });

  const metaX = pageWidth - margin;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Invoice No: ${invoice.invoiceNo}`, metaX, 23, { align: 'right' });
  doc.text(`Invoice Date: ${formatDate(invoice.invoiceDate)}`, metaX, 28, { align: 'right' });
  doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, metaX, 33, { align: 'right' });

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, 43, pageWidth - margin, 43);

  // --- Bill To (left) + Project meta (right) ---
  let y = 50;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Bill To', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(invoice.clientName, margin, y + 5.5);
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Project: ${invoice.projectName}`, margin, y + 10.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Billing Details', metaX, y, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Quotation No: ${invoice.quotationNo}`, metaX, y + 5, { align: 'right' });
  doc.text(`Milestone / Stage: ${invoice.billingStage}`, metaX, y + 9.5, { align: 'right' });
  doc.text(`Billing Type: ${invoice.billingType}`, metaX, y + 14, { align: 'right' });

  y += 22;

  // --- Line items table ---
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['#', 'Description', 'HSN/SAC', 'Qty', 'Rate (₹)', 'Amount (₹)']],
    body: invoice.items.map((item, idx) => [
      String(idx + 1),
      item.description,
      item.hsnSac,
      String(item.qty),
      item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
    ]),
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 8.5, halign: 'left' },
    bodyStyles: { fontSize: 8.5, textColor: [51, 65, 85] },
    columnStyles: {
      0: { cellWidth: 8 },
      3: { halign: 'right', cellWidth: 14 },
      4: { halign: 'right', cellWidth: 26 },
      5: { halign: 'right', cellWidth: 30 },
    },
    tableLineColor: [226, 232, 240],
    tableLineWidth: 0.1,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const afterTableY = (doc as any).lastAutoTable.finalY + 6;

  // --- Totals box (right aligned) ---
  const boxWidth = 70;
  const boxX = pageWidth - margin - boxWidth;
  let ty = afterTableY;

  const totalsRow = (label: string, value: string, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(bold ? 10 : 9);
    doc.setTextColor(bold ? 15 : 71, bold ? 23 : 85, bold ? 42 : 105);
    doc.text(label, boxX, ty);
    doc.text(value, boxX + boxWidth, ty, { align: 'right' });
    ty += bold ? 7 : 5.5;
  };

  totalsRow('Sub Total', `₹${invoice.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
  totalsRow('CGST (9%)', `₹${invoice.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
  totalsRow('SGST (9%)', `₹${invoice.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
  doc.setDrawColor(226, 232, 240);
  doc.line(boxX, ty - 2, boxX + boxWidth, ty - 2);
  const totalAmount = invoice.amount + invoice.cgst + invoice.sgst;
  totalsRow('Total Amount', `₹${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, true);

  // --- Amount in words ---
  ty += 4;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Amount in Words: ${amountInWordsINR(totalAmount)}`, margin, ty);

  // --- Notes + footer ---
  ty += 10;
  if (invoice.notes) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(invoice.notes, margin, ty);
    ty += 6;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Thank you for your business!', margin, ty + 4);

  doc.save(`${invoice.invoiceNo}.pdf`);
}
