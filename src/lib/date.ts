/**
 * Client-side date helper to normalize server-provided date values
 * to a date-only string in the format YYYY-MM-DD.
 * This is defensive: backend SHOULD already return YYYY-MM-DD for
 * start_date and birthdate, but this helper ensures frontend displays
 * a consistent value even if a datetime string is returned.
 */
import { parseDateFlexible } from './excel';

export function formatDateToYMD(value: any): string | null {
    if (!value && value !== 0) return null;

    // If already in YYYY-MM-DD format
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
    }

    // Try flexible parsing for strings/numbers/dates
    const parsed = parseDateFlexible(value);
    if (parsed) return parsed;

    // As a last resort, if it's a Date instance, format using local date parts
    if (value instanceof Date && !isNaN(value.getTime())) {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const day = String(value.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    return null;
}

export default formatDateToYMD;
