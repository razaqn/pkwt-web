# Plan Revisi Route Perusahaan PKWT/PKWTT

## Status: ✅ Siap Implementasi (Updated 2026-03-27)

**Environment:** MySQL via XAMPP — `ENUM('Laki-laki', 'Perempuan')` valid.

**Flow tetap sama**, ada 4 perubahan kecil + 1 penyesuaian PKWTT:
1. Tanggal mulai & berakhir per karyawan (bukan satu untuk semua)
2. Format Excel & form diubah (kolom baru)
3. Upload 2 file PDF (Surat Permohonan + Draft PKWT)
4. Hapus upload KTP
5. **PKWTT auto-populate data dari record PKWT sebelumnya** (editable)

---

## Ringkasan Perubahan

### 1. Tanggal Mulai dan Berakhir Per Karyawan
**Saat ini:** PKWT menggunakan satu `startDate` dan `durasi` untuk semua karyawan  
**Baru:** Setiap karyawan bisa memiliki tanggal mulai dan berakhir yang berbeda

### 2. Format Excel & Form Diubah
**Format baru kolom Excel:**
- Nama
- Kelamin (Laki-laki/Perempuan)
- Jabatan
- Tanggal Mulai
- Tanggal Berakhir
- Alamat (Kelurahan saja)
- Keterangan (PKWT keberapa, angka Romawi)

### 3. Upload PDF Menjadi 2 File
**Saat ini:** 1 file PDF (File Kontrak)  
**Baru:** 2 file PDF:
- Surat Permohonan
- Draft PKWT

### 4. Hapus Wajib Upload KTP
**Saat ini:** KTP opsional di ModalKelengkapanData  
**Baru:** Hapus upload KTP sepenuhnya

### 5. PKWTT Auto-Populate dari Data PKWT Sebelumnya
**Saat ini:** User mengisi ulang semua data karyawan manual  
**Baru:** User input NIK → sistem cek apakah NIK sudah terdaftar dari PKWT sebelumnya → jika ada, auto-populate nama, kelamin, jabatan, alamat → user bisa edit jika ada perubahan → user hanya perlu set tanggal mulai dan upload 2 file

**Flow PKWTT baru:**
1. User input NIK (single NIK, bukan batch)
2. Sistem panggil `checkNIKs` → cek apakah employee sudah ada
3. Jika ada: auto-fill form dengan data existing (fullName, gender, position, address)
4. Jika tidak ada: user isi manual semua field
5. Semua field tetap **editable** (user bisa update jabatan/alamat jika berubah)
6. User set Tanggal Mulai, upload Surat Permohonan + Draft PKWT, lalu submit

---

## File yang Perlu Diubah

### A. `src/lib/excel.ts` — Parsing Excel

#### Perubahan Column Mappings
```typescript
// LAMA
const COLUMN_MAPPINGS = {
    nik: ['nik'],
    fullName: ['full_name', 'fullname', 'name', 'nama'],
    address: ['address', 'alamat'],
    placeOfBirth: ['place_of_birth', 'placeofbirth', 'tempat_lahir', 'tempatlahir'],
    birthdate: ['birthdate', 'birth_date', 'tanggal_lahir', 'tanggallahir', 'date_of_birth'],
    district: ['district', 'kecamatan'],
    village: ['village', 'kelurahan', 'desa'],
};

// BARU
const COLUMN_MAPPINGS = {
    nik: ['nik'],
    fullName: ['nama', 'full_name', 'fullname', 'name'],
    gender: ['kelamin', 'gender', 'jenis_kelamin'],
    position: ['jabatan', 'posisi', 'position'],
    startDate: ['tanggal_mulai', 'start_date', 'tanggalmulai'],
    endDate: ['tanggal_berakhir', 'end_date', 'tanggalberakhir'],
    address: ['alamat', 'address'], // Kelurahan saja
    pkwtSequence: ['keterangan', 'pkwt_ke', 'sequence', 'pkwt_sequence'],
};
```

#### Perubahan ParsedExcelRow Interface
```typescript
// LAMA
export interface ParsedExcelRow {
    nik: string;
    fullName?: string | null;
    address?: string | null;
    placeOfBirth?: string | null;
    birthdate?: string | null;
    district?: string | null;
    village?: string | null;
}

// BARU
export interface ParsedExcelRow {
    nik: string;
    fullName?: string | null;
    gender?: 'Laki-laki' | 'Perempuan' | null;
    position?: string | null;
    startDate?: string | null; // YYYY-MM-DD
    endDate?: string | null; // YYYY-MM-DD
    address?: string | null; // Kelurahan
    pkwtSequence?: string | null; // Roman numeral (I, II, III, dst)
}
```

