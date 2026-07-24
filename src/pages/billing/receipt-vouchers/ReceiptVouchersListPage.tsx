/**
 * Purpose: Receipt Vouchers module landing page — replaces the earlier PlaceholderPage stub now that
 *          this module is generated
 * Responsibilities: Compose PageHeader ("+ Add Receipt Voucher"), SearchBar, FilterBar (status/client/payment mode),
 *                    DataTable (sortable, paginated), row ActionMenu (Edit/Delete),
 *                    ReceiptVoucherFormModal (add/edit) — this page holds only UI/local state; all
 *                    data access goes through the useReceiptVouchers hooks.
 * Dependencies: PageHeader, SearchBar, FilterBar, StatusBadge, ExportButton (shared), DataTable,
 *               Select, Pagination, Button (ui), ReceiptVoucherFormModal (features), useReceiptVouchers
 *               hooks, useClientOptions (Projects feature — shared Client picker)
 * Export: default
 */
import { useMemo, useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { Plus, Pencil, Trash2, FileMinus } from 'lucide-react';
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
import { formatDate } from '../../../utils/formatDate';
import {
  useReceiptVouchers,
  useCreateReceiptVoucher,
  useUpdateReceiptVoucher,
  useDeleteReceiptVoucher,
} from '../../../features/receipt-vouchers/hooks/useReceiptVouchers';
import { useClientOptions } from '../../../features/projects/hooks/useProjects';
import { ReceiptVoucherFormModal } from '../../../features/receipt-vouchers/components/ReceiptVoucherFormModal';
import type { ReceiptVoucher, ReceiptVoucherFormValues } from '../../../types/receiptVoucher.types';
import type { PaymentStatus } from '../../../types/common.types';

const PAGE_SIZE = 10;

const STATUS_FILTER_OPTIONS = [
  { value: 'Reconciled', label: 'Reconciled' },
  { value: 'Pending', label: 'Pending' },
];

const PAYMENT_MODE_FILTER_OPTIONS = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Cheque', label: 'Cheque' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'UPI', label: 'UPI' },
  { value: 'Card', label: 'Card' },
];

