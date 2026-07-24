/**
 * Purpose: TypeScript types for the Receipt Vouchers module (BRD: Billing > Receipt Vouchers —
 *          acknowledgements of payment received from a client against an invoice)
 * Responsibilities: Single source of truth for the ReceiptVoucher entity shape, create/update
 *                    payloads, and list-query params — services/features/pages all import from
 *                    here
 * Dependencies: common.types (PaymentStatus)
 * Export: ReceiptVoucher, ReceiptVoucherFormValues, ReceiptVoucherListParams
 */
import type { PaymentStatus } from './common.types';

export interface ReceiptVoucher {
  id: string;
  receiptNo: string; // e.g. REC-2025-1001
  clientId: string;
  clientName: string; // denormalized for table display
  projectId?: string;
  projectName?: string; // denormalized for table display
  invoiceRef: string; // the original Tax Invoice this receipt is issued against
  date: string; // ISO date
  amount: number;
  paymentMode: 'Cash' | 'Cheque' | 'Bank Transfer' | 'UPI' | 'Card';
  referenceNo: string;
  status: PaymentStatus;
  notes: string;
}

/** Shape used by the Add/Edit Receipt Voucher form (React Hook Form + Zod) */
export interface ReceiptVoucherFormValues {
  clientId: string;
  projectId?: string;
  invoiceRef: string;
  date: string;
  amount: number;
  paymentMode: 'Cash' | 'Cheque' | 'Bank Transfer' | 'UPI' | 'Card';
  referenceNo: string;
  status: PaymentStatus;
  notes: string;
}

export interface ReceiptVoucherListParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: PaymentStatus;
  clientId?: string;
  paymentMode?: ReceiptVoucher['paymentMode'];
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}
