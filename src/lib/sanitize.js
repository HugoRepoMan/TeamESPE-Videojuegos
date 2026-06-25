/**
 * Input sanitization utilities for the ESPE Gaming Tournament platform.
 * All user-facing text is sanitized before storage to prevent injection attacks.
 */

const CONTROL_CHARS_RE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
const WHITESPACE_COLLAPSE_RE = /\s{2,}/g;
const DOC_ID_RE = /^[a-zA-Z0-9_-]+$/;
const NICK_STRIP_RE = /[^a-z0-9_]/g;

/**
 * Sanitize a general string: trim, collapse whitespace, remove control
 * characters, and enforce a maximum length.
 * @param {string} str - Raw input string.
 * @param {number} [maxLen=200] - Maximum allowed length after sanitization.
 * @returns {string} Sanitized string.
 */
export function sanitizeString(str, maxLen = 200) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(CONTROL_CHARS_RE, '')
    .replace(WHITESPACE_COLLAPSE_RE, ' ')
    .slice(0, maxLen);
}

/**
 * Validate and sanitize a Firestore document ID.
 * Only alphanumeric characters, dashes, and underscores are allowed.
 * @param {string} id - Raw document ID.
 * @returns {string} The validated document ID.
 * @throws {Error} If the ID is empty or contains invalid characters.
 */
export function sanitizeDocId(id) {
  if (typeof id !== 'string' || id.trim().length === 0) {
    throw new Error('El ID del documento no puede estar vacio.');
  }
  const trimmed = id.trim();
  if (!DOC_ID_RE.test(trimmed)) {
    throw new Error(
      'El ID del documento solo puede contener caracteres alfanumericos, guiones y guiones bajos.'
    );
  }
  return trimmed;
}

/**
 * Normalize a player nickname: lowercase, trim, strip everything except
 * alphanumeric characters and underscores.
 * @param {string} nick - Raw nickname.
 * @returns {string} Normalized nickname.
 */
export function normalizeNick(nick) {
  if (typeof nick !== 'string') return '';
  return nick.toLowerCase().trim().replace(NICK_STRIP_RE, '');
}
