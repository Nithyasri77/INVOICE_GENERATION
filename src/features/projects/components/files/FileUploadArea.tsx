/**
 * Purpose: Reusable drag-and-drop file upload component with progress bar & category picker
 * Responsibilities: Render drag-drop dropzone, file input trigger, category selector, progress indicator
 * Dependencies: lucide-react, Button, Select, Skeleton
 * Export: FileUploadArea
 */
import React, { useState, useRef } from 'react';
import { UploadCloud, File, CheckCircle2, X, Loader2 } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Select } from '../../../../components/ui/Select';
import type { FileCategory, FileTypeExtension } from '../../../../types/projectTabs.types';

export interface FileUploadAreaProps {
  onUpload: (fileData: { fileName: string; category: FileCategory; extension: FileTypeExtension; sizeBytes: number }) => Promise<void>;
  onClose?: () => void;
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

export function FileUploadArea({ onUpload, onClose }: FileUploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<FileCategory>('Project Documents');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const getExtension = (fileName: string): FileTypeExtension => {
    const ext = fileName.split('.').pop()?.toUpperCase() ?? '';
    if (['PDF'].includes(ext)) return 'PDF';
    if (['DOC', 'DOCX'].includes(ext)) return 'DOCX';
    if (['XLS', 'XLSX', 'CSV'].includes(ext)) return 'XLSX';
    if (['PNG'].includes(ext)) return 'PNG';
    if (['JPG', 'JPEG'].includes(ext)) return 'JPG';
    if (['ZIP', 'RAR', '7Z'].includes(ext)) return 'ZIP';
    return 'PDF';
  };

  const handleStartUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setProgress(15);

    // Simulate progress updates
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 150);

    setTimeout(async () => {
      clearInterval(interval);
      setProgress(100);

      const ext = getExtension(selectedFile.name);

      await onUpload({
        fileName: selectedFile.name,
        category,
        extension: ext,
        sizeBytes: selectedFile.size || 1500000,
      });

      setUploading(false);
      setProgress(0);
      setSelectedFile(null);
      if (onClose) onClose();
    }, 900);
  };

  return (
    <div className="rounded-xl border border-surface-border bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">Upload Project File</h3>
          <p className="text-xs text-ink-500">Drag & drop your files or select from system</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-ink-400 hover:bg-surface-subtle hover:text-ink-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`sm:col-span-2 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-primary-500 bg-primary-50/50'
              : selectedFile
              ? 'border-success-400 bg-success-50/30'
              : 'border-surface-border hover:border-primary-400 hover:bg-surface-subtle'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.docx,.doc,.xlsx,.xls,.png,.jpg,.jpeg,.zip"
          />

          {selectedFile ? (
            <div className="space-y-2">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-success-100 text-success-700">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-ink-900">{selectedFile.name}</p>
                <p className="text-[11px] text-ink-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Ready for upload
                </p>
              </div>
              <p className="text-[10px] text-primary-600 underline">Click to choose a different file</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                <UploadCloud className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-ink-900">
                  Drag & drop files here, or <span className="text-primary-600 underline">browse</span>
                </p>
                <p className="text-[11px] text-ink-400 mt-0.5">
                  Supports PDF, DOCX, XLSX, PNG, JPG, ZIP (max 25MB)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Category Picker & Controls */}
        <div className="space-y-3 flex flex-col justify-between">
          <Select
            label="Document Category"
            options={CATEGORY_OPTIONS}
            value={category}
            onValueChange={(val) => setCategory(val as FileCategory)}
          />

          <div className="space-y-2 pt-2">
            {uploading && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-ink-600 font-medium">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-border">
                  <div
                    className="h-full bg-primary-600 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <Button
              className="w-full"
              disabled={!selectedFile || uploading}
              isLoading={uploading}
              leftIcon={uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <File className="h-4 w-4" />}
              onClick={handleStartUpload}
            >
              {uploading ? 'Uploading...' : 'Confirm Upload'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