#### Hapus Validasi NIK (jika tidak lagi wajib)
- Pertimbangkan apakah NIK masih wajib atau bisa kosong
- Jika NIK tidak wajib, ubah validasi di `parseExcelFile()`

---

### B. `src/components/FormKontrakPKWT.tsx` — Form PKWT

#### Perubahan Data Structure
```typescript
// LAMA
export interface FormKontrakPKWTData {
    niks: NIKEntry[];
    startDate: string;
    durasi: number;
    fileKontrak?: File | null;
    importedData?: Record<string, any>;
}

// BARU
export interface FormKontrakPKWTData {
    employees: EmployeeEntry[]; // Ganti dari niks
    fileSuratPermohonan?: File | null; // File baru
    fileDraftPKWT?: File | null; // File baru (ganti fileKontrak)
    importedData?: Record<string, any>;
}

export interface EmployeeEntry {
    id: string;
    nik: string;
    fullName?: string;
    gender?: 'Laki-laki' | 'Perempuan';
    position?: string;
    startDate: string; // Per karyawan
    endDate: string; // Per karyawan
    address?: string; // Kelurahan
    pkwtSequence?: string; // Roman numeral
}
```

#### UI Changes
1. **Hapus field `startDate` dan `durasi`** dari form (karena sekarang per karyawan)
2. **Tambah 2 upload area** untuk:
   - Surat Permohonan (PDF)
   - Draft PKWT (PDF)
3. **Update Excel import section**:
   - Update deskripsi kolom yang diharapkan
   - Update mapping function

#### Tabel Karyawan (jika ada preview)
- Tampilkan kolom: NIK, Nama, Kelamin, Jabatan, Tanggal Mulai, Tanggal Berakhir, Alamat, Keterangan

---

### C. `src/components/FormKontrakPKWTT.tsx` — Form PKWTT

#### Perubahan Data Structure
```typescript
// LAMA
export interface FormKontrakPKWTTData {
    nik: string;
    startDate: string;
    fileKontrak: File | null;
    importedData?: Record<string, any>;
}

// BARU
export interface FormKontrakPKWTTData {
    nik: string;
    fullName?: string;
    gender?: 'Laki-laki' | 'Perempuan';
    position?: string;
    startDate: string;
    address?: string;
    fileSuratPermohonan?: File | null;
    fileDraftPKWT?: File | null;
}
```

#### UI Changes
1. **Auto-populate flow:** Saat user input NIK dan blur/focus-leave, panggil `checkNIKs` API → jika NIK ditemukan, auto-fill: fullName, gender, position, address
2. **Semua field tetap editable** — user bisa ubah data jika ada perubahan jabatan/alamat
3. **Tambah field** untuk: Nama, Kelamin, Jabatan, Alamat (semua editable, pre-filled dari API)
4. **Tambah 2 upload area** (sama seperti PKWT): Surat Permohonan + Draft PKWT
5. **Hapus Excel import** — PKWTT hanya 1 karyawan, tidak perlu import Excel
6. **Hapus endDate** — PKWTT tidak punya tanggal berakhir

#### Auto-Populate Logic
```typescript
async function handleNIKBlur(nik: string) {
    if (!/^[0-9]{16}$/.test(nik)) return;
    try {
        const results = await checkNIKs([nik]);
        const employee = results.find(r => r.nik === nik);
        if (employee?.exists && employee.is_complete) {
            onChange(prev => ({
                ...prev,
                fullName: employee.full_name || '',
                gender: employee.gender || '',
                position: employee.position || '',
                address: employee.address || '',
            }));
        }
    } catch {
        // Biarkan user isi manual jika API gagal
    }
}
```

---

### D. `src/components/ModalKelengkapanData.tsx` — Modal Data Karyawan

#### Perubahan
1. **Hapus section Upload KTP** sepenuhnya
2. **Tambah field baru**:
   - Kelamin (dropdown: Laki-laki/Perempuan)
   - Jabatan (text)
   - Tanggal Mulai (date)
   - Tanggal Berakhir (date)
   - Keterangan/PKWT ke (text/number)
3. **Ubah label Alamat** menjadi "Kelurahan" (hanya kelurahan)

