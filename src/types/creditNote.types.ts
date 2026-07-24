/**
 * Purpose: TypeScript types for the Credit Notes module (BRD: Billing > Credit Notes —
 *          reductions to what a client owes, e.g. discounts, refunds, or overbilling corrections)
 * Responsibilities: Single source of truth for the CreditNote entity shape, create/update
 *                    payloads, and list-query params — services/features/pages all import from
 *                    here
 * Dependencies: common.types (CreditNoteStatus, PaginatedResponse)
 * Export: CreditNote, CreditNoteFormValues, CreditNoteListParams
 */
import type { CreditNoteStatus } from './common.types';

export interface CreditNote {
  id: string;
  creditNoteNo: string; // e.g. CN-2025-0001
  clientId: string;
  clientName: string; // denormalized for table display
  projectId?: string;
  projectName?: string; // denormalized for table display
  invoiceRef?: string; // the original Tax Invoice this credit note is issued against, if any
  date: string; // ISO date
  reason: string;
  amount: number;
  status: CreditNoteStatus;
  notes: string;
}

/** Shape used by the Add/Edit Credit Note form (React Hook Form + Zod) */
export interface CreditNoteFormValues {
  clientId: string;
  projectId?: string;
  invoiceRef?: string;
  date: string;
  reason: string;
  amount: number;
  status: CreditNoteStatus;
  notes: string;
}

export interface CreditNoteListParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: CreditNoteStatus;
  clientId?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}
