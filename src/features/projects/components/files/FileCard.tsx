/**
 * Purpose: Responsive Grid View Card component for Project Files
 * Responsibilities: Render card thumbnail, file type badge, name, size, category tag, upload date, actions menu
 * Dependencies: ActionMenu, formatDate, formatFileSize, getFileIcon
 * Export: FileCard
 */
import { Eye, Download, Edit3, FolderInput, Trash2, FileText, Image as ImageIcon, FileSpreadsheet, FileArchive } from 'lucide-react';
import { ActionMenu } from '../../../../components/shared/ActionMenu';
import { formatDate } from '../../../../utils/formatDate';
import { formatFileSize } from './FileTable';
import type { ProjectFile, FileTypeExtension } from '../../../../types/projectTabs.types';

export interface FileCardProps {
  file: ProjectFile;
  onPreview: (file: ProjectFile) => void;
  onDownload: (file: ProjectFile) => void;
  onRename: (file: ProjectFile) => void;
  onMove: (file: ProjectFile) => void;
  onDelete: (file: ProjectFile) => void;
}

export function renderCardThumbnail(extension: FileTypeExtension) {
  switch (extension) {
    case 'PDF':
      return (
        <div className="flex h-20 w-full items-center justify-center rounded-t-xl bg-gradient-to-br from-red-50 to-red-100 text-red-600">
          <FileText className="h-10 w-10 opacity-80" />
        </div>
      );
    case 'DOCX':
      return (
        <div className="flex h-20 w-full items-center justify-center rounded-t-xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600">
          <FileText className="h-10 w-10 opacity-80" />
        </div>
      );
    case 'XLSX':
      return (
        <div className="flex h-20 w-full items-center justify-center rounded-t-xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600">
          <FileSpreadsheet className="h-10 w-10 opacity-80" />
        </div>
      );
    case 'PNG':
    case 'JPG':
      return (
        <div className="flex h-20 w-full items-center justify-center rounded-t-xl bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600">
          <ImageIcon className="h-10 w-10 opacity-80" />
        </div>
      );
    case 'ZIP':
      return (
        <div className="flex h-20 w-full items-center justify-center rounded-t-xl bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600">
          <FileArchive className="h-10 w-10 opacity-80" />
        </div>
      );
    default:
      return (
        <div className="flex h-20 w-full items-center justify-center rounded-t-xl bg-gradient-to-br from-gray-50 to-gray-100 text-gray-600">
          <FileText className="h-10 w-10 opacity-80" />
        </div>
      );
  }
}

export function FileCard({ file, onPreview, onDownload, onRename, onMove, onDelete }: FileCardProps) {
  return (
    <div className="surface-card flex flex-col justify-between overflow-hidden rounded-xl border border-surface-border transition-all hover:shadow-md">
      {/* Thumbnail Header */}
      <div className="relative group cursor-pointer" onClick={() => onPreview(file)}>
        {renderCardThumbnail(file.extension)}

        {/* Extension Pill */}
        <span className="absolute top-2 left-2 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-bold text-ink-700 shadow-sm backdrop-blur-sm">
          {file.extension}
        </span>
      </div>

      {/* Card Content Body */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h4
              className="text-xs font-bold text-ink-900 line-clamp-1 cursor-pointer hover:text-primary-600"
              title={file.fileName}
              onClick={() => onPreview(file)}
            >
              {file.fileName}
            </h4>

            <ActionMenu
              items={[
                {
                  label: 'Preview',
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => onPreview(file),
                },
                {
                  label: 'Download',
                  icon: <Download className="h-4 w-4" />,
                  onClick: () => onDownload(file),
                },
                {
                  label: 'Rename',
                  icon: <Edit3 className="h-4 w-4" />,
                  onClick: () => onRename(file),
                },
                {
                  label: 'Move Category',
                  icon: <FolderInput className="h-4 w-4" />,
                  onClick: () => onMove(file),
                },
                {
                  label: 'Delete',
                  icon: <Trash2 className="h-4 w-4" />,
                  destructive: true,
                  separatorBefore: true,
                  onClick: () => onDelete(file),
                },
              ]}
            />
          </div>

          <span className="inline-block rounded bg-surface-subtle px-2 py-0.5 text-[10px] font-semibold text-ink-600">
            {file.category}
          </span>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-surface-border/60 pt-2 text-[11px] text-ink-500">
          <span>{formatFileSize(file.sizeBytes)}</span>
          <span>{formatDate(file.uploadDate)}</span>
        </div>
      </div>
    </div>
  );
}
