/**
 * Purpose: Per-row action menu ("...") in every data table — View/Edit/Delete/Download, etc.
 * Responsibilities: Wrap Dropdown with a consistent icon-button trigger; caller supplies actions
 * Dependencies: Dropdown/DropdownItem/DropdownSeparator (ui), lucide-react (MoreVertical)
 * Export: ActionMenu, ActionMenuItem type
 */
import { type ReactNode } from 'react';
import { MoreVertical } from 'lucide-react';
import { Dropdown, DropdownItem, DropdownSeparator } from '../../ui/Dropdown';

export interface ActionMenuItem {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  destructive?: boolean;
  disabled?: boolean;
  /** Insert a separator above this item */
  separatorBefore?: boolean;
}

export interface ActionMenuProps {
  items: ActionMenuItem[];
}

export function ActionMenu({ items }: ActionMenuProps) {
  return (
    <Dropdown
      trigger={
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-md text-ink-500 hover:bg-surface-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label="Row actions"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      }
    >
      {items.map((item, idx) => (
        <span key={idx}>
          {item.separatorBefore && <DropdownSeparator />}
          <DropdownItem onSelect={item.onClick} icon={item.icon} destructive={item.destructive} disabled={item.disabled}>
            {item.label}
          </DropdownItem>
        </span>
      ))}
    </Dropdown>
  );
}
