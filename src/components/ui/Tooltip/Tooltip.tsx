/**
 * Purpose: Hover/focus tooltip — used for truncated table cells, icon-only buttons, help hints
 * Responsibilities: Accessible tooltip with consistent dark-surface styling and arrow
 * Dependencies: @radix-ui/react-tooltip, cn()
 * Export: Tooltip, TooltipProvider (mount once at app root)
 */
import { type ReactNode } from 'react';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import { cn } from '../../../utils/cn';

export const TooltipProvider = RadixTooltip.Provider;

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  return (
    <RadixTooltip.Root delayDuration={200}>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          sideOffset={6}
          className={cn(
            'z-50 max-w-xs rounded-md bg-ink-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-popover animate-fade-in',
            className
          )}
        >
          {content}
          <RadixTooltip.Arrow className="fill-ink-900" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}
