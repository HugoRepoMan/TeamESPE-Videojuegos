/**
 * CSV export utilities for the ESPE Gaming Tournament.
 */

/**
 * Escape a value for safe inclusion in a CSV cell.
 * Wraps values in double quotes when they contain commas, double quotes,
 * or newlines. Internal double quotes are escaped by doubling them.
 * @param {*} value - The value to escape.
 * @returns {string} CSV-safe string.
 */
export function escapeCSVValue(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generate a CSV string from headers and rows.
 * @param {string[]} headers - Column header names.
 * @param {any[][]} rows - Array of row arrays. Each row array must have
 *   the same length as headers.
 * @returns {string} Complete CSV content.
 */
export function generateCSV(headers, rows) {
  const headerLine = headers.map(escapeCSVValue).join(',');
  const dataLines = rows.map((row) => row.map(escapeCSVValue).join(','));
  return [headerLine, ...dataLines].join('\r\n');
}

/**
 * Trigger a browser download of a CSV file.
 * Includes a UTF-8 BOM so Microsoft Excel correctly detects the encoding.
 * @param {string} csvContent - The CSV string to download.
 * @param {string} filename - Desired file name (should end in .csv).
 */
export function downloadCSV(csvContent, filename) {
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export player registration data as a CSV download.
 * @param {object[]} registrations - Array of registration objects.
 * @param {object[]} disciplines - Array of discipline objects with `id` and `name`.
 */
export function exportPlayersCSV(registrations, disciplines) {
  const disciplineMap = new Map();
  for (const disc of disciplines) {
    disciplineMap.set(disc.id, disc.name || disc.id);
  }

  const headers = [
    'Jugador',
    'Equipo',
    'Disciplina',
    'Estado de Pago',
    'Monto',
    'Fecha de Registro',
  ];

  const rows = registrations.map((reg) => [
    reg.playerNick || '',
    reg.teamName || '',
    disciplineMap.get(reg.disciplineId) || reg.disciplineId || '',
    reg.paymentStatus || '',
    reg.amount != null ? reg.amount : '',
    reg.createdAt ? formatTimestamp(reg.createdAt) : '',
  ]);

  const csv = generateCSV(headers, rows);
  downloadCSV(csv, 'jugadores_torneo.csv');
}

/**
 * Export revenue data as a CSV download.
 * @param {object[]} registrations - Array of registration objects.
 * @param {object[]} disciplines - Array of discipline objects with `id` and `name`.
 */
export function exportRevenueCSV(registrations, disciplines) {
  const disciplineMap = new Map();
  for (const disc of disciplines) {
    disciplineMap.set(disc.id, disc.name || disc.id);
  }

  const approved = registrations.filter((r) => r.paymentStatus === 'approved');

  const headers = [
    'Disciplina',
    'Jugador',
    'Monto',
    'Referencia de Pago',
    'Fecha de Aprobacion',
  ];

  const rows = approved.map((reg) => [
    disciplineMap.get(reg.disciplineId) || reg.disciplineId || '',
    reg.playerNick || '',
    reg.amount != null ? reg.amount : '',
    reg.paymentReference || '',
    reg.reviewedAt ? formatTimestamp(reg.reviewedAt) : '',
  ]);

  const csv = generateCSV(headers, rows);
  downloadCSV(csv, 'ingresos_torneo.csv');
}

/**
 * Format a Firestore Timestamp or Date to a locale string.
 * @param {object|Date|string} ts - Firestore Timestamp, Date, or ISO string.
 * @returns {string}
 */
function formatTimestamp(ts) {
  if (!ts) return '';
  if (typeof ts.toDate === 'function') {
    return ts.toDate().toLocaleString('es-EC');
  }
  if (ts instanceof Date) {
    return ts.toLocaleString('es-EC');
  }
  return String(ts);
}
