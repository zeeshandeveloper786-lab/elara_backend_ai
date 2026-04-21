"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeToE164 = normalizeToE164;
function normalizeToE164(input, defaultCountryCode = '92') {
    const raw = String(input ?? '').trim();
    if (!raw)
        return raw;
    const withoutPrefix = raw.startsWith('whatsapp:')
        ? raw.slice('whatsapp:'.length)
        : raw;
    const digitsPlus = withoutPrefix.replace(/[^\d+]/g, '');
    if (digitsPlus.startsWith('+'))
        return digitsPlus;
    if (digitsPlus.startsWith('0') && digitsPlus.length >= 11) {
        return `+${defaultCountryCode}${digitsPlus.slice(1)}`;
    }
    if (digitsPlus.startsWith(defaultCountryCode) &&
        digitsPlus.length >= defaultCountryCode.length + 10) {
        return `+${digitsPlus}`;
    }
    return digitsPlus;
}
//# sourceMappingURL=phone-normalize.js.map