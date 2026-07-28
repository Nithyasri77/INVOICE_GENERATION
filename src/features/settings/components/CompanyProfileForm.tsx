/**
 * Purpose: Company Profile settings form (BRD: Settings — Company Profile)
 * Responsibilities: Edit + save company name/contact/address independently of other sections
 * Dependencies: Input, Button (ui), react-hook-form, useSettings hooks
 * Export: CompanyProfileForm
 */
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody } from '../../../components/ui/Card';
import { toast } from '../../../components/ui/Toast';
import { useUpdateCompanyProfile } from '../hooks/useSettings';
import type { CompanyProfile } from '../../../types/settings.types';

export function CompanyProfileForm({ initialValues }: { initialValues: CompanyProfile }) {
  const { register, handleSubmit, reset } = useForm<CompanyProfile>({ defaultValues: initialValues });
  const updateCompanyProfile = useUpdateCompanyProfile();

  useEffect(() => reset(initialValues), [initialValues, reset]);

  function onSubmit(values: CompanyProfile) {
    updateCompanyProfile.mutate(values, {
      onSuccess: () => toast.success('Company profile updated'),
      onError: () => toast.error('Failed to update company profile'),
    });
  }

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Company Name" required {...register('companyName')} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Contact Person" required {...register('contactPerson')} />
            <Input label="Phone" required {...register('phone')} />
          </div>
          <Input label="Email" required type="email" {...register('email')} />
          <Input label="Address" required {...register('address')} />
          <div className="flex justify-end">
            <Button type="submit" isLoading={updateCompanyProfile.isPending}>
              Save Company Profile
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
