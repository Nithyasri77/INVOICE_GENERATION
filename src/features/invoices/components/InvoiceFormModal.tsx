/**
 * Purpose: Add/Edit Invoice popup form (BRD: Invoices Module Fields + Create Invoice mockup —
 *          line-items table with HSN/SAC, Qty, Rate, Amount, plus CGST/SGST auto-calculated)
 * Responsibilities: Validate + submit the Invoice form; used by InvoicesListPage for both
 *                    "+ Create Invoice" (no initialValues) and row "Edit" (initialValues supplied).
 *                    Line items are edited as a table; Sub Total/CGST(9%)/SGST(9%)/Total are
 *                    derived live from the items so they never drift out of sync.
 * Dependencies: Modal/ModalBody/ModalFooter, Input, Select, DatePicker, Textarea, Button (ui),
 *               react-hook-form, zod, useProjectOptions
 * Export: InvoiceFormModal
 */
import { useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { Modal, ModalBody, ModalFooter } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { DatePicker } from '../../../components/ui/DatePicker';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { formatCurrency } from '../../../utils/formatCurrency';
import { useProjectOptions } from '../hooks/useInvoices';
import type { Invoice, InvoiceFormValues } from '../../../types/invoice.types';

const CGST_RATE = 0.09;
const SGST_RATE = 0.09;

const lineItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, 'Required'),
  hsnSac: z.string().min(1, 'Required'),
  qty: z.number().positive('Qty > 0'),
  rate: z.number().min(0, 'Rate >= 0'),
  amount: z.number().min(0),
});

