/**
 * Purpose: Full Milestones tab content, embedded inside ProjectDetailPage's "Milestones" tab
 *          (BRD: Milestone Landing Screen + Dashboard Cards + Create Milestone Popup)
 * Responsibilities: Compose MilestoneDashboardCards, a DataTable of this project's milestones
 *                    (Milestone ID/Name/Amount/Due Date/Status), row actions (Edit/Delete), and
 *                    the "+ Add Milestone" action wired to MilestoneFormModal — this component
 *                    holds only UI/local state; all data access goes through useMilestones hooks.
 * Dependencies: DataTable, Button, StatusBadge, ActionMenu, Loader, ErrorState, EmptyState,
 *               MilestoneDashboardCards, MilestoneFormModal, useMilestones hooks
 * Export: MilestonesTab
 */
import { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Pencil, Trash2, Milestone as MilestoneIcon } from 'lucide-react';
import { DataTable } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { ActionMenu } from '../../../components/shared/ActionMenu';
import { Loader } from '../../../components/ui/Loader';
import { toast } from '../../../components/ui/Toast';
import { formatCompactCurrency } from '../../../utils/formatCurrency';
import { MilestoneDashboardCards } from './MilestoneDashboardCards';
import { MilestoneFormModal } from './MilestoneFormModal';
import {
  useMilestones,
  useMilestoneStats,
  useCreateMilestone,
  useUpdateMilestone,
  useDeleteMilestone,
} from '../hooks/useMilestones';
import type { Milestone, MilestoneFormValues } from '../../../types/milestone.types';

export interface MilestonesTabProps {
  projectId: string;
  projectName: string;
}

export function MilestonesTab({ projectId, projectName }: MilestonesTabProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | undefined>(undefined);

  const milestonesQuery = useMilestones(projectId);
  const statsQuery = useMilestoneStats(projectId);
  const createMilestone = useCreateMilestone(projectId);
  const updateMilestone = useUpdateMilestone(projectId);
  const deleteMilestone = useDeleteMilestone(projectId);

  function openAddModal() {
    setEditingMilestone(undefined);
    setFormOpen(true);
  }

  function openEditModal(milestone: Milestone) {
    setEditingMilestone(milestone);
    setFormOpen(true);
  }

  function handleFormSubmit(values: MilestoneFormValues) {
    if (editingMilestone) {
      updateMilestone.mutate(
        { id: editingMilestone.id, values },
        {
          onSuccess: () => {
            toast.success(`${values.milestoneName} updated`);
            setFormOpen(false);
          },
          onError: () => toast.error('Failed to update milestone'),
        }
      );
    } else {
      createMilestone.mutate(values, {
        onSuccess: () => {
          toast.success(`${values.milestoneName} created`);
          setFormOpen(false);
        },
        onError: () => toast.error('Failed to create milestone'),
      });
    }
  }

  function handleDelete(milestone: Milestone) {
    if (!window.confirm(`Delete milestone "${milestone.milestoneName}"? This cannot be undone.`)) return;
    deleteMilestone.mutate(milestone.id, {
      onSuccess: () => toast.success(`${milestone.milestoneName} deleted`),
      onError: () => toast.error('Failed to delete milestone'),
    });
  }

  const columns: ColumnDef<Milestone, any>[] = [
    { accessorKey: 'milestoneCode', header: 'Milestone ID' },
    { accessorKey: 'milestoneName', header: 'Milestone Name' },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ getValue }) => formatCompactCurrency(getValue() as number),
    },
    { accessorKey: 'dueDate', header: 'Due Date' },
    { accessorKey: 'linkedDeliverable', header: 'Linked Deliverable' },
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
    <div className="space-y-4">
      {statsQuery.isLoading || !statsQuery.data ? (
        <Loader label="Loading milestone stats..." />
      ) : (
        <MilestoneDashboardCards stats={statsQuery.data} />
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink-900">Milestone Timeline</h3>
        <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openAddModal}>
          Add Milestone
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={milestonesQuery.data ?? []}
        isLoading={milestonesQuery.isLoading}
        isError={milestonesQuery.isError}
        onRetry={() => milestonesQuery.refetch()}
        emptyTitle="No milestones yet"
        emptyDescription="Add payment-linked milestones to track this project's collection stages."
        emptyAction={
          <Button leftIcon={<MilestoneIcon className="h-4 w-4" />} onClick={openAddModal}>
            Add Milestone
          </Button>
        }
      />

      <MilestoneFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        projectName={projectName}
        milestone={editingMilestone}
        onSubmit={handleFormSubmit}
        isSubmitting={createMilestone.isPending || updateMilestone.isPending}
      />
    </div>
  );
}
