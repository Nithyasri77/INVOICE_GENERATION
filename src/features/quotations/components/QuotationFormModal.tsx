/**
 * Purpose: Add/Edit Quotation popup form
 * Responsibilities: Validate + submit the Quotation form; used by QuotationsListPage for both
 *                    "+ Add Quotation" (no initialValues) and row "Edit" (initialValues supplied)
 * Dependencies: Modal/ModalBody/ModalFooter, Input, Select, DatePicker, Button (ui),
 *               react-hook-form, zod, useClientOptions (Projects feature — shared Client picker)
 * Export: QuotationFormModal
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
import type { Quotation, QuotationFormValues } from '../../../types/quotation.types';

const quotationSchema = z
  .object({
    clientId: z.string().min(1, 'Select a client'),
    quotationDate: z.string().min(1, 'Quotation date is required'),
    validUntil: z.string().min(1, 'Valid until date is required'),
    amount: z.number().positive('Enter a valid amount'),
    status: z.enum(['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired']),
    notes: z.string(),
  })
  .refine((data) => new Date(data.validUntil) >= new Date(data.quotationDate), {
    message: 'Valid until must be on or after the quotation date',
    path: ['validUntil'],
  });

export interface QuotationFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotation?: Quotation;
  onSubmit: (values: QuotationFormValues) => void;
  isSubmitting?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Sent', label: 'Sent' },
  { value: 'Accepted', label: 'Accepted' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Expired', label: 'Expired' },
];

const EMPTY_VALUES: QuotationFormValues = {
  clientId: '',
  quotationDate: '',
  validUntil: '',
  amount: 0,
  status: 'Draft',
  notes: '',
};

export function QuotationFormModal({ open, onOpenChange, quotation, onSubmit, isSubmitting }: QuotationFormModalProps) {
  const isEdit = !!quotation;
  const clientOptionsQuery = useClientOptions();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(
        quotation
          ? {
              clientId: quotation.clientId,
              quotationDate: quotation.quotationDate,
              validUntil: quotation.validUntil,
              amount: quotation.amount,
              status: quotation.status,
              notes: quotation.notes,
            }
          : EMPTY_VALUES
      );
    }
  }, [open, quotation, reset]);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit Quotation' : 'Add Quotation'}
      description={isEdit ? "Update this quotation's details." : 'Create a new quotation for a client.'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody className="space-y-4">
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
                onValueChange={field.onChange}
                error={errors.clientId?.message}
              />
            )}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DatePicker
              label="Quotation Date"
              required
              error={errors.quotationDate?.message}
              {...register('quotationDate')}
            />
            <DatePicker label="Valid Until" required error={errors.validUntil?.message} {...register('validUntil')} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Amount (₹)"
              required
              type="number"
              min={0}
              placeholder="e.g. 350000"
              error={errors.amount?.message}
              {...register('amount', { valueAsNumber: true })}
            />
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
          </div>

          <Input label="Notes" placeholder="What this quotation covers" {...register('notes')} />
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Add Quotation'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
