/**
 * Purpose: The 5 stat cards atop the AMC Contracts landing page
 *          (Total/Active/Expiring This Month/Renewals Due/Expired)
 * Responsibilities: Pure presentation — receives AmcStats, renders StatCard grid
 * Dependencies: StatCard (ui), lucide-react, AmcStats type
 * Export: AmcStatCards
 */
import { FileStack, ShieldCheck, CalendarClock, BellRing, ShieldX } from 'lucide-react';
import { StatCard } from '../../../components/ui/StatCard';
import type { AmcStats } from '../../../types/amc.types';

export interface AmcStatCardsProps {
  stats: AmcStats;
}

export function AmcStatCards({ stats }: AmcStatCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      <StatCard label="Total AMC Contracts" value={String(stats.totalContracts)} icon={<FileStack className="h-4 w-4" />} />
      <StatCard label="Active Contracts" value={String(stats.activeContracts)} icon={<ShieldCheck className="h-4 w-4" />} />
      <StatCard label="Expiring This Month" value={String(stats.expiringThisMonth)} tone="danger" icon={<CalendarClock className="h-4 w-4" />} />
      <StatCard label="Renewals Due" value={String(stats.renewalsDue)} tone="danger" icon={<BellRing className="h-4 w-4" />} />
      <StatCard label="Expired Contracts" value={String(stats.expiredContracts)} tone="danger" icon={<ShieldX className="h-4 w-4" />} />
    </div>
  );
}
