/**
 * Purpose: Data-fetching/mutation hooks for the Quotations module
 * Responsibilities: Wrap quotationService calls in useQuery/useMutation (caching, loading/error
 *                    states, cache invalidation on write) — this is the only thing
 *                    QuotationsListPage and its modal import from the data layer
 * Dependencies: @tanstack/react-query, quotationService, quotation.types
 * Export: useQuotations, useCreateQuotation, useUpdateQuotation, useDeleteQuotation
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getQuotations,
  createQuotation,
  updateQuotation,
  deleteQuotation,
} from '../../../services/quotationService';
import type { QuotationFormValues, QuotationListParams } from '../../../types/quotation.types';

const QUOTATIONS_KEY = 'quotations';

export function useQuotations(params: QuotationListParams) {
  return useQuery({
    queryKey: [QUOTATIONS_KEY, params],
    queryFn: () => getQuotations(params),
    placeholderData: (prev) => prev,
  });
}

export function useCreateQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: QuotationFormValues) => createQuotation(values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUOTATIONS_KEY] }),
  });
}

export function useUpdateQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: QuotationFormValues }) => updateQuotation(id, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUOTATIONS_KEY] }),
  });
}

export function useDeleteQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteQuotation(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUOTATIONS_KEY] }),
  });
}
