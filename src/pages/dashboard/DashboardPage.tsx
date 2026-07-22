/**
 * Purpose: Dashboard landing page — the first screen after login
 * Responsibilities: Compose PageHeader, 8 StatCards (Total Revenue, Outstanding, Invoices Due,
 *                    Overdue, Payments Received, AMC Renewals, Active Projects, Total Clients),
 *                    Revenue Overview + Outstanding Trend charts, and Quick Actions — matching
 *                    the wireframe layout exactly. Data comes from useDashboardStats() and friends;
 *                    this component holds no business logic itself.
 * Dependencies: StatCard, ChartCard, PageHeader, useDashboardStats/useRevenueOverview/
 *               useOutstandingTrend, RevenueOverviewChart, OutstandingTrendChart, QuickActions
 * Export: default
 */
import {
  IndianRupee,
  Wallet,
  CalendarClock,
  AlertOctagon,
  Banknote,
  ShieldCheck,
  Briefcase,
  Users,
} from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { ChartCard } from '../../components/ui/ChartCard';
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import { Loader } from '../../components/ui/Loader';
import { ErrorState } from '../../components/ui/ErrorState';
import { formatCompactCurrency } from '../../utils/formatCurrency';
import {
  useDashboardStats,
  useRevenueOverview,
  useOutstandingTrend,
} from '../../features/dashboard/hooks/useDashboardStats';
import { RevenueOverviewChart } from '../../features/dashboard/components/RevenueOverviewChart';
import { OutstandingTrendChart } from '../../features/dashboard/components/OutstandingTrendChart';
import { QuickActions } from '../../features/dashboard/components/QuickActions';

export default function DashboardPage() {
  const statsQuery = useDashboardStats();
  const revenueQuery = useRevenueOverview();
  const outstandingQuery = useOutstandingTrend();

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of revenue, outstanding balances, and activity." />

      {statsQuery.isLoading ? (
        <Loader fullPage label="Loading dashboard..." />
      ) : statsQuery.isError || !statsQuery.data ? (
        <ErrorState onRetry={() => statsQuery.refetch()} />
      ) : (
        <>
          {/* Stat cards — matches wireframe's 2 rows of 4 */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Revenue"
              value={formatCompactCurrency(statsQuery.data.totalRevenue)}
              trend={statsQuery.data.totalRevenueTrend}
              icon={<IndianRupee className="h-4 w-4" />}
            />
            <StatCard
              label="Outstanding Amount"
              value={formatCompactCurrency(statsQuery.data.outstandingAmount)}
              trend={statsQuery.data.outstandingAmountTrend}
              tone="danger"
              icon={<Wallet className="h-4 w-4" />}
            />
            <StatCard
              label="Invoices Due This Week"
              value={String(statsQuery.data.invoicesDueThisWeek)}
              trend={statsQuery.data.invoicesDueThisWeekTrend}
              icon={<CalendarClock className="h-4 w-4" />}
            />
            <StatCard
              label="Overdue Invoices"
              value={String(statsQuery.data.overdueInvoices)}
              trend={statsQuery.data.overdueInvoicesTrend}
              tone="danger"
              icon={<AlertOctagon className="h-4 w-4" />}
            />
            <StatCard
              label="Payments Received (May)"
              value={formatCompactCurrency(statsQuery.data.paymentsReceivedThisMonth)}
              trend={statsQuery.data.paymentsReceivedThisMonthTrend}
              icon={<Banknote className="h-4 w-4" />}
            />
            <StatCard
              label="AMC Renewals Due"
              value={String(statsQuery.data.amcRenewalsDue)}
              trend={statsQuery.data.amcRenewalsDueTrend}
              icon={<ShieldCheck className="h-4 w-4" />}
            />
            <StatCard
              label="Active Projects"
              value={String(statsQuery.data.activeProjects)}
              icon={<Briefcase className="h-4 w-4" />}
            />
            <StatCard
              label="Total Clients"
              value={String(statsQuery.data.totalClients)}
              icon={<Users className="h-4 w-4" />}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Revenue Overview">
              {revenueQuery.isLoading ? (
                <Loader label="Loading chart..." />
              ) : revenueQuery.isError || !revenueQuery.data ? (
                <ErrorState onRetry={() => revenueQuery.refetch()} />
              ) : (
                <RevenueOverviewChart data={revenueQuery.data} />
              )}
            </ChartCard>

            <ChartCard title="Outstanding Trend">
              {outstandingQuery.isLoading ? (
                <Loader label="Loading chart..." />
              ) : outstandingQuery.isError || !outstandingQuery.data ? (
                <ErrorState onRetry={() => outstandingQuery.refetch()} />
              ) : (
                <OutstandingTrendChart data={outstandingQuery.data} />
              )}
            </ChartCard>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardBody>
              <QuickActions />
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
