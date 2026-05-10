/**
 * Clipboard / rich-text paste often injects BOM, zero-width, bidi overrides, or fullwidth punctuation
 * — those break URL parsing or query strings (`profile.php?id=…`).
 *
 * Lives in its own module so Supabase wizard code never imports the full card `helpers` barrel.
 */
export function sanitizeSocialPaste(raw) {
  return String(raw || '')
    .split('\u0000')
    .join('')
    .replace(/\uFEFF/g, '')
    .replace(/[\u200B-\u200F\u2066-\u2069\u202A-\u202E]/g, '')
    .replace(/\uFF1F/g, '?')
    .replace(/\u061F/g, '?')
    .replace(/\uFF1A/g, ':')
    .replace(/\uFF0F/g, '/')
    .replace(/\uFF06/g, '&')
    .replace(/\s+/g, '')
    .trim();
}
