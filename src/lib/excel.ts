import * as XLSX from 'xlsx';

// Constants
export const MAX_EXCEL_ROWS = 500;
export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Type definitions
export interface ParsedExcelRow {
    nik: string;
    fullName?: string | null;
    address?: string | null;
    placeOfBirth?: string | null;
    birthdate?: string | null; // ISO format YYYY-MM-DD
    district?: string | null;
    village?: string | null;
}

export interface ParseExcelResult {
    rows: ParsedExcelRow[];
    warnings: string[];
    fileName: string;
}

export interface NIKEntry {
    id: string;
    nik: string;
}

// Column name mappings (case-insensitive)
const COLUMN_MAPPINGS = {
    nik: ['nik'],
    fullName: ['full_name', 'fullname', 'name', 'nama'],
    address: ['address', 'alamat'],
    placeOfBirth: ['place_of_birth', 'placeofbirth', 'tempat_lahir', 'tempatlahir'],
    birthdate: ['birthdate', 'birth_date', 'tanggal_lahir', 'tanggallahir', 'date_of_birth'],
    district: ['district', 'kecamatan'],
    village: ['village', 'kelurahan', 'desa'],
};

/**
 * Normalize column name for case-insensitive matching
 */
function normalizeColumnName(name: string): string {
    return name.toLowerCase().trim().replace(/\s+/g, '_');
}

/**
 * Expand a scientific notation string (e.g. "4.56789E+15") into its full integer digits
 * without relying on floating point conversion. Returns null if the format is not scientific.
 */
function expandScientificNotation(text: string): string | null {
    const match = text.trim().toLowerCase().match(/^([0-9]+)(?:\.([0-9]+))?e\+?(-?\d+)$/i);
    if (!match) return null;

    const integerPart = match[1];
    const fractionPart = match[2] || '';
    const exponent = parseInt(match[3], 10);

    // We only expect positive exponents for NIK; negative exponent would introduce decimals
    if (exponent < 0) return null;

    const digits = integerPart + fractionPart;
    const zerosNeeded = exponent - fractionPart.length;

    if (zerosNeeded >= 0) {
        return digits + '0'.repeat(zerosNeeded);
    }

    // If exponent is smaller than fraction length, move decimal within the fraction
    const decimalIndex = integerPart.length + exponent;
    if (decimalIndex <= 0) return null; // Would lead to leading zeros/decimals we don't expect

    return digits.slice(0, decimalIndex) + digits.slice(decimalIndex);
}

/**
 * Find actual column name from headers based on mapping
 */
function findColumnName(
    headers: string[],
    possibleNames: string[]
): string | null {
    const normalizedHeaders = headers.map(normalizeColumnName);

    for (const possible of possibleNames) {
        const index = normalizedHeaders.indexOf(normalizeColumnName(possible));
        if (index !== -1) {
            return headers[index];
        }
    }

    return null;
}

/**
 * Normalize NIK cell value into a digit-only string.
 * Handles Excel numeric/exponential formats so we don't fail validation
 * when Excel renders 16-digit IDs as scientific notation.
 */
function normalizeNIKValue(nikValue: any, cellText?: string): string {
    if (nikValue === null || nikValue === undefined) return '';

    const useText = (text: string | undefined | null) => {
        if (!text) return null;
        const trimmed = text.trim();
        if (!trimmed) return null;

        // Prefer expanding scientific notation purely from string representation
        const expanded = expandScientificNotation(trimmed);
        if (expanded) return expanded;

        // Fallback: keep only digits from the text (handles commas/spaces)
        const digitsOnly = trimmed.replace(/[^0-9]/g, '');
        return digitsOnly || trimmed;
    };

    // If we have formatted text from the cell, try to use it first (most accurate)
    const fromCellText = useText(cellText);
    if (fromCellText) return fromCellText;

    // If value is already a number, avoid scientific notation
    if (typeof nikValue === 'number') {
        const str = nikValue.toString();

        if (str.includes('e') || str.includes('E')) {
            const expanded = expandScientificNotation(str);
            if (expanded) return expanded;
        }

        if (str.includes('.')) {
            return Math.round(nikValue).toString();
        }

        return str;
    }

    if (typeof nikValue === 'string') {
        const trimmed = nikValue.trim();

        // If Excel exported as scientific notation in string form
        const expanded = expandScientificNotation(trimmed);
        if (expanded) return expanded;

        return trimmed;
    }

    // Fallback for other types
    return String(nikValue).trim();
}

