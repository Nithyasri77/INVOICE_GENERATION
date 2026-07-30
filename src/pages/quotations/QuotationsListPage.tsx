/**
 * Purpose: Quotations module landing page
 * Responsibilities: Compose PageHeader ("+ Add Quotation"), SearchBar, FilterBar (status/client),
 *                    DataTable (sortable, paginated), row ActionMenu (Edit/Delete),
 *                    QuotationFormModal (add/edit) — this page holds only UI/local state; all
 *                    data access goes through the useQuotations hooks.
 * Dependencies: PageHeader, SearchBar, FilterBar, StatusBadge, ExportButton (shared), DataTable,
 *               Select, Pagination, Button (ui), QuotationFormModal (features), useQuotations
 *               hooks, useClientOptions (Projects feature — shared Client picker)
 * Export: default
 */
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
import {
  useQuotations,
  useExportQuotations,
  useCreateQuotation,
  useUpdateQuotation,
  useDeleteQuotation,
} from '../../features/quotations/hooks/useQuotations';
import { useClientOptions } from '../../features/projects/hooks/useProjects';
import { QuotationFormModal } from '../../features/quotations/components/QuotationFormModal';
import type { Quotation, QuotationFormValues } from '../../types/quotation.types';
import type { QuotationStatus } from '../../types/common.types';

const PAGE_SIZE = 10;

const STATUS_FILTER_OPTIONS = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Sent', label: 'Sent' },
  { value: 'Accepted', label: 'Accepted' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Expired', label: 'Expired' },
];

const QUOTATION_EXPORT_COLUMNS = [
  { header: 'Quote Number', accessor: (q: Quotation) => q.quotationNo },
  { header: 'Client', accessor: (q: Quotation) => q.clientName },
  { header: 'Project', accessor: (q: Quotation) => q.projectName || q.notes || 'N/A' },
  { header: 'Status', accessor: (q: Quotation) => q.status },
  { header: 'Amount', accessor: (q: Quotation) => formatCurrency(q.amount) },
  { header: 'Tax', accessor: (q: Quotation) => formatCurrency(q.tax ?? Math.round(q.amount * 0.18)) },
  { header: 'Discount', accessor: (q: Quotation) => formatCurrency(q.discount ?? 0) },
  { header: 'Subtotal', accessor: (q: Quotation) => formatCurrency(q.subtotal ?? q.amount) },
  { header: 'Total', accessor: (q: Quotation) => formatCurrency(q.total ?? Math.round(q.amount * 1.18)) },
  { header: 'Created Date', accessor: (q: Quotation) => formatDate(q.quotationDate) },
  { header: 'Valid Until', accessor: (q: Quotation) => formatDate(q.validUntil) },
  { header: 'Created By', accessor: (q: Quotation) => q.createdBy || 'System Admin' },
];

