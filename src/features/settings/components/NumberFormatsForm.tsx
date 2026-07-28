/**
 * Purpose: Invoice Number Format + Receipt Number Format settings form (BRD: Settings)
 * Responsibilities: Edit + save the numbering pattern and next sequence number for invoices and
 *                    receipts, independently of other sections
 * Dependencies: Input, Button (ui), react-hook-form, useSettings hooks
 * Export: NumberFormatsForm
 */
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody } from '../../../components/ui/Card';
import { toast } from '../../../components/ui/Toast';
import { useUpdateNumberFormats } from '../hooks/useSettings';
import type { NumberFormatSettings } from '../../../types/settings.types';

export function NumberFormatsForm({ initialValues }: { initialValues: NumberFormatSettings }) {
  const { register, handleSubmit, reset } = useForm<NumberFormatSettings>({ defaultValues: initialValues });
  const updateNumberFormats = useUpdateNumberFormats();

  useEffect(() => reset(initialValues), [initialValues, reset]);

  function onSubmit(values: NumberFormatSettings) {
    updateNumberFormats.mutate(
      { ...values, invoiceNumberNext: Number(values.invoiceNumberNext), receiptNumberNext: Number(values.receiptNumberNext) },
      {
        onSuccess: () => toast.success('Number formats updated'),
        onError: () => toast.error('Failed to update number formats'),
      }
    );
  }

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Invoice Number Format"
              required
              helperText="Use {YYYY} for year and {SEQ} for the running sequence"
              {...register('invoiceNumberFormat')}
            />
            <Input
              label="Next Invoice Sequence"
              required
              type="number"
              min={1}
              {...register('invoiceNumberNext', { valueAsNumber: true })}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Receipt Number Format"
              required
              helperText="Use {SEQ} for the running sequence"
              {...register('receiptNumberFormat')}
            />
            <Input
              label="Next Receipt Sequence"
              required
              type="number"
              min={1}
              {...register('receiptNumberNext', { valueAsNumber: true })}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" isLoading={updateNumberFormats.isPending}>
              Save Number Formats
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