#### Interface Update
```typescript
// LAMA
export interface KelengkapanDataForm {
    fullName: string;
    address: string;
    district: string;
    village: string;
    placeOfBirth: string;
    birthdate: string;
    ktpFile?: File | null;
}

// BARU
export interface KelengkapanDataForm {
    fullName: string;
    gender: 'Laki-laki' | 'Perempuan' | '';
    position: string;
    startDate: string;
    endDate: string;
    address: string; // Kelurahan saja
    pkwtSequence: string; // Roman numeral
}
```

---

### E. `src/pages/company/PengajuanBerkas.tsx` — Halaman Pengajuan

#### Perubahan
1. **Update ContractData interface** untuk include 2 file
2. **Update file upload section** untuk 2 file:
   - Surat Permohonan
   - Draft PKWT
3. **Hapus logic terkait KTP**
4. **Update display** untuk menunjukkan tanggal per karyawan

---

### F. `src/hooks/useContractSubmission.ts` — Hook Submission

#### Perubahan
1. **Update saveNIKData** untuk handle field baru (tanpa KTP)
2. **Update submitContract** untuk kirim 2 file:
   - `surat_permohonan_file_name` + `surat_permohonan_file_content_base64`
   - `draft_pkwt_file_name` + `draft_pkwt_file_content_base64`
3. **Update saveDraft** untuk include data tanggal per karyawan

---

### G. `src/lib/api.ts` — API Functions

#### Perubahan Request Types
```typescript
// LAMA
export interface ContractApplicationPKWTRequest {
    contract_type: 'PKWT';
    start_date: string;
    duration_months: number;
    employee_niks: string[];
    file_name: string;
    file_content_base64: string;
}

// BARU
export interface ContractApplicationPKWTRequest {
    contract_type: 'PKWT';
    employees: Array<{
        nik: string;
        start_date: string;
        end_date: string;
        full_name?: string;
        gender?: string;
        position?: string;
        address?: string;
        pkwt_sequence?: string;
    }>;
    surat_permohonan_file_name: string;
    surat_permohonan_file_content_base64: string;
    draft_pkwt_file_name: string;
    draft_pkwt_file_content_base64: string;
}
```

#### Update SaveEmployeeDataRequest
```typescript
// LAMA
export interface SaveEmployeeDataRequest {
    full_name: string;
    address: string;
    district: string;
    village: string;
    place_of_birth: string;
    birthdate: string;
    ktp_file_name?: string;
    ktp_file_content_base64?: string;
}

// BARU
export interface SaveEmployeeDataRequest {
    full_name: string;
    gender: string;
    position: string;
    start_date: string;
    end_date: string;
    address: string; // Kelurahan
    pkwt_sequence: string;
    // Hapus: district, village, place_of_birth, birthdate, ktp_file_*
}
```

---

### H. `src/lib/utils.ts` — Utility Functions

#### Perubahan mapNIKResultToData
- Update mapping untuk field baru
- Hapus mapping untuk: district, village, placeOfBirth, birthdate

---

### I. `src/components/TabelNIKPengajuan.tsx` — Tabel NIK

#### Perubahan
- Update kolom tabel untuk menampilkan:
  - NIK
  - Nama
  - Kelamin
  - Jabatan
  - Tanggal Mulai
  - Tanggal Berakhir
  - Alamat
  - Keterangan
  - Status (Lengkap/Belum)

---

## Edge Cases yang Teridentifikasi

### Edge Case 1: Tanggal Berakhir Sebelum Tanggal Mulai
**Masalah:** User mengisi tanggal berakhir lebih awal dari tanggal mulai  
**Solusi:** Validasi di form dan Excel parsing — tampilkan error

### Edge Case 2: Format Kelamin Tidak Valid di Excel
**Masalah:** User mengisi selain "Laki-laki" atau "Perempuan"  
**Solusi:** 
- Normalisasi: "L", "Laki", "Male" → "Laki-laki"
- Normalisasi: "P", "Perempuan", "Female" → "Perempuan"
- Jika tidak valid, warning dan skip atau minta user pilih manual

### Edge Case 3: PKWT Sequence Bukan Angka Romawi
**Masalah:** User mengisi "1", "2" atau "Pertama" bukan "I", "II", "III"  
**Solusi:**
- Konversi otomatis angka ke Romawi: 1→I, 2→II, 3→III, dst
- Terima input angka atau Romawi, simpan sebagai Romawi