export default function QuotationsListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<QuotationStatus | undefined>(undefined);
  const [clientId, setClientId] = useState<string | undefined>(undefined);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | undefined>(undefined);

  const clientOptionsQuery = useClientOptions();

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      search: search || undefined,
      status,
      clientId,
      sortBy: sorting[0]?.id,
      sortDirection: (sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : undefined) as
        | 'asc'
        | 'desc'
        | undefined,
    }),
    [page, search, status, clientId, sorting]
  );

  const quotationsQuery = useQuotations(queryParams);
  const exportQuotationsMutation = useExportQuotations();
  const createQuotation = useCreateQuotation();
  const updateQuotation = useUpdateQuotation();
  const deleteQuotation = useDeleteQuotation();

  function openAddModal() {
    setEditingQuotation(undefined);
    setFormOpen(true);
  }

  function openEditModal(quotation: Quotation) {
    setEditingQuotation(quotation);
    setFormOpen(true);
  }

  function handleFormSubmit(values: QuotationFormValues) {
    if (editingQuotation) {
      updateQuotation.mutate(
        { id: editingQuotation.id, values },
        {
          onSuccess: () => {
            toast.success(`${editingQuotation.quotationNo} updated`);
            setFormOpen(false);
          },
          onError: () => toast.error('Failed to update quotation'),
        }
      );
    } else {
      createQuotation.mutate(values, {
        onSuccess: () => {
          toast.success('Quotation added');
          setFormOpen(false);
        },
        onError: () => toast.error('Failed to add quotation'),
      });
    }
  }

  function handleDelete(quotation: Quotation) {
    if (!window.confirm(`Delete quotation ${quotation.quotationNo}? This cannot be undone.`)) return;
    deleteQuotation.mutate(quotation.id, {
      onSuccess: () => toast.success(`${quotation.quotationNo} deleted`),
      onError: () => toast.error('Failed to delete quotation'),
    });
  }

  async function handleExport(format: ExportFormat) {
    if (isExporting) return;
    setIsExporting(true);

    try {
      // 1. Fetch full dataset matching search, filters, sorting order
      const allMatching = await exportQuotationsMutation.mutateAsync({
        search: search || undefined,
        status,
        clientId,
        sortBy: sorting[0]?.id,
        sortDirection: sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : undefined,
      });

      // 2. Filter by selected rows if selection is active
      let dataToExport = allMatching;
      if (selectedIds.size > 0) {
        dataToExport = allMatching.filter((q) => selectedIds.has(q.id));
      }

      // 3. Handle Empty State
      if (!dataToExport || dataToExport.length === 0) {
        toast.error('No quotations available to export.');
        setIsExporting(false);
        return;
      }

      const todayStr = formatDateInput(new Date());
      const filename = `quotations_${todayStr}`;

      const filterSummary: Record<string, string> = {};
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
          columns: QUOTATION_EXPORT_COLUMNS,
        });
      } else if (format === 'pdf') {
        exportPDF({
          filename,
          reportTitle: 'Quotation Report',
          data: dataToExport,
          columns: QUOTATION_EXPORT_COLUMNS,
          appliedFilters: filterSummary,
          orientation: 'landscape',
        });
      }

      toast.success('Quotation exported successfully.');
    } catch (err) {
      console.error('Failed to export quotation:', err);
      toast.error('Failed to export quotation.');
    } finally {
      setIsExporting(false);
    }
  }

  const columns = useMemo<ColumnDef<Quotation, any>[]>(() => {
    const currentPageItems = quotationsQuery.data?.data ?? [];
    const allPageIds = currentPageItems.map((q) => q.id);
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
      { accessorKey: 'quotationNo', header: 'Quotation No' },
      { accessorKey: 'clientName', header: 'Client' },
      {
        accessorKey: 'quotationDate',
        header: 'Quotation Date',
        cell: ({ getValue }) => formatDate(getValue() as string),
      },
      {
        accessorKey: 'validUntil',
        header: 'Valid Until',
        cell: ({ getValue }) => formatDate(getValue() as string),
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ getValue }) => formatCompactCurrency(getValue() as number),
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
                {
                  label: 'Delete',
                  icon: <Trash2 className="h-4 w-4" />,
                  destructive: true,
                  separatorBefore: true,
                  onClick: () => handleDelete(row.original),
                },
              ]}
            />
          </div>
        ),
      },
    ];
  }, [quotationsQuery.data?.data, selectedIds]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quotations"
        description="Pre-sales quotations sent to clients, ahead of MSA and project kickoff."
        action={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openAddModal}>
            Add Quotation
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <SearchBar
            placeholder="Search quotation no, client, notes..."
            onSearch={(q) => {
              setSearch(q);
              setPage(1);
            }}
            className="max-w-sm"
          />
          <FilterBar
            activeCount={(status ? 1 : 0) + (clientId ? 1 : 0)}
            onClear={() => {
              setStatus(undefined);
              setClientId(undefined);
            }}
          >
            <Select
              label="Status"
              placeholder="All statuses"
              options={STATUS_FILTER_OPTIONS}
              value={status}
              onValueChange={(v) => {
                setStatus(v as QuotationStatus);
                setPage(1);
              }}
            />
            <Select
              label="Client"
              placeholder="All clients"
              options={clientOptionsQuery.data ?? []}
              value={clientId}
              onValueChange={(v) => {
                setClientId(v);
                setPage(1);
              }}
            />
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
        data={quotationsQuery.data?.data ?? []}
        isLoading={quotationsQuery.isLoading}
        isError={quotationsQuery.isError}
        onRetry={() => quotationsQuery.refetch()}
        sorting={sorting}
        onSortingChange={(next) => {
          setSorting(next);
          setPage(1);
        }}
        emptyTitle="No quotations yet"
        emptyDescription="Add your first quotation to start tracking pre-sales proposals."
        emptyAction={
          <Button leftIcon={<FileText className="h-4 w-4" />} onClick={openAddModal}>
            Add Quotation
          </Button>
        }
      />

      {quotationsQuery.data && quotationsQuery.data.totalEntries > 0 && (
        <Pagination
          currentPage={quotationsQuery.data.page}
          totalPages={quotationsQuery.data.totalPages}
          totalEntries={quotationsQuery.data.totalEntries}
          pageSize={quotationsQuery.data.pageSize}
          onPageChange={setPage}
        />
      )}

      <QuotationFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        quotation={editingQuotation}
        onSubmit={handleFormSubmit}
        isSubmitting={createQuotation.isPending || updateQuotation.isPending}
      />
    </div>
  );
}
