import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getWorkOrders, getAllFilteredWorkOrders, getWorkOrderById, createWorkOrder, updateWorkOrder, deleteWorkOrder } from '../../../services/workOrderService';
import { getProjects } from '../../../services/projectService';
import { getQuotations } from '../../../services/quotationService';
import type { WorkOrderFormValues, WorkOrderListParams } from '../../../types/workOrder.types';

const WORK_ORDERS_KEY = 'work-orders';

export function useWorkOrders(params: WorkOrderListParams) {
  return useQuery({
    queryKey: [WORK_ORDERS_KEY, params],
    queryFn: () => getWorkOrders(params),
    placeholderData: (prev) => prev,
  });
}

export function useWorkOrder(id: string | undefined) {
  return useQuery({
    queryKey: [WORK_ORDERS_KEY, 'detail', id],
    queryFn: () => getWorkOrderById(id as string),
    enabled: !!id,
  });
}

export function useCreateWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: WorkOrderFormValues) => createWorkOrder(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WORK_ORDERS_KEY] });
    },
  });
}

export function useUpdateWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: WorkOrderFormValues }) => updateWorkOrder(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WORK_ORDERS_KEY] });
    },
  });
}

export function useDeleteWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteWorkOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WORK_ORDERS_KEY] });
    },
  });
}

export function useExportWorkOrders() {
  return useMutation({
    mutationFn: (params: Omit<WorkOrderListParams, 'page' | 'pageSize'>) => getAllFilteredWorkOrders(params),
  });
}

export function useProjectOptionsByClient(clientId: string | undefined) {
  return useQuery({
    queryKey: ['projects', 'options', clientId],
    queryFn: () => getProjects({ page: 1, pageSize: 100, clientId }),
    enabled: !!clientId,
    select: (result) => result.data.map((project) => ({ value: project.id, label: `${project.projectName} (${project.projectCode})` })),
  });
}

export function useQuotationOptionsByClient(clientId: string | undefined) {
  return useQuery({
    queryKey: ['quotations', 'options', clientId],
    queryFn: () => getQuotations({ page: 1, pageSize: 100, clientId }),
    enabled: !!clientId,
    select: (result) => result.data.map((quotation) => ({ value: quotation.id, label: `${quotation.quotationNo} — ${quotation.status}` })),
  });
}