### Edge Case 4: Tanggal di Excel Format Berbeda-beda
**Masalah:** User mengisi "01/04/2026", "1 April 2026", "2026-04-01"  
**Solusi:** Gunakan `parseDateFlexible()` yang sudah ada untuk normalisasi

### Edge Case 5: PKWTT Tidak Ada Tanggal Berakhir
**Masalah:** PKWTT (tetap) tidak perlu tanggal berakhir  
**Solusi:** Hapus field `endDate` dari PKWTT form sepenuhnya

### Edge Case 5b: PKWTT NIK Belum Pernah Terdaftar di PKWT
**Masalah:** User input NIK untuk PKWTT tapi NIK belum ada di sistem  
**Solusi:**
- Sistem tetap cek via `checkNIKs` API
- Jika NIK tidak ditemukan → form tetap muncul, user isi manual semua field
- Jika NIK ditemukan tapi data tidak lengkap (`is_complete = false`) → auto-fill field yang ada, user lengkapi sisanya
- Jika NIK ditemukan dan lengkap → auto-fill semua, user bisa edit

### Edge Case 5c: PKWTT User Ubah Data Setelah Auto-Populate
**Masalah:** Data auto-fill diubah user (misal jabatan berubah dari "Staff" ke "Supervisor")  
**Solusi:**
- Semua field tetap editable
- Perubahan user disimpan via `saveEmployeeData` saat submit
- Tidak ada konfirmasi "overwrite" — user dianggap benar

### Edge Case 6: Upload 2 File Tapi Salah Satu Kosong
**Masalah:** User upload Surat Permohonan tapi lupa upload Draft PKWT (atau sebaliknya)  
**Solusi:** Validasi kedua file wajib sebelum submit

### Edge Case 7: Data Lama (Sebelum Revisi) Masih Ada di Database
**Masalah:** Employee record lama punya field: district, village, placeOfBirth, birthdate  
**Solusi:**
- Backend harus handle migration atau backward compatibility
- Frontend hanya kirim field baru, abaikan field lama

### Edge Case 8: Excel Kosong atau Hanya Header
**Masalah:** User upload file Excel tanpa data  
**Solusi:** Validasi sudah ada di `parseExcelFile()` — throw error jika tidak ada data

### Edge Case 9: NIK Duplikat di Excel
**Masalah:** User mengisi NIK yang sama di 2 baris  
**Solusi:** Validasi sudah ada — warning dan skip duplikat

### Edge Case 10: Draft Contract dengan Format Lama
**Masalah:** User punya draft tersimpan dengan format lama (startDate, duration)  
**Solusi:**
- Backend harus handle migration draft
- Atau frontend detect format lama dan minta user buat ulang

### Edge Case 11: Alamat Sekarang Hanya Kelurahan
**Masalah:** Data lama punya alamat lengkap (jalan, RT/RW, dll)  
**Solusi:**
- Field `address` di form hanya untuk kelurahan
- Data lama tetap ada di database, tidak dihapus

### Edge Case 12: Multiple PKWT untuk Karyawan yang Sama
**Masalah:** Karyawan yang sama sudah pernah PKWT sebelumnya, sekarang PKWT lagi  
**Solusi:** Field `pkwtSequence` menunjukkan PKWT keberapa (I, II, III, dst)

---

## Keputusan Edge Case (Sudah Dikonfirmasi User)

| # | Edge Case | Keputusan |
|---|-----------|-----------|
| 1 | NIK Masih Wajib? | **Ya, NIK tetap wajib** — sistem butuh untuk identifikasi |
| 2 | Validasi Tanggal Berakhir untuk PKWTT | **Hapus kolom Tanggal Berakhir dari format PKWTT** — PKWTT tidak perlu tanggal berakhir |
| 3 | Konversi Angka ke Romawi Otomatis | **Terima keduanya, simpan sebagai Romawi** — user bisa isi "1" atau "I", sistem konversi ke Romawi |
| 4 | Normalisasi Kelamin Otomatis | **Ya, normalisasi otomatis** — L/Laki/Male→Laki-laki, P/Perempuan/Female→Perempuan |
| 5 | Backward Compatibility Data Lama | **Hapus field lama** — frontend hanya kirim field baru (gender, position, address, pkwt_sequence) |
| 6 | Draft Contract Format Lama | **Hapus/invalidasi draft lama** — user harus buat ulang dengan format baru |
| 7 | Maksimal PKWT Sequence | **Sudah ada di sistem (5x)** — tidak perlu perubahan |
| 8 | File Naming Convention | **Bebas** — karena PKWT bisa batch (multiple NIK), file untuk semua karyawan |
| 9 | PKWTT Auto-Populate dari PKWT | **Ya, auto-populate via checkNIKs API** — jika NIK pernah PKWT, auto-fill semua field. Semua field tetap editable. Jika NIK baru, user isi manual. Hapus Excel import untuk PKWTT. |

