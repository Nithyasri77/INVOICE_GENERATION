import type { PaymentScheduleRow, WorkOrder, WorkOrderFormValues, WorkOrderListParams } from '../types/workOrder.types';
import type { PaginatedResponse } from '../types/common.types';
import { getClientById } from './clientService';
import { getProjectById } from './projectService';
import { getQuotationById } from './quotationService';

let SEED_WORK_ORDERS: WorkOrder[] = [
  {
    id: '1',
    workOrderNo: 'WO-2025-001',
    clientId: '1',
    clientName: 'Aravind Textiles Pvt Ltd',
    quotationId: '1',
    projectId: '1',
    projectName: 'ERP Revamp — Phase 1',
    scopeOfWork: 'Deliver core ERP modules, integration with finance and inventory workflows, and UAT support for phase one.',
    projectValue: 850000,
    startDate: '2025-02-01',
    expectedEndDate: '2025-08-15',
    paymentSchedule: [
      { id: 'a1', description: 'Advance', percentage: 30, amount: 255000, dueDate: '2025-02-15' },
      { id: 'a2', description: 'UAT Sign-off', percentage: 40, amount: 340000, dueDate: '2025-06-20' },
      { id: 'a3', description: 'Go-Live Milestone', percentage: 30, amount: 255000, dueDate: '2025-08-15' },
    ],
    status: 'Active',
    attachmentRef: 'wo-aravind.pdf',
    notes: 'Work order aligned to the accepted quotation and project plan.',
  },
  {
    id: '2',
    workOrderNo: 'WO-2025-002',
    clientId: '2',
    clientName: 'Nithya Health Solutions',
    quotationId: '2',
    projectId: '2',
    projectName: 'Patient Portal Redesign',
    scopeOfWork: 'Redesign the patient portal experience, implement appointment workflows, and support post-release stabilization.',
    projectValue: 360000,
    startDate: '2025-03-10',
    expectedEndDate: '2025-06-30',
    paymentSchedule: [
      { id: 'b1', description: 'Design Milestone', percentage: 25, amount: 90000, dueDate: '2025-03-25' },
      { id: 'b2', description: 'Development Completion', percentage: 45, amount: 162000, dueDate: '2025-05-10' },
      { id: 'b3', description: 'Launch Support', percentage: 30, amount: 108000, dueDate: '2025-06-30' },
    ],
    status: 'Signed',
    attachmentRef: 'wo-nithya.pdf',
    notes: 'Signed after the client reviewed the milestone-driven scope.',
  },
  {
    id: '3',
    workOrderNo: 'WO-2025-003',
    clientId: '3',
    clientName: 'Prime Logistics Corp',
    quotationId: '4',
    projectId: '3',
    projectName: 'Fleet Tracking Dashboard',
    scopeOfWork: 'Create web dashboards for vehicle health, route analytics, and exception reporting for field operations.',
    projectValue: 210000,
    startDate: '2024-10-05',
    expectedEndDate: '2025-01-20',
    paymentSchedule: [
      { id: 'c1', description: 'Kick-off', percentage: 20, amount: 42000, dueDate: '2024-10-15' },
      { id: 'c2', description: 'Analytics Build', percentage: 40, amount: 84000, dueDate: '2024-11-20' },
      { id: 'c3', description: 'Delivery', percentage: 40, amount: 84000, dueDate: '2025-01-20' },
    ],
    status: 'Completed',
    attachmentRef: 'wo-prime.pdf',
    notes: 'Completed despite a temporary suspension; final delivery was closed with a change request.',
  },
  {
    id: '4',
    workOrderNo: 'WO-2025-004',
    clientId: '4',
    clientName: 'BlueWave Retail',
    quotationId: '3',
    projectId: '4',
    projectName: 'E-commerce Storefront',
    scopeOfWork: 'Build storefront experience, checkout flow, order management integration, and live deployment support.',
    projectValue: 980000,
    startDate: '2025-01-15',
    expectedEndDate: '2025-05-30',
    paymentSchedule: [
      { id: 'd1', description: 'Design Freeze', percentage: 20, amount: 196000, dueDate: '2025-01-30' },
      { id: 'd2', description: 'Build Completion', percentage: 50, amount: 490000, dueDate: '2025-03-15' },
      { id: 'd3', description: 'Launch Support', percentage: 30, amount: 294000, dueDate: '2025-05-30' },
    ],
    status: 'Sent',
    attachmentRef: 'wo-bluewave.pdf',
    notes: 'Work order has been shared with the client procurement team.',
  },
  {
    id: '5',
    workOrderNo: 'WO-2025-005',
    clientId: '5',
    clientName: 'Karthik Constructions',
    projectId: '5',
    projectName: 'Site Billing & Inventory Tool',
    scopeOfWork: 'Implement mobile-friendly site billing workflows, inventory reconciliation reports, and dashboard roll-up.',
    projectValue: 420000,
    startDate: '2025-06-01',
    expectedEndDate: '2025-09-15',
    paymentSchedule: [
      { id: 'e1', description: 'Initiation', percentage: 15, amount: 63000, dueDate: '2025-06-10' },
      { id: 'e2', description: 'Beta Release', percentage: 35, amount: 147000, dueDate: '2025-07-20' },
      { id: 'e3', description: 'Go-Live', percentage: 50, amount: 210000, dueDate: '2025-09-15' },
    ],
    status: 'Draft',
    notes: 'Draft work order prepared ahead of the project kickoff.',
  },
];

