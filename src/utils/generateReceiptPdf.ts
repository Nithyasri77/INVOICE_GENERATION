/**
 * Purpose: Render a printable Receipt PDF matching the approved UI mockup ("Receipt Preview /
 *          PDF" screen) — company header, RECEIPT title, Received From block, payment details
 *          grid, amount in words, thank-you + signatory footer
 * Responsibilities: generateReceiptPDF(receiptVoucher) -> triggers a browser download of the PDF
 * Dependencies: jspdf, receiptVoucher.types, formatDate, numberToWords
 * Export: generateReceiptPDF
 */
import jsPDF from 'jspdf';
import type { ReceiptVoucher } from '../types/receiptVoucher.types';
import { formatDate } from './formatDate';
import { amountInWordsINR } from './numberToWords';

const COMPANY = {
  name: 'Shine Craft Technologies',
  tagline: 'Craft | Code | Connect',
  address: 'No. 21, Francis Assisi Street, Kuruvikuppam, Puducherry - 605001',
  gstin: 'GSTIN: 34BJPPM7060H1ZM',
};

export function generateReceiptPDF(receipt: ReceiptVoucher): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.width;
  const margin = 14;

  // --- Header ---
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

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(22, 163, 74); // success-600
  doc.text('RECEIPT', pageWidth - margin, 16, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Receipt No: ${receipt.receiptNo}`, pageWidth - margin, 23, { align: 'right' });
  doc.text(`Receipt Date: ${formatDate(receipt.date)}`, pageWidth - margin, 28, { align: 'right' });

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, 36, pageWidth - margin, 36);

  // --- Received From block ---
  let y = 44;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Received From', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(receipt.clientName, margin, y + 6);
  if (receipt.projectName) {
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(receipt.projectName, margin, y + 11);
  }

  // --- Details grid ---
  y += 20;
  const rowGap = 8;
  const col1X = margin;
  const col2X = pageWidth / 2 + 4;

  const detailRow = (label: string, value: string, x: number, rowY: number) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(label, x, rowY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(value, x, rowY + 5);
  };

  detailRow('Status', receipt.status, col1X, y);
  detailRow('Invoice No', receipt.invoiceRef, col2X, y);
  y += rowGap + 5;
  detailRow('Payment Mode', receipt.paymentMode, col1X, y);
  detailRow('Reference No', receipt.referenceNo, col2X, y);
  y += rowGap + 5;

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // --- Amount received box ---
  doc.setFillColor(240, 253, 244); // success-50
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(margin, y - 6, pageWidth - margin * 2, 20, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(21, 128, 61);
  doc.text('Amount Received', margin + 5, y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`₹${receipt.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, margin + 5, y + 8);

  y += 22;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Amount in Words: ${amountInWordsINR(receipt.amount)}`, margin, y);

  if (receipt.notes) {
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(receipt.notes, margin, y);
  }

  // --- Footer: thank you + signatory ---
  y += 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Thank you for your payment!', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Authorised Signatory', pageWidth - margin, y, { align: 'right' });

  doc.save(`${receipt.receiptNo}.pdf`);
}
