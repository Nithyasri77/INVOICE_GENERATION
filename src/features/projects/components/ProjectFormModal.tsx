/**
 * Purpose: Add/Edit Project popup form (BRD: Projects Module Fields)
 * Responsibilities: Validate + submit the Project form; used by ProjectsListPage for both
 *                    "+ Add Project" (no initialValues) and row "Edit" (initialValues supplied)
 * Dependencies: Modal/ModalBody/ModalFooter, Input, Select, DatePicker, Button (ui),
 *               react-hook-form, zod, useClientOptions
 * Export: ProjectFormModal
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
import { useClientOptions } from '../hooks/useProjects';
import type { Project, ProjectFormValues } from '../../../types/project.types';

const projectSchema = z
  .object({
    projectName: z.string().min(2, 'Project name is required'),
    clientId: z.string().min(1, 'Select a client'),
    quotationNo: z.string().min(1, 'Quotation number is required'),
    msaNo: z.string().min(1, 'MSA number is required'),
    projectValue: z.number().positive('Enter a valid project value'),
    startDate: z.string().min(1, 'Start date is required'),
    expectedDelivery: z.string().min(1, 'Expected delivery date is required'),
    status: z.enum(['Development', 'UAT', 'Live', 'On Hold', 'Completed']),
    projectManager: z.string().min(2, 'Project manager is required'),
  })
  .refine((data) => new Date(data.expectedDelivery) >= new Date(data.startDate), {
    message: 'Expected delivery must be on or after the start date',
    path: ['expectedDelivery'],
  });

export interface ProjectFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project;
  onSubmit: (values: ProjectFormValues) => void;
  isSubmitting?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'Development', label: 'Development' },
  { value: 'UAT', label: 'UAT' },
  { value: 'Live', label: 'Live' },
  { value: 'On Hold', label: 'On Hold' },
  { value: 'Completed', label: 'Completed' },
];

const EMPTY_VALUES: ProjectFormValues = {
  projectName: '',
  clientId: '',
  quotationNo: '',
  msaNo: '',
  projectValue: 0,
  startDate: '',
  expectedDelivery: '',
  status: 'Development',
  projectManager: '',
};

export function ProjectFormModal({ open, onOpenChange, project, onSubmit, isSubmitting }: ProjectFormModalProps) {
  const isEdit = !!project;
  const clientOptionsQuery = useClientOptions();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(
        project
          ? {
              projectName: project.projectName,
              clientId: project.clientId,
              quotationNo: project.quotationNo,
              msaNo: project.msaNo,
              projectValue: project.projectValue,
              startDate: project.startDate,
              expectedDelivery: project.expectedDelivery,
              status: project.status,
              projectManager: project.projectManager,
            }
          : EMPTY_VALUES
      );
    }
  }, [open, project, reset]);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit Project' : 'Add Project'}
      description={isEdit ? "Update this project's details." : 'Create a new project linked to a client.'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Project Name"
              required
              placeholder="e.g. ERP Revamp — Phase 1"
              error={errors.projectName?.message}
              {...register('projectName')}
            />
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
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Quotation No"
              required
              placeholder="e.g. QT-2025-011"
              error={errors.quotationNo?.message}
              {...register('quotationNo')}
            />
            <Input
              label="MSA No"
              required
              placeholder="e.g. MSA-2025-004"
              error={errors.msaNo?.message}
              {...register('msaNo')}
            />
          </div>

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
            <Input
              label="Project Manager"
              required
              placeholder="e.g. Priya Venkatesh"
              error={errors.projectManager?.message}
              {...register('projectManager')}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DatePicker
              label="Start Date"
              required
              error={errors.startDate?.message}
              {...register('startDate')}
            />
            <DatePicker
              label="Expected Delivery"
              required
              error={errors.expectedDelivery?.message}
              {...register('expectedDelivery')}
            />
          </div>

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
            {isEdit ? 'Save Changes' : 'Add Project'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
