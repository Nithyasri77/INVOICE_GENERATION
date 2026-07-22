/**
 * Purpose: App-wide date picker — used in forms (Invoice Date, Due Date, Milestone Due Date) and report filters
 * Responsibilities: Consistent styled wrapper around native <input type="date"> with label/error/icon
 * Dependencies: lucide-react (Calendar), cn()
 * Export: DatePicker
 */
import { forwardRef, type InputHTMLAttributes } from 'react';
import { Calendar } from 'lucide-react';
import { cn } from '../../../utils/cn';

export interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, label, error, helperText, required, id, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink-700">
            {label}
            {required && <span className="text-danger-600 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type="date"
            className={cn(
              'h-10 w-full rounded-lg border border-surface-border bg-white pl-3 pr-9 text-sm text-ink-900',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500',
              'disabled:bg-surface-bg disabled:text-ink-400 disabled:cursor-not-allowed',
              '[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-9 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer',
              error && 'border-danger-600 focus-visible:ring-danger-600',
              className
            )}
            aria-invalid={!!error}
            {...props}
          />
          <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        </div>

        {error ? (
          <p className="mt-1.5 text-xs text-danger-600">{error}</p>
        ) : helperText ? (
          <p className="mt-1.5 text-xs text-ink-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';
