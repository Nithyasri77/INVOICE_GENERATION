/**
 * Purpose: TypeScript shapes for Dashboard data — stats widgets and chart series
 * Responsibilities: API-friendly types shared between dashboardService and useDashboardStats
 * Dependencies: none
 * Export: DashboardStats, RevenuePoint, OutstandingTrendPoint
 */

export interface DashboardStats {
  totalRevenue: number;
  totalRevenueTrend: number;
  outstandingAmount: number;
  outstandingAmountTrend: number;
  invoicesDueThisWeek: number;
  invoicesDueThisWeekTrend: number;
  overdueInvoices: number;
  overdueInvoicesTrend: number;
  paymentsReceivedThisMonth: number;
  paymentsReceivedThisMonthTrend: number;
  amcRenewalsDue: number;
  amcRenewalsDueTrend: number;
  activeProjects: number;
  totalClients: number;
}

export interface RevenuePoint {
  month: string;
  invoiced: number;
  received: number;
}

export interface OutstandingTrendPoint {
  month: string;
  outstanding: number;
}
