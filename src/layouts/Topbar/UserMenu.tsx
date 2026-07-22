/**
 * Purpose: Logged-in user identity + account actions (Profile, Logout) — matches wireframe's
 *          bottom-left sidebar block showing avatar, name "Ajith Kumar", and role "Admin"
 * Responsibilities: Show avatar initials, name, role, and a dropdown for account actions
 * Dependencies: Dropdown/DropdownItem/DropdownSeparator (ui), AuthContext, lucide-react
 * Export: UserMenu
 */
import { LogOut, User as UserIcon, ChevronsUpDown } from 'lucide-react';
import { Dropdown, DropdownItem, DropdownSeparator } from '../../components/ui/Dropdown';
import { useAuth } from '../../contexts/AuthContext';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function UserMenu() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <Dropdown
      align="start"
      trigger={
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-surface-bg"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
            {getInitials(user.name)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-ink-900">{user.name}</span>
            <span className="block truncate text-xs text-ink-500">{user.role}</span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-ink-400" />
        </button>
      }
    >
      <DropdownItem icon={<UserIcon className="h-4 w-4" />}>My Profile</DropdownItem>
      <DropdownSeparator />
      <DropdownItem icon={<LogOut className="h-4 w-4" />} onSelect={logout} destructive>
        Log Out
      </DropdownItem>
    </Dropdown>
  );
}
