import { useMemo, useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { Plus, Pencil, Trash2, FileText } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { SearchBar } from '../../components/shared/SearchBar';
import { FilterBar } from '../../components/shared/FilterBar';
import { ActionMenu } from '../../components/shared/ActionMenu';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { ExportButton, type ExportFormat } from '../../components/shared/ExportButton';
import { DataTable } from '../../components/ui/Table';
import { Select } from '../../components/ui/Select';
import { Pagination } from '../../components/ui/Pagination';
import { Button } from '../../components/ui/Button';
import { toast } from '../../components/ui/Toast';
import { formatCurrency, formatCompactCurrency } from '../../utils/formatCurrency';
import { formatDate, formatDateInput } from '../../utils/formatDate';
import { exportCSV } from '../../utils/exportCSV';
import { exportPDF } from '../../utils/exportPDF';
import { useWorkOrders, useExportWorkOrders, useCreateWorkOrder, useUpdateWorkOrder, useDeleteWorkOrder } from '../../features/work-orders/hooks/useWorkOrders';
import { useClientOptions } from '../../features/projects/hooks/useProjects';
import { WorkOrderFormModal } from '../../features/work-orders/components/WorkOrderFormModal';
import type { WorkOrder, WorkOrderFormValues } from '../../types/workOrder.types';
import type { WorkOrderStatus } from '../../types/common.types';

const PAGE_SIZE = 10;

const STATUS_FILTER_OPTIONS = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Sent', label: 'Sent' },
  { value: 'Signed', label: 'Signed' },
  { value: 'Active', label: 'Active' },
  { value: 'Completed', label: 'Completed' },
];

const SOW_EXPORT_COLUMNS = [
  { header: 'Agreement ID', accessor: (w: WorkOrder) => w.workOrderNo },
  { header: 'Agreement Type', accessor: () => 'Work Order (SOW)' },
  { header: 'Agreement Name', accessor: (w: WorkOrder) => w.scopeOfWork || w.notes || 'Statement of Work' },
  { header: 'Client', accessor: (w: WorkOrder) => w.clientName },
  { header: 'Project', accessor: (w: WorkOrder) => w.projectName || 'N/A' },
  { header: 'Status', accessor: (w: WorkOrder) => w.status },
  { header: 'Version', accessor: (w: WorkOrder) => w.version || 'v1.0' },
  { header: 'Effective Date', accessor: (w: WorkOrder) => formatDate(w.startDate) },
  { header: 'Expiry Date', accessor: (w: WorkOrder) => (w.expectedEndDate ? formatDate(w.expectedEndDate) : 'N/A') },
  { header: 'Created By', accessor: (w: WorkOrder) => w.createdBy || 'System Admin' },
  { header: 'Created Date', accessor: (w: WorkOrder) => (w.createdDate ? formatDate(w.createdDate) : formatDate(w.startDate)) },
  { header: 'Last Updated', accessor: (w: WorkOrder) => (w.lastUpdated ? formatDate(w.lastUpdated) : formatDate(w.startDate)) },
  { header: 'Project Value', accessor: (w: WorkOrder) => formatCurrency(w.projectValue) },
];

