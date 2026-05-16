# Dokumentasi Perubahan: PKWT Individual Dates & Admin BPJS Management

Dokumen ini mencatat perubahan teknis yang dilakukan pada sistem E-PKWT (Frontend & Backend) untuk mendukung fleksibilitas tanggal kontrak individual dan manajemen data BPJS untuk administrator.

## 1. Personalisasi Tanggal PKWT (Individual Dates)

Setiap karyawan memiliki tanggal mulai (TMT Mulai) dan tanggal berakhir (TMT Akhir) sendiri, disimpan di tabel `contract_employees`.

### Backend (`penkaer-pkwt-api`)
- **`employee-service.ts`**:
    - Method `listByContract`, `listAllByContract`, dan `getDetail` menggunakan `LEFT JOIN` dengan tabel `contract_employees`.
    - Mengambil `ce.start_date as employee_start_date` dan `ce.end_date as employee_end_date`.
    - Data individual diprioritaskan di atas tanggal global kontrak.

### Frontend (`pkwt-web`)
- **`lib/api.ts`**: Interface `Contract` dan `LatestContract` menyertakan `employee_start_date` dan `employee_end_date`.
- **`pages/admin/ListEmployees.tsx` & `pages/company/ListKaryawan.tsx`**: `calculateRemainingWeeks()` mendukung `endDate` parameter untuk hitung sisa waktu dari tanggal individual.

## 2. Perbaikan Parser Excel (`excel.ts`)

Audit dan perbaikan logika impor data bulk PKWT.

- **Hapus `findColumnIndices`**: Fungsi dinamis yang kompleks diganti dengan pendekatan column mapping yang lebih sederhana.
- **Optimasi `normalizeNIKValue`**: Aman dari pembulatan otomatis Excel pada angka panjang (16 digit NIK). Parameter `cellText` dihapus.
- **Parsing Tanggal**: `parseDateFlexible()` menangani berbagai format tanggal Excel.
- **Struktur Output**: `ParsedExcelRow` menggunakan `noPkwt`, `pkwtSequence`, dan `keterangan` sebagai field terpisah.

## 3. Manajemen BPJS Administrator

Fitur monitoring dan pelaporan BPJS untuk `super_admin` dan `disnaker`.

### Backend (`penkaer-pkwt-api`)
- **`bpjs-service.ts`**:
    - `listRecords()`: Filter `creatorId`, JOIN `bpjs_submissions` dan `disnaker_profiles` untuk nama petugas.
    - `exportRecords()`: Query sama dengan `listRecords` tanpa pagination, output format CSV dengan header Indonesia.
- **`bpjs-controller.ts`**: Endpoint `exportRecords` generate CSV inline dengan `Content-Type: text/csv`.
- **`routes/api.ts`**:
    - `GET /api/bpjs/records` — akses `petugas_bpjs`, `disnaker`, `super_admin`
    - `GET /api/admin/bpjs/export` — akses `disnaker`, `super_admin`

### Frontend (`pkwt-web`)
- **`pages/admin/ListBPJS.tsx`** (Baru): Halaman manajemen BPJS dengan:
    - Filter pencarian NIK/Nama.
    - Dropdown filter berdasarkan Petugas BPJS (dari `adminGetUsers({ role: 'petugas_bpjs' })`).
    - Tombol "Export CSV" dengan filter yang sama.
    - Detail modal untuk melihat data lengkap peserta.
- **`components/AdminSidebar.tsx`**: Menu "Data BPJS" dengan icon `FileSpreadsheet`.
- **`App.tsx`**: Route `/admin/list-bpjs` dengan `RequireRole roles={['disnaker', 'super_admin']}`.

## 4. Bug Fixes (Post-Review)

Perbaikan bug yang ditemukan saat review produksi.

### 4a. Validasi TMT Akhir (`contract-application-service.ts`)
- **Masalah**: `end_date` tidak divalidasi, bisa sama atau lebih kecil dari `start_date`.
- **Fix**: Tambah validasi `endDate <= startDate` → throw error 400 dengan pesan jelas.
- **Lokasi**: `_createPkwtApplication()` dan `_createPkwtApplicationAdmin()`.

### 4b. Query BPJS (`bpjs-service.ts`)
- **Masalah**: Query `JOIN users u` lalu `u.full_name` — tapi `users` tidak punya `full_name`.
- **Fix**: Ganti ke `LEFT JOIN disnaker_profiles dp` dan `dp.full_name as creator_name`.
- **Dampak**: `listRecords` dan `exportRecords` keduanya diperbaiki.

### 4c. Dropdown Petugas (`user-service.ts`)
- **Masalah**: Query list users hanya JOIN `candidate_profiles` dan `company_profiles`, tidak ada `disnaker_profiles`.
- **Fix**: Tambah `LEFT JOIN disnaker_profiles dp` dan `u.disnaker_name` ke resolusi `full_name`.

### 4d. Memory Leak (`api.ts`)
- **Masalah**: `document.body.appendChild(a)` tanpa `removeChild` setelah download.
- **Fix**: Tambah `document.body.removeChild(a)` setelah `a.click()`.

### 4e. Duplikasi Interface (`ListBPJS.tsx`)
- **Masalah**: Interface `BpjsRecord` didefinisikan lokal, padahal sudah ada `BPJSRecord` di `api.ts`.
- **Fix**: Hapus interface lokal, import `BPJSRecord` dari `api.ts`.

## 5. Verifikasi Build
- **Backend**: `npm run typecheck` — PASS (0 errors)
- **Frontend**: `npm run build` — PASS (compilation complete)

## 6. Ringkasan File

### Backend (`penkaer-pkwt-api`)
| File | Perubahan |
|------|-----------|
| `src/services/employee-service.ts` | LEFT JOIN contract_employees untuk individual dates |
| `src/services/bpjs-service.ts` | Filter creatorId, JOIN disnaker_profiles, exportRecords |
| `src/services/contract-application-service.ts` | Validasi end_date > start_date |
| `src/services/user-service.ts` | JOIN disnaker_profiles untuk dropdown petugas |
| `src/controllers/bpjs-controller.ts` | Endpoint exportRecords dengan CSV generation |
| `src/routes/api.ts` | Route BPJS dengan RBAC |

### Frontend (`pkwt-web`)
| File | Perubahan |
|------|-----------|
| `src/lib/api.ts` | Interface Contract/LatestContract, BPJS API functions, fix memory leak |
| `src/lib/excel.ts` | Refactor parser, hapus findColumnIndices |
| `src/pages/admin/ListBPJS.tsx` | Halaman baru: filter, export, detail modal |
| `src/pages/admin/ListEmployees.tsx` | calculateRemainingWeeks support endDate |
| `src/pages/company/ListKaryawan.tsx` | calculateRemainingWeeks support endDate |
| `src/components/AdminSidebar.tsx` | Menu "Data BPJS" |
| `src/App.tsx` | Route /admin/list-bpjs dengan RBAC |

---
*Dokumentasi diperbarui pada 16 Mei 2026.*
