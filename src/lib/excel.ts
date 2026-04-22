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
    pkwtSequence?: string | null; // Nomor PKWT Asli
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

/**
 * Normalizes NIK cell value into a digit-only string.
 */
export function normalizeNIKValue(nikValue: any): string {
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
        if (row.includes('nama') && (row.includes('nik') || row.includes('no. pkwt') || row.includes('no pkwt'))) {
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
        if (val === 'nik') indices.nik = i;
        if (val.includes('no.') && val.includes('pkwt')) indices.noPkwt = i;
        if (val === 'no pkwt') indices.noPkwt = i;

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
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null }) as any[][];

    if (rawData.length === 0) throw new Error('File Excel kosong');

    const { indices, dataStartRow } = findColumnIndices(rawData);
    if (dataStartRow === -1) throw new Error('Format Header Excel tidak dikenali. Pastikan kolom "Nama" dan "NIK" tersedia.');

    const parsedRows: ParsedExcelRow[] = [];
    const seenNIKs = new Set<string>();

    for (let i = dataStartRow; i < rawData.length; i++) {
        const row = rawData[i];
        if (!row || row.length === 0) continue;
        
        // Check if row is mostly empty (skip rows that only have a sequence number but no NIK and no Nama)
        const nameVal = indices.nama !== -1 ? String(row[indices.nama] || '').trim() : '';
        const nikValRaw = indices.nik !== -1 ? String(row[indices.nik] || '').trim() : '';
        if (!nameVal && !nikValRaw) continue;

        const rowNumber = i + 1;
        
        // Extract & Normalize NIK
        let nikValue = indices.nik !== -1 ? row[indices.nik] : null;
        let nik = normalizeNIKValue(nikValue);

        if (!nik) {
            const name = indices.nama !== -1 ? String(row[indices.nama] || '').trim() : '';
            nik = `TEMP_${rowNumber}_${name || i}`;
            warnings.push(`Baris ${rowNumber}: NIK kosong, menggunakan ID sementara.`);
        } else {
            if (seenNIKs.has(nik)) {
                warnings.push(`Baris ${rowNumber}: NIK ${nik} duplikat, dilewati.`);
                continue;
            }
            seenNIKs.add(nik);
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
            position: indices.jabatan !== -1 ? String(row[indices.jabatan] || '').trim() || null : null,
            startDate: indices.tmtMulai !== -1 ? parseDateFlexible(row[indices.tmtMulai]) : null,
            endDate: indices.tmtAkhir !== -1 ? parseDateFlexible(row[indices.tmtAkhir]) : null,
            address: indices.alamat !== -1 ? String(row[indices.alamat] || '').trim() || null : null,
            pkwtSequence: indices.noPkwt !== -1 ? String(row[indices.noPkwt] || '').trim() || null : null,
            keterangan: indices.ket !== -1 ? String(row[indices.ket] || '').trim() || null : null,
        });
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
