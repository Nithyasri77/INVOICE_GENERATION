/**
 * Purpose: Credit Notes module landing page — replaces the earlier PlaceholderPage stub now that
 *          this module is generated
 * Responsibilities: Compose PageHeader ("+ Add Credit Note"), SearchBar, FilterBar (status/client),
 *                    DataTable (sortable, paginated), row ActionMenu (Edit/Delete),
 *                    CreditNoteFormModal (add/edit) — this page holds only UI/local state; all
 *                    data access goes through the useCreditNotes hooks.
 * Dependencies: PageHeader, SearchBar, FilterBar, StatusBadge, ExportButton (shared), DataTable,
 *               Select, Pagination, Button (ui), CreditNoteFormModal (features), useCreditNotes
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
  useCreditNotes,
  useCreateCreditNote,
  useUpdateCreditNote,
  useDeleteCreditNote,
} from '../../../features/credit-notes/hooks/useCreditNotes';
import { useClientOptions } from '../../../features/projects/hooks/useProjects';
import { CreditNoteFormModal } from '../../../features/credit-notes/components/CreditNoteFormModal';
import type { CreditNote, CreditNoteFormValues } from '../../../types/creditNote.types';
import type { CreditNoteStatus } from '../../../types/common.types';

const PAGE_SIZE = 10;

const STATUS_FILTER_OPTIONS = [
  { value: 'Open', label: 'Open' },
  { value: 'Applied', label: 'Applied' },
  { value: 'Cancelled', label: 'Cancelled' },
];

export default function CreditNotesListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<CreditNoteStatus | undefined>(undefined);
  const [clientId, setClientId] = useState<string | undefined>(undefined);
  const [sorting, setSorting] = useState<SortingState>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingCreditNote, setEditingCreditNote] = useState<CreditNote | undefined>(undefined);

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

  const creditNotesQuery = useCreditNotes(queryParams);
  const createCreditNote = useCreateCreditNote();
  const updateCreditNote = useUpdateCreditNote();
  const deleteCreditNote = useDeleteCreditNote();

  function openAddModal() {
    setEditingCreditNote(undefined);
    setFormOpen(true);
  }

  function openEditModal(creditNote: CreditNote) {
    setEditingCreditNote(creditNote);
    setFormOpen(true);
  }

  function handleFormSubmit(values: CreditNoteFormValues) {
    if (editingCreditNote) {
      updateCreditNote.mutate(
        { id: editingCreditNote.id, values },
        {
          onSuccess: () => {
            toast.success(`${editingCreditNote.creditNoteNo} updated`);
            setFormOpen(false);
          },
          onError: () => toast.error('Failed to update credit note'),
        }
      );
    } else {
      createCreditNote.mutate(values, {
        onSuccess: () => {
          toast.success('Credit note added');
          setFormOpen(false);
        },
        onError: () => toast.error('Failed to add credit note'),
      });
    }
  }

  function handleDelete(creditNote: CreditNote) {
    if (!window.confirm(`Delete credit note ${creditNote.creditNoteNo}? This cannot be undone.`)) return;
    deleteCreditNote.mutate(creditNote.id, {
      onSuccess: () => toast.success(`${creditNote.creditNoteNo} deleted`),
      onError: () => toast.error('Failed to delete credit note'),
    });
  }

  function handleExport(format: ExportFormat) {
    toast.info(`Exporting credit notes as ${format.toUpperCase()}...`);
  }

  const columns: ColumnDef<CreditNote, any>[] = [
    { accessorKey: 'creditNoteNo', header: 'Credit Note No' },
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
        title="Credit Notes"
        description="Reductions against a client/project — discounts, refunds, overbilling corrections, or goodwill adjustments."
        action={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openAddModal}>
            Add Credit Note
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <SearchBar
            placeholder="Search credit note no, client, invoice, reason..."
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
                setStatus(v as CreditNoteStatus);
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
        data={creditNotesQuery.data?.data ?? []}
        isLoading={creditNotesQuery.isLoading}
        isError={creditNotesQuery.isError}
        onRetry={() => creditNotesQuery.refetch()}
        sorting={sorting}
        onSortingChange={(next) => {
          setSorting(next);
          setPage(1);
        }}
        emptyTitle="No credit notes yet"
        emptyDescription="Add your first credit note to record discounts, refunds, or billing corrections."
        emptyAction={
          <Button leftIcon={<FileMinus className="h-4 w-4" />} onClick={openAddModal}>
            Add Credit Note
          </Button>
        }
      />

      {creditNotesQuery.data && creditNotesQuery.data.totalEntries > 0 && (
        <Pagination
          currentPage={creditNotesQuery.data.page}
          totalPages={creditNotesQuery.data.totalPages}
          totalEntries={creditNotesQuery.data.totalEntries}
          pageSize={creditNotesQuery.data.pageSize}
          onPageChange={setPage}
        />
      )}

      <CreditNoteFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        creditNote={editingCreditNote}
        onSubmit={handleFormSubmit}
        isSubmitting={createCreditNote.isPending || updateCreditNote.isPending}
      />
    </div>
  );
}
