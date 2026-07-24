/**
 * Purpose: Data-fetching/mutation hooks for the Receipt Vouchers module
 * Responsibilities: Wrap receiptVoucherService in useQuery/useMutation (caching, loading/error
 *                    states, cache invalidation on write); also exposes useProjectOptionsByClient
 *                    for the Project picker in ReceiptVoucherFormModal
 * Dependencies: @tanstack/react-query, receiptVoucherService, projectService, receiptVoucher.types
 * Export: useReceiptVouchers, useReceiptVoucher, useCreateReceiptVoucher, useUpdateReceiptVoucher,
 *          useDeleteReceiptVoucher, useProjectOptionsByClient
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getReceiptVouchers,
  getReceiptVoucherById,
  createReceiptVoucher,
  updateReceiptVoucher,
  deleteReceiptVoucher,
} from '../../../services/receiptVoucherService';
import { getProjects } from '../../../services/projectService';
import type { ReceiptVoucherFormValues, ReceiptVoucherListParams } from '../../../types/receiptVoucher.types';

const RECEIPT_VOUCHERS_KEY = 'receipt-vouchers';

export function useReceiptVouchers(params: ReceiptVoucherListParams) {
  return useQuery({
    queryKey: [RECEIPT_VOUCHERS_KEY, params],
    queryFn: () => getReceiptVouchers(params),
    placeholderData: (prev) => prev,
  });
}

export function useReceiptVoucher(id: string | undefined) {
  return useQuery({
    queryKey: [RECEIPT_VOUCHERS_KEY, 'detail', id],
    queryFn: () => getReceiptVoucherById(id as string),
    enabled: !!id,
  });
}

export function useCreateReceiptVoucher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: ReceiptVoucherFormValues) => createReceiptVoucher(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RECEIPT_VOUCHERS_KEY] });
    },
  });
}

export function useUpdateReceiptVoucher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: ReceiptVoucherFormValues }) => updateReceiptVoucher(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RECEIPT_VOUCHERS_KEY] });
    },
  });
}

export function useDeleteReceiptVoucher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteReceiptVoucher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RECEIPT_VOUCHERS_KEY] });
    },
  });
}

export function useProjectOptionsByClient(clientId: string | undefined) {
  return useQuery({
    queryKey: ['projects', 'options', clientId],
    queryFn: () => getProjects({ page: 1, pageSize: 100, clientId }),
    enabled: !!clientId,
    select: (result) => result.data.map((p) => ({ value: p.id, label: `${p.projectName} (${p.projectCode})` })),
  });
}
