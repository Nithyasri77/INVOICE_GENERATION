/**
 * Purpose: Strict TypeScript definitions for Project Detail ERP tabs (Invoices, Payments, Receipts, Files, Notes, Financial Summary)
 * Responsibilities: Single source of truth for all tab domain entities, filters, statistics, and form inputs
 * Dependencies: common.types
 * Export: ProjectFinancialSummary, ProjectInvoice, ProjectPayment, ProjectReceipt, ProjectFile, ProjectNote, etc.
 */
import type { InvoiceStatus, PaymentStatus } from './common.types';

// ---- Financial Summary ----
export interface ProjectFinancialSummary {
  projectId: string;
  projectValue: number;
  totalInvoiced: number;
  totalReceived: number;
  outstandingAmount: number;
  pendingMilestones: number;
  upcomingDueDate: string;
  lastPaymentAmount: number;
  lastPaymentDate: string;
  invoicedPercentage: number;
  receivedPercentage: number;
}

// ---- Invoices ----
export type BillingStage = 'Initial Advance' | 'Milestone 1' | 'Milestone 2' | 'Final Handover' | 'Ad-hoc';
export type BillingType = 'Fixed Price' | 'Milestone' | 'Time & Material';

export interface ProjectInvoice {
  id: string;
  invoiceNo: string;
  projectId: string;
  invoiceDate: string;
  dueDate: string;
  billingStage: BillingStage;
  billingType: BillingType;
  amount: number;
  gstAmount: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: InvoiceStatus;
  notes?: string;
  createdDate: string;
}

export interface ProjectInvoiceStats {
  totalInvoices: number;
  totalInvoicedAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  overdueInvoices: number;
}

export interface ProjectInvoiceQueryParams {
  projectId: string;
  page: number;
  pageSize: number;
  search?: string;
  status?: InvoiceStatus | string;
  billingType?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface CreateProjectInvoiceInput {
  projectId: string;
  invoiceDate: string;
  dueDate: string;
  billingStage: BillingStage;
  billingType: BillingType;
  amount: number;
  gstRate: number; // e.g. 18
  notes?: string;
}

// ---- Payments ----
export type PaymentMode = 'Bank Transfer' | 'UPI' | 'Cheque' | 'Credit Card' | 'Cash';

export interface ProjectPayment {
  id: string;
  paymentId: string; // e.g. PAY-2026-089
  projectId: string;
  invoiceNo: string;
  paymentDate: string;
  amount: number;
  paymentMode: PaymentMode;
  referenceNumber: string;
  remarks?: string;
  status: PaymentStatus;
  recordedBy: string;
}

export interface ProjectPaymentStats {
  totalPayments: number;
  receivedAmount: number;
  pendingAmount: number;
  lastPaymentDate: string;
}

export interface ProjectPaymentQueryParams {
  projectId: string;
  page: number;
  pageSize: number;
  search?: string;
  paymentMode?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface RecordProjectPaymentInput {
  projectId: string;
  invoiceNo: string;
  paymentDate: string;
  amount: number;
  paymentMode: PaymentMode;
  referenceNumber: string;
  remarks?: string;
}

// ---- Receipts ----
export interface ProjectReceipt {
  id: string;
  receiptNumber: string; // e.g. RCP-2026-042
  projectId: string;
  invoiceNumber: string;
  paymentDate: string;
  amount: number;
  paymentMode: PaymentMode;
  transactionId: string;
  generatedDate: string;
  clientName: string;
}

export interface ProjectReceiptStats {
  todaysCollection: number;
  projectCollections: number;
  totalReceipts: number;
  outstandingBalance: number;
}

export interface ProjectReceiptQueryParams {
  projectId: string;
  page: number;
  pageSize: number;
  search?: string;
  paymentMode?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// ---- Files ----
export type FileCategory =
  | 'Quotation'
  | 'Agreement'
  | 'Invoice PDFs'
  | 'Receipts'
  | 'Design Files'
  | 'Project Documents'
  | 'Images'
  | 'Other';

export type FileTypeExtension = 'PDF' | 'DOCX' | 'XLSX' | 'PNG' | 'JPG' | 'ZIP';

export interface ProjectFile {
  id: string;
  projectId: string;
  fileName: string;
  category: FileCategory;
  extension: FileTypeExtension;
  sizeBytes: number;
  uploadedBy: string;
  uploadDate: string;
  url: string;
}

export interface ProjectFileQueryParams {
  projectId: string;
  search?: string;
  category?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface UploadProjectFileInput {
  projectId: string;
  fileName: string;
  category: FileCategory;
  fileSizeBytes: number;
  extension: FileTypeExtension;
}

// ---- Notes ----
export interface ProjectNote {
  id: string;
  projectId: string;
  title: string;
  description: string;
  createdBy: string;
  createdDate: string;
  lastUpdated: string;
  pinned: boolean;
  tags: string[];
  attachments?: { name: string; url: string }[];
}

export interface ProjectNoteQueryParams {
  projectId: string;
  search?: string;
  author?: string;
  tag?: string;
  pinnedOnly?: boolean;
}

export interface CreateProjectNoteInput {
  projectId: string;
  title: string;
  description: string;
  pinned?: boolean;
  tags?: string[];
}

export interface UpdateProjectNoteInput {
  title?: string;
  description?: string;
  pinned?: boolean;
  tags?: string[];
}
