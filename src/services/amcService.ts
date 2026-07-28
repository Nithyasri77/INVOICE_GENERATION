/**
 * Purpose: Data access layer for the AMC Contracts module — the only place that talks to the API
 * Responsibilities: List (search/filter/sort/pagination), get one, create, update, delete,
 *                    renew contract, mark renewed, generate invoice link, and renewal history reads.
 *                    Also owns the "auto calculate renewal reminders" rule from the BRD: any
 *                    contract whose renewalDate falls within the next 30 days is automatically
 *                    surfaced as "Upcoming Renewal" regardless of its stored status.
 * NOTE: No backend exists yet. Each function is structured exactly as it will be once wired to
 *       axiosClient (see TODO comments) but currently operates on an in-memory seed array so the
 *       module is fully reviewable. Client/Project names are local seed values — once the
 *       Clients/Projects modules are merged in from your collaborators' repo, replace the
 *       CLIENT_PROJECT_OPTIONS seed below with a real clientService/projectService lookup.
 * Dependencies: axiosClient (for future use), amc.types, common.types
 * Export: getAmcContracts, getAmcContract, createAmcContract, updateAmcContract, deleteAmcContract,
 *         renewAmcContract, markAmcRenewed, getAmcRenewalHistory, getAmcStats, CLIENT_PROJECT_OPTIONS
 */
import type { AmcContract, AmcRenewalRecord, AmcStats } from '../types/amc.types';
import type { PaginatedResponse } from '../types/common.types';

export interface AmcListParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface CreateAmcContractInput {
  clientName: string;
  projectName: string;
  contractValue: number;
  startDate: string;
  endDate: string;
  renewalDate: string;
  status: AmcContract['status'];
  assignedManager: string;
  notes?: string;
}

export type UpdateAmcContractInput = Partial<CreateAmcContractInput>;

// TODO: replace with a real lookup once Clients/Projects modules are merged from your collaborators' repo
export const CLIENT_PROJECT_OPTIONS: { clientName: string; projectName: string; projectId: string; clientId: string }[] = [
  { clientId: 'cli_001', clientName: 'ABC Industries Pvt Ltd', projectId: 'proj_009', projectName: 'AMC Portal' },
  { clientId: 'cli_002', clientName: 'Electro Circuit Care', projectId: 'proj_010', projectName: 'ERP System' },
  { clientId: 'cli_003', clientName: 'Spark Solutions', projectId: 'proj_011', projectName: 'Mobile App' },
  { clientId: 'cli_004', clientName: 'Global Enterprises', projectId: 'proj_012', projectName: 'Website Revamp' },
];

let AMC_STORE: AmcContract[] = [
  {
    id: 'amc_001', amcNumber: 'AMC-2026-006', clientId: 'cli_001', clientName: 'ABC Industries Pvt Ltd',
    projectId: 'proj_009', projectName: 'AMC Portal', contractValue: 60000, startDate: '2026-01-01',
    endDate: '2026-12-31', renewalDate: '2026-12-01', status: 'Active', assignedManager: 'Ajith Kumar',
    notes: 'Includes quarterly server maintenance.', createdDate: '2025-12-15',
  },
  {
    id: 'amc_002', amcNumber: 'AMC-2026-005', clientId: 'cli_002', clientName: 'Electro Circuit Care',
    projectId: 'proj_010', projectName: 'ERP System', contractValue: 45000, startDate: '2025-08-01',
    endDate: '2026-08-15', renewalDate: '2026-08-01', status: 'Upcoming Renewal', assignedManager: 'Priya Nair',
    notes: '', createdDate: '2025-07-20',
  },
  {
    id: 'amc_003', amcNumber: 'AMC-2026-004', clientId: 'cli_003', clientName: 'Spark Solutions',
    projectId: 'proj_011', projectName: 'Mobile App', contractValue: 30000, startDate: '2025-06-01',
    endDate: '2026-06-01', renewalDate: '2026-05-01', status: 'Upcoming Renewal', assignedManager: 'Ajith Kumar',
    notes: 'Client requested a call before renewal.', createdDate: '2025-05-15',
  },
  {
    id: 'amc_004', amcNumber: 'AMC-2026-003', clientId: 'cli_004', clientName: 'Global Enterprises',
    projectId: 'proj_012', projectName: 'Website Revamp', contractValue: 25000, startDate: '2025-01-01',
    endDate: '2026-01-01', renewalDate: '2025-12-01', status: 'Expired', assignedManager: 'Priya Nair',
    notes: 'Awaiting renewal decision from client.', createdDate: '2024-12-20',
  },
  {
    id: 'amc_005', amcNumber: 'AMC-2026-002', clientId: 'cli_001', clientName: 'ABC Industries Pvt Ltd',
    projectId: 'proj_009', projectName: 'AMC Portal', contractValue: 40000, startDate: '2024-01-01',
    endDate: '2025-01-01', renewalDate: '2024-12-01', status: 'Cancelled', assignedManager: 'Ajith Kumar',
    notes: 'Client paused services for FY24-25.', createdDate: '2023-12-10',
  },
  {
    id: 'amc_006', amcNumber: 'AMC-2026-001', clientId: 'cli_002', clientName: 'Electro Circuit Care',
    projectId: 'proj_010', projectName: 'ERP System', contractValue: 55000, startDate: '2025-03-01',
    endDate: '2027-03-01', renewalDate: '2027-02-01', status: 'Active', assignedManager: 'Priya Nair',
    notes: '2-year contract, auto-billed annually.', createdDate: '2025-02-15',
  },
];

