/**
 * Purpose: Data access layer for the Invoices module
 * Responsibilities: Expose getInvoices/getInvoiceById/createInvoice/updateInvoice/deleteInvoice
 *                    as the only way features/invoices reads or writes this data
 * NOTE: No Invoices API endpoint exists yet. Each function is wired to call axiosClient (see the
 *       commented real call) but currently operates on an in-memory seed array so the UI is
 *       reviewable end-to-end. Swap the TODO block for the real call once the backend is live.
 * Dependencies: axiosClient, invoice.types, common.types, projectService (to denormalize
 *               projectName/clientName)
 * Export: getInvoices, getInvoiceById, createInvoice, updateInvoice, deleteInvoice
 */
import type { Invoice, InvoiceFormValues, InvoiceListParams } from '../types/invoice.types';
import type { PaginatedResponse } from '../types/common.types';
import { getProjectById } from './projectService';

let SEED_INVOICES: Invoice[] = [
  {
    id: '1',
    invoiceNo: 'INV-2025-001',
    projectId: '1',
    projectName: 'ERP Revamp — Phase 1',
    clientName: 'Aravind Textiles Pvt Ltd',
    serviceCategory: 'ERP Implementation',
    billingType: 'Milestone-Based',
    billingStage: 'Advance',
    quotationNo: 'QT-2025-011',
    invoiceDate: '2025-02-05',
    dueDate: '2025-02-15',
    items: [
      { id: 'itm_1_1', description: 'ERP Advance Milestone Services', hsnSac: '998314', qty: 1, rate: 170000, amount: 170000 },
    ],
    amount: 170000,
    cgst: 15300,
    sgst: 15300,
    gst: 30600,
    notes: 'Thank you for your business.',
    status: 'Paid',
  },
  {
    id: '2',
    invoiceNo: 'INV-2025-002',
    projectId: '1',
    projectName: 'ERP Revamp — Phase 1',
    clientName: 'Aravind Textiles Pvt Ltd',
    serviceCategory: 'ERP Implementation',
    billingType: 'Milestone-Based',
    billingStage: 'Development',
    quotationNo: 'QT-2025-011',
    invoiceDate: '2025-05-16',
    dueDate: '2025-05-26',
    items: [
      { id: 'itm_2_1', description: 'ERP Development Milestone Services', hsnSac: '998314', qty: 1, rate: 340000, amount: 340000 },
    ],
    amount: 340000,
    cgst: 30600,
    sgst: 30600,
    gst: 61200,
    notes: 'Thank you for your business.',
    status: 'Paid',
  },
  {
    id: '3',
    invoiceNo: 'INV-2025-003',
    projectId: '2',
    projectName: 'Patient Portal Redesign',
    clientName: 'Nithya Health Solutions',
    serviceCategory: 'Web Development',
    billingType: 'Milestone-Based',
    billingStage: 'UI Design Sign-off',
    quotationNo: 'QT-2025-018',
    invoiceDate: '2025-04-21',
    dueDate: '2025-05-01',
    items: [
      { id: 'itm_3_1', description: 'UI Design Sign-off Services', hsnSac: '998314', qty: 1, rate: 72000, amount: 72000 },
    ],
    amount: 72000,
    cgst: 6480,
    sgst: 6480,
    gst: 12960,
    notes: 'Thank you for your business.',
    status: 'Part Paid',
  },
  {
    id: '4',
    invoiceNo: 'INV-2025-004',
    projectId: '4',
    projectName: 'E-commerce Storefront',
    clientName: 'BlueWave Retail',
    serviceCategory: 'Web Development',
    billingType: 'Milestone-Based',
    billingStage: 'Checkout Module',
    quotationNo: 'QT-2025-024',
    invoiceDate: '2025-03-26',
    dueDate: '2025-04-05',
    items: [
      { id: 'itm_4_1', description: 'Checkout Module Development', hsnSac: '998314', qty: 1, rate: 294000, amount: 294000 },
    ],
    amount: 294000,
    cgst: 26460,
    sgst: 26460,
    gst: 52920,
    notes: 'Thank you for your business.',
    status: 'Paid',
  },
  {
    id: '5',
    invoiceNo: 'INV-2025-005',
    projectId: '3',
    projectName: 'Fleet Tracking Dashboard',
    clientName: 'Prime Logistics Corp',
    serviceCategory: 'Consulting',
    billingType: 'Time & Material',
    billingStage: 'Support Retainer — June',
    quotationNo: 'QT-2025-009',
    invoiceDate: '2025-06-01',
    dueDate: '2025-06-11',
    items: [
      { id: 'itm_5_1', description: 'Support Retainer — June', hsnSac: '998313', qty: 1, rate: 45000, amount: 45000 },
    ],
    amount: 45000,
    cgst: 4050,
    sgst: 4050,
    gst: 8100,
    notes: 'Thank you for your business.',
    status: 'Overdue',
  },
  {
    id: '6',
    invoiceNo: 'INV-2025-006',
    projectId: '5',
    projectName: 'Site Billing & Inventory Tool',
    clientName: 'Karthik Constructions',
    serviceCategory: 'Software Development',
    billingType: 'One-Time',
    billingStage: 'Requirement Sign-off',
    quotationNo: 'QT-2025-031',
    invoiceDate: '2025-07-01',
    dueDate: '2025-07-11',
    items: [
      { id: 'itm_6_1', description: 'Requirement Sign-off Services', hsnSac: '998314', qty: 1, rate: 60000, amount: 60000 },
    ],
    amount: 60000,
    cgst: 5400,
    sgst: 5400,
    gst: 10800,
    notes: 'Thank you for your business.',
    status: 'Sent',
  },
];

