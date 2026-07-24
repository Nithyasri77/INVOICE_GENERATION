/**
 * Purpose: Invoices module landing page (BRD: Invoices Module Fields)
 * Responsibilities: Compose PageHeader ("+ Create Invoice"), SearchBar, FilterBar (status/project),
 *                    DataTable (sortable, paginated), row ActionMenu (Edit/Delete),
 *                    InvoiceFormModal (add/edit) — this page holds only UI/local state; all data
 *                    access goes through the useInvoices hooks.
 * Dependencies: PageHeader, SearchBar, FilterBar, StatusBadge, ExportButton (shared), DataTable,
 *               Select, Pagination, Button (ui), InvoiceFormModal (features), useInvoices hooks
 * Export: default
 */
import { useMemo, useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { Plus, Pencil, Trash2, Receipt } from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { SearchBar } from '../../../components/shared/SearchBar';
import { FilterBar } from '../../../components/shared/FilterBar';
import { ActionMenu } from '../../../components/shared/ActionMenu';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { ExportButton, type ExportFormat } from '../../../components/shared/ExportButton';
import { DataTable } from '../../../components/ui/Table';
import { Select } from '../../../components/ui/Select';
import { Pagination } from '../../../components/ui/Pagination';
import { Button } from '../../../components/ui/Button';
import { toast } from '../../../components/ui/Toast';
import { formatCompactCurrency } from '../../../utils/formatCurrency';
import {
  useInvoices,
  useCreateInvoice,
  useUpdateInvoice,
  useDeleteInvoice,
  useProjectOptions,
} from '../../../features/invoices/hooks/useInvoices';
import { InvoiceFormModal } from '../../../features/invoices/components/InvoiceFormModal';
import type { Invoice, InvoiceFormValues } from '../../../types/invoice.types';
import type { InvoiceStatus } from '../../../types/common.types';

const PAGE_SIZE = 10;

const STATUS_FILTER_OPTIONS = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Sent', label: 'Sent' },
  { value: 'Part Paid', label: 'Part Paid' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Overdue', label: 'Overdue' },
];

export default function InvoicesListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<InvoiceStatus | undefined>(undefined);
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const [sorting, setSorting] = useState<SortingState>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | undefined>(undefined);

  const projectOptionsQuery = useProjectOptions();

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      search: search || undefined,
      status,
      projectId,
      sortBy: sorting[0]?.id,
      sortDirection: (sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : undefined) as
        | 'asc'
        | 'desc'
        | undefined,
    }),
    [page, search, status, projectId, sorting]
  );

  const invoicesQuery = useInvoices(queryParams);
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const deleteInvoice = useDeleteInvoice();

  function openAddModal() {
    setEditingInvoice(undefined);
    setFormOpen(true);
  }

  function openEditModal(invoice: Invoice) {
    setEditingInvoice(invoice);
    setFormOpen(true);
  }

  function handleFormSubmit(values: InvoiceFormValues) {
    if (editingInvoice) {
      updateInvoice.mutate(
        { id: editingInvoice.id, values },
        {
          onSuccess: () => {
            toast.success(`${editingInvoice.invoiceNo} updated`);
            setFormOpen(false);
          },
          onError: () => toast.error('Failed to update invoice'),
        }
      );
    } else {
      createInvoice.mutate(values, {
        onSuccess: () => {
          toast.success('Invoice created');
          setFormOpen(false);
        },
        onError: () => toast.error('Failed to create invoice'),
      });
    }
  }

  function handleDelete(invoice: Invoice) {
    if (!window.confirm(`Delete invoice ${invoice.invoiceNo}? This cannot be undone.`)) return;
    deleteInvoice.mutate(invoice.id, {
      onSuccess: () => toast.success(`${invoice.invoiceNo} deleted`),
      onError: () => toast.error('Failed to delete invoice'),
    });
  }

  function handleExport(format: ExportFormat) {
    toast.info(`Exporting invoices as ${format.toUpperCase()}...`);
  }

  const columns: ColumnDef<Invoice, any>[] = [
    { accessorKey: 'invoiceNo', header: 'Invoice No' },
    { accessorKey: 'projectName', header: 'Project' },
    { accessorKey: 'clientName', header: 'Client' },
    { accessorKey: 'serviceCategory', header: 'Service Category' },
    { accessorKey: 'billingType', header: 'Billing Type' },
    { accessorKey: 'billingStage', header: 'Billing Stage' },
    { accessorKey: 'invoiceDate', header: 'Invoice Date' },
    { accessorKey: 'dueDate', header: 'Due Date' },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ getValue }) => formatCompactCurrency(getValue() as number),
    },
    {
      accessorKey: 'gst',
      header: 'GST',
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
        title="Invoices"
        description="Tax invoices raised against projects, tracked from draft through payment."
        action={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openAddModal}>
            Create Invoice
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <SearchBar
            placeholder="Search invoice no, project, client..."
            onSearch={(q) => {
              setSearch(q);
              setPage(1);
            }}
            className="max-w-sm"
          />
          <FilterBar
            activeCount={(status ? 1 : 0) + (projectId ? 1 : 0)}
            onClear={() => {
              setStatus(undefined);
              setProjectId(undefined);
            }}
          >
            <Select
              label="Status"
              placeholder="All statuses"
              options={STATUS_FILTER_OPTIONS}
              value={status}
              onValueChange={(v) => {
                setStatus(v as InvoiceStatus);
                setPage(1);
              }}
            />
            <Select
              label="Project"
              placeholder="All projects"
              options={projectOptionsQuery.data ?? []}
              value={projectId}
              onValueChange={(v) => {
                setProjectId(v);
                setPage(1);
              }}
            />
          </FilterBar>
        </div>
        <ExportButton onExport={handleExport} />
      </div>

      <DataTable
        columns={columns}
        data={invoicesQuery.data?.data ?? []}
        isLoading={invoicesQuery.isLoading}
        isError={invoicesQuery.isError}
        onRetry={() => invoicesQuery.refetch()}
        sorting={sorting}
        onSortingChange={(next) => {
          setSorting(next);
          setPage(1);
        }}
        emptyTitle="No invoices yet"
        emptyDescription="Create your first invoice to start billing a project."
        emptyAction={
          <Button leftIcon={<Receipt className="h-4 w-4" />} onClick={openAddModal}>
            Create Invoice
          </Button>
        }
      />

      {invoicesQuery.data && invoicesQuery.data.totalEntries > 0 && (
        <Pagination
          currentPage={invoicesQuery.data.page}
          totalPages={invoicesQuery.data.totalPages}
          totalEntries={invoicesQuery.data.totalEntries}
          pageSize={invoicesQuery.data.pageSize}
          onPageChange={setPage}
        />
      )}

      <InvoiceFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        invoice={editingInvoice}
        onSubmit={handleFormSubmit}
        isSubmitting={createInvoice.isPending || updateInvoice.isPending}
      />
    </div>
  );
}
