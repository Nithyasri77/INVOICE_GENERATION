/**
 * Purpose: Option lists for AMC Contract status/manager — feeds Select dropdowns, filters, and Zod enums
 * Responsibilities: Single source of truth so status lists never drift between the create form,
 *                    filter panel, and validation schema
 * Dependencies: common.types (AmcStatus)
 * Export: AMC_STATUSES, AMC_STATUS_OPTIONS, AMC_MANAGER_OPTIONS
 */
import type { AmcStatus } from '../types/common.types';
import type { SelectOption } from '../components/ui/Select';

export const AMC_STATUSES: AmcStatus[] = ['Active', 'Upcoming Renewal', 'Expired', 'Cancelled'];

export const AMC_STATUS_OPTIONS: SelectOption[] = AMC_STATUSES.map((s) => ({ value: s, label: s }));

// Assigned Manager — sourced from team members until a real Users/HR module exists
export const AMC_MANAGER_OPTIONS: SelectOption[] = [
  { value: 'Ajith Kumar', label: 'Ajith Kumar' },
  { value: 'Priya Nair', label: 'Priya Nair' },
];
