/**
 * Purpose: Convert a rupee amount into words using the Indian numbering system
 *          (Lakh/Crore), for "Amount in Words" on Tax Invoice / Receipt PDFs
 * Responsibilities: amountInWordsINR(amount) -> "Rupees Five Thousand Three Hundred Ten Only"
 * Dependencies: none
 * Export: amountInWordsINR
 */

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return `${TENS[t]}${o ? ' ' + ONES[o] : ''}`;
}

function threeDigits(n: number): string {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (h) parts.push(`${ONES[h]} Hundred`);
  if (rest) parts.push(twoDigits(rest));
  return parts.join(' ');
}

/** Converts a non-negative integer into Indian-numbering-system words (no currency suffix). */
function integerToWords(value: number): string {
  if (value === 0) return 'Zero';

  const crore = Math.floor(value / 10000000);
  value %= 10000000;
  const lakh = Math.floor(value / 100000);
  value %= 100000;
  const thousand = Math.floor(value / 1000);
  value %= 1000;
  const hundred = value;

  const parts: string[] = [];
  if (crore) parts.push(`${threeDigits(crore)} Crore`);
  if (lakh) parts.push(`${threeDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${threeDigits(thousand)} Thousand`);
  if (hundred) parts.push(threeDigits(hundred));

  return parts.join(' ');
}

/** e.g. amountInWordsINR(5310) -> "Rupees Five Thousand Three Hundred Ten Only" */
export function amountInWordsINR(amount: number): string {
  const rupees = Math.floor(Math.abs(amount));
  const paise = Math.round((Math.abs(amount) - rupees) * 100);

  let words = `Rupees ${integerToWords(rupees)}`;
  if (paise > 0) {
    words += ` and ${integerToWords(paise)} Paise`;
  }
  return `${words} Only`;
}
