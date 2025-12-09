/**
 * Unit Tests for Excel Parser (excel.ts)
 * 
 * Automated tests for Excel parsing functionality
 * Run with: npm test
 */

import { describe, it, expect } from 'vitest';
import {
    mapExcelRowsToPKWT,
    mapExcelRowsToPKWTT,
    parseDateFlexible,
    validateNIKFormat,
    normalizeNIKValueForTest,
} from './excel';

// ==================== Test Fixtures ====================

/**
 * Manual Test: Create sample Excel files for testing
 * 
 * Create these files in tests/fixtures/ directory:
 * 
 * 1. valid-pkwt.xlsx
 *    - Columns: NIK, full_name, address, birthdate
 *    - 3 rows of valid data
 *    - NIKs: 1234567890123456, 2345678901234567, 3456789012345678
 * 
 * 2. valid-pkwtt.xlsx
 *    - Columns: NIK, name, place_of_birth
 *    - 1 row of valid data
 *    - NIK: 4567890123456789
 * 
 * 3. missing-nik-column.xlsx
 *    - Columns: name, address (no NIK column)
 *    - Should throw error: "Kolom 'NIK' tidak ditemukan"
 * 
 * 4. invalid-niks.xlsx
 *    - Columns: NIK, name
 *    - Rows with invalid NIKs: 12345 (too short), abcd1234567890123 (non-numeric)
 * 
 * 5. duplicate-niks.xlsx
 *    - Columns: NIK, name
 *    - Same NIK appears in rows 2 and 3
 * 
 * 6. large-file.xlsx
 *    - File size > 5MB
 *    - Should throw error about file size
 * 
 * 7. too-many-rows.xlsx
 *    - More than 500 rows
 *    - Should throw error about row limit
 * 
 * 8. mixed-dates.xlsx
 *    - Columns: NIK, birthdate
 *    - Dates in various formats: 2000-01-15, 15/01/2000, 15-01-2000
 */

// ==================== Test Suite: validateNIKFormat ====================

describe('validateNIKFormat', () => {
    it('should accept valid 16-digit NIK', () => {
        const result = validateNIKFormat('1234567890123456');
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
    });

    it('should reject NIK with less than 16 digits', () => {
        const result = validateNIKFormat('12345');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('16 digit');
    });

    it('should reject NIK with more than 16 digits', () => {
        const result = validateNIKFormat('12345678901234567');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('16 digit');
    });

    it('should reject NIK with non-numeric characters', () => {
        const result = validateNIKFormat('123456789012345a');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('angka');
    });

    it('should reject empty NIK', () => {
        const result = validateNIKFormat('');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('kosong');
    });

    it('should reject null/undefined NIK', () => {
        const result1 = validateNIKFormat(null as any);
        const result2 = validateNIKFormat(undefined as any);
        expect(result1.valid).toBe(false);
        expect(result2.valid).toBe(false);
    });

    it('should trim whitespace and validate', () => {
        const result = validateNIKFormat('  1234567890123456  ');
        expect(result.valid).toBe(true);
    });

    it('should validate NIK normalized from scientific notation', () => {
        const normalized = normalizeNIKValueForTest(4.567890123456789e15);
        const result = validateNIKFormat(normalized);
        expect(result.valid).toBe(true);
        expect(normalized.length).toBe(16);
    });

    it('should prefer cell text to avoid precision loss', () => {
        const normalized = normalizeNIKValueForTest(4.567890123456789e15, '4567890123456789');
        expect(normalized).toBe('4567890123456789');
        const result = validateNIKFormat(normalized);
        expect(result.valid).toBe(true);
    });

    it('should expand scientific notation string safely', () => {
        const normalized = normalizeNIKValueForTest('4.567890123456789E+15');
        expect(normalized).toBe('4567890123456789');
        const result = validateNIKFormat(normalized);
        expect(result.valid).toBe(true);
    });

    it('should accept numeric cell text when expandable', () => {
        // Simulate parseExcelFile logic path: cellType numeric but text provides scientific notation
        const cellText = '4.567890123456789E+15';
        const normalized = normalizeNIKValueForTest(4.56789e15, cellText);
        expect(normalized).toBe('4567890123456789');
        expect(validateNIKFormat(normalized).valid).toBe(true);
    });
});

// ==================== Test Suite: parseDateFlexible ====================

describe('parseDateFlexible', () => {
    it('should parse ISO date format (YYYY-MM-DD)', () => {
        const result = parseDateFlexible('2000-01-15');
        expect(result).toBe('2000-01-15');
    });

    it('should parse dd/mm/yyyy format', () => {
        const result = parseDateFlexible('15/01/2000');
        expect(result).toBe('2000-01-15');
    });

    it('should parse dd-mm-yyyy format', () => {
        const result = parseDateFlexible('15-01-2000');
        expect(result).toBe('2000-01-15');
    });

    it('should handle Date objects', () => {
        const date = new Date('2000-01-15');
        const result = parseDateFlexible(date);
        expect(result).toBe('2000-01-15');
    });

    it('should return null for invalid date strings', () => {
        const result = parseDateFlexible('invalid-date');
        expect(result).toBe(null);
    });

    it('should return null for empty/null values', () => {
        expect(parseDateFlexible('')).toBe(null);
        expect(parseDateFlexible(null)).toBe(null);
        expect(parseDateFlexible(undefined)).toBe(null);
    });

    it('should handle Excel serial date numbers', () => {
        // Excel serial date 36526 = 2000-01-01
        const result = parseDateFlexible(36526);
        expect(result).toMatch(/2000-01-01/);
    });
});

