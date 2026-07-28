/**
 * Purpose: Vertical activity timeline shown on the Lead Detail page
 * Responsibilities: Render LeadActivity[] chronologically with an icon per activity type
 * Dependencies: lucide-react, formatDate, LeadActivity type
 * Export: LeadActivityTimeline
 */
import { RefreshCw, StickyNote, CalendarCheck, Trophy, type LucideIcon } from 'lucide-react';
import { formatDate } from '../../../utils/formatDate';
import type { LeadActivity } from '../../../types/lead.types';
import { EmptyState } from '../../../components/ui/EmptyState';

export interface LeadActivityTimelineProps {
  activities: LeadActivity[];
}

const ACTIVITY_ICON: Record<LeadActivity['type'], LucideIcon> = {
  'Status Change': RefreshCw,
  'Note Added': StickyNote,
  'Follow-up Scheduled': CalendarCheck,
  Converted: Trophy,
};

export function LeadActivityTimeline({ activities }: LeadActivityTimelineProps) {
  if (activities.length === 0) {
    return <EmptyState title="No activity yet" description="Status changes and follow-ups will appear here." />;
  }

  return (
    <ol className="space-y-5">
      {activities.map((activity, idx) => {
        const Icon = ACTIVITY_ICON[activity.type] ?? StickyNote;
        return (
          <li key={activity.id} className="relative flex gap-3 pl-1">
            {idx !== activities.length - 1 && (
              <span className="absolute left-[15px] top-8 h-full w-px bg-surface-border" aria-hidden />
            )}
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <Icon className="h-4 w-4" />
            </span>
            <div className="pb-1">
              <p className="text-sm font-medium text-ink-900">{activity.description}</p>
              <p className="mt-0.5 text-xs text-ink-500">{formatDate(activity.date)}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
