/**
 * Purpose: Filter fields for the AMC Contracts table — Status
 * Responsibilities: Pure controlled field; rendered inside <FilterBar> by AmcContractsListPage
 * Dependencies: Select (ui), AMC_STATUS_OPTIONS (constants)
 * Export: AmcFilters
 */
import { Select } from '../../../components/ui/Select';
import { AMC_STATUS_OPTIONS } from '../../../constants/amcOptions';

export interface AmcFiltersValue {
  status?: string;
}

export interface AmcFiltersProps {
  value: AmcFiltersValue;
  onChange: (value: AmcFiltersValue) => void;
}

export function AmcFilters({ value, onChange }: AmcFiltersProps) {
  return (
    <div className="space-y-4">
      <Select
        label="Status"
        placeholder="All statuses"
        options={AMC_STATUS_OPTIONS}
        value={value.status}
        onValueChange={(status) => onChange({ ...value, status })}
      />
    </div>
  );
}