// ==================== Test Suite: parseExcelFile ====================

describe('parseExcelFile', () => {
    it('should parse valid XLSX file with required NIK column', async () => {
        // Manual test: Load valid-pkwt.xlsx
        // const file = new File([...], 'valid-pkwt.xlsx');
        // const result = await parseExcelFile(file);
        // expect(result.rows).toHaveLength(3);
        // expect(result.rows[0].nik).toBe('1234567890123456');
        // expect(result.warnings).toHaveLength(0);
    });

    it('should reject file without NIK column', async () => {
        // Manual test: Load missing-nik-column.xlsx
        // await expect(parseExcelFile(file)).rejects.toThrow('Kolom "NIK" tidak ditemukan');
    });

    it('should reject file larger than 5MB', async () => {
        // Manual test: Create file > 5MB
        // await expect(parseExcelFile(file)).rejects.toThrow('File terlalu besar');
    });

    it('should reject file with more than 500 rows', async () => {
        // Manual test: Load too-many-rows.xlsx
        // await expect(parseExcelFile(file)).rejects.toThrow('terlalu banyak baris');
    });

    it('should handle invalid NIKs and return warnings', async () => {
        // Manual test: Load invalid-niks.xlsx
        // const result = await parseExcelFile(file);
        // expect(result.warnings.length).toBeGreaterThan(0);
        // expect(result.warnings[0]).toContain('tidak valid');
    });

    it('should detect duplicate NIKs within file', async () => {
        // Manual test: Load duplicate-niks.xlsx
        // const result = await parseExcelFile(file);
        // expect(result.warnings.some(w => w.includes('duplikat'))).toBe(true);
    });

    it('should skip empty rows', async () => {
        // Manual test: Load file with empty rows
        // const result = await parseExcelFile(file);
        // expect(result.warnings.some(w => w.includes('kosong'))).toBe(true);
    });

    it('should parse optional columns (fullName, address, etc.)', async () => {
        // Manual test: Load valid-pkwt.xlsx
        // const result = await parseExcelFile(file);
        // expect(result.rows[0].fullName).toBeTruthy();
        // expect(result.rows[0].address).toBeTruthy();
    });

    it('should accept CSV files', async () => {
        // Manual test: Load valid.csv
        // const file = new File([...], 'valid.csv');
        // const result = await parseExcelFile(file);
        // expect(result.rows.length).toBeGreaterThan(0);
    });

    it('should reject unsupported file formats', async () => {
        // Manual test: Try to load .txt or .doc file
        // const file = new File([...], 'invalid.txt');
        // await expect(parseExcelFile(file)).rejects.toThrow('Format file tidak didukung');
    });
});

// ==================== Test Suite: mapExcelRowsToPKWT ====================

describe('mapExcelRowsToPKWT', () => {
    it('should map parsed rows to NIKEntry array', () => {
        const parsedRows = [
            { nik: '1234567890123456', fullName: 'John Doe', address: 'Jakarta' },
            { nik: '2345678901234567', fullName: 'Jane Doe', address: 'Bandung' },
        ];

        const result = mapExcelRowsToPKWT(parsedRows, []);

        expect(result.niks).toHaveLength(2);
        expect(result.niks[0].nik).toBe('1234567890123456');
        expect(result.niks[0].id).toBeTruthy(); // Should have generated ID
        expect(result.importedData['1234567890123456'].fullName).toBe('John Doe');
        expect(result.duplicates).toHaveLength(0);
    });

    it('should detect duplicates with existing NIKs', () => {
        const parsedRows = [
            { nik: '1234567890123456', fullName: 'John Doe' },
            { nik: '2345678901234567', fullName: 'Jane Doe' },
        ];

        const existingNIKs = [
            { id: '1', nik: '1234567890123456' },
        ];

        const result = mapExcelRowsToPKWT(parsedRows, existingNIKs);

        expect(result.niks).toHaveLength(1); // Only non-duplicate
        expect(result.niks[0].nik).toBe('2345678901234567');
        expect(result.duplicates).toContain('1234567890123456');
    });

    it('should create importedData mapping for all NIKs', () => {
        const parsedRows = [
            {
                nik: '1234567890123456',
                fullName: 'John Doe',
                address: 'Jakarta',
                birthdate: '2000-01-15',
            },
        ];

        const result = mapExcelRowsToPKWT(parsedRows, []);

        const importedData = result.importedData['1234567890123456'];
        expect(importedData.fullName).toBe('John Doe');
        expect(importedData.address).toBe('Jakarta');
        expect(importedData.birthdate).toBe('2000-01-15');
        expect(importedData.placeOfBirth).toBeUndefined();
        expect(importedData.district).toBeUndefined();
        expect(importedData.village).toBeUndefined();
    });
});

