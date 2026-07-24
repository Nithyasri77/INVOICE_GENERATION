/**
 * Purpose: Data access layer for the Receipt Vouchers module
 * Responsibilities: Expose getReceiptVouchers/getReceiptVoucherById/createReceiptVoucher/
 *                    updateReceiptVoucher/deleteReceiptVoucher as the only way
 *                    features/receipt-vouchers reads or writes this data
 * NOTE: No Receipt Vouchers API endpoint exists yet. Each function is wired to call axiosClient
 *       (see the commented real call) but currently operates on an in-memory seed array so the UI
 *       is reviewable end-to-end. The seed rows are copied directly from the Statement of Account
 *       module's Receipt ledger rows so the modules stay perfectly consistent.
 * Dependencies: axiosClient, receiptVoucher.types, common.types, clientService, projectService
 *               (to denormalize clientName/projectName)
 * Export: getReceiptVouchers, getReceiptVoucherById, createReceiptVoucher, updateReceiptVoucher,
 *          deleteReceiptVoucher
 */
import type { ReceiptVoucher, ReceiptVoucherFormValues, ReceiptVoucherListParams } from '../types/receiptVoucher.types';
import type { PaginatedResponse } from '../types/common.types';
import { getClientById } from './clientService';
import { getProjectById } from './projectService';

let SEED_RECEIPT_VOUCHERS: ReceiptVoucher[] = [
  {
    id: '1',
    receiptNo: 'REC-2025-1001',
    clientId: '1',
    clientName: 'Aravind Textiles Pvt Ltd',
    projectId: '1',
    projectName: 'ERP Revamp — Phase 1',
    invoiceRef: 'INV-2025-1001',
    date: '2025-02-10',
    amount: 170000,
    paymentMode: 'Bank Transfer',
    referenceNo: 'UTR-20250210001',
    status: 'Reconciled',
    notes: 'Advance payment received against kickoff invoice',
  },
  {
    id: '2',
    receiptNo: 'REC-2025-1002',
    clientId: '1',
    clientName: 'Aravind Textiles Pvt Ltd',
    projectId: '1',
    projectName: 'ERP Revamp — Phase 1',
    invoiceRef: 'INV-2025-1002',
    date: '2025-05-28',
    amount: 255000,
    paymentMode: 'Bank Transfer',
    referenceNo: 'UTR-20250528001',
    status: 'Reconciled',
    notes: 'Development milestone receipt',
  },
  {
    id: '3',
    receiptNo: 'REC-2025-2001',
    clientId: '2',
    clientName: 'Nithya Health Solutions',
    projectId: '2',
    projectName: 'Patient Portal Redesign',
    invoiceRef: 'INV-2025-2001',
    date: '2025-03-20',
    amount: 108000,
    paymentMode: 'Cheque',
    referenceNo: 'CHQ-10452',
    status: 'Reconciled',
    notes: 'Advance payment received by cheque',
  },
  {
    id: '4',
    receiptNo: 'REC-2025-2002',
    clientId: '2',
    clientName: 'Nithya Health Solutions',
    projectId: '2',
    projectName: 'Patient Portal Redesign',
    invoiceRef: 'INV-2025-2002',
    date: '2025-04-30',
    amount: 72000,
    paymentMode: 'UPI',
    referenceNo: 'UPI-TRX-77891',
    status: 'Reconciled',
    notes: 'UI design sign-off receipt',
  },
  {
    id: '5',
    receiptNo: 'REC-2024-3001',
    clientId: '3',
    clientName: 'Prime Logistics Corp',
    projectId: '3',
    projectName: 'Fleet Tracking Dashboard',
    invoiceRef: 'INV-2024-3001',
    date: '2024-10-15',
    amount: 96000,
    paymentMode: 'Bank Transfer',
    referenceNo: 'UTR-20241015001',
    status: 'Reconciled',
    notes: 'Advance receipt for project kickoff',
  },
  {
    id: '6',
    receiptNo: 'REC-2025-4001',
    clientId: '4',
    clientName: 'BlueWave Retail',
    projectId: '4',
    projectName: 'E-commerce Storefront',
    invoiceRef: 'INV-2025-4001',
    date: '2025-01-25',
    amount: 196000,
    paymentMode: 'Bank Transfer',
    referenceNo: 'UTR-20250125001',
    status: 'Reconciled',
    notes: 'Project kickoff advance receipt',
  },
  {
    id: '7',
    receiptNo: 'REC-2025-4002',
    clientId: '4',
    clientName: 'BlueWave Retail',
    projectId: '4',
    projectName: 'E-commerce Storefront',
    invoiceRef: 'INV-2025-4002',
    date: '2025-04-02',
    amount: 294000,
    paymentMode: 'Card',
    referenceNo: 'CARD-TRX-221094',
    status: 'Reconciled',
    notes: 'Checkout module receipt',
  },
  {
    id: '8',
    receiptNo: 'REC-2025-4003',
    clientId: '4',
    clientName: 'BlueWave Retail',
    projectId: '4',
    projectName: 'E-commerce Storefront',
    invoiceRef: 'INV-2025-4003',
    date: '2025-06-15',
    amount: 150500,
    paymentMode: 'Bank Transfer',
    referenceNo: 'UTR-20250615001',
    status: 'Reconciled',
    notes: 'Final receipt for go live invoice',
  },
  {
    id: '9',
    receiptNo: 'REC-2025-5001',
    clientId: '5',
    clientName: 'Karthik Constructions',
    projectId: '5',
    projectName: 'Site Billing & Inventory Tool',
    invoiceRef: 'INV-2025-5001',
    date: '2025-06-10',
    amount: 210000,
    paymentMode: 'Cheque',
    referenceNo: 'CHQ-22170',
    status: 'Reconciled',
    notes: 'Advance receipt recorded for project kickoff',
  },
];

