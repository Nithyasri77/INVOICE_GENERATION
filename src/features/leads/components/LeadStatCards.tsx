/**
 * Purpose: The 5 stat cards atop the Leads landing page (Total/New/Qualified/Converted/Lost)
 * Responsibilities: Pure presentation — receives LeadStats, renders StatCard grid
 * Dependencies: StatCard (ui), lucide-react, LeadStats type
 * Export: LeadStatCards
 */
import { Users, Sparkles, BadgeCheck, TrendingUp, XCircle } from 'lucide-react';
import { StatCard } from '../../../components/ui/StatCard';
import type { LeadStats } from '../../../types/lead.types';

export interface LeadStatCardsProps {
  stats: LeadStats;
}

export function LeadStatCards({ stats }: LeadStatCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      <StatCard label="Total Leads" value={String(stats.totalLeads)} icon={<Users className="h-4 w-4" />} />
      <StatCard label="New Leads" value={String(stats.newLeads)} icon={<Sparkles className="h-4 w-4" />} />
      <StatCard label="Qualified Leads" value={String(stats.qualifiedLeads)} icon={<BadgeCheck className="h-4 w-4" />} />
      <StatCard label="Converted Leads" value={String(stats.convertedLeads)} icon={<TrendingUp className="h-4 w-4" />} />
      <StatCard label="Lost Leads" value={String(stats.lostLeads)} tone="danger" icon={<XCircle className="h-4 w-4" />} />
    </div>
  );
}
