/**
 * Purpose: Payments Received module landing page (BRD: Payments Module Fields)
 * Responsibilities: Compose PageHeader ("+ Record Payment"), SearchBar, FilterBar (status/mode),
 *                    DataTable (sortable, paginated), row ActionMenu (Edit/Delete),
 *                    PaymentFormModal (add/edit) — this page holds only UI/local state; all data
 *                    access goes through the usePayments hooks.
 * Dependencies: PageHeader, SearchBar, FilterBar, StatusBadge, ExportButton (shared), DataTable,
 *               Select, Pagination, Button (ui), PaymentFormModal (features), usePayments hooks
 * Export: default
 */
import { useMemo, useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { Plus, Pencil, Trash2, Wallet } from 'lucide-react';
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
  usePayments,
  useCreatePayment,
  useUpdatePayment,
  useDeletePayment,
} from '../../../features/payments/hooks/usePayments';
import { PaymentFormModal } from '../../../features/payments/components/PaymentFormModal';
import type { Payment, PaymentFormValues, PaymentMode } from '../../../types/payment.types';
import type { PaymentStatus } from '../../../types/common.types';

const PAGE_SIZE = 10;

const STATUS_FILTER_OPTIONS = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Reconciled', label: 'Reconciled' },
];

const MODE_FILTER_OPTIONS = [
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'UPI', label: 'UPI' },
  { value: 'Cheque', label: 'Cheque' },
  { value: 'Cash', label: 'Cash' },
  { value: 'Card', label: 'Card' },
];

export default function PaymentsReceivedListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<PaymentStatus | undefined>(undefined);
  const [mode, setMode] = useState<PaymentMode | undefined>(undefined);
  const [sorting, setSorting] = useState<SortingState>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | undefined>(undefined);

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      search: search || undefined,
      status,
      mode,
      sortBy: sorting[0]?.id,
      sortDirection: (sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : undefined) as
        | 'asc'
        | 'desc'
        | undefined,
    }),
    [page, search, status, mode, sorting]
  );

  const paymentsQuery = usePayments(queryParams);
  const createPayment = useCreatePayment();
  const updatePayment = useUpdatePayment();
  const deletePayment = useDeletePayment();

  function openAddModal() {
    setEditingPayment(undefined);
    setFormOpen(true);
  }

  function openEditModal(payment: Payment) {
    setEditingPayment(payment);
    setFormOpen(true);
  }

  function handleFormSubmit(values: PaymentFormValues) {
    if (editingPayment) {
      updatePayment.mutate(
        { id: editingPayment.id, values },
        {
          onSuccess: () => {
            toast.success(`${editingPayment.paymentCode} updated`);
            setFormOpen(false);
          },
          onError: () => toast.error('Failed to update payment'),
        }
      );
    } else {
      createPayment.mutate(values, {
        onSuccess: () => {
          toast.success('Payment recorded');
          setFormOpen(false);
        },
        onError: () => toast.error('Failed to record payment'),
      });
    }
  }

  function handleDelete(payment: Payment) {
    if (!window.confirm(`Delete payment ${payment.paymentCode}? This cannot be undone.`)) return;
    deletePayment.mutate(payment.id, {
      onSuccess: () => toast.success(`${payment.paymentCode} deleted`),
      onError: () => toast.error('Failed to delete payment'),
    });
  }

  function handleExport(format: ExportFormat) {
    toast.info(`Exporting payments as ${format.toUpperCase()}...`);
  }

  const columns: ColumnDef<Payment, any>[] = [
    { accessorKey: 'paymentCode', header: 'Payment ID' },
    { accessorKey: 'invoiceNo', header: 'Invoice No' },
    { accessorKey: 'projectName', header: 'Project' },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ getValue }) => formatCompactCurrency(getValue() as number),
    },
    { accessorKey: 'paymentDate', header: 'Payment Date' },
    { accessorKey: 'mode', header: 'Mode' },
    { accessorKey: 'referenceNumber', header: 'Reference Number' },
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
        title="Payments Received"
        description="Every payment received against an invoice, with mode and reconciliation status."
        action={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openAddModal}>
            Record Payment
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <SearchBar
            placeholder="Search payment ID, invoice, project, reference..."
            onSearch={(q) => {
              setSearch(q);
              setPage(1);
            }}
            className="max-w-sm"
          />
          <FilterBar
            activeCount={(status ? 1 : 0) + (mode ? 1 : 0)}
            onClear={() => {
              setStatus(undefined);
              setMode(undefined);
            }}
          >
            <Select
              label="Status"
              placeholder="All statuses"
              options={STATUS_FILTER_OPTIONS}
              value={status}
              onValueChange={(v) => {
                setStatus(v as PaymentStatus);
                setPage(1);
              }}
            />
            <Select
              label="Mode"
              placeholder="All modes"
              options={MODE_FILTER_OPTIONS}
              value={mode}
              onValueChange={(v) => {
                setMode(v as PaymentMode);
                setPage(1);
              }}
            />
          </FilterBar>
        </div>
        <ExportButton onExport={handleExport} />
      </div>

      <DataTable
        columns={columns}
        data={paymentsQuery.data?.data ?? []}
        isLoading={paymentsQuery.isLoading}
        isError={paymentsQuery.isError}
        onRetry={() => paymentsQuery.refetch()}
        sorting={sorting}
        onSortingChange={(next) => {
          setSorting(next);
          setPage(1);
        }}
        emptyTitle="No payments yet"
        emptyDescription="Record your first payment to start tracking collections against invoices."
        emptyAction={
          <Button leftIcon={<Wallet className="h-4 w-4" />} onClick={openAddModal}>
            Record Payment
          </Button>
        }
      />

      {paymentsQuery.data && paymentsQuery.data.totalEntries > 0 && (
        <Pagination
          currentPage={paymentsQuery.data.page}
          totalPages={paymentsQuery.data.totalPages}
          totalEntries={paymentsQuery.data.totalEntries}
          pageSize={paymentsQuery.data.pageSize}
          onPageChange={setPage}
        />
      )}

      <PaymentFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        payment={editingPayment}
        onSubmit={handleFormSubmit}
        isSubmitting={createPayment.isPending || updatePayment.isPending}
      />
    </div>
  );
}
