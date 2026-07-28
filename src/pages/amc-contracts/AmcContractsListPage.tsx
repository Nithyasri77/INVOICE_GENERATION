/**
 * Purpose: AMC Contracts module landing page — full implementation per BRD
 * Responsibilities: Stat cards, search, status filter, sortable/paginated table, row actions
 *                    (View/Edit/Renew/Mark Renewed/Delete), Create modal, Delete confirmation
 * Dependencies: DataTable, PageHeader, SearchBar, FilterBar, ActionMenu, StatusBadge,
 *               ConfirmDialog, Pagination, AmcStatCards, AmcContractFormModal, AmcFilters,
 *               RenewContractDialog, useAmcContracts/useAmcStats/useDeleteAmcContract/
 *               useMarkAmcRenewed, useTableState, useDisclosure
 * Export: default
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2, RefreshCw, CheckCircle2 } from 'lucide-react';
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
import { useAmcContracts, useAmcStats, useDeleteAmcContract, useMarkAmcRenewed } from '../../features/amc-contracts/hooks/useAmcContracts';
import { AmcStatCards } from '../../features/amc-contracts/components/AmcStatCards';
import { AmcContractFormModal } from '../../features/amc-contracts/components/AmcContractFormModal';
import { AmcFilters, type AmcFiltersValue } from '../../features/amc-contracts/components/AmcFilters';
import { RenewContractDialog } from '../../features/amc-contracts/components/RenewContractDialog';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';
import { ROUTES } from '../../routes/routePaths';
import type { AmcContract } from '../../types/amc.types';

export default function AmcContractsListPage() {
  const navigate = useNavigate();
  const { page, pageSize, search, sortBy, sortDirection, setPage, handleSearch, handleSort } = useTableState();
  const [filters, setFilters] = useState<AmcFiltersValue>({});

  const createModal = useDisclosure();
  const editModal = useDisclosure();
  const deleteDialog = useDisclosure();
  const renewDialog = useDisclosure();
  const [selectedContract, setSelectedContract] = useState<AmcContract | undefined>();

  const statsQuery = useAmcStats();
  const contractsQuery = useAmcContracts({
    page,
    pageSize,
    search,
    status: filters.status,
    sortBy,
    sortDirection,
  });
  const deleteContract = useDeleteAmcContract();
  const markRenewed = useMarkAmcRenewed();

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const columns = useMemo<ColumnDef<AmcContract, any>[]>(
    () => [
      { accessorKey: 'amcNumber', header: 'AMC ID' },
      { accessorKey: 'clientName', header: 'Client' },
      { accessorKey: 'projectName', header: 'Project' },
      {
        accessorKey: 'contractValue',
        header: 'Contract Value',
        cell: ({ getValue }) => formatCurrency(getValue() as number),
      },
      { accessorKey: 'startDate', header: 'Start Date', cell: ({ getValue }) => formatDate(getValue() as string) },
      { accessorKey: 'endDate', header: 'End Date', cell: ({ getValue }) => formatDate(getValue() as string) },
      { accessorKey: 'renewalDate', header: 'Renewal Date', cell: ({ getValue }) => formatDate(getValue() as string) },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      { accessorKey: 'assignedManager', header: 'Assigned Manager' },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <ActionMenu
            items={[
              { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: () => navigate(ROUTES.AMC_CONTRACT_DETAIL(row.original.id)) },
              { label: 'Edit', icon: <Pencil className="h-4 w-4" />, onClick: () => { setSelectedContract(row.original); editModal.open(); } },
              { label: 'Renew Contract', icon: <RefreshCw className="h-4 w-4" />, onClick: () => { setSelectedContract(row.original); renewDialog.open(); } },
              {
                label: 'Mark Renewed', icon: <CheckCircle2 className="h-4 w-4" />,
                disabled: row.original.status === 'Active',
                onClick: () => markRenewed.mutate(row.original.id),
              },
              {
                label: 'Delete', icon: <Trash2 className="h-4 w-4" />, destructive: true, separatorBefore: true,
                onClick: () => { setSelectedContract(row.original); deleteDialog.open(); },
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
        title="AMC Contracts"
        description="Track Annual Maintenance Contracts, renewals, and reminders."
        action={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={createModal.open}>
            Create AMC Contract
          </Button>
        }
      />

      {statsQuery.data && <AmcStatCards stats={statsQuery.data} />}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar placeholder="Search by AMC ID, client, or project..." onSearch={handleSearch} className="sm:max-w-sm" />
        <FilterBar activeCount={activeFilterCount} onClear={() => setFilters({})}>
          <AmcFilters value={filters} onChange={setFilters} />
        </FilterBar>
      </div>

      <DataTable
        columns={columns}
        data={contractsQuery.data?.data ?? []}
        isLoading={contractsQuery.isLoading}
        isError={contractsQuery.isError}
        onRetry={() => contractsQuery.refetch()}
        onRowClick={(contract) => navigate(ROUTES.AMC_CONTRACT_DETAIL(contract.id))}
        emptyTitle="No AMC contracts found"
        emptyDescription="Try adjusting your search or filters, or create a new contract."
        emptyAction={<Button onClick={createModal.open}>Create AMC Contract</Button>}
        sorting={sortBy ? [{ id: sortBy, desc: sortDirection === 'desc' }] : []}
        onSortingChange={(sorting) => sorting[0] && handleSort(sorting[0].id)}
      />

      {contractsQuery.data && contractsQuery.data.totalEntries > 0 && (
        <Pagination
          currentPage={contractsQuery.data.page}
          totalPages={contractsQuery.data.totalPages}
          totalEntries={contractsQuery.data.totalEntries}
          pageSize={contractsQuery.data.pageSize}
          onPageChange={setPage}
        />
      )}

      <AmcContractFormModal open={createModal.isOpen} onOpenChange={createModal.close} />

      {selectedContract && (
        <AmcContractFormModal
          open={editModal.isOpen}
          onOpenChange={editModal.close}
          contract={selectedContract}
          onSuccess={() => setSelectedContract(undefined)}
        />
      )}

      {selectedContract && (
        <RenewContractDialog open={renewDialog.isOpen} onOpenChange={renewDialog.close} contract={selectedContract} />
      )}

      {selectedContract && (
        <ConfirmDialog
          open={deleteDialog.isOpen}
          onOpenChange={deleteDialog.close}
          title="Delete AMC Contract"
          description={`Are you sure you want to delete ${selectedContract.amcNumber}? This cannot be undone.`}
          isLoading={deleteContract.isPending}
          onConfirm={async () => {
            await deleteContract.mutateAsync(selectedContract.id);
            deleteDialog.close();
            setSelectedContract(undefined);
          }}
        />
      )}
    </div>
  );
}
