/**
 * Purpose: Format numeric amounts as Indian Rupee currency strings
 * Responsibilities: Consistent ₹ formatting with Indian digit grouping (lakh/crore) app-wide
 * Dependencies: none
 * Export: formatCurrency(), formatCompactCurrency()
 */

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const inrFormatterNoDecimals = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Formats a number as ₹1,23,456.00 */
export function formatCurrency(amount: number, withDecimals = true): string {
  return withDecimals ? inrFormatter.format(amount) : inrFormatterNoDecimals.format(amount);
}

/** Formats a number in compact lakh/crore form, e.g. ₹12.45L, ₹1.2Cr — used in tight stat cards */
export function formatCompactCurrency(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 1_00_00_000) return `${sign}₹${(abs / 1_00_00_000).toFixed(2)}Cr`;
  if (abs >= 1_00_000) return `${sign}₹${(abs / 1_00_000).toFixed(2)}L`;
  if (abs >= 1_000) return `${sign}₹${(abs / 1_000).toFixed(1)}K`;
  return formatCurrency(amount);
}
