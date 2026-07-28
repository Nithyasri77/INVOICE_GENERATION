/**
 * Purpose: React Query hooks for Project Detail ERP tabs (Financial Summary, Invoices, Payments, Receipts, Files, Notes)
 * Responsibilities: Wrap projectTabsService functions in useQuery and useMutation with automatic query cache invalidation & toasts
 * Dependencies: @tanstack/react-query, projectTabsService, toast (ui)
 * Export: useProjectFinancialSummary, useProjectInvoices, useProjectInvoiceStats, useCreateProjectInvoice,
 *         useProjectPayments, useProjectPaymentStats, useRecordProjectPayment,
 *         useProjectReceipts, useProjectReceiptStats,
 *         useProjectFiles, useUploadProjectFile, useRenameProjectFile, useDeleteProjectFile,
 *         useProjectNotes, useCreateProjectNote, useUpdateProjectNote, useTogglePinProjectNote, useDeleteProjectNote
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getProjectFinancialSummary,
  getProjectInvoices,
  getProjectInvoiceStats,
  createProjectInvoice,
  getProjectPayments,
  getProjectPaymentStats,
  recordProjectPayment,
  getProjectReceipts,
  getProjectReceiptStats,
  getProjectFiles,
  uploadProjectFile,
  renameProjectFile,
  moveProjectFileCategory,
  deleteProjectFile,
  getProjectNotes,
  createProjectNote,
  updateProjectNote,
  togglePinProjectNote,
  deleteProjectNote,
} from '../../../services/projectTabsService';
import type {
  ProjectInvoiceQueryParams,
  CreateProjectInvoiceInput,
  ProjectPaymentQueryParams,
  RecordProjectPaymentInput,
  ProjectReceiptQueryParams,
  ProjectFileQueryParams,
  UploadProjectFileInput,
  ProjectNoteQueryParams,
  CreateProjectNoteInput,
  UpdateProjectNoteInput,
} from '../../../types/projectTabs.types';
import { toast } from '../../../components/ui/Toast';

const QUERY_KEY_PROJECT_TABS = ['project-tabs'] as const;

// 1. FINANCIAL SUMMARY HOOK
export function useProjectFinancialSummary(projectId: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY_PROJECT_TABS, 'summary', projectId],
    queryFn: () => getProjectFinancialSummary(projectId as string),
    enabled: !!projectId,
  });
}

// 2. INVOICES TAB HOOKS
export function useProjectInvoices(params: ProjectInvoiceQueryParams) {
  return useQuery({
    queryKey: [...QUERY_KEY_PROJECT_TABS, 'invoices', params],
    queryFn: () => getProjectInvoices(params),
    enabled: !!params.projectId,
  });
}

export function useProjectInvoiceStats(projectId: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY_PROJECT_TABS, 'invoice-stats', projectId],
    queryFn: () => getProjectInvoiceStats(projectId as string),
    enabled: !!projectId,
  });
}

export function useCreateProjectInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInvoiceInput) => createProjectInvoice(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_PROJECT_TABS });
      toast.success('Invoice created successfully');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create invoice'),
  });
}

// 3. PAYMENTS TAB HOOKS
export function useProjectPayments(params: ProjectPaymentQueryParams) {
  return useQuery({
    queryKey: [...QUERY_KEY_PROJECT_TABS, 'payments', params],
    queryFn: () => getProjectPayments(params),
    enabled: !!params.projectId,
  });
}

export function useProjectPaymentStats(projectId: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY_PROJECT_TABS, 'payment-stats', projectId],
    queryFn: () => getProjectPaymentStats(projectId as string),
    enabled: !!projectId,
  });
}

export function useRecordProjectPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RecordProjectPaymentInput) => recordProjectPayment(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_PROJECT_TABS });
      toast.success('Payment recorded successfully');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to record payment'),
  });
}

// 4. RECEIPTS TAB HOOKS
export function useProjectReceipts(params: ProjectReceiptQueryParams) {
  return useQuery({
    queryKey: [...QUERY_KEY_PROJECT_TABS, 'receipts', params],
    queryFn: () => getProjectReceipts(params),
    enabled: !!params.projectId,
  });
}

export function useProjectReceiptStats(projectId: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY_PROJECT_TABS, 'receipt-stats', projectId],
    queryFn: () => getProjectReceiptStats(projectId as string),
    enabled: !!projectId,
  });
}

// 5. FILES TAB HOOKS
export function useProjectFiles(params: ProjectFileQueryParams) {
  return useQuery({
    queryKey: [...QUERY_KEY_PROJECT_TABS, 'files', params],
    queryFn: () => getProjectFiles(params),
    enabled: !!params.projectId,
  });
}

export function useUploadProjectFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UploadProjectFileInput) => uploadProjectFile(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY_PROJECT_TABS, 'files'] });
      toast.success('File uploaded successfully');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to upload file'),
  });
}

export function useRenameProjectFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ fileId, newFileName }: { fileId: string; newFileName: string }) =>
      renameProjectFile(fileId, newFileName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY_PROJECT_TABS, 'files'] });
      toast.success('File renamed');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to rename file'),
  });
}

export function useDeleteProjectFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fileId: string) => deleteProjectFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY_PROJECT_TABS, 'files'] });
      toast.success('File deleted');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete file'),
  });
}

export function useMoveProjectFileCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ fileId, newCategory }: { fileId: string; newCategory: any }) =>
      moveProjectFileCategory(fileId, newCategory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY_PROJECT_TABS, 'files'] });
      toast.success('File moved to new category');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to move file'),
  });
}

// 6. NOTES TAB HOOKS
export function useProjectNotes(params: ProjectNoteQueryParams) {
  return useQuery({
    queryKey: [...QUERY_KEY_PROJECT_TABS, 'notes', params],
    queryFn: () => getProjectNotes(params),
    enabled: !!params.projectId,
  });
}

export function useCreateProjectNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectNoteInput) => createProjectNote(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY_PROJECT_TABS, 'notes'] });
      toast.success('Note added');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to add note'),
  });
}

export function useUpdateProjectNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ noteId, input }: { noteId: string; input: UpdateProjectNoteInput }) =>
      updateProjectNote(noteId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY_PROJECT_TABS, 'notes'] });
      toast.success('Note updated');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update note'),
  });
}

export function useTogglePinProjectNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) => togglePinProjectNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY_PROJECT_TABS, 'notes'] });
      toast.success('Note pin updated');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to toggle pin'),
  });
}

export function useDeleteProjectNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) => deleteProjectNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY_PROJECT_TABS, 'notes'] });
      toast.success('Note deleted');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete note'),
  });
}