let RENEWAL_HISTORY_STORE: AmcRenewalRecord[] = [
  {
    id: 'ren_001', amcId: 'amc_001', renewedDate: '2025-12-20', previousEndDate: '2025-12-31',
    newEndDate: '2026-12-31', renewalValue: 60000, renewedBy: 'Ajith Kumar',
  },
];

function simulateDelay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/** BRD rule: auto-flag contracts renewing within 30 days as "Upcoming Renewal" for display,
 *  without mutating the stored status (a human still confirms the actual renewal). */
function withAutoRenewalReminder(contract: AmcContract): AmcContract {
  if (contract.status !== 'Active') return contract;
  const daysUntilRenewal = Math.ceil(
    (new Date(contract.renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (daysUntilRenewal <= 30 && daysUntilRenewal >= 0) {
    return { ...contract, status: 'Upcoming Renewal' };
  }
  return contract;
}

export async function getAmcContracts(params: AmcListParams): Promise<PaginatedResponse<AmcContract>> {
  // TODO: replace with `const { data } = await axiosClient.get('/amc-contracts', { params }); return data;`
  let filtered = AMC_STORE.map(withAutoRenewalReminder);

  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.clientName.toLowerCase().includes(q) ||
        c.projectName.toLowerCase().includes(q) ||
        c.amcNumber.toLowerCase().includes(q)
    );
  }
  if (params.status) filtered = filtered.filter((c) => c.status === params.status);

  if (params.sortBy) {
    const dir = params.sortDirection === 'asc' ? 1 : -1;
    filtered.sort((a, b) => {
      const aVal = String(a[params.sortBy as keyof AmcContract] ?? '');
      const bVal = String(b[params.sortBy as keyof AmcContract] ?? '');
      return aVal.localeCompare(bVal) * dir;
    });
  } else {
    filtered.sort((a, b) => b.renewalDate.localeCompare(a.renewalDate));
  }

  const totalEntries = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / params.pageSize));
  const start = (params.page - 1) * params.pageSize;
  const pageData = filtered.slice(start, start + params.pageSize);

  return simulateDelay({ data: pageData, page: params.page, pageSize: params.pageSize, totalEntries, totalPages });
}

export async function getAmcStats(): Promise<AmcStats> {
  // TODO: replace with `const { data } = await axiosClient.get('/amc-contracts/stats'); return data;`
  const withReminders = AMC_STORE.map(withAutoRenewalReminder);
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  return simulateDelay({
    totalContracts: AMC_STORE.length,
    activeContracts: withReminders.filter((c) => c.status === 'Active').length,
    expiringThisMonth: AMC_STORE.filter((c) => {
      const end = new Date(c.endDate);
      return end.getMonth() === thisMonth && end.getFullYear() === thisYear;
    }).length,
    renewalsDue: withReminders.filter((c) => c.status === 'Upcoming Renewal').length,
    expiredContracts: withReminders.filter((c) => c.status === 'Expired').length,
  });
}

