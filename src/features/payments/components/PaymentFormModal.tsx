/**
 * Purpose: Record/Edit Payment popup form (BRD: Payments Module Fields)
 * Responsibilities: Validate + submit the Payment form; used by PaymentsListPage for both
 *                    "+ Record Payment" (no initialValues) and row "Edit" (initialValues supplied)
 * Dependencies: Modal/ModalBody/ModalFooter, Input, Select, DatePicker, Button (ui),
 *               react-hook-form, zod, useInvoiceOptions
 * Export: PaymentFormModal
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
import { useInvoiceOptions } from '../hooks/usePayments';
import type { Payment, PaymentFormValues } from '../../../types/payment.types';

const paymentSchema = z.object({
  invoiceId: z.string().min(1, 'Select an invoice'),
  amount: z.number().positive('Enter a valid amount'),
  paymentDate: z.string().min(1, 'Payment date is required'),
  mode: z.enum(['Bank Transfer', 'UPI', 'Cheque', 'Cash', 'Card']),
  referenceNumber: z.string().min(1, 'Reference number is required'),
  remarks: z.string(),
  status: z.enum(['Reconciled', 'Pending']),
});

export interface PaymentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment?: Payment;
  onSubmit: (values: PaymentFormValues) => void;
  isSubmitting?: boolean;
}

const MODE_OPTIONS = [
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'UPI', label: 'UPI' },
  { value: 'Cheque', label: 'Cheque' },
  { value: 'Cash', label: 'Cash' },
  { value: 'Card', label: 'Card' },
];

const STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Reconciled', label: 'Reconciled' },
];

const EMPTY_VALUES: PaymentFormValues = {
  invoiceId: '',
  amount: 0,
  paymentDate: '',
  mode: 'Bank Transfer',
  referenceNumber: '',
  remarks: '',
  status: 'Pending',
};

export function PaymentFormModal({ open, onOpenChange, payment, onSubmit, isSubmitting }: PaymentFormModalProps) {
  const isEdit = !!payment;
  const invoiceOptionsQuery = useInvoiceOptions();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(
        payment
          ? {
              invoiceId: payment.invoiceId,
              amount: payment.amount,
              paymentDate: payment.paymentDate,
              mode: payment.mode,
              referenceNumber: payment.referenceNumber,
              remarks: payment.remarks,
              status: payment.status,
            }
          : EMPTY_VALUES
      );
    }
  }, [open, payment, reset]);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit Payment' : 'Record Payment'}
      description={isEdit ? "Update this payment's details." : 'Record a payment received against an invoice.'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody className="space-y-4">
          <Controller
            control={control}
            name="invoiceId"
            render={({ field }) => (
              <Select
                label="Invoice"
                required
                placeholder="Select an invoice"
                options={invoiceOptionsQuery.data ?? []}
                value={field.value}
                onValueChange={field.onChange}
                error={errors.invoiceId?.message}
                disabled={isEdit}
              />
            )}
          />

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
            <DatePicker
              label="Payment Date"
              required
              error={errors.paymentDate?.message}
              {...register('paymentDate')}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              control={control}
              name="mode"
              render={({ field }) => (
                <Select label="Mode" required options={MODE_OPTIONS} value={field.value} onValueChange={field.onChange} />
              )}
            />
            <Input
              label="Reference Number"
              required
              placeholder="e.g. UTR/UPI/Cheque No."
              error={errors.referenceNumber?.message}
              {...register('referenceNumber')}
            />
          </div>

          <Input label="Remarks" placeholder="Any notes about this payment" {...register('remarks')} />

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
            {isEdit ? 'Save Changes' : 'Record Payment'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
