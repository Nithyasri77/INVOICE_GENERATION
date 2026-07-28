/**
 * Purpose: Interactive File Preview Modal component for viewing PDF, DOCX, XLSX, PNG, JPG, ZIP file previews
 * Responsibilities: Render simulated file content viewer, metadata header, download & print actions
 * Dependencies: Modal, Button, formatDate, formatFileSize
 * Export: FilePreviewModal
 */
import { Download, Printer, FileText, Image as ImageIcon, FileSpreadsheet, FileArchive, CheckCircle2 } from 'lucide-react';
import { Modal, ModalBody, ModalFooter } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import { formatDate } from '../../../../utils/formatDate';
import { formatFileSize } from './FileTable';
import type { ProjectFile } from '../../../../types/projectTabs.types';

export interface FilePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: ProjectFile | null;
  onDownload: (file: ProjectFile) => void;
}

export function FilePreviewModal({ open, onOpenChange, file, onDownload }: FilePreviewModalProps) {
  if (!file) return null;

  const renderPreviewContent = () => {
    switch (file.extension) {
      case 'PDF':
        return (
          <div className="flex flex-col items-center justify-center rounded-xl border border-surface-border bg-gray-900 p-8 text-white min-h-[320px] space-y-4">
            <div className="rounded-2xl bg-red-600/20 p-4 text-red-400">
              <FileText className="h-16 w-16" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-semibold text-sm text-gray-200">{file.fileName}</h4>
              <p className="text-xs text-gray-400">PDF Document · {formatFileSize(file.sizeBytes)} · 4 Pages</p>
            </div>
            <div className="w-full max-w-md rounded-lg bg-gray-800 p-4 text-xs text-gray-300 space-y-2 border border-gray-700">
              <div className="flex justify-between border-b border-gray-700 pb-2">
                <span>Document Status:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Verified PDF
                </span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Project specification document and terms of agreement signed digitally.
              </p>
            </div>
          </div>
        );

      case 'DOCX':
        return (
          <div className="flex flex-col items-center justify-center rounded-xl border border-surface-border bg-blue-900/10 p-8 min-h-[320px] space-y-4">
            <div className="rounded-2xl bg-blue-100 p-4 text-blue-600">
              <FileText className="h-16 w-16" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-semibold text-sm text-ink-900">{file.fileName}</h4>
              <p className="text-xs text-ink-500">Microsoft Word Document · {formatFileSize(file.sizeBytes)}</p>
            </div>
            <div className="w-full max-w-md rounded-lg bg-white p-4 text-xs text-ink-700 space-y-2 border border-surface-border shadow-sm">
              <div className="h-3 w-3/4 rounded bg-gray-200" />
              <div className="h-3 w-full rounded bg-gray-100" />
              <div className="h-3 w-5/6 rounded bg-gray-100" />
              <div className="h-3 w-1/2 rounded bg-gray-100" />
            </div>
          </div>
        );

      case 'XLSX':
        return (
          <div className="rounded-xl border border-surface-border bg-white p-4 space-y-3">
            <div className="flex items-center gap-3 border-b border-surface-border pb-3">
              <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-xs text-ink-900">{file.fileName}</h4>
                <p className="text-[11px] text-ink-500">Excel Worksheet Preview · 3 Sheets</p>
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg border border-surface-border">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-surface-subtle border-b border-surface-border text-ink-600">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Item Description</th>
                    <th className="px-3 py-2">Qty</th>
                    <th className="px-3 py-2">Rate (₹)</th>
                    <th className="px-3 py-2">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border text-ink-700">
                  <tr>
                    <td className="px-3 py-2 text-ink-400">1</td>
                    <td className="px-3 py-2">System Architecture Setup</td>
                    <td className="px-3 py-2">1</td>
                    <td className="px-3 py-2">150,000</td>
                    <td className="px-3 py-2 font-bold text-ink-900">150,000</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-ink-400">2</td>
                    <td className="px-3 py-2">UI/UX Prototype Development</td>
                    <td className="px-3 py-2">1</td>
                    <td className="px-3 py-2">250,000</td>
                    <td className="px-3 py-2 font-bold text-ink-900">250,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'PNG':
      case 'JPG':
        return (
          <div className="flex flex-col items-center justify-center rounded-xl border border-surface-border bg-gray-100 p-6 min-h-[300px]">
            <div className="flex flex-col items-center space-y-3">
              <div className="flex h-48 w-full max-w-sm items-center justify-center rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-600 text-white shadow-md">
                <ImageIcon className="h-20 w-20 opacity-90" />
              </div>
              <p className="text-xs text-ink-500 font-medium">Image Preview · 1920 x 1080 px</p>
            </div>
          </div>
        );

      case 'ZIP':
        return (
          <div className="rounded-xl border border-surface-border bg-amber-50/50 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-2.5 text-amber-700">
                <FileArchive className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-xs text-ink-900">{file.fileName}</h4>
                <p className="text-[11px] text-ink-500">ZIP Compressed Archive · 5 Included Files</p>
              </div>
            </div>
            <div className="rounded-lg bg-white p-3 text-xs space-y-2 border border-surface-border font-mono text-ink-700">
              <div className="flex justify-between text-ink-500 text-[11px] border-b pb-1">
                <span>Archive Contents</span>
                <span>Size</span>
              </div>
              <div className="flex justify-between">
                <span>📁 assets/logo.png</span>
                <span>450 KB</span>
              </div>
              <div className="flex justify-between">
                <span>📁 docs/specification.pdf</span>
                <span>1.8 MB</span>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex h-48 items-center justify-center rounded-xl border border-surface-border bg-surface-subtle text-ink-500 text-xs">
            Preview unavailable for this file type.
          </div>
        );
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={`Preview File — ${file.fileName}`} size="lg">
      <ModalBody className="space-y-4">
        {/* File Metadata Bar */}
        <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4 rounded-lg bg-surface-subtle p-3 border border-surface-border/60">
          <div>
            <span className="text-ink-400 block">Category</span>
            <span className="font-semibold text-ink-900">{file.category}</span>
          </div>
          <div>
            <span className="text-ink-400 block">File Size</span>
            <span className="font-mono font-medium text-ink-900">{formatFileSize(file.sizeBytes)}</span>
          </div>
          <div>
            <span className="text-ink-400 block">Uploaded By</span>
            <span className="font-medium text-ink-900">{file.uploadedBy}</span>
          </div>
          <div>
            <span className="text-ink-400 block">Upload Date</span>
            <span className="font-medium text-ink-900">{formatDate(file.uploadDate)}</span>
          </div>
        </div>

        {/* Dynamic Content Viewport */}
        {renderPreviewContent()}
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" leftIcon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>
          Print
        </Button>
        <Button leftIcon={<Download className="h-4 w-4" />} onClick={() => onDownload(file)}>
          Download File
        </Button>
      </ModalFooter>
    </Modal>
  );
}
