/**
 * Purpose: Data-fetching/mutation hooks for the Credit Notes module
 * Responsibilities: Wrap creditNoteService in useQuery/useMutation (caching, loading/error
 *                    states, cache invalidation on write); also exposes useProjectOptionsByClient
 *                    for the Project picker in CreditNoteFormModal
 * Dependencies: @tanstack/react-query, creditNoteService, projectService, creditNote.types
 * Export: useCreditNotes, useCreditNote, useCreateCreditNote, useUpdateCreditNote,
 *          useDeleteCreditNote, useProjectOptionsByClient
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getCreditNotes,
  getCreditNoteById,
  createCreditNote,
  updateCreditNote,
  deleteCreditNote,
} from '../../../services/creditNoteService';
import { getProjects } from '../../../services/projectService';
import type { CreditNoteFormValues, CreditNoteListParams } from '../../../types/creditNote.types';

const CREDIT_NOTES_KEY = 'credit-notes';

export function useCreditNotes(params: CreditNoteListParams) {
  return useQuery({
    queryKey: [CREDIT_NOTES_KEY, params],
    queryFn: () => getCreditNotes(params),
    placeholderData: (prev) => prev,
  });
}

export function useCreditNote(id: string | undefined) {
  return useQuery({
    queryKey: [CREDIT_NOTES_KEY, 'detail', id],
    queryFn: () => getCreditNoteById(id as string),
    enabled: !!id,
  });
}

export function useCreateCreditNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: CreditNoteFormValues) => createCreditNote(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CREDIT_NOTES_KEY] });
    },
  });
}

export function useUpdateCreditNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: CreditNoteFormValues }) => updateCreditNote(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CREDIT_NOTES_KEY] });
    },
  });
}

export function useDeleteCreditNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCreditNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CREDIT_NOTES_KEY] });
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
