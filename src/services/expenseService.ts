/**
 * Purpose: Data access layer for the Expenses module
 * Responsibilities: Expose getExpenses/createExpense/updateExpense/deleteExpense as the only way
 *                    features/expenses reads or writes this data
 * NOTE: No Expenses API endpoint exists yet. Each function is wired to call axiosClient (see the
 *       commented real call) but currently operates on an in-memory seed array so the UI is
 *       reviewable end-to-end. Swap the TODO block for the real call once the backend is live.
 * Dependencies: axiosClient, expense.types, common.types, projectService (to denormalize projectName)
 * Export: getExpenses, getExpenseById, createExpense, updateExpense, deleteExpense
 */
import type { Expense, ExpenseFormValues, ExpenseListParams } from '../types/expense.types';
import type { PaginatedResponse } from '../types/common.types';
import { getProjectById } from './projectService';

let SEED_EXPENSES: Expense[] = [
  {
    id: '1',
    expenseCode: 'EXP-0001',
    projectId: '1',
    projectName: 'ERP Revamp — Phase 1',
    category: 'Hosting & Infrastructure',
    description: 'Staging server hosting — Feb',
    amount: 4200,
    expenseDate: '2025-02-10',
    vendor: 'DigitalOcean',
    paymentMode: 'Card',
    status: 'Reimbursed',
  },
  {
    id: '2',
    expenseCode: 'EXP-0002',
    projectId: '2',
    projectName: 'Patient Portal Redesign',
    category: 'Software & Tools',
    description: 'Figma team seats — Q2',
    amount: 6800,
    expenseDate: '2025-04-02',
    vendor: 'Figma Inc.',
    paymentMode: 'Card',
    status: 'Approved',
  },
  {
    id: '3',
    projectId: undefined,
    expenseCode: 'EXP-0003',
    projectName: undefined,
    category: 'Office Supplies',
    description: 'Printer cartridges + stationery',
    amount: 2100,
    expenseDate: '2025-05-18',
    vendor: 'Local Vendor',
    paymentMode: 'Cash',
    status: 'Pending Approval',
  },
  {
    id: '4',
    expenseCode: 'EXP-0004',
    projectId: '4',
    projectName: 'E-commerce Storefront',
    category: 'Contractor Payout',
    description: 'Freelance QA support — Sprint 6',
    amount: 18000,
    expenseDate: '2025-03-28',
    vendor: 'Contractor — R. Menon',
    paymentMode: 'Bank Transfer',
    status: 'Reimbursed',
  },
  {
    id: '5',
    expenseCode: 'EXP-0005',
    projectId: '5',
    projectName: 'Site Billing & Inventory Tool',
    category: 'Travel',
    description: 'On-site client visit — Erode',
    amount: 5400,
    expenseDate: '2025-06-25',
    vendor: 'Self',
    paymentMode: 'Cash',
    status: 'Rejected',
  },
];

let nextId = SEED_EXPENSES.length + 1;

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function nextExpenseCode(): string {
  return `EXP-${String(nextId).padStart(4, '0')}`;
}

export async function getExpenses(params: ExpenseListParams): Promise<PaginatedResponse<Expense>> {
  // TODO: replace with `const { data } = await axiosClient.get<PaginatedResponse<Expense>>('/expenses', { params }); return data;`
  let rows = [...SEED_EXPENSES];

  if (params.search) {
    const q = params.search.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.expenseCode.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.vendor.toLowerCase().includes(q) ||
        (r.projectName ?? '').toLowerCase().includes(q)
    );
  }

  if (params.status) {
    rows = rows.filter((r) => r.status === params.status);
  }

  if (params.category) {
    rows = rows.filter((r) => r.category === params.category);
  }

  if (params.sortBy) {
    const dir = params.sortDirection === 'desc' ? -1 : 1;
    rows.sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[params.sortBy!];
      const bv = (b as unknown as Record<string, unknown>)[params.sortBy!];
      if (av == null || bv == null) return 0;
      return av > bv ? dir : av < bv ? -dir : 0;
    });
  }

  const totalEntries = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / params.pageSize));
  const start = (params.page - 1) * params.pageSize;
  const paged = rows.slice(start, start + params.pageSize);

  return delay({
    data: paged,
    page: params.page,
    pageSize: params.pageSize,
    totalEntries,
    totalPages,
  });
}

export async function getExpenseById(id: string): Promise<Expense | undefined> {
  // TODO: replace with `const { data } = await axiosClient.get<Expense>(`/expenses/${id}`); return data;`
  return delay(SEED_EXPENSES.find((r) => r.id === id));
}

export async function createExpense(values: ExpenseFormValues): Promise<Expense> {
  // TODO: replace with `const { data } = await axiosClient.post<Expense>('/expenses', values); return data;`
  const project = values.projectId ? await getProjectById(values.projectId) : undefined;
  const expense: Expense = {
    id: String(nextId),
    expenseCode: nextExpenseCode(),
    ...values,
    projectName: project?.projectName,
  };
  nextId += 1;
  SEED_EXPENSES = [expense, ...SEED_EXPENSES];
  return delay(expense);
}

export async function updateExpense(id: string, values: ExpenseFormValues): Promise<Expense> {
  // TODO: replace with `const { data } = await axiosClient.put<Expense>(`/expenses/${id}`, values); return data;`
  const project = values.projectId ? await getProjectById(values.projectId) : undefined;
  SEED_EXPENSES = SEED_EXPENSES.map((r) =>
    r.id === id ? { ...r, ...values, projectName: project?.projectName } : r
  );
  const updated = SEED_EXPENSES.find((r) => r.id === id)!;
  return delay(updated);
}

export async function deleteExpense(id: string): Promise<void> {
  // TODO: replace with `await axiosClient.delete(`/expenses/${id}`);`
  SEED_EXPENSES = SEED_EXPENSES.filter((r) => r.id !== id);
  return delay(undefined);
}
