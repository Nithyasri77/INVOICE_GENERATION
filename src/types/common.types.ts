/**
 * Purpose: Cross-module TypeScript types — API response shapes and shared status unions
 * Responsibilities: Single source of truth so services/features don't redefine these shapes
 * Dependencies: none
 * Export: PaginatedResponse<T>, ApiResponse<T>, SortDirection, InvoiceStatus, PaymentStatus,
 *          MilestoneStatus, ProjectStatus, ClientStatus, AmcStatus, QuotationStatus,
 *          DebitNoteStatus, CreditNoteStatus, NdaStatus, MsaStatus, WorkOrderStatus
 */

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalEntries: number;
  totalPages: number;
}

export type SortDirection = 'asc' | 'desc';

export interface TableQueryParams {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDirection?: SortDirection;
  [key: string]: unknown;
}

// Per-module status unions — drive both API validation (Zod) and StatusBadge color mapping
export type InvoiceStatus = 'Draft' | 'Sent' | 'Part Paid' | 'Paid' | 'Overdue';
export type PaymentStatus = 'Reconciled' | 'Pending';
export type MilestoneStatus = 'Not Started' | 'In Progress' | 'Invoice Raised' | 'Paid' | 'Completed';
export type ProjectStatus = 'Development' | 'UAT' | 'Live' | 'On Hold' | 'Completed';
export type ClientStatus = 'Active' | 'Inactive';
export type AmcStatus = 'Active' | 'Upcoming Renewal' | 'Expiring Soon' | 'Expired' | 'Cancelled';
export type QuotationStatus = 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired';
export type DebitNoteStatus = 'Open' | 'Applied' | 'Cancelled';
export type CreditNoteStatus = 'Open' | 'Applied' | 'Cancelled';
export type ExpenseStatus = 'Pending Approval' | 'Approved' | 'Rejected' | 'Reimbursed';
export type NdaStatus = 'Draft' | 'Sent' | 'Signed' | 'Expired';
export type MsaStatus = 'Draft' | 'Sent' | 'Signed' | 'Expired';
export type WorkOrderStatus = 'Draft' | 'Sent' | 'Signed' | 'Active' | 'Completed';
