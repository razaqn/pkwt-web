# 04 — Bug Fixes & Admin Route Update Pasca Revisi PKWT

**Tanggal:** 2026-03-27
**Status:** ✅ Selesai — Frontend Build ✅, Backend Typecheck ✅
**Depends on:** `03_revisi-route-perusahaan-pkwt.md`

---

## Ringkasan

Perbaikan bug dan penyesuaian setelah implementasi step 03:
1. **Fix `start_date`/`end_date` empty string** — payload PKWT kirim string kosong
2. **Fix admin service functions** — masih pakai query kolom lama
3. **Fix semua query kolom lama** di `contract-service.ts` dan `employee-service.ts`
4. **Update approval pages** — sesuaikan display dengan field baru
5. **Hapus "Durasi Kontrak"** dari approval list & detail
6. **Buat `.env`** untuk FE dan BE

---

## Bug Fix: `start_date`/`end_date` Empty String (400 Error)

### Masalah
Submit PKWT gagal dengan error `employees[i].start_date: Too small: expected string to have >=1 characters`.

### Penyebab
`useContractSubmission.ts` mengirim `start_date: ''` dan `end_date: ''` hardcoded, bukan dari data karyawan.

### Perbaikan
- **`src/lib/utils.ts`** — Tambah `startDate`, `endDate` ke `NIKData` interface dan mapping functions
- **`src/hooks/useContractSubmission.ts`**:
  - `fetchNIKData`: merge `startDate`/`endDate` dari `importedData`
  - `saveNIKData`: simpan `startDate`/`endDate` ke lokal state (bukan hanya API)
  - `submitContract`: kirim `start_date`/`end_date` dari `nikDataList`
  - `saveDraft`: sama
- **`src/components/TabelNIKPengajuan.tsx`** — Tambah kolom "Tgl Mulai" & "Tgl Berakhir"
- **`src/pages/company/PengajuanBerkas.tsx`** — Modal initial data dari `nikDataList` (bukan hardcoded kosong)
- **`src/pages/admin/CreateContractSubmit.tsx`** — Sama

---

## Bug Fix: Admin Service Functions (500 Error)

### Masalah
Admin PKWT/PKWTT creation gagal karena `_createPkwtApplicationAdmin` dan `_createPkwttApplicationAdmin` masih query kolom lama (`district, village, place_of_birth, birthdate`) dan pakai `data.employee_niks` (old API).

### Perbaikan (`src/services/contract-application-service.ts`)
- **`_createPkwtApplicationAdmin`**: Rewrite — pakai `data.employees[]`, query kolom baru, upload 2 file, simpan tanggal per karyawan di `contract_employees`
- **`_createPkwttApplicationAdmin`**: Rewrite — pakai `data.employee_nik`, query kolom baru, upload 2 file, auto-update employee

---

## Bug Fix: Query Kolom Lama di Status Pantau (500 Error)

### Masalah
Halaman detail status-pantau gagal dengan `Unknown column 'birthdate'` dan `Unknown column 'district'`.

### Perbaikan (`src/services/contract-service.ts`)
- **`getApprovalById`** (2 lokasi): `birthdate, ktp_file_url` → `gender, position`
- **`getDraftDetail`** (2 lokasi): same fix
- **`listApplicationEmployees`** (2 lokasi): `district, village, place_of_birth, birthdate, ktp_file_url` → `gender, position`, ubah `data_complete` = `full_name && address`

### Perbaikan (`src/services/employee-service.ts`)
- **`checkNik`**: query `gender, position` (bukan kolom lama)
- **`listByContract`** (2 response objects): hapus kolom lama → `gender, position`
- **`listAllByContract`**: same
- **`getDetail`**: same

---

## Cleanup: Semua Query Kolom Lama

### File yang dibersihkan dari query kolom lama (`employees` table)

