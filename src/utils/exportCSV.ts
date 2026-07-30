/**
 * Purpose: Production-ready reusable CSV Exporter utility
 * Responsibilities: Convert typed array datasets into RFC-4180 compliant CSV files with UTF-8 BOM,
 *                    escaping special characters, commas, quotes, line breaks, and handling null/undefined values.
 * Dependencies: papaparse
 * Export: exportCSV(), CSVColumn, ExportCSVOptions
 */
import Papa from 'papaparse';

export interface CSVColumn<T> {
  header: string;
  accessor: (item: T) => string | number | boolean | null | undefined;
}

export interface ExportCSVOptions<T> {
  filename: string;
  data: T[];
  columns: CSVColumn<T>[];
}

export function exportCSV<T>({ filename, data, columns }: ExportCSVOptions<T>): void {
  if (!data || data.length === 0) {
    throw new Error('No data available to export');
  }

  // 1. Map column headers
  const headers = columns.map((col) => col.header);

  // 2. Map data rows safely
  const rows = data.map((item) =>
    columns.map((col) => {
      try {
        const value = col.accessor(item);
        if (value == null) return '';
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        return String(value);
      } catch {
        return '';
      }
    })
  );

  // 3. Unparse using PapaParse for robust RFC-4180 compliance
  const csvContent = Papa.unparse({
    fields: headers,
    data: rows,
  });

  // 4. Prepend UTF-8 BOM (\uFEFF) for Microsoft Excel compatibility
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });

  // 5. Trigger browser download
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const finalFilename = filename.toLowerCase().endsWith('.csv') ? filename : `${filename}.csv`;
  link.setAttribute('href', url);
  link.setAttribute('download', finalFilename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
