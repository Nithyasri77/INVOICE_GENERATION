/**
 * Purpose: Leads module landing page — full implementation per BRD
 * Responsibilities: Stat cards, search, status/source filters, sortable/paginated table,
 *                    row actions (View/Edit/Delete), Create Lead modal, Delete confirmation
 * Dependencies: DataTable, PageHeader, SearchBar, FilterBar, ActionMenu, StatusBadge,
 *               ConfirmDialog, Pagination, LeadStatCards, LeadFormModal, LeadFilters,
 *               useLeads/useLeadStats/useDeleteLead, useTableState, useDisclosure
 * Export: default
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '../../components/shared/PageHeader';
import { SearchBar } from '../../components/shared/SearchBar';
import { FilterBar } from '../../components/shared/FilterBar';
import { ActionMenu } from '../../components/shared/ActionMenu';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { useTableState } from '../../hooks/useTableState';
import { useDisclosure } from '../../hooks/useDisclosure';
import { useLeads, useLeadStats, useDeleteLead } from '../../features/leads/hooks/useLeads';
import { LeadStatCards } from '../../features/leads/components/LeadStatCards';
import { LeadFormModal } from '../../features/leads/components/LeadFormModal';
import { LeadFilters, type LeadFiltersValue } from '../../features/leads/components/LeadFilters';
import { formatDate } from '../../utils/formatDate';
import { ROUTES } from '../../routes/routePaths';
import type { Lead } from '../../types/lead.types';

export default function LeadsListPage() {
  const navigate = useNavigate();
  const { page, pageSize, search, sortBy, sortDirection, setPage, handleSearch, handleSort } = useTableState();
  const [filters, setFilters] = useState<LeadFiltersValue>({});

  const createModal = useDisclosure();
  const editModal = useDisclosure();
  const deleteDialog = useDisclosure();
  const [selectedLead, setSelectedLead] = useState<Lead | undefined>();

  const statsQuery = useLeadStats();
  const leadsQuery = useLeads({
    page,
    pageSize,
    search,
    status: filters.status,
    source: filters.source,
    sortBy,
    sortDirection,
  });
  const deleteLead = useDeleteLead();

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const columns = useMemo<ColumnDef<Lead, any>[]>(
    () => [
      { accessorKey: 'leadNumber', header: 'Lead ID' },
      { accessorKey: 'companyName', header: 'Company Name' },
      { accessorKey: 'contactPerson', header: 'Contact Person' },
      { accessorKey: 'phone', header: 'Phone' },
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'source', header: 'Lead Source' },
      { accessorKey: 'assignedTo', header: 'Assigned To' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      {
        accessorKey: 'createdDate',
        header: 'Created Date',
        cell: ({ getValue }) => formatDate(getValue() as string),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <ActionMenu
            items={[
              { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: () => navigate(ROUTES.LEAD_DETAIL(row.original.id)) },
              { label: 'Edit', icon: <Pencil className="h-4 w-4" />, onClick: () => { setSelectedLead(row.original); editModal.open(); } },
              {
                label: 'Delete', icon: <Trash2 className="h-4 w-4" />, destructive: true, separatorBefore: true,
                onClick: () => { setSelectedLead(row.original); deleteDialog.open(); },
              },
            ]}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description="Manage potential customers before they become clients."
        action={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={createModal.open}>
            Create Lead
          </Button>
        }
      />

      {statsQuery.data && <LeadStatCards stats={statsQuery.data} />}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar placeholder="Search leads by company, contact, or email..." onSearch={handleSearch} className="sm:max-w-sm" />
        <FilterBar activeCount={activeFilterCount} onClear={() => setFilters({})}>
          <LeadFilters value={filters} onChange={setFilters} />
        </FilterBar>
      </div>

      <DataTable
        columns={columns}
        data={leadsQuery.data?.data ?? []}
        isLoading={leadsQuery.isLoading}
        isError={leadsQuery.isError}
        onRetry={() => leadsQuery.refetch()}
        onRowClick={(lead) => navigate(ROUTES.LEAD_DETAIL(lead.id))}
        emptyTitle="No leads found"
        emptyDescription="Try adjusting your search or filters, or create a new lead."
        emptyAction={<Button onClick={createModal.open}>Create Lead</Button>}
        sorting={sortBy ? [{ id: sortBy, desc: sortDirection === 'desc' }] : []}
        onSortingChange={(sorting) => sorting[0] && handleSort(sorting[0].id)}
      />

      {leadsQuery.data && leadsQuery.data.totalEntries > 0 && (
        <Pagination
          currentPage={leadsQuery.data.page}
          totalPages={leadsQuery.data.totalPages}
          totalEntries={leadsQuery.data.totalEntries}
          pageSize={leadsQuery.data.pageSize}
          onPageChange={setPage}
        />
      )}

      <LeadFormModal open={createModal.isOpen} onOpenChange={createModal.close} />

      {selectedLead && (
        <LeadFormModal
          open={editModal.isOpen}
          onOpenChange={editModal.close}
          lead={selectedLead}
          onSuccess={() => setSelectedLead(undefined)}
        />
      )}

      {selectedLead && (
        <ConfirmDialog
          open={deleteDialog.isOpen}
          onOpenChange={deleteDialog.close}
          title="Delete Lead"
          description={`Are you sure you want to delete ${selectedLead.companyName}? This cannot be undone.`}
          isLoading={deleteLead.isPending}
          onConfirm={async () => {
            await deleteLead.mutateAsync(selectedLead.id);
            deleteDialog.close();
            setSelectedLead(undefined);
          }}
        />
      )}
    </div>
  );
}
