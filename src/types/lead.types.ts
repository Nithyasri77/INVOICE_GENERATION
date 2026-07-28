/**
 * Purpose: TypeScript types for the Leads module
 * Responsibilities: API-friendly shape for Lead entity, status/source unions, and stat cards
 * Dependencies: none
 * Export: Lead, LeadStatus, LeadSource, LeadStats, LeadFollowUp, LeadActivity
 */

export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Qualified'
  | 'Proposal Sent'
  | 'Negotiation'
  | 'Won'
  | 'Lost';

export type LeadSource = 'Website' | 'Referral' | 'Cold Call' | 'Social Media' | 'Event' | 'Other';

export interface Lead {
  id: string;
  leadNumber: string; // e.g. LEAD-2026-014
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  source: LeadSource;
  assignedTo: string;
  status: LeadStatus;
  notes?: string;
  createdDate: string; // ISO date
}

export interface LeadFollowUp {
  id: string;
  leadId: string;
  date: string;
  note: string;
  createdBy: string;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  date: string;
  type: 'Status Change' | 'Note Added' | 'Follow-up Scheduled' | 'Converted';
  description: string;
}

export interface LeadStats {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  lostLeads: number;
}
