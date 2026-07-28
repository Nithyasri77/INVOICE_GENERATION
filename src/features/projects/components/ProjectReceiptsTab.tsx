/**
 * Purpose: Full ERP Receipts Tab for Project Details (Zoho Books / ERPNext style)
 * Responsibilities: Render receipt KPI cards, search, payment mode/date filters, paginated table,
 *                    Receipt Preview Modal (printable voucher format), Email Receipt Modal,
 *                    PDF download and print actions
 * Dependencies: DataTable, StatCard, SearchBar, FilterBar, ActionMenu, StatusBadge, Pagination, Select, Input, Modal, Button, Skeleton
 * Export: ProjectReceiptsTab
 */
import { useMemo, useState } from 'react';
import {
  Receipt,
  Eye,
  Download,
  Printer,
  Send,
  CheckCircle2,
  Wallet,
  FileText,
  Building2,
  Check,
} from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { StatCard } from '../../../components/ui/StatCard';
import { DataTable } from '../../../components/ui/Table';
import { Pagination } from '../../../components/ui/Pagination';
import { SearchBar } from '../../../components/shared/SearchBar';
import { FilterBar } from '../../../components/shared/FilterBar';
import { ActionMenu } from '../../../components/shared/ActionMenu';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import { Modal, ModalBody, ModalFooter } from '../../../components/ui/Modal';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useTableState } from '../../../hooks/useTableState';
import { useDisclosure } from '../../../hooks/useDisclosure';
import { formatDate } from '../../../utils/formatDate';
import { formatCurrency, formatCompactCurrency } from '../../../utils/formatCurrency';
import { toast } from '../../../components/ui/Toast';
import { useProjectReceipts, useProjectReceiptStats } from '../hooks/useProjectTabs';
import type { ProjectReceipt } from '../../../types/projectTabs.types';

export interface ProjectReceiptsTabProps {
  projectId: string;
}