// Exported for testing to ensure numeric/scientific NIKs are normalized properly
export const normalizeNIKValueForTest = normalizeNIKValue;

/**
 * Validate NIK format (should be 16 digits)
 */
export function validateNIKFormat(nik: string): { valid: boolean; error?: string } {
    if (!nik || typeof nik !== 'string') {
        return { valid: false, error: 'NIK kosong atau tidak valid' };
    }

    const trimmedNIK = nik.trim();

    if (trimmedNIK.length === 0) {
        return { valid: false, error: 'NIK kosong' };
    }

    // Check if NIK is numeric (allow leading zeros)
    if (!/^\d+$/.test(trimmedNIK)) {
        return { valid: false, error: 'NIK harus berupa angka' };
    }

    // Check length (standard Indonesian NIK is 16 digits)
    if (trimmedNIK.length !== 16) {
        return { valid: false, error: `NIK harus 16 digit (saat ini: ${trimmedNIK.length})` };
    }

    return { valid: true };
}

/**
 * Parse date from various formats to ISO YYYY-MM-DD
 * Supports: dd/mm/yyyy, dd-mm-yyyy, yyyy-mm-dd, Excel serial dates
 */
export function parseDateFlexible(value: any): string | null {
    if (!value) return null;

    // If already a Date object
    if (value instanceof Date) {
        return formatDateToISO(value);
    }

    // If it's a number (Excel serial date)
    if (typeof value === 'number') {
        const date = XLSX.SSF.parse_date_code(value);
        if (date) {
            return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
        }
        return null;
    }

    // If it's a string
    if (typeof value === 'string') {
        const trimmed = value.trim();

        // Try ISO format (yyyy-mm-dd)
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
            const date = new Date(trimmed);
            if (!isNaN(date.getTime())) {
                return trimmed;
            }
        }

        // Try dd/mm/yyyy or dd-mm-yyyy
        const ddmmyyyyMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
        if (ddmmyyyyMatch) {
            const day = parseInt(ddmmyyyyMatch[1], 10);
            const month = parseInt(ddmmyyyyMatch[2], 10);
            const year = parseInt(ddmmyyyyMatch[3], 10);

            // Basic validation
            if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
                return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            }
        }

        // Try parsing as generic date string
        const date = new Date(trimmed);
        if (!isNaN(date.getTime())) {
            return formatDateToISO(date);
        }
    }

    return null;
}

/**
 * Format Date object to ISO YYYY-MM-DD
 */
function formatDateToISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Parse Excel file and extract rows
 */
