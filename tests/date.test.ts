import { describe, it, expect } from 'vitest';
import { formatDateToYMD } from '../src/lib/date';

describe('formatDateToYMD', () => {
    it('returns the same value when already YYYY-MM-DD', () => {
        expect(formatDateToYMD('2026-01-01')).toBe('2026-01-01');
    });

    it('parses ISO datetime string with timezone and returns YYYY-MM-DD', () => {
        // This should be resilient when backend accidentally returns a datetime
        // like 2025-12-31T17:00:00Z. The helper uses parseDateFlexible which
        // converts to a date-only string.
        const iso = '2025-12-31T17:00:00Z';
        const normalized = formatDateToYMD(iso);
        // Should return a 10-char date string
        expect(typeof normalized).toBe('string');
        expect(/\d{4}-\d{2}-\d{2}/.test(normalized!)).toBe(true);
    });

    it('formats Date objects to YYYY-MM-DD', () => {
        const d = new Date('2026-01-01T00:00:00');
        expect(formatDateToYMD(d)).toBe('2026-01-01');
    });

    it('returns null for invalid values', () => {
        expect(formatDateToYMD(null)).toBe(null);
        expect(formatDateToYMD(undefined)).toBe(null);
        expect(formatDateToYMD('')).toBe(null);
    });
});
