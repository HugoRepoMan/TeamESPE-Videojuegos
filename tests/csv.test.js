import { describe, it, expect } from 'vitest';
import { escapeCSVValue, generateCSV } from '../src/lib/csv';

describe('escapeCSVValue', () => {
  it('wraps strings with commas in quotes', () => {
    expect(escapeCSVValue('hello, world')).toBe('"hello, world"');
  });
  it('escapes double quotes', () => {
    expect(escapeCSVValue('say "hello"')).toBe('"say ""hello"""');
  });
  it('wraps strings with newlines', () => {
    expect(escapeCSVValue('line1\nline2')).toBe('"line1\nline2"');
  });
  it('handles numbers', () => {
    expect(escapeCSVValue(42)).toBe('42');
  });
  it('handles null/undefined', () => {
    expect(escapeCSVValue(null)).toBe('');
    expect(escapeCSVValue(undefined)).toBe('');
  });
  it('handles plain strings without escaping', () => {
    expect(escapeCSVValue('hello')).toBe('hello');
  });
});

describe('generateCSV', () => {
  it('generates valid CSV with headers and rows', () => {
    const headers = ['Name', 'Score'];
    const rows = [['Alice', 10], ['Bob', 20]];
    const csv = generateCSV(headers, rows);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('Name,Score');
    expect(lines[1]).toBe('Alice,10');
    expect(lines[2]).toBe('Bob,20');
  });
  it('handles empty rows', () => {
    const csv = generateCSV(['A', 'B'], []);
    expect(csv).toBe('A,B');
  });
  it('escapes values in rows', () => {
    const csv = generateCSV(['Name'], [['O\'Brien, Jr.']]);
    expect(csv).toContain('"O\'Brien, Jr."');
  });
});
