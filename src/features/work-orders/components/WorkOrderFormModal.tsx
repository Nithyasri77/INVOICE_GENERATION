import { useEffect } from 'react';
import { useFieldArray, useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, ModalBody, ModalFooter } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { DatePicker } from '../../../components/ui/DatePicker';
import { Button } from '../../../components/ui/Button';
import { useClientOptions } from '../../projects/hooks/useProjects';
import { useProjectOptionsByClient, useQuotationOptionsByClient } from '../hooks/useWorkOrders';
import type { WorkOrder, WorkOrderFormValues } from '../../../types/workOrder.types';
import { Plus, Trash2 } from 'lucide-react';

const paymentScheduleSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1, 'Description is required'),
  percentage: z.coerce.number().optional(),
  amount: z.coerce.number().positive('Amount must be positive'),
  dueDate: z.string().optional(),
});

const workOrderSchema = z.object({
  clientId: z.string().min(1, 'Select a client'),
  quotationId: z.string().optional(),
  projectId: z.string().optional(),
  scopeOfWork: z.string().min(1, 'Scope of work is required'),
  projectValue: z.coerce.number().positive('Project value must be positive'),
  startDate: z.string().min(1, 'Start date is required'),
  expectedEndDate: z.string().optional(),
  paymentSchedule: z.array(paymentScheduleSchema).optional().default([]),
  status: z.enum(['Draft', 'Sent', 'Signed', 'Active', 'Completed']),
  attachmentRef: z.string().optional(),
  notes: z.string(),
});

export interface WorkOrderFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrder?: WorkOrder;
  onSubmit: (values: WorkOrderFormValues) => void;
  isSubmitting?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Sent', label: 'Sent' },
  { value: 'Signed', label: 'Signed' },
  { value: 'Active', label: 'Active' },
  { value: 'Completed', label: 'Completed' },
];

const EMPTY_VALUES: WorkOrderFormValues = {
  clientId: '',
  quotationId: '',
  projectId: '',
  scopeOfWork: '',
  projectValue: 0,
  startDate: '',
  expectedEndDate: '',
  paymentSchedule: [],
  status: 'Draft',
  attachmentRef: '',
  notes: '',
};

export function WorkOrderFormModal({ open, onOpenChange, workOrder, onSubmit, isSubmitting }: WorkOrderFormModalProps) {
  const isEdit = !!workOrder;
  const clientOptionsQuery = useClientOptions();

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderSchema as any),
    defaultValues: EMPTY_VALUES,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'paymentSchedule' });
  const watchedClientId = watch('clientId');
  const watchedProjectValue = watch('projectValue');
  const watchedPaymentSchedule = watch('paymentSchedule') || [];
  const projectOptionsQuery = useProjectOptionsByClient(watchedClientId || undefined);
  const quotationOptionsQuery = useQuotationOptionsByClient(watchedClientId || undefined);

  useEffect(() => {
    if (open) {
      reset(
        workOrder
          ? {
              clientId: workOrder.clientId,
              quotationId: workOrder.quotationId ?? '',
              projectId: workOrder.projectId ?? '',
              scopeOfWork: workOrder.scopeOfWork,
              projectValue: workOrder.projectValue,
              startDate: workOrder.startDate,
              expectedEndDate: workOrder.expectedEndDate ?? '',
              paymentSchedule: workOrder.paymentSchedule,
              status: workOrder.status,
              attachmentRef: workOrder.attachmentRef ?? '',
              notes: workOrder.notes,
            }
          : EMPTY_VALUES
      );
    }
  }, [open, workOrder, reset]);

  const scheduleTotal = watchedPaymentSchedule.reduce((sum, row) => sum + (row.amount || 0), 0);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit Work Order / SOW' : 'Add Work Order / SOW'}
      description={isEdit ? 'Update the work order scope, value, and payment terms.' : 'Capture project scope, value, and payment milestones for a client engagement.'}
      size="xl"
    >
      <form onSubmit={handleSubmit((values) => onSubmit(values as WorkOrderFormValues))}>
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
                  onValueChange={(value) => {
                    field.onChange(value);
                    setValue('quotationId', '');
                    setValue('projectId', '');
                  }}
                  error={errors.clientId?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select label="Status" required options={STATUS_OPTIONS} value={field.value} onValueChange={field.onChange} />
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              control={control}
              name="quotationId"
              render={({ field }) => (
                <Select
                  label="Quotation (optional)"
                  placeholder={!watchedClientId ? 'Select client first' : 'Select a quotation'}
                  options={quotationOptionsQuery.data ?? []}
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!watchedClientId}
                />
              )}
            />
            <Controller
              control={control}
              name="projectId"
              render={({ field }) => (
                <Select
                  label="Project (optional)"
                  placeholder={!watchedClientId ? 'Select client first' : 'Select an existing project'}
                  options={projectOptionsQuery.data ?? []}
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!watchedClientId}
                />
              )}
            />
          </div>

          <Input label="Scope of Work" required placeholder="Describe the deliverables and responsibilities" error={errors.scopeOfWork?.message} {...register('scopeOfWork')} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Project Value (₹)"
              required
              type="number"
              min={0}
              placeholder="e.g. 850000"
              error={errors.projectValue?.message}
              {...register('projectValue', { valueAsNumber: true })}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DatePicker label="Start Date" required error={errors.startDate?.message} {...register('startDate')} />
              <DatePicker label="Expected End Date" error={errors.expectedEndDate?.message} {...register('expectedEndDate')} />
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-surface-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-ink-900">Payment Schedule</p>
                <p className="text-xs text-ink-500">Add milestones and amounts. The total is shown for quick review.</p>
              </div>
              <Button type="button" variant="secondary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => append({ id: `${Date.now()}`, description: '', amount: 0, dueDate: '' })}>
                Add Row
              </Button>
            </div>

            <div className="text-xs text-ink-600">
              Schedule total: ₹{scheduleTotal.toLocaleString()} / Project value: ₹{(watchedProjectValue || 0).toLocaleString()}
            </div>

            {fields.length === 0 ? (
              <p className="text-sm text-ink-500">No payment schedule rows yet. Add one to track milestones or invoices.</p>
            ) : (
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 gap-3 rounded-lg border border-surface-border p-3 md:grid-cols-[1.3fr_0.7fr_0.7fr_auto]">
                    <Input
                      label="Description"
                      placeholder="Advance / UAT sign-off"
                      {...register(`paymentSchedule.${index}.description` as const)}
                    />
                    <Input
                      label="%"
                      type="number"
                      min={0}
                      max={100}
                      placeholder="20"
                      {...register(`paymentSchedule.${index}.percentage`, { valueAsNumber: true })}
                    />
                    <Input
                      label="Amount"
                      type="number"
                      min={0}
                      placeholder="100000"
                      {...register(`paymentSchedule.${index}.amount`, { valueAsNumber: true })}
                    />
                    <div className="flex items-end">
                      <DatePicker label="Due Date" {...register(`paymentSchedule.${index}.dueDate` as const)} />
                    </div>
                    <div className="md:col-span-4 flex justify-end">
                      <Button type="button" variant="secondary" size="sm" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => remove(index)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Attachment (filename or link)" placeholder="e.g. sow-client.pdf" {...register('attachmentRef')} />
            <Input label="Notes" placeholder="Additional context or approvals" {...register('notes')} />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Add Work Order'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