export default function WorkOrdersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<WorkOrderStatus | undefined>(undefined);
  const [clientId, setClientId] = useState<string | undefined>(undefined);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | undefined>(undefined);

  const clientOptionsQuery = useClientOptions();

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      search: search || undefined,
      status,
      clientId,
      sortBy: sorting[0]?.id,
      sortDirection: (sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : undefined) as 'asc' | 'desc' | undefined,
    }),
    [page, search, status, clientId, sorting]
  );

  const workOrdersQuery = useWorkOrders(queryParams);
  const exportWorkOrdersMutation = useExportWorkOrders();
  const createWorkOrder = useCreateWorkOrder();
  const updateWorkOrder = useUpdateWorkOrder();
  const deleteWorkOrder = useDeleteWorkOrder();

  function openAddModal() {
    setEditingWorkOrder(undefined);
    setFormOpen(true);
  }

  function openEditModal(workOrder: WorkOrder) {
    setEditingWorkOrder(workOrder);
    setFormOpen(true);
  }

  function handleFormSubmit(values: WorkOrderFormValues) {
    if (editingWorkOrder) {
      updateWorkOrder.mutate(
        { id: editingWorkOrder.id, values },
        {
          onSuccess: () => {
            toast.success(`${editingWorkOrder.workOrderNo} updated`);
            setFormOpen(false);
          },
          onError: () => toast.error('Failed to update work order'),
        }
      );
    } else {
      createWorkOrder.mutate(values, {
        onSuccess: () => {
          toast.success('Work order added');
          setFormOpen(false);
        },
        onError: () => toast.error('Failed to add work order'),
      });
    }
  }

  function handleDelete(workOrder: WorkOrder) {
    if (!window.confirm(`Delete work order ${workOrder.workOrderNo}? This cannot be undone.`)) return;
    deleteWorkOrder.mutate(workOrder.id, {
      onSuccess: () => toast.success(`${workOrder.workOrderNo} deleted`),
      onError: () => toast.error('Failed to delete work order'),
    });
  }

  async function handleExport(format: ExportFormat) {
    if (isExporting) return;
    setIsExporting(true);

    try {
      // 1. Fetch full dataset matching search, filters, sorting order
      const allMatching = await exportWorkOrdersMutation.mutateAsync({
        search: search || undefined,
        status,
        clientId,
        sortBy: sorting[0]?.id,
        sortDirection: sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : undefined,
      });

      // 2. Filter by selected rows if active
      let dataToExport = allMatching;
      if (selectedIds.size > 0) {
        dataToExport = allMatching.filter((item) => selectedIds.has(item.id));
      }

      // 3. Handle Empty State
      if (!dataToExport || dataToExport.length === 0) {
        toast.error('No agreements available to export.');
        setIsExporting(false);
        return;
      }

      const todayStr = formatDateInput(new Date());
      const filename = `sow_agreements_${todayStr}`;

      const filterSummary: Record<string, string> = {
        'Agreement Type': 'Work Order (SOW)',
      };
      if (search) filterSummary['Search'] = search;
      if (status) filterSummary['Status'] = status;
      if (clientId) {
        const clientObj = clientOptionsQuery.data?.find((c) => c.value === clientId);
        filterSummary['Client'] = clientObj?.label || clientId;
      }
      if (sorting[0]) {
        filterSummary['Sort'] = `${sorting[0].id} (${sorting[0].desc ? 'descending' : 'ascending'})`;
      }
      if (selectedIds.size > 0) {
        filterSummary['Selection'] = `${selectedIds.size} row(s) selected`;
      }

      // 4. Execute export
      if (format === 'csv') {
        exportCSV({
          filename,
          data: dataToExport,
          columns: SOW_EXPORT_COLUMNS,
        });
      } else if (format === 'pdf') {
        exportPDF({
          filename,
          reportTitle: 'Work Order (SOW) Report',
          data: dataToExport,
          columns: SOW_EXPORT_COLUMNS,
          appliedFilters: filterSummary,
          orientation: 'landscape',
        });
      }

      toast.success('Agreement exported successfully.');
    } catch (err) {
      console.error('Failed to export Work Order agreement:', err);
      toast.error('Failed to export agreement.');
    } finally {
      setIsExporting(false);
    }
  }

  const columns = useMemo<ColumnDef<WorkOrder, any>[]>(() => {
    const currentPageItems = workOrdersQuery.data?.data ?? [];
    const allPageIds = currentPageItems.map((w) => w.id);
    const isAllPageSelected =
      allPageIds.length > 0 && allPageIds.every((id) => selectedIds.has(id));

    return [
      {
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-surface-border text-primary-600 focus:ring-primary-500 cursor-pointer"
            checked={isAllPageSelected}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedIds(new Set([...selectedIds, ...allPageIds]));
              } else {
                const next = new Set(selectedIds);
                allPageIds.forEach((id) => next.delete(id));
                setSelectedIds(next);
              }
            }}
            title="Select all on current page"
          />
        ),
        cell: ({ row }) => {
          const isSelected = selectedIds.has(row.original.id);
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-surface-border text-primary-600 focus:ring-primary-500 cursor-pointer"
                checked={isSelected}
                onChange={(e) => {
                  const next = new Set(selectedIds);
                  if (e.target.checked) {
                    next.add(row.original.id);
                  } else {
                    next.delete(row.original.id);
                  }
                  setSelectedIds(next);
                }}
              />
            </div>
          );
        },
      },
      { accessorKey: 'workOrderNo', header: 'Work Order No' },
      { accessorKey: 'clientName', header: 'Client' },
      {
        accessorKey: 'projectName',
        header: 'Project',
        cell: ({ getValue }) => (getValue() as string | undefined) ?? '—',
      },
      {
        accessorKey: 'projectValue',
        header: 'Project Value',
        cell: ({ getValue }) => formatCompactCurrency(getValue() as number),
      },
      {
        accessorKey: 'startDate',
        header: 'Start Date',
        cell: ({ getValue }) => formatDate(getValue() as string),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div onClick={(e) => e.stopPropagation()}>
            <ActionMenu
              items={[
                { label: 'Edit', icon: <Pencil className="h-4 w-4" />, onClick: () => openEditModal(row.original) },
                { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, destructive: true, separatorBefore: true, onClick: () => handleDelete(row.original) },
              ]}
            />
          </div>
        ),
      },
    ];
  }, [workOrdersQuery.data?.data, selectedIds]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Work Orders / SOW"
        description="Project-specific scope, value, milestones, and payment schedules linked to clients and projects."
        action={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openAddModal}>
            Add Work Order
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <SearchBar placeholder="Search work order no, client, project..." onSearch={(q) => { setSearch(q); setPage(1); }} className="max-w-sm" />
          <FilterBar activeCount={(status ? 1 : 0) + (clientId ? 1 : 0)} onClear={() => { setStatus(undefined); setClientId(undefined); }}>
            <Select label="Status" placeholder="All statuses" options={STATUS_FILTER_OPTIONS} value={status} onValueChange={(v) => { setStatus(v as WorkOrderStatus); setPage(1); }} />
            <Select label="Client" placeholder="All clients" options={clientOptionsQuery.data ?? []} value={clientId} onValueChange={(v) => { setClientId(v); setPage(1); }} />
          </FilterBar>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-md border border-primary-200">
              {selectedIds.size} Selected
            </span>
          )}
          <ExportButton onExport={handleExport} isLoading={isExporting} />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={workOrdersQuery.data?.data ?? []}
        isLoading={workOrdersQuery.isLoading}
        isError={workOrdersQuery.isError}
        onRetry={() => workOrdersQuery.refetch()}
        sorting={sorting}
        onSortingChange={(next) => {
          setSorting(next);
          setPage(1);
        }}
        emptyTitle="No work orders yet"
        emptyDescription="Add your first work order to capture scope, value, and milestone billing."
        emptyAction={
          <Button leftIcon={<FileText className="h-4 w-4" />} onClick={openAddModal}>
            Add Work Order
          </Button>
        }
      />

      {workOrdersQuery.data && workOrdersQuery.data.totalEntries > 0 && (
        <Pagination currentPage={workOrdersQuery.data.page} totalPages={workOrdersQuery.data.totalPages} totalEntries={workOrdersQuery.data.totalEntries} pageSize={workOrdersQuery.data.pageSize} onPageChange={setPage} />
      )}

      <WorkOrderFormModal open={formOpen} onOpenChange={setFormOpen} workOrder={editingWorkOrder} onSubmit={handleFormSubmit} isSubmitting={createWorkOrder.isPending || updateWorkOrder.isPending} />
    </div>
  );
}
