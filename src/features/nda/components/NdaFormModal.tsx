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
import type { Nda, NdaFormValues } from '../../../types/nda.types';

const ndaSchema = z.object({
  clientId: z.string().min(1, 'Select a client'),
  signedDate: z.string().min(1, 'Signed date is required'),
  expiryDate: z.string().optional(),
  status: z.enum(['Draft', 'Sent', 'Signed', 'Expired']),
  attachmentRef: z.string().optional(),
  notes: z.string(),
});

export interface NdaFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nda?: Nda;
  onSubmit: (values: NdaFormValues) => void;
  isSubmitting?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Sent', label: 'Sent' },
  { value: 'Signed', label: 'Signed' },
  { value: 'Expired', label: 'Expired' },
];

const EMPTY_VALUES: NdaFormValues = {
  clientId: '',
  signedDate: '',
  expiryDate: '',
  status: 'Draft',
  attachmentRef: '',
  notes: '',
};

export function NdaFormModal({ open, onOpenChange, nda, onSubmit, isSubmitting }: NdaFormModalProps) {
  const isEdit = !!nda;
  const clientOptionsQuery = useClientOptions();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NdaFormValues>({
    resolver: zodResolver(ndaSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(
        nda
          ? {
              clientId: nda.clientId,
              signedDate: nda.signedDate,
              expiryDate: nda.expiryDate ?? '',
              status: nda.status,
              attachmentRef: nda.attachmentRef ?? '',
              notes: nda.notes,
            }
          : EMPTY_VALUES
      );
    }
  }, [open, nda, reset]);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit NDA' : 'Add NDA'}
      description={isEdit ? 'Update the NDA record and tracking details.' : 'Track a client NDA from drafting through signature.'}
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
            <DatePicker label="Signed Date" required error={errors.signedDate?.message} {...register('signedDate')} />
            <DatePicker label="Expiry Date" error={errors.expiryDate?.message} {...register('expiryDate')} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select label="Status" required options={STATUS_OPTIONS} value={field.value} onValueChange={field.onChange} />
              )}
            />
            <Input label="Attachment (filename or link)" placeholder="e.g. nda-client.pdf" {...register('attachmentRef')} />
          </div>

          <Input label="Notes" placeholder="Any additional tracking notes" {...register('notes')} />
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Add NDA'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
