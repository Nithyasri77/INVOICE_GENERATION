import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getNdas, getAllFilteredNdas, getNdaById, createNda, updateNda, deleteNda } from '../../../services/ndaService';
import type { NdaFormValues, NdaListParams } from '../../../types/nda.types';

const NDA_KEY = 'nda';

export function useNdas(params: NdaListParams) {
  return useQuery({
    queryKey: [NDA_KEY, params],
    queryFn: () => getNdas(params),
    placeholderData: (prev) => prev,
  });
}

export function useNda(id: string | undefined) {
  return useQuery({
    queryKey: [NDA_KEY, 'detail', id],
    queryFn: () => getNdaById(id as string),
    enabled: !!id,
  });
}

export function useCreateNda() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: NdaFormValues) => createNda(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NDA_KEY] });
    },
  });
}

export function useUpdateNda() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: NdaFormValues }) => updateNda(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NDA_KEY] });
    },
  });
}

export function useDeleteNda() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNda(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NDA_KEY] });
    },
  });
}

export function useExportNdas() {
  return useMutation({
    mutationFn: (params: Omit<NdaListParams, 'page' | 'pageSize'>) => getAllFilteredNdas(params),
  });
}
