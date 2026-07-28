/**
 * Purpose: Reports module landing page (BRD: Reports — Outstanding, Revenue, Client-wise Revenue,
 *          Project-wise Revenue, AMC Revenue, Overdue Payments, Monthly Collections)
 * Responsibilities: Tabs shell over read-only report tables, each backed by a useReports hook that
 *                    aggregates live from Invoices + Payments. AMC Revenue shows an empty state
 *                    since AMC Contracts (its source module) is a BRD Future Module not yet built.
 * Dependencies: PageHeader (shared), Tabs, Card, DataTable, Loader, EmptyState, ExportButton (ui/shared),
 *               useReports hooks
 * Export: default
 */
import type { ColumnDef } from '@tanstack/react-table';
import { TrendingUp, PiggyBank, AlertTriangle } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { ExportButton, type ExportFormat } from '../../components/shared/ExportButton';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Card, CardBody } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/Table';
import { Loader } from '../../components/ui/Loader';
import { toast } from '../../components/ui/Toast';
import { formatCompactCurrency } from '../../utils/formatCurrency';
import {
  useRevenueSummary,
  useOutstandingReport,
  useClientRevenueReport,
  useProjectRevenueReport,
  useOverduePaymentsReport,
  useMonthlyCollectionsReport,
  useAmcRevenueReport,
} from '../../features/reports/hooks/useReports';
import type {
  AmcRevenueRow,
  ClientRevenueRow,
  MonthlyCollectionRow,
  OutstandingRow,
  OverdueRow,
  ProjectRevenueRow,
} from '../../types/report.types';

function handleExport(reportName: string, format: ExportFormat) {
  toast.info(`Exporting ${reportName} as ${format.toUpperCase()}...`);
}

function ReportSection({ title, onExport, children }: { title: string; onExport: () => void; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
        <ExportButton onExport={() => onExport()} />
      </div>
      {children}
    </div>
  );
}

function RevenueTab() {
  const summaryQuery = useRevenueSummary();

  if (summaryQuery.isLoading || !summaryQuery.data) {
    return <Loader label="Loading revenue summary..." />;
  }

  const { totalInvoiced, totalCollected, totalOutstanding, invoiceCount } = summaryQuery.data;

  return (
    <ReportSection title="Revenue Report" onExport={() => handleExport('Revenue Report', 'csv')}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardBody className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-brand-600" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Total Invoiced</p>
              <p className="text-lg font-semibold text-ink-900">{formatCompactCurrency(totalInvoiced)}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-3">
            <PiggyBank className="h-5 w-5 text-success-700" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Total Collected</p>
              <p className="text-lg font-semibold text-success-700">{formatCompactCurrency(totalCollected)}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-danger-700" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Total Outstanding</p>
              <p className="text-lg font-semibold text-danger-700">{formatCompactCurrency(totalOutstanding)}</p>
            </div>
          </CardBody>
        </Card>
      </div>
      <p className="text-sm text-ink-500">Across {invoiceCount} invoices raised to date.</p>
    </ReportSection>
  );
}

function OutstandingTab() {
  const query = useOutstandingReport();
  const columns: ColumnDef<OutstandingRow, any>[] = [
    { accessorKey: 'invoiceNo', header: 'Invoice No' },
    { accessorKey: 'clientName', header: 'Client' },
    { accessorKey: 'projectName', header: 'Project' },
    { accessorKey: 'invoiceAmount', header: 'Invoice Amount', cell: ({ getValue }) => formatCompactCurrency(getValue()) },
    { accessorKey: 'collected', header: 'Collected', cell: ({ getValue }) => formatCompactCurrency(getValue()) },
    { accessorKey: 'outstanding', header: 'Outstanding', cell: ({ getValue }) => formatCompactCurrency(getValue()) },
    { accessorKey: 'dueDate', header: 'Due Date' },
  ];
  return (
    <ReportSection title="Outstanding Report" onExport={() => handleExport('Outstanding Report', 'csv')}>
      <DataTable
        columns={columns}
        data={query.data ?? []}
        isLoading={query.isLoading}
        isError={query.isError}
        onRetry={() => query.refetch()}
        emptyTitle="Nothing outstanding"
        emptyDescription="Every invoice has been fully collected."
      />
    </ReportSection>
  );
}

function ClientRevenueTab() {
  const query = useClientRevenueReport();
  const columns: ColumnDef<ClientRevenueRow, any>[] = [
    { accessorKey: 'clientName', header: 'Client' },
    { accessorKey: 'projectCount', header: 'Projects' },
    { accessorKey: 'invoiced', header: 'Invoiced', cell: ({ getValue }) => formatCompactCurrency(getValue()) },
    { accessorKey: 'collected', header: 'Collected', cell: ({ getValue }) => formatCompactCurrency(getValue()) },
    { accessorKey: 'outstanding', header: 'Outstanding', cell: ({ getValue }) => formatCompactCurrency(getValue()) },
  ];
  return (
    <ReportSection title="Client-wise Revenue" onExport={() => handleExport('Client-wise Revenue', 'csv')}>
      <DataTable
        columns={columns}
        data={query.data ?? []}
        isLoading={query.isLoading}
        isError={query.isError}
        onRetry={() => query.refetch()}
        emptyTitle="No revenue yet"
        emptyDescription="Revenue by client will appear here once invoices are raised."
      />
    </ReportSection>
  );
}

