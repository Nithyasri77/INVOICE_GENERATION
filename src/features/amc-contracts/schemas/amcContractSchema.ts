/**
 * Purpose: Zod validation schema for Create/Edit AMC Contract form
 * Responsibilities: Field-level validation + a cross-field rule (End Date must be after Start Date)
 * Dependencies: zod, AMC_STATUSES (constants)
 * Export: amcContractSchema, AmcContractFormValues
 */
import { z } from 'zod';
import { AMC_STATUSES } from '../../../constants/amcOptions';
import type { AmcStatus } from '../../../types/common.types';

export const amcContractSchema = z
  .object({
    clientName: z.string().min(1, 'Select a client'),
    projectName: z.string().min(1, 'Select a project'),
    contractValue: z.coerce.number().positive('Contract value must be greater than 0'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    renewalDate: z.string().min(1, 'Renewal date is required'),
    status: z.enum(AMC_STATUSES as [AmcStatus, ...AmcStatus[]], { message: 'Select a status' }),
    assignedManager: z.string().min(1, 'Assign a manager'),
    notes: z.string().max(1000, 'Notes must be under 1000 characters').optional(),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

export type AmcContractFormValues = z.infer<typeof amcContractSchema>;
