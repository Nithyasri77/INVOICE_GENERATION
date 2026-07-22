/**
 * Purpose: Data access layer for the Dashboard module
 * Responsibilities: Expose getDashboardStats/getRevenueOverview/getOutstandingTrend as the only
 *                    way features/dashboard reads this data — components never call axios directly
 * NOTE: No dashboard API endpoint exists yet. Each function is wired to call axiosClient (see the
 *       commented real call) but currently resolves with seed data matching the wireframe numbers
 *       exactly, so the UI is reviewable end-to-end. Swap the TODO block for the real call once
 *       the backend is live — the function signatures/return shapes are already API-final.
 * Dependencies: axiosClient, dashboard.types
 * Export: getDashboardStats, getRevenueOverview, getOutstandingTrend
 */
import type { DashboardStats, RevenuePoint, OutstandingTrendPoint } from '../types/dashboard.types';

const SEED_STATS: DashboardStats = {
  totalRevenue: 1245000,
  totalRevenueTrend: 18.6,
  outstandingAmount: 780500,
  outstandingAmountTrend: 12.4,
  invoicesDueThisWeek: 8,
  invoicesDueThisWeekTrend: 6,
  overdueInvoices: 15,
  overdueInvoicesTrend: 4,
  paymentsReceivedThisMonth: 425000,
  paymentsReceivedThisMonthTrend: 22.1,
  amcRenewalsDue: 6,
  amcRenewalsDueTrend: 2,
  activeProjects: 18,
  totalClients: 42,
};

const SEED_REVENUE: RevenuePoint[] = [
  { month: 'Jan', invoiced: 210000, received: 180000 },
  { month: 'Feb', invoiced: 260000, received: 230000 },
  { month: 'Mar', invoiced: 240000, received: 250000 },
  { month: 'Apr', invoiced: 520000, received: 300000 },
  { month: 'May', invoiced: 300000, received: 425000 },
  { month: 'Jun', invoiced: 280000, received: 260000 },
];

const SEED_OUTSTANDING_TREND: OutstandingTrendPoint[] = [
  { month: 'Jan', outstanding: 120000 },
  { month: 'Feb', outstanding: 95000 },
  { month: 'Mar', outstanding: 140000 },
  { month: 'Apr', outstanding: 60000 },
  { month: 'May', outstanding: 780500 },
  { month: 'Jun', outstanding: 400000 },
];

export async function getDashboardStats(): Promise<DashboardStats> {
  // TODO: replace with `const { data } = await axiosClient.get<DashboardStats>('/dashboard/stats'); return data;`
  return Promise.resolve(SEED_STATS);
}

export async function getRevenueOverview(): Promise<RevenuePoint[]> {
  // TODO: replace with `const { data } = await axiosClient.get<RevenuePoint[]>('/dashboard/revenue-overview'); return data;`
  return Promise.resolve(SEED_REVENUE);
}

export async function getOutstandingTrend(): Promise<OutstandingTrendPoint[]> {
  // TODO: replace with `const { data } = await axiosClient.get<OutstandingTrendPoint[]>('/dashboard/outstanding-trend'); return data;`
  return Promise.resolve(SEED_OUTSTANDING_TREND);
}
