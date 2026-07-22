/**
 * Purpose: Generic dropdown/action menu primitive — underlies the table row ActionMenu,
 *          user menu in Topbar, and any "..." overflow menu
 * Responsibilities: Accessible menu (keyboard nav, ESC close) with consistent styling,
 *                    supports icons, dividers, and destructive (red) items
 * Dependencies: @radix-ui/react-dropdown-menu, cn()
 * Export: Dropdown, DropdownItem, DropdownSeparator
 */
import { type ReactNode } from 'react';
import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import { cn } from '../../../utils/cn';

export interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
}

export function Dropdown({ trigger, children, align = 'end' }: DropdownProps) {
  return (
    <RadixDropdown.Root>
      <RadixDropdown.Trigger asChild>{trigger}</RadixDropdown.Trigger>
      <RadixDropdown.Portal>
        <RadixDropdown.Content
          align={align}
          sideOffset={4}
          className="z-50 min-w-[10rem] overflow-hidden rounded-lg border border-surface-border bg-white p-1 shadow-popover animate-scale-in"
        >
          {children}
        </RadixDropdown.Content>
      </RadixDropdown.Portal>
    </RadixDropdown.Root>
  );
}

export interface DropdownItemProps {
  children: ReactNode;
  onSelect?: () => void;
  icon?: ReactNode;
  destructive?: boolean;
  disabled?: boolean;
}

export function DropdownItem({ children, onSelect, icon, destructive, disabled }: DropdownItemProps) {
  return (
    <RadixDropdown.Item
      onSelect={onSelect}
      disabled={disabled}
      className={cn(
        'flex cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2 text-sm outline-none',
        'data-[highlighted]:bg-surface-bg',
        'data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed',
        destructive ? 'text-danger-600 data-[highlighted]:bg-danger-50' : 'text-ink-700'
      )}
    >
      {icon}
      {children}
    </RadixDropdown.Item>
  );
}

export function DropdownSeparator() {
  return <RadixDropdown.Separator className="my-1 h-px bg-surface-border" />;
}
