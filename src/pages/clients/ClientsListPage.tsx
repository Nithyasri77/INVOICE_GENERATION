/**
 * Purpose: Clients module landing page (BRD: Clients Module Fields + Add/Edit/View Client)
 * Responsibilities: Compose PageHeader ("+ Add Client"), SearchBar, FilterBar (status), DataTable
 *                    (sortable, paginated), row ActionMenu (View/Edit/Delete), ClientFormModal
 *                    (add/edit), and ClientDetailDrawer (view) — this page holds only UI/local
 *                    state; all data access goes through the useClients hooks.
 * Dependencies: PageHeader, SearchBar, FilterBar, StatusBadge, ExportButton (shared), DataTable,
 *               Select, Pagination, Button (ui), ClientFormModal, ClientDetailDrawer (features),
 *               useClients/useCreateClient/useUpdateClient/useDeleteClient
 * Export: default
 */
import { useMemo, useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { Plus, Pencil, Eye, Trash2, Building2 } from 'lucide-react';
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
import {
  useClients,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
} from '../../features/clients/hooks/useClients';
import { ClientFormModal } from '../../features/clients/components/ClientFormModal';
import { ClientDetailDrawer } from '../../features/clients/components/ClientDetailDrawer';
import type { Client, ClientFormValues } from '../../types/client.types';
import type { ClientStatus } from '../../types/common.types';

const PAGE_SIZE = 10;

const STATUS_FILTER_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

export default function ClientsListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ClientStatus | undefined>(undefined);
  const [sorting, setSorting] = useState<SortingState>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
  const [viewingClient, setViewingClient] = useState<Client | undefined>(undefined);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      search: search || undefined,
      status,
      sortBy: sorting[0]?.id,
      sortDirection: (sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : undefined) as
        | 'asc'
        | 'desc'
        | undefined,
    }),
    [page, search, status, sorting]
  );

  const clientsQuery = useClients(queryParams);
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  function openAddModal() {
    setEditingClient(undefined);
    setFormOpen(true);
  }

  function openEditModal(client: Client) {
    setEditingClient(client);
    setDrawerOpen(false);
    setFormOpen(true);
  }

  function openViewDrawer(client: Client) {
    setViewingClient(client);
    setDrawerOpen(true);
  }

  function handleFormSubmit(values: ClientFormValues) {
    if (editingClient) {
      updateClient.mutate(
        { id: editingClient.id, values },
        {
          onSuccess: () => {
            toast.success(`${values.companyName} updated`);
            setFormOpen(false);
          },
          onError: () => toast.error('Failed to update client'),
        }
      );
    } else {
      createClient.mutate(values, {
        onSuccess: () => {
          toast.success(`${values.companyName} added`);
          setFormOpen(false);
        },
        onError: () => toast.error('Failed to add client'),
      });
    }
  }

  function handleDelete(client: Client) {
    if (!window.confirm(`Delete ${client.companyName}? This cannot be undone.`)) return;
    deleteClient.mutate(client.id, {
      onSuccess: () => toast.success(`${client.companyName} deleted`),
      onError: () => toast.error('Failed to delete client'),
    });
  }

  function handleExport(format: ExportFormat) {
    toast.info(`Exporting clients as ${format.toUpperCase()}...`);
  }

  const columns: ColumnDef<Client, any>[] = [
    { accessorKey: 'clientCode', header: 'Client ID' },
    { accessorKey: 'companyName', header: 'Company Name' },
    { accessorKey: 'contactPerson', header: 'Contact Person' },
    { accessorKey: 'phone', header: 'Phone' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'gstNumber', header: 'GST Number' },
    {
      accessorKey: 'totalRevenue',
      header: 'Revenue',
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
              { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: () => openViewDrawer(row.original) },
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
        title="Clients"
        description="All companies Shine Craft bills for — contact, GST, and revenue at a glance."
        action={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openAddModal}>
            Add Client
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <SearchBar
            placeholder="Search company, contact, email, GST..."
            onSearch={(q) => {
              setSearch(q);
              setPage(1);
            }}
            className="max-w-sm"
          />
          <FilterBar activeCount={status ? 1 : 0} onClear={() => setStatus(undefined)}>
            <Select
              label="Status"
              placeholder="All statuses"
              options={STATUS_FILTER_OPTIONS}
              value={status}
              onValueChange={(v) => {
                setStatus(v as ClientStatus);
                setPage(1);
              }}
            />
          </FilterBar>
        </div>
        <ExportButton onExport={handleExport} />
      </div>

      <DataTable
        columns={columns}
        data={clientsQuery.data?.data ?? []}
        isLoading={clientsQuery.isLoading}
        isError={clientsQuery.isError}
        onRetry={() => clientsQuery.refetch()}
        onRowClick={openViewDrawer}
        sorting={sorting}
        onSortingChange={(next) => {
          setSorting(next);
          setPage(1);
        }}
        emptyTitle="No clients yet"
        emptyDescription="Add your first client to start tracking projects and invoices for them."
        emptyAction={
          <Button leftIcon={<Building2 className="h-4 w-4" />} onClick={openAddModal}>
            Add Client
          </Button>
        }
      />

      {clientsQuery.data && clientsQuery.data.totalEntries > 0 && (
        <Pagination
          currentPage={clientsQuery.data.page}
          totalPages={clientsQuery.data.totalPages}
          totalEntries={clientsQuery.data.totalEntries}
          pageSize={clientsQuery.data.pageSize}
          onPageChange={setPage}
        />
      )}

      <ClientFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        client={editingClient}
        onSubmit={handleFormSubmit}
        isSubmitting={createClient.isPending || updateClient.isPending}
      />

      <ClientDetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        client={viewingClient}
        onEdit={() => viewingClient && openEditModal(viewingClient)}
      />
    </div>
  );
}
