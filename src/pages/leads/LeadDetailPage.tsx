/**
 * Purpose: Lead Detail page — full view of a single lead per BRD ("Company Information, Contact
 *          Details, Notes, Follow-ups, Activities Timeline, Convert To Client Button")
 * Responsibilities: Compose read-only info cards + follow-up list + activity timeline; wire
 *                    Edit and Convert-to-Client actions
 * Dependencies: useLead/useLeadFollowUps/useLeadActivities/useAddLeadFollowUp/
 *               useConvertLeadToClient, LeadActivityTimeline, LeadFormModal, ConfirmDialog
 * Export: default
 */
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pencil, ArrowRightCircle, Plus, Mail, Phone, User, Building2 } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { useDisclosure } from '../../hooks/useDisclosure';
import {
  useLead,
  useLeadFollowUps,
  useLeadActivities,
  useAddLeadFollowUp,
  useConvertLeadToClient,
} from '../../features/leads/hooks/useLeads';
import { LeadFormModal } from '../../features/leads/components/LeadFormModal';
import { LeadActivityTimeline } from '../../features/leads/components/LeadActivityTimeline';
import { formatDate } from '../../utils/formatDate';
import { ROUTES } from '../../routes/routePaths';

export default function LeadDetailPage() {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const editModal = useDisclosure();
  const convertDialog = useDisclosure();
  const [followUpNote, setFollowUpNote] = useState('');

  const leadQuery = useLead(leadId);
  const followUpsQuery = useLeadFollowUps(leadId);
  const activitiesQuery = useLeadActivities(leadId);
  const addFollowUp = useAddLeadFollowUp(leadId ?? '');
  const convertLead = useConvertLeadToClient();

  if (leadQuery.isLoading) return <Loader fullPage label="Loading lead..." />;
  if (leadQuery.isError || !leadQuery.data) {
    return <ErrorState title="Lead not found" onRetry={() => leadQuery.refetch()} />;
  }

  const lead = leadQuery.data;
  const isConverted = lead.status === 'Won';

  return (
    <div className="space-y-6">
      <PageHeader
        title={lead.companyName}
        breadcrumbs={[{ label: 'Leads', href: ROUTES.LEADS }, { label: lead.leadNumber }]}
        action={
          <>
            <Button variant="secondary" leftIcon={<Pencil className="h-4 w-4" />} onClick={editModal.open}>
              Edit
            </Button>
            {!isConverted && (
              <Button leftIcon={<ArrowRightCircle className="h-4 w-4" />} onClick={convertDialog.open}>
                Convert To Client
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Company + Contact info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <StatusBadge status={lead.status} />
          </CardHeader>
          <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoRow icon={<Building2 className="h-4 w-4" />} label="Company Name" value={lead.companyName} />
            <InfoRow icon={<User className="h-4 w-4" />} label="Contact Person" value={lead.contactPerson} />
            <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={lead.phone} />
            <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={lead.email} />
            <InfoRow label="Lead Source" value={lead.source} />
            <InfoRow label="Assigned To" value={lead.assignedTo} />
            <InfoRow label="Created Date" value={formatDate(lead.createdDate)} />
          </CardBody>

          {lead.notes && (
            <>
              <CardHeader className="border-t-0">
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardBody className="pt-0 text-sm text-ink-700">{lead.notes}</CardBody>
            </>
          )}
        </Card>

        {/* Activity timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Activities Timeline</CardTitle>
          </CardHeader>
          <CardBody>
            {activitiesQuery.isLoading ? (
              <Loader label="Loading activity..." />
            ) : (
              <LeadActivityTimeline activities={activitiesQuery.data ?? []} />
            )}
          </CardBody>
        </Card>
      </div>

      {/* Follow-ups */}
      <Card>
        <CardHeader>
          <CardTitle>Follow-ups</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex gap-2">
            <input
              value={followUpNote}
              onChange={(e) => setFollowUpNote(e.target.value)}
              placeholder="Log a follow-up note..."
              className="h-10 flex-1 rounded-lg border border-surface-border bg-white px-3 text-sm text-ink-900 placeholder:text-ink-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            />
            <Button
              leftIcon={<Plus className="h-4 w-4" />}
              isLoading={addFollowUp.isPending}
              disabled={!followUpNote.trim()}
              onClick={() => {
                addFollowUp.mutate(followUpNote, { onSuccess: () => setFollowUpNote('') });
              }}
            >
              Add
            </Button>
          </div>

          {followUpsQuery.isLoading ? (
            <Loader label="Loading follow-ups..." />
          ) : !followUpsQuery.data || followUpsQuery.data.length === 0 ? (
            <EmptyState title="No follow-ups logged yet" />
          ) : (
            <ul className="divide-y divide-surface-border">
              {followUpsQuery.data.map((fu) => (
                <li key={fu.id} className="py-3">
                  <p className="text-sm text-ink-900">{fu.note}</p>
                  <p className="mt-1 text-xs text-ink-500">
                    {formatDate(fu.date)} · {fu.createdBy}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <LeadFormModal open={editModal.isOpen} onOpenChange={editModal.close} lead={lead} />

      <ConfirmDialog
        open={convertDialog.isOpen}
        onOpenChange={convertDialog.close}
        title="Convert To Client"
        description={`This will mark ${lead.companyName} as Won and move them into the Clients module. Continue?`}
        confirmLabel="Convert"
        destructive={false}
        isLoading={convertLead.isPending}
        onConfirm={async () => {
          await convertLead.mutateAsync(lead.id);
          convertDialog.close();
          navigate(ROUTES.CLIENTS);
        }}
      />
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-medium text-ink-500">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-sm text-ink-900">{value}</p>
    </div>
  );
}
