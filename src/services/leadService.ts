/**
 * Purpose: Data access layer for the Leads module — the only place that talks to the API
 * Responsibilities: List (with search/filter/sort/pagination), get one, create, update, delete,
 *                    convert-to-client, and follow-up/activity reads
 * NOTE: No backend exists yet. Each function is structured exactly as it will be once wired to
 *       axiosClient (see TODO comments) but currently operates on an in-memory seed array so the
 *       module is fully reviewable. Data resets on page reload — this is expected until the real
 *       API is connected.
 * Dependencies: axiosClient (for future use), lead.types, common.types
 * Export: getLeads, getLead, createLead, updateLead, deleteLead, convertLeadToClient,
 *         getLeadFollowUps, getLeadActivities, addLeadFollowUp, getLeadStats
 */
import type {
  Lead,
  LeadFollowUp,
  LeadActivity,
  LeadStats,
} from '../types/lead.types';
import type { PaginatedResponse } from '../types/common.types';

export interface LeadListParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  source?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface CreateLeadInput {
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  source: Lead['source'];
  assignedTo: string;
  status: Lead['status'];
  notes?: string;
}

export type UpdateLeadInput = Partial<CreateLeadInput>;

// ---- In-memory seed store (TODO: remove once /leads API endpoints exist) ----
let LEADS_STORE: Lead[] = [
  {
    id: 'lead_001', leadNumber: 'LD-2026-014', companyName: 'Bright Future Retail', contactPerson: 'Rakesh Menon',
    phone: '+91 98765 43210', email: 'rakesh@brightfuture.in', source: 'Website', assignedTo: 'Ajith Kumar',
    status: 'New', notes: 'Interested in POS + billing integration.', createdDate: '2026-07-20',
  },
  {
    id: 'lead_002', leadNumber: 'LD-2026-013', companyName: 'Spark Solutions', contactPerson: 'Divya Iyer',
    phone: '+91 90123 45678', email: 'divya@sparksolutions.com', source: 'Referral', assignedTo: 'Priya Nair',
    status: 'Contacted', notes: 'Referred by ABC Industries.', createdDate: '2026-07-18',
  },
  {
    id: 'lead_003', leadNumber: 'LD-2026-012', companyName: 'Techno Ventures', contactPerson: 'Suresh Babu',
    phone: '+91 91234 56789', email: 'suresh@technoventures.in', source: 'Cold Call', assignedTo: 'Ajith Kumar',
    status: 'Qualified', notes: 'Budget confirmed, needs a formal proposal.', createdDate: '2026-07-15',
  },
  {
    id: 'lead_004', leadNumber: 'LD-2026-011', companyName: 'Global Enterprises', contactPerson: 'Meena Pillai',
    phone: '+91 99887 76655', email: 'meena@globalent.com', source: 'Social Media', assignedTo: 'Priya Nair',
    status: 'Proposal Sent', notes: 'Awaiting response on quotation QT-2026-021.', createdDate: '2026-07-10',
  },
  {
    id: 'lead_005', leadNumber: 'LD-2026-010', companyName: 'Coastal Logistics', contactPerson: 'Anand Raj',
    phone: '+91 88776 65544', email: 'anand@coastallog.in', source: 'Event', assignedTo: 'Ajith Kumar',
    status: 'Negotiation', notes: 'Negotiating AMC terms.', createdDate: '2026-07-05',
  },
  {
    id: 'lead_006', leadNumber: 'LD-2026-009', companyName: 'ABC Industries Pvt Ltd', contactPerson: 'Kavitha Rao',
    phone: '+91 97654 32109', email: 'kavitha@abcindustries.com', source: 'Referral', assignedTo: 'Priya Nair',
    status: 'Won', notes: 'Converted to client — AMC Management System project.', createdDate: '2026-06-28',
  },
  {
    id: 'lead_007', leadNumber: 'LD-2026-008', companyName: 'Northline Traders', contactPerson: 'Vishnu Prasad',
    phone: '+91 96543 21098', email: 'vishnu@northline.in', source: 'Website', assignedTo: 'Ajith Kumar',
    status: 'Lost', notes: 'Went with a competitor on pricing.', createdDate: '2026-06-20',
  },
  {
    id: 'lead_008', leadNumber: 'LD-2026-007', companyName: 'Emerald Textiles', contactPerson: 'Lakshmi Nair',
    phone: '+91 95432 10987', email: 'lakshmi@emeraldtex.com', source: 'Other', assignedTo: 'Priya Nair',
    status: 'New', notes: '', createdDate: '2026-07-22',
  },
];

let FOLLOW_UPS_STORE: LeadFollowUp[] = [
  { id: 'fu_001', leadId: 'lead_003', date: '2026-07-16', note: 'Called to discuss proposal timeline.', createdBy: 'Ajith Kumar' },
  { id: 'fu_002', leadId: 'lead_004', date: '2026-07-11', note: 'Sent revised quotation via email.', createdBy: 'Priya Nair' },
];

let ACTIVITIES_STORE: LeadActivity[] = [
  { id: 'act_001', leadId: 'lead_003', date: '2026-07-15', type: 'Status Change', description: 'Status changed from Contacted to Qualified' },
  { id: 'act_002', leadId: 'lead_003', date: '2026-07-16', type: 'Follow-up Scheduled', description: 'Follow-up call scheduled and completed' },
];

