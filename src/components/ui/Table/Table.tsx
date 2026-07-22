/**
 * Purpose: The single Table implementation used by every module (Clients, Invoices, Payments,
 *          Projects, Milestones, Receipts, AMC Contracts, Reports...). Column defs + row data are
 *          supplied by each feature; this component only handles rendering/sorting/states.
 * Responsibilities: Sticky header, sortable column headers, row click, and built-in
 *                    loading (TableSkeleton) / error (ErrorState) / empty (EmptyState) states.
 *                    Pagination is rendered separately via <Pagination /> by the caller, since
 *                    server-side pagination needs page/totalEntries from the query, not the table.
 * Dependencies: @tanstack/react-table, TableSkeleton, ErrorState, EmptyState, cn()
 * Export: DataTable
 */
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { TableSkeleton } from '../Skeleton';
import { ErrorState } from '../ErrorState';
import { EmptyState } from '../EmptyState';

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  onRowClick?: (row: TData) => void;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  className?: string;
}

export function DataTable<TData>({
  columns,
  data,
  isLoading,
  isError,
  onRetry,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search or filters.',
  emptyAction,
  onRowClick,
  sorting,
  onSortingChange,
  className,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: sorting ? { sorting } : undefined,
    onSortingChange: onSortingChange ? (updater) => {
      const next = typeof updater === 'function' ? updater(sorting ?? []) : updater;
      onSortingChange(next);
    } : undefined,
    manualSorting: true, // server-side sort — most lists here hit the API for sorted data
  });

  if (isLoading) {
    return (
      <div className={cn('surface-card overflow-hidden', className)}>
        <TableSkeleton columns={columns.length} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn('surface-card', className)}>
        <ErrorState onRetry={onRetry} />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn('surface-card', className)}>
        <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
      </div>
    );
  }

  return (
    <div className={cn('surface-card overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-surface-bg">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortDir = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      className={cn(
                        'whitespace-nowrap border-b border-surface-border px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500',
                        canSort && 'cursor-pointer select-none hover:text-ink-900'
                      )}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <span className="inline-flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort &&
                          (sortDir === 'asc' ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : sortDir === 'desc' ? (
                            <ChevronDown className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronsUpDown className="h-3.5 w-3.5 text-ink-400" />
                          ))}
                      </span>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                className={cn(
                  'border-b border-surface-border last:border-0',
                  onRowClick && 'cursor-pointer hover:bg-surface-bg'
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-ink-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
