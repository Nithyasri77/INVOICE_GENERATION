import type { WorkOrderStatus } from './common.types';

export interface PaymentScheduleRow {
  id: string;
  description: string;
  percentage?: number;
  amount: number;
  dueDate?: string;
}

export interface WorkOrder {
  id: string;
  workOrderNo: string;
  clientId: string;
  clientName: string;
  quotationId?: string;
  projectId?: string;
  projectName?: string;
  scopeOfWork: string;
  projectValue: number;
  startDate: string;
  expectedEndDate?: string;
  paymentSchedule: PaymentScheduleRow[];
  status: WorkOrderStatus;
  attachmentRef?: string;
  notes: string;
}

export interface WorkOrderFormValues {
  clientId: string;
  quotationId?: string;
  projectId?: string;
  scopeOfWork: string;
  projectValue: number;
  startDate: string;
  expectedEndDate?: string;
  paymentSchedule: PaymentScheduleRow[];
  status: WorkOrderStatus;
  attachmentRef?: string;
  notes: string;
}

export interface WorkOrderListParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: WorkOrderStatus;
  clientId?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}