let nextId = SEED_RECEIPT_VOUCHERS.length + 1;

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function nextReceiptNo(): string {
  const year = new Date().getFullYear();
  return `REC-${year}-${String(nextId).padStart(4, '0')}`;
}

export async function getReceiptVouchers(params: ReceiptVoucherListParams): Promise<PaginatedResponse<ReceiptVoucher>> {
  // TODO: replace with `const { data } = await axiosClient.get<PaginatedResponse<ReceiptVoucher>>('/billing/receipt-vouchers', { params }); return data;`
  let rows = [...SEED_RECEIPT_VOUCHERS];

  if (params.search) {
    const q = params.search.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.receiptNo.toLowerCase().includes(q) ||
        r.clientName.toLowerCase().includes(q) ||
        (r.projectName ?? '').toLowerCase().includes(q) ||
        r.invoiceRef.toLowerCase().includes(q) ||
        r.referenceNo.toLowerCase().includes(q)
    );
  }

  if (params.status) {
    rows = rows.filter((r) => r.status === params.status);
  }

  if (params.clientId) {
    rows = rows.filter((r) => r.clientId === params.clientId);
  }

  if (params.paymentMode) {
    rows = rows.filter((r) => r.paymentMode === params.paymentMode);
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

export async function getReceiptVoucherById(id: string): Promise<ReceiptVoucher | undefined> {
  // TODO: replace with `const { data } = await axiosClient.get<ReceiptVoucher>(`/billing/receipt-vouchers/${id}`); return data;`
  return delay(SEED_RECEIPT_VOUCHERS.find((r) => r.id === id));
}

export async function createReceiptVoucher(values: ReceiptVoucherFormValues): Promise<ReceiptVoucher> {
  // TODO: replace with `const { data } = await axiosClient.post<ReceiptVoucher>('/billing/receipt-vouchers', values); return data;`
  const client = await getClientById(values.clientId);
  const project = values.projectId ? await getProjectById(values.projectId) : undefined;
  const receiptVoucher: ReceiptVoucher = {
    id: String(nextId),
    receiptNo: nextReceiptNo(),
    ...values,
    clientName: client?.companyName ?? 'Unknown Client',
    projectName: project?.projectName,
  };
  nextId += 1;
  SEED_RECEIPT_VOUCHERS = [receiptVoucher, ...SEED_RECEIPT_VOUCHERS];
  return delay(receiptVoucher);
}

export async function updateReceiptVoucher(id: string, values: ReceiptVoucherFormValues): Promise<ReceiptVoucher> {
  // TODO: replace with `const { data } = await axiosClient.put<ReceiptVoucher>(`/billing/receipt-vouchers/${id}`, values); return data;`
  const client = await getClientById(values.clientId);
  const project = values.projectId ? await getProjectById(values.projectId) : undefined;
  SEED_RECEIPT_VOUCHERS = SEED_RECEIPT_VOUCHERS.map((r) =>
    r.id === id
      ? {
          ...r,
          ...values,
          clientName: client?.companyName ?? r.clientName,
          projectName: project?.projectName,
        }
      : r
  );
  const updated = SEED_RECEIPT_VOUCHERS.find((r) => r.id === id)!;
  return delay(updated);
}

export async function deleteReceiptVoucher(id: string): Promise<void> {
  // TODO: replace with `await axiosClient.delete(`/billing/receipt-vouchers/${id}`);`
  SEED_RECEIPT_VOUCHERS = SEED_RECEIPT_VOUCHERS.filter((r) => r.id !== id);
  return delay(undefined);
}
