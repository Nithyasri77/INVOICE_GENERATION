/**
 * Purpose: Add/Edit Credit Note popup form
 * Responsibilities: Validate + submit the Credit Note form; used by CreditNotesListPage for both
 *                    "+ Add Credit Note" (no initialValues) and row "Edit" (initialValues supplied).
 *                    Project options are scoped to the selected Client (cleared on client change).
 * Dependencies: Modal/ModalBody/ModalFooter, Input, Select, DatePicker, Button (ui),
 *               react-hook-form, zod, useClientOptions (Projects feature — shared Client picker),
 *               useProjectOptionsByClient (this module)
 * Export: CreditNoteFormModal
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
import { useProjectOptionsByClient } from '../hooks/useCreditNotes';
import type { CreditNote, CreditNoteFormValues } from '../../../types/creditNote.types';

const creditNoteSchema = z.object({
  clientId: z.string().min(1, 'Select a client'),
  projectId: z.string().optional(),
  invoiceRef: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  reason: z.string().min(1, 'Reason is required'),
  amount: z.number().positive('Enter a valid amount'),
  status: z.enum(['Open', 'Applied', 'Cancelled']),
  notes: z.string(),
});

export interface CreditNoteFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creditNote?: CreditNote;
  onSubmit: (values: CreditNoteFormValues) => void;
  isSubmitting?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'Open', label: 'Open' },
  { value: 'Applied', label: 'Applied' },
  { value: 'Cancelled', label: 'Cancelled' },
];

const EMPTY_VALUES: CreditNoteFormValues = {
  clientId: '',
  projectId: '',
  invoiceRef: '',
  date: '',
  reason: '',
  amount: 0,
  status: 'Open',
  notes: '',
};

export function CreditNoteFormModal({ open, onOpenChange, creditNote, onSubmit, isSubmitting }: CreditNoteFormModalProps) {
  const isEdit = !!creditNote;
  const clientOptionsQuery = useClientOptions();

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreditNoteFormValues>({
    resolver: zodResolver(creditNoteSchema),
    defaultValues: EMPTY_VALUES,
  });

  const watchedClientId = watch('clientId');
  const projectOptionsQuery = useProjectOptionsByClient(watchedClientId || undefined);

  useEffect(() => {
    if (open) {
      reset(
        creditNote
          ? {
              clientId: creditNote.clientId,
              projectId: creditNote.projectId ?? '',
              invoiceRef: creditNote.invoiceRef ?? '',
              date: creditNote.date,
              reason: creditNote.reason,
              amount: creditNote.amount,
              status: creditNote.status,
              notes: creditNote.notes,
            }
          : EMPTY_VALUES
      );
    }
  }, [open, creditNote, reset]);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit Credit Note' : 'Add Credit Note'}
      description={isEdit ? "Update this credit note's details." : 'Issue a credit note for a discount, refund, or billing correction.'}
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

          <Input label="Reason" required placeholder="Why this credit note is being issued" error={errors.reason?.message} {...register('reason')} />

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
            {isEdit ? 'Save Changes' : 'Add Credit Note'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
