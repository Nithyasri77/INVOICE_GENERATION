/**
 * Purpose: Debit Notes module landing page — replaces the earlier PlaceholderPage stub now that
 *          this module is generated
 * Responsibilities: Compose PageHeader ("+ Add Debit Note"), SearchBar, FilterBar (status/client),
 *                    DataTable (sortable, paginated), row ActionMenu (Edit/Delete),
 *                    DebitNoteFormModal (add/edit) — this page holds only UI/local state; all
 *                    data access goes through the useDebitNotes hooks.
 * Dependencies: PageHeader, SearchBar, FilterBar, StatusBadge, ExportButton (shared), DataTable,
 *               Select, Pagination, Button (ui), DebitNoteFormModal (features), useDebitNotes
 *               hooks, useClientOptions (Projects feature — shared Client picker)
 * Export: default
 */
import { useMemo, useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { Plus, Pencil, Trash2, FileMinus } from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { SearchBar } from '../../../components/shared/SearchBar';
import { FilterBar } from '../../../components/shared/FilterBar';
import { ActionMenu } from '../../../components/shared/ActionMenu';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { ExportButton, type ExportFormat } from '../../../components/shared/ExportButton';
import { DataTable } from '../../../components/ui/Table';
import { Select } from '../../../components/ui/Select';
import { Pagination } from '../../../components/ui/Pagination';
import { Button } from '../../../components/ui/Button';
import { toast } from '../../../components/ui/Toast';
import { formatCompactCurrency } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import {
  useDebitNotes,
  useCreateDebitNote,
  useUpdateDebitNote,
  useDeleteDebitNote,
} from '../../../features/debit-notes/hooks/useDebitNotes';
import { useClientOptions } from '../../../features/projects/hooks/useProjects';
import { DebitNoteFormModal } from '../../../features/debit-notes/components/DebitNoteFormModal';
import type { DebitNote, DebitNoteFormValues } from '../../../types/debitNote.types';
import type { DebitNoteStatus } from '../../../types/common.types';

const PAGE_SIZE = 10;

const STATUS_FILTER_OPTIONS = [
  { value: 'Open', label: 'Open' },
  { value: 'Applied', label: 'Applied' },
  { value: 'Cancelled', label: 'Cancelled' },
];

export default function DebitNotesListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<DebitNoteStatus | undefined>(undefined);
  const [clientId, setClientId] = useState<string | undefined>(undefined);
  const [sorting, setSorting] = useState<SortingState>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingDebitNote, setEditingDebitNote] = useState<DebitNote | undefined>(undefined);

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

  const debitNotesQuery = useDebitNotes(queryParams);
  const createDebitNote = useCreateDebitNote();
  const updateDebitNote = useUpdateDebitNote();
  const deleteDebitNote = useDeleteDebitNote();

  function openAddModal() {
    setEditingDebitNote(undefined);
    setFormOpen(true);
  }

  function openEditModal(debitNote: DebitNote) {
    setEditingDebitNote(debitNote);
    setFormOpen(true);
  }

  function handleFormSubmit(values: DebitNoteFormValues) {
    if (editingDebitNote) {
      updateDebitNote.mutate(
        { id: editingDebitNote.id, values },
        {
          onSuccess: () => {
            toast.success(`${editingDebitNote.debitNoteNo} updated`);
            setFormOpen(false);
          },
          onError: () => toast.error('Failed to update debit note'),
        }
      );
    } else {
      createDebitNote.mutate(values, {
        onSuccess: () => {
          toast.success('Debit note added');
          setFormOpen(false);
        },
        onError: () => toast.error('Failed to add debit note'),
      });
    }
  }

  function handleDelete(debitNote: DebitNote) {
    if (!window.confirm(`Delete debit note ${debitNote.debitNoteNo}? This cannot be undone.`)) return;
    deleteDebitNote.mutate(debitNote.id, {
      onSuccess: () => toast.success(`${debitNote.debitNoteNo} deleted`),
      onError: () => toast.error('Failed to delete debit note'),
    });
  }

  function handleExport(format: ExportFormat) {
    toast.info(`Exporting debit notes as ${format.toUpperCase()}...`);
  }

  const columns: ColumnDef<DebitNote, any>[] = [
    { accessorKey: 'debitNoteNo', header: 'Debit Note No' },
    { accessorKey: 'clientName', header: 'Client' },
    {
      accessorKey: 'projectName',
      header: 'Project',
      cell: ({ getValue }) => (getValue() as string | undefined) ?? '—',
    },
    {
      accessorKey: 'invoiceRef',
      header: 'Against Invoice',
      cell: ({ getValue }) => (getValue() as string | undefined) ?? '—',
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ getValue }) => formatDate(getValue() as string),
    },
    { accessorKey: 'reason', header: 'Reason' },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ getValue }) => formatCompactCurrency(getValue() as number),
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
        title="Debit Notes"
        description="Extra charges raised against a client/project — scope additions, price corrections, or pass-through costs."
        action={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openAddModal}>
            Add Debit Note
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <SearchBar
            placeholder="Search debit note no, client, invoice, reason..."
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
                setStatus(v as DebitNoteStatus);
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
        data={debitNotesQuery.data?.data ?? []}
        isLoading={debitNotesQuery.isLoading}
        isError={debitNotesQuery.isError}
        onRetry={() => debitNotesQuery.refetch()}
        sorting={sorting}
        onSortingChange={(next) => {
          setSorting(next);
          setPage(1);
        }}
        emptyTitle="No debit notes yet"
        emptyDescription="Add your first debit note to bill a client for extra scope or costs."
        emptyAction={
          <Button leftIcon={<FileMinus className="h-4 w-4" />} onClick={openAddModal}>
            Add Debit Note
          </Button>
        }
      />

      {debitNotesQuery.data && debitNotesQuery.data.totalEntries > 0 && (
        <Pagination
          currentPage={debitNotesQuery.data.page}
          totalPages={debitNotesQuery.data.totalPages}
          totalEntries={debitNotesQuery.data.totalEntries}
          pageSize={debitNotesQuery.data.pageSize}
          onPageChange={setPage}
        />
      )}

      <DebitNoteFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        debitNote={editingDebitNote}
        onSubmit={handleFormSubmit}
        isSubmitting={createDebitNote.isPending || updateDebitNote.isPending}
      />
    </div>
  );
}
