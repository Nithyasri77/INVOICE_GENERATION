/**
 * Purpose: Create/Edit AMC Contract modal — single component handles both modes via `contract` prop
 * Responsibilities: RHF + Zod validated form matching the module spec's fields; calls
 *                    useCreateAmcContract or useUpdateAmcContract depending on mode
 * Dependencies: react-hook-form, zod resolver, Modal, Input, Select, DatePicker, Button,
 *               amcContractSchema, AMC_STATUS_OPTIONS/AMC_MANAGER_OPTIONS, CLIENT_PROJECT_OPTIONS,
 *               useCreateAmcContract/useUpdateAmcContract
 * Export: AmcContractFormModal
 */
import { useEffect, useMemo } from 'react';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal, ModalBody, ModalFooter } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { DatePicker } from '../../../components/ui/DatePicker';
import { Button } from '../../../components/ui/Button';
import { amcContractSchema, type AmcContractFormValues } from '../schemas/amcContractSchema';
import { AMC_STATUS_OPTIONS, AMC_MANAGER_OPTIONS } from '../../../constants/amcOptions';
import { CLIENT_PROJECT_OPTIONS } from '../../../services/amcService';
import { useCreateAmcContract, useUpdateAmcContract } from '../hooks/useAmcContracts';
import type { AmcContract } from '../../../types/amc.types';

export interface AmcContractFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass an existing contract to edit; omit to create */
  contract?: AmcContract;
  onSuccess?: () => void;
}

const EMPTY_VALUES: AmcContractFormValues = {
  clientName: '',
  projectName: '',
  contractValue: 0,
  startDate: '',
  endDate: '',
  renewalDate: '',
  status: 'Active',
  assignedManager: '',
  notes: '',
};

const CLIENT_OPTIONS = CLIENT_PROJECT_OPTIONS.map((o) => ({ value: o.clientName, label: o.clientName }));

export function AmcContractFormModal({ open, onOpenChange, contract, onSuccess }: AmcContractFormModalProps) {
  const isEditMode = !!contract;
  const createContract = useCreateAmcContract();
  const updateContract = useUpdateAmcContract();

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AmcContractFormValues>({
    resolver: zodResolver(amcContractSchema) as Resolver<AmcContractFormValues>,
    defaultValues: EMPTY_VALUES,
  });

  const selectedClient = watch('clientName');

  // Project options narrow to whichever client is selected — mirrors Client → Project business flow
  const projectOptions = useMemo(
    () =>
      CLIENT_PROJECT_OPTIONS.filter((o) => o.clientName === selectedClient).map((o) => ({
        value: o.projectName,
        label: o.projectName,
      })),
    [selectedClient]
  );

  useEffect(() => {
    if (open) {
      reset(
        contract
          ? {
              clientName: contract.clientName,
              projectName: contract.projectName,
              contractValue: contract.contractValue,
              startDate: contract.startDate,
              endDate: contract.endDate,
              renewalDate: contract.renewalDate,
              status: contract.status,
              assignedManager: contract.assignedManager,
              notes: contract.notes ?? '',
            }
          : EMPTY_VALUES
      );
    }
  }, [open, contract, reset]);

  const isSubmitting = createContract.isPending || updateContract.isPending;

  const onSubmit = handleSubmit(async (values) => {
    if (isEditMode && contract) {
      await updateContract.mutateAsync({ id: contract.id, input: values });
    } else {
      await createContract.mutateAsync(values);
    }
    onOpenChange(false);
    onSuccess?.();
  });

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEditMode ? 'Edit AMC Contract' : 'Create AMC Contract'}
      description={isEditMode ? contract?.amcNumber : 'Add a new Annual Maintenance Contract.'}
      size="lg"
    >
      <form onSubmit={onSubmit}>
        <ModalBody className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              control={control}
              name="clientName"
              render={({ field }) => (
                <Select
                  label="Client"
                  required
                  options={CLIENT_OPTIONS}
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Reset project when client changes since the options are client-scoped
                    setValue('projectName', '');
                  }}
                  error={errors.clientName?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="projectName"
              render={({ field }) => (
                <Select
                  label="Project"
                  required
                  options={projectOptions}
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!selectedClient}
                  placeholder={selectedClient ? 'Select a project' : 'Select a client first'}
                  error={errors.projectName?.message}
                />
              )}
            />

            <Input
              label="Contract Value (₹)"
              type="number"
              required
              error={errors.contractValue?.message}
              {...register('contractValue')}
            />

            <Controller
              control={control}
              name="assignedManager"
              render={({ field }) => (
                <Select
                  label="Assigned Manager"
                  required
                  options={AMC_MANAGER_OPTIONS}
                  value={field.value}
                  onValueChange={field.onChange}
                  error={errors.assignedManager?.message}
                />
              )}
            />

            <DatePicker label="Start Date" required error={errors.startDate?.message} {...register('startDate')} />
            <DatePicker label="End Date" required error={errors.endDate?.message} {...register('endDate')} />
            <DatePicker label="Renewal Date" required error={errors.renewalDate?.message} {...register('renewalDate')} />

            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select
                  label="Status"
                  required
                  options={AMC_STATUS_OPTIONS}
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
              placeholder="Any additional context about this contract..."
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
            {isEditMode ? 'Save Changes' : 'Create Contract'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
