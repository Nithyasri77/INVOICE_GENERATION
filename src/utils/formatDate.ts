/**
 * Purpose: Format dates consistently across tables, PDFs, and forms
 * Responsibilities: Convert ISO date strings/Date objects into display formats used in wireframes
 * Dependencies: date-fns
 * Export: formatDate(), formatDateLong(), formatDateInput()
 */
import { format, parseISO } from 'date-fns';

function toDate(value: string | Date): Date {
  return typeof value === 'string' ? parseISO(value) : value;
}

/** Table/list display format matching wireframes: "29-Apr-2026" */
export function formatDate(value: string | Date): string {
  return format(toDate(value), 'dd-MMM-yyyy');
}

/** Long-form for PDFs/invoices: "29 April 2026" */
export function formatDateLong(value: string | Date): string {
  return format(toDate(value), 'dd MMMM yyyy');
}

/** yyyy-MM-dd format required by <input type="date"> */
export function formatDateInput(value: string | Date): string {
  return format(toDate(value), 'yyyy-MM-dd');
}
