/**
 * Purpose: App-wide multi-line text input — used directly or wrapped by React Hook Form's register
 * Responsibilities: Render label, textarea, helper/error text consistently with Input
 * Dependencies: cn()
 * Export: Textarea
 */
import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../../utils/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, required, id, rows = 4, ...props }, ref) => {
    const textareaId = id ?? props.name;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="mb-1.5 block text-sm font-medium text-ink-700">
            {label}
            {required && <span className="text-danger-600 ml-0.5">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={cn(
            'w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm text-ink-900',
            'placeholder:text-ink-400 transition-colors resize-y',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500',
            'disabled:bg-surface-bg disabled:text-ink-400 disabled:cursor-not-allowed',
            error && 'border-danger-600 focus-visible:ring-danger-600',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
          {...props}
        />

        {error ? (
          <p id={`${textareaId}-error`} className="mt-1.5 text-xs text-danger-600">
            {error}
          </p>
        ) : helperText ? (
          <p id={`${textareaId}-helper`} className="mt-1.5 text-xs text-ink-500">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
