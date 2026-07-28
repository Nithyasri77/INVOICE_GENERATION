/**
 * Purpose: Full ERP Invoices Tab for Project Details (Zoho Books / ERPNext style)
 * Responsibilities: Render invoice KPI cards, search, status, date & billing type filters, paginated data table,
 *                    Create Invoice Modal, View Invoice Modal, Send Invoice Modal, PDF/Print actions
 * Dependencies: DataTable, StatCard, SearchBar, FilterBar, ActionMenu, StatusBadge, Pagination, Select, Input, Modal, Button, Skeleton
 * Export: ProjectInvoicesTab
 */
import { useMemo, useState } from 'react';
import {
  FileText,
  Plus,
  Eye,
  Download,
  Printer,
  Copy,
  Send,
  Calendar,
  AlertOctagon,
  CheckCircle2,
  Wallet,
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
  useProjectInvoices,
  useProjectInvoiceStats,
  useCreateProjectInvoice,
} from '../hooks/useProjectTabs';
import type { ProjectInvoice, BillingStage, BillingType } from '../../../types/projectTabs.types';

export interface ProjectInvoicesTabProps {
  projectId: string;
}

export function ProjectInvoicesTab({ projectId }: ProjectInvoicesTabProps) {
  const { page, pageSize, search, sortBy, sortDirection, setPage, handleSearch, handleSort } = useTableState();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [billingTypeFilter, setBillingTypeFilter] = useState<string>('');
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');

  const statsQuery = useProjectInvoiceStats(projectId);
  const invoicesQuery = useProjectInvoices({
    projectId,
    page,
    pageSize,
    search,
    status: statusFilter || undefined,
    billingType: billingTypeFilter || undefined,
    startDate: startDateFilter || undefined,
    endDate: endDateFilter || undefined,
    sortBy,
    sortDirection,
  });

  const createModal = useDisclosure();
  const viewModal = useDisclosure();
  const sendModal = useDisclosure();

  const [selectedInvoice, setSelectedInvoice] = useState<ProjectInvoice | null>(null);

  // Create form state
  const createInvoiceMutation = useCreateProjectInvoice();
  const [formData, setFormData] = useState({
    invoiceDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
    billingStage: 'Milestone 1' as BillingStage,
    billingType: 'Milestone' as BillingType,
    amount: 150000,
    gstRate: 18,
    notes: '',
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createInvoiceMutation.mutateAsync({
      projectId,
      invoiceDate: formData.invoiceDate,
      dueDate: formData.dueDate,
      billingStage: formData.billingStage,
      billingType: formData.billingType,
      amount: Number(formData.amount),
      gstRate: Number(formData.gstRate),
      notes: formData.notes,
    });
    createModal.close();
  };

  const handleDuplicate = (inv: ProjectInvoice) => {
    setFormData({
      invoiceDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
      billingStage: inv.billingStage,
      billingType: inv.billingType,
      amount: inv.amount,
      gstRate: 18,
      notes: `Duplicated from ${inv.invoiceNo}`,
    });
    createModal.open();
  };

  const handleSendEmail = () => {
    toast.success(`Invoice ${selectedInvoice?.invoiceNo} sent to client email`);
    sendModal.close();
  };

  const activeFilterCount =
    (statusFilter ? 1 : 0) +
    (billingTypeFilter ? 1 : 0) +
    (startDateFilter ? 1 : 0) +
    (endDateFilter ? 1 : 0);

  const columns = useMemo<ColumnDef<ProjectInvoice, unknown>[]>(
    () => [
      {
        accessorKey: 'invoiceNo',
        header: 'Invoice Number',
        cell: ({ getValue }) => <span className="font-semibold text-ink-900">{getValue() as string}</span>,
      },
      {
        accessorKey: 'invoiceDate',
        header: 'Invoice Date',
        cell: ({ getValue }) => formatDate(getValue() as string),
      },
      {
        accessorKey: 'dueDate',
        header: 'Due Date',
        cell: ({ getValue }) => formatDate(getValue() as string),
      },
      {
        accessorKey: 'billingStage',
        header: 'Billing Stage',
        cell: ({ getValue }) => <span className="text-ink-700">{getValue() as string}</span>,
      },
      {
        accessorKey: 'billingType',
        header: 'Billing Type',
        cell: ({ getValue }) => <span className="text-ink-700">{getValue() as string}</span>,
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ getValue }) => formatCurrency(getValue() as number),
      },
      {
        accessorKey: 'gstAmount',
        header: 'GST',
        cell: ({ getValue }) => formatCurrency(getValue() as number),
      },
      {
        accessorKey: 'paidAmount',
        header: 'Paid Amount',
        cell: ({ getValue }) => (
          <span className="font-medium text-success-700">{formatCurrency(getValue() as number)}</span>
        ),
      },
      {
        accessorKey: 'outstandingAmount',
        header: 'Outstanding',
        cell: ({ getValue }) => {
          const val = getValue() as number;
          return (
            <span className={val > 0 ? 'font-semibold text-danger-600' : 'text-ink-500'}>
              {formatCurrency(val)}
            </span>
          );
        },
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
                label: 'View Invoice',
                icon: <Eye className="h-4 w-4" />,
                onClick: () => {
                  setSelectedInvoice(row.original);
                  viewModal.open();
                },
              },
              {
                label: 'Download PDF',
                icon: <Download className="h-4 w-4" />,
                onClick: () => toast.success(`Downloading PDF for ${row.original.invoiceNo}`),
              },
              {
                label: 'Print',
                icon: <Printer className="h-4 w-4" />,
                onClick: () => toast.success(`Preparing print layout for ${row.original.invoiceNo}`),
              },
              {
                label: 'Duplicate',
                icon: <Copy className="h-4 w-4" />,
                onClick: () => handleDuplicate(row.original),
              },
              {
                label: 'Send Invoice',
                icon: <Send className="h-4 w-4" />,
                onClick: () => {
                  setSelectedInvoice(row.original);
                  sendModal.open();
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
      {/* Dashboard KPI Cards */}
      {statsQuery.isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="surface-card p-4 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-20" />
            </div>
          ))}
        </div>
      ) : statsQuery.data ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard
            label="Total Invoices"
            value={String(statsQuery.data.totalInvoices)}
            icon={<FileText className="h-4 w-4" />}
          />
          <StatCard
            label="Total Invoice Amount"
            value={formatCompactCurrency(statsQuery.data.totalInvoicedAmount)}
            icon={<Calendar className="h-4 w-4" />}
          />
          <StatCard
            label="Paid Amount"
            value={formatCompactCurrency(statsQuery.data.paidAmount)}
            icon={<CheckCircle2 className="h-4 w-4 text-success-600" />}
          />
          <StatCard
            label="Outstanding Amount"
            value={formatCompactCurrency(statsQuery.data.outstandingAmount)}
            tone="danger"
            icon={<Wallet className="h-4 w-4 text-danger-600" />}
          />
          <StatCard
            label="Overdue Invoices"
            value={String(statsQuery.data.overdueInvoices)}
            tone="danger"
            icon={<AlertOctagon className="h-4 w-4 text-danger-600" />}
          />
        </div>
      ) : null}

      {/* Header controls & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          placeholder="Search invoice number, stage, notes..."
          onSearch={handleSearch}
          className="sm:max-w-xs"
        />

        <div className="flex items-center gap-2">
          <FilterBar
            activeCount={activeFilterCount}
            onClear={() => {
              setStatusFilter('');
              setBillingTypeFilter('');
              setStartDateFilter('');
              setEndDateFilter('');
            }}
          >
            <div className="space-y-3">
              <Select
                label="Status"
                placeholder="All Statuses"
                options={[
                  { value: 'Draft', label: 'Draft' },
                  { value: 'Sent', label: 'Sent' },
                  { value: 'Part Paid', label: 'Part Paid' },
                  { value: 'Paid', label: 'Paid' },
                  { value: 'Overdue', label: 'Overdue' },
                  { value: 'Cancelled', label: 'Cancelled' },
                ]}
                value={statusFilter}
                onValueChange={setStatusFilter}
              />
              <Select
                label="Billing Type"
                placeholder="All Types"
                options={[
                  { value: 'Milestone', label: 'Milestone' },
                  { value: 'Fixed Price', label: 'Fixed Price' },
                  { value: 'Time & Material', label: 'Time & Material' },
                ]}
                value={billingTypeFilter}
                onValueChange={setBillingTypeFilter}
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

          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={createModal.open}>
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Professional Data Table */}
      <DataTable
        columns={columns}
        data={invoicesQuery.data?.data ?? []}
        isLoading={invoicesQuery.isLoading}
        isError={invoicesQuery.isError}
        onRetry={() => invoicesQuery.refetch()}
        emptyTitle="No invoices found"
        emptyDescription="Create an invoice for this project to start tracking billing stages."
        emptyAction={<Button onClick={createModal.open}>Create Invoice</Button>}
        sorting={sortBy ? [{ id: sortBy, desc: sortDirection === 'desc' }] : []}
        onSortingChange={(sorting) => sorting[0] && handleSort(sorting[0].id)}
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

      {/* Create Invoice Modal */}
      <Modal open={createModal.isOpen} onOpenChange={createModal.close} title="Create Project Invoice" size="lg">
        <form onSubmit={handleCreateSubmit}>
          <ModalBody className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Invoice Date"
                type="date"
                required
                value={formData.invoiceDate}
                onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
              />
              <Input
                label="Due Date"
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
              <Select
                label="Billing Stage"
                required
                options={[
                  { value: 'Initial Advance', label: 'Initial Advance' },
                  { value: 'Milestone 1', label: 'Milestone 1' },
                  { value: 'Milestone 2', label: 'Milestone 2' },
                  { value: 'Final Handover', label: 'Final Handover' },
                  { value: 'Ad-hoc', label: 'Ad-hoc' },
                ]}
                value={formData.billingStage}
                onValueChange={(val) => setFormData({ ...formData, billingStage: val as BillingStage })}
              />
              <Select
                label="Billing Type"
                required
                options={[
                  { value: 'Milestone', label: 'Milestone' },
                  { value: 'Fixed Price', label: 'Fixed Price' },
                  { value: 'Time & Material', label: 'Time & Material' },
                ]}
                value={formData.billingType}
                onValueChange={(val) => setFormData({ ...formData, billingType: val as BillingType })}
              />
              <Input
                label="Amount (excl. GST) (₹)"
                type="number"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              />
              <Input
                label="GST Rate (%)"
                type="number"
                required
                value={formData.gstRate}
                onChange={(e) => setFormData({ ...formData, gstRate: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-700">Remarks / Notes</label>
              <textarea
                rows={3}
                className="w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button type="button" variant="secondary" onClick={createModal.close}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createInvoiceMutation.isPending}>
              Generate Invoice
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* View Invoice Modal */}
      {selectedInvoice && (
        <Modal open={viewModal.isOpen} onOpenChange={viewModal.close} title={`Invoice ${selectedInvoice.invoiceNo}`} size="lg">
          <ModalBody className="space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div>
                <p className="text-xs text-ink-500">Stage</p>
                <p className="font-semibold text-ink-900">{selectedInvoice.billingStage}</p>
              </div>
              <StatusBadge status={selectedInvoice.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div>
                <p className="text-xs text-ink-500">Invoice Date</p>
                <p className="font-medium">{formatDate(selectedInvoice.invoiceDate)}</p>
              </div>
              <div>
                <p className="text-xs text-ink-500">Due Date</p>
                <p className="font-medium">{formatDate(selectedInvoice.dueDate)}</p>
              </div>
              <div>
                <p className="text-xs text-ink-500">Billing Type</p>
                <p className="font-medium">{selectedInvoice.billingType}</p>
              </div>
              <div>
                <p className="text-xs text-ink-500">Total Amount</p>
                <p className="font-semibold text-primary-700">{formatCurrency(selectedInvoice.totalAmount)}</p>
              </div>
            </div>

            <div className="rounded-lg bg-surface-subtle p-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-600">Base Amount:</span>
                <span className="font-medium">{formatCurrency(selectedInvoice.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-600">GST:</span>
                <span className="font-medium">{formatCurrency(selectedInvoice.gstAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-surface-border pt-1.5 font-bold">
                <span>Paid Till Date:</span>
                <span className="text-success-700">{formatCurrency(selectedInvoice.paidAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-danger-600">
                <span>Outstanding Balance:</span>
                <span>{formatCurrency(selectedInvoice.outstandingAmount)}</span>
              </div>
            </div>

            {selectedInvoice.notes && (
              <div>
                <p className="text-xs font-medium text-ink-500">Notes:</p>
                <p className="text-sm text-ink-700">{selectedInvoice.notes}</p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={() => toast.success(`Printing ${selectedInvoice.invoiceNo}...`)}>
              Print
            </Button>
            <Button onClick={viewModal.close}>Close</Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Send Invoice Modal */}
      <Modal open={sendModal.isOpen} onOpenChange={sendModal.close} title="Send Invoice to Client">
        <ModalBody className="space-y-3 text-sm">
          <p className="text-ink-600">
            Send <strong>{selectedInvoice?.invoiceNo}</strong> to client email address?
          </p>
          <Input label="Recipient Email" defaultValue="client.accounts@abcindustries.com" />
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={sendModal.close}>
            Cancel
          </Button>
          <Button onClick={handleSendEmail}>Send Invoice</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
