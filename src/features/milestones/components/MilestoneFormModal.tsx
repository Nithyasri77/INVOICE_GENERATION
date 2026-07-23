/**
 * Purpose: Create/Edit Milestone popup form (BRD: Create Milestone Popup Fields)
 * Responsibilities: Validate + submit the Milestone form; used by the Project Detail page's
 *                    Milestones tab for both "+ Add Milestone" (no initialValues) and row "Edit"
 * Dependencies: Modal/ModalBody/ModalFooter, Input, Select, DatePicker, Button (ui),
 *               react-hook-form, zod
 * Export: MilestoneFormModal
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
import type { Milestone, MilestoneFormValues } from '../../../types/milestone.types';

const milestoneSchema = z.object({
  milestoneName: z.string().min(2, 'Milestone name is required'),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Enter a valid amount'),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.enum(['Not Started', 'In Progress', 'Invoice Raised', 'Paid', 'Completed']),
  linkedDeliverable: z.string().min(1, 'Linked deliverable is required'),
});

export interface MilestoneFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  milestone?: Milestone;
  onSubmit: (values: MilestoneFormValues) => void;
  isSubmitting?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'Not Started', label: 'Not Started' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Invoice Raised', label: 'Invoice Raised' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Completed', label: 'Completed' },
];

const EMPTY_VALUES: MilestoneFormValues = {
  milestoneName: '',
  description: '',
  amount: 0,
  dueDate: '',
  status: 'Not Started',
  linkedDeliverable: '',
};

export function MilestoneFormModal({
  open,
  onOpenChange,
  projectName,
  milestone,
  onSubmit,
  isSubmitting,
}: MilestoneFormModalProps) {
  const isEdit = !!milestone;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MilestoneFormValues>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(
        milestone
          ? {
              milestoneName: milestone.milestoneName,
              description: milestone.description,
              amount: milestone.amount,
              dueDate: milestone.dueDate,
              status: milestone.status,
              linkedDeliverable: milestone.linkedDeliverable,
            }
          : EMPTY_VALUES
      );
    }
  }, [open, milestone, reset]);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit Milestone' : 'Create Milestone'}
      description={`Project: ${projectName}`}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody className="space-y-4">
          <Input
            label="Milestone Name"
            required
            placeholder="e.g. UAT Sign-off"
            error={errors.milestoneName?.message}
            {...register('milestoneName')}
          />
          <Input
            label="Description"
            required
            placeholder="What this milestone covers"
            error={errors.description?.message}
            {...register('description')}
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
            <DatePicker label="Due Date" required error={errors.dueDate?.message} {...register('dueDate')} />
          </div>
          <Input
            label="Linked Deliverable"
            required
            placeholder="e.g. UAT Sign-off Document"
            error={errors.linkedDeliverable?.message}
            {...register('linkedDeliverable')}
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
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Create Milestone'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
