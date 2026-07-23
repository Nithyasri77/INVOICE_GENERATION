/**
 * Purpose: Projects module landing page (BRD: Projects Module Fields + Add/Edit Project)
 * Responsibilities: Compose PageHeader ("+ Add Project"), SearchBar, FilterBar (status/client),
 *                    DataTable (sortable, paginated), row ActionMenu (View/Edit/Delete),
 *                    ProjectFormModal (add/edit) — this page holds only UI/local state; all data
 *                    access goes through the useProjects hooks. Row click / "View" navigates to
 *                    the Project Detail page.
 * Dependencies: PageHeader, SearchBar, FilterBar, StatusBadge, ExportButton (shared), DataTable,
 *               Select, Pagination, Button (ui), ProjectFormModal (features), useProjects hooks
 * Export: default
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { Plus, Pencil, Eye, Trash2, Briefcase } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { SearchBar } from '../../components/shared/SearchBar';
import { FilterBar } from '../../components/shared/FilterBar';
import { ActionMenu } from '../../components/shared/ActionMenu';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { ExportButton, type ExportFormat } from '../../components/shared/ExportButton';
import { DataTable } from '../../components/ui/Table';
import { Select } from '../../components/ui/Select';
import { Pagination } from '../../components/ui/Pagination';
import { Button } from '../../components/ui/Button';
import { toast } from '../../components/ui/Toast';
import { formatCompactCurrency } from '../../utils/formatCurrency';
import { ROUTES } from '../../routes/routePaths';
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useClientOptions,
} from '../../features/projects/hooks/useProjects';
import { ProjectFormModal } from '../../features/projects/components/ProjectFormModal';
import type { Project, ProjectFormValues } from '../../types/project.types';
import type { ProjectStatus } from '../../types/common.types';

const PAGE_SIZE = 10;

const STATUS_FILTER_OPTIONS = [
  { value: 'Development', label: 'Development' },
  { value: 'UAT', label: 'UAT' },
  { value: 'Live', label: 'Live' },
  { value: 'On Hold', label: 'On Hold' },
  { value: 'Completed', label: 'Completed' },
];

export default function ProjectsListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ProjectStatus | undefined>(undefined);
  const [clientId, setClientId] = useState<string | undefined>(undefined);
  const [sorting, setSorting] = useState<SortingState>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);

  const clientOptionsQuery = useClientOptions();

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      search: search || undefined,
      status,
      clientId,
      sortBy: sorting[0]?.id,
      sortDirection: (sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : undefined) as
        | 'asc'
        | 'desc'
        | undefined,
    }),
    [page, search, status, clientId, sorting]
  );

  const projectsQuery = useProjects(queryParams);
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  function openAddModal() {
    setEditingProject(undefined);
    setFormOpen(true);
  }

  function openEditModal(project: Project) {
    setEditingProject(project);
    setFormOpen(true);
  }

  function openDetail(project: Project) {
    navigate(ROUTES.PROJECT_DETAIL(project.id));
  }

  function handleFormSubmit(values: ProjectFormValues) {
    if (editingProject) {
      updateProject.mutate(
        { id: editingProject.id, values },
        {
          onSuccess: () => {
            toast.success(`${values.projectName} updated`);
            setFormOpen(false);
          },
          onError: () => toast.error('Failed to update project'),
        }
      );
    } else {
      createProject.mutate(values, {
        onSuccess: () => {
          toast.success(`${values.projectName} added`);
          setFormOpen(false);
        },
        onError: () => toast.error('Failed to add project'),
      });
    }
  }

  function handleDelete(project: Project) {
    if (!window.confirm(`Delete ${project.projectName}? This cannot be undone.`)) return;
    deleteProject.mutate(project.id, {
      onSuccess: () => toast.success(`${project.projectName} deleted`),
      onError: () => toast.error('Failed to delete project'),
    });
  }

  function handleExport(format: ExportFormat) {
    toast.info(`Exporting projects as ${format.toUpperCase()}...`);
  }

  const columns: ColumnDef<Project, any>[] = [
    { accessorKey: 'projectCode', header: 'Project ID' },
    { accessorKey: 'projectName', header: 'Project Name' },
    { accessorKey: 'clientName', header: 'Client' },
    { accessorKey: 'quotationNo', header: 'Quotation No' },
    { accessorKey: 'msaNo', header: 'MSA No' },
    {
      accessorKey: 'projectValue',
      header: 'Project Value',
      cell: ({ getValue }) => formatCompactCurrency(getValue() as number),
    },
    { accessorKey: 'startDate', header: 'Start Date' },
    { accessorKey: 'expectedDelivery', header: 'Expected Delivery' },
    { accessorKey: 'projectManager', header: 'Project Manager' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <ActionMenu
            items={[
              { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: () => openDetail(row.original) },
              { label: 'Edit', icon: <Pencil className="h-4 w-4" />, onClick: () => openEditModal(row.original) },
              {
                label: 'Delete',
                icon: <Trash2 className="h-4 w-4" />,
                destructive: true,
                separatorBefore: true,
                onClick: () => handleDelete(row.original),
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Every project Shine Craft is delivering, linked to its client and billing docs."
        action={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openAddModal}>
            Add Project
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <SearchBar
            placeholder="Search project, client, quotation, MSA..."
            onSearch={(q) => {
              setSearch(q);
              setPage(1);
            }}
            className="max-w-sm"
          />
          <FilterBar
            activeCount={(status ? 1 : 0) + (clientId ? 1 : 0)}
            onClear={() => {
              setStatus(undefined);
              setClientId(undefined);
            }}
          >
            <Select
              label="Status"
              placeholder="All statuses"
              options={STATUS_FILTER_OPTIONS}
              value={status}
              onValueChange={(v) => {
                setStatus(v as ProjectStatus);
                setPage(1);
              }}
            />
            <Select
              label="Client"
              placeholder="All clients"
              options={clientOptionsQuery.data ?? []}
              value={clientId}
              onValueChange={(v) => {
                setClientId(v);
                setPage(1);
              }}
            />
          </FilterBar>
        </div>
        <ExportButton onExport={handleExport} />
      </div>

      <DataTable
        columns={columns}
        data={projectsQuery.data?.data ?? []}
        isLoading={projectsQuery.isLoading}
        isError={projectsQuery.isError}
        onRetry={() => projectsQuery.refetch()}
        onRowClick={openDetail}
        sorting={sorting}
        onSortingChange={(next) => {
          setSorting(next);
          setPage(1);
        }}
        emptyTitle="No projects yet"
        emptyDescription="Add your first project to start tracking milestones and invoices for it."
        emptyAction={
          <Button leftIcon={<Briefcase className="h-4 w-4" />} onClick={openAddModal}>
            Add Project
          </Button>
        }
      />

      {projectsQuery.data && projectsQuery.data.totalEntries > 0 && (
        <Pagination
          currentPage={projectsQuery.data.page}
          totalPages={projectsQuery.data.totalPages}
          totalEntries={projectsQuery.data.totalEntries}
          pageSize={projectsQuery.data.pageSize}
          onPageChange={setPage}
        />
      )}

      <ProjectFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        project={editingProject}
        onSubmit={handleFormSubmit}
        isSubmitting={createProject.isPending || updateProject.isPending}
      />
    </div>
  );
}
