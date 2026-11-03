/**
 * Phone number normalization and validation utilities
 */

/**
 * Validates whether the given phone string is plausibly valid.
 * Must contain between 7 and 16 digits, with optional leading '+' and common formatting characters.
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone || typeof phone !== "string") return false;
  const trimmed = phone.trim();
  // Ensure string matches basic phone characters
  if (!/^[+]?[\d\s().-]{7,25}$/.test(trimmed)) {
    return false;
  }
  const digitsOnly = trimmed.replace(/\D/g, "");
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
}

/**
 * Normalizes phone number for tel: links.
 * Preserves leading '+' if present and removes spaces, dashes, parentheses.
 */
export function normalizePhoneForCall(phone: string): string {
  if (!phone) return "";
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
}

/**
 * Normalizes phone number for WhatsApp wa.me links.
 * Strictly international digits only (no '+', no spaces, no dashes).
 */
export function normalizePhoneForWhatsApp(phone: string): string {
  if (!phone) return "";
  return phone.replace(/\D/g, "");
}

