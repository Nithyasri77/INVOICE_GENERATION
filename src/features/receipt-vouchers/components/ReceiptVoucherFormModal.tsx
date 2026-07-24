/**
 * Purpose: Add/Edit Receipt Voucher popup form
 * Responsibilities: Validate + submit the Receipt Voucher form; used by ReceiptVouchersListPage for both
 *                    "+ Add Receipt Voucher" (no initialValues) and row "Edit" (initialValues supplied).
 *                    Project options are scoped to the selected Client (cleared on client change).
 * Dependencies: Modal/ModalBody/ModalFooter, Input, Select, DatePicker, Button (ui),
 *               react-hook-form, zod, useClientOptions (Projects feature — shared Client picker),
 *               useProjectOptionsByClient (this module)
 * Export: ReceiptVoucherFormModal
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
import { useClientOptions } from '../../projects/hooks/useProjects';
import { useProjectOptionsByClient } from '../hooks/useReceiptVouchers';
import type { ReceiptVoucher, ReceiptVoucherFormValues } from '../../../types/receiptVoucher.types';

const receiptVoucherSchema = z.object({
  clientId: z.string().min(1, 'Select a client'),
  projectId: z.string().optional(),
  invoiceRef: z.string().min(1, 'Invoice reference is required'),
  date: z.string().min(1, 'Date is required'),
  amount: z.number().positive('Enter a valid amount'),
  paymentMode: z.enum(['Cash', 'Cheque', 'Bank Transfer', 'UPI', 'Card']),
  referenceNo: z.string().min(1, 'Reference number is required'),
  status: z.enum(['Reconciled', 'Pending']),
  notes: z.string(),
});

export interface ReceiptVoucherFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiptVoucher?: ReceiptVoucher;
  onSubmit: (values: ReceiptVoucherFormValues) => void;
  isSubmitting?: boolean;
}

const PAYMENT_MODE_OPTIONS = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Cheque', label: 'Cheque' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'UPI', label: 'UPI' },
  { value: 'Card', label: 'Card' },
];

const STATUS_OPTIONS = [
  { value: 'Reconciled', label: 'Reconciled' },
  { value: 'Pending', label: 'Pending' },
];

const EMPTY_VALUES: ReceiptVoucherFormValues = {
  clientId: '',
  projectId: '',
  invoiceRef: '',
  date: '',
  amount: 0,
  paymentMode: 'Bank Transfer',
  referenceNo: '',
  status: 'Reconciled',
  notes: '',
};

export function ReceiptVoucherFormModal({ open, onOpenChange, receiptVoucher, onSubmit, isSubmitting }: ReceiptVoucherFormModalProps) {
  const isEdit = !!receiptVoucher;
  const clientOptionsQuery = useClientOptions();

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReceiptVoucherFormValues>({
    resolver: zodResolver(receiptVoucherSchema),
    defaultValues: EMPTY_VALUES,
  });

  const watchedClientId = watch('clientId');
  const projectOptionsQuery = useProjectOptionsByClient(watchedClientId || undefined);

  useEffect(() => {
    if (open) {
      reset(
        receiptVoucher
          ? {
              clientId: receiptVoucher.clientId,
              projectId: receiptVoucher.projectId ?? '',
              invoiceRef: receiptVoucher.invoiceRef,
              date: receiptVoucher.date,
              amount: receiptVoucher.amount,
              paymentMode: receiptVoucher.paymentMode,
              referenceNo: receiptVoucher.referenceNo,
              status: receiptVoucher.status,
              notes: receiptVoucher.notes,
            }
          : EMPTY_VALUES
      );
    }
  }, [open, receiptVoucher, reset]);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit Receipt Voucher' : 'Add Receipt Voucher'}
      description={isEdit ? "Update this receipt voucher's details." : 'Record a payment received from a client against an invoice.'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              control={control}
              name="clientId"
              render={({ field }) => (
                <Select
                  label="Client"
                  required
                  placeholder="Select a client"
                  options={clientOptionsQuery.data ?? []}
                  value={field.value}
                  onValueChange={(v) => {
                    field.onChange(v);
                    setValue('projectId', '');
                  }}
                  error={errors.clientId?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="projectId"
              render={({ field }) => (
                <Select
                  label="Project"
                  placeholder={!watchedClientId ? 'Select client first' : 'All / not project-specific'}
                  options={projectOptionsQuery.data ?? []}
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!watchedClientId}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Against Invoice No" required placeholder="e.g. INV-2025-1002" error={errors.invoiceRef?.message} {...register('invoiceRef')} />
            <DatePicker label="Date" required error={errors.date?.message} {...register('date')} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Amount (₹)"
              required
              type="number"
              min={0}
              placeholder="e.g. 25000"
              error={errors.amount?.message}
              {...register('amount', { valueAsNumber: true })}
            />
            <Controller
              control={control}
              name="paymentMode"
              render={({ field }) => (
                <Select label="Payment Mode" required options={PAYMENT_MODE_OPTIONS} value={field.value} onValueChange={field.onChange} />
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Reference No (Cheque/UTR/UPI Ref)" required placeholder="e.g. UTR-20250125001" error={errors.referenceNo?.message} {...register('referenceNo')} />
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select label="Status" required options={STATUS_OPTIONS} value={field.value} onValueChange={field.onChange} />
              )}
            />
          </div>

          <Input label="Notes" placeholder="Any additional context" {...register('notes')} />
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Add Receipt Voucher'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
