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

/**
 * Purpose: Convert numbers to Indian Rupees in words (e.g., 50000 -> "Fifty Thousand Only")
 * Responsibilities: Handle units, tens, hundreds, thousands, lakhs, and crores.
 */
export function numberToWordsRupees(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return 'Zero Only';

  const num = Math.floor(Math.abs(amount));
  if (num === 0) return 'Zero Only';

  const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const twoDigits = ['', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tensMultiple = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(n: number): string {
    if (n < 10) return singleDigits[n];
    if (n >= 10 && n < 20) return twoDigits[n - 9];
    const ten = Math.floor(n / 10);
    const unit = n % 10;
    return tensMultiple[ten] + (unit ? ' ' + singleDigits[unit] : '');
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let str = '';
    if (hundred) {
      str += singleDigits[hundred] + ' Hundred';
    }
    if (rest) {
      str += (str ? ' ' : '') + convertTwoDigits(rest);
    }
    return str;
  }

  let result = '';
  let temp = num;

  const crore = Math.floor(temp / 10000000);
  temp %= 10000000;

  const lakh = Math.floor(temp / 100000);
  temp %= 100000;

  const thousand = Math.floor(temp / 1000);
  temp %= 1000;

  if (crore) {
    result += (result ? ' ' : '') + convertThreeDigits(crore) + ' Crore';
  }
  if (lakh) {
    result += (result ? ' ' : '') + convertTwoDigits(lakh) + ' Lakh';
  }
  if (thousand) {
    result += (result ? ' ' : '') + convertTwoDigits(thousand) + ' Thousand';
  }
  if (temp) {
    result += (result ? ' ' : '') + convertThreeDigits(temp);
  }

  return result.trim() ? `${result.trim()} Only` : 'Zero Only';
}
