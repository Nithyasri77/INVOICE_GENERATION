/**
 * Purpose: TypeScript types for the Expenses module (BRD Future Module: Expense Tracking — no
 *          detailed field list was given, so this follows standard project-expense tracking
 *          practice: category, vendor, amount, date, optional project link, approval status)
 * Responsibilities: Single source of truth for the Expense entity shape, create/update payloads,
 *                    and list-query params
 * Dependencies: common.types (ExpenseStatus, PaginatedResponse)
 * Export: Expense, ExpenseFormValues, ExpenseListParams
 */
import type { ExpenseStatus } from './common.types';

export type ExpenseCategory =
  | 'Travel'
  | 'Software & Tools'
  | 'Office Supplies'
  | 'Hosting & Infrastructure'
  | 'Contractor Payout'
  | 'Marketing'
  | 'Other';

export interface Expense {
  id: string;
  expenseCode: string; // e.g. EXP-0001
  projectId?: string;
  projectName?: string; // denormalized for table display; optional — some expenses are overhead, not project-linked
  category: ExpenseCategory;
  description: string;
  amount: number;
  expenseDate: string; // ISO date
  vendor: string;
  paymentMode: string;
  status: ExpenseStatus;
}

/** Shape used by the Add/Edit Expense form (React Hook Form + Zod) */
export interface ExpenseFormValues {
  projectId?: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  expenseDate: string;
  vendor: string;
  paymentMode: string;
  status: ExpenseStatus;
}

export interface ExpenseListParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: ExpenseStatus;
  category?: ExpenseCategory;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}
