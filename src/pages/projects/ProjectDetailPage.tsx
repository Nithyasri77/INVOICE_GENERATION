/**
 * Purpose: Project Detail page — opened from ProjectsListPage row click/"View"
 * Responsibilities: Show project header (name, client, status, edit action), the Financial
 *                    Summary block (BRD: Project Value / Received Till Date / Current Payment /
 *                    Outstanding Balance), and the Project View Tabs (Overview/Milestones/
 *                    Invoices/Payments/Receipts/Files/Notes) — non-Overview tabs render a
 *                    "coming soon" note until those modules are built, per the agreed build order.
 * Dependencies: PageHeader (shared), Card, Tabs, StatusBadge, Button, Loader, ErrorState (ui),
 *               useProject/useUpdateProject, ProjectFormModal
 * Export: default
 */
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Construction } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Card, CardBody } from '../../components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatCompactCurrency } from '../../utils/formatCurrency';
import { ROUTES } from '../../routes/routePaths';
import { useProject, useUpdateProject } from '../../features/projects/hooks/useProjects';
import { ProjectFormModal } from '../../features/projects/components/ProjectFormModal';
import { toast } from '../../components/ui/Toast';
import type { ProjectFormValues } from '../../types/project.types';

const FUTURE_TABS = [
  { value: 'milestones', label: 'Milestones' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'payments', label: 'Payments' },
  { value: 'receipts', label: 'Receipts' },
  { value: 'files', label: 'Files' },
  { value: 'notes', label: 'Notes' },
];

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);

  const projectQuery = useProject(projectId);
  const updateProject = useUpdateProject();

  function handleEditSubmit(values: ProjectFormValues) {
    if (!projectId) return;
    updateProject.mutate(
      { id: projectId, values },
      {
        onSuccess: () => {
          toast.success(`${values.projectName} updated`);
          setEditOpen(false);
        },
        onError: () => toast.error('Failed to update project'),
      }
    );
  }

  if (projectQuery.isLoading) {
    return <Loader fullPage label="Loading project..." />;
  }

  if (projectQuery.isError || !projectQuery.data) {
    return <ErrorState onRetry={() => projectQuery.refetch()} />;
  }

  const project = projectQuery.data;
  const outstandingBalance = project.projectValue - project.receivedTillDate;

  return (
    <div className="space-y-6">
      <PageHeader
        title={project.projectName}
        breadcrumbs={[{ label: 'Projects', href: ROUTES.PROJECTS }, { label: project.projectCode }]}
        description={`${project.clientName} · ${project.projectManager}`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(ROUTES.PROJECTS)}>
              Back
            </Button>
            <Button leftIcon={<Pencil className="h-4 w-4" />} onClick={() => setEditOpen(true)}>
              Edit Project
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-2">
        <StatusBadge status={project.status} />
        <span className="text-sm text-ink-500">
          {project.startDate} → {project.expectedDelivery}
        </span>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {FUTURE_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardBody>
                <h3 className="mb-4 text-sm font-semibold text-ink-900">Financial Summary</h3>
                <dl className="space-y-3">
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-ink-500">Project Value</dt>
                    <dd className="text-sm font-semibold text-ink-900">
                      {formatCompactCurrency(project.projectValue)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-ink-500">Received Till Date</dt>
                    <dd className="text-sm font-semibold text-success-700">
                      {formatCompactCurrency(project.receivedTillDate)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-ink-500">Current Payment</dt>
                    <dd className="text-sm font-semibold text-ink-900">—</dd>
                  </div>
                  <div className="flex items-center justify-between border-t border-surface-border pt-3">
                    <dt className="text-sm text-ink-500">Outstanding Balance</dt>
                    <dd className="text-sm font-semibold text-danger-700">
                      {formatCompactCurrency(outstandingBalance)}
                    </dd>
                  </div>
                </dl>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <h3 className="mb-4 text-sm font-semibold text-ink-900">Project Details</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-ink-500">Quotation No</dt>
                    <dd className="font-medium text-ink-900">{project.quotationNo}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-ink-500">MSA No</dt>
                    <dd className="font-medium text-ink-900">{project.msaNo}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-ink-500">Project Manager</dt>
                    <dd className="font-medium text-ink-900">{project.projectManager}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-ink-500">Client</dt>
                    <dd className="font-medium text-ink-900">{project.clientName}</dd>
                  </div>
                </dl>
              </CardBody>
            </Card>
          </div>
        </TabsContent>

        {FUTURE_TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <EmptyState
              icon={<Construction className="h-6 w-6" />}
              title={`${tab.label} module is being built`}
              description="This tab will be wired up once that module is generated, following the agreed build order."
            />
          </TabsContent>
        ))}
      </Tabs>

      <ProjectFormModal
        open={editOpen}
        onOpenChange={setEditOpen}
        project={project}
        onSubmit={handleEditSubmit}
        isSubmitting={updateProject.isPending}
      />
    </div>
  );
}