| File | Lokasi | Perubahan |
|------|--------|-----------|
| `employee-service.ts` | `checkNik` | Query: `district, village, place_of_birth, birthdate, ktp_file_url` → `gender, position` |
| `employee-service.ts` | `listByContract` ×2 | Response object fix |
| `employee-service.ts` | `listAllByContract` | Response object fix |
| `employee-service.ts` | `getDetail` | Response object fix |
| `contract-service.ts` | `getApprovalById` ×2 | Query + response fix |
| `contract-service.ts` | `getDraftDetail` ×2 | Query + response fix |
| `contract-service.ts` | `listApplicationEmployees` ×2 | Query + `data_complete` logic fix |
| `contract-application-service.ts` | admin functions ×2 | Full rewrite |

### File yang TIDAK diubah (query dari tabel lain)
- `candidate-profile-service.ts` — query `candidate_profiles` (beda tabel)
- `report-service.ts` — query `candidate_profiles`
- `training-service.ts` — query `candidate_profiles`
- `company-profile-service.ts` — query `company_profiles`
- `candidate-ak1-service.ts` — query `candidate_profiles`

### Test files yang diupdate

| File | Perubahan |
|------|-----------|
| `employee-check-niks.test.ts` | Rewrite — mock data pakai `gender, position`, hapus `ktp_file_url` assertion |
| `employee-upsert.test.ts` | Rewrite — hapus test KTP upload, test field baru |
| `employee-service.test.ts` | Mock data fix — `gender, position` |
| `contract-service-applications.test.ts` | Mock data fix — 4 lokasi |
| `contract-service-admin-approvals.test.ts` | Mock data + assertion fix |
| `contract-application-service.test.ts` | Full rewrite — pakai API baru (employees[], 2 file) |

---

## Update: Admin Approval Pages

### `src/lib/api.ts`
- **`EmployeeDetail`**: hapus `district, village, place_of_birth, birthdate, birthdate_formatted, ktp_file_url` → `gender, position`
- **`ApprovalEmployee`**: hapus `birthdate` → `gender, position`

### `src/components/ApprovalEmployeeTable.tsx`
- Kolom "Tanggal Lahir" → "Kelamin" + "Jabatan"
- Hapus `formatDate` function

### `src/components/ApprovalEmployeeDetailModal.tsx`
- Rewrite: hapus KTP section (image viewer, upload info)
- Info rows: NIK, Kelamin, Jabatan, Alamat (Kelurahan)
- Tambah section "Riwayat Kontrak" dari `employee.contracts`
- Hapus import `resolveUploadUrl`, `ImageOff`, `Maximize`

### `src/pages/admin/ApprovalDetail.tsx`
- Hapus kartu "Durasi Kontrak" dari Detail Card
- Hapus `formatDuration`, `Clock` import
- Header: hapus durasi dari subtitle

### `src/pages/admin/DetailKaryawan.tsx`
- Hapus KTP image section + full-screen viewer
- Hapus field lama → Kelamin, Jabatan, Alamat (Kelurahan)
- Hapus `useState`, `resolveUploadUrl`, `Maximize`, `X` imports

### `src/pages/company/DetailKaryawan.tsx`
- Sama seperti admin version

### `src/components/ApprovalTable.tsx`
- Hapus kolom "Durasi Kontrak" dari tabel
- Hapus `formatDuration` function

### `src/lib/word-generator.ts`
- Kolom "Tanggal Lahir" → "Jabatan" di Word document

---

## Environment

### `pkwt-web/.env` — CREATED
```
VITE_API_URL=http://localhost:4000
```

### `penkaer-pkwt-api/.env` — CREATED
```
PORT=4000
NODE_ENV=development
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=pencaker
JWT_SECRET=dev-secret-pkwt
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
FILE_UPLOAD_MAX_SIZE=7340032
```

---

## Database

### Migration: `db/migrations/20260327_revisi_perusahaan_pkwt.sql` — EXECUTED

