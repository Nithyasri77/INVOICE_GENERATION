/**
 * Purpose: Export action button seen on table toolbars and Reports (matches wireframe's "Export")
 * Responsibilities: Trigger export with a format choice (CSV/PDF/Excel) via dropdown, loading state
 * Dependencies: Dropdown/DropdownItem (ui), Button (ui), lucide-react (Download)
 * Export: ExportButton
 */
import { Download } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Dropdown, DropdownItem } from '../../ui/Dropdown';

export type ExportFormat = 'csv' | 'pdf' | 'excel';

export interface ExportButtonProps {
  onExport: (format: ExportFormat) => void;
  formats?: ExportFormat[];
  isLoading?: boolean;
}

const FORMAT_LABELS: Record<ExportFormat, string> = {
  csv: 'Export as CSV',
  pdf: 'Export as PDF',
  excel: 'Export as Excel',
};

export function ExportButton({ onExport, formats = ['csv', 'pdf'], isLoading }: ExportButtonProps) {
  return (
    <Dropdown
      trigger={
        <Button variant="secondary" leftIcon={<Download className="h-4 w-4" />} isLoading={isLoading}>
          Export
        </Button>
      }
    >
      {formats.map((format) => (
        <DropdownItem key={format} onSelect={() => onExport(format)}>
          {FORMAT_LABELS[format]}
        </DropdownItem>
      ))}
    </Dropdown>
  );
}
