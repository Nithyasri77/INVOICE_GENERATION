/**
 * Purpose: TypeScript types for the Invoices module (BRD: Invoices Module Fields)
 * Responsibilities: Single source of truth for the Invoice entity shape, create/update payloads,
 *                    and list-query params — services/features/pages all import from here
 * Dependencies: common.types (InvoiceStatus, PaginatedResponse)
 * Export: Invoice, InvoiceFormValues, InvoiceListParams
 */
import type { InvoiceStatus } from './common.types';

export type BillingType = 'One-Time' | 'Milestone-Based' | 'Recurring' | 'Time & Material';

export interface Invoice {
  id: string;
  invoiceNo: string; // e.g. INV-2025-001 (BRD: Invoice No)
  projectId: string;
  projectName: string; // denormalized for table display
  clientName: string; // denormalized for table display
  serviceCategory: string;
  billingType: BillingType;
  billingStage: string;
  invoiceDate: string; // ISO date
  dueDate: string; // ISO date
  amount: number;
  gst: number; // GST amount (₹), stored separately from the base amount per BRD
  status: InvoiceStatus;
}

/** Shape used by the Create/Edit Invoice form (React Hook Form + Zod) */
export interface InvoiceFormValues {
  projectId: string;
  serviceCategory: string;
  billingType: BillingType;
  billingStage: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  gst: number;
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
