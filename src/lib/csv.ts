// Utility for building and downloading CSV specifically for NIK lists
export function buildNikCsv(niks: string[]): string {
    // Ensure all values are strings and filter out empty/null
    const rows = niks.map((n) => (n ?? '').toString()).filter(Boolean);

    // CSV header
    const header = 'nik';

    // Quote values to be safe (NIK is numeric string but quoting avoids issues)
    const quoted = rows.map((r) => `"${r.replace(/"/g, '""')}"`);

    // Prepend BOM for Excel compatibility
    return '\uFEFF' + [header, ...quoted].join('\n');
}

export function downloadCsv(filename: string, csvContent: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    // Append to DOM to make click work in some browsers
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}
