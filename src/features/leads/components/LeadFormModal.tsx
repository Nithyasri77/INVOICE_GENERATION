/**
 * Purpose: Create/Edit Lead modal — single component handles both modes via `lead` prop
 * Responsibilities: RHF + Zod validated form matching the BRD's Create/Edit Lead fields;
 *                    calls useCreateLead or useUpdateLead depending on mode
 * Dependencies: react-hook-form, zod resolver, Modal, Input, Select, Button, leadSchema,
 *               LEAD_STATUS_OPTIONS/LEAD_SOURCE_OPTIONS, useCreateLead/useUpdateLead
 * Export: LeadFormModal
 */
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal, ModalBody, ModalFooter } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { leadSchema, type LeadFormValues } from '../schemas/leadSchema';
import { LEAD_STATUS_OPTIONS, LEAD_SOURCE_OPTIONS } from '../../../constants/leadOptions';
import { useCreateLead, useUpdateLead } from '../hooks/useLeads';
import type { Lead } from '../../../types/lead.types';

export interface LeadFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass an existing lead to edit; omit to create */
  lead?: Lead;
  onSuccess?: () => void;
}

const EMPTY_VALUES: LeadFormValues = {
  companyName: '',
  contactPerson: '',
  phone: '',
  email: '',
  source: 'Website',
  assignedTo: '',
  status: 'New',
  notes: '',
};

// TODO: replace with a real team-member lookup (Settings > Users) once that module exists
const ASSIGNEE_OPTIONS = [
  { value: 'Ajith Kumar', label: 'Ajith Kumar' },
  { value: 'Priya Nair', label: 'Priya Nair' },
];

export function LeadFormModal({ open, onOpenChange, lead, onSuccess }: LeadFormModalProps) {
  const isEditMode = !!lead;
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(
        lead
          ? {
              companyName: lead.companyName,
              contactPerson: lead.contactPerson,
              phone: lead.phone,
              email: lead.email,
              source: lead.source,
              assignedTo: lead.assignedTo,
              status: lead.status,
              notes: lead.notes ?? '',
            }
          : EMPTY_VALUES
      );
    }
  }, [open, lead, reset]);

  const isSubmitting = createLead.isPending || updateLead.isPending;

  const onSubmit = handleSubmit(async (values) => {
    if (isEditMode && lead) {
      await updateLead.mutateAsync({ id: lead.id, input: values });
    } else {
      await createLead.mutateAsync(values);
    }
    onOpenChange(false);
    onSuccess?.();
  });

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEditMode ? 'Edit Lead' : 'Create Lead'}
      description={isEditMode ? `${lead?.leadNumber}` : 'Add a new potential customer to the pipeline.'}
      size="lg"
    >
      <form onSubmit={onSubmit}>
        <ModalBody className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Company Name" required error={errors.companyName?.message} {...register('companyName')} />
            <Input label="Contact Person" required error={errors.contactPerson?.message} {...register('contactPerson')} />
            <Input label="Phone" required error={errors.phone?.message} {...register('phone')} />
            <Input label="Email" type="email" required error={errors.email?.message} {...register('email')} />

            <Controller
              control={control}
              name="source"
              render={({ field }) => (
                <Select
                  label="Lead Source"
                  required
                  options={LEAD_SOURCE_OPTIONS}
                  value={field.value}
                  onValueChange={field.onChange}
                  error={errors.source?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="assignedTo"
              render={({ field }) => (
                <Select
                  label="Assigned To"
                  required
                  options={ASSIGNEE_OPTIONS}
                  value={field.value}
                  onValueChange={field.onChange}
                  error={errors.assignedTo?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select
                  label="Status"
                  required
                  options={LEAD_STATUS_OPTIONS}
                  value={field.value}
                  onValueChange={field.onChange}
                  error={errors.status?.message}
                />
              )}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Notes</label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500"
              placeholder="Any additional context about this lead..."
              {...register('notes')}
            />
            {errors.notes && <p className="mt-1.5 text-xs text-danger-600">{errors.notes.message}</p>}
          </div>
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditMode ? 'Save Changes' : 'Create Lead'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
