/**
 * Purpose: TypeScript types for the Payments module (BRD: Payments Module Fields)
 * Responsibilities: Single source of truth for the Payment entity shape, create/update payloads,
 *                    and list-query params — services/features/pages all import from here
 * Dependencies: common.types (PaymentStatus, PaginatedResponse)
 * Export: Payment, PaymentFormValues, PaymentListParams
 */
import type { PaymentStatus } from './common.types';

export type PaymentMode = 'Bank Transfer' | 'UPI' | 'Cheque' | 'Cash' | 'Card';

export interface Payment {
  id: string;
  paymentCode: string; // e.g. PAY-0001 (BRD: Payment ID)
  invoiceId: string;
  invoiceNo: string; // denormalized for table display
  projectId: string;
  projectName: string; // denormalized for table display
  amount: number;
  paymentDate: string; // ISO date
  mode: PaymentMode;
  referenceNumber: string;
  remarks: string;
  status: PaymentStatus;
}

/** Shape used by the Record/Edit Payment form (React Hook Form + Zod) */
export interface PaymentFormValues {
  invoiceId: string;
  amount: number;
  paymentDate: string;
  mode: PaymentMode;
  referenceNumber: string;
  remarks: string;
  status: PaymentStatus;
}

export interface PaymentListParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: PaymentStatus;
  mode?: PaymentMode;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}
