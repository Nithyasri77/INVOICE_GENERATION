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
import { formatDate, formatDateInput } from '../../utils/formatDate';
import { exportCSV } from '../../utils/exportCSV';
import { exportPDF } from '../../utils/exportPDF';
import { useMsas, useExportMsas, useCreateMsa, useUpdateMsa, useDeleteMsa } from '../../features/msa/hooks/useMsa';
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

const MSA_EXPORT_COLUMNS = [
  { header: 'Agreement ID', accessor: (m: Msa) => m.msaNo },
  { header: 'Agreement Type', accessor: () => 'MSA' },
  { header: 'Agreement Name', accessor: (m: Msa) => m.notes || 'Master Service Agreement' },
  { header: 'Client', accessor: (m: Msa) => m.clientName },
  { header: 'Project', accessor: (m: Msa) => m.projectName || m.notes || 'N/A' },
  { header: 'Status', accessor: (m: Msa) => m.status },
  { header: 'Version', accessor: (m: Msa) => m.version || 'v1.0' },
  { header: 'Effective Date', accessor: (m: Msa) => formatDate(m.effectiveDate) },
  { header: 'Expiry Date', accessor: (m: Msa) => (m.endDate ? formatDate(m.endDate) : 'N/A') },
  { header: 'Created By', accessor: (m: Msa) => m.createdBy || 'System Admin' },
  { header: 'Created Date', accessor: (m: Msa) => (m.createdDate ? formatDate(m.createdDate) : formatDate(m.effectiveDate)) },
  { header: 'Last Updated', accessor: (m: Msa) => (m.lastUpdated ? formatDate(m.lastUpdated) : formatDate(m.effectiveDate)) },
];

export default function MsaPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<MsaStatus | undefined>(undefined);
  const [clientId, setClientId] = useState<string | undefined>(undefined);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

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
  const exportMsasMutation = useExportMsas();
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

  async function handleExport(format: ExportFormat) {
    if (isExporting) return;
    setIsExporting(true);

    try {
      // 1. Fetch full dataset matching search, filters, sorting order
      const allMatching = await exportMsasMutation.mutateAsync({
        search: search || undefined,
        status,
        clientId,
        sortBy: sorting[0]?.id,
        sortDirection: sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : undefined,
      });

      // 2. Filter by selected rows if active
      let dataToExport = allMatching;
      if (selectedIds.size > 0) {
        dataToExport = allMatching.filter((item) => selectedIds.has(item.id));
      }

      // 3. Handle Empty State
      if (!dataToExport || dataToExport.length === 0) {
        toast.error('No agreements available to export.');
        setIsExporting(false);
        return;
      }

      const todayStr = formatDateInput(new Date());
      const filename = `msa_agreements_${todayStr}`;

      const filterSummary: Record<string, string> = {
        'Agreement Type': 'MSA (Master Service Agreement)',
      };
      if (search) filterSummary['Search'] = search;
      if (status) filterSummary['Status'] = status;
      if (clientId) {
        const clientObj = clientOptionsQuery.data?.find((c) => c.value === clientId);
        filterSummary['Client'] = clientObj?.label || clientId;
      }
      if (sorting[0]) {
        filterSummary['Sort'] = `${sorting[0].id} (${sorting[0].desc ? 'descending' : 'ascending'})`;
      }
      if (selectedIds.size > 0) {
        filterSummary['Selection'] = `${selectedIds.size} row(s) selected`;
      }

      // 4. Execute export
      if (format === 'csv') {
        exportCSV({
          filename,
          data: dataToExport,
          columns: MSA_EXPORT_COLUMNS,
        });
      } else if (format === 'pdf') {
        exportPDF({
          filename,
          reportTitle: 'MSA Agreement Report',
          data: dataToExport,
          columns: MSA_EXPORT_COLUMNS,
          appliedFilters: filterSummary,
          orientation: 'landscape',
        });
      }

      toast.success('Agreement exported successfully.');
    } catch (err) {
      console.error('Failed to export MSA agreement:', err);
      toast.error('Failed to export agreement.');
    } finally {
      setIsExporting(false);
    }
  }

  const columns = useMemo<ColumnDef<Msa, any>[]>(() => {
    const currentPageItems = msasQuery.data?.data ?? [];
    const allPageIds = currentPageItems.map((m) => m.id);
    const isAllPageSelected =
      allPageIds.length > 0 && allPageIds.every((id) => selectedIds.has(id));

    return [
      {
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-surface-border text-primary-600 focus:ring-primary-500 cursor-pointer"
            checked={isAllPageSelected}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedIds(new Set([...selectedIds, ...allPageIds]));
              } else {
                const next = new Set(selectedIds);
                allPageIds.forEach((id) => next.delete(id));
                setSelectedIds(next);
              }
            }}
            title="Select all on current page"
          />
        ),
        cell: ({ row }) => {
          const isSelected = selectedIds.has(row.original.id);
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-surface-border text-primary-600 focus:ring-primary-500 cursor-pointer"
                checked={isSelected}
                onChange={(e) => {
                  const next = new Set(selectedIds);
                  if (e.target.checked) {
                    next.add(row.original.id);
                  } else {
                    next.delete(row.original.id);
                  }
                  setSelectedIds(next);
                }}
              />
            </div>
          );
        },
      },
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
  }, [msasQuery.data?.data, selectedIds]);

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
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-md border border-primary-200">
              {selectedIds.size} Selected
            </span>
          )}
          <ExportButton onExport={handleExport} isLoading={isExporting} />
        </div>
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
