import * as XLSX from 'xlsx';

// Constants
export const MAX_EXCEL_ROWS = 500;
export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Type definitions
export interface ParsedExcelRow {
    nik?: string;
    fullName?: string | null;
    gender?: 'Laki-laki' | 'Perempuan' | null;
    position?: string | null;
    startDate?: string | null; // YYYY-MM-DD
    endDate?: string | null; // YYYY-MM-DD
    address?: string | null; // Kelurahan saja
    pkwtSequence?: string | null; // Roman numeral (I, II, III, dst)
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
    nik: ['nik', 'no_ktp', 'no_ktp_nik'],
    fullName: ['nama', 'full_name', 'fullname', 'name'],
    gender: ['kelamin', 'gender', 'jenis_kelamin'],
    // Gender L/P separate columns (from PKWT template: "Jenis Kelamin L", "Jenis Kelamin P")
    genderL: ['jenis_kelamin_l', 'kelamin_l', 'l'],
    genderP: ['jenis_kelamin_p', 'kelamin_p', 'p'],
    position: ['jabatan', 'posisi', 'position'],
    startDate: ['tmt_mulai', 'tanggal_mulai', 'start_date', 'tanggalmulai'],
    endDate: ['tmt_akhir', 'tanggal_berakhir', 'end_date', 'tanggalberakhir'],
    address: ['alamat', 'address'], // Kelurahan saja
    pkwtSequence: ['no_pkwt', 'keterangan', 'pkwt_ke', 'sequence', 'pkwt_sequence'],
};

/** Max header rows to scan (templates with title + 2 header rows) */
const MAX_HEADER_SCAN = 32;

function cellStr(v: any): string | null {
    if (v == null) return null;
    const s = String(v).trim();
    return s === '' ? null : s;
}

/**
 * Build one label per column for the template row; prefers subheader row, then the row(s) above
 * (handles "TMT Mulai" / "TMT Akhir" in row 3, "No" / "PKWT" in row 2).
 */
function buildMergedLabelArray(aoa: any[][], bottomRow: number, maxW: number): (string | null)[] {
    const labels: (string | null)[] = [];
    for (let c = 0; c < maxW; c++) {
        const s =
            cellStr(aoa[bottomRow]?.[c]) ||
            (bottomRow > 0 ? cellStr(aoa[bottomRow - 1]?.[c]) : null) ||
            (bottomRow > 1 ? cellStr(aoa[bottomRow - 2]?.[c]) : null);
        labels.push(s);
    }
    return labels;
}

/**
 * Unique object keys: empty cells get __col_{c}, duplicate labels get _{c} suffix
 */
function makeUniqueHeaderKeys(labels: (string | null)[], maxW: number): string[] {
    const out: string[] = [];
    const count = new Map<string, number>();
    for (let c = 0; c < maxW; c++) {
        const raw = labels[c] != null && String(labels[c]).trim() !== '' ? String(labels[c]).trim() : null;
        let base = raw || `__col_${c}`;
        const n = (count.get(base) || 0) + 1;
        count.set(base, n);
        const key = n === 1 ? base : `${base}_${c}`;
        out.push(key);
    }
    return out;
}

/**
 * Returns the best 0-based row index to treat as the "header bottom" (row where TMT subheaders often are),
 * merged with rows above, and the corresponding header keys for sheet_to_json-style rows.
 */
