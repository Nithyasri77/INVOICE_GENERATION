/**
 * Purpose: App-wide dropdown select — used for status filters, client/project pickers, form fields
 * Responsibilities: Accessible listbox behavior (keyboard nav, typeahead) with consistent visual style
 * Dependencies: @radix-ui/react-select, lucide-react, cn()
 * Export: Select, SelectOption type
 */
import * as RadixSelect from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '../../../utils/cn';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
  required?: boolean;
  name?: string;
  className?: string;
}

export function Select({
  label,
  error,
  helperText,
  placeholder = 'Select an option',
  value,
  defaultValue,
  onValueChange,
  options,
  disabled,
  required,
  name,
  className,
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-ink-700">
          {label}
          {required && <span className="text-danger-600 ml-0.5">*</span>}
        </label>
      )}

      <RadixSelect.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        name={name}
      >
        <RadixSelect.Trigger
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-lg border border-surface-border bg-white px-3 text-sm text-ink-900',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500',
            'disabled:bg-surface-bg disabled:text-ink-400 disabled:cursor-not-allowed',
            'data-[placeholder]:text-ink-400',
            error && 'border-danger-600 focus-visible:ring-danger-600',
            className
          )}
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon>
            <ChevronDown className="h-4 w-4 text-ink-400" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            sideOffset={4}
            className="z-50 max-h-72 min-w-[--radix-select-trigger-width] overflow-hidden rounded-lg border border-surface-border bg-white shadow-popover animate-scale-in"
          >
            <RadixSelect.Viewport className="p-1">
              {options.map((option) => (
                <RadixSelect.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={cn(
                    'relative flex cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm text-ink-900 outline-none',
                    'data-[highlighted]:bg-primary-50 data-[highlighted]:text-primary-700',
                    'data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed'
                  )}
                >
                  <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator className="absolute right-3">
                    <Check className="h-4 w-4 text-primary-600" />
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>

      {error ? (
        <p className="mt-1.5 text-xs text-danger-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-ink-500">{helperText}</p>
      ) : null}
    </div>
  );
}
