/**
 * Purpose: Data access layer for the Credit Notes module
 * Responsibilities: Expose getCreditNotes/getCreditNoteById/createCreditNote/updateCreditNote/
 *                    deleteCreditNote as the only way features/credit-notes reads or writes this data
 * NOTE: No Credit Notes API endpoint exists yet. Each function is wired to call axiosClient (see
 *       the commented real call) but currently operates on an in-memory seed array so the UI is
 *       reviewable end-to-end. Swap the TODO block for the real call once the backend is live.
 * Dependencies: axiosClient, creditNote.types, common.types, clientService, projectService
 *               (to denormalize clientName/projectName)
 * Export: getCreditNotes, getCreditNoteById, createCreditNote, updateCreditNote, deleteCreditNote
 */
import type { CreditNote, CreditNoteFormValues, CreditNoteListParams } from '../types/creditNote.types';
import type { PaginatedResponse } from '../types/common.types';
import { getClientById } from './clientService';
import { getProjectById } from './projectService';

let SEED_CREDIT_NOTES: CreditNote[] = [
  {
    id: '1',
    creditNoteNo: 'CN-2025-0001',
    clientId: '4',
    clientName: 'BlueWave Retail',
    projectId: '4',
    projectName: 'E-commerce Storefront',
    invoiceRef: 'INV-2025-4001',
    date: '2025-03-10',
    reason: '10% discount approved for early payment',
    amount: 19600,
    status: 'Applied',
    notes: 'Customer requested a promo adjustment on the initial invoice',
  },
  {
    id: '2',
    creditNoteNo: 'CN-2025-0002',
    clientId: '2',
    clientName: 'Nithya Health Solutions',
    projectId: '2',
    projectName: 'Patient Portal Redesign',
    invoiceRef: 'INV-2025-2002',
    date: '2025-05-01',
    reason: 'Refund — duplicate milestone charge corrected',
    amount: 8500,
    status: 'Open',
    notes: 'Duplicate line item entered in milestone billing',
  },
  {
    id: '3',
    creditNoteNo: 'CN-2025-0003',
    clientId: '1',
    clientName: 'Aravind Textiles Pvt Ltd',
    projectId: '1',
    projectName: 'ERP Revamp — Phase 1',
    invoiceRef: 'INV-2025-1002',
    date: '2025-05-25',
    reason: 'Goodwill adjustment for delayed delivery',
    amount: 12000,
    status: 'Applied',
    notes: 'Issued after client escalation',
  },
  {
    id: '4',
    creditNoteNo: 'CN-2025-0004',
    clientId: '5',
    clientName: 'Karthik Constructions',
    projectId: '5',
    projectName: 'Site Billing & Inventory Tool',
    invoiceRef: 'INV-2025-5002',
    date: '2025-07-18',
    reason: 'Overbilling correction — inventory module estimate was too high',
    amount: 7500,
    status: 'Cancelled',
    notes: 'Client disputed the correction and requested re-review',
  },
  {
    id: '5',
    creditNoteNo: 'CN-2025-0005',
    clientId: '3',
    clientName: 'Prime Logistics Corp',
    projectId: '3',
    projectName: 'Fleet Tracking Dashboard',
    invoiceRef: 'INV-2024-3002',
    date: '2025-01-12',
    reason: 'Credit memo for service outage compensation',
    amount: 18000,
    status: 'Open',
    notes: 'Pending approval from finance',
  },
];

let nextId = SEED_CREDIT_NOTES.length + 1;

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function nextCreditNoteNo(): string {
  const year = new Date().getFullYear();
  return `CN-${year}-${String(nextId).padStart(4, '0')}`;
}

export async function getCreditNotes(params: CreditNoteListParams): Promise<PaginatedResponse<CreditNote>> {
  // TODO: replace with `const { data } = await axiosClient.get<PaginatedResponse<CreditNote>>('/billing/credit-notes', { params }); return data;`
  let rows = [...SEED_CREDIT_NOTES];

  if (params.search) {
    const q = params.search.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.creditNoteNo.toLowerCase().includes(q) ||
        r.clientName.toLowerCase().includes(q) ||
        (r.projectName ?? '').toLowerCase().includes(q) ||
        (r.invoiceRef ?? '').toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q)
    );
  }

  if (params.status) {
    rows = rows.filter((r) => r.status === params.status);
  }

  if (params.clientId) {
    rows = rows.filter((r) => r.clientId === params.clientId);
  }

  if (params.sortBy) {
    const dir = params.sortDirection === 'desc' ? -1 : 1;
    rows.sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[params.sortBy!];
      const bv = (b as unknown as Record<string, unknown>)[params.sortBy!];
      if (av == null || bv == null) return 0;
      return av > bv ? dir : av < bv ? -dir : 0;
    });
  }

  const totalEntries = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / params.pageSize));
  const start = (params.page - 1) * params.pageSize;
  const paged = rows.slice(start, start + params.pageSize);

  return delay({
    data: paged,
    page: params.page,
    pageSize: params.pageSize,
    totalEntries,
    totalPages,
  });
}

export async function getCreditNoteById(id: string): Promise<CreditNote | undefined> {
  // TODO: replace with `const { data } = await axiosClient.get<CreditNote>(`/billing/credit-notes/${id}`); return data;`
  return delay(SEED_CREDIT_NOTES.find((r) => r.id === id));
}

export async function createCreditNote(values: CreditNoteFormValues): Promise<CreditNote> {
  // TODO: replace with `const { data } = await axiosClient.post<CreditNote>('/billing/credit-notes', values); return data;`
  const client = await getClientById(values.clientId);
  const project = values.projectId ? await getProjectById(values.projectId) : undefined;
  const creditNote: CreditNote = {
    id: String(nextId),
    creditNoteNo: nextCreditNoteNo(),
    ...values,
    clientName: client?.companyName ?? 'Unknown Client',
    projectName: project?.projectName,
  };
  nextId += 1;
  SEED_CREDIT_NOTES = [creditNote, ...SEED_CREDIT_NOTES];
  return delay(creditNote);
}

export async function updateCreditNote(id: string, values: CreditNoteFormValues): Promise<CreditNote> {
  // TODO: replace with `const { data } = await axiosClient.put<CreditNote>(`/billing/credit-notes/${id}`, values); return data;`
  const client = await getClientById(values.clientId);
  const project = values.projectId ? await getProjectById(values.projectId) : undefined;
  SEED_CREDIT_NOTES = SEED_CREDIT_NOTES.map((r) =>
    r.id === id
      ? {
          ...r,
          ...values,
          clientName: client?.companyName ?? r.clientName,
          projectName: project?.projectName,
        }
      : r
  );
  const updated = SEED_CREDIT_NOTES.find((r) => r.id === id)!;
  return delay(updated);
}

export async function deleteCreditNote(id: string): Promise<void> {
  // TODO: replace with `await axiosClient.delete(`/billing/credit-notes/${id}`);`
  SEED_CREDIT_NOTES = SEED_CREDIT_NOTES.filter((r) => r.id !== id);
  return delay(undefined);
}
