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
import { useNdas, useExportNdas, useCreateNda, useUpdateNda, useDeleteNda } from '../../features/nda/hooks/useNda';
import { useClientOptions } from '../../features/projects/hooks/useProjects';
import { NdaFormModal } from '../../features/nda/components/NdaFormModal';
import type { Nda, NdaFormValues } from '../../types/nda.types';
import type { NdaStatus } from '../../types/common.types';

const PAGE_SIZE = 10;

const STATUS_FILTER_OPTIONS = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Sent', label: 'Sent' },
  { value: 'Signed', label: 'Signed' },
  { value: 'Expired', label: 'Expired' },
];

const NDA_EXPORT_COLUMNS = [
  { header: 'Agreement ID', accessor: (n: Nda) => n.ndaNo },
  { header: 'Agreement Type', accessor: () => 'NDA' },
  { header: 'Agreement Name', accessor: (n: Nda) => n.notes || 'Non-Disclosure Agreement' },
  { header: 'Client', accessor: (n: Nda) => n.clientName },
  { header: 'Project', accessor: (n: Nda) => n.projectName || n.notes || 'N/A' },
  { header: 'Status', accessor: (n: Nda) => n.status },
  { header: 'Version', accessor: (n: Nda) => n.version || 'v1.0' },
  { header: 'Effective Date', accessor: (n: Nda) => formatDate(n.signedDate) },
  { header: 'Expiry Date', accessor: (n: Nda) => (n.expiryDate ? formatDate(n.expiryDate) : 'N/A') },
  { header: 'Created By', accessor: (n: Nda) => n.createdBy || 'System Admin' },
  { header: 'Created Date', accessor: (n: Nda) => (n.createdDate ? formatDate(n.createdDate) : formatDate(n.signedDate)) },
  { header: 'Last Updated', accessor: (n: Nda) => (n.lastUpdated ? formatDate(n.lastUpdated) : formatDate(n.signedDate)) },
];

export default function NdaPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<NdaStatus | undefined>(undefined);
  const [clientId, setClientId] = useState<string | undefined>(undefined);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingNda, setEditingNda] = useState<Nda | undefined>(undefined);

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

  const ndasQuery = useNdas(queryParams);
  const exportNdasMutation = useExportNdas();
  const createNda = useCreateNda();
  const updateNda = useUpdateNda();
  const deleteNda = useDeleteNda();

  function openAddModal() {
    setEditingNda(undefined);
    setFormOpen(true);
  }

  function openEditModal(nda: Nda) {
    setEditingNda(nda);
    setFormOpen(true);
  }

  function handleFormSubmit(values: NdaFormValues) {
    if (editingNda) {
      updateNda.mutate(
        { id: editingNda.id, values },
        {
          onSuccess: () => {
            toast.success(`${editingNda.ndaNo} updated`);
            setFormOpen(false);
          },
          onError: () => toast.error('Failed to update NDA'),
        }
      );
    } else {
      createNda.mutate(values, {
        onSuccess: () => {
          toast.success('NDA added');
          setFormOpen(false);
        },
        onError: () => toast.error('Failed to add NDA'),
      });
    }
  }

  function handleDelete(nda: Nda) {
    if (!window.confirm(`Delete NDA ${nda.ndaNo}? This cannot be undone.`)) return;
    deleteNda.mutate(nda.id, {
      onSuccess: () => toast.success(`${nda.ndaNo} deleted`),
      onError: () => toast.error('Failed to delete NDA'),
    });
  }

  async function handleExport(format: ExportFormat) {
    if (isExporting) return;
    setIsExporting(true);

    try {
      // 1. Fetch full dataset matching search, filters, sorting order
      const allMatching = await exportNdasMutation.mutateAsync({
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
      const filename = `nda_agreements_${todayStr}`;

      const filterSummary: Record<string, string> = {
        'Agreement Type': 'NDA (Non-Disclosure Agreement)',
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
          columns: NDA_EXPORT_COLUMNS,
        });
      } else if (format === 'pdf') {
        exportPDF({
          filename,
          reportTitle: 'NDA Agreement Report',
          data: dataToExport,
          columns: NDA_EXPORT_COLUMNS,
          appliedFilters: filterSummary,
          orientation: 'landscape',
        });
      }

      toast.success('Agreement exported successfully.');
    } catch (err) {
      console.error('Failed to export NDA agreement:', err);
      toast.error('Failed to export agreement.');
    } finally {
      setIsExporting(false);
    }
  }

  const columns = useMemo<ColumnDef<Nda, any>[]>(() => {
    const currentPageItems = ndasQuery.data?.data ?? [];
    const allPageIds = currentPageItems.map((n) => n.id);
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
      { accessorKey: 'ndaNo', header: 'NDA No' },
      { accessorKey: 'clientName', header: 'Client' },
      {
        accessorKey: 'signedDate',
        header: 'Signed Date',
        cell: ({ getValue }) => formatDate(getValue() as string),
      },
      {
        accessorKey: 'expiryDate',
        header: 'Expiry Date',
        cell: ({ getValue }) => (getValue() ? formatDate(getValue() as string) : '—'),
      },
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
  }, [ndasQuery.data?.data, selectedIds]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="NDAs"
        description="Confidentiality agreements tracked per client with status, dates, and attachment references."
        action={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openAddModal}>
            Add NDA
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <SearchBar placeholder="Search NDA no, client, notes..." onSearch={(q) => { setSearch(q); setPage(1); }} className="max-w-sm" />
          <FilterBar activeCount={(status ? 1 : 0) + (clientId ? 1 : 0)} onClear={() => { setStatus(undefined); setClientId(undefined); }}>
            <Select label="Status" placeholder="All statuses" options={STATUS_FILTER_OPTIONS} value={status} onValueChange={(v) => { setStatus(v as NdaStatus); setPage(1); }} />
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
        data={ndasQuery.data?.data ?? []}
        isLoading={ndasQuery.isLoading}
        isError={ndasQuery.isError}
        onRetry={() => ndasQuery.refetch()}
        sorting={sorting}
        onSortingChange={(next) => {
          setSorting(next);
          setPage(1);
        }}
        emptyTitle="No NDAs yet"
        emptyDescription="Add your first NDA to track confidentiality obligations for a client."
        emptyAction={
          <Button leftIcon={<FileText className="h-4 w-4" />} onClick={openAddModal}>
            Add NDA
          </Button>
        }
      />

      {ndasQuery.data && ndasQuery.data.totalEntries > 0 && (
        <Pagination currentPage={ndasQuery.data.page} totalPages={ndasQuery.data.totalPages} totalEntries={ndasQuery.data.totalEntries} pageSize={ndasQuery.data.pageSize} onPageChange={setPage} />
      )}

      <NdaFormModal open={formOpen} onOpenChange={setFormOpen} nda={editingNda} onSubmit={handleFormSubmit} isSubmitting={createNda.isPending || updateNda.isPending} />
    </div>
  );
}
