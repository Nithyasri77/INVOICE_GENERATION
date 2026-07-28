/**
 * Purpose: TypeScript types for the Reports module (BRD: Outstanding Report, Revenue Report,
 *          Client-wise Revenue, Project-wise Revenue, AMC Revenue, Overdue Payments, Monthly
 *          Collections). Reports are derived/aggregated views over Invoices + Payments — there is
 *          no separate seed dataset; they reflect whatever is currently in those modules.
 * Responsibilities: Row shapes returned by reportService's aggregation functions
 * Dependencies: none
 * Export: OutstandingRow, RevenueSummary, ClientRevenueRow, ProjectRevenueRow, OverdueRow,
 *          MonthlyCollectionRow
 */
export interface OutstandingRow {
  invoiceNo: string;
  projectName: string;
  clientName: string;
  invoiceAmount: number; // amount + gst
  collected: number;
  outstanding: number;
  dueDate: string;
}

export interface RevenueSummary {
  totalInvoiced: number;
  totalCollected: number;
  totalOutstanding: number;
  invoiceCount: number;
}

export interface ClientRevenueRow {
  clientName: string;
  invoiced: number;
  collected: number;
  outstanding: number;
  projectCount: number;
}

export interface ProjectRevenueRow {
  projectName: string;
  clientName: string;
  invoiced: number;
  collected: number;
  outstanding: number;
}

export interface OverdueRow {
  invoiceNo: string;
  projectName: string;
  clientName: string;
  amountDue: number;
  dueDate: string;
  daysOverdue: number;
}

export interface MonthlyCollectionRow {
  month: string; // e.g. "2025-05"
  monthLabel: string; // e.g. "May 2025"
  collected: number;
}

export interface AmcRevenueRow {
  amcNumber: string;
  clientName: string;
  projectName: string;
  contractValue: number;
  status: string;
  renewalDate: string;
}
