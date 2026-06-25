/**
 * Treasury calculation utilities for the ESPE Gaming Tournament.
 * All functions are pure -- no Firebase or external dependencies.
 */

/**
 * Calculate total revenue from approved registrations.
 * @param {object[]} registrations - Array of registration objects.
 * @returns {number} Sum of amounts for approved registrations.
 */
export function calculateTotalRevenue(registrations) {
  if (!Array.isArray(registrations)) return 0;
  return registrations.reduce((sum, reg) => {
    if (reg.paymentStatus === 'approved' && typeof reg.amount === 'number') {
      return sum + reg.amount;
    }
    return sum;
  }, 0);
}

/**
 * Calculate revenue grouped by discipline.
 * @param {object[]} registrations - Array of registration objects.
 * @param {object[]} disciplines - Array of discipline objects with `id` and `name`.
 * @returns {{ disciplineName: string, total: number, count: number }[]}
 */
export function calculateRevenueByDiscipline(registrations, disciplines) {
  if (!Array.isArray(registrations) || !Array.isArray(disciplines)) return [];

  const disciplineMap = new Map();
  for (const disc of disciplines) {
    disciplineMap.set(disc.id, disc.name || disc.id);
  }

  const grouped = new Map();

  for (const reg of registrations) {
    if (reg.paymentStatus !== 'approved') continue;

    const key = reg.disciplineId || 'unknown';
    const entry = grouped.get(key) || {
      disciplineName: disciplineMap.get(key) || key,
      total: 0,
      count: 0,
    };
    entry.total += typeof reg.amount === 'number' ? reg.amount : 0;
    entry.count += 1;
    grouped.set(key, entry);
  }

  return Array.from(grouped.values());
}

/**
 * Get counts of registrations by payment status.
 * @param {object[]} registrations - Array of registration objects.
 * @returns {{ pending: number, approved: number, rejected: number }}
 */
export function getPaymentStats(registrations) {
  const stats = { pending: 0, approved: 0, rejected: 0 };
  if (!Array.isArray(registrations)) return stats;

  for (const reg of registrations) {
    if (reg.paymentStatus === 'pending') stats.pending++;
    else if (reg.paymentStatus === 'approved') stats.approved++;
    else if (reg.paymentStatus === 'rejected') stats.rejected++;
  }

  return stats;
}

/**
 * Format a numeric amount as currency ($X.XX).
 * @param {number} amount - The amount to format.
 * @returns {string} Formatted currency string.
 */
export function formatCurrency(amount) {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return '$0.00';
  return `$${amount.toFixed(2)}`;
}
