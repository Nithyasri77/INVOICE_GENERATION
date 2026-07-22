/**
 * Purpose: Combined pagination + search + sort state for any TanStack Table list page
 * Responsibilities: Hold page/pageSize/search/sortBy/sortDirection and expose setters + a
 *                    ready-to-send TableQueryParams object for the service layer
 * Dependencies: react, common.types (TableQueryParams, SortDirection)
 * Export: useTableState()
 */
import { useMemo, useState } from 'react';
import type { SortDirection, TableQueryParams } from '../types/common.types';

export interface UseTableStateOptions {
  initialPageSize?: number;
}

export function useTableState(options: UseTableStateOptions = {}) {
  const { initialPageSize = 10 } = options;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1); // reset to first page on new search
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const queryParams: TableQueryParams = useMemo(
    () => ({ page, pageSize, search: search || undefined, sortBy, sortDirection }),
    [page, pageSize, search, sortBy, sortDirection]
  );

  return {
    page,
    pageSize,
    search,
    sortBy,
    sortDirection,
    setPage,
    setPageSize,
    handleSearch,
    handleSort,
    queryParams,
  };
}
