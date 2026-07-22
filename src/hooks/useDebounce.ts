/**
 * Purpose: Debounce any fast-changing value (search input, filter fields) before it triggers a query
 * Responsibilities: Return a delayed copy of `value` that updates `delayMs` after the last change
 * Dependencies: react
 * Export: useDebounce<T>()
 */
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}
