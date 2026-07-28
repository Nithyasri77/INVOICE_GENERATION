/**
 * Purpose: All data-fetching/mutation hooks for the AMC Contracts module
 * Responsibilities: Wrap amcService in useQuery/useMutation; invalidate the right query keys
 *                    on mutation success so lists/detail views stay in sync
 * Dependencies: @tanstack/react-query, amcService, toast (ui)
 * Export: useAmcContracts, useAmcStats, useAmcContract, useCreateAmcContract,
 *         useUpdateAmcContract, useDeleteAmcContract, useRenewAmcContract, useMarkAmcRenewed,
 *         useAmcRenewalHistory
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAmcContracts,
  getAmcStats,
  getAmcContract,
  createAmcContract,
  updateAmcContract,
  deleteAmcContract,
  renewAmcContract,
  markAmcRenewed,
  getAmcRenewalHistory,
  type AmcListParams,
  type CreateAmcContractInput,
  type UpdateAmcContractInput,
} from '../../../services/amcService';
import { toast } from '../../../components/ui/Toast';

const AMC_KEY = ['amc-contracts'] as const;

export function useAmcContracts(params: AmcListParams) {
  return useQuery({
    queryKey: [...AMC_KEY, 'list', params],
    queryFn: () => getAmcContracts(params),
  });
}

export function useAmcStats() {
  return useQuery({
    queryKey: [...AMC_KEY, 'stats'],
    queryFn: getAmcStats,
  });
}

export function useAmcContract(id: string | undefined) {
  return useQuery({
    queryKey: [...AMC_KEY, 'detail', id],
    queryFn: () => getAmcContract(id as string),
    enabled: !!id,
  });
}

export function useCreateAmcContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAmcContractInput) => createAmcContract(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AMC_KEY });
      toast.success('AMC contract created successfully');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateAmcContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAmcContractInput }) => updateAmcContract(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AMC_KEY });
      toast.success('AMC contract updated successfully');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteAmcContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAmcContract(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AMC_KEY });
      toast.success('AMC contract deleted');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useRenewAmcContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, renewalValue }: { id: string; renewalValue: number }) => renewAmcContract(id, renewalValue),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: AMC_KEY });
      queryClient.invalidateQueries({ queryKey: [...AMC_KEY, 'renewal-history', variables.id] });
      toast.success('Contract renewed successfully');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useMarkAmcRenewed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markAmcRenewed(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AMC_KEY });
      toast.success('Contract marked as renewed');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useAmcRenewalHistory(amcId: string | undefined) {
  return useQuery({
    queryKey: [...AMC_KEY, 'renewal-history', amcId],
    queryFn: () => getAmcRenewalHistory(amcId as string),
    enabled: !!amcId,
  });
}