function ProjectRevenueTab() {
  const query = useProjectRevenueReport();
  const columns: ColumnDef<ProjectRevenueRow, any>[] = [
    { accessorKey: 'projectName', header: 'Project' },
    { accessorKey: 'clientName', header: 'Client' },
    { accessorKey: 'invoiced', header: 'Invoiced', cell: ({ getValue }) => formatCompactCurrency(getValue()) },
    { accessorKey: 'collected', header: 'Collected', cell: ({ getValue }) => formatCompactCurrency(getValue()) },
    { accessorKey: 'outstanding', header: 'Outstanding', cell: ({ getValue }) => formatCompactCurrency(getValue()) },
  ];
  return (
    <ReportSection title="Project-wise Revenue" onExport={() => handleExport('Project-wise Revenue', 'csv')}>
      <DataTable
        columns={columns}
        data={query.data ?? []}
        isLoading={query.isLoading}
        isError={query.isError}
        onRetry={() => query.refetch()}
        emptyTitle="No revenue yet"
        emptyDescription="Revenue by project will appear here once invoices are raised."
      />
    </ReportSection>
  );
}

function OverduePaymentsTab() {
  const query = useOverduePaymentsReport();
  const columns: ColumnDef<OverdueRow, any>[] = [
    { accessorKey: 'invoiceNo', header: 'Invoice No' },
    { accessorKey: 'clientName', header: 'Client' },
    { accessorKey: 'projectName', header: 'Project' },
    { accessorKey: 'amountDue', header: 'Amount Due', cell: ({ getValue }) => formatCompactCurrency(getValue()) },
    { accessorKey: 'dueDate', header: 'Due Date' },
    { accessorKey: 'daysOverdue', header: 'Days Overdue' },
  ];
  return (
    <ReportSection title="Overdue Payments" onExport={() => handleExport('Overdue Payments', 'csv')}>
      <DataTable
        columns={columns}
        data={query.data ?? []}
        isLoading={query.isLoading}
        isError={query.isError}
        onRetry={() => query.refetch()}
        emptyTitle="Nothing overdue"
        emptyDescription="No invoices are currently past their due date."
      />
    </ReportSection>
  );
}

function MonthlyCollectionsTab() {
  const query = useMonthlyCollectionsReport();
  const columns: ColumnDef<MonthlyCollectionRow, any>[] = [
    { accessorKey: 'monthLabel', header: 'Month' },
    { accessorKey: 'collected', header: 'Collected', cell: ({ getValue }) => formatCompactCurrency(getValue()) },
  ];
  return (
    <ReportSection title="Monthly Collections" onExport={() => handleExport('Monthly Collections', 'csv')}>
      <DataTable
        columns={columns}
        data={query.data ?? []}
        isLoading={query.isLoading}
        isError={query.isError}
        onRetry={() => query.refetch()}
        emptyTitle="No collections yet"
        emptyDescription="Monthly collection totals will appear here once payments are recorded."
      />
    </ReportSection>
  );
}

function AmcRevenueTab() {
  const query = useAmcRevenueReport();
  const columns: ColumnDef<AmcRevenueRow, any>[] = [
    { accessorKey: 'amcNumber', header: 'AMC No' },
    { accessorKey: 'clientName', header: 'Client' },
    { accessorKey: 'projectName', header: 'Project' },
    { accessorKey: 'contractValue', header: 'Contract Value', cell: ({ getValue }) => formatCompactCurrency(getValue()) },
    { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <StatusBadge status={getValue() as string} /> },
    { accessorKey: 'renewalDate', header: 'Renewal Date' },
  ];
  return (
    <ReportSection title="AMC Revenue" onExport={() => handleExport('AMC Revenue', 'csv')}>
      <DataTable
        columns={columns}
        data={query.data ?? []}
        isLoading={query.isLoading}
        isError={query.isError}
        onRetry={() => query.refetch()}
        emptyTitle="No AMC contracts yet"
        emptyDescription="AMC Revenue will populate once contracts are added in AMC Contracts."
      />
    </ReportSection>
  );
}

export default function ReportsHubPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Outstanding, revenue, and collection insights derived from your Invoices and Payments."
      />

      <Tabs defaultValue="outstanding">
        <TabsList>
          <TabsTrigger value="outstanding">Outstanding</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="client-revenue">Client-wise Revenue</TabsTrigger>
          <TabsTrigger value="project-revenue">Project-wise Revenue</TabsTrigger>
          <TabsTrigger value="amc-revenue">AMC Revenue</TabsTrigger>
          <TabsTrigger value="overdue">Overdue Payments</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Collections</TabsTrigger>
        </TabsList>

        <TabsContent value="outstanding">
          <OutstandingTab />
        </TabsContent>
        <TabsContent value="revenue">
          <RevenueTab />
        </TabsContent>
        <TabsContent value="client-revenue">
          <ClientRevenueTab />
        </TabsContent>
        <TabsContent value="project-revenue">
          <ProjectRevenueTab />
        </TabsContent>
        <TabsContent value="amc-revenue">
          <AmcRevenueTab />
        </TabsContent>
        <TabsContent value="overdue">
          <OverduePaymentsTab />
        </TabsContent>
        <TabsContent value="monthly">
          <MonthlyCollectionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