function simulateDelay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function getLeads(params: LeadListParams): Promise<PaginatedResponse<Lead>> {
  // TODO: replace with `const { data } = await axiosClient.get('/leads', { params }); return data;`
  let filtered = [...LEADS_STORE];

  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (l) =>
        l.companyName.toLowerCase().includes(q) ||
        l.contactPerson.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.leadNumber.toLowerCase().includes(q)
    );
  }
  if (params.status) filtered = filtered.filter((l) => l.status === params.status);
  if (params.source) filtered = filtered.filter((l) => l.source === params.source);

  if (params.sortBy) {
    const dir = params.sortDirection === 'asc' ? 1 : -1;
    filtered.sort((a, b) => {
      const aVal = String(a[params.sortBy as keyof Lead] ?? '');
      const bVal = String(b[params.sortBy as keyof Lead] ?? '');
      return aVal.localeCompare(bVal) * dir;
    });
  } else {
    filtered.sort((a, b) => b.createdDate.localeCompare(a.createdDate));
  }

  const totalEntries = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / params.pageSize));
  const start = (params.page - 1) * params.pageSize;
  const pageData = filtered.slice(start, start + params.pageSize);

  return simulateDelay({ data: pageData, page: params.page, pageSize: params.pageSize, totalEntries, totalPages });
}

export async function getLeadStats(): Promise<LeadStats> {
  // TODO: replace with `const { data } = await axiosClient.get('/leads/stats'); return data;`
  return simulateDelay({
    totalLeads: LEADS_STORE.length,
    newLeads: LEADS_STORE.filter((l) => l.status === 'New').length,
    qualifiedLeads: LEADS_STORE.filter((l) => l.status === 'Qualified').length,
    convertedLeads: LEADS_STORE.filter((l) => l.status === 'Won').length,
    lostLeads: LEADS_STORE.filter((l) => l.status === 'Lost').length,
  });
}

export async function getLead(id: string): Promise<Lead> {
  // TODO: replace with `const { data } = await axiosClient.get(`/leads/${id}`); return data;`
  const lead = LEADS_STORE.find((l) => l.id === id);
  if (!lead) throw new Error('Lead not found');
  return simulateDelay(lead);
}

export async function createLead(input: CreateLeadInput): Promise<Lead> {
  // TODO: replace with `const { data } = await axiosClient.post('/leads', input); return data;`
  const nextNumber = LEADS_STORE.length + 15;
  const newLead: Lead = {
    id: `lead_${String(LEADS_STORE.length + 1).padStart(3, '0')}`,
    leadNumber: `LD-2026-${String(nextNumber).padStart(3, '0')}`,
    createdDate: new Date().toISOString().slice(0, 10),
    ...input,
  };
  LEADS_STORE = [newLead, ...LEADS_STORE];
  return simulateDelay(newLead);
}

export async function updateLead(id: string, input: UpdateLeadInput): Promise<Lead> {
  // TODO: replace with `const { data } = await axiosClient.patch(`/leads/${id}`, input); return data;`
  const idx = LEADS_STORE.findIndex((l) => l.id === id);
  if (idx === -1) throw new Error('Lead not found');
  LEADS_STORE[idx] = { ...LEADS_STORE[idx], ...input };
  return simulateDelay(LEADS_STORE[idx]);
}

export async function deleteLead(id: string): Promise<void> {
  // TODO: replace with `await axiosClient.delete(`/leads/${id}`);`
  LEADS_STORE = LEADS_STORE.filter((l) => l.id !== id);
  return simulateDelay(undefined);
}

export async function convertLeadToClient(id: string): Promise<Lead> {
  // TODO: replace with `const { data } = await axiosClient.post(`/leads/${id}/convert`); return data;`
  // Business rule (per BRD): converting marks the lead Won; actual Client record creation
  // happens via clientService.createClient() once the Clients module owns that flow.
  return updateLead(id, { status: 'Won' });
}

export async function getLeadFollowUps(leadId: string): Promise<LeadFollowUp[]> {
  // TODO: replace with `const { data } = await axiosClient.get(`/leads/${leadId}/follow-ups`); return data;`
  return simulateDelay(FOLLOW_UPS_STORE.filter((f) => f.leadId === leadId));
}

export async function getLeadActivities(leadId: string): Promise<LeadActivity[]> {
  // TODO: replace with `const { data } = await axiosClient.get(`/leads/${leadId}/activities`); return data;`
  return simulateDelay(ACTIVITIES_STORE.filter((a) => a.leadId === leadId));
}

export async function addLeadFollowUp(leadId: string, note: string): Promise<LeadFollowUp> {
  // TODO: replace with `const { data } = await axiosClient.post(`/leads/${leadId}/follow-ups`, { note }); return data;`
  const followUp: LeadFollowUp = {
    id: `fu_${String(FOLLOW_UPS_STORE.length + 1).padStart(3, '0')}`,
    leadId,
    date: new Date().toISOString().slice(0, 10),
    note,
    createdBy: 'Ajith Kumar',
  };
  FOLLOW_UPS_STORE = [followUp, ...FOLLOW_UPS_STORE];
  return simulateDelay(followUp);
}
