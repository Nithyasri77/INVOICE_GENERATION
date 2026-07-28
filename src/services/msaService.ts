import type { Msa, MsaFormValues, MsaListParams } from '../types/msa.types';
import type { PaginatedResponse } from '../types/common.types';
import { getClientById } from './clientService';

let SEED_MSAS: Msa[] = [
  {
    id: '1',
    msaNo: 'MSA-2025-001',
    clientId: '1',
    clientName: 'Aravind Textiles Pvt Ltd',
    effectiveDate: '2025-01-14',
    endDate: '2027-01-14',
    paymentTerms: 'Net 30',
    governingLaw: 'Chennai jurisdiction',
    terminationNoticeDays: 30,
    status: 'Signed',
    attachmentRef: 'msa-aravind.pdf',
    notes: 'Commercial legal terms for the enterprise transformation program.',
  },
  {
    id: '2',
    msaNo: 'MSA-2025-002',
    clientId: '2',
    clientName: 'Nithya Health Solutions',
    effectiveDate: '2025-02-10',
    endDate: '2026-02-10',
    paymentTerms: 'Net 45',
    governingLaw: 'Chennai jurisdiction',
    terminationNoticeDays: 45,
    status: 'Signed',
    attachmentRef: 'msa-nithya.pdf',
    notes: 'Covers secure product development and data processing obligations.',
  },
  {
    id: '3',
    msaNo: 'MSA-2025-003',
    clientId: '3',
    clientName: 'Prime Logistics Corp',
    effectiveDate: '2025-04-18',
    paymentTerms: 'Net 15',
    governingLaw: 'Chennai jurisdiction',
    terminationNoticeDays: 15,
    status: 'Sent',
    attachmentRef: 'msa-prime.pdf',
    notes: 'Sent to the client legal team for review around fleet analytics scope.',
  },
  {
    id: '4',
    msaNo: 'MSA-2025-004',
    clientId: '4',
    clientName: 'BlueWave Retail',
    effectiveDate: '2025-06-01',
    paymentTerms: 'Net 30',
    governingLaw: 'Chennai jurisdiction',
    terminationNoticeDays: 30,
    status: 'Draft',
    notes: 'Draft pending final commercial terms before launch.',
  },
  {
    id: '5',
    msaNo: 'MSA-2025-005',
    clientId: '5',
    clientName: 'Karthik Constructions',
    effectiveDate: '2024-10-20',
    endDate: '2025-10-20',
    paymentTerms: 'Net 60',
    governingLaw: 'Coimbatore jurisdiction',
    terminationNoticeDays: 60,
    status: 'Expired',
    attachmentRef: 'msa-karthik.pdf',
    notes: 'Renewal discussion scheduled with the operations head.',
  },
];

let nextId = SEED_MSAS.length + 1;

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function nextMsaNo(): string {
  const year = new Date().getFullYear();
  return `MSA-${year}-${String(nextId).padStart(3, '0')}`;
}

export async function getMsas(params: MsaListParams): Promise<PaginatedResponse<Msa>> {
  // TODO: replace with `const { data } = await axiosClient.get<PaginatedResponse<Msa>>('/agreements/msa', { params }); return data;`
  let rows = [...SEED_MSAS];

  if (params.search) {
    const q = params.search.toLowerCase();
    rows = rows.filter((row) =>
      row.msaNo.toLowerCase().includes(q) || row.clientName.toLowerCase().includes(q) || row.paymentTerms.toLowerCase().includes(q) || row.notes.toLowerCase().includes(q)
    );
  }

  if (params.status) {
    rows = rows.filter((row) => row.status === params.status);
  }

  if (params.clientId) {
    rows = rows.filter((row) => row.clientId === params.clientId);
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

  return delay({ data: paged, page: params.page, pageSize: params.pageSize, totalEntries, totalPages });
}

export async function getMsaById(id: string): Promise<Msa | undefined> {
  // TODO: replace with `const { data } = await axiosClient.get<Msa>(`/agreements/msa/${id}`); return data;`
  return delay(SEED_MSAS.find((row) => row.id === id));
}

export async function createMsa(values: MsaFormValues): Promise<Msa> {
  // TODO: replace with `const { data } = await axiosClient.post<Msa>('/agreements/msa', values); return data;`
  const client = await getClientById(values.clientId);
  const msa: Msa = {
    id: String(nextId),
    msaNo: nextMsaNo(),
    ...values,
    clientName: client?.companyName ?? 'Unknown Client',
  };
  nextId += 1;
  SEED_MSAS = [msa, ...SEED_MSAS];
  return delay(msa);
}

export async function updateMsa(id: string, values: MsaFormValues): Promise<Msa> {
  // TODO: replace with `const { data } = await axiosClient.put<Msa>(`/agreements/msa/${id}`, values); return data;`
  const client = await getClientById(values.clientId);
  SEED_MSAS = SEED_MSAS.map((row) => (row.id === id ? { ...row, ...values, clientName: client?.companyName ?? row.clientName } : row));
  const updated = SEED_MSAS.find((row) => row.id === id)!;
  return delay(updated);
}

export async function deleteMsa(id: string): Promise<void> {
  // TODO: replace with `await axiosClient.delete(`/agreements/msa/${id}`);`
  SEED_MSAS = SEED_MSAS.filter((row) => row.id !== id);
  return delay(undefined);
}