```sql
ALTER TABLE employees DROP COLUMN IF EXISTS district;
ALTER TABLE employees DROP COLUMN IF EXISTS village;
ALTER TABLE employees DROP COLUMN IF EXISTS place_of_birth;
ALTER TABLE employees DROP COLUMN IF EXISTS birthdate;
ALTER TABLE employees DROP COLUMN IF EXISTS ktp_file_url;
ALTER TABLE employees ADD COLUMN gender ENUM('Laki-laki', 'Perempuan') NULL;
ALTER TABLE employees ADD COLUMN position VARCHAR(255) NULL;
ALTER TABLE contract_employees ADD COLUMN start_date DATE NULL;
ALTER TABLE contract_employees ADD COLUMN end_date DATE NULL;
ALTER TABLE contract_employees ADD COLUMN pkwt_sequence VARCHAR(10) NULL;
ALTER TABLE contracts ADD COLUMN surat_permohonan_file_id CHAR(36) NULL;
ALTER TABLE contracts ADD COLUMN surat_permohonan_file_name VARCHAR(255) NULL;
ALTER TABLE contracts ADD COLUMN draft_pkwt_file_id CHAR(36) NULL;
ALTER TABLE contracts ADD COLUMN draft_pkwt_file_name VARCHAR(255) NULL;
DELETE FROM contracts WHERE is_draft = TRUE;
```

**Database:** MySQL 10.4.32-MariaDB (XAMPP)

---

## File Summary

| # | File | Action | Repository |
|---|------|--------|------------|
| 1 | `src/lib/utils.ts` | Modified | pkwt-web |
| 2 | `src/hooks/useContractSubmission.ts` | Modified | pkwt-web |
| 3 | `src/components/TabelNIKPengajuan.tsx` | Modified | pkwt-web |
| 4 | `src/pages/company/PengajuanBerkas.tsx` | Modified | pkwt-web |
| 5 | `src/pages/admin/CreateContractSubmit.tsx` | Modified | pkwt-web |
| 6 | `src/services/contract-application-service.ts` | Modified | penkaer-pkwt-api |
| 7 | `src/services/contract-service.ts` | Modified | penkaer-pkwt-api |
| 8 | `src/services/employee-service.ts` | Modified | penkaer-pkwt-api |
| 9 | `src/lib/api.ts` | Modified | pkwt-web |
| 10 | `src/components/ApprovalEmployeeTable.tsx` | Modified | pkwt-web |
| 11 | `src/components/ApprovalEmployeeDetailModal.tsx` | Rewritten | pkwt-web |
| 12 | `src/components/ApprovalTable.tsx` | Modified | pkwt-web |
| 13 | `src/pages/admin/ApprovalDetail.tsx` | Modified | pkwt-web |
| 14 | `src/pages/admin/DetailKaryawan.tsx` | Modified | pkwt-web |
| 15 | `src/pages/company/DetailKaryawan.tsx` | Modified | pkwt-web |
| 16 | `src/lib/word-generator.ts` | Modified | pkwt-web |
| 17 | `__tests__/employee-check-niks.test.ts` | Rewritten | penkaer-pkwt-api |
| 18 | `__tests__/employee-upsert.test.ts` | Rewritten | penkaer-pkwt-api |
| 19 | `__tests__/employee-service.test.ts` | Modified | penkaer-pkwt-api |
| 20 | `__tests__/contract-service-applications.test.ts` | Modified | penkaer-pkwt-api |
| 21 | `__tests__/contract-service-admin-approvals.test.ts` | Modified | penkaer-pkwt-api |
| 22 | `__tests__/contract-application-service.test.ts` | Rewritten | penkaer-pkwt-api |
| 23 | `.env` | Created | pkwt-web |
| 24 | `.env` | Created | penkaer-pkwt-api |

---

## Verification

| Check | Status |
|-------|--------|
| Frontend build | ✅ Pass |
| Backend typecheck | ✅ Pass |
| Backend build | ✅ Pass |
| DB migration executed | ✅ Pass (MariaDB 10.4.32) |

---

## Step 01 Cross-Check

Ditemukan admin service functions (`_createPkwtApplicationAdmin`, `_createPkwttApplicationAdmin`) masih pakai pola lama — diperbaiki di step ini. Semua file step 01 lainnya sudah sesuai.
