/**
 * Purpose: Professional ERP Financial Summary Sidebar (Zoho Books / ERPNext style)
 * Responsibilities: Renders Project Value, Total Invoiced, Total Received, Outstanding Amount,
 *                    Pending Milestones, Upcoming Due Date, Last Payment, and dual-tone Progress Bars.
 * Dependencies: Card, CardHeader, CardTitle, CardBody, Loader, ErrorState, formatCurrency, formatDate, useProjectFinancialSummary
 * Export: FinancialSummarySidebar
 */
import { Wallet, FileText, CheckCircle2, Clock, Calendar, ArrowUpRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { Loader } from '../../../components/ui/Loader';
import { ErrorState } from '../../../components/ui/ErrorState';
import { formatCurrency, formatCompactCurrency } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { useProjectFinancialSummary } from '../hooks/useProjectTabs';

export interface FinancialSummarySidebarProps {
  projectId: string;
}

export function FinancialSummarySidebar({ projectId }: FinancialSummarySidebarProps) {
  const summaryQuery = useProjectFinancialSummary(projectId);

  if (summaryQuery.isLoading) {
    return <Loader label="Loading Financial Summary..." />;
  }

  if (summaryQuery.isError || !summaryQuery.data) {
    return <ErrorState title="Financial Summary unavailable" onRetry={() => summaryQuery.refetch()} />;
  }

  const s = summaryQuery.data;

  return (
    <div className="space-y-4">
      <Card className="border-t-4 border-t-primary-600 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-base font-bold text-ink-900">
            <span>Financial Summary</span>
            <Wallet className="h-5 w-5 text-primary-600" />
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-4 text-sm">
          {/* Main Key Figures */}
          <div className="rounded-lg bg-surface-subtle p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink-500 uppercase tracking-wider">Project Value</span>
              <span className="font-bold text-ink-900 text-base">{formatCurrency(s.projectValue)}</span>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-ink-600">Billed vs Value</span>
                <span className="text-primary-700">{s.invoicedPercentage}% ({formatCompactCurrency(s.totalInvoiced)})</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-border">
                <div
                  className="h-full bg-primary-600 transition-all duration-300"
                  style={{ width: `${Math.min(100, s.invoicedPercentage)}%` }}
                />
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-ink-600">Collected vs Value</span>
                <span className="text-success-700">{s.receivedPercentage}% ({formatCompactCurrency(s.totalReceived)})</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-border">
                <div
                  className="h-full bg-success-600 transition-all duration-300"
                  style={{ width: `${Math.min(100, s.receivedPercentage)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Detailed Ledger List */}
          <dl className="divide-y divide-surface-border text-sm">
            <div className="flex items-center justify-between py-2.5">
              <dt className="flex items-center gap-1.5 text-ink-600">
                <FileText className="h-4 w-4 text-ink-400" /> Total Invoiced
              </dt>
              <dd className="font-semibold text-ink-900">{formatCurrency(s.totalInvoiced)}</dd>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <dt className="flex items-center gap-1.5 text-ink-600">
                <CheckCircle2 className="h-4 w-4 text-success-600" /> Total Received
              </dt>
              <dd className="font-semibold text-success-700">{formatCurrency(s.totalReceived)}</dd>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <dt className="flex items-center gap-1.5 text-ink-600">
                <Clock className="h-4 w-4 text-danger-500" /> Outstanding Amount
              </dt>
              <dd className="font-semibold text-danger-600">{formatCurrency(s.outstandingAmount)}</dd>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <dt className="text-ink-600">Pending Milestones</dt>
              <dd className="rounded-full bg-warning-50 px-2.5 py-0.5 text-xs font-bold text-warning-700">
                {s.pendingMilestones} Left
              </dd>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <dt className="flex items-center gap-1.5 text-ink-600">
                <Calendar className="h-4 w-4 text-ink-400" /> Upcoming Due Date
              </dt>
              <dd className="font-medium text-ink-900">{formatDate(s.upcomingDueDate)}</dd>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <dt className="flex items-center gap-1.5 text-ink-600">
                <ArrowUpRight className="h-4 w-4 text-success-600" /> Last Payment
              </dt>
              <dd className="text-right">
                <p className="font-semibold text-ink-900">{formatCurrency(s.lastPaymentAmount)}</p>
                <p className="text-xs text-ink-400">{formatDate(s.lastPaymentDate)}</p>
              </dd>
            </div>
          </dl>
        </CardBody>
      </Card>
    </div>
  );
}
