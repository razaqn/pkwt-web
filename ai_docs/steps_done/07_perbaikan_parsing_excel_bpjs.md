# Step 07 - Perbaikan Parsing Excel BPJS (Tanggal & Status Kepesertaan)

## Ringkasan Perbaikan

Dua bug ditemukan setelah implementasi step 06:
1. **Tanggal lahir mundur 1 hari** - Saat format tanggal di Excel bukan plain text (misalnya format Date/Number), tanggal yang terbaca mundur 1 hari (contoh: `01-01-2000` → `31/12/1999`).
2. **Status Kepesertaan tidak terbaca** (`undefined`) - Kolom "Status Kepesertaan" di Excel selalu menghasilkan nilai `undefined` meskipun data ada.

---

## Root Cause Analysis

### Bug 1: Tanggal Mundur 1 Hari
- **Penyebab**: Saat membaca tanggal dari Excel dalam format serial number, kode menggunakan `Math.round(rawDate * 86400000)` yang menyebabkan rounding error pada fractional days. Excel menyimpan tanggal sebagai serial number dengan epoch `1899-12-30`, dan fractional part (desimal) bisa menyebabkan offset 1 hari jika tidak di-floor-kan.
- **Solusi**: Gunakan `Math.floor(rawDate)` untuk menghitung jumlah hari penuh, kemudian kalikan dengan `86400000` (milidetik per hari).

### Bug 2: Status Kepesertaan `undefined`
- **Penyebab**: Fungsi `findColumnMatcher()` mengembalikan **nama header** (string), bukan index kolom. Kemudian `sheet_to_json()` dengan `range: headerRowIdx` tidak membaca data dengan benar ketika ada header bertingkat di file Excel (row 1: judul, row 2: kosong, row 3: header kolom). Akibatnya, kolom "Status Kepesertaan" tidak ter-mapping ke data yang benar.
- **Solusi**: Ubah `findColumnMatcher()` untuk mengembalikan **column index** (angka), lalu baca data langsung dari `rawData` (2D array) tanpa mengandalkan `sheet_to_json()`.

---

## Perubahan File

### `src/lib/excel-bpjs.ts`

**1. Ubah `findColumnMatcher()` return type:**
```ts
// Sebelum
function findColumnMatcher(headers: string[]): Record<keyof typeof BPJS_COLUMN_MAPPINGS, string | null>

// Sesudah
function findColumnMatcher(headers: string[]): Record<keyof typeof BPJS_COLUMN_MAPPINGS, number | null>
// Return column index (number), bukan nama header (string)
```

**2. Tambah helper `getCellValue()`:**
```ts
function getCellValue(row: any[], colIndex: number | null): any {
  if (colIndex === null || colIndex >= row.length) return undefined;
  return row[colIndex];
}
```

**3. Ganti pendekatan baca data:**
- Hapus penggunaan `sheet_to_json()` untuk membaca data rows
- Gunakan `rawData` (2D array dari `sheet_to_json(header: 1)`) langsung
- Proses data row mulai dari `headerRowIdx + 1` sampai akhir
- Akses kolom menggunakan **index** (angka), bukan nama header

**4. Fix tanggal Excel:**
```ts
// Sebelum
const jsDate = new Date(excelEpoch.getTime() + Math.round(rawDate * 86400000));

// Sesudah
const totalDays = Math.floor(rawDate);
const jsDate = new Date(excelEpoch.getTime() + totalDays * 86400000);
```

**5. Hapus console.log debugging** (semua `console.log('[DEBUG] ...')` dihapus)

---

## File Summary

| # | File | Action | Repository |
|---|------|--------|------------|
| 1 | `src/lib/excel-bpjs.ts` | Modified | pkwt-web |

---

## Verification

- Upload Excel dengan format Date/Number pada kolom tanggal → tanggal terbaca benar
- Kolom "Status Kepesertaan" terbaca dengan benar (tidak `undefined`)
- Build TypeScript tidak error

---

## Catatan

- Perubahan ini memperbaiki parsing Excel untuk format file yang bervariasi (text, number, date)
- Pendekatan 2D array (`rawData`) lebih reliable daripada `sheet_to_json()` ketika ada header bertingkat atau format kolom yang tidak standar
- `Math.floor()` digunakan karena Excel serial date menggunakan integer untuk hari penuh, fractional part hanya untuk waktu dalam hari tersebut

---
*Dokumentasi ini dibuat pada 08 April 2026.*
