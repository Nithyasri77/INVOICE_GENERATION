import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMsas, getAllFilteredMsas, getMsaById, createMsa, updateMsa, deleteMsa } from '../../../services/msaService';
import type { MsaFormValues, MsaListParams } from '../../../types/msa.types';

const MSA_KEY = 'msa';

export function useMsas(params: MsaListParams) {
  return useQuery({
    queryKey: [MSA_KEY, params],
    queryFn: () => getMsas(params),
    placeholderData: (prev) => prev,
  });
}

export function useMsa(id: string | undefined) {
  return useQuery({
    queryKey: [MSA_KEY, 'detail', id],
    queryFn: () => getMsaById(id as string),
    enabled: !!id,
  });
}

export function useCreateMsa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: MsaFormValues) => createMsa(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MSA_KEY] });
    },
  });
}

export function useUpdateMsa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: MsaFormValues }) => updateMsa(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MSA_KEY] });
    },
  });
}

export function useDeleteMsa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMsa(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MSA_KEY] });
    },
  });
}

export function useExportMsas() {
  return useMutation({
    mutationFn: (params: Omit<MsaListParams, 'page' | 'pageSize'>) => getAllFilteredMsas(params),
  });
}
