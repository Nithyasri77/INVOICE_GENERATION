/**
 * Purpose: Add/Edit Debit Note popup form
 * Responsibilities: Validate + submit the Debit Note form; used by DebitNotesListPage for both
 *                    "+ Add Debit Note" (no initialValues) and row "Edit" (initialValues supplied).
 *                    Project options are scoped to the selected Client (cleared on client change).
 * Dependencies: Modal/ModalBody/ModalFooter, Input, Select, DatePicker, Button (ui),
 *               react-hook-form, zod, useClientOptions (Projects feature — shared Client picker),
 *               useProjectOptionsByClient (this module)
 * Export: DebitNoteFormModal
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
import { useProjectOptionsByClient } from '../hooks/useDebitNotes';
import type { DebitNote, DebitNoteFormValues } from '../../../types/debitNote.types';

const debitNoteSchema = z.object({
  clientId: z.string().min(1, 'Select a client'),
  projectId: z.string().optional(),
  invoiceRef: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  reason: z.string().min(1, 'Reason is required'),
  amount: z.number().positive('Enter a valid amount'),
  status: z.enum(['Open', 'Applied', 'Cancelled']),
  notes: z.string(),
});

export interface DebitNoteFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debitNote?: DebitNote;
  onSubmit: (values: DebitNoteFormValues) => void;
  isSubmitting?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'Open', label: 'Open' },
  { value: 'Applied', label: 'Applied' },
  { value: 'Cancelled', label: 'Cancelled' },
];

const EMPTY_VALUES: DebitNoteFormValues = {
  clientId: '',
  projectId: '',
  invoiceRef: '',
  date: '',
  reason: '',
  amount: 0,
  status: 'Open',
  notes: '',
};

export function DebitNoteFormModal({ open, onOpenChange, debitNote, onSubmit, isSubmitting }: DebitNoteFormModalProps) {
  const isEdit = !!debitNote;
  const clientOptionsQuery = useClientOptions();

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DebitNoteFormValues>({
    resolver: zodResolver(debitNoteSchema),
    defaultValues: EMPTY_VALUES,
  });

  const watchedClientId = watch('clientId');
  const projectOptionsQuery = useProjectOptionsByClient(watchedClientId || undefined);

  useEffect(() => {
    if (open) {
      reset(
        debitNote
          ? {
              clientId: debitNote.clientId,
              projectId: debitNote.projectId ?? '',
              invoiceRef: debitNote.invoiceRef ?? '',
              date: debitNote.date,
              reason: debitNote.reason,
              amount: debitNote.amount,
              status: debitNote.status,
              notes: debitNote.notes,
            }
          : EMPTY_VALUES
      );
    }
  }, [open, debitNote, reset]);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit Debit Note' : 'Add Debit Note'}
      description={isEdit ? "Update this debit note's details." : 'Raise a debit note for extra scope, price corrections, or pass-through costs.'}
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
            <DatePicker label="Date" required error={errors.date?.message} {...register('date')} />
            <Input label="Against Invoice No (optional)" placeholder="e.g. INV-2025-1002" {...register('invoiceRef')} />
          </div>

          <Input label="Reason" required placeholder="Why this debit note is being raised" error={errors.reason?.message} {...register('reason')} />

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
            {isEdit ? 'Save Changes' : 'Add Debit Note'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
