/**
 * Purpose: Option lists for Lead status/source — feeds Select dropdowns, filters, and Zod enums
 * Responsibilities: Single source of truth so status/source lists never drift between the
 *                    create form, filter panel, and validation schema
 * Dependencies: lead.types
 * Export: LEAD_STATUS_OPTIONS, LEAD_SOURCE_OPTIONS, LEAD_STATUSES, LEAD_SOURCES
 */
import type { LeadStatus, LeadSource } from '../types/lead.types';
import type { SelectOption } from '../components/ui/Select';

export const LEAD_STATUSES: LeadStatus[] = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Lost',
];

export const LEAD_SOURCES: LeadSource[] = ['Website', 'Referral', 'Cold Call', 'Social Media', 'Event', 'Other'];

export const LEAD_STATUS_OPTIONS: SelectOption[] = LEAD_STATUSES.map((s) => ({ value: s, label: s }));
export const LEAD_SOURCE_OPTIONS: SelectOption[] = LEAD_SOURCES.map((s) => ({ value: s, label: s }));
