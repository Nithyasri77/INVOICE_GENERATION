/**
 * Purpose: GST Details settings form (BRD: Settings — GST Details)
 * Responsibilities: Edit + save GSTIN/PAN/state code independently of other sections
 * Dependencies: Input, Button (ui), react-hook-form, useSettings hooks
 * Export: GstDetailsForm
 */
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody } from '../../../components/ui/Card';
import { toast } from '../../../components/ui/Toast';
import { useUpdateGstDetails } from '../hooks/useSettings';
import type { GstDetails } from '../../../types/settings.types';

export function GstDetailsForm({ initialValues }: { initialValues: GstDetails }) {
  const { register, handleSubmit, reset } = useForm<GstDetails>({ defaultValues: initialValues });
  const updateGstDetails = useUpdateGstDetails();

  useEffect(() => reset(initialValues), [initialValues, reset]);

  function onSubmit(values: GstDetails) {
    updateGstDetails.mutate(values, {
      onSuccess: () => toast.success('GST details updated'),
      onError: () => toast.error('Failed to update GST details'),
    });
  }

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="GST Number" required {...register('gstNumber')} />
            <Input label="PAN Number" required {...register('panNumber')} />
          </div>
          <Input label="State Code" required {...register('stateCode')} />
          <div className="flex justify-end">
            <Button type="submit" isLoading={updateGstDetails.isPending}>
              Save GST Details
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