export default function ReceiptVouchersListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<PaymentStatus | undefined>(undefined);
  const [clientId, setClientId] = useState<string | undefined>(undefined);
  const [paymentMode, setPaymentMode] = useState<ReceiptVoucher['paymentMode'] | undefined>(undefined);
  const [sorting, setSorting] = useState<SortingState>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingReceiptVoucher, setEditingReceiptVoucher] = useState<ReceiptVoucher | undefined>(undefined);

  const clientOptionsQuery = useClientOptions();

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      search: search || undefined,
      status,
      clientId,
      paymentMode,
      sortBy: sorting[0]?.id,
      sortDirection: (sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : undefined) as
        | 'asc'
        | 'desc'
        | undefined,
    }),
    [page, search, status, clientId, paymentMode, sorting]
  );

  const receiptVouchersQuery = useReceiptVouchers(queryParams);
  const createReceiptVoucher = useCreateReceiptVoucher();
  const updateReceiptVoucher = useUpdateReceiptVoucher();
  const deleteReceiptVoucher = useDeleteReceiptVoucher();

  function openAddModal() {
    setEditingReceiptVoucher(undefined);
    setFormOpen(true);
  }

  function openEditModal(receiptVoucher: ReceiptVoucher) {
    setEditingReceiptVoucher(receiptVoucher);
    setFormOpen(true);
  }

  function handleFormSubmit(values: ReceiptVoucherFormValues) {
    if (editingReceiptVoucher) {
      updateReceiptVoucher.mutate(
        { id: editingReceiptVoucher.id, values },
        {
          onSuccess: () => {
            toast.success(`${editingReceiptVoucher.receiptNo} updated`);
            setFormOpen(false);
          },
          onError: () => toast.error('Failed to update receipt voucher'),
        }
      );
    } else {
      createReceiptVoucher.mutate(values, {
        onSuccess: () => {
          toast.success('Receipt voucher added');
          setFormOpen(false);
        },
        onError: () => toast.error('Failed to add receipt voucher'),
      });
    }
  }

  function handleDelete(receiptVoucher: ReceiptVoucher) {
    if (!window.confirm(`Delete receipt voucher ${receiptVoucher.receiptNo}? This cannot be undone.`)) return;
    deleteReceiptVoucher.mutate(receiptVoucher.id, {
      onSuccess: () => toast.success(`${receiptVoucher.receiptNo} deleted`),
      onError: () => toast.error('Failed to delete receipt voucher'),
    });
  }

  function handleExport(format: ExportFormat) {
    toast.info(`Exporting receipt vouchers as ${format.toUpperCase()}...`);
  }

  const columns: ColumnDef<ReceiptVoucher, any>[] = [
    { accessorKey: 'receiptNo', header: 'Receipt No' },
    { accessorKey: 'clientName', header: 'Client' },
    {
      accessorKey: 'projectName',
      header: 'Project',
      cell: ({ getValue }) => (getValue() as string | undefined) ?? '—',
    },
    {
      accessorKey: 'invoiceRef',
      header: 'Against Invoice',
      cell: ({ getValue }) => (getValue() as string | undefined) ?? '—',
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ getValue }) => formatDate(getValue() as string),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ getValue }) => formatCompactCurrency(getValue() as number),
    },
    { accessorKey: 'paymentMode', header: 'Payment Mode' },
    { accessorKey: 'referenceNo', header: 'Reference No' },
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
        title="Receipt Vouchers"
        description="Payments received from clients against invoices — bank transfers, cheques, UPI, and card settlements."
        action={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openAddModal}>
            Add Receipt Voucher
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <SearchBar
            placeholder="Search receipt no, client, invoice, reference..."
            onSearch={(q) => {
              setSearch(q);
              setPage(1);
            }}
            className="max-w-sm"
          />
          <FilterBar
            activeCount={(status ? 1 : 0) + (clientId ? 1 : 0) + (paymentMode ? 1 : 0)}
            onClear={() => {
              setStatus(undefined);
              setClientId(undefined);
              setPaymentMode(undefined);
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
              label="Client"
              placeholder="All clients"
              options={clientOptionsQuery.data ?? []}
              value={clientId}
              onValueChange={(v) => {
                setClientId(v);
                setPage(1);
              }}
            />
            <Select
              label="Payment Mode"
              placeholder="All modes"
              options={PAYMENT_MODE_FILTER_OPTIONS}
              value={paymentMode}
              onValueChange={(v) => {
                setPaymentMode(v as ReceiptVoucher['paymentMode']);
                setPage(1);
              }}
            />
          </FilterBar>
        </div>
        <ExportButton onExport={handleExport} />
      </div>

      <DataTable
        columns={columns}
        data={receiptVouchersQuery.data?.data ?? []}
        isLoading={receiptVouchersQuery.isLoading}
        isError={receiptVouchersQuery.isError}
        onRetry={() => receiptVouchersQuery.refetch()}
        sorting={sorting}
        onSortingChange={(next) => {
          setSorting(next);
          setPage(1);
        }}
        emptyTitle="No receipt vouchers yet"
        emptyDescription="Add your first receipt voucher to record a payment received against an invoice."
        emptyAction={
          <Button leftIcon={<FileMinus className="h-4 w-4" />} onClick={openAddModal}>
            Add Receipt Voucher
          </Button>
        }
      />

      {receiptVouchersQuery.data && receiptVouchersQuery.data.totalEntries > 0 && (
        <Pagination
          currentPage={receiptVouchersQuery.data.page}
          totalPages={receiptVouchersQuery.data.totalPages}
          totalEntries={receiptVouchersQuery.data.totalEntries}
          pageSize={receiptVouchersQuery.data.pageSize}
          onPageChange={setPage}
        />
      )}

      <ReceiptVoucherFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        receiptVoucher={editingReceiptVoucher}
        onSubmit={handleFormSubmit}
        isSubmitting={createReceiptVoucher.isPending || updateReceiptVoucher.isPending}
      />
    </div>
  );
}
