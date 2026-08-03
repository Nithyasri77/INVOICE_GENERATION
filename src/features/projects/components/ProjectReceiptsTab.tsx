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
import { ReceiptPreviewModal } from '../../../components/shared/ReceiptPreviewModal';
import type { ReceiptData } from '../../../components/shared/ProfessionalReceipt';
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

  const selectedReceiptData = useMemo<ReceiptData | undefined>(() => {
    if (!selectedReceipt) return undefined;
    return {
      receiptNo: selectedReceipt.receiptNumber,
      receiptDate: selectedReceipt.paymentDate || selectedReceipt.generatedDate,
      companyName: 'Shine Craft Technologies',
      companyTagline: 'Create | Code | Connect',
      clientName: selectedReceipt.clientName || 'ABC Industries',
      clientAddress: 'No.20,\nFirst Floor,\nUruvaiyar Main Road,\nUruvaiyar,\nPuducherry - 605110',
      paymentId: selectedReceipt.transactionId ? `PAY-${selectedReceipt.transactionId}` : 'PAY-2026-030',
      invoiceNo: selectedReceipt.invoiceNumber,
      paymentMode: selectedReceipt.paymentMode,
      referenceNo: selectedReceipt.transactionId || 'UTR456789123456',
      amountReceived: selectedReceipt.amount,
      signatoryTitle: 'Authorised Signatory',
    };
  }, [selectedReceipt]);

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
                onClick: () => {
                  setSelectedReceipt(row.original);
                  previewModal.open();
                },
              },
              {
                label: 'Print Receipt',
                icon: <Printer className="h-4 w-4 text-slate-600" />,
                onClick: () => {
                  setSelectedReceipt(row.original);
                  previewModal.open();
                },
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

      {/* 4. Official Professional Receipt Preview Modal */}
      <ReceiptPreviewModal
        open={previewModal.isOpen}
        onOpenChange={previewModal.close}
        receipt={selectedReceiptData}
      />

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
