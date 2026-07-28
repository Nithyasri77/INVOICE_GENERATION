/**
 * Purpose: Responsive List View table component for Project Files
 * Responsibilities: Render columns: File Name, Category, Uploaded By, Size, Upload Date, Actions
 * Dependencies: DataTable, ActionMenu, formatDate, formatFileSize, FileTypeBadge
 * Export: FileTable
 */
import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye, Download, Edit3, FolderInput, Trash2 } from 'lucide-react';
import { DataTable } from '../../../../components/ui/Table';
import { ActionMenu } from '../../../../components/shared/ActionMenu';
import { formatDate } from '../../../../utils/formatDate';
import type { ProjectFile, FileTypeExtension } from '../../../../types/projectTabs.types';

export interface FileTableProps {
  files: ProjectFile[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onPreview: (file: ProjectFile) => void;
  onDownload: (file: ProjectFile) => void;
  onRename: (file: ProjectFile) => void;
  onMove: (file: ProjectFile) => void;
  onDelete: (file: ProjectFile) => void;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (col: string) => void;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function getFileIcon(extension: FileTypeExtension) {
  switch (extension) {
    case 'PDF':
      return <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 font-bold text-xs">PDF</div>;
    case 'DOCX':
      return <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold text-xs">DOC</div>;
    case 'XLSX':
      return <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 font-bold text-xs">XLS</div>;
    case 'PNG':
    case 'JPG':
      return <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 font-bold text-xs">IMG</div>;
    case 'ZIP':
      return <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 font-bold text-xs">ZIP</div>;
    default:
      return <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-600 font-bold text-xs">FILE</div>;
  }
}

export function FileTable({
  files,
  isLoading,
  isError,
  onRetry,
  onPreview,
  onDownload,
  onRename,
  onMove,
  onDelete,
  sortBy,
  sortDirection,
  onSort,
}: FileTableProps) {
  const columns = useMemo<ColumnDef<ProjectFile, unknown>[]>(
    () => [
      {
        accessorKey: 'fileName',
        header: 'File Name',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            {getFileIcon(row.original.extension)}
            <div>
              <span className="font-semibold text-ink-900 block max-w-[260px] truncate hover:text-primary-600 cursor-pointer" onClick={() => onPreview(row.original)}>
                {row.original.fileName}
              </span>
              <span className="text-[11px] text-ink-400 font-mono">{row.original.extension} document</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ getValue }) => (
          <span className="inline-flex items-center rounded-md bg-surface-subtle border border-surface-border/60 px-2.5 py-1 text-xs font-medium text-ink-700">
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'uploadedBy',
        header: 'Uploaded By',
        cell: ({ getValue }) => <span className="text-xs text-ink-700">{getValue() as string}</span>,
      },
      {
        accessorKey: 'sizeBytes',
        header: 'Size',
        cell: ({ getValue }) => <span className="font-mono text-xs text-ink-600">{formatFileSize(getValue() as number)}</span>,
      },
      {
        accessorKey: 'uploadDate',
        header: 'Upload Date',
        cell: ({ getValue }) => <span className="text-xs text-ink-600">{formatDate(getValue() as string)}</span>,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <ActionMenu
            items={[
              {
                label: 'Preview',
                icon: <Eye className="h-4 w-4" />,
                onClick: () => onPreview(row.original),
              },
              {
                label: 'Download',
                icon: <Download className="h-4 w-4" />,
                onClick: () => onDownload(row.original),
              },
              {
                label: 'Rename',
                icon: <Edit3 className="h-4 w-4" />,
                onClick: () => onRename(row.original),
              },
              {
                label: 'Move Category',
                icon: <FolderInput className="h-4 w-4" />,
                onClick: () => onMove(row.original),
              },
              {
                label: 'Delete',
                icon: <Trash2 className="h-4 w-4" />,
                destructive: true,
                separatorBefore: true,
                onClick: () => onDelete(row.original),
              },
            ]}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onPreview, onDownload, onRename, onMove, onDelete]
  );

  return (
    <DataTable
      columns={columns}
      data={files}
      isLoading={isLoading}
      isError={isError}
      onRetry={onRetry}
      emptyTitle="No project files uploaded"
      emptyDescription="Upload files to keep all project documents, agreements, and receipts organized in one place."
      sorting={sortBy ? [{ id: sortBy, desc: sortDirection === 'desc' }] : []}
      onSortingChange={(sorting) => sorting[0] && onSort?.(sorting[0].id)}
    />
  );
}
