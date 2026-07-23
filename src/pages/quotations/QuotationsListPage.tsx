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
import { formatCompactCurrency } from '../../utils/formatCurrency';
import {
  useQuotations,
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

export default function QuotationsListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<QuotationStatus | undefined>(undefined);
  const [clientId, setClientId] = useState<string | undefined>(undefined);
  const [sorting, setSorting] = useState<SortingState>([]);

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

  function handleExport(format: ExportFormat) {
    toast.info(`Exporting quotations as ${format.toUpperCase()}...`);
  }

  const columns: ColumnDef<Quotation, any>[] = [
    { accessorKey: 'quotationNo', header: 'Quotation No' },
    { accessorKey: 'clientName', header: 'Client' },
    { accessorKey: 'quotationDate', header: 'Quotation Date' },
    { accessorKey: 'validUntil', header: 'Valid Until' },
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
        <ExportButton onExport={handleExport} />
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
