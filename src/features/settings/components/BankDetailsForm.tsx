/**
 * Purpose: Bank Details settings form (BRD: Settings — Bank Details)
 * Responsibilities: Edit + save bank account details shown on invoices, independently of other
 *                    sections
 * Dependencies: Input, Button (ui), react-hook-form, useSettings hooks
 * Export: BankDetailsForm
 */
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody } from '../../../components/ui/Card';
import { toast } from '../../../components/ui/Toast';
import { useUpdateBankDetails } from '../hooks/useSettings';
import type { BankDetails } from '../../../types/settings.types';

export function BankDetailsForm({ initialValues }: { initialValues: BankDetails }) {
  const { register, handleSubmit, reset } = useForm<BankDetails>({ defaultValues: initialValues });
  const updateBankDetails = useUpdateBankDetails();

  useEffect(() => reset(initialValues), [initialValues, reset]);

  function onSubmit(values: BankDetails) {
    updateBankDetails.mutate(values, {
      onSuccess: () => toast.success('Bank details updated'),
      onError: () => toast.error('Failed to update bank details'),
    });
  }

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Bank Name" required {...register('bankName')} />
            <Input label="Account Holder Name" required {...register('accountHolderName')} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Account Number" required {...register('accountNumber')} />
            <Input label="IFSC Code" required {...register('ifscCode')} />
          </div>
          <Input label="Branch" required {...register('branch')} />
          <div className="flex justify-end">
            <Button type="submit" isLoading={updateBankDetails.isPending}>
              Save Bank Details
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
