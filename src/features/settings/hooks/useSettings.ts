/**
 * Purpose: Data-fetching/mutation hooks for the Settings module
 * Responsibilities: Wrap settingsService calls in useQuery/useMutation — one mutation hook per
 *                    section so each can be saved independently
 * Dependencies: @tanstack/react-query, settingsService, settings.types
 * Export: useSettings, useUpdateCompanyProfile, useUpdateGstDetails, useUpdateBankDetails,
 *          useUpdateNumberFormats, useUpdateReminderTemplates, useUpdateTermsAndConditions
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getSettings,
  updateCompanyProfile,
  updateGstDetails,
  updateBankDetails,
  updateNumberFormats,
  updateReminderTemplates,
  updateTermsAndConditions,
} from '../../../services/settingsService';
import type {
  BankDetails,
  CompanyProfile,
  GstDetails,
  NumberFormatSettings,
  ReminderTemplates,
  TermsAndConditions,
} from '../../../types/settings.types';

const SETTINGS_KEY = 'settings';

export function useSettings() {
  return useQuery({ queryKey: [SETTINGS_KEY], queryFn: getSettings });
}

function useSectionMutation<T>(mutationFn: (values: T) => Promise<T>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [SETTINGS_KEY] }),
  });
}

export function useUpdateCompanyProfile() {
  return useSectionMutation<CompanyProfile>(updateCompanyProfile);
}

export function useUpdateGstDetails() {
  return useSectionMutation<GstDetails>(updateGstDetails);
}

export function useUpdateBankDetails() {
  return useSectionMutation<BankDetails>(updateBankDetails);
}

export function useUpdateNumberFormats() {
  return useSectionMutation<NumberFormatSettings>(updateNumberFormats);
}

export function useUpdateReminderTemplates() {
  return useSectionMutation<ReminderTemplates>(updateReminderTemplates);
}

export function useUpdateTermsAndConditions() {
  return useSectionMutation<TermsAndConditions>(updateTermsAndConditions);
}
