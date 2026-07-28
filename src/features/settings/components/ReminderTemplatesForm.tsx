/**
 * Purpose: Reminder Templates settings form (BRD: Settings — Reminder Templates)
 * Responsibilities: Edit + save the first/second/final overdue-invoice reminder message
 *                    templates, independently of other sections
 * Dependencies: Textarea, Button (ui), react-hook-form, useSettings hooks
 * Export: ReminderTemplatesForm
 */
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody } from '../../../components/ui/Card';
import { toast } from '../../../components/ui/Toast';
import { useUpdateReminderTemplates } from '../hooks/useSettings';
import type { ReminderTemplates } from '../../../types/settings.types';

export function ReminderTemplatesForm({ initialValues }: { initialValues: ReminderTemplates }) {
  const { register, handleSubmit, reset } = useForm<ReminderTemplates>({ defaultValues: initialValues });
  const updateReminderTemplates = useUpdateReminderTemplates();

  useEffect(() => reset(initialValues), [initialValues, reset]);

  function onSubmit(values: ReminderTemplates) {
    updateReminderTemplates.mutate(values, {
      onSuccess: () => toast.success('Reminder templates updated'),
      onError: () => toast.error('Failed to update reminder templates'),
    });
  }

  const helper = 'Placeholders: {clientName}, {invoiceNo}, {amount}, {dueDate}';

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Textarea label="First Reminder" required helperText={helper} {...register('firstReminder')} />
          <Textarea label="Second Reminder" required helperText={helper} {...register('secondReminder')} />
          <Textarea label="Final Reminder" required helperText={helper} {...register('finalReminder')} />
          <div className="flex justify-end">
            <Button type="submit" isLoading={updateReminderTemplates.isPending}>
              Save Reminder Templates
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