function findBestHeaderWithMergedLabels(aoa: any[][]): {
    headerBottomRow: number;
    maxW: number;
    headerKeys: string[];
    usedFallback: boolean;
} {
    if (!aoa.length) {
        return { headerBottomRow: 0, maxW: 1, headerKeys: ['__col_0'], usedFallback: true };
    }
    let maxW = 0;
    for (const r of aoa) {
        maxW = Math.max(maxW, r?.length || 0);
    }
    maxW = Math.max(1, maxW);

    let bestH = 0;
    let bestScore = -Infinity;
    for (let h = 0; h < Math.min(MAX_HEADER_SCAN, aoa.length); h++) {
        const labels = buildMergedLabelArray(aoa, h, maxW);
        const headerKeys = makeUniqueHeaderKeys(labels, maxW);
        const startC = findColumnName(headerKeys, COLUMN_MAPPINGS.startDate);
        const endC = findColumnName(headerKeys, COLUMN_MAPPINGS.endDate);
        const nikC = findColumnName(headerKeys, COLUMN_MAPPINGS.nik);

        if (startC && endC && startC === endC) {
            continue; // TMT baca 1 kolom (merge) — abaikan baris kandidat ini
        }
        let score = 0;
        if (nikC) score += 4;
        if (startC) score += 3;
        if (endC) score += 3;
        if (startC && endC && startC !== endC) score += 20;
        if (score > bestScore) {
            bestScore = score;
            bestH = h;
        }
    }

    if (bestScore === -Infinity) {
        const labels = buildMergedLabelArray(aoa, 0, maxW);
        return {
            headerBottomRow: 0,
            maxW,
            headerKeys: makeUniqueHeaderKeys(labels, maxW),
            usedFallback: true,
        };
    }

    const labels = buildMergedLabelArray(aoa, bestH, maxW);
    return {
        headerBottomRow: bestH,
        maxW,
        headerKeys: makeUniqueHeaderKeys(labels, maxW),
        usedFallback: false,
    };
}

