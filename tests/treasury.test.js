import { describe, it, expect } from 'vitest';
import { calculateTotalRevenue, calculateRevenueByDiscipline, getPaymentStats, formatCurrency } from '../src/lib/treasury';

const MOCK_REGISTRATIONS = [
  { id: '1', disciplineId: 'clash-royale', amount: 2, paymentStatus: 'approved' },
  { id: '2', disciplineId: 'league-of-legends', amount: 2, paymentStatus: 'pending' },
  { id: '3', disciplineId: 'fortnite', amount: 2, paymentStatus: 'approved' },
  { id: '4', disciplineId: 'fifa-26', amount: 2, paymentStatus: 'rejected' },
  { id: '5', disciplineId: 'clash-royale', amount: 2, paymentStatus: 'approved' },
];

const MOCK_DISCIPLINES = [
  { id: 'clash-royale', name: 'Clash Royale' },
  { id: 'league-of-legends', name: 'League of Legends' },
  { id: 'fortnite', name: 'Fortnite' },
  { id: 'fifa-26', name: 'FIFA 26' },
];

describe('calculateTotalRevenue', () => {
  it('sums only approved payments', () => {
    expect(calculateTotalRevenue(MOCK_REGISTRATIONS)).toBe(6);
  });
  it('returns 0 for empty array', () => {
    expect(calculateTotalRevenue([])).toBe(0);
  });
  it('returns 0 when no approved payments', () => {
    const regs = [{ amount: 2, paymentStatus: 'pending' }];
    expect(calculateTotalRevenue(regs)).toBe(0);
  });
});

describe('calculateRevenueByDiscipline', () => {
  it('groups revenue by discipline', () => {
    const result = calculateRevenueByDiscipline(MOCK_REGISTRATIONS, MOCK_DISCIPLINES);
    const cr = result.find(r => r.disciplineName === 'Clash Royale');
    expect(cr.total).toBe(4);
    expect(cr.count).toBe(2);
  });
  it('handles empty registrations', () => {
    const result = calculateRevenueByDiscipline([], MOCK_DISCIPLINES);
    result.forEach(r => {
      expect(r.total).toBe(0);
      expect(r.count).toBe(0);
    });
  });
});

describe('getPaymentStats', () => {
  it('counts each status', () => {
    const stats = getPaymentStats(MOCK_REGISTRATIONS);
    expect(stats.approved).toBe(3);
    expect(stats.pending).toBe(1);
    expect(stats.rejected).toBe(1);
  });
  it('handles empty array', () => {
    const stats = getPaymentStats([]);
    expect(stats.approved).toBe(0);
    expect(stats.pending).toBe(0);
    expect(stats.rejected).toBe(0);
  });
});

describe('formatCurrency', () => {
  it('formats correctly', () => {
    expect(formatCurrency(10)).toBe('$10.00');
    expect(formatCurrency(2.5)).toBe('$2.50');
    expect(formatCurrency(0)).toBe('$0.00');
  });
});
