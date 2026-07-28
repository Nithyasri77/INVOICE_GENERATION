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
import type { Msa, MsaFormValues } from '../../../types/msa.types';

const msaSchema = z.object({
  clientId: z.string().min(1, 'Select a client'),
  effectiveDate: z.string().min(1, 'Effective date is required'),
  endDate: z.string().optional(),
  paymentTerms: z.string().min(1, 'Payment terms are required'),
  governingLaw: z.string().optional(),
  terminationNoticeDays: z.number().int().positive().optional(),
  status: z.enum(['Draft', 'Sent', 'Signed', 'Expired']),
  attachmentRef: z.string().optional(),
  notes: z.string(),
});

export interface MsaFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  msa?: Msa;
  onSubmit: (values: MsaFormValues) => void;
  isSubmitting?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Sent', label: 'Sent' },
  { value: 'Signed', label: 'Signed' },
  { value: 'Expired', label: 'Expired' },
];

const EMPTY_VALUES: MsaFormValues = {
  clientId: '',
  effectiveDate: '',
  endDate: '',
  paymentTerms: '',
  governingLaw: '',
  terminationNoticeDays: undefined,
  status: 'Draft',
  attachmentRef: '',
  notes: '',
};

export function MsaFormModal({ open, onOpenChange, msa, onSubmit, isSubmitting }: MsaFormModalProps) {
  const isEdit = !!msa;
  const clientOptionsQuery = useClientOptions();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MsaFormValues>({
    resolver: zodResolver(msaSchema as any),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(
        msa
          ? {
              clientId: msa.clientId,
              effectiveDate: msa.effectiveDate,
              endDate: msa.endDate ?? '',
              paymentTerms: msa.paymentTerms,
              governingLaw: msa.governingLaw ?? '',
              terminationNoticeDays: msa.terminationNoticeDays,
              status: msa.status,
              attachmentRef: msa.attachmentRef ?? '',
              notes: msa.notes,
            }
          : EMPTY_VALUES
      );
    }
  }, [open, msa, reset]);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit MSA' : 'Add MSA'}
      description={isEdit ? 'Update the legal commercial terms record.' : 'Capture the master services agreement for a client.'}
      size="md"
    >
      <form onSubmit={handleSubmit((values) => onSubmit(values as MsaFormValues))}>
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
            <DatePicker label="Effective Date" required error={errors.effectiveDate?.message} {...register('effectiveDate')} />
            <DatePicker label="End Date" error={errors.endDate?.message} {...register('endDate')} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Payment Terms" required placeholder="e.g. Net 30" error={errors.paymentTerms?.message} {...register('paymentTerms')} />
            <Input label="Termination Notice Days" type="number" min={0} placeholder="e.g. 30" error={errors.terminationNoticeDays?.message} {...register('terminationNoticeDays', { valueAsNumber: true })} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Governing Law" placeholder="e.g. Chennai jurisdiction" {...register('governingLaw')} />
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select label="Status" required options={STATUS_OPTIONS} value={field.value} onValueChange={field.onChange} />
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Attachment (filename or link)" placeholder="e.g. msa-client.pdf" {...register('attachmentRef')} />
            <Input label="Notes" placeholder="Any additional legal notes" {...register('notes')} />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Add MSA'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
