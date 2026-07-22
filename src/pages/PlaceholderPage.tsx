/**
 * Purpose: Temporary placeholder for modules not yet built — keeps every sidebar route
 *          navigable (no broken links) while we build modules one at a time per your workflow
 * Responsibilities: Show the module name and a "coming soon" EmptyState; nothing more
 * Dependencies: EmptyState (ui), PageHeader (shared), lucide-react (Construction)
 * Export: PlaceholderPage
 */
import { Construction } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';

export interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} />
      <EmptyState
        icon={<Construction className="h-6 w-6" />}
        title={`${title} module is being built`}
        description="This screen will be generated in an upcoming step, following the approved BRD and wireframes."
      />
    </div>
  );
}