let nextId = SEED_WORK_ORDERS.length + 1;

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function nextWorkOrderNo(): string {
  const year = new Date().getFullYear();
  return `WO-${year}-${String(nextId).padStart(3, '0')}`;
}

export async function getWorkOrders(params: WorkOrderListParams): Promise<PaginatedResponse<WorkOrder>> {
  // TODO: replace with `const { data } = await axiosClient.get<PaginatedResponse<WorkOrder>>('/agreements/work-orders', { params }); return data;`
  let rows = [...SEED_WORK_ORDERS];

  if (params.search) {
    const q = params.search.toLowerCase();
    rows = rows.filter((row) =>
      row.workOrderNo.toLowerCase().includes(q) || row.clientName.toLowerCase().includes(q) || row.projectName?.toLowerCase().includes(q) || row.scopeOfWork.toLowerCase().includes(q)
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

export async function getWorkOrderById(id: string): Promise<WorkOrder | undefined> {
  // TODO: replace with `const { data } = await axiosClient.get<WorkOrder>(`/agreements/work-orders/${id}`); return data;`
  return delay(SEED_WORK_ORDERS.find((row) => row.id === id));
}

export async function createWorkOrder(values: WorkOrderFormValues): Promise<WorkOrder> {
  // TODO: replace with `const { data } = await axiosClient.post<WorkOrder>('/agreements/work-orders', values); return data;`
  const client = await getClientById(values.clientId);
  if (values.quotationId) {
    await getQuotationById(values.quotationId);
  }
  const project = values.projectId ? await getProjectById(values.projectId) : undefined;
  const workOrder: WorkOrder = {
    id: String(nextId),
    workOrderNo: nextWorkOrderNo(),
    ...values,
    clientName: client?.companyName ?? 'Unknown Client',
    projectName: project?.projectName,
  };
  nextId += 1;
  SEED_WORK_ORDERS = [workOrder, ...SEED_WORK_ORDERS];
  return delay(workOrder);
}

export async function updateWorkOrder(id: string, values: WorkOrderFormValues): Promise<WorkOrder> {
  // TODO: replace with `const { data } = await axiosClient.put<WorkOrder>(`/agreements/work-orders/${id}`, values); return data;`
  const client = await getClientById(values.clientId);
  const project = values.projectId ? await getProjectById(values.projectId) : undefined;
  SEED_WORK_ORDERS = SEED_WORK_ORDERS.map((row) =>
    row.id === id ? { ...row, ...values, clientName: client?.companyName ?? row.clientName, projectName: project?.projectName } : row
  );
  const updated = SEED_WORK_ORDERS.find((row) => row.id === id)!;
  return delay(updated);
}

export async function deleteWorkOrder(id: string): Promise<void> {
  // TODO: replace with `await axiosClient.delete(`/agreements/work-orders/${id}`);`
  SEED_WORK_ORDERS = SEED_WORK_ORDERS.filter((row) => row.id !== id);
  return delay(undefined);
}

export async function getWorkOrderOptionsByClient(_clientId: string | undefined): Promise<PaymentScheduleRow[]> {
  return delay([]);
}