## Catatan Penting dari User
> "Alurnya sama, hanya berubah hal kecil yang saya sebutkan saja"

Artinya:
- **Flow tetap sama**: Form Kontrak → Pengajuan Berkas → Submit
- **Perubahan hanya pada**:
  1. Data structure (tanggal per karyawan, field baru)
  2. Excel format (kolom baru)
  3. Upload 2 file (bukan 1)
  4. Hapus KTP upload
  5. PKWTT auto-populate dari data PKWT (editable)

### PKWTT Flow Detail (berdasarkan konfirmasi user)
> "PKWTT bisa ambil dari NIK saja kalau sudah pernah daftar di PKWT. Kalau di PKWT udah pernah daftar, ambil NIK-nya aja, datanya sudah ada."

Implementasi:
- **PKWTT:** User input NIK → `checkNIKs` → auto-fill → user confirm/edit → set tanggal mulai → upload 2 file → submit
- **PKWT:** User input NIKs via Excel → sistem parse → per karyawan ada tanggal mulai/berakhir → upload 2 file → submit
- **PKWTT tidak perlu Excel import** — hanya 1 karyawan, data diambil dari existing PKWT

---

## Urutan Implementasi

### Phase 1: Core Data Structure Changes
1. Update `excel.ts` — column mappings dan ParsedExcelRow
2. Update `api.ts` — request/response types (PKWT + PKWTT)
3. Update `utils.ts` — mapping functions (hapus field lama, tambah baru)

### Phase 2: Form Components
4. Update `FormKontrakPKWT.tsx` — data structure, UI, 2 file upload
5. Update `FormKontrakPKWTT.tsx` — data structure, auto-populate via checkNIKs, 2 file upload, hapus Excel import
6. Update `ModalKelengkapanData.tsx` — hapus KTP, tambah field baru

### Phase 3: Page Components
7. Update `PengajuanBerkas.tsx` — 2 file upload, display per karyawan
8. Update `TabelNIKPengajuan.tsx` — kolom baru

### Phase 4: Hook & Submission
9. Update `useContractSubmission.ts` — handle 2 file, field baru, hapus KTP logic
10. Update `useContractSubmission.ts` — PKWTT auto-populate flow

### Phase 5: Backend
11. Buat migration SQL (MySQL via XAMPP)
12. Update validation schemas (employee + contract)
13. Update services (employee + contract-application)

### Phase 6: Testing
14. Test Excel import dengan format baru (PKWT)
15. Test PKWTT auto-populate: input NIK → data auto-fill → edit → submit
16. Test form submission dengan 2 file
17. Test validasi tanggal
18. Test edge cases

---

## Backend Changes (pencaker-pkwt-api)

### A. Database Schema Changes

#### 1. Tabel `employees` — Hapus Field Lama, Tambah Field Baru
```sql
-- Hapus field lama
ALTER TABLE employees DROP COLUMN district;
ALTER TABLE employees DROP COLUMN village;
ALTER TABLE employees DROP COLUMN place_of_birth;
ALTER TABLE employees DROP COLUMN birthdate;
ALTER TABLE employees DROP COLUMN ktp_file_url;

-- Tambah field baru
ALTER TABLE employees ADD COLUMN gender ENUM('Laki-laki', 'Perempuan') NULL;
ALTER TABLE employees ADD COLUMN position VARCHAR(255) NULL;
ALTER TABLE employees ADD COLUMN start_date DATE NULL;
ALTER TABLE employees ADD COLUMN end_date DATE NULL;
ALTER TABLE employees ADD COLUMN pkwt_sequence VARCHAR(10) NULL; -- I, II, III, IV, V
```

#### 2. Tabel `contracts` — Tambah Field untuk 2 File
```sql
-- Tambah field untuk Surat Permohonan
ALTER TABLE contracts ADD COLUMN surat_permohonan_file_id CHAR(36) NULL;
ALTER TABLE contracts ADD COLUMN surat_permohonan_file_name VARCHAR(255) NULL;

-- Tambah field untuk Draft PKWT
ALTER TABLE contracts ADD COLUMN draft_pkwt_file_id CHAR(36) NULL;
ALTER TABLE contracts ADD COLUMN draft_pkwt_file_name VARCHAR(255) NULL;
```

