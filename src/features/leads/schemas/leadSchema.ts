/**
 * Purpose: Zod validation schema for Create/Edit Lead form
 * Responsibilities: Field-level validation rules + inferred TS type for React Hook Form
 * Dependencies: zod, LEAD_STATUSES/LEAD_SOURCES (constants)
 * Export: leadSchema, LeadFormValues
 */
import { z } from 'zod';
import { LEAD_STATUSES, LEAD_SOURCES } from '../../../constants/leadOptions';
import type { LeadStatus, LeadSource } from '../../../types/lead.types';

export const leadSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters').max(120),
  contactPerson: z.string().min(2, 'Contact person name is required').max(80),
  phone: z
    .string()
    .min(10, 'Enter a valid phone number')
    .regex(/^[+\d][\d\s-]{9,}$/, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email address'),
  source: z.enum(LEAD_SOURCES as [LeadSource, ...LeadSource[]], { message: 'Select a lead source' }),
  assignedTo: z.string().min(1, 'Assign this lead to a team member'),
  status: z.enum(LEAD_STATUSES as [LeadStatus, ...LeadStatus[]], { message: 'Select a status' }),
  notes: z.string().max(1000, 'Notes must be under 1000 characters').optional(),
});

export type LeadFormValues = z.infer<typeof leadSchema>;