const invoiceSchema = z
  .object({
    projectId: z.string().min(1, 'Select a project'),
    serviceCategory: z.string().min(2, 'Service category is required'),
    billingType: z.enum(['One-Time', 'Milestone-Based', 'Recurring', 'Time & Material']),
    billingStage: z.string().min(1, 'Milestone / Stage is required'),
    quotationNo: z.string().min(1, 'Quotation No. is required'),
    invoiceDate: z.string().min(1, 'Invoice date is required'),
    dueDate: z.string().min(1, 'Due date is required'),
    items: z.array(lineItemSchema).min(1, 'Add at least one item'),
    amount: z.number().min(0),
    cgst: z.number().min(0),
    sgst: z.number().min(0),
    gst: z.number().min(0),
    notes: z.string(),
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

function emptyItem(): InvoiceFormValues['items'][number] {
  return { id: `itm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, description: '', hsnSac: '', qty: 1, rate: 0, amount: 0 };
}

const EMPTY_VALUES: InvoiceFormValues = {
  projectId: '',
  serviceCategory: '',
  billingType: 'One-Time',
  billingStage: '',
  quotationNo: '',
  invoiceDate: '',
  dueDate: '',
  items: [emptyItem()],
  amount: 0,
  cgst: 0,
  sgst: 0,
  gst: 0,
  notes: 'Thank you for your business.',
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
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: EMPTY_VALUES,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = watch('items');

  // Recalculate each row's amount + Sub Total/CGST/SGST/GST live as qty/rate change
  useEffect(() => {
    let subTotal = 0;
    watchedItems.forEach((item, idx) => {
      const rowAmount = (Number(item.qty) || 0) * (Number(item.rate) || 0);
      if (item.amount !== rowAmount) {
        setValue(`items.${idx}.amount`, rowAmount, { shouldValidate: false });
      }
      subTotal += rowAmount;
    });
    const cgst = Math.round(subTotal * CGST_RATE);
    const sgst = Math.round(subTotal * SGST_RATE);
    setValue('amount', subTotal, { shouldValidate: false });
    setValue('cgst', cgst, { shouldValidate: false });
    setValue('sgst', sgst, { shouldValidate: false });
    setValue('gst', cgst + sgst, { shouldValidate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(watchedItems.map((i) => [i.qty, i.rate]))]);

  useEffect(() => {
    if (open) {
      reset(
        invoice
          ? {
              projectId: invoice.projectId,
              serviceCategory: invoice.serviceCategory,
              billingType: invoice.billingType,
              billingStage: invoice.billingStage,
              quotationNo: invoice.quotationNo,
              invoiceDate: invoice.invoiceDate,
              dueDate: invoice.dueDate,
              items: invoice.items.length ? invoice.items : [emptyItem()],
              amount: invoice.amount,
              cgst: invoice.cgst,
              sgst: invoice.sgst,
              gst: invoice.gst,
              notes: invoice.notes,
              status: invoice.status,
            }
          : EMPTY_VALUES
      );
    }
  }, [open, invoice, reset]);

  const subTotal = watch('amount');
  const cgst = watch('cgst');
  const sgst = watch('sgst');
  const totalAmount = subTotal + cgst + sgst;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit Invoice' : 'Create Invoice'}
      description={isEdit ? "Update this invoice's details." : 'Raise a new invoice against a project.'}
      size="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Milestone / Stage"
              required
              placeholder="e.g. AMC - Annual Maintenance"
              error={errors.billingStage?.message}
              {...register('billingStage')}
            />
            <Input
              label="Quotation No."
              required
              placeholder="e.g. QT-2026-015"
              error={errors.quotationNo?.message}
              {...register('quotationNo')}
            />
          </div>

          <Input
            label="Service Category"
            required
            placeholder="e.g. ERP Implementation"
            error={errors.serviceCategory?.message}
            {...register('serviceCategory')}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DatePicker label="Invoice Date" required error={errors.invoiceDate?.message} {...register('invoiceDate')} />
            <DatePicker label="Due Date" required error={errors.dueDate?.message} {...register('dueDate')} />
          </div>

          {/* Line Items table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-ink-700">Items</label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<Plus className="h-3.5 w-3.5" />}
                onClick={() => append(emptyItem())}
              >
                Add Item
              </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-surface-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-subtle text-xs font-semibold text-ink-600">
                  <tr>
                    <th className="px-3 py-2 w-10">#</th>
                    <th className="px-3 py-2">Description</th>
                    <th className="px-3 py-2 w-28">HSN/SAC</th>
                    <th className="px-3 py-2 w-20">Qty</th>
                    <th className="px-3 py-2 w-28">Rate (₹)</th>
                    <th className="px-3 py-2 w-32 text-right">Amount (₹)</th>
                    <th className="px-3 py-2 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {fields.map((field, idx) => (
                    <tr key={field.id}>
                      <td className="px-3 py-2 text-ink-500">{idx + 1}</td>
                      <td className="px-2 py-2">
                        <input
                          className="w-full rounded border border-surface-border px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                          placeholder="e.g. AMC Services (Website)"
                          {...register(`items.${idx}.description` as const)}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          className="w-full rounded border border-surface-border px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                          placeholder="998314"
                          {...register(`items.${idx}.hsnSac` as const)}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min={0}
                          step="1"
                          className="w-full rounded border border-surface-border px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                          {...register(`items.${idx}.qty` as const, { valueAsNumber: true })}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          className="w-full rounded border border-surface-border px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                          {...register(`items.${idx}.rate` as const, { valueAsNumber: true })}
                        />
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-ink-900">
                        {formatCurrency((Number(watchedItems[idx]?.qty) || 0) * (Number(watchedItems[idx]?.rate) || 0))}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button
                          type="button"
                          className="text-ink-400 hover:text-danger-600 disabled:opacity-30"
                          disabled={fields.length === 1}
                          onClick={() => remove(idx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {errors.items?.message && <p className="text-xs text-danger-600">{errors.items.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Textarea label="Notes" rows={3} placeholder="e.g. Thank you for your business." {...register('notes')} />

            <div className="space-y-1.5 rounded-lg bg-surface-subtle p-4 text-sm self-end">
              <div className="flex justify-between text-ink-600">
                <span>Sub Total</span>
                <span className="font-medium text-ink-900">{formatCurrency(subTotal)}</span>
              </div>
              <div className="flex justify-between text-ink-600">
                <span>CGST (9%)</span>
                <span className="font-medium text-ink-900">{formatCurrency(cgst)}</span>
              </div>
              <div className="flex justify-between text-ink-600">
                <span>SGST (9%)</span>
                <span className="font-medium text-ink-900">{formatCurrency(sgst)}</span>
              </div>
              <div className="flex justify-between border-t border-surface-border pt-1.5 font-semibold text-ink-900">
                <span>Total Amount</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>
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