#### 3. Tabel `contract_employees` — Tambah Field Tanggal Per Karyawan
```sql
-- Tambah field untuk tanggal per karyawan (override dari contracts.start_date)
ALTER TABLE contract_employees ADD COLUMN start_date DATE NULL;
ALTER TABLE contract_employees ADD COLUMN end_date DATE NULL;
ALTER TABLE contract_employees ADD COLUMN pkwt_sequence VARCHAR(10) NULL;
```

---

### B. Validation Changes

#### `src/validations/employee-validation.ts`
```typescript
// LAMA
CREATE: z.object({
    full_name: z.string().min(1),
    nik: z.string().min(1),
    address: z.string().min(1),
    district: z.string().min(1),
    village: z.string().min(1),
    place_of_birth: z.string().min(1),
    birthdate: z.string().min(1),
    company_id: z.string().min(1).optional(),
    ktp_file_name: z.string().min(1).optional(),
    ktp_file_content_base64: z.string().min(1).optional(),
}),

// BARU
CREATE: z.object({
    full_name: z.string().min(1),
    nik: z.string().min(1),
    gender: z.enum(['Laki-laki', 'Perempuan']),
    position: z.string().min(1),
    start_date: z.string().min(1),
    end_date: z.string().min(1).optional(), // Optional untuk PKWTT
    address: z.string().min(1), // Kelurahan saja
    pkwt_sequence: z.string().optional(), // I, II, III, IV, V
    company_id: z.string().min(1).optional(),
}),
```

#### `src/validations/contract-validation.ts`

**PKWT (BARU):**
```typescript
CREATE_APPLICATION_PKWT: z.object({
    contract_type: z.literal("PKWT"),
    employees: z.array(z.object({
        nik: z.string().regex(/^[0-9]{16}$/),
        start_date: z.string().min(1),
        end_date: z.string().min(1),
        full_name: z.string().optional(),
        gender: z.enum(['Laki-laki', 'Perempuan']).optional(),
        position: z.string().optional(),
        address: z.string().optional(),
        pkwt_sequence: z.string().optional(),
    })).min(1),
    surat_permohonan_file_name: z.string().min(1),
    surat_permohonan_file_content_base64: z.string().min(1),
    draft_pkwt_file_name: z.string().min(1),
    draft_pkwt_file_content_base64: z.string().min(1),
}),
```

**PKWTT (BARU) — auto-populate, 2 file, hapus endDate:**
```typescript
CREATE_APPLICATION_PKWTT: z.object({
    contract_type: z.literal("PKWTT"),
    employee_nik: z.string().regex(/^[0-9]{16}$/),
    start_date: z.string().min(1),
    // Field optional — dikirim jika user edit data setelah auto-populate
    full_name: z.string().optional(),
    gender: z.enum(['Laki-laki', 'Perempuan']).optional(),
    position: z.string().optional(),
    address: z.string().optional(),
    // 2 file wajib
    surat_permohonan_file_name: z.string().min(1),
    surat_permohonan_file_content_base64: z.string().min(1),
    draft_pkwt_file_name: z.string().min(1),
    draft_pkwt_file_content_base64: z.string().min(1),
}),
```

**Save Draft (BARU) — support format baru:**
```typescript
CREATE_DRAFT: z.object({
    contract_type: z.enum(["PKWT", "PKWTT"]),
    start_date: z.string().min(1),
    // PKWT: employees array dengan tanggal per karyawan
    employees: z.array(z.object({
        nik: z.string().regex(/^[0-9]{16}$/),
        start_date: z.string().min(1),
        end_date: z.string().min(1),
        pkwt_sequence: z.string().optional(),
    })).optional(),
    // PKWTT: single NIK
    employee_nik: z.string().regex(/^[0-9]{16}$/).optional(),
}),
```

---

### C. Service Changes

#### `src/services/contract-application-service.ts`

**Perubahan `_createPkwtApplication`:**
1. Validasi `employees` array (bukan `employee_niks`)
2. Setiap employee punya `start_date`, `end_date`
3. Simpan 2 file: `surat_permohonan_file_id` dan `draft_pkwt_file_id`
4. Simpan tanggal per karyawan di `contract_employees.start_date`, `contract_employees.end_date`

