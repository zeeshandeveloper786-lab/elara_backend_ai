/**
 * Normalize phone numbers to E.164 for Pakistan by default.
 * - "03181234567" -> "+923181234567"
 * - "923181234567" -> "+923181234567"
 * - "+923181234567" -> "+923181234567"
 * If it can't be normalized, returns the original trimmed input.
 */
export function normalizeToE164(input: string, defaultCountryCode = '92') {
  const raw = String(input ?? '').trim();
  if (!raw) return raw;

  // Keep whatsapp: prefix out of normalization.
  const withoutPrefix = raw.startsWith('whatsapp:')
    ? raw.slice('whatsapp:'.length)
    : raw;
  const digitsPlus = withoutPrefix.replace(/[^\d+]/g, '');

  if (digitsPlus.startsWith('+')) return digitsPlus;

  // 0XXXXXXXXXX (Pakistan mobile)
  if (digitsPlus.startsWith('0') && digitsPlus.length >= 11) {
    return `+${defaultCountryCode}${digitsPlus.slice(1)}`;
  }

  // 92XXXXXXXXXX
  if (
    digitsPlus.startsWith(defaultCountryCode) &&
    digitsPlus.length >= defaultCountryCode.length + 10
  ) {
    return `+${digitsPlus}`;
  }

  return digitsPlus;
}
