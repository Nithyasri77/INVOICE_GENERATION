/**
 * Purpose: Data-fetching/mutation hooks for the Payments module
 * Responsibilities: Wrap paymentService calls in useQuery/useMutation (caching, loading/error
 *                    states, cache invalidation on write); also exposes useInvoiceOptions for the
 *                    Invoice picker in PaymentFormModal
 * Dependencies: @tanstack/react-query, paymentService, invoiceService, payment.types
 * Export: usePayments, useCreatePayment, useUpdatePayment, useDeletePayment, useInvoiceOptions
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment,
} from '../../../services/paymentService';
import { getAllInvoices } from '../../../services/invoiceService';
import type { PaymentFormValues, PaymentListParams } from '../../../types/payment.types';

const PAYMENTS_KEY = 'payments';

export function usePayments(params: PaymentListParams) {
  return useQuery({
    queryKey: [PAYMENTS_KEY, params],
    queryFn: () => getPayments(params),
    placeholderData: (prev) => prev,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: PaymentFormValues) => createPayment(values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PAYMENTS_KEY] }),
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: PaymentFormValues }) => updatePayment(id, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PAYMENTS_KEY] }),
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePayment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PAYMENTS_KEY] }),
  });
}

/** Invoice dropdown options for the payment create/edit form */
export function useInvoiceOptions() {
  return useQuery({
    queryKey: ['invoices', 'options'],
    queryFn: getAllInvoices,
    select: (invoices) => invoices.map((inv) => ({ value: inv.id, label: `${inv.invoiceNo} — ${inv.projectName}` })),
  });
}
