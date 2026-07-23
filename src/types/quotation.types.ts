/**
 * Purpose: TypeScript types for the Quotations module
 * Responsibilities: Single source of truth for the Quotation entity shape, create/update
 *                    payloads, and list-query params — services/features/pages all import from
 *                    here. (No detailed BRD field list was provided for Quotations; fields follow
 *                    standard pre-sales quotation practice and stay consistent with the
 *                    Quotation No / MSA No already referenced on the Projects module.)
 * Dependencies: common.types (QuotationStatus, PaginatedResponse)
 * Export: Quotation, QuotationFormValues, QuotationListParams
 */
import type { QuotationStatus } from './common.types';

export interface Quotation {
  id: string;
  quotationNo: string; // e.g. QT-2025-001
  clientId: string;
  clientName: string; // denormalized for table display
  quotationDate: string; // ISO date
  validUntil: string; // ISO date
  amount: number;
  status: QuotationStatus;
  notes: string;
}

/** Shape used by the Add/Edit Quotation form (React Hook Form + Zod) */
export interface QuotationFormValues {
  clientId: string;
  quotationDate: string;
  validUntil: string;
  amount: number;
  status: QuotationStatus;
  notes: string;
}

export interface QuotationListParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: QuotationStatus;
  clientId?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}
