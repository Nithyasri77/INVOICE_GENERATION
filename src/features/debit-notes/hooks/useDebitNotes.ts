/**
 * Purpose: Data-fetching/mutation hooks for the Debit Notes module
 * Responsibilities: Wrap debitNoteService in useQuery/useMutation (caching, loading/error
 *                    states, cache invalidation on write); also exposes useProjectOptionsByClient
 *                    for the Project picker in DebitNoteFormModal
 * Dependencies: @tanstack/react-query, debitNoteService, projectService, debitNote.types
 * Export: useDebitNotes, useDebitNote, useCreateDebitNote, useUpdateDebitNote,
 *          useDeleteDebitNote, useProjectOptionsByClient
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getDebitNotes,
  getDebitNoteById,
  createDebitNote,
  updateDebitNote,
  deleteDebitNote,
} from '../../../services/debitNoteService';
import { getProjects } from '../../../services/projectService';
import type { DebitNoteFormValues, DebitNoteListParams } from '../../../types/debitNote.types';

const DEBIT_NOTES_KEY = 'debit-notes';

export function useDebitNotes(params: DebitNoteListParams) {
  return useQuery({
    queryKey: [DEBIT_NOTES_KEY, params],
    queryFn: () => getDebitNotes(params),
    placeholderData: (prev) => prev,
  });
}

export function useDebitNote(id: string | undefined) {
  return useQuery({
    queryKey: [DEBIT_NOTES_KEY, 'detail', id],
    queryFn: () => getDebitNoteById(id as string),
    enabled: !!id,
  });
}

export function useCreateDebitNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: DebitNoteFormValues) => createDebitNote(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DEBIT_NOTES_KEY] });
    },
  });
}

export function useUpdateDebitNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: DebitNoteFormValues }) => updateDebitNote(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DEBIT_NOTES_KEY] });
    },
  });
}

export function useDeleteDebitNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDebitNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DEBIT_NOTES_KEY] });
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