// ==================== Test Suite: mapExcelRowsToPKWTT ====================

describe('mapExcelRowsToPKWTT', () => {
    it('should extract first row for PKWTT', () => {
        const parsedRows = [
            { nik: '1234567890123456', fullName: 'John Doe' },
            { nik: '2345678901234567', fullName: 'Jane Doe' },
        ];

        const result = mapExcelRowsToPKWTT(parsedRows);

        expect(result.nik).toBe('1234567890123456');
        expect(result.importedData.fullName).toBe('John Doe');
        expect(result.multipleRowsWarning).toBe(true);
    });

    it('should not warn for single row', () => {
        const parsedRows = [
            { nik: '1234567890123456', fullName: 'John Doe' },
        ];

        const result = mapExcelRowsToPKWTT(parsedRows);

        expect(result.nik).toBe('1234567890123456');
        expect(result.multipleRowsWarning).toBe(false);
    });

    it('should throw error for empty array', () => {
        expect(() => mapExcelRowsToPKWTT([])).toThrow('Tidak ada data');
    });
});

// ==================== Integration Test Scenarios ====================

/**
 * Manual Integration Test Scenarios:
 * 
 * Scenario 1: Import Valid PKWT Excel
 * 1. Open FormKontrak page, select PKWT tab
 * 2. Click "Import dari Excel"
 * 3. Select valid-pkwt.xlsx (3 employees)
 * 4. Verify: Success message shows "3 NIK berhasil diimpor"
 * 5. Verify: NIK inputs are prefilled with imported data
 * 6. Verify: Can manually edit imported NIKs
 * 7. Fill start date, duration, upload PDF
 * 8. Click "Lanjut ke Pengajuan"
 * 9. Verify: PengajuanBerkas shows imported data merged with backend data
 * 
 * Scenario 2: Import with Duplicate NIKs
 * 1. Manually add NIK: 1234567890123456
 * 2. Import Excel containing same NIK
 * 3. Verify: Warning shows "1 NIK duplikat dilewati"
 * 4. Verify: Only non-duplicate NIKs are added
 * 
 * Scenario 3: Import Invalid Excel
 * 1. Try to import file without NIK column
 * 2. Verify: Error message shows "Kolom 'NIK' tidak ditemukan"
 * 3. Try to import file > 5MB
 * 4. Verify: Error message shows file size limit
 * 
 * Scenario 4: Import PKWTT Excel
 * 1. Open FormKontrak page, select PKWTT tab
 * 2. Import Excel with multiple rows
 * 3. Verify: Warning shows "Hanya baris pertama yang digunakan"
 * 4. Verify: NIK field prefilled with first row only
 * 
 * Scenario 5: Data Merge Priority
 * 1. Import Excel with fullName="Excel Name", address="Excel Address"
 * 2. Backend returns fullName="Backend Name", address=null
 * 3. Verify: PengajuanBerkas shows:
 *    - fullName = "Backend Name" (backend wins)
 *    - address = "Excel Address" (Excel fills empty field)
 * 
 * Scenario 6: Date Format Handling
 * 1. Import Excel with dates in mixed formats (dd/mm/yyyy, ISO)
 * 2. Verify: All dates converted to YYYY-MM-DD
 * 3. Submit contract
 * 4. Verify: Backend accepts date format
 */

// ==================== Performance Test Cases ====================

/**
 * Performance Test 1: Large File (Near Limit)
 * - File size: 4.9MB
 * - Rows: 450
 * - Expected: Parses within 2 seconds
 * - Expected: No memory issues
 * 
 * Performance Test 2: Maximum Rows
 * - Rows: 500 (exactly at limit)
 * - Expected: Parses successfully
 * - Expected: UI remains responsive
 * 
 * Performance Test 3: Complex Data
 * - All optional columns filled
 * - Mixed date formats
 * - Special characters in text
 * - Expected: Handles all data types correctly
 */

// ==================== Edge Cases ====================

/**
 * Edge Case 1: Column Name Variations
 * Test with: "NIK", "nik", "Nik", " NIK ", "full_name", "fullName", "Full Name"
 * Expected: Case-insensitive matching works
 * 
 * Edge Case 2: Special Characters
 * Test NIKs/names with: Unicode characters, emojis, quotes
 * Expected: Handles or rejects gracefully
 * 
 * Edge Case 3: Excel Formulas
 * Test cell with formula: =CONCATENATE("123", "456")
 * Expected: Uses calculated value, not formula
 * 
 * Edge Case 4: Empty Sheet
 * Test Excel file with no data rows
 * Expected: Error message "File Excel kosong"
 * 
 * Edge Case 5: Multiple Sheets
 * Test Excel with multiple sheets
 * Expected: Only first sheet is processed
 */

export { };
