/**
 * Purpose: Maps business-domain status strings (Invoice/Payment/Milestone/Project/Client/AMC)
 *          to the correct Badge color variant — single source of truth so colors never drift
 *          between modules (e.g. "Paid" is always green everywhere)
 * Responsibilities: One lookup table per status type; falls back to neutral for unmapped values
 * Dependencies: Badge (ui)
 * Export: StatusBadge
 */
import { Badge, type BadgeProps } from '../../ui/Badge';

type StatusVariant = NonNullable<BadgeProps['variant']>;

const STATUS_COLOR_MAP: Record<string, StatusVariant> = {
  // Invoice
  Draft: 'neutral',
  Sent: 'info',
  'Part Paid': 'warning',
  Paid: 'success',
  Overdue: 'danger',
  // Payment
  Reconciled: 'success',
  Pending: 'warning',
  // Milestone
  'Not Started': 'neutral',
  'In Progress': 'info',
  'Invoice Raised': 'warning',
  Completed: 'success',
  // Project
  Development: 'info',
  UAT: 'warning',
  Live: 'success',
  'On Hold': 'neutral',
  // Client
  Active: 'success',
  Inactive: 'neutral',
  // AMC
  'Expiring Soon': 'warning',
  Expired: 'danger',
  // Quotation (Draft/Sent/Expired share colors with Invoice/AMC statuses above)
  Accepted: 'success',
  Rejected: 'danger',
  // Billing lifecycle statuses used by debit and credit notes
  Open: 'warning',
  Applied: 'success',
  Cancelled: 'neutral',
};

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

/** Renders any recognized business status with its canonical color; unrecognized values render neutral. */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = STATUS_COLOR_MAP[status] ?? 'neutral';
  return (
    <Badge variant={variant} className={className}>
      {status}
    </Badge>
  );
}