export function ProjectReceiptsTab({ projectId }: ProjectReceiptsTabProps) {
  const { page, pageSize, search, sortBy, sortDirection, setPage, handleSearch, handleSort } = useTableState();
  const [paymentModeFilter, setPaymentModeFilter] = useState<string>('');
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');

  const statsQuery = useProjectReceiptStats(projectId);
  const receiptsQuery = useProjectReceipts({
    projectId,
    page,
    pageSize,
    search,
    paymentMode: paymentModeFilter || undefined,
    startDate: startDateFilter || undefined,
    endDate: endDateFilter || undefined,
    sortBy,
    sortDirection,
  });

  const previewModal = useDisclosure();
  const emailModal = useDisclosure();

  const [selectedReceipt, setSelectedReceipt] = useState<ProjectReceipt | null>(null);

  const handleSendEmail = () => {
    toast.success(`Receipt ${selectedReceipt?.receiptNumber} emailed to client`);
    emailModal.close();
  };

  const activeFilterCount =
    (paymentModeFilter ? 1 : 0) +
    (startDateFilter ? 1 : 0) +
    (endDateFilter ? 1 : 0);

  const columns = useMemo<ColumnDef<ProjectReceipt, unknown>[]>(
    () => [
      {
        accessorKey: 'receiptNumber',
        header: 'Receipt Number',
        cell: ({ getValue }) => <span className="font-semibold text-ink-900">{getValue() as string}</span>,
      },
      {
        accessorKey: 'invoiceNumber',
        header: 'Invoice Number',
        cell: ({ getValue }) => (
          <span className="inline-flex items-center rounded-md bg-surface-subtle px-2 py-1 text-xs font-medium text-primary-700">
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'paymentDate',
        header: 'Payment Date',
        cell: ({ getValue }) => formatDate(getValue() as string),
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ getValue }) => (
          <span className="font-semibold text-success-700">{formatCurrency(getValue() as number)}</span>
        ),
      },
      {
        accessorKey: 'paymentMode',
        header: 'Payment Mode',
        cell: ({ getValue }) => <span className="text-ink-700">{getValue() as string}</span>,
      },
      {
        accessorKey: 'transactionId',
        header: 'Transaction ID',
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-ink-600">{getValue() as string || '—'}</span>
        ),
      },
      {
        accessorKey: 'generatedDate',
        header: 'Generated Date',
        cell: ({ getValue }) => formatDate(getValue() as string),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <ActionMenu
            items={[
              {
                label: 'View Receipt',
                icon: <Eye className="h-4 w-4" />,
                onClick: () => {
                  setSelectedReceipt(row.original);
                  previewModal.open();
                },
              },
              {
                label: 'Download PDF',
                icon: <Download className="h-4 w-4" />,
                onClick: () => toast.success(`Downloading PDF for ${row.original.receiptNumber}`),
              },
              {
                label: 'Print Receipt',
                icon: <Printer className="h-4 w-4" />,
                onClick: () => toast.success(`Preparing print layout for ${row.original.receiptNumber}`),
              },
              {
                label: 'Email Receipt',
                icon: <Send className="h-4 w-4" />,
                onClick: () => {
                  setSelectedReceipt(row.original);
                  emailModal.open();
                },
              },
            ]}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div className="space-y-6">
      {/* 1. Summary Cards */}
      {statsQuery.isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="surface-card p-4 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-20" />
            </div>
          ))}
        </div>
      ) : statsQuery.data ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label="Today's Collection"
            value={formatCompactCurrency(statsQuery.data.todaysCollection)}
            icon={<Receipt className="h-4 w-4 text-primary-600" />}
          />
          <StatCard
            label="Project Collection"
            value={formatCompactCurrency(statsQuery.data.projectCollections)}
            icon={<CheckCircle2 className="h-4 w-4 text-success-600" />}
          />
          <StatCard
            label="Total Receipts"
            value={String(statsQuery.data.totalReceipts)}
            icon={<FileText className="h-4 w-4 text-ink-500" />}
          />
          <StatCard
            label="Outstanding Balance"
            value={formatCompactCurrency(statsQuery.data.outstandingBalance)}
            tone="danger"
            icon={<Wallet className="h-4 w-4 text-danger-600" />}
          />
        </div>
      ) : null}

      {/* 2. Header & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          placeholder="Search receipt #, invoice #, transaction ID..."
          onSearch={handleSearch}
          className="sm:max-w-xs"
        />

        <div className="flex items-center gap-2">
          <FilterBar
            activeCount={activeFilterCount}
            onClear={() => {
              setPaymentModeFilter('');
              setStartDateFilter('');
              setEndDateFilter('');
            }}
          >
            <div className="space-y-3">
              <Select
                label="Payment Mode"
                placeholder="All Modes"
                options={[
                  { value: 'Bank Transfer', label: 'Bank Transfer' },
                  { value: 'UPI', label: 'UPI' },
                  { value: 'Cheque', label: 'Cheque' },
                  { value: 'Credit Card', label: 'Credit Card' },
                  { value: 'Cash', label: 'Cash' },
                ]}
                value={paymentModeFilter}
                onValueChange={setPaymentModeFilter}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="From Date"
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                />
                <Input
                  label="To Date"
                  type="date"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                />
              </div>
            </div>
          </FilterBar>
        </div>
      </div>

      {/* 3. Professional Data Table */}
      <DataTable
        columns={columns}
        data={receiptsQuery.data?.data ?? []}
        isLoading={receiptsQuery.isLoading}
        isError={receiptsQuery.isError}
        onRetry={() => receiptsQuery.refetch()}
        emptyTitle="No receipts generated"
        emptyDescription="Receipts will automatically generate when payments are recorded against project invoices."
        sorting={sortBy ? [{ id: sortBy, desc: sortDirection === 'desc' }] : []}
        onSortingChange={(sorting) => sorting[0] && handleSort(sorting[0].id)}
      />

      {receiptsQuery.data && receiptsQuery.data.totalEntries > 0 && (
        <Pagination
          currentPage={receiptsQuery.data.page}
          totalPages={receiptsQuery.data.totalPages}
          totalEntries={receiptsQuery.data.totalEntries}
          pageSize={receiptsQuery.data.pageSize}
          onPageChange={setPage}
        />
      )}

      {/* 4. Receipt Preview Modal (ERP Payment Voucher Layout) */}
      {selectedReceipt && (
        <Modal open={previewModal.isOpen} onOpenChange={previewModal.close} title={`Official Payment Receipt — ${selectedReceipt.receiptNumber}`} size="lg">
          <ModalBody className="space-y-6 p-2">
            {/* Voucher Document Box */}
            <div className="rounded-xl border border-surface-border bg-white p-6 shadow-sm space-y-6 text-sm">
              {/* Header: Company & Receipt Meta */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-surface-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white font-bold">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-ink-900 text-base">Shine Craft Billing ERP</h3>
                    <p className="text-xs text-ink-500">Official Payment Voucher & Receipt</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-3 py-1 text-xs font-semibold text-success-700">
                    <Check className="h-3.5 w-3.5" /> PAYMENT RECEIVED
                  </span>
                  <p className="text-xs text-ink-400 mt-1">Generated: {formatDate(selectedReceipt.generatedDate)}</p>
                </div>
              </div>

              {/* Grid: Client & Payment Details */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs rounded-lg bg-surface-subtle p-4 border border-surface-border/60">
                <div>
                  <p className="text-ink-500 font-medium">Received From:</p>
                  <p className="font-bold text-ink-900 text-sm">{selectedReceipt.clientName}</p>
                  <p className="text-ink-600 mt-1">Invoice Ref: <strong>{selectedReceipt.invoiceNumber}</strong></p>
                </div>

                <div className="space-y-1 sm:text-right">
                  <p className="text-ink-500 font-medium">Receipt Voucher No:</p>
                  <p className="font-mono font-bold text-ink-900 text-sm">{selectedReceipt.receiptNumber}</p>
                  <p className="text-ink-600">Payment Date: <strong>{formatDate(selectedReceipt.paymentDate)}</strong></p>
                </div>
              </div>

              {/* Transaction Breakdown Table */}
              <div className="rounded-lg border border-surface-border overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-bg border-b border-surface-border font-semibold text-ink-600 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-2.5">Description</th>
                      <th className="px-4 py-2.5">Mode</th>
                      <th className="px-4 py-2.5">Transaction UTR / Ref</th>
                      <th className="px-4 py-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    <tr>
                      <td className="px-4 py-3 font-medium text-ink-900">
                        Payment towards Invoice {selectedReceipt.invoiceNumber}
                      </td>
                      <td className="px-4 py-3 text-ink-700">{selectedReceipt.paymentMode}</td>
                      <td className="px-4 py-3 font-mono text-ink-600">{selectedReceipt.transactionId || 'N/A'}</td>
                      <td className="px-4 py-3 text-right font-bold text-success-700 text-sm">
                        {formatCurrency(selectedReceipt.amount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total & Authorization Footer */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-surface-border pt-4">
                <div className="text-xs text-ink-500 space-y-1">
                  <p>Computer generated payment receipt. Valid without signature.</p>
                  <p>Thank you for your business!</p>
                </div>

                <div className="rounded-lg bg-surface-subtle p-3 text-right">
                  <span className="text-xs text-ink-500">Total Net Amount:</span>
                  <div className="text-xl font-extrabold text-primary-700">
                    {formatCurrency(selectedReceipt.amount)}
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="secondary"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={() => toast.success(`Downloading PDF for ${selectedReceipt.receiptNumber}`)}
            >
              Download PDF
            </Button>
            <Button
              variant="secondary"
              leftIcon={<Printer className="h-4 w-4" />}
              onClick={() => toast.success(`Printing receipt ${selectedReceipt.receiptNumber}...`)}
            >
              Print
            </Button>
            <Button onClick={previewModal.close}>Close Preview</Button>
          </ModalFooter>
        </Modal>
      )}

      {/* 5. Email Receipt Modal */}
      <Modal open={emailModal.isOpen} onOpenChange={emailModal.close} title="Email Receipt to Client">
        <ModalBody className="space-y-3 text-sm">
          <p className="text-ink-600">
            Send official receipt PDF for <strong>{selectedReceipt?.receiptNumber}</strong> to client accounts team?
          </p>
          <Input label="Recipient Email" defaultValue="client.accounts@abcindustries.com" />
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={emailModal.close}>
            Cancel
          </Button>
          <Button leftIcon={<Send className="h-4 w-4" />} onClick={handleSendEmail}>
            Email Receipt
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
