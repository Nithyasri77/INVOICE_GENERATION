/**
 * Purpose: Expenses module landing page (BRD Future Module: Expense Tracking)
 * Responsibilities: Compose PageHeader ("+ Add Expense"), SearchBar, FilterBar (status/category),
 *                    DataTable (sortable, paginated), row ActionMenu (Edit/Delete),
 *                    ExpenseFormModal (add/edit) — this page holds only UI/local state; all data
 *                    access goes through the useExpenses hooks.
 * Dependencies: PageHeader, SearchBar, FilterBar, StatusBadge, ExportButton (shared), DataTable,
 *               Select, Pagination, Button (ui), ExpenseFormModal (features), useExpenses hooks
 * Export: default
 */
import { useMemo, useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { Plus, Pencil, Trash2, Wallet2 } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { SearchBar } from '../../components/shared/SearchBar';
import { FilterBar } from '../../components/shared/FilterBar';
import { ActionMenu } from '../../components/shared/ActionMenu';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { ExportButton, type ExportFormat } from '../../components/shared/ExportButton';
import { DataTable } from '../../components/ui/Table';
import { Select } from '../../components/ui/Select';
import { Pagination } from '../../components/ui/Pagination';
import { Button } from '../../components/ui/Button';
import { toast } from '../../components/ui/Toast';
import { formatCompactCurrency } from '../../utils/formatCurrency';
import {
  useExpenses,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
} from '../../features/expenses/hooks/useExpenses';
import { ExpenseFormModal } from '../../features/expenses/components/ExpenseFormModal';
import type { Expense, ExpenseCategory, ExpenseFormValues } from '../../types/expense.types';
import type { ExpenseStatus } from '../../types/common.types';

const PAGE_SIZE = 10;

const STATUS_FILTER_OPTIONS = [
  { value: 'Pending Approval', label: 'Pending Approval' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Reimbursed', label: 'Reimbursed' },
];

const CATEGORY_FILTER_OPTIONS = [
  { value: 'Travel', label: 'Travel' },
  { value: 'Software & Tools', label: 'Software & Tools' },
  { value: 'Office Supplies', label: 'Office Supplies' },
  { value: 'Hosting & Infrastructure', label: 'Hosting & Infrastructure' },
  { value: 'Contractor Payout', label: 'Contractor Payout' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Other', label: 'Other' },
];

export default function ExpensesListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ExpenseStatus | undefined>(undefined);
  const [category, setCategory] = useState<ExpenseCategory | undefined>(undefined);
  const [sorting, setSorting] = useState<SortingState>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      search: search || undefined,
      status,
      category,
      sortBy: sorting[0]?.id,
      sortDirection: (sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : undefined) as
        | 'asc'
        | 'desc'
        | undefined,
    }),
    [page, search, status, category, sorting]
  );

  const expensesQuery = useExpenses(queryParams);
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  function openAddModal() {
    setEditingExpense(undefined);
    setFormOpen(true);
  }

  function openEditModal(expense: Expense) {
    setEditingExpense(expense);
    setFormOpen(true);
  }

  function handleFormSubmit(values: ExpenseFormValues) {
    if (editingExpense) {
      updateExpense.mutate(
        { id: editingExpense.id, values },
        {
          onSuccess: () => {
            toast.success(`${editingExpense.expenseCode} updated`);
            setFormOpen(false);
          },
          onError: () => toast.error('Failed to update expense'),
        }
      );
    } else {
      createExpense.mutate(values, {
        onSuccess: () => {
          toast.success('Expense added');
          setFormOpen(false);
        },
        onError: () => toast.error('Failed to add expense'),
      });
    }
  }

  function handleDelete(expense: Expense) {
    if (!window.confirm(`Delete expense ${expense.expenseCode}? This cannot be undone.`)) return;
    deleteExpense.mutate(expense.id, {
      onSuccess: () => toast.success(`${expense.expenseCode} deleted`),
      onError: () => toast.error('Failed to delete expense'),
    });
  }

  function handleExport(format: ExportFormat) {
    toast.info(`Exporting expenses as ${format.toUpperCase()}...`);
  }

  const columns: ColumnDef<Expense, any>[] = [
    { accessorKey: 'expenseCode', header: 'Expense ID' },
    { accessorKey: 'description', header: 'Description' },
    { accessorKey: 'category', header: 'Category' },
    {
      accessorKey: 'projectName',
      header: 'Project',
      cell: ({ getValue }) => (getValue() as string) || '—',
    },
    { accessorKey: 'vendor', header: 'Vendor' },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ getValue }) => formatCompactCurrency(getValue() as number),
    },
    { accessorKey: 'expenseDate', header: 'Date' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <ActionMenu
            items={[
              { label: 'Edit', icon: <Pencil className="h-4 w-4" />, onClick: () => openEditModal(row.original) },
              {
                label: 'Delete',
                icon: <Trash2 className="h-4 w-4" />,
                destructive: true,
                separatorBefore: true,
                onClick: () => handleDelete(row.original),
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Project and overhead costs, tracked from submission through reimbursement."
        action={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openAddModal}>
            Add Expense
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <SearchBar
            placeholder="Search expense ID, description, vendor, project..."
            onSearch={(q) => {
              setSearch(q);
              setPage(1);
            }}
            className="max-w-sm"
          />
          <FilterBar
            activeCount={(status ? 1 : 0) + (category ? 1 : 0)}
            onClear={() => {
              setStatus(undefined);
              setCategory(undefined);
            }}
          >
            <Select
              label="Status"
              placeholder="All statuses"
              options={STATUS_FILTER_OPTIONS}
              value={status}
              onValueChange={(v) => {
                setStatus(v as ExpenseStatus);
                setPage(1);
              }}
            />
            <Select
              label="Category"
              placeholder="All categories"
              options={CATEGORY_FILTER_OPTIONS}
              value={category}
              onValueChange={(v) => {
                setCategory(v as ExpenseCategory);
                setPage(1);
              }}
            />
          </FilterBar>
        </div>
        <ExportButton onExport={handleExport} />
      </div>

      <DataTable
        columns={columns}
        data={expensesQuery.data?.data ?? []}
        isLoading={expensesQuery.isLoading}
        isError={expensesQuery.isError}
        onRetry={() => expensesQuery.refetch()}
        sorting={sorting}
        onSortingChange={(next) => {
          setSorting(next);
          setPage(1);
        }}
        emptyTitle="No expenses yet"
        emptyDescription="Add your first expense to start tracking project and overhead costs."
        emptyAction={
          <Button leftIcon={<Wallet2 className="h-4 w-4" />} onClick={openAddModal}>
            Add Expense
          </Button>
        }
      />

      {expensesQuery.data && expensesQuery.data.totalEntries > 0 && (
        <Pagination
          currentPage={expensesQuery.data.page}
          totalPages={expensesQuery.data.totalPages}
          totalEntries={expensesQuery.data.totalEntries}
          pageSize={expensesQuery.data.pageSize}
          onPageChange={setPage}
        />
      )}

      <ExpenseFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        expense={editingExpense}
        onSubmit={handleFormSubmit}
        isSubmitting={createExpense.isPending || updateExpense.isPending}
      />
    </div>
  );
}
