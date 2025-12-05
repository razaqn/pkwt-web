/**
 * Utility function for conditional class names
 * @param classes - Class names to conditionally apply
 * @returns Combined class string
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(' ');
}