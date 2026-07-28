/**
 * Purpose: Full ERP Files Tab for Project Details (Zoho Books / ERPNext style)
 * Responsibilities: Assemble FileToolbar, FileUploadArea, FileTable (List View), FileCard (Grid View),
 *                    FilePreviewModal, RenameModal, MoveModal, and connect to mock useProjectFiles hooks
 * Dependencies: FileToolbar, FileUploadArea, FileTable, FileCard, FilePreviewModal, Select, Input, Modal, Button, Pagination
 * Export: ProjectFilesTab
 */
import { useState } from 'react';
import { useTableState } from '../../../../hooks/useTableState';
import { useDisclosure } from '../../../../hooks/useDisclosure';
import { Modal, ModalBody, ModalFooter } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { toast } from '../../../../components/ui/Toast';

import { FileToolbar } from './FileToolbar';
import { FileUploadArea } from './FileUploadArea';
import { FileTable } from './FileTable';
import { FileCard } from './FileCard';
import { FilePreviewModal } from './FilePreviewModal';

import {
  useProjectFiles,
  useUploadProjectFile,
  useRenameProjectFile,
  useMoveProjectFileCategory,
  useDeleteProjectFile,
} from '../../hooks/useProjectTabs';

import type { ProjectFile, FileCategory, FileTypeExtension } from '../../../../types/projectTabs.types';

export interface ProjectFilesTabProps {
  projectId: string;
}

const CATEGORY_OPTIONS: { value: FileCategory; label: string }[] = [
  { value: 'Quotation', label: 'Quotation' },
  { value: 'Agreement', label: 'Agreement' },
  { value: 'Invoice PDFs', label: 'Invoice PDF' },
  { value: 'Receipts', label: 'Receipt' },
  { value: 'Design Files', label: 'Design Files' },
  { value: 'Project Documents', label: 'Project Documents' },
  { value: 'Images', label: 'Images' },
  { value: 'Other', label: 'Other' },
];

