/**
 * Purpose: Add/Edit Client popup form (BRD: Create Client / Edit Client fields)
 * Responsibilities: Validate + submit the Client form; used by ClientsListPage for both
 *                    "+ Add Client" (no initialValues) and row "Edit" (initialValues supplied)
 * Dependencies: Modal/ModalBody/ModalFooter, Input, Select, Button (ui), react-hook-form, zod
 * Export: ClientFormModal
 */
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, ModalBody, ModalFooter } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import type { Client, ClientFormValues } from '../../../types/client.types';

const clientSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  contactPerson: z.string().min(2, 'Contact person is required'),
  phone: z
    .string()
    .min(10, 'Enter a valid phone number')
    .regex(/^[+\d][\d\s-]*$/, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email'),
  gstNumber: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/, 'Enter a valid 15-character GST number'),
  address: z.string().min(5, 'Address is required'),
  status: z.enum(['Active', 'Inactive']),
});

export interface ClientFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client;
  onSubmit: (values: ClientFormValues) => void;
  isSubmitting?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

export function ClientFormModal({ open, onOpenChange, client, onSubmit, isSubmitting }: ClientFormModalProps) {
  const isEdit = !!client;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      companyName: '',
      contactPerson: '',
      phone: '',
      email: '',
      gstNumber: '',
      address: '',
      status: 'Active',
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        client
          ? {
              companyName: client.companyName,
              contactPerson: client.contactPerson,
              phone: client.phone,
              email: client.email,
              gstNumber: client.gstNumber,
              address: client.address,
              status: client.status,
            }
          : {
              companyName: '',
              contactPerson: '',
              phone: '',
              email: '',
              gstNumber: '',
              address: '',
              status: 'Active',
            }
      );
    }
  }, [open, client, reset]);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit Client' : 'Add Client'}
      description={isEdit ? 'Update this client\'s details.' : 'Add a new client company to Shine Craft.'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody className="space-y-4">
          <Input
            label="Company Name"
            required
            placeholder="e.g. Aravind Textiles Pvt Ltd"
            error={errors.companyName?.message}
            {...register('companyName')}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Contact Person"
              required
              placeholder="e.g. Aravind Kumar"
              error={errors.contactPerson?.message}
              {...register('contactPerson')}
            />
            <Input
              label="Phone"
              required
              placeholder="+91 98765 43210"
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Email"
              required
              type="email"
              placeholder="name@company.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="GST Number"
              required
              placeholder="33AAACA1234B1Z5"
              error={errors.gstNumber?.message}
              {...register('gstNumber')}
            />
          </div>
          <Input
            label="Address"
            required
            placeholder="Full billing address"
            error={errors.address?.message}
            {...register('address')}
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
            {isEdit ? 'Save Changes' : 'Add Client'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
