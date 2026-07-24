/**
 * Purpose: Data access layer for the Payments module
 * Responsibilities: Expose getPayments/createPayment/updatePayment/deletePayment as the only way
 *                    features/payments reads or writes this data
 * NOTE: No Payments API endpoint exists yet. Each function is wired to call axiosClient (see the
 *       commented real call) but currently operates on an in-memory seed array so the UI is
 *       reviewable end-to-end. Swap the TODO block for the real call once the backend is live.
 *       Per BRD (Receipt Generation Rule: "Payment Saved -> Receipt Auto Generated"), createPayment
 *       is the hook point where the Receipts module will auto-generate a receipt once that module
 *       is built — left as a TODO below rather than guessed at now.
 * Dependencies: axiosClient, payment.types, common.types, invoiceService (to denormalize
 *               invoiceNo/projectName)
 * Export: getPayments, getPaymentById, createPayment, updatePayment, deletePayment
 */
import type { Payment, PaymentFormValues, PaymentListParams } from '../types/payment.types';
import type { PaginatedResponse } from '../types/common.types';
import { getInvoiceById } from './invoiceService';

let SEED_PAYMENTS: Payment[] = [
  {
    id: '1',
    paymentCode: 'PAY-0001',
    invoiceId: '1',
    invoiceNo: 'INV-2025-001',
    projectId: '1',
    projectName: 'ERP Revamp — Phase 1',
    amount: 200600,
    paymentDate: '2025-02-14',
    mode: 'Bank Transfer',
    referenceNumber: 'UTR2025021400123',
    remarks: 'Advance milestone payment received in full',
    status: 'Reconciled',
  },
  {
    id: '2',
    paymentCode: 'PAY-0002',
    invoiceId: '2',
    invoiceNo: 'INV-2025-002',
    projectId: '1',
    projectName: 'ERP Revamp — Phase 1',
    amount: 401200,
    paymentDate: '2025-05-24',
    mode: 'Bank Transfer',
    referenceNumber: 'UTR2025052400456',
    remarks: 'Development milestone payment received in full',
    status: 'Reconciled',
  },
  {
    id: '3',
    paymentCode: 'PAY-0003',
    invoiceId: '3',
    invoiceNo: 'INV-2025-003',
    projectId: '2',
    projectName: 'Patient Portal Redesign',
    amount: 40000,
    paymentDate: '2025-04-29',
    mode: 'UPI',
    referenceNumber: 'UPI2025042900789',
    remarks: 'Partial payment — balance pending',
    status: 'Reconciled',
  },
  {
    id: '4',
    paymentCode: 'PAY-0004',
    invoiceId: '4',
    invoiceNo: 'INV-2025-004',
    projectId: '4',
    projectName: 'E-commerce Storefront',
    amount: 346920,
    paymentDate: '2025-04-04',
    mode: 'Cheque',
    referenceNumber: 'CHQ004521',
    remarks: 'Checkout module payment cleared',
    status: 'Reconciled',
  },
  {
    id: '5',
    paymentCode: 'PAY-0005',
    invoiceId: '6',
    invoiceNo: 'INV-2025-006',
    projectId: '5',
    projectName: 'Site Billing & Inventory Tool',
    amount: 70800,
    paymentDate: '2025-07-09',
    mode: 'UPI',
    referenceNumber: 'UPI2025070900912',
    remarks: 'Awaiting bank reconciliation',
    status: 'Pending',
  },
];

let nextId = SEED_PAYMENTS.length + 1;

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function nextPaymentCode(): string {
  return `PAY-${String(nextId).padStart(4, '0')}`;
}

export async function getPayments(params: PaymentListParams): Promise<PaginatedResponse<Payment>> {
  // TODO: replace with `const { data } = await axiosClient.get<PaginatedResponse<Payment>>('/payments', { params }); return data;`
  let rows = [...SEED_PAYMENTS];

  if (params.search) {
    const q = params.search.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.paymentCode.toLowerCase().includes(q) ||
        r.invoiceNo.toLowerCase().includes(q) ||
        r.projectName.toLowerCase().includes(q) ||
        r.referenceNumber.toLowerCase().includes(q)
    );
  }

  if (params.status) {
    rows = rows.filter((r) => r.status === params.status);
  }

  if (params.mode) {
    rows = rows.filter((r) => r.mode === params.mode);
  }

  if (params.sortBy) {
    const dir = params.sortDirection === 'desc' ? -1 : 1;
    rows.sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[params.sortBy!];
      const bv = (b as unknown as Record<string, unknown>)[params.sortBy!];
      if (av == null || bv == null) return 0;
      return av > bv ? dir : av < bv ? -dir : 0;
    });
  }

  const totalEntries = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / params.pageSize));
  const start = (params.page - 1) * params.pageSize;
  const paged = rows.slice(start, start + params.pageSize);

  return delay({
    data: paged,
    page: params.page,
    pageSize: params.pageSize,
    totalEntries,
    totalPages,
  });
}

export async function getPaymentById(id: string): Promise<Payment | undefined> {
  // TODO: replace with `const { data } = await axiosClient.get<Payment>(`/payments/${id}`); return data;`
  return delay(SEED_PAYMENTS.find((r) => r.id === id));
}

export async function createPayment(values: PaymentFormValues): Promise<Payment> {
  // TODO: replace with `const { data } = await axiosClient.post<Payment>('/payments', values); return data;`
  // TODO(Receipts module): per BRD, saving a payment should auto-generate a receipt here.
  const invoice = await getInvoiceById(values.invoiceId);
  const payment: Payment = {
    id: String(nextId),
    paymentCode: nextPaymentCode(),
    ...values,
    invoiceNo: invoice?.invoiceNo ?? 'Unknown Invoice',
    projectId: invoice?.projectId ?? '',
    projectName: invoice?.projectName ?? 'Unknown Project',
  };
  nextId += 1;
  SEED_PAYMENTS = [payment, ...SEED_PAYMENTS];
  return delay(payment);
}

export async function updatePayment(id: string, values: PaymentFormValues): Promise<Payment> {
  // TODO: replace with `const { data } = await axiosClient.put<Payment>(`/payments/${id}`, values); return data;`
  const invoice = await getInvoiceById(values.invoiceId);
  SEED_PAYMENTS = SEED_PAYMENTS.map((r) =>
    r.id === id
      ? {
          ...r,
          ...values,
          invoiceNo: invoice?.invoiceNo ?? r.invoiceNo,
          projectId: invoice?.projectId ?? r.projectId,
          projectName: invoice?.projectName ?? r.projectName,
        }
      : r
  );
  const updated = SEED_PAYMENTS.find((r) => r.id === id)!;
  return delay(updated);
}

export async function deletePayment(id: string): Promise<void> {
  // TODO: replace with `await axiosClient.delete(`/payments/${id}`);`
  SEED_PAYMENTS = SEED_PAYMENTS.filter((r) => r.id !== id);
  return delay(undefined);
}
