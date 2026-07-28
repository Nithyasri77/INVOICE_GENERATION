/**
 * Purpose: Filter fields for the Leads table — Status + Source (per BRD's "Filter by Status /
 *          Filter by Source" requirement)
 * Responsibilities: Pure controlled fields; rendered inside <FilterBar> by LeadsListPage
 * Dependencies: Select (ui), LEAD_STATUS_OPTIONS/LEAD_SOURCE_OPTIONS (constants)
 * Export: LeadFilters
 */
import { Select } from '../../../components/ui/Select';
import { LEAD_STATUS_OPTIONS, LEAD_SOURCE_OPTIONS } from '../../../constants/leadOptions';

export interface LeadFiltersValue {
  status?: string;
  source?: string;
}

export interface LeadFiltersProps {
  value: LeadFiltersValue;
  onChange: (value: LeadFiltersValue) => void;
}

export function LeadFilters({ value, onChange }: LeadFiltersProps) {
  return (
    <div className="space-y-4">
      <Select
        label="Status"
        placeholder="All statuses"
        options={LEAD_STATUS_OPTIONS}
        value={value.status}
        onValueChange={(status) => onChange({ ...value, status })}
      />
      <Select
        label="Source"
        placeholder="All sources"
        options={LEAD_SOURCE_OPTIONS}
        value={value.source}
        onValueChange={(source) => onChange({ ...value, source })}
      />
    </div>
  );
}