export async function parseExcelFile(file: File): Promise<ParseExcelResult> {
    const warnings: string[] = [];

    console.debug('[excel] parsing file', { name: file.name, size: file.size });

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
        const sizeMB = (file.size / 1024 / 1024).toFixed(2);
        throw new Error(`File terlalu besar. Maksimal ${MAX_FILE_SIZE_MB}MB, file Anda ${sizeMB}MB`);
    }

    // Validate file type
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(extension || '')) {
        throw new Error('Format file tidak didukung. Gunakan .xlsx, .xls, atau .csv');
    }

    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer();

    // Parse workbook
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
        throw new Error('File Excel tidak memiliki sheet');
    }

    const worksheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, {
        raw: false, // Get formatted values
        defval: null, // Default value for empty cells
    });

    if (jsonData.length === 0) {
        throw new Error('File Excel kosong atau tidak memiliki data');
    }

    // Check row limit
    if (jsonData.length > MAX_EXCEL_ROWS) {
        throw new Error(`File memiliki terlalu banyak baris. Maksimal ${MAX_EXCEL_ROWS} baris, file Anda memiliki ${jsonData.length} baris`);
    }

    // Get headers from first row
    const headers = Object.keys(jsonData[0]);
    console.debug('[excel] detected headers', headers);

    // Find column names
    const nikColumn = findColumnName(headers, COLUMN_MAPPINGS.nik);

    if (!nikColumn) {
        throw new Error('Kolom "NIK" tidak ditemukan. Pastikan file Excel memiliki kolom dengan nama "NIK" atau "nik"');
    }

    // Optional columns
    const fullNameColumn = findColumnName(headers, COLUMN_MAPPINGS.fullName);
    const addressColumn = findColumnName(headers, COLUMN_MAPPINGS.address);
    const placeOfBirthColumn = findColumnName(headers, COLUMN_MAPPINGS.placeOfBirth);
    const birthdateColumn = findColumnName(headers, COLUMN_MAPPINGS.birthdate);
    const districtColumn = findColumnName(headers, COLUMN_MAPPINGS.district);
    const villageColumn = findColumnName(headers, COLUMN_MAPPINGS.village);

    // Parse rows
    const parsedRows: ParsedExcelRow[] = [];
    const seenNIKs = new Set<string>();
    const duplicateNIKs: string[] = [];
    const invalidNIKs: Array<{ row: number; nik: string; error: string }> = [];

    const nikColumnIndex = headers.indexOf(nikColumn);

    for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        const rowNumber = i + 2; // Excel rows are 1-indexed, header is row 1

        // Extract raw cell text to mitigate Excel precision loss on long numbers
        let cellText: string | undefined;
        let cellType: string | undefined;
        if (nikColumnIndex >= 0) {
            const cellAddress = XLSX.utils.encode_cell({ c: nikColumnIndex, r: i + 1 });
            const cell = worksheet[cellAddress];
            if (cell && typeof cell.w === 'string') {
                cellText = cell.w;
            }
            if (cell && typeof cell.t === 'string') {
                cellType = cell.t;
            }
        }

        // Extract NIK
        const nikValue = row[nikColumn];
        if (!nikValue) {
            warnings.push(`Baris ${rowNumber}: NIK kosong, baris dilewati`);
            continue;
        }

        console.debug('[excel] row value', {
            row: rowNumber,
            nikValue,
            cellText,
            cellType,
        });

        // If Excel stored NIK as numeric, it is unsafe (Excel trims after 15 digits).
        // We block these rows and ask user to reformat column as Text to prevent corruption.
        let nik: string;

        if (cellType === 'n' || typeof nikValue === 'number') {
            const shown = cellText || String(nikValue);
            const expandedFromText = expandScientificNotation(shown) || shown.replace(/[^0-9]/g, '');
            if (expandedFromText && validateNIKFormat(expandedFromText).valid) {
                nik = expandedFromText;
                warnings.push(`Baris ${rowNumber}: Kolom NIK diformat angka, tetapi berhasil dibaca sebagai ${nik}. Disarankan ubah kolom NIK menjadi Text agar aman.`);
            } else {
                invalidNIKs.push({
                    row: rowNumber,
                    nik: shown,
                    error: 'Kolom NIK terbaca sebagai angka. Ubah format kolom NIK menjadi Text di Excel lalu isi ulang agar 16 digit tidak terpotong.',
                });
                continue;
            }
        } else {
            // Convert to string and trim (handles numbers/scientific notation)
            nik = normalizeNIKValue(nikValue, cellText);
        }
        console.debug('[excel] normalized NIK', { row: rowNumber, nik });

        // Validate NIK format
        const nikValidation = validateNIKFormat(nik);
        if (!nikValidation.valid) {
            invalidNIKs.push({ row: rowNumber, nik, error: nikValidation.error || 'Invalid' });
            continue;
        }

        // Check for duplicates within file
        if (seenNIKs.has(nik)) {
            duplicateNIKs.push(nik);
            warnings.push(`Baris ${rowNumber}: NIK ${nik} duplikat, baris dilewati`);
            continue;
        }
        seenNIKs.add(nik);

        // Extract optional fields
        const parsedRow: ParsedExcelRow = {
            nik,
            fullName: fullNameColumn && row[fullNameColumn] ? String(row[fullNameColumn]).trim() : null,
            address: addressColumn && row[addressColumn] ? String(row[addressColumn]).trim() : null,
            placeOfBirth: placeOfBirthColumn && row[placeOfBirthColumn] ? String(row[placeOfBirthColumn]).trim() : null,
            birthdate: birthdateColumn ? parseDateFlexible(row[birthdateColumn]) : null,
            district: districtColumn && row[districtColumn] ? String(row[districtColumn]).trim() : null,
            village: villageColumn && row[villageColumn] ? String(row[villageColumn]).trim() : null,
        };

        parsedRows.push(parsedRow);
    }

    // Add summary for invalid NIKs
    if (invalidNIKs.length > 0) {
        const sample = invalidNIKs.slice(0, 3);
        const errorMsg = sample.map(x => `Baris ${x.row}: ${x.nik} (${x.error})`).join('; ');
        warnings.push(`${invalidNIKs.length} NIK tidak valid: ${errorMsg}${invalidNIKs.length > 3 ? '...' : ''}`);
    }

    if (parsedRows.length === 0) {
        throw new Error('Tidak ada baris yang valid setelah parsing. Periksa format NIK Anda (harus 16 digit)');
    }

    return {
        rows: parsedRows,
        warnings,
        fileName: file.name,
    };
}

