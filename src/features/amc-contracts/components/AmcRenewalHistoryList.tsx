/**
 * Purpose: Renders the Renewal History list on the AMC Contract detail page
 * Responsibilities: Pure presentation — one row per renewal record with old→new end date and value
 * Dependencies: EmptyState (ui), formatDate, formatCurrency
 * Export: AmcRenewalHistoryList
 */
import { RefreshCw } from 'lucide-react';
import { EmptyState } from '../../../components/ui/EmptyState';
import { formatDate } from '../../../utils/formatDate';
import { formatCurrency } from '../../../utils/formatCurrency';
import type { AmcRenewalRecord } from '../../../types/amc.types';

export interface AmcRenewalHistoryListProps {
  records: AmcRenewalRecord[];
}

export function AmcRenewalHistoryList({ records }: AmcRenewalHistoryListProps) {
  if (records.length === 0) {
    return <EmptyState icon={<RefreshCw className="h-6 w-6" />} title="No renewals yet" description="This contract hasn't been renewed." />;
  }

  return (
    <ul className="divide-y divide-surface-border">
      {records.map((record) => (
        <li key={record.id} className="py-3">
          <p className="text-sm text-ink-900">
            Renewed till <span className="font-medium">{formatDate(record.newEndDate)}</span> for{' '}
            <span className="font-medium">{formatCurrency(record.renewalValue)}</span>
          </p>
          <p className="mt-1 text-xs text-ink-500">
            {formatDate(record.renewedDate)} · Previously ended {formatDate(record.previousEndDate)} · by {record.renewedBy}
          </p>
        </li>
      ))}
    </ul>
  );
}
