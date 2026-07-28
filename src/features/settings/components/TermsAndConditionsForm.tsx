/**
 * Purpose: Terms & Conditions settings form (BRD: Settings — Terms & Conditions)
 * Responsibilities: Edit + save the standard terms printed on invoices and quotations,
 *                    independently of other sections
 * Dependencies: Textarea, Button (ui), react-hook-form, useSettings hooks
 * Export: TermsAndConditionsForm
 */
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody } from '../../../components/ui/Card';
import { toast } from '../../../components/ui/Toast';
import { useUpdateTermsAndConditions } from '../hooks/useSettings';
import type { TermsAndConditions } from '../../../types/settings.types';

export function TermsAndConditionsForm({ initialValues }: { initialValues: TermsAndConditions }) {
  const { register, handleSubmit, reset } = useForm<TermsAndConditions>({ defaultValues: initialValues });
  const updateTerms = useUpdateTermsAndConditions();

  useEffect(() => reset(initialValues), [initialValues, reset]);

  function onSubmit(values: TermsAndConditions) {
    updateTerms.mutate(values, {
      onSuccess: () => toast.success('Terms & conditions updated'),
      onError: () => toast.error('Failed to update terms & conditions'),
    });
  }

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Textarea label="Invoice Terms" required rows={5} {...register('invoiceTerms')} />
          <Textarea label="Quotation Terms" required rows={5} {...register('quotationTerms')} />
          <div className="flex justify-end">
            <Button type="submit" isLoading={updateTerms.isPending}>
              Save Terms &amp; Conditions
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
