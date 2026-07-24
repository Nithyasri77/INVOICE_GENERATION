/**
 * Purpose: TypeScript types for the Debit Notes module (BRD: Billing > Debit Notes — additional
 *          charges raised against a client/project, e.g. scope additions or price corrections
 *          that increase what the client owes)
 * Responsibilities: Single source of truth for the DebitNote entity shape, create/update
 *                    payloads, and list-query params — services/features/pages all import from
 *                    here
 * Dependencies: common.types (DebitNoteStatus, PaginatedResponse)
 * Export: DebitNote, DebitNoteFormValues, DebitNoteListParams
 */
import type { DebitNoteStatus } from './common.types';

export interface DebitNote {
  id: string;
  debitNoteNo: string; // e.g. DN-2025-0001
  clientId: string;
  clientName: string; // denormalized for table display
  projectId?: string;
  projectName?: string; // denormalized for table display
  invoiceRef?: string; // the original Tax Invoice this debit note corrects/adds to, if any
  date: string; // ISO date
  reason: string;
  amount: number;
  status: DebitNoteStatus;
  notes: string;
}

/** Shape used by the Add/Edit Debit Note form (React Hook Form + Zod) */
export interface DebitNoteFormValues {
  clientId: string;
  projectId?: string;
  invoiceRef?: string;
  date: string;
  reason: string;
  amount: number;
  status: DebitNoteStatus;
  notes: string;
}

export interface DebitNoteListParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: DebitNoteStatus;
  clientId?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}
