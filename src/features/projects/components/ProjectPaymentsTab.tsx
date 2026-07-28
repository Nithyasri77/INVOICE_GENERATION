/**
 * Purpose: Full ERP Payments Tab for Project Details (Zoho Books / ERPNext style)
 * Responsibilities: Render payment KPI cards, outstanding financial summary, payment timeline,
 *                    search, payment mode/status/date filters, paginated data table,
 *                    Receive Payment Modal (with Partial Payment Support), View Payment Modal,
 *                    Receipt Download/Print actions
 * Dependencies: DataTable, StatCard, SearchBar, FilterBar, ActionMenu, StatusBadge, Pagination, Select, Input, Modal, Button, Skeleton
 * Export: ProjectPaymentsTab
 */
import { useMemo, useState } from 'react';
import {
  CreditCard,
  Plus,
  Eye,
  Download,
  Printer,
  Calendar,
  CheckCircle2,
  Wallet,
  Clock,
  Receipt,
} from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { StatCard } from '../../../components/ui/StatCard';
import { DataTable } from '../../../components/ui/Table';
import { Pagination } from '../../../components/ui/Pagination';
import { SearchBar } from '../../../components/shared/SearchBar';
import { FilterBar } from '../../../components/shared/FilterBar';
import { ActionMenu } from '../../../components/shared/ActionMenu';
import { StatusBadge } from '../../../components/shared/StatusBadge';
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
import {
  useProjectPayments,
  useProjectPaymentStats,
  useRecordProjectPayment,
  useProjectInvoices,
} from '../hooks/useProjectTabs';
import type { ProjectPayment, PaymentMode } from '../../../types/projectTabs.types';

export interface ProjectPaymentsTabProps {
  projectId: string;
}

