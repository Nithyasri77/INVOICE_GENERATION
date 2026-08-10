/**
 * Purpose: Phone Number Normalization & Validation for WhatsApp Sharing & Client Communications
 * Responsibilities:
 * - Safely normalize phone numbers according to Indian (+91) & International formats
 * - Validate WhatsApp recipient phone numbers without hardcoding
 * - Validate Email recipient addresses
 */

/**
 * Normalizes a raw phone string into a clean digit string with country code suitable for WhatsApp links (wa.me/<digits>)
 * Rules:
 * 1. Handles "+91 91234 56789" -> "919123456789"
 * 2. Handles "+919123456789" -> "919123456789"
 * 3. Handles "09123456789" (Indian 11-digit local format with 0 prefix) -> "919123456789"
 * 4. Handles "9123456789" (Indian 10-digit mobile) -> "919123456789"
 * 5. Preserves valid international country codes (e.g. "+1 (202) 555-0123" -> "12025550123")
 */
export function normalizePhoneNumber(rawPhone?: string): string {
  if (!rawPhone) return '';

  const trimmed = rawPhone.trim();
  if (!trimmed) return '';

  // Remove spaces, dashes, brackets, dots
  const digitsOnly = trimmed.replace(/[\s\-\(\)\.]/g, '');

  // Case 1: Starts with '+' -> strip '+' and keep remaining country code digits
  if (digitsOnly.startsWith('+')) {
    return digitsOnly.slice(1).replace(/\D/g, '');
  }

  const cleanDigits = digitsOnly.replace(/\D/g, '');

  // Case 2: Indian 11-digit starting with '0' (e.g., 09123456789)
  if (cleanDigits.length === 11 && cleanDigits.startsWith('0')) {
    return '91' + cleanDigits.slice(1);
  }

  // Case 3: Indian 10-digit starting with 6, 7, 8, 9 (e.g., 9123456789)
  if (cleanDigits.length === 10 && /^[6-9]/.test(cleanDigits)) {
    return '91' + cleanDigits;
  }

  // Case 4: 12-digit already starting with 91 (e.g., 919123456789)
  if (cleanDigits.length === 12 && cleanDigits.startsWith('91')) {
    return cleanDigits;
  }

  // Default: return extracted digits
  return cleanDigits;
}

/**
 * Validates whether a phone number is usable for WhatsApp sharing.
 * Disallows empty, dummy numbers (e.g. 0000000000, 9876500000), or too short/long digits.
 */
export function isValidWhatsAppPhone(phone?: string): boolean {
  if (!phone) return false;
  const normalized = normalizePhoneNumber(phone);

  // Must be between 10 and 15 digits long
  if (normalized.length < 10 || normalized.length > 15) return false;

  // Reject dummy zero sequences
  if (/^910{10}$/.test(normalized) || /^0+$/.test(normalized) || normalized.includes('0000000000')) {
    return false;
  }

  return true;
}

/**
 * Validates whether an email address is valid and non-empty.
 */
export function isValidEmail(email?: string): boolean {
  if (!email) return false;
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return false;

  // Basic email pattern check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
}