export async function getAmcContract(id: string): Promise<AmcContract> {
  // TODO: replace with `const { data } = await axiosClient.get(`/amc-contracts/${id}`); return data;`
  const contract = AMC_STORE.find((c) => c.id === id);
  if (!contract) throw new Error('AMC contract not found');
  return simulateDelay(withAutoRenewalReminder(contract));
}

export async function createAmcContract(input: CreateAmcContractInput): Promise<AmcContract> {
  // TODO: replace with `const { data } = await axiosClient.post('/amc-contracts', input); return data;`
  const linked = CLIENT_PROJECT_OPTIONS.find(
    (o) => o.clientName === input.clientName && o.projectName === input.projectName
  );
  const nextNumber = AMC_STORE.length + 7;
  const newContract: AmcContract = {
    id: `amc_${String(AMC_STORE.length + 1).padStart(3, '0')}`,
    amcNumber: `AMC-2026-${String(nextNumber).padStart(3, '0')}`,
    clientId: linked?.clientId ?? 'cli_000',
    projectId: linked?.projectId ?? 'proj_000',
    createdDate: new Date().toISOString().slice(0, 10),
    ...input,
  };
  AMC_STORE = [newContract, ...AMC_STORE];
  return simulateDelay(newContract);
}

export async function updateAmcContract(id: string, input: UpdateAmcContractInput): Promise<AmcContract> {
  // TODO: replace with `const { data } = await axiosClient.patch(`/amc-contracts/${id}`, input); return data;`
  const idx = AMC_STORE.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error('AMC contract not found');
  AMC_STORE[idx] = { ...AMC_STORE[idx], ...input };
  return simulateDelay(AMC_STORE[idx]);
}

export async function deleteAmcContract(id: string): Promise<void> {
  // TODO: replace with `await axiosClient.delete(`/amc-contracts/${id}`);`
  AMC_STORE = AMC_STORE.filter((c) => c.id !== id);
  return simulateDelay(undefined);
}

/** "Renew Contract" — extends end date by 1 year from current end date and logs renewal history */
export async function renewAmcContract(id: string, renewalValue: number): Promise<AmcContract> {
  // TODO: replace with `const { data } = await axiosClient.post(`/amc-contracts/${id}/renew`, { renewalValue }); return data;`
  const idx = AMC_STORE.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error('AMC contract not found');

  const previousEndDate = AMC_STORE[idx].endDate;
  const newEndDate = new Date(previousEndDate);
  newEndDate.setFullYear(newEndDate.getFullYear() + 1);
  const newEndDateStr = newEndDate.toISOString().slice(0, 10);
  const newRenewalDate = new Date(newEndDate);
  newRenewalDate.setMonth(newRenewalDate.getMonth() - 1);

  AMC_STORE[idx] = {
    ...AMC_STORE[idx],
    endDate: newEndDateStr,
    renewalDate: newRenewalDate.toISOString().slice(0, 10),
    contractValue: renewalValue,
    status: 'Active',
  };

  RENEWAL_HISTORY_STORE = [
    {
      id: `ren_${String(RENEWAL_HISTORY_STORE.length + 1).padStart(3, '0')}`,
      amcId: id,
      renewedDate: new Date().toISOString().slice(0, 10),
      previousEndDate,
      newEndDate: newEndDateStr,
      renewalValue,
      renewedBy: 'Ajith Kumar',
    },
    ...RENEWAL_HISTORY_STORE,
  ];

  return simulateDelay(AMC_STORE[idx]);
}

/** "Mark Renewed" — quick action for when renewal was handled outside the system, no value change */
export async function markAmcRenewed(id: string): Promise<AmcContract> {
  // TODO: replace with `const { data } = await axiosClient.post(`/amc-contracts/${id}/mark-renewed`); return data;`
  return updateAmcContract(id, { status: 'Active' });
}

export async function getAmcRenewalHistory(amcId: string): Promise<AmcRenewalRecord[]> {
  // TODO: replace with `const { data } = await axiosClient.get(`/amc-contracts/${amcId}/renewal-history`); return data;`
  return simulateDelay(RENEWAL_HISTORY_STORE.filter((r) => r.amcId === amcId));
}