/**
 * Map Excel rows to PKWT format (array of NIKEntry)
 */
export function mapExcelRowsToPKWT(
    parsedRows: ParsedExcelRow[],
    existingNIKs: NIKEntry[] = []
): { niks: NIKEntry[]; importedData: Record<string, Partial<ParsedExcelRow>>; duplicates: string[] } {
    const existingNIKSet = new Set(existingNIKs.map(entry => entry.nik));
    const duplicates: string[] = [];
    const niks: NIKEntry[] = [];
    const importedData: Record<string, Partial<ParsedExcelRow>> = {};

    for (const row of parsedRows) {
        // Check for duplicates with existing entries
        if (existingNIKSet.has(row.nik)) {
            duplicates.push(row.nik);
            continue;
        }

        // Add to NIK array
        niks.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            nik: row.nik,
        });

        // Store additional data for merging later
        importedData[row.nik] = {
            fullName: row.fullName,
            address: row.address,
            placeOfBirth: row.placeOfBirth,
            birthdate: row.birthdate,
            district: row.district,
            village: row.village,
        };
    }

    return { niks, importedData, duplicates };
}

/**
 * Map Excel rows to PKWTT format (single NIK from first row)
 */
export function mapExcelRowsToPKWTT(
    parsedRows: ParsedExcelRow[]
): { nik: string; importedData: Partial<ParsedExcelRow>; multipleRowsWarning: boolean } {
    if (parsedRows.length === 0) {
        throw new Error('Tidak ada data untuk diimpor');
    }

    const firstRow = parsedRows[0];
    const multipleRowsWarning = parsedRows.length > 1;

    return {
        nik: firstRow.nik,
        importedData: {
            fullName: firstRow.fullName,
            address: firstRow.address,
            placeOfBirth: firstRow.placeOfBirth,
            birthdate: firstRow.birthdate,
            district: firstRow.district,
            village: firstRow.village,
        },
        multipleRowsWarning,
    };
}
