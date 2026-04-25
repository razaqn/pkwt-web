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
    noPkwt?: string | null; // Nomor Surat dari HRD
    pkwtSequence?: string | null; // System counter (if any)
    keterangan?: string | null; // Kolom Ket
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
    const str = String(nikValue).trim();
    
    // Handle scientific notation (e.g. 3.27E+15)
    if (str.toLowerCase().includes('e+')) {
        try {
            return BigInt(Math.floor(Number(str))).toString();
        } catch (e) {
            return str.replace(/[^0-9]/g, '');
        }
    }
    
    return str.replace(/[^0-9]/g, '');
}

/**
 * Relaxed NIK validation: must be numeric, length can be anything.
 */
export function validateNIKFormat(nik: string): { valid: boolean; error?: string } {
    if (!nik) return { valid: false, error: 'NIK kosong' };
    const trimmed = nik.trim();
    if (!/^\d+$/.test(trimmed)) return { valid: false, error: 'NIK harus berupa angka' };
    return { valid: true };
}

/**
 * Improved Date Parser for Excel formats like 12/12/26 or 12-12-2026.
 * Returns ISO string YYYY-MM-DD.
 */
export function parseDateFlexible(value: any): string | null {
    if (!value) return null;

    if (value instanceof Date) {
        if (isNaN(value.getTime())) return null;
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const day = String(value.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Excel Serial Date (Number)
    if (typeof value === 'number') {
        try {
            // Excel dates are number of days since Dec 30, 1899
            const date = new Date(Math.round((value - 25569) * 864e5));
            if (!isNaN(date.getTime())) return date.toISOString().split('T')[0];
        } catch (e) { return null; }
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return null;

        // Try dd/mm/yy or dd-mm-yy or dd/mm/yyyy
        const match = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
        if (match) {
            let day = parseInt(match[1], 10);
            let month = parseInt(match[2], 10);
            let year = parseInt(match[3], 10);

            // Handle 2-digit year (assume 20xx)
            if (year < 100) year += 2000;

            const date = new Date(year, month - 1, day);
            if (!isNaN(date.getTime()) && date.getFullYear() === year) {
                return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            }
        }

        // Try ISO
        const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
    }

    return null;
}

/**
 * Dynamically find column indices from 2D array data.
 * Handles nested headers by scanning multiple rows if necessary.
 */
function findColumnIndices(data: any[][]) {
    const indices: Record<string, number> = {
        no: -1, nama: -1, genderL: -1, genderP: -1, noPkwt: -1, jabatan: -1, tmtMulai: -1, tmtAkhir: -1, alamat: -1, ket: -1, nik: -1
    };

    let headerRowIndex = -1;

    // Scan first 10 rows to find the main header
    for (let r = 0; r < Math.min(data.length, 10); r++) {
        const row = data[r].map(c => String(c || '').toLowerCase().trim());
        const hasNama = row.some(c => c.includes('nama'));
        const hasNik = row.some(c => c.includes('nik'));
        const hasPkwtNo = row.some(c => c.includes('pkwt') && (c.includes('no') || c.includes('nomor')));
        
        if (hasNama && (hasNik || hasPkwtNo)) {
            headerRowIndex = r;
            break;
        }
    }

    if (headerRowIndex === -1) return { indices, dataStartRow: -1 };

    const mainHeader = data[headerRowIndex].map(c => String(c || '').toLowerCase().trim());
    const subHeader = data[headerRowIndex + 1] ? data[headerRowIndex + 1].map(c => String(c || '').toLowerCase().trim()) : [];

    mainHeader.forEach((val, i) => {
        if (val === 'no') indices.no = i;
        if (val.includes('nama')) indices.nama = i;
        if (val.includes('jabatan')) indices.jabatan = i;
        if (val.includes('alamat')) indices.alamat = i;
        if (val.includes('ket')) indices.ket = i;
        if (val.includes('nik')) indices.nik = i;
        if (val.includes('pkwt') && (val.includes('no') || val.includes('nomor'))) indices.noPkwt = i;

        // Nested headers for Gender
        if (val.includes('jenis kelamin') || val.includes('kelamin')) {
            // Check current column or next columns in subHeader
            if (val.includes(' l')) indices.genderL = i;
            else if (val.includes(' p')) indices.genderP = i;
            else {
                if (subHeader[i] === 'l') indices.genderL = i;
                if (subHeader[i+1] === 'p') indices.genderP = i+1;
            }
        }
        
        // Nested headers for PKWT TMT
        if (val === 'pkwt') {
            if (subHeader[i]?.includes('tmt mulai')) indices.tmtMulai = i;
            if (subHeader[i+1]?.includes('tmt akhir')) indices.tmtAkhir = i;
        }
    });

    // Final fallback for NIK if not found by exact match
    if (indices.nik === -1) indices.nik = mainHeader.findIndex(v => v.includes('nik'));

    // Check if subHeader actually exists by looking for known subheader keywords
    const subHeaderStr = subHeader.join(' ');
    const hasSubHeader = subHeaderStr.includes('tmt mulai') || subHeaderStr.includes('tmt akhir') || subHeader.includes('l') || subHeader.includes('p');

    return { indices, dataStartRow: hasSubHeader ? headerRowIndex + 2 : headerRowIndex + 1 };
}

/**
 * Main parser function.
 */
export async function parseExcelFile(file: File): Promise<ParseExcelResult> {
    const warnings: string[] = [];
    if (file.size > MAX_FILE_SIZE_BYTES) throw new Error(`File terlalu besar (Maks ${MAX_FILE_SIZE_MB}MB)`);

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

        // Gender Resolution
        let gender: 'Laki-laki' | 'Perempuan' | null = null;
        const valL = indices.genderL !== -1 ? String(row[indices.genderL] || '').trim().toLowerCase() : '';
        const valP = indices.genderP !== -1 ? String(row[indices.genderP] || '').trim().toLowerCase() : '';
        if (valL && !valP) gender = 'Laki-laki';
        else if (valP && !valL) gender = 'Perempuan';

        parsedRows.push({
            nik,
            fullName: indices.nama !== -1 ? String(row[indices.nama] || '').trim() || null : null,
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

    if (parsedRows.length === 0) throw new Error('Tidak ada data valid yang ditemukan.');

    return { rows: parsedRows, warnings, fileName: file.name };
}

/**
 * Map to UI format.
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
        if (existingNIKSet.has(row.nik)) {
            duplicates.push(row.nik);
            continue;
        }

        niks.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            nik: row.nik,
        });

        importedData[row.nik] = { ...row };
    }

    return { niks, importedData, duplicates };
}

/**
 * Map to PKWTT (Single).
 */
export function mapExcelRowsToPKWTT(parsedRows: ParsedExcelRow[]) {
    if (parsedRows.length === 0) throw new Error('Tidak ada data');
    const first = parsedRows[0];
    return {
        nik: first.nik ?? '',
        importedData: { ...first },
        multipleRowsWarning: parsedRows.length > 1,
    };
}
