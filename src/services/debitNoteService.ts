/**
 * Purpose: Data access layer for the Debit Notes module
 * Responsibilities: Expose getDebitNotes/getDebitNoteById/createDebitNote/updateDebitNote/
 *                    deleteDebitNote as the only way features/debit-notes reads or writes this data
 * NOTE: No Debit Notes API endpoint exists yet. Each function is wired to call axiosClient (see
 *       the commented real call) but currently operates on an in-memory seed array so the UI is
 *       reviewable end-to-end. Swap the TODO block for the real call once the backend is live.
 *       Seed rows reference the same projects/invoice numbers used in the Statement of Account
 *       module's seed ledger, so the two stay consistent.
 * Dependencies: axiosClient, debitNote.types, common.types, clientService, projectService
 *               (to denormalize clientName/projectName)
 * Export: getDebitNotes, getDebitNoteById, createDebitNote, updateDebitNote, deleteDebitNote
 */
import type { DebitNote, DebitNoteFormValues, DebitNoteListParams } from '../types/debitNote.types';
import type { PaginatedResponse } from '../types/common.types';
import { getClientById } from './clientService';
import { getProjectById } from './projectService';

let SEED_DEBIT_NOTES: DebitNote[] = [
  {
    id: '1',
    debitNoteNo: 'DN-2025-0001',
    clientId: '1',
    clientName: 'Aravind Textiles Pvt Ltd',
    projectId: '1',
    projectName: 'ERP Revamp — Phase 1',
    invoiceRef: 'INV-2025-1002',
    date: '2025-06-02',
    reason: 'Additional scope — 2 extra report modules requested mid-development',
    amount: 28000,
    status: 'Applied',
    notes: 'Approved by client over email on 30-May-2025',
  },
  {
    id: '2',
    debitNoteNo: 'DN-2025-0002',
    clientId: '2',
    clientName: 'Nithya Health Solutions',
    projectId: '2',
    projectName: 'Patient Portal Redesign',
    invoiceRef: 'INV-2025-2002',
    date: '2025-05-05',
    reason: 'Price correction — UI Design milestone under-invoiced by mistake',
    amount: 12000,
    status: 'Open',
    notes: '',
  },
  {
    id: '3',
    debitNoteNo: 'DN-2025-0003',
    clientId: '4',
    clientName: 'BlueWave Retail',
    projectId: '4',
    projectName: 'E-commerce Storefront',
    invoiceRef: 'INV-2025-4002',
    date: '2025-04-10',
    reason: 'Extra payment gateway integration (Razorpay + Stripe) beyond original SOW',
    amount: 45000,
    status: 'Applied',
    notes: 'Linked to Checkout Module milestone',
  },
  {
    id: '4',
    debitNoteNo: 'DN-2025-0004',
    clientId: '5',
    clientName: 'Karthik Constructions',
    projectId: '5',
    projectName: 'Site Billing & Inventory Tool',
    date: '2025-07-22',
    reason: 'Server/hosting cost pass-through for Q3',
    amount: 6500,
    status: 'Open',
    notes: 'Recurring — raise again next quarter',
  },
  {
    id: '5',
    debitNoteNo: 'DN-2025-0005',
    clientId: '3',
    clientName: 'Prime Logistics Corp',
    projectId: '3',
    projectName: 'Fleet Tracking Dashboard',
    invoiceRef: 'INV-2024-3002',
    date: '2025-01-08',
    reason: 'Change request withdrawn by client after invoicing',
    amount: 15000,
    status: 'Cancelled',
    notes: 'Client dropped the requested change; note cancelled, no amount due',
  },
];

let nextId = SEED_DEBIT_NOTES.length + 1;

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function nextDebitNoteNo(): string {
  const year = new Date().getFullYear();
  return `DN-${year}-${String(nextId).padStart(4, '0')}`;
}

export async function getDebitNotes(params: DebitNoteListParams): Promise<PaginatedResponse<DebitNote>> {
  // TODO: replace with `const { data } = await axiosClient.get<PaginatedResponse<DebitNote>>('/billing/debit-notes', { params }); return data;`
  let rows = [...SEED_DEBIT_NOTES];

  if (params.search) {
    const q = params.search.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.debitNoteNo.toLowerCase().includes(q) ||
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

export async function getDebitNoteById(id: string): Promise<DebitNote | undefined> {
  // TODO: replace with `const { data } = await axiosClient.get<DebitNote>(`/billing/debit-notes/${id}`); return data;`
  return delay(SEED_DEBIT_NOTES.find((r) => r.id === id));
}

export async function createDebitNote(values: DebitNoteFormValues): Promise<DebitNote> {
  // TODO: replace with `const { data } = await axiosClient.post<DebitNote>('/billing/debit-notes', values); return data;`
  const client = await getClientById(values.clientId);
  const project = values.projectId ? await getProjectById(values.projectId) : undefined;
  const debitNote: DebitNote = {
    id: String(nextId),
    debitNoteNo: nextDebitNoteNo(),
    ...values,
    clientName: client?.companyName ?? 'Unknown Client',
    projectName: project?.projectName,
  };
  nextId += 1;
  SEED_DEBIT_NOTES = [debitNote, ...SEED_DEBIT_NOTES];
  return delay(debitNote);
}

export async function updateDebitNote(id: string, values: DebitNoteFormValues): Promise<DebitNote> {
  // TODO: replace with `const { data } = await axiosClient.put<DebitNote>(`/billing/debit-notes/${id}`, values); return data;`
  const client = await getClientById(values.clientId);
  const project = values.projectId ? await getProjectById(values.projectId) : undefined;
  SEED_DEBIT_NOTES = SEED_DEBIT_NOTES.map((r) =>
    r.id === id
      ? {
          ...r,
          ...values,
          clientName: client?.companyName ?? r.clientName,
          projectName: project?.projectName,
        }
      : r
  );
  const updated = SEED_DEBIT_NOTES.find((r) => r.id === id)!;
  return delay(updated);
}

export async function deleteDebitNote(id: string): Promise<void> {
  // TODO: replace with `await axiosClient.delete(`/billing/debit-notes/${id}`);`
  SEED_DEBIT_NOTES = SEED_DEBIT_NOTES.filter((r) => r.id !== id);
  return delay(undefined);
}
