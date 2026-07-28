import { useMemo, useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { Plus, Pencil, Trash2, FileText } from 'lucide-react';
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
import { formatDate } from '../../utils/formatDate';
import { useMsas, useCreateMsa, useUpdateMsa, useDeleteMsa } from '../../features/msa/hooks/useMsa';
import { useClientOptions } from '../../features/projects/hooks/useProjects';
import { MsaFormModal } from '../../features/msa/components/MsaFormModal';
import type { Msa, MsaFormValues } from '../../types/msa.types';
import type { MsaStatus } from '../../types/common.types';

const PAGE_SIZE = 10;

const STATUS_FILTER_OPTIONS = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Sent', label: 'Sent' },
  { value: 'Signed', label: 'Signed' },
  { value: 'Expired', label: 'Expired' },
];

export default function MsaPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<MsaStatus | undefined>(undefined);
  const [clientId, setClientId] = useState<string | undefined>(undefined);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingMsa, setEditingMsa] = useState<Msa | undefined>(undefined);

  const clientOptionsQuery = useClientOptions();

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      search: search || undefined,
      status,
      clientId,
      sortBy: sorting[0]?.id,
      sortDirection: (sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : undefined) as 'asc' | 'desc' | undefined,
    }),
    [page, search, status, clientId, sorting]
  );

  const msasQuery = useMsas(queryParams);
  const createMsa = useCreateMsa();
  const updateMsa = useUpdateMsa();
  const deleteMsa = useDeleteMsa();

  function openAddModal() {
    setEditingMsa(undefined);
    setFormOpen(true);
  }

  function openEditModal(msa: Msa) {
    setEditingMsa(msa);
    setFormOpen(true);
  }

  function handleFormSubmit(values: MsaFormValues) {
    if (editingMsa) {
      updateMsa.mutate(
        { id: editingMsa.id, values },
        {
          onSuccess: () => {
            toast.success(`${editingMsa.msaNo} updated`);
            setFormOpen(false);
          },
          onError: () => toast.error('Failed to update MSA'),
        }
      );
    } else {
      createMsa.mutate(values, {
        onSuccess: () => {
          toast.success('MSA added');
          setFormOpen(false);
        },
        onError: () => toast.error('Failed to add MSA'),
      });
    }
  }

  function handleDelete(msa: Msa) {
    if (!window.confirm(`Delete MSA ${msa.msaNo}? This cannot be undone.`)) return;
    deleteMsa.mutate(msa.id, {
      onSuccess: () => toast.success(`${msa.msaNo} deleted`),
      onError: () => toast.error('Failed to delete MSA'),
    });
  }

  function handleExport(format: ExportFormat) {
    toast.info(`Exporting MSAs as ${format.toUpperCase()}...`);
  }

  const columns: ColumnDef<Msa, any>[] = [
    { accessorKey: 'msaNo', header: 'MSA No' },
    { accessorKey: 'clientName', header: 'Client' },
    {
      accessorKey: 'effectiveDate',
      header: 'Effective Date',
      cell: ({ getValue }) => formatDate(getValue() as string),
    },
    {
      accessorKey: 'endDate',
      header: 'End Date',
      cell: ({ getValue }) => (getValue() ? formatDate(getValue() as string) : '—'),
    },
    { accessorKey: 'paymentTerms', header: 'Payment Terms' },
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
              { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, destructive: true, separatorBefore: true, onClick: () => handleDelete(row.original) },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="MSAs"
        description="Master services agreements that hold the commercial and legal terms per client."
        action={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openAddModal}>
            Add MSA
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <SearchBar placeholder="Search MSA no, client, payment terms..." onSearch={(q) => { setSearch(q); setPage(1); }} className="max-w-sm" />
          <FilterBar activeCount={(status ? 1 : 0) + (clientId ? 1 : 0)} onClear={() => { setStatus(undefined); setClientId(undefined); }}>
            <Select label="Status" placeholder="All statuses" options={STATUS_FILTER_OPTIONS} value={status} onValueChange={(v) => { setStatus(v as MsaStatus); setPage(1); }} />
            <Select label="Client" placeholder="All clients" options={clientOptionsQuery.data ?? []} value={clientId} onValueChange={(v) => { setClientId(v); setPage(1); }} />
          </FilterBar>
        </div>
        <ExportButton onExport={handleExport} />
      </div>

      <DataTable
        columns={columns}
        data={msasQuery.data?.data ?? []}
        isLoading={msasQuery.isLoading}
        isError={msasQuery.isError}
        onRetry={() => msasQuery.refetch()}
        sorting={sorting}
        onSortingChange={(next) => {
          setSorting(next);
          setPage(1);
        }}
        emptyTitle="No MSAs yet"
        emptyDescription="Add your first MSA to capture the commercial and legal terms for a client."
        emptyAction={
          <Button leftIcon={<FileText className="h-4 w-4" />} onClick={openAddModal}>
            Add MSA
          </Button>
        }
      />

      {msasQuery.data && msasQuery.data.totalEntries > 0 && (
        <Pagination currentPage={msasQuery.data.page} totalPages={msasQuery.data.totalPages} totalEntries={msasQuery.data.totalEntries} pageSize={msasQuery.data.pageSize} onPageChange={setPage} />
      )}

      <MsaFormModal open={formOpen} onOpenChange={setFormOpen} msa={editingMsa} onSubmit={handleFormSubmit} isSubmitting={createMsa.isPending || updateMsa.isPending} />
    </div>
  );
}
