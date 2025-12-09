# Test Fixtures for Excel Import Feature

This directory contains sample Excel files for manual testing of the Excel import feature.

## How to Create Test Files

Use Excel, Google Sheets, or LibreOffice Calc to create these files:

## 1. valid-pkwt.xlsx

**Purpose:** Test successful import of PKWT with multiple employees

**Columns:**
- NIK (required)
- full_name
- address
- birthdate
- district
- village
- place_of_birth

**Sample Data:**
```
NIK                | full_name    | address           | birthdate  | district    | village     | place_of_birth
1234567890123456   | John Doe     | Jl. Sudirman 1    | 1990-01-15 | Menteng     | Gondangdia  | Jakarta
2345678901234567   | Jane Smith   | Jl. Thamrin 2     | 1992-05-20 | Tanah Abang | Kebon Kacang| Bandung
3456789012345678   | Bob Johnson  | Jl. Asia Afrika 3 | 1988-12-10 | Sumur Bandung| Braga     | Surabaya
```

---

## 2. valid-pkwtt.xlsx

**Purpose:** Test PKWTT import (single employee)

**Columns:**
- NIK
- name
- place_of_birth
- address

**Sample Data:**
```
NIK                | name         | place_of_birth | address
4567890123456789   | Alice Wong   | Medan          | Jl. Gatot Subroto 10
```

---

## 3. missing-nik-column.xlsx

**Purpose:** Test error handling when NIK column is missing

**Columns:**
- name
- address

**Sample Data:**
```
name         | address
John Doe     | Jl. Sudirman 1
```

**Expected Result:** Error message "Kolom 'NIK' tidak ditemukan"

---

## 4. invalid-niks.xlsx

**Purpose:** Test validation of invalid NIK formats

**Columns:**
- NIK
- name

**Sample Data:**
```
NIK                  | name
12345                | Too Short (invalid)
12345678901234567    | Too Long (invalid)
abcd567890123456     | Non-numeric (invalid)
1234567890123456     | Valid
```

**Expected Result:** Warnings for first 3 rows, only last row imported

---

## 5. duplicate-niks.xlsx

**Purpose:** Test duplicate NIK detection within file

**Columns:**
- NIK
- name

**Sample Data:**
```
NIK                | name
1234567890123456   | John Doe
2345678901234567   | Jane Smith
1234567890123456   | Duplicate John (should be skipped)
```

**Expected Result:** Warning about duplicate NIK, only 2 unique NIKs imported

---

## 6. mixed-dates.xlsx

**Purpose:** Test date parsing from various formats

**Columns:**
- NIK
- birthdate

**Sample Data:**
```
NIK                | birthdate
1234567890123456   | 2000-01-15      (ISO format)
2345678901234567   | 15/01/2000      (dd/mm/yyyy)
3456789012345678   | 15-01-2000      (dd-mm-yyyy)
```

**Expected Result:** All dates converted to 2000-01-15

---

## 7. empty-rows.xlsx

**Purpose:** Test handling of empty rows

**Columns:**
- NIK
- name

**Sample Data:**
```
NIK                | name
1234567890123456   | John Doe
                   |              (empty row)
2345678901234567   | Jane Smith
```

**Expected Result:** Warning about empty row, 2 valid rows imported

---

## 8. case-variations.xlsx

**Purpose:** Test case-insensitive column matching

**Columns:**
- nik (lowercase)
- Full Name (space-separated)
- PLACE_OF_BIRTH (uppercase)

**Sample Data:**
```
nik                | Full Name | PLACE_OF_BIRTH
1234567890123456   | John Doe  | Jakarta
```

**Expected Result:** Columns recognized despite case variations

---

## 9. special-characters.xlsx

**Purpose:** Test handling of special characters

**Columns:**
- NIK
- name
- address

**Sample Data:**
```
NIK                | name                | address
1234567890123456   | O'Brien             | Jl. "Mangga" No. 5
2345678901234567   | José García         | Komplek A & B
```

**Expected Result:** Special characters preserved correctly

---

## 10. valid.csv

**Purpose:** Test CSV file import

**Content:**
```csv
NIK,name,address
1234567890123456,John Doe,Jl. Sudirman 1
2345678901234567,Jane Smith,Jl. Thamrin 2
```

**Expected Result:** CSV parsed same as Excel

---

## Creating Files Programmatically (Optional)

If you want to create these files programmatically, use this Node.js script:

```javascript
const XLSX = require('xlsx');

function createValidPKWT() {
    const data = [
        { NIK: '1234567890123456', full_name: 'John Doe', address: 'Jl. Sudirman 1', birthdate: '1990-01-15' },
        { NIK: '2345678901234567', full_name: 'Jane Smith', address: 'Jl. Thamrin 2', birthdate: '1992-05-20' },
        { NIK: '3456789012345678', full_name: 'Bob Johnson', address: 'Jl. Asia Afrika 3', birthdate: '1988-12-10' },
    ];
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'tests/fixtures/valid-pkwt.xlsx');
}

createValidPKWT();
// Repeat for other fixtures...
```

---

## Testing Checklist

- [ ] valid-pkwt.xlsx created and tested
- [ ] valid-pkwtt.xlsx created and tested
- [ ] missing-nik-column.xlsx created and tested
- [ ] invalid-niks.xlsx created and tested
- [ ] duplicate-niks.xlsx created and tested
- [ ] mixed-dates.xlsx created and tested
- [ ] empty-rows.xlsx created and tested
- [ ] case-variations.xlsx created and tested
- [ ] special-characters.xlsx created and tested
- [ ] valid.csv created and tested

---

## Manual Testing Procedure

1. Start dev server: `npm run dev`
2. Navigate to `/form-kontrak`
3. For each fixture file:
   - Click "Import dari Excel"
   - Select fixture file
   - Verify expected behavior (success message, error message, warnings)
   - Check imported data in form fields
   - Continue to PengajuanBerkas to verify data merge
4. Document any issues in GitHub Issues

---

## Automated Testing (Future)

To set up automated testing with these fixtures:

1. Install Vitest: `npm install --save-dev vitest`
2. Add to package.json: `"test": "vitest"`
3. Uncomment test cases in `src/lib/excel.test.ts`
4. Run tests: `npm test`
