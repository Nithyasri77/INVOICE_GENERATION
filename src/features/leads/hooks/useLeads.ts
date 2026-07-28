/**
 * Purpose: All data-fetching/mutation hooks for the Leads module
 * Responsibilities: Wrap leadService in useQuery/useMutation; invalidate the right query keys
 *                    on mutation success so lists/detail views stay in sync
 * Dependencies: @tanstack/react-query, leadService, toast (ui)
 * Export: useLeads, useLeadStats, useLead, useCreateLead, useUpdateLead, useDeleteLead,
 *         useConvertLeadToClient, useLeadFollowUps, useLeadActivities, useAddLeadFollowUp
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getLeads,
  getLeadStats,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  convertLeadToClient,
  getLeadFollowUps,
  getLeadActivities,
  addLeadFollowUp,
  type LeadListParams,
  type CreateLeadInput,
  type UpdateLeadInput,
} from '../../../services/leadService';
import { toast } from '../../../components/ui/Toast';

const LEADS_KEY = ['leads'] as const;

export function useLeads(params: LeadListParams) {
  return useQuery({
    queryKey: [...LEADS_KEY, 'list', params],
    queryFn: () => getLeads(params),
  });
}

export function useLeadStats() {
  return useQuery({
    queryKey: [...LEADS_KEY, 'stats'],
    queryFn: getLeadStats,
  });
}

export function useLead(id: string | undefined) {
  return useQuery({
    queryKey: [...LEADS_KEY, 'detail', id],
    queryFn: () => getLead(id as string),
    enabled: !!id,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLeadInput) => createLead(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_KEY });
      toast.success('Lead created successfully');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateLeadInput }) => updateLead(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_KEY });
      toast.success('Lead updated successfully');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_KEY });
      toast.success('Lead deleted');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useConvertLeadToClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => convertLeadToClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_KEY });
      toast.success('Lead converted to client');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useLeadFollowUps(leadId: string | undefined) {
  return useQuery({
    queryKey: [...LEADS_KEY, 'follow-ups', leadId],
    queryFn: () => getLeadFollowUps(leadId as string),
    enabled: !!leadId,
  });
}

export function useLeadActivities(leadId: string | undefined) {
  return useQuery({
    queryKey: [...LEADS_KEY, 'activities', leadId],
    queryFn: () => getLeadActivities(leadId as string),
    enabled: !!leadId,
  });
}

export function useAddLeadFollowUp(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (note: string) => addLeadFollowUp(leadId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...LEADS_KEY, 'follow-ups', leadId] });
      toast.success('Follow-up added');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