let nextId = SEED_INVOICES.length + 1;

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function nextInvoiceNo(): string {
  const year = new Date().getFullYear();
  return `INV-${year}-${String(nextId).padStart(3, '0')}`;
}

export async function getInvoices(params: InvoiceListParams): Promise<PaginatedResponse<Invoice>> {
  // TODO: replace with `const { data } = await axiosClient.get<PaginatedResponse<Invoice>>('/invoices', { params }); return data;`
  let rows = [...SEED_INVOICES];

  if (params.search) {
    const q = params.search.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.invoiceNo.toLowerCase().includes(q) ||
        r.projectName.toLowerCase().includes(q) ||
        r.clientName.toLowerCase().includes(q) ||
        r.serviceCategory.toLowerCase().includes(q) ||
        r.billingStage.toLowerCase().includes(q)
    );
  }

  if (params.status) {
    rows = rows.filter((r) => r.status === params.status);
  }

  if (params.projectId) {
    rows = rows.filter((r) => r.projectId === params.projectId);
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

export async function getInvoiceById(id: string): Promise<Invoice | undefined> {
  // TODO: replace with `const { data } = await axiosClient.get<Invoice>(`/invoices/${id}`); return data;`
  return delay(SEED_INVOICES.find((r) => r.id === id));
}

export async function getAllInvoices(): Promise<Invoice[]> {
  // TODO: replace with `const { data } = await axiosClient.get<Invoice[]>('/invoices/all'); return data;`
  // Lightweight, unpaginated list used to populate Invoice pickers (e.g. Payments create/edit form)
  return delay([...SEED_INVOICES]);
}

export async function createInvoice(values: InvoiceFormValues): Promise<Invoice> {
  // TODO: replace with `const { data } = await axiosClient.post<Invoice>('/invoices', values); return data;`
  const project = await getProjectById(values.projectId);
  const invoice: Invoice = {
    id: String(nextId),
    invoiceNo: nextInvoiceNo(),
    ...values,
    projectName: project?.projectName ?? 'Unknown Project',
    clientName: project?.clientName ?? 'Unknown Client',
  };
  nextId += 1;
  SEED_INVOICES = [invoice, ...SEED_INVOICES];
  return delay(invoice);
}

export async function updateInvoice(id: string, values: InvoiceFormValues): Promise<Invoice> {
  // TODO: replace with `const { data } = await axiosClient.put<Invoice>(`/invoices/${id}`, values); return data;`
  const project = await getProjectById(values.projectId);
  SEED_INVOICES = SEED_INVOICES.map((r) =>
    r.id === id
      ? {
          ...r,
          ...values,
          projectName: project?.projectName ?? r.projectName,
          clientName: project?.clientName ?? r.clientName,
        }
      : r
  );
  const updated = SEED_INVOICES.find((r) => r.id === id)!;
  return delay(updated);
}

export async function deleteInvoice(id: string): Promise<void> {
  // TODO: replace with `await axiosClient.delete(`/invoices/${id}`);`
  SEED_INVOICES = SEED_INVOICES.filter((r) => r.id !== id);
  return delay(undefined);
}
