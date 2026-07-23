/**
 * Purpose: Data access layer for the Clients module
 * Responsibilities: Expose getClients/getClientById/createClient/updateClient/deleteClient as the
 *                    only way features/clients reads or writes this data — components never touch
 *                    the seed array directly
 * NOTE: No Clients API endpoint exists yet. Each function is wired to call axiosClient (see the
 *       commented real call) but currently operates on an in-memory seed array so the UI is
 *       reviewable end-to-end (including create/edit/delete). Swap the TODO block for the real
 *       call once the backend is live — the function signatures/return shapes are already API-final.
 * Dependencies: axiosClient, client.types, common.types
 * Export: getClients, getClientById, createClient, updateClient, deleteClient
 */
import type { Client, ClientFormValues, ClientListParams } from '../types/client.types';
import type { PaginatedResponse } from '../types/common.types';

let SEED_CLIENTS: Client[] = [
  {
    id: '1',
    clientCode: 'CLT-0001',
    companyName: 'Aravind Textiles Pvt Ltd',
    contactPerson: 'Aravind Kumar',
    phone: '+91 98765 43210',
    email: 'aravind@aravindtextiles.com',
    gstNumber: '33AAACA1234B1Z5',
    address: 'Plot 12, SIDCO Industrial Estate, Coimbatore, TN 641021',
    status: 'Active',
    createdAt: '2025-01-14',
    activeProjects: 2,
    totalRevenue: 425000,
  },
  {
    id: '2',
    clientCode: 'CLT-0002',
    companyName: 'Nithya Health Solutions',
    contactPerson: 'Nithya Sri',
    phone: '+91 90000 11122',
    email: 'nithya@nithyahealth.in',
    gstNumber: '33AAACN5678C1Z2',
    address: '4th Floor, Anna Nagar, Chennai, TN 600040',
    status: 'Active',
    createdAt: '2025-02-02',
    activeProjects: 1,
    totalRevenue: 180000,
  },
  {
    id: '3',
    clientCode: 'CLT-0003',
    companyName: 'Prime Logistics Corp',
    contactPerson: 'Suresh Babu',
    phone: '+91 87654 32109',
    email: 'suresh@primelogistics.com',
    gstNumber: '33AAACP9012D1Z8',
    address: 'No. 8, GST Road, Trichy, TN 620001',
    status: 'Inactive',
    createdAt: '2024-11-20',
    activeProjects: 0,
    totalRevenue: 96000,
  },
  {
    id: '4',
    clientCode: 'CLT-0004',
    companyName: 'BlueWave Retail',
    contactPerson: 'Divya R',
    phone: '+91 91234 56789',
    email: 'divya@bluewaveretail.com',
    gstNumber: '33AAACB3456E1Z1',
    address: 'Tower B, Tidel Park, Chennai, TN 600113',
    status: 'Active',
    createdAt: '2025-04-09',
    activeProjects: 3,
    totalRevenue: 640500,
  },
  {
    id: '5',
    clientCode: 'CLT-0005',
    companyName: 'Karthik Constructions',
    contactPerson: 'Karthik Raja',
    phone: '+91 99887 76655',
    email: 'karthik@karthikconstructions.com',
    gstNumber: '33AAACK7890F1Z4',
    address: 'Sathy Road, Erode, TN 638001',
    status: 'Active',
    createdAt: '2025-05-30',
    activeProjects: 1,
    totalRevenue: 210000,
  },
];

let nextId = SEED_CLIENTS.length + 1;

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function nextClientCode(): string {
  return `CLT-${String(nextId).padStart(4, '0')}`;
}

export async function getClients(params: ClientListParams): Promise<PaginatedResponse<Client>> {
  // TODO: replace with `const { data } = await axiosClient.get<PaginatedResponse<Client>>('/clients', { params }); return data;`
  let rows = [...SEED_CLIENTS];

  if (params.search) {
    const q = params.search.toLowerCase();
    rows = rows.filter(
      (c) =>
        c.companyName.toLowerCase().includes(q) ||
        c.contactPerson.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.clientCode.toLowerCase().includes(q) ||
        c.gstNumber.toLowerCase().includes(q)
    );
  }

  if (params.status) {
    rows = rows.filter((c) => c.status === params.status);
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

export async function getClientById(id: string): Promise<Client | undefined> {
  // TODO: replace with `const { data } = await axiosClient.get<Client>(`/clients/${id}`); return data;`
  return delay(SEED_CLIENTS.find((c) => c.id === id));
}

export async function getAllClients(): Promise<Client[]> {
  // TODO: replace with `const { data } = await axiosClient.get<Client[]>('/clients/all'); return data;`
  // Lightweight, unpaginated list used to populate Client pickers (e.g. Projects create/edit form)
  return delay([...SEED_CLIENTS]);
}

export async function createClient(values: ClientFormValues): Promise<Client> {
  // TODO: replace with `const { data } = await axiosClient.post<Client>('/clients', values); return data;`
  const client: Client = {
    id: String(nextId),
    clientCode: nextClientCode(),
    ...values,
    createdAt: new Date().toISOString().slice(0, 10),
    activeProjects: 0,
    totalRevenue: 0,
  };
  nextId += 1;
  SEED_CLIENTS = [client, ...SEED_CLIENTS];
  return delay(client);
}

export async function updateClient(id: string, values: ClientFormValues): Promise<Client> {
  // TODO: replace with `const { data } = await axiosClient.put<Client>(`/clients/${id}`, values); return data;`
  SEED_CLIENTS = SEED_CLIENTS.map((c) => (c.id === id ? { ...c, ...values } : c));
  const updated = SEED_CLIENTS.find((c) => c.id === id)!;
  return delay(updated);
}

export async function deleteClient(id: string): Promise<void> {
  // TODO: replace with `await axiosClient.delete(`/clients/${id}`);`
  SEED_CLIENTS = SEED_CLIENTS.filter((c) => c.id !== id);
  return delay(undefined);
}
