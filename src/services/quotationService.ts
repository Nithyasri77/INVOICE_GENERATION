/**
 * Purpose: Data access layer for the Quotations module
 * Responsibilities: Expose getQuotations/getQuotationById/createQuotation/updateQuotation/
 *                    deleteQuotation as the only way features/quotations reads or writes this data
 * NOTE: No Quotations API endpoint exists yet. Each function is wired to call axiosClient (see the
 *       commented real call) but currently operates on an in-memory seed array so the UI is
 *       reviewable end-to-end. Swap the TODO block for the real call once the backend is live.
 * Dependencies: axiosClient, quotation.types, common.types, clientService (to denormalize clientName)
 * Export: getQuotations, getQuotationById, createQuotation, updateQuotation, deleteQuotation
 */
import type { Quotation, QuotationFormValues, QuotationListParams } from '../types/quotation.types';
import type { PaginatedResponse } from '../types/common.types';
import { getClientById } from './clientService';

let SEED_QUOTATIONS: Quotation[] = [
  {
    id: '1',
    quotationNo: 'QT-2025-011',
    clientId: '1',
    clientName: 'Aravind Textiles Pvt Ltd',
    quotationDate: '2025-01-20',
    validUntil: '2025-02-20',
    amount: 850000,
    status: 'Accepted',
    notes: 'ERP Revamp — Phase 1, converted to PRJ-0001',
  },
  {
    id: '2',
    quotationNo: 'QT-2025-018',
    clientId: '2',
    clientName: 'Nithya Health Solutions',
    quotationDate: '2025-02-25',
    validUntil: '2025-03-25',
    amount: 360000,
    status: 'Accepted',
    notes: 'Patient Portal Redesign, converted to PRJ-0002',
  },
  {
    id: '3',
    quotationNo: 'QT-2025-002',
    clientId: '4',
    clientName: 'BlueWave Retail',
    quotationDate: '2025-01-05',
    validUntil: '2025-02-05',
    amount: 980000,
    status: 'Accepted',
    notes: 'E-commerce Storefront, converted to PRJ-0004',
  },
  {
    id: '4',
    quotationNo: 'QT-2025-031',
    clientId: '3',
    clientName: 'Prime Logistics Corp',
    quotationDate: '2025-06-10',
    validUntil: '2025-07-10',
    amount: 275000,
    status: 'Sent',
    notes: 'Fleet Tracking Dashboard — Phase 2 proposal',
  },
  {
    id: '5',
    quotationNo: 'QT-2025-033',
    clientId: '5',
    clientName: 'Karthik Constructions',
    quotationDate: '2025-06-18',
    validUntil: '2025-07-18',
    amount: 150000,
    status: 'Draft',
    notes: 'Site Billing add-on module proposal',
  },
];

let nextId = SEED_QUOTATIONS.length + 1;

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function nextQuotationNo(): string {
  const year = new Date().getFullYear();
  return `QT-${year}-${String(nextId).padStart(3, '0')}`;
}

export async function getQuotations(params: QuotationListParams): Promise<PaginatedResponse<Quotation>> {
  // TODO: replace with `const { data } = await axiosClient.get<PaginatedResponse<Quotation>>('/quotations', { params }); return data;`
  let rows = [...SEED_QUOTATIONS];

  if (params.search) {
    const q = params.search.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.quotationNo.toLowerCase().includes(q) ||
        r.clientName.toLowerCase().includes(q) ||
        r.notes.toLowerCase().includes(q)
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

export async function getQuotationById(id: string): Promise<Quotation | undefined> {
  // TODO: replace with `const { data } = await axiosClient.get<Quotation>(`/quotations/${id}`); return data;`
  return delay(SEED_QUOTATIONS.find((r) => r.id === id));
}

export async function createQuotation(values: QuotationFormValues): Promise<Quotation> {
  // TODO: replace with `const { data } = await axiosClient.post<Quotation>('/quotations', values); return data;`
  const client = await getClientById(values.clientId);
  const quotation: Quotation = {
    id: String(nextId),
    quotationNo: nextQuotationNo(),
    ...values,
    clientName: client?.companyName ?? 'Unknown Client',
  };
  nextId += 1;
  SEED_QUOTATIONS = [quotation, ...SEED_QUOTATIONS];
  return delay(quotation);
}

export async function updateQuotation(id: string, values: QuotationFormValues): Promise<Quotation> {
  // TODO: replace with `const { data } = await axiosClient.put<Quotation>(`/quotations/${id}`, values); return data;`
  const client = await getClientById(values.clientId);
  SEED_QUOTATIONS = SEED_QUOTATIONS.map((r) =>
    r.id === id ? { ...r, ...values, clientName: client?.companyName ?? r.clientName } : r
  );
  const updated = SEED_QUOTATIONS.find((r) => r.id === id)!;
  return delay(updated);
}

export async function deleteQuotation(id: string): Promise<void> {
  // TODO: replace with `await axiosClient.delete(`/quotations/${id}`);`
  SEED_QUOTATIONS = SEED_QUOTATIONS.filter((r) => r.id !== id);
  return delay(undefined);
}