export function ProjectFilesTab({ projectId }: ProjectFilesTabProps) {
  const { search, sortBy, sortDirection, handleSearch, handleSort } = useTableState();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // React Query hooks for file management
  const filesQuery = useProjectFiles({
    projectId,
    search,
    category: selectedCategory,
    sortBy,
    sortDirection,
  });

  const uploadFileMutation = useUploadProjectFile();
  const renameFileMutation = useRenameProjectFile();
  const moveFileMutation = useMoveProjectFileCategory();
  const deleteFileMutation = useDeleteProjectFile();

  // Selected file state for modals
  const [previewFile, setPreviewFile] = useState<ProjectFile | null>(null);
  const [renameFile, setRenameFile] = useState<ProjectFile | null>(null);
  const [moveFile, setMoveFile] = useState<ProjectFile | null>(null);

  const [newFileNameInput, setNewFileNameInput] = useState('');
  const [newCategoryInput, setNewCategoryInput] = useState<FileCategory>('Project Documents');

  const previewModal = useDisclosure();
  const renameModal = useDisclosure();
  const moveModal = useDisclosure();

  // Handlers
  const handleUploadSubmit = async (fileData: { fileName: string; category: FileCategory; extension: FileTypeExtension; sizeBytes: number }) => {
    await uploadFileMutation.mutateAsync({
      projectId,
      fileName: fileData.fileName,
      category: fileData.category,
      extension: fileData.extension,
      fileSizeBytes: fileData.sizeBytes,
    });
  };

  const handleDownload = (file: ProjectFile) => {
    toast.success(`Downloading ${file.fileName}...`);
  };

  const handleOpenPreview = (file: ProjectFile) => {
    setPreviewFile(file);
    previewModal.open();
  };

  const handleOpenRename = (file: ProjectFile) => {
    setRenameFile(file);
    setNewFileNameInput(file.fileName);
    renameModal.open();
  };

  const handleConfirmRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameFile || !newFileNameInput.trim()) return;
    await renameFileMutation.mutateAsync({
      fileId: renameFile.id,
      newFileName: newFileNameInput.trim(),
    });
    renameModal.close();
  };

  const handleOpenMove = (file: ProjectFile) => {
    setMoveFile(file);
    setNewCategoryInput(file.category);
    moveModal.open();
  };

  const handleConfirmMove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moveFile) return;
    await moveFileMutation.mutateAsync({
      fileId: moveFile.id,
      newCategory: newCategoryInput,
    });
    moveModal.close();
  };

  const handleDeleteFile = (file: ProjectFile) => {
    if (window.confirm(`Delete file "${file.fileName}"? This action cannot be undone.`)) {
      deleteFileMutation.mutate(file.id);
    }
  };

  const fileList = filesQuery.data ?? [];

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <FileToolbar
        search={search}
        onSearch={handleSearch}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onToggleUpload={() => setIsUploadOpen(!isUploadOpen)}
        isUploadOpen={isUploadOpen}
      />

      {/* Drag & Drop Upload Area (Collapsible) */}
      {isUploadOpen && (
        <FileUploadArea
          onUpload={handleUploadSubmit}
          onClose={() => setIsUploadOpen(false)}
        />
      )}

      {/* List or Grid Display */}
      {viewMode === 'list' ? (
        <FileTable
          files={fileList}
          isLoading={filesQuery.isLoading}
          isError={filesQuery.isError}
          onRetry={() => filesQuery.refetch()}
          onPreview={handleOpenPreview}
          onDownload={handleDownload}
          onRename={handleOpenRename}
          onMove={handleOpenMove}
          onDelete={handleDeleteFile}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      ) : (
        /* Grid View */
        <div className="space-y-4">
          {filesQuery.isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="surface-card h-48 rounded-xl p-4 space-y-3">
                  <div className="h-20 w-full rounded-lg bg-ink-900/[0.06] animate-pulse" />
                  <div className="h-4 w-3/4 rounded bg-ink-900/[0.06] animate-pulse" />
                  <div className="h-3 w-1/2 rounded bg-ink-900/[0.06] animate-pulse" />
                </div>
              ))}
            </div>
          ) : fileList.length === 0 ? (
            <div className="surface-card p-12 text-center space-y-3">
              <p className="text-sm font-semibold text-ink-900">No files found</p>
              <p className="text-xs text-ink-500">Upload documents or adjust category filter.</p>
              <Button onClick={() => setIsUploadOpen(true)}>Upload File</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {fileList.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  onPreview={handleOpenPreview}
                  onDownload={handleDownload}
                  onRename={handleOpenRename}
                  onMove={handleOpenMove}
                  onDelete={handleDeleteFile}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* File Preview Modal */}
      <FilePreviewModal
        open={previewModal.isOpen}
        onOpenChange={previewModal.close}
        file={previewFile}
        onDownload={handleDownload}
      />

      {/* Rename File Modal */}
      <Modal open={renameModal.isOpen} onOpenChange={renameModal.close} title="Rename File">
        <form onSubmit={handleConfirmRename}>
          <ModalBody className="space-y-3">
            <Input
              label="File Name"
              required
              value={newFileNameInput}
              onChange={(e) => setNewFileNameInput(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button type="button" variant="secondary" onClick={renameModal.close}>
              Cancel
            </Button>
            <Button type="submit" isLoading={renameFileMutation.isPending}>
              Save Name
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Move Category Modal */}
      <Modal open={moveModal.isOpen} onOpenChange={moveModal.close} title="Move Category">
        <form onSubmit={handleConfirmMove}>
          <ModalBody className="space-y-3">
            <Select
              label="Select Target Category"
              options={CATEGORY_OPTIONS}
              value={newCategoryInput}
              onValueChange={(val) => setNewCategoryInput(val as FileCategory)}
            />
          </ModalBody>
          <ModalFooter>
            <Button type="button" variant="secondary" onClick={moveModal.close}>
              Cancel
            </Button>
            <Button type="submit" isLoading={moveFileMutation.isPending}>
              Move File
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
