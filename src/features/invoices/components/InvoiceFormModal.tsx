/**
 * Purpose: Add/Edit Invoice popup form (BRD: Invoices Module Fields)
 * Responsibilities: Validate + submit the Invoice form; used by InvoicesListPage for both
 *                    "+ Create Invoice" (no initialValues) and row "Edit" (initialValues supplied)
 * Dependencies: Modal/ModalBody/ModalFooter, Input, Select, DatePicker, Button (ui),
 *               react-hook-form, zod, useProjectOptions
 * Export: InvoiceFormModal
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
import { useProjectOptions } from '../hooks/useInvoices';
import type { Invoice, InvoiceFormValues } from '../../../types/invoice.types';

const invoiceSchema = z
  .object({
    projectId: z.string().min(1, 'Select a project'),
    serviceCategory: z.string().min(2, 'Service category is required'),
    billingType: z.enum(['One-Time', 'Milestone-Based', 'Recurring', 'Time & Material']),
    billingStage: z.string().min(1, 'Billing stage is required'),
    invoiceDate: z.string().min(1, 'Invoice date is required'),
    dueDate: z.string().min(1, 'Due date is required'),
    amount: z.number().positive('Enter a valid amount'),
    gst: z.number().min(0, 'Enter a valid GST amount'),
    status: z.enum(['Draft', 'Sent', 'Part Paid', 'Paid', 'Overdue']),
  })
  .refine((data) => new Date(data.dueDate) >= new Date(data.invoiceDate), {
    message: 'Due date must be on or after the invoice date',
    path: ['dueDate'],
  });

export interface InvoiceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Invoice;
  onSubmit: (values: InvoiceFormValues) => void;
  isSubmitting?: boolean;
}

const BILLING_TYPE_OPTIONS = [
  { value: 'One-Time', label: 'One-Time' },
  { value: 'Milestone-Based', label: 'Milestone-Based' },
  { value: 'Recurring', label: 'Recurring' },
  { value: 'Time & Material', label: 'Time & Material' },
];

const STATUS_OPTIONS = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Sent', label: 'Sent' },
  { value: 'Part Paid', label: 'Part Paid' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Overdue', label: 'Overdue' },
];

const EMPTY_VALUES: InvoiceFormValues = {
  projectId: '',
  serviceCategory: '',
  billingType: 'One-Time',
  billingStage: '',
  invoiceDate: '',
  dueDate: '',
  amount: 0,
  gst: 0,
  status: 'Draft',
};

export function InvoiceFormModal({ open, onOpenChange, invoice, onSubmit, isSubmitting }: InvoiceFormModalProps) {
  const isEdit = !!invoice;
  const projectOptionsQuery = useProjectOptions();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(
        invoice
          ? {
              projectId: invoice.projectId,
              serviceCategory: invoice.serviceCategory,
              billingType: invoice.billingType,
              billingStage: invoice.billingStage,
              invoiceDate: invoice.invoiceDate,
              dueDate: invoice.dueDate,
              amount: invoice.amount,
              gst: invoice.gst,
              status: invoice.status,
            }
          : EMPTY_VALUES
      );
    }
  }, [open, invoice, reset]);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit Invoice' : 'Create Invoice'}
      description={isEdit ? "Update this invoice's details." : 'Raise a new invoice against a project.'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody className="space-y-4">
          <Controller
            control={control}
            name="projectId"
            render={({ field }) => (
              <Select
                label="Project"
                required
                placeholder="Select a project"
                options={projectOptionsQuery.data ?? []}
                value={field.value}
                onValueChange={field.onChange}
                error={errors.projectId?.message}
                disabled={isEdit}
              />
            )}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Service Category"
              required
              placeholder="e.g. ERP Implementation"
              error={errors.serviceCategory?.message}
              {...register('serviceCategory')}
            />
            <Controller
              control={control}
              name="billingType"
              render={({ field }) => (
                <Select
                  label="Billing Type"
                  required
                  options={BILLING_TYPE_OPTIONS}
                  value={field.value}
                  onValueChange={field.onChange}
                />
              )}
            />
          </div>

          <Input
            label="Billing Stage"
            required
            placeholder="e.g. Advance, UAT, Go Live"
            error={errors.billingStage?.message}
            {...register('billingStage')}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DatePicker label="Invoice Date" required error={errors.invoiceDate?.message} {...register('invoiceDate')} />
            <DatePicker label="Due Date" required error={errors.dueDate?.message} {...register('dueDate')} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Amount (₹)"
              required
              type="number"
              min={0}
              placeholder="e.g. 170000"
              error={errors.amount?.message}
              {...register('amount', { valueAsNumber: true })}
            />
            <Input
              label="GST (₹)"
              required
              type="number"
              min={0}
              placeholder="e.g. 30600"
              error={errors.gst?.message}
              {...register('gst', { valueAsNumber: true })}
            />
          </div>

          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select
                label="Status"
                required
                options={STATUS_OPTIONS}
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Create Invoice'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
