/**
 * Purpose: TypeScript types for the Invoices module (BRD: Invoices Module Fields)
 * Responsibilities: Single source of truth for the Invoice entity shape, create/update payloads,
 *                    and list-query params — services/features/pages all import from here
 * Dependencies: common.types (InvoiceStatus, PaginatedResponse)
 * Export: Invoice, InvoiceFormValues, InvoiceListParams
 */
import type { InvoiceStatus } from './common.types';

export type BillingType = 'One-Time' | 'Milestone-Based' | 'Recurring' | 'Time & Material';

/** A single line item on the invoice (BRD: Create Invoice popup — items table) */
export interface InvoiceLineItem {
  id: string;
  description: string;
  hsnSac: string;
  qty: number;
  rate: number;
  amount: number; // qty * rate, kept denormalized so it never drifts while editing
}

export interface Invoice {
  id: string;
  invoiceNo: string; // e.g. INV-2025-001 (BRD: Invoice No)
  projectId: string;
  projectName: string; // denormalized for table display
  clientName: string; // denormalized for table display
  serviceCategory: string;
  billingType: BillingType;
  billingStage: string; // shown as "Milestone / Stage" on the Create Invoice popup
  quotationNo: string;
  invoiceDate: string; // ISO date
  dueDate: string; // ISO date
  items: InvoiceLineItem[];
  amount: number; // Sub Total — sum of all line item amounts
  cgst: number; // CGST amount (₹)
  sgst: number; // SGST amount (₹)
  gst: number; // Total GST = cgst + sgst — kept for backward compat with Reports/list totals
  notes: string;
  status: InvoiceStatus;
}

/** Shape used by the Create/Edit Invoice form (React Hook Form + Zod) */
export interface InvoiceFormValues {
  projectId: string;
  serviceCategory: string;
  billingType: BillingType;
  billingStage: string;
  quotationNo: string;
  invoiceDate: string;
  dueDate: string;
  items: InvoiceLineItem[];
  amount: number;
  cgst: number;
  sgst: number;
  gst: number;
  notes: string;
  status: InvoiceStatus;
}

export interface InvoiceListParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: InvoiceStatus;
  projectId?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}
