/**
 * Purpose: Add/Edit Expense popup form
 * Responsibilities: Validate + submit the Expense form; used by ExpensesListPage for both
 *                    "+ Add Expense" (no initialValues) and row "Edit" (initialValues supplied).
 *                    The Project field is optional — some expenses are company overhead rather
 *                    than tied to a specific project.
 * Dependencies: Modal/ModalBody/ModalFooter, Input, Select, DatePicker, Button (ui),
 *               react-hook-form, zod, useClientOptions-style Project picker
 * Export: ExpenseFormModal
 */
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, ModalBody, ModalFooter } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { DatePicker } from '../../../components/ui/DatePicker';
import { Button } from '../../../components/ui/Button';
import { useProjectOptions } from '../../invoices/hooks/useInvoices';
import type { Expense, ExpenseFormValues } from '../../../types/expense.types';

const expenseSchema = z.object({
  projectId: z.string().optional(),
  category: z.enum([
    'Travel',
    'Software & Tools',
    'Office Supplies',
    'Hosting & Infrastructure',
    'Contractor Payout',
    'Marketing',
    'Other',
  ]),
  description: z.string().min(2, 'Description is required'),
  amount: z.number().positive('Enter a valid amount'),
  expenseDate: z.string().min(1, 'Expense date is required'),
  vendor: z.string().min(1, 'Vendor is required'),
  paymentMode: z.string().min(1, 'Payment mode is required'),
  status: z.enum(['Pending Approval', 'Approved', 'Rejected', 'Reimbursed']),
});

export interface ExpenseFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense;
  onSubmit: (values: ExpenseFormValues) => void;
  isSubmitting?: boolean;
}

const CATEGORY_OPTIONS = [
  { value: 'Travel', label: 'Travel' },
  { value: 'Software & Tools', label: 'Software & Tools' },
  { value: 'Office Supplies', label: 'Office Supplies' },
  { value: 'Hosting & Infrastructure', label: 'Hosting & Infrastructure' },
  { value: 'Contractor Payout', label: 'Contractor Payout' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Other', label: 'Other' },
];

const STATUS_OPTIONS = [
  { value: 'Pending Approval', label: 'Pending Approval' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Reimbursed', label: 'Reimbursed' },
];

const EMPTY_VALUES: ExpenseFormValues = {
  projectId: '',
  category: 'Other',
  description: '',
  amount: 0,
  expenseDate: '',
  vendor: '',
  paymentMode: '',
  status: 'Pending Approval',
};

export function ExpenseFormModal({ open, onOpenChange, expense, onSubmit, isSubmitting }: ExpenseFormModalProps) {
  const isEdit = !!expense;
  const projectOptionsQuery = useProjectOptions();
  const projectSelectOptions = [
    { value: '', label: 'No Project (Overhead)' },
    ...(projectOptionsQuery.data ?? []),
  ];

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(
        expense
          ? {
              projectId: expense.projectId ?? '',
              category: expense.category,
              description: expense.description,
              amount: expense.amount,
              expenseDate: expense.expenseDate,
              vendor: expense.vendor,
              paymentMode: expense.paymentMode,
              status: expense.status,
            }
          : EMPTY_VALUES
      );
    }
  }, [open, expense, reset]);

  function handleFormSubmit(values: ExpenseFormValues) {
    onSubmit({ ...values, projectId: values.projectId || undefined });
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit Expense' : 'Add Expense'}
      description={isEdit ? "Update this expense's details." : 'Log a new expense, optionally linked to a project.'}
      size="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <ModalBody className="space-y-4">
          <Input
            label="Description"
            required
            placeholder="e.g. Staging server hosting — Feb"
            error={errors.description?.message}
            {...register('description')}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select label="Category" required options={CATEGORY_OPTIONS} value={field.value} onValueChange={field.onChange} />
              )}
            />
            <Controller
              control={control}
              name="projectId"
              render={({ field }) => (
                <Select
                  label="Project"
                  placeholder="No Project (Overhead)"
                  options={projectSelectOptions}
                  value={field.value}
                  onValueChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Amount (₹)"
              required
              type="number"
              min={0}
              placeholder="e.g. 5400"
              error={errors.amount?.message}
              {...register('amount', { valueAsNumber: true })}
            />
            <DatePicker label="Expense Date" required error={errors.expenseDate?.message} {...register('expenseDate')} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Vendor"
              required
              placeholder="e.g. DigitalOcean, Self"
              error={errors.vendor?.message}
              {...register('vendor')}
            />
            <Input
              label="Payment Mode"
              required
              placeholder="e.g. Card, Cash, Bank Transfer"
              error={errors.paymentMode?.message}
              {...register('paymentMode')}
            />
          </div>

          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select label="Status" required options={STATUS_OPTIONS} value={field.value} onValueChange={field.onChange} />
            )}
          />
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Add Expense'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
