/**
 * Purpose: Data-fetching/mutation hooks for the Invoices module
 * Responsibilities: Wrap invoiceService calls in useQuery/useMutation (caching, loading/error
 *                    states, cache invalidation on write); also exposes useProjectOptions for the
 *                    Project picker in InvoiceFormModal
 * Dependencies: @tanstack/react-query, invoiceService, projectService, invoice.types
 * Export: useInvoices, useCreateInvoice, useUpdateInvoice, useDeleteInvoice, useProjectOptions
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from '../../../services/invoiceService';
import { getAllProjects } from '../../../services/projectService';
import type { InvoiceFormValues, InvoiceListParams } from '../../../types/invoice.types';

const INVOICES_KEY = 'invoices';

export function useInvoices(params: InvoiceListParams) {
  return useQuery({
    queryKey: [INVOICES_KEY, params],
    queryFn: () => getInvoices(params),
    placeholderData: (prev) => prev,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: InvoiceFormValues) => createInvoice(values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [INVOICES_KEY] }),
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: InvoiceFormValues }) => updateInvoice(id, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [INVOICES_KEY] }),
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteInvoice(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [INVOICES_KEY] }),
  });
}

/** Project dropdown options for the invoice create/edit form */
export function useProjectOptions() {
  return useQuery({
    queryKey: ['projects', 'options'],
    queryFn: getAllProjects,
    select: (projects) => projects.map((p) => ({ value: p.id, label: `${p.projectCode} — ${p.projectName}` })),
  });
}