**Perubahan `_createPkwttApplication` (BARU):**
1. Validasi via `CREATE_APPLICATION_PKWTT` — single NIK, 2 file
2. Cek employee exists via NIK — jika ada, data sudah lengkap dari PKWT
3. Jika user mengirim field optional (full_name, gender, position, address), update employee record via `upsertByNik`
4. Simpan 2 file: `surat_permohonan_file_id` dan `draft_pkwt_file_id`
5. Tidak perlu `end_date` — PKWTT tidak punya tanggal berakhir

**Perubahan `saveDraft`:**
1. Support format baru dengan `employees` array (PKWT) atau `employee_nik` (PKWTT)
2. Simpan tanggal per karyawan (PKWT)

#### `src/services/employee-service.ts`

**Perubahan `checkNiks`:**
1. Return field baru: `gender`, `position`, `address` (+ existing: `full_name`)
2. Hapus return field lama: `district`, `village`, `place_of_birth`, `birthdate`, `ktp_file_url`
3. `is_complete` dicek berdasarkan field baru: `full_name, gender, position, address`

**Perubahan `upsertByNik`:**
1. Validasi dan simpan field baru
2. Hapus logic KTP upload

---

### D. Migration File Baru (MySQL via XAMPP)

Buat file migration baru: `db/migrations/YYYYMMDD_revisi_perusahaan_pkwt.sql`

```sql
-- ============================================================
-- Migration: Revisi Perusahaan PKWT/PKWTT
-- Database: MySQL (via XAMPP)
-- ============================================================

-- 1. Hapus field lama dari employees
ALTER TABLE employees DROP COLUMN district;
ALTER TABLE employees DROP COLUMN village;
ALTER TABLE employees DROP COLUMN place_of_birth;
ALTER TABLE employees DROP COLUMN birthdate;
ALTER TABLE employees DROP COLUMN ktp_file_url;

-- 2. Tambah field baru ke employees (MySQL ENUM valid)
ALTER TABLE employees ADD COLUMN gender ENUM('Laki-laki', 'Perempuan') NULL;
ALTER TABLE employees ADD COLUMN position VARCHAR(255) NULL;
ALTER TABLE employees ADD COLUMN start_date DATE NULL;
ALTER TABLE employees ADD COLUMN end_date DATE NULL;
ALTER TABLE employees ADD COLUMN pkwt_sequence VARCHAR(10) NULL; -- I, II, III, IV, V

-- 3. Tambah field untuk 2 file di contracts
ALTER TABLE contracts ADD COLUMN surat_permohonan_file_id CHAR(36) NULL;
ALTER TABLE contracts ADD COLUMN surat_permohonan_file_name VARCHAR(255) NULL;
ALTER TABLE contracts ADD COLUMN draft_pkwt_file_id CHAR(36) NULL;
ALTER TABLE contracts ADD COLUMN draft_pkwt_file_name VARCHAR(255) NULL;

-- 4. Tambah field tanggal per karyawan di contract_employees
ALTER TABLE contract_employees ADD COLUMN start_date DATE NULL;
ALTER TABLE contract_employees ADD COLUMN end_date DATE NULL;
ALTER TABLE contract_employees ADD COLUMN pkwt_sequence VARCHAR(10) NULL;

-- 5. Hapus draft lama yang tidak kompatibel
DELETE FROM contracts WHERE is_draft = TRUE;
```

---

### E. Checklist Backend

**Database:**
- [ ] Buat migration file untuk schema changes (MySQL via XAMPP)
- [ ] Jalankan migration di local XAMPP
- [ ] Verifikasi: ENUM gender, kolom baru di employees/contracts/contract_employees

**Validation:**
- [ ] Update `employee-validation.ts` — hapus field lama, tambah field baru, hapus KTP
- [ ] Update `contract-validation.ts` — PKWT: employees[] + 2 file
- [ ] Update `contract-validation.ts` — PKWTT: single NIK + 2 file (hapus endDate)
- [ ] Update `contract-validation.ts` — CREATE_DRAFT: support format baru

**Service:**
- [ ] Update `employee-service.ts` — checkNiks: return field baru, is_complete logic baru
- [ ] Update `employee-service.ts` — upsertByNik: hapus KTP, handle field baru
- [ ] Update `contract-application-service.ts` — _createPkwtApplication: employees[] + 2 file + tanggal per karyawan
- [ ] Update `contract-application-service.ts` — _createPkwttApplication: 2 file, optional field update
- [ ] Update `contract-application-service.ts` — saveDraft: support format baru

