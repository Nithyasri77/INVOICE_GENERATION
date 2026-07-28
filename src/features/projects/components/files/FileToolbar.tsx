/**
 * Purpose: Top toolbar for Files tab with Upload File button, Search input, Category filter, and Grid/List view toggle
 * Responsibilities: Render search bar, category select dropdown, view mode toggle buttons, upload toggle trigger
 * Dependencies: SearchBar, Select, Button, LayoutGrid, List, UploadPlus
 * Export: FileToolbar
 */
import { LayoutGrid, List, Plus } from 'lucide-react';
import { SearchBar } from '../../../../components/shared/SearchBar';
import { Select } from '../../../../components/ui/Select';
import { Button } from '../../../../components/ui/Button';

export interface FileToolbarProps {
  search: string;
  onSearch: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
  onToggleUpload: () => void;
  isUploadOpen: boolean;
}

const CATEGORY_FILTER_OPTIONS = [
  { value: 'All', label: 'All Categories' },
  { value: 'Quotation', label: 'Quotation' },
  { value: 'Agreement', label: 'Agreement' },
  { value: 'Invoice PDFs', label: 'Invoice PDF' },
  { value: 'Receipts', label: 'Receipt' },
  { value: 'Design Files', label: 'Design Files' },
  { value: 'Project Documents', label: 'Project Documents' },
  { value: 'Images', label: 'Images' },
  { value: 'Other', label: 'Other' },
];

export function FileToolbar({
  onSearch,
  selectedCategory,
  onCategoryChange,
  viewMode,
  onViewModeChange,
  onToggleUpload,
  isUploadOpen,
}: FileToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search & Category Filter */}
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          placeholder="Search document name, category, uploader..."
          onSearch={onSearch}
          className="sm:max-w-xs"
        />

        <div className="w-full sm:w-48">
          <Select
            placeholder="All Categories"
            options={CATEGORY_FILTER_OPTIONS}
            value={selectedCategory}
            onValueChange={onCategoryChange}
          />
        </div>
      </div>

      {/* Right Controls: View Toggle & Upload Button */}
      <div className="flex items-center gap-2">
        {/* Grid/List View Toggle */}
        <div className="flex items-center rounded-lg border border-surface-border bg-white p-1 text-xs">
          <button
            onClick={() => onViewModeChange('list')}
            title="List View"
            className={`rounded p-1.5 transition-colors ${
              viewMode === 'list' ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-ink-500 hover:text-ink-900'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange('grid')}
            title="Grid View"
            className={`rounded p-1.5 transition-colors ${
              viewMode === 'grid' ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-ink-500 hover:text-ink-900'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>

        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          variant={isUploadOpen ? 'secondary' : 'primary'}
          onClick={onToggleUpload}
        >
          {isUploadOpen ? 'Close Upload' : 'Upload File'}
        </Button>
      </div>
    </div>
  );
}
