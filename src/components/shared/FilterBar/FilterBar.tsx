/**
 * Purpose: The "Filters" button + popover panel seen on every table toolbar in the wireframes
 * Responsibilities: Provide the trigger/popover shell; the actual filter fields (Select, DatePicker)
 *                    are passed in as children by each module's list page
 * Dependencies: @radix-ui/react-popover, lucide-react (SlidersHorizontal), Button, cn()
 * Export: FilterBar
 */
import { type ReactNode } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '../../ui/Button';
import { cn } from '../../../utils/cn';

export interface FilterBarProps {
  children: ReactNode;
  activeCount?: number;
  onClear?: () => void;
  className?: string;
}

export function FilterBar({ children, activeCount = 0, onClear, className }: FilterBarProps) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="secondary" leftIcon={<SlidersHorizontal className="h-4 w-4" />} className={className}>
          Filters
          {activeCount > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs text-white">
              {activeCount}
            </span>
          )}
        </Button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className={cn(
            'z-50 w-80 space-y-4 rounded-lg border border-surface-border bg-white p-4 shadow-popover animate-scale-in'
          )}
        >
          {children}

          {onClear && (
            <div className="flex justify-end border-t border-surface-border pt-3">
              <Button variant="ghost" size="sm" onClick={onClear}>
                Clear all
              </Button>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
