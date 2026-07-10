import { describe, it, expect } from 'vitest';
import { shuffleArray, nextPowerOf2, generateBracket, advanceWinner, determineBo3Winner } from '../src/lib/brackets';

describe('nextPowerOf2', () => {
  it('returns 1 for 0 or 1', () => {
    expect(nextPowerOf2(0)).toBe(1);
    expect(nextPowerOf2(1)).toBe(1);
  });
  it('returns 2 for 2', () => {
    expect(nextPowerOf2(2)).toBe(2);
  });
  it('returns 4 for 3', () => {
    expect(nextPowerOf2(3)).toBe(4);
  });
  it('returns 8 for 5-8', () => {
    expect(nextPowerOf2(5)).toBe(8);
    expect(nextPowerOf2(8)).toBe(8);
  });
  it('returns 16 for 9-16', () => {
    expect(nextPowerOf2(9)).toBe(16);
    expect(nextPowerOf2(16)).toBe(16);
  });
});

describe('shuffleArray', () => {
  it('returns array of same length', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffleArray([...arr]);
    expect(result).toHaveLength(5);
  });
  it('contains same elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffleArray([...arr]);
    expect(result.sort()).toEqual(arr.sort());
  });
  it('handles empty array', () => {
    expect(shuffleArray([])).toEqual([]);
  });
  it('handles single element', () => {
    expect(shuffleArray([1])).toEqual([1]);
  });
});

describe('generateBracket', () => {
  it('returns empty for no players', () => {
    const result = generateBracket([]);
    expect(result).toEqual([]);
  });

  it('handles 2 players', () => {
    const players = [
      { id: 'p1', playerNick: 'Player1' },
      { id: 'p2', playerNick: 'Player2' },
    ];
    const matches = generateBracket(players);
    expect(matches).toHaveLength(1);
    expect(matches[0].round).toBe(1);
    expect(matches[0].playerAId).toBeTruthy();
    expect(matches[0].playerBId).toBeTruthy();
  });

  it('handles 4 players (power of 2)', () => {
    const players = [
      { id: 'p1', playerNick: 'Player1' },
      { id: 'p2', playerNick: 'Player2' },
      { id: 'p3', playerNick: 'Player3' },
      { id: 'p4', playerNick: 'Player4' },
    ];
    const matches = generateBracket(players);
    // 4 players: 2 first round + 1 final = 3 total matches
    expect(matches).toHaveLength(3);
    const round1 = matches.filter(m => m.round === 1);
    const round2 = matches.filter(m => m.round === 2);
    expect(round1).toHaveLength(2);
    expect(round2).toHaveLength(1);
  });

  it('handles 3 players (needs bye)', () => {
    const players = [
      { id: 'p1', playerNick: 'Player1' },
      { id: 'p2', playerNick: 'Player2' },
      { id: 'p3', playerNick: 'Player3' },
    ];
    const matches = generateBracket(players);
    // 3 players -> 4 slots -> 2 R1 + 1 R2 = 3 matches, 1 bye
    expect(matches.length).toBeGreaterThanOrEqual(2);
    const byes = matches.filter(m => m.playerBId === null || m.playerAId === null);
    expect(byes.length).toBeGreaterThanOrEqual(1);
  });

  it('handles 5 players', () => {
    const players = Array.from({ length: 5 }, (_, i) => ({ id: `p${i}`, playerNick: `Player${i}` }));
    const matches = generateBracket(players);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('handles 1 player', () => {
    const players = [{ id: 'p1', playerNick: 'Player1' }];
    const matches = generateBracket(players);
    expect(matches).toHaveLength(0);
  });
});

describe('determineBo3Winner', () => {
  it('returns winner when player A wins 2 games', () => {
    const games = [
      { playerAScore: 1, playerBScore: 0 },
      { playerAScore: 1, playerBScore: 0 },
    ];
    expect(determineBo3Winner(games)).toEqual({ winnerId: 'A' });
  });

  it('returns winner when player B wins 2 games', () => {
    const games = [
      { playerAScore: 0, playerBScore: 1 },
      { playerAScore: 0, playerBScore: 1 },
    ];
    expect(determineBo3Winner(games)).toEqual({ winnerId: 'B' });
  });

  it('returns winner in 3 games', () => {
    const games = [
      { playerAScore: 1, playerBScore: 0 },
      { playerAScore: 0, playerBScore: 1 },
      { playerAScore: 1, playerBScore: 0 },
    ];
    expect(determineBo3Winner(games)).toEqual({ winnerId: 'A' });
  });

  it('returns null when not decided', () => {
    const games = [
      { playerAScore: 1, playerBScore: 0 },
      { playerAScore: 0, playerBScore: 1 },
    ];
    expect(determineBo3Winner(games)).toBeNull();
  });

  it('returns null for empty games', () => {
    expect(determineBo3Winner([])).toBeNull();
  });
});

describe('advanceWinner', () => {
  it('places winner in next round match', () => {
    const matches = [
      { id: 'm1', round: 1, bracketPosition: 0, playerAId: 'p1', playerBId: 'p2', winnerId: null },
      { id: 'm2', round: 1, bracketPosition: 1, playerAId: 'p3', playerBId: 'p4', winnerId: null },
      { id: 'm3', round: 2, bracketPosition: 0, playerAId: null, playerBId: null, winnerId: null },
    ];
    const updated = advanceWinner(matches, 'm1', 'p1');
    const finalMatch = updated.find(m => m.id === 'm3');
    expect(finalMatch.playerAId).toBe('p1');
  });
});