export function ProjectPaymentsTab({ projectId }: ProjectPaymentsTabProps) {
  const { page, pageSize, search, sortBy, sortDirection, setPage, handleSearch, handleSort } = useTableState();
  const [paymentModeFilter, setPaymentModeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');

  const statsQuery = useProjectPaymentStats(projectId);
  const paymentsQuery = useProjectPayments({
    projectId,
    page,
    pageSize,
    search,
    paymentMode: paymentModeFilter || undefined,
    status: statusFilter || undefined,
    startDate: startDateFilter || undefined,
    endDate: endDateFilter || undefined,
    sortBy,
    sortDirection,
  });

  // Project Invoices query for populating invoice dropdown in Receive Payment Modal
  const projectInvoicesQuery = useProjectInvoices({
    projectId,
    page: 1,
    pageSize: 100,
  });

  const recordModal = useDisclosure();
  const viewModal = useDisclosure();

  const [selectedPayment, setSelectedPayment] = useState<ProjectPayment | null>(null);

  // Form state for Record / Receive Payment Modal
  const recordPaymentMutation = useRecordProjectPayment();
  const [formData, setFormData] = useState({
    invoiceNo: '',
    paymentDate: new Date().toISOString().slice(0, 10),
    amount: 0,
    paymentMode: 'Bank Transfer' as PaymentMode,
    referenceNumber: '',
    remarks: '',
  });

  // Calculate selected invoice's current outstanding balance for partial payment helper
  const selectedInvoiceObj = useMemo(() => {
    if (!projectInvoicesQuery.data) return null;
    return projectInvoicesQuery.data.data.find((i) => i.invoiceNo === formData.invoiceNo) ?? null;
  }, [projectInvoicesQuery.data, formData.invoiceNo]);

  const handleOpenReceiveModal = (defaultInvNo?: string) => {
    const inv = defaultInvNo
      ? projectInvoicesQuery.data?.data.find((i) => i.invoiceNo === defaultInvNo)
      : projectInvoicesQuery.data?.data.find((i) => i.outstandingAmount > 0) || projectInvoicesQuery.data?.data[0];

    const targetInvNo = inv?.invoiceNo ?? '';
    const defaultAmount = inv?.outstandingAmount ?? 50000;

    setFormData({
      invoiceNo: targetInvNo,
      paymentDate: new Date().toISOString().slice(0, 10),
      amount: defaultAmount,
      paymentMode: 'Bank Transfer',
      referenceNumber: `UTR-${Date.now().toString().slice(-8)}`,
      remarks: '',
    });
    recordModal.open();
  };

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.invoiceNo) {
      toast.error('Please select an invoice number');
      return;
    }
    if (formData.amount <= 0) {
      toast.error('Payment amount must be greater than zero');
      return;
    }

    await recordPaymentMutation.mutateAsync({
      projectId,
      invoiceNo: formData.invoiceNo,
      paymentDate: formData.paymentDate,
      amount: Number(formData.amount),
      paymentMode: formData.paymentMode,
      referenceNumber: formData.referenceNumber || `REF-${Date.now().toString().slice(-6)}`,
      remarks: formData.remarks,
    });
    recordModal.close();
  };

  const activeFilterCount =
    (paymentModeFilter ? 1 : 0) +
    (statusFilter ? 1 : 0) +
    (startDateFilter ? 1 : 0) +
    (endDateFilter ? 1 : 0);

  const columns = useMemo<ColumnDef<ProjectPayment, unknown>[]>(
    () => [
      {
        accessorKey: 'paymentId',
        header: 'Payment ID',
        cell: ({ getValue }) => <span className="font-semibold text-ink-900">{getValue() as string}</span>,
      },
      {
        accessorKey: 'invoiceNo',
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
        accessorKey: 'referenceNumber',
        header: 'Reference Number',
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-ink-600">{getValue() as string || '—'}</span>
        ),
      },
      {
        accessorKey: 'remarks',
        header: 'Remarks',
        cell: ({ getValue }) => (
          <span className="max-w-[200px] truncate text-xs text-ink-500 block">
            {getValue() as string || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <ActionMenu
            items={[
              {
                label: 'View Payment',
                icon: <Eye className="h-4 w-4" />,
                onClick: () => {
                  setSelectedPayment(row.original);
                  viewModal.open();
                },
              },
              {
                label: 'Download Receipt',
                icon: <Download className="h-4 w-4" />,
                onClick: () => toast.success(`Downloading payment receipt for ${row.original.paymentId}`),
              },
              {
                label: 'Print Receipt',
                icon: <Printer className="h-4 w-4" />,
                onClick: () => toast.success(`Preparing print layout for receipt RCP-${row.original.paymentId.replace('PAY-', '')}`),
              },
            ]}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const allPayments = paymentsQuery.data?.data ?? [];

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
            label="Total Payments"
            value={String(statsQuery.data.totalPayments)}
            icon={<CreditCard className="h-4 w-4 text-primary-600" />}
          />
          <StatCard
            label="Amount Received"
            value={formatCompactCurrency(statsQuery.data.receivedAmount)}
            icon={<CheckCircle2 className="h-4 w-4 text-success-600" />}
          />
          <StatCard
            label="Outstanding Balance"
            value={formatCompactCurrency(statsQuery.data.pendingAmount)}
            tone="danger"
            icon={<Wallet className="h-4 w-4 text-danger-600" />}
          />
          <StatCard
            label="Last Payment Date"
            value={formatDate(statsQuery.data.lastPaymentDate)}
            icon={<Calendar className="h-4 w-4 text-ink-500" />}
          />
        </div>
      ) : null}

      {/* 2. Outstanding Summary Banner */}
      {statsQuery.data && (
        <div className="rounded-xl border border-surface-border bg-gradient-to-r from-surface-subtle via-white to-surface-subtle p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary-600" />
                <h4 className="text-sm font-semibold text-ink-900">Project Outstanding Summary</h4>
              </div>
              <p className="text-xs text-ink-500">
                Total Received: <strong className="text-success-700">{formatCurrency(statsQuery.data.receivedAmount)}</strong> ·
                Pending Balance: <strong className="text-danger-600">{formatCurrency(statsQuery.data.pendingAmount)}</strong>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-semibold text-ink-700">Collection Progress</div>
                <div className="text-xs text-ink-500">
                  {statsQuery.data.receivedAmount + statsQuery.data.pendingAmount > 0
                    ? Math.round(
                        (statsQuery.data.receivedAmount /
                          (statsQuery.data.receivedAmount + statsQuery.data.pendingAmount)) *
                          100
                      )
                    : 100}
                  % Collected
                </div>
              </div>
              <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => handleOpenReceiveModal()}>
                Receive Payment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Controls & View Toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchBar
            placeholder="Search payment ID, invoice #, UTR..."
            onSearch={handleSearch}
            className="sm:max-w-xs"
          />

          <div className="flex items-center rounded-lg border border-surface-border bg-white p-1 text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`rounded px-3 py-1.5 font-medium transition-colors ${
                viewMode === 'table' ? 'bg-primary-50 text-primary-700' : 'text-ink-500 hover:text-ink-900'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`rounded px-3 py-1.5 font-medium transition-colors ${
                viewMode === 'timeline' ? 'bg-primary-50 text-primary-700' : 'text-ink-500 hover:text-ink-900'
              }`}
            >
              Payment Timeline
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <FilterBar
            activeCount={activeFilterCount}
            onClear={() => {
              setPaymentModeFilter('');
              setStatusFilter('');
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
              <Select
                label="Status"
                placeholder="All Statuses"
                options={[
                  { value: 'Reconciled', label: 'Reconciled' },
                  { value: 'Pending', label: 'Pending' },
                  { value: 'Failed', label: 'Failed' },
                ]}
                value={statusFilter}
                onValueChange={setStatusFilter}
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

      {/* 4. Table or Timeline Content */}
      {viewMode === 'table' ? (
        <>
          <DataTable
            columns={columns}
            data={allPayments}
            isLoading={paymentsQuery.isLoading}
            isError={paymentsQuery.isError}
            onRetry={() => paymentsQuery.refetch()}
            emptyTitle="No payments recorded"
            emptyDescription="Record a payment against project invoices to track collections."
            emptyAction={<Button onClick={() => handleOpenReceiveModal()}>Receive Payment</Button>}
            sorting={sortBy ? [{ id: sortBy, desc: sortDirection === 'desc' }] : []}
            onSortingChange={(sorting) => sorting[0] && handleSort(sorting[0].id)}
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
        </>
      ) : (
        /* Payment Timeline View */
        <div className="surface-card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-surface-border pb-4">
            <h3 className="text-base font-semibold text-ink-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary-600" />
              Chronological Payment Timeline
            </h3>
            <span className="text-xs text-ink-500">{allPayments.length} Payments Recorded</span>
          </div>

          {allPayments.length === 0 ? (
            <p className="text-center py-8 text-sm text-ink-500">No payment timeline entries found.</p>
          ) : (
            <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-border">
              {allPayments.map((pay) => (
                <div key={pay.id} className="relative group">
                  {/* Circle Node */}
                  <div className="absolute -left-6 top-1 h-5 w-5 rounded-full border-2 border-primary-500 bg-white group-hover:bg-primary-500 transition-colors" />

                  <div className="rounded-xl border border-surface-border bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-ink-900">{pay.paymentId}</span>
                          <span className="rounded bg-surface-subtle px-2 py-0.5 text-xs text-primary-700 font-medium">
                            {pay.invoiceNo}
                          </span>
                          <StatusBadge status={pay.status} />
                        </div>
                        <p className="text-xs text-ink-500">
                          {formatDate(pay.paymentDate)} · Recorded by {pay.recordedBy} via {pay.paymentMode}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-bold text-success-700">{formatCurrency(pay.amount)}</span>
                        <div className="text-xs font-mono text-ink-400">Ref: {pay.referenceNumber || 'N/A'}</div>
                      </div>
                    </div>

                    {pay.remarks && (
                      <p className="mt-2 text-xs text-ink-600 bg-surface-subtle rounded-lg p-2 border border-surface-border/50">
                        {pay.remarks}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Receive Payment Modal (with Partial Payment Support) */}
      <Modal open={recordModal.isOpen} onOpenChange={recordModal.close} title="Receive Project Payment" size="lg">
        <form onSubmit={handleRecordSubmit}>
          <ModalBody className="space-y-4">
            <div className="rounded-lg bg-surface-subtle p-3 space-y-1.5 text-xs">
              <div className="flex justify-between font-medium">
                <span className="text-ink-600">Selected Invoice:</span>
                <span className="text-ink-900 font-bold">{formData.invoiceNo || 'Select invoice below'}</span>
              </div>
              {selectedInvoiceObj && (
                <>
                  <div className="flex justify-between">
                    <span className="text-ink-500">Invoice Total Amount:</span>
                    <span>{formatCurrency(selectedInvoiceObj.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-danger-600">
                    <span>Current Outstanding:</span>
                    <span>{formatCurrency(selectedInvoiceObj.outstandingAmount)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Invoice Number"
                required
                options={
                  projectInvoicesQuery.data?.data.map((inv) => ({
                    value: inv.invoiceNo,
                    label: `${inv.invoiceNo} (${inv.billingStage} - Due: ${formatCurrency(inv.outstandingAmount)})`,
                  })) ?? []
                }
                value={formData.invoiceNo}
                onValueChange={(val) => {
                  const inv = projectInvoicesQuery.data?.data.find((i) => i.invoiceNo === val);
                  setFormData({
                    ...formData,
                    invoiceNo: val,
                    amount: inv ? inv.outstandingAmount : formData.amount,
                  });
                }}
              />

              <Input
                label="Payment Date"
                type="date"
                required
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              />

              <div className="space-y-1">
                <Input
                  label="Payment Amount (₹)"
                  type="number"
                  required
                  min={1}
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                />
                {selectedInvoiceObj && formData.amount < selectedInvoiceObj.outstandingAmount && (
                  <p className="text-xs text-amber-600 font-medium">
                    ⚡ Partial Payment: {formatCurrency(selectedInvoiceObj.outstandingAmount - formData.amount)} will remain outstanding.
                  </p>
                )}
              </div>

              <Select
                label="Payment Mode"
                required
                options={[
                  { value: 'Bank Transfer', label: 'Bank Transfer (NEFT/RTGS)' },
                  { value: 'UPI', label: 'UPI' },
                  { value: 'Cheque', label: 'Cheque' },
                  { value: 'Credit Card', label: 'Credit Card' },
                  { value: 'Cash', label: 'Cash' },
                ]}
                value={formData.paymentMode}
                onValueChange={(val) => setFormData({ ...formData, paymentMode: val as PaymentMode })}
              />

              <Input
                label="Reference Number (UTR / Cheque No)"
                required
                placeholder="e.g. NEFT-UTIB000123984"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-ink-700">Remarks / Bank Transaction Notes</label>
              <textarea
                rows={3}
                className="w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. Received via NEFT from HDFC Bank client account"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button type="button" variant="secondary" onClick={recordModal.close}>
              Cancel
            </Button>
            <Button type="submit" isLoading={recordPaymentMutation.isPending}>
              Record Payment
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* 6. View Payment Details Modal */}
      {selectedPayment && (
        <Modal open={viewModal.isOpen} onOpenChange={viewModal.close} title={`Payment ${selectedPayment.paymentId}`} size="lg">
          <ModalBody className="space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div>
                <p className="text-xs text-ink-500">Invoice Reference</p>
                <p className="font-semibold text-primary-700">{selectedPayment.invoiceNo}</p>
              </div>
              <StatusBadge status={selectedPayment.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs text-ink-500">Payment Date</p>
                <p className="font-medium">{formatDate(selectedPayment.paymentDate)}</p>
              </div>
              <div>
                <p className="text-xs text-ink-500">Payment Mode</p>
                <p className="font-medium">{selectedPayment.paymentMode}</p>
              </div>
              <div>
                <p className="text-xs text-ink-500">Amount Received</p>
                <p className="font-bold text-success-700">{formatCurrency(selectedPayment.amount)}</p>
              </div>
              <div>
                <p className="text-xs text-ink-500">Reference / UTR Number</p>
                <p className="font-mono text-xs">{selectedPayment.referenceNumber}</p>
              </div>
              <div>
                <p className="text-xs text-ink-500">Recorded By</p>
                <p className="font-medium">{selectedPayment.recordedBy}</p>
              </div>
            </div>

            {selectedPayment.remarks && (
              <div className="rounded-lg bg-surface-subtle p-3 text-sm">
                <p className="text-xs font-semibold text-ink-500">Remarks:</p>
                <p className="text-ink-700">{selectedPayment.remarks}</p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="secondary"
              onClick={() => toast.success(`Printing receipt for ${selectedPayment.paymentId}...`)}
            >
              Print Receipt
            </Button>
            <Button onClick={viewModal.close}>Close</Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}
