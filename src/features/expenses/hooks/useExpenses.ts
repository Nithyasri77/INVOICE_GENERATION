/**
 * Purpose: Data-fetching/mutation hooks for the Expenses module
 * Responsibilities: Wrap expenseService calls in useQuery/useMutation (caching, loading/error
 *                    states, cache invalidation on write) — this is the only thing
 *                    ExpensesListPage and its modal import from the data layer
 * Dependencies: @tanstack/react-query, expenseService, expense.types
 * Export: useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../../../services/expenseService';
import type { ExpenseFormValues, ExpenseListParams } from '../../../types/expense.types';

const EXPENSES_KEY = 'expenses';

export function useExpenses(params: ExpenseListParams) {
  return useQuery({
    queryKey: [EXPENSES_KEY, params],
    queryFn: () => getExpenses(params),
    placeholderData: (prev) => prev,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: ExpenseFormValues) => createExpense(values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] }),
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: ExpenseFormValues }) => updateExpense(id, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] }),
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] }),
  });
}
