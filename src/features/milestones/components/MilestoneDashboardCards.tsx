/**
 * Purpose: Milestone Dashboard Cards (BRD: Total Milestones, Completed Value, Pending Value,
 *          Overdue Milestones) shown atop the Milestones tab in Project Detail
 * Responsibilities: Pure presentational grid of StatCards fed by useMilestoneStats
 * Dependencies: StatCard (ui), formatCompactCurrency
 * Export: MilestoneDashboardCards
 */
import { ListChecks, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { StatCard } from '../../../components/ui/StatCard';
import { formatCompactCurrency } from '../../../utils/formatCurrency';
import type { MilestoneStats } from '../../../types/milestone.types';

export function MilestoneDashboardCards({ stats }: { stats: MilestoneStats }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard label="Total Milestones" value={String(stats.totalMilestones)} icon={<ListChecks className="h-4 w-4" />} />
      <StatCard
        label="Completed Value"
        value={formatCompactCurrency(stats.completedValue)}
        icon={<CheckCircle2 className="h-4 w-4" />}
      />
      <StatCard
        label="Pending Value"
        value={formatCompactCurrency(stats.pendingValue)}
        icon={<Clock className="h-4 w-4" />}
      />
      <StatCard
        label="Overdue Milestones"
        value={String(stats.overdueMilestones)}
        tone="danger"
        icon={<AlertTriangle className="h-4 w-4" />}
      />
    </div>
  );
}