**Testing:**
- [ ] Test: create PKWT application dengan format baru (employees[], 2 file)
- [ ] Test: create PKWTT application dengan format baru (single NIK, 2 file)
- [ ] Test: PKWTT auto-populate — checkNIKs return data existing
- [ ] Test: PKWTT user edit data setelah auto-populate
- [ ] Test: save draft dengan format baru
- [ ] Test: checkNiks return field baru (tanpa field lama)
- [ ] Test: upsertByNik simpan field baru (tanpa KTP)

---

### F. Checklist Frontend

**Core Data (Phase 1):**
- [ ] Update `excel.ts` — COLUMN_MAPPINGS (7→8 field), ParsedExcelRow interface
- [ ] Update `excel.ts` — parseExcelFile: handle gender normalisasi, date parsing, PKWT sequence konversi
- [ ] Update `api.ts` — ContractApplicationPKWTRequest: employees[] + 2 file
- [ ] Update `api.ts` — ContractApplicationPKWTTRequest: single NIK + 2 file + optional fields
- [ ] Update `api.ts` — SaveEmployeeDataRequest: hapus field lama, tambah baru, hapus KTP
- [ ] Update `api.ts` — NIKCheckResult: hapus ktp_file_url, tambah gender/position
- [ ] Update `utils.ts` — NIKCheckResult, NIKData, mapNIKResultToData, mapEmployeeResponseToData

**Form Components (Phase 2):**
- [ ] Update `FormKontrakPKWT.tsx` — FormKontrakPKWTData interface (employees[], 2 file)
- [ ] Update `FormKontrakPKWT.tsx` — hapus startDate/durasi fields, tambah 2 file upload
- [ ] Update `FormKontrakPKWT.tsx` — update Excel import mapping
- [ ] Update `FormKontrakPKWTT.tsx` — FormKontrakPKWTTData interface (hapus endDate, 2 file)
- [ ] Update `FormKontrakPKWTT.tsx` — implement auto-populate: NIK blur → checkNIKs → auto-fill
- [ ] Update `FormKontrakPKWTT.tsx` — hapus Excel import, tambah editable fields
- [ ] Update `FormKontrakPKWTT.tsx` — tambah 2 file upload area
- [ ] Update `ModalKelengkapanData.tsx` — hapus KTP upload section (~120 baris)
- [ ] Update `ModalKelengkapanData.tsx` — KelengkapanDataForm interface (field baru)
- [ ] Update `ModalKelengkapanData.tsx` — tambah fields: gender dropdown, position, startDate, endDate, pkwtSequence
- [ ] Update `ModalKelengkapanData.tsx` — ubah label Alamat → Kelurahan

**Page Components (Phase 3):**
- [ ] Update `PengajuanBerkas.tsx` — ContractData interface (2 file)
- [ ] Update `PengajuanBerkas.tsx` — file upload section (2 area: Surat Permohonan + Draft PKWT)
- [ ] Update `PengajuanBerkas.tsx` — hapus KTP logic (ktpFileUrl prop)
- [ ] Update `PengajuanBerkas.tsx` — display tanggal per karyawan
- [ ] Update `TabelNIKPengajuan.tsx` — hapus kolom KTP
- [ ] Update `TabelNIKPengajuan.tsx` — tambah kolom: Kelamin, Jabatan, Tgl Mulai, Tgl Berakhir, Keterangan

**Hook & Submission (Phase 4):**
- [ ] Update `useContractSubmission.ts` — saveNIKData: field baru, hapus KTP
- [ ] Update `useContractSubmission.ts` — submitContract: PKWT payload (employees[], 2 file)
- [ ] Update `useContractSubmission.ts` — submitContract: PKWTT payload (single NIK, 2 file)
- [ ] Update `useContractSubmission.ts` — saveDraft: format baru

**Testing (Phase 6):**
- [ ] Test: Excel import PKWT dengan kolom baru
- [ ] Test: PKWTT NIK input → auto-populate → edit → submit
- [ ] Test: 2 file upload (Surat Permohonan + Draft PKWT)
- [ ] Test: validasi tanggal (end < start error)
- [ ] Test: gender normalisasi di Excel (L→Laki-laki, P→Perempuan)
- [ ] Test: PKWT sequence konversi (1→I, 2→II)
- [ ] Test: `npm run lint` dan `npm run build` passing
