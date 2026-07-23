/**
 * Purpose: Cross-module TypeScript types — API response shapes and shared status unions
 * Responsibilities: Single source of truth so services/features don't redefine these shapes
 * Dependencies: none
 * Export: PaginatedResponse<T>, ApiResponse<T>, SortDirection, InvoiceStatus, PaymentStatus,
 *          MilestoneStatus, ProjectStatus, ClientStatus
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
export type AmcStatus = 'Active' | 'Expiring Soon' | 'Expired';
export type QuotationStatus = 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired';
