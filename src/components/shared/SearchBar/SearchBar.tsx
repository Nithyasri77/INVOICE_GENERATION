/**
 * Purpose: Debounced search input used at the top of every data table
 *          (matches wireframe's "Search invoice, client or project...")
 * Responsibilities: Wrap Input with a search icon and debounce the onChange callback
 * Dependencies: Input (ui), useDebounce hook, lucide-react (Search)
 * Export: SearchBar
 */
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../../ui/Input';
import { useDebounce } from '../../../hooks/useDebounce';

export interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  className?: string;
  debounceMs?: number;
}

export function SearchBar({ placeholder = 'Search...', onSearch, className, debounceMs = 300 }: SearchBarProps) {
  const [value, setValue] = useState('');
  const debouncedValue = useDebounce(value, debounceMs);

  useEffect(() => {
    onSearch(debouncedValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  return (
    <Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      leftIcon={<Search className="h-4 w-4" />}
      className={className}
      aria-label="Search"
    />
  );
}
