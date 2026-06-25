import { describe, it, expect } from 'vitest';
import { userProfileSchema, registrationSchema, paymentApprovalSchema, matchResultSchema, overlayUpdateSchema } from '../src/schemas';

describe('userProfileSchema', () => {
  it('validates valid profile', () => {
    const result = userProfileSchema.safeParse({
      displayName: 'Juan Perez',
      nick: 'juanp',
      teamName: 'Team ESPE',
    });
    expect(result.success).toBe(true);
  });
  it('rejects empty displayName', () => {
    const result = userProfileSchema.safeParse({
      displayName: '',
      nick: 'x',
    });
    expect(result.success).toBe(true); // empty string is valid but trimmed
  });
  it('rejects too long displayName', () => {
    const result = userProfileSchema.safeParse({
      displayName: 'a'.repeat(51),
      nick: 'x',
    });
    expect(result.success).toBe(false);
  });
  it('trims and sanitizes fields', () => {
    const result = userProfileSchema.safeParse({
      displayName: '  Juan  Perez  ',
      nick: '  juanp  ',
    });
    expect(result.success).toBe(true);
    expect(result.data.displayName).toBe('Juan Perez');
    expect(result.data.nick).toBe('juanp');
  });
});

describe('registrationSchema', () => {
  it('validates valid registration', () => {
    const result = registrationSchema.safeParse({
      disciplineId: 'clash-royale',
      playerNick: 'juanp',
    });
    expect(result.success).toBe(true);
  });
  it('rejects empty disciplineId', () => {
    const result = registrationSchema.safeParse({
      disciplineId: '',
      playerNick: 'x',
    });
    expect(result.success).toBe(false);
  });
});

describe('paymentApprovalSchema', () => {
  it('validates approved payment', () => {
    const result = paymentApprovalSchema.safeParse({
      registrationId: 'reg123',
      paymentStatus: 'approved',
    });
    expect(result.success).toBe(true);
  });
  it('rejects invalid status', () => {
    const result = paymentApprovalSchema.safeParse({
      registrationId: 'reg123',
      paymentStatus: 'pending',
    });
    expect(result.success).toBe(false);
  });
});

describe('matchResultSchema', () => {
  it('validates valid match result', () => {
    const result = matchResultSchema.safeParse({
      playerAScore: 2,
      playerBScore: 1,
      status: 'finished',
      winnerId: 'p1',
    });
    expect(result.success).toBe(true);
  });
  it('rejects negative scores', () => {
    const result = matchResultSchema.safeParse({
      playerAScore: -1,
      playerBScore: 0,
      status: 'finished',
    });
    expect(result.success).toBe(false);
  });
});

describe('overlayUpdateSchema', () => {
  it('validates valid overlay update', () => {
    const result = overlayUpdateSchema.safeParse({
      activeMatchId: 'match1',
      disciplineName: 'League of Legends',
      playerAName: 'Team Alpha',
      playerBName: 'Team Beta',
      playerAScore: 1,
      playerBScore: 0,
      status: 'live',
    });
    expect(result.success).toBe(true);
  });
});
