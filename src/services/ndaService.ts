import type { Nda, NdaFormValues, NdaListParams } from '../types/nda.types';
import type { PaginatedResponse } from '../types/common.types';
import { getClientById } from './clientService';

let SEED_NDAS: Nda[] = [
  {
    id: '1',
    ndaNo: 'NDA-2025-001',
    clientId: '1',
    clientName: 'Aravind Textiles Pvt Ltd',
    signedDate: '2025-01-14',
    expiryDate: '2027-01-14',
    status: 'Signed',
    attachmentRef: 'nda-aravind.pdf',
    notes: 'Confidentiality agreement executed and active for ERP transformation work.',
    version: 'v1.0',
    createdBy: 'Ajith Kumar',
    createdDate: '2025-01-10',
    lastUpdated: '2025-01-14',
  },
  {
    id: '2',
    ndaNo: 'NDA-2025-002',
    clientId: '2',
    clientName: 'Nithya Health Solutions',
    signedDate: '2025-02-10',
    expiryDate: '2026-02-10',
    status: 'Signed',
    attachmentRef: 'nda-nithya.pdf',
    notes: 'Covers product design and customer data handling.',
    version: 'v1.0',
    createdBy: 'Priya Nair',
    createdDate: '2025-02-05',
    lastUpdated: '2025-02-10',
  },
  {
    id: '3',
    ndaNo: 'NDA-2025-003',
    clientId: '3',
    clientName: 'Prime Logistics Corp',
    signedDate: '2025-04-18',
    expiryDate: '2026-04-18',
    status: 'Sent',
    attachmentRef: 'nda-prime-link.pdf',
    notes: 'Sent to legal for review after the initial outreach.',
    version: 'v1.1',
    createdBy: 'Rohan Sharma',
    createdDate: '2025-04-15',
    lastUpdated: '2025-04-18',
  },
  {
    id: '4',
    ndaNo: 'NDA-2025-004',
    clientId: '4',
    clientName: 'BlueWave Retail',
    signedDate: '2025-06-01',
    expiryDate: '2026-06-01',
    status: 'Draft',
    notes: 'Draft pending signature before onboarding the e-commerce team.',
    version: 'v0.9',
    createdBy: 'Ajith Kumar',
    createdDate: '2025-05-28',
    lastUpdated: '2025-06-01',
  },
  {
    id: '5',
    ndaNo: 'NDA-2025-005',
    clientId: '5',
    clientName: 'Karthik Constructions',
    signedDate: '2024-10-20',
    expiryDate: '2025-10-20',
    status: 'Expired',
    attachmentRef: 'nda-karthik.pdf',
    notes: 'Renewal reminder has been sent to the client.',
    version: 'v1.0',
    createdBy: 'System Admin',
    createdDate: '2024-10-15',
    lastUpdated: '2025-10-20',
  },
];

let nextId = SEED_NDAS.length + 1;

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function nextNdaNo(): string {
  const year = new Date().getFullYear();
  return `NDA-${year}-${String(nextId).padStart(3, '0')}`;
}

export async function getAllFilteredNdas(params: Omit<NdaListParams, 'page' | 'pageSize'>): Promise<Nda[]> {
  let rows = [...SEED_NDAS];

  if (params.search) {
    const q = params.search.toLowerCase();
    rows = rows.filter(
      (row) =>
        row.ndaNo.toLowerCase().includes(q) ||
        row.clientName.toLowerCase().includes(q) ||
        row.notes.toLowerCase().includes(q)
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

  return delay(rows);
}

export async function getNdas(params: NdaListParams): Promise<PaginatedResponse<Nda>> {
  let rows = await getAllFilteredNdas(params);

  const totalEntries = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / params.pageSize));
  const start = (params.page - 1) * params.pageSize;
  const paged = rows.slice(start, start + params.pageSize);

  return { data: paged, page: params.page, pageSize: params.pageSize, totalEntries, totalPages };
}

export async function getNdaById(id: string): Promise<Nda | undefined> {
  // TODO: replace with `const { data } = await axiosClient.get<Nda>(`/agreements/nda/${id}`); return data;`
  return delay(SEED_NDAS.find((row) => row.id === id));
}

export async function createNda(values: NdaFormValues): Promise<Nda> {
  // TODO: replace with `const { data } = await axiosClient.post<Nda>('/agreements/nda', values); return data;`
  const client = await getClientById(values.clientId);
  const nda: Nda = {
    id: String(nextId),
    ndaNo: nextNdaNo(),
    ...values,
    clientName: client?.companyName ?? 'Unknown Client',
  };
  nextId += 1;
  SEED_NDAS = [nda, ...SEED_NDAS];
  return delay(nda);
}

export async function updateNda(id: string, values: NdaFormValues): Promise<Nda> {
  // TODO: replace with `const { data } = await axiosClient.put<Nda>(`/agreements/nda/${id}`, values); return data;`
  const client = await getClientById(values.clientId);
  SEED_NDAS = SEED_NDAS.map((row) => (row.id === id ? { ...row, ...values, clientName: client?.companyName ?? row.clientName } : row));
  const updated = SEED_NDAS.find((row) => row.id === id)!;
  return delay(updated);
}

export async function deleteNda(id: string): Promise<void> {
  // TODO: replace with `await axiosClient.delete(`/agreements/nda/${id}`);`
  SEED_NDAS = SEED_NDAS.filter((row) => row.id !== id);
  return delay(undefined);
}