function buildDataRowsAsObjects(
    aoa: any[][],
    headerBottomRow: number,
    maxW: number,
    headerKeys: string[]
): any[] {
    const json: any[] = [];
    for (let r = headerBottomRow + 1; r < aoa.length; r++) {
        const row: Record<string, any> = {};
        for (let c = 0; c < maxW; c++) {
            const key = headerKeys[c] ?? `__col_${c}`;
            row[key] = aoa[r]?.[c] ?? null;
        }
        json.push(row);
    }
    return json;
}

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

    // NOTE: avoid naming helpers with `use*` to prevent React Hooks lint false-positives.
    const parseText = (text: string | undefined | null) => {
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
    const fromCellText = parseText(cellText);
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
 * Normalize gender value to 'Laki-laki' or 'Perempuan'
 * Accepts: L/Laki/Male → Laki-laki, P/Perempuan/Female → Perempuan
 */
function normalizeGender(value: string): 'Laki-laki' | 'Perempuan' | null {
    const lower = value.toLowerCase().trim();
    if (['l', 'laki', 'laki-laki', 'male', 'm', 'pria'].includes(lower)) {
        return 'Laki-laki';
    }
    if (['p', 'perempuan', 'female', 'f', 'wanita'].includes(lower)) {
        return 'Perempuan';
    }
    return null;
}

/**
 * Resolve gender from separate L/P columns (PKWT template format)
 * Returns 'Laki-laki' if L column has value, 'Perempuan' if P column has value
 */
function resolveGenderFromLP(
    row: Record<string, any>,
    genderLColumn: string | null,
    genderPColumn: string | null
): 'Laki-laki' | 'Perempuan' | null {
    const hasL = genderLColumn && row[genderLColumn] != null && String(row[genderLColumn]).trim() !== '';
    const hasP = genderPColumn && row[genderPColumn] != null && String(row[genderPColumn]).trim() !== '';

    if (hasL && !hasP) return 'Laki-laki';
    if (hasP && !hasL) return 'Perempuan';
    if (hasL && hasP) return null; // Ambiguous — both filled
    return null;
}

/**
 * Normalize PKWT sequence to Roman numeral
 * Accepts: "1" → "I", "2" → "II", "I" → "I", "II" → "II", etc.
 */
function normalizePkwtSequence(value: string): string | null {
    const trimmed = value.trim().toUpperCase();

    // Already a Roman numeral (I, II, III, IV, V)
    if (/^I{1,3}V?$|^V$/.test(trimmed)) {
        return trimmed;
    }

    // Numeric input — convert to Roman
    const num = parseInt(trimmed, 10);
    if (isNaN(num) || num < 1 || num > 5) return null;

    const romanMap: Record<number, string> = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' };
    return romanMap[num];
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

    // 2D array: supports multi-row headers (judul, merge "PKWT", lalu TMT Mulai / TMT Akhir)
    const aoa: any[][] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        raw: false,
        defval: null,
    }) as any[][];

    if (!aoa.length) {
        throw new Error('File Excel kosong atau tidak memiliki data');
    }

    const { headerBottomRow, maxW, headerKeys, usedFallback } = findBestHeaderWithMergedLabels(aoa);
    const jsonData: any[] = buildDataRowsAsObjects(aoa, headerBottomRow, maxW, headerKeys);

    if (jsonData.length === 0) {
        throw new Error('File Excel kosong atau tidak memiliki data');
    }

    if (jsonData.length > MAX_EXCEL_ROWS) {
        throw new Error(`File memiliki terlalu banyak baris. Maksimal ${MAX_EXCEL_ROWS} baris, file Anda memiliki ${jsonData.length} baris`);
    }

    if (usedFallback) {
        warnings.push(
            'Tidak menemukan baris header ideal (TMT Mulai / TMT Akhir di kolom berbeda). ' +
                'Menggunakan baris teratas. Pastikan baris 1 tabel memuat header unik, atau sederhanakan jadi satu baris header penuh.'
        );
    }

    const headers = headerKeys;
    console.debug('[excel] header row (0-based)', headerBottomRow, 'headers', headers);

    // Find column names
    const nikColumn = findColumnName(headers, COLUMN_MAPPINGS.nik);
    const hasNikColumn = nikColumn !== null;

    // Optional columns
    const fullNameColumn = findColumnName(headers, COLUMN_MAPPINGS.fullName);
    const genderColumn = findColumnName(headers, COLUMN_MAPPINGS.gender);
    const genderLColumn = findColumnName(headers, COLUMN_MAPPINGS.genderL);
    const genderPColumn = findColumnName(headers, COLUMN_MAPPINGS.genderP);
    const positionColumn = findColumnName(headers, COLUMN_MAPPINGS.position);
    const startDateColumn = findColumnName(headers, COLUMN_MAPPINGS.startDate);
    const endDateColumn = findColumnName(headers, COLUMN_MAPPINGS.endDate);
    const addressColumn = findColumnName(headers, COLUMN_MAPPINGS.address);
    const pkwtSequenceColumn = findColumnName(headers, COLUMN_MAPPINGS.pkwtSequence);

    if (!hasNikColumn) {
        warnings.push('Kolom NIK tidak ditemukan. Pastikan NIK diisi manual di form setelah impor');
    }

    if (startDateColumn && endDateColumn && startDateColumn === endDateColumn) {
        warnings.push(
            'Kolom TMT Mulai / tanggal mulai dan TMT Akhir / tanggal akhir terpetakan ke header yang sama. ' +
                'Cek file (merge, nama kolom ganda) atau sederhanakan jadi satu baris header penuh.'
        );
    }

    // Parse rows
    const parsedRows: ParsedExcelRow[] = [];
    const seenNIKs = new Set<string>();
    const duplicateNIKs: string[] = [];
    const invalidNIKs: Array<{ row: number; nik: string; error: string }> = [];
    let sameDateRowWarnings = 0;
    const MAX_SAME_DATE_WARNINGS = 5;

    for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        // 1-based Excel row: setelah baris header bawah, baris data pertama = headerBottomRow + 2
        const rowNumber = headerBottomRow + 2 + i;

        // Extract NIK (optional — may not exist in template)
        let nik: string | undefined;

        if (hasNikColumn && nikColumn) {
            // Extract raw cell text to mitigate Excel precision loss on long numbers
            const nikColumnIndex = headers.indexOf(nikColumn);
            let cellText: string | undefined;
            let cellType: string | undefined;
            if (nikColumnIndex >= 0) {
                const dataRow0Based = headerBottomRow + 1 + i; // 0-based sheet row
                const cellAddress = XLSX.utils.encode_cell({ c: nikColumnIndex, r: dataRow0Based });
                const cell = worksheet[cellAddress];
                if (cell && typeof cell.w === 'string') {
                    cellText = cell.w;
                }
                if (cell && typeof cell.t === 'string') {
                    cellType = cell.t;
                }
            }

            const nikValue = row[nikColumn];
            if (nikValue) {
                // If Excel stored NIK as numeric, it is unsafe (Excel trims after 15 digits).
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
                    nik = normalizeNIKValue(nikValue, cellText);
                }

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
            }
        }

        // If no NIK column at all, generate a placeholder (user must fill NIK manually in form)
        if (!nik) {
            const fullName = fullNameColumn && row[fullNameColumn] ? String(row[fullNameColumn]).trim() : '';
            nik = `TEMP_${rowNumber}_${fullName || i}`;
            warnings.push(`Baris ${rowNumber}: NIK tidak ada, menggunakan ID sementara. Isi NIK manual di form.`);
        }

        // Resolve gender: prefer explicit gender column, fall back to L/P columns
        let gender: 'Laki-laki' | 'Perempuan' | null = null;
        if (genderColumn && row[genderColumn]) {
            gender = normalizeGender(String(row[genderColumn]).trim());
        }
        if (!gender && (genderLColumn || genderPColumn)) {
            gender = resolveGenderFromLP(row, genderLColumn, genderPColumn);
        }

        // Extract optional fields
        const rawSequence = pkwtSequenceColumn && row[pkwtSequenceColumn] ? String(row[pkwtSequenceColumn]).trim() : null;

        const parsedRow: ParsedExcelRow = {
            nik,
            fullName: fullNameColumn && row[fullNameColumn] ? String(row[fullNameColumn]).trim() : null,
            gender,
            position: positionColumn && row[positionColumn] ? String(row[positionColumn]).trim() : null,
            startDate: startDateColumn ? parseDateFlexible(row[startDateColumn]) : null,
            endDate: endDateColumn ? parseDateFlexible(row[endDateColumn]) : null,
            address: addressColumn && row[addressColumn] ? String(row[addressColumn]).trim() : null,
            pkwtSequence: rawSequence ? normalizePkwtSequence(rawSequence) : null,
        };

        if (
            sameDateRowWarnings < MAX_SAME_DATE_WARNINGS &&
            parsedRow.startDate &&
            parsedRow.endDate &&
            parsedRow.startDate === parsedRow.endDate
        ) {
            sameDateRowWarnings += 1;
            warnings.push(
                `Baris ${rowNumber}: tgl mulai dan tgl akhir sama (${parsedRow.startDate}). ` +
                    'Periksa isi/merge, atau isi kembali di form.'
            );
        }

        parsedRows.push(parsedRow);
    }

    // Add summary for invalid NIKs
    if (invalidNIKs.length > 0) {
        const sample = invalidNIKs.slice(0, 3);
        const errorMsg = sample.map(x => `Baris ${x.row}: ${x.nik} (${x.error})`).join('; ');
        warnings.push(`${invalidNIKs.length} NIK tidak valid: ${errorMsg}${invalidNIKs.length > 3 ? '...' : ''}`);
    }

    if (parsedRows.length === 0) {
        throw new Error('Tidak ada baris yang valid setelah parsing. Periksa format file Excel Anda');
    }

    return {
        rows: parsedRows,
        warnings,
        fileName: file.name,
    };
}

/**
 * Map Excel rows to PKWT format (array of NIKEntry with imported data)
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
        if (!row.nik) continue;

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
            gender: row.gender,
            position: row.position,
            startDate: row.startDate,
            endDate: row.endDate,
            address: row.address,
            pkwtSequence: row.pkwtSequence,
        };
    }

    return { niks, importedData, duplicates };
}

/**
 * Map Excel rows to PKWTT format (single NIK from first row)
 * NOTE: PKWTT now auto-populates from existing PKWT data via checkNIKs API.
 * This function is kept for backward compatibility but may be unused.
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
        nik: firstRow.nik ?? '',
        importedData: {
            fullName: firstRow.fullName,
            gender: firstRow.gender,
            position: firstRow.position,
            startDate: firstRow.startDate,
            address: firstRow.address,
            pkwtSequence: firstRow.pkwtSequence,
        },
        multipleRowsWarning,
    };
}
