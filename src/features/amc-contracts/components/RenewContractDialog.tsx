/**
 * Purpose: "Renew Contract" action dialog — captures the renewal value, then extends the
 *          contract by 1 year (business rule lives in amcService.renewAmcContract)
 * Responsibilities: Small validated form (just contractValue) inside a Modal
 * Dependencies: react-hook-form, zod, Modal, Input, Button, useRenewAmcContract
 * Export: RenewContractDialog
 */
import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, ModalBody, ModalFooter } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useRenewAmcContract } from '../hooks/useAmcContracts';
import { formatDate } from '../../../utils/formatDate';
import type { AmcContract } from '../../../types/amc.types';

const renewSchema = z.object({
  renewalValue: z.coerce.number().positive('Renewal value must be greater than 0'),
});

type RenewFormValues = z.infer<typeof renewSchema>;

export interface RenewContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: AmcContract;
}

export function RenewContractDialog({ open, onOpenChange, contract }: RenewContractDialogProps) {
  const renewContract = useRenewAmcContract();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RenewFormValues>({
    resolver: zodResolver(renewSchema) as Resolver<RenewFormValues>,
    defaultValues: { renewalValue: contract.contractValue },
  });

  useEffect(() => {
    if (open) reset({ renewalValue: contract.contractValue });
  }, [open, contract.contractValue, reset]);

  const onSubmit = handleSubmit(async (values) => {
    await renewContract.mutateAsync({ id: contract.id, renewalValue: values.renewalValue });
    onOpenChange(false);
  });

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Renew Contract"
      description={`${contract.amcNumber} — currently ends ${formatDate(contract.endDate)}`}
    >
      <form onSubmit={onSubmit}>
        <ModalBody className="space-y-4">
          <p className="text-sm text-ink-500">
            This extends the contract end date by 1 year and logs the renewal in history.
          </p>
          <Input
            label="Renewal Value (₹)"
            type="number"
            required
            error={errors.renewalValue?.message}
            {...register('renewalValue')}
          />
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={renewContract.isPending}>
            Cancel
          </Button>
          <Button type="submit" isLoading={renewContract.isPending}>
            Confirm Renewal
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
