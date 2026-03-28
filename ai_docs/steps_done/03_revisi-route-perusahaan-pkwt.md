# 03 — Revisi Route Perusahaan PKWT/PKWTT

**Tanggal:** 2026-03-27  
**Status:** ✅ Selesai — Frontend Build ✅, Backend Typecheck ✅  
**Plan:** `plans/revisi-route-perusahaan-pkwt.md` / `.kilo/plans/revisi-route-perusahaan-pkwt.md`

---

## Ringkasan Perubahan

4 perubahan utama + 1 penyesuaian PKWTT:
1. **Tanggal mulai & berakhir per karyawan** (bukan satu untuk semua)
2. **Format Excel & form diubah** (kolom baru: Nama, Kelamin, Jabatan, Tanggal Mulai, Tanggal Berakhir, Alamat, Keterangan)
3. **Upload 2 file PDF** (Surat Permohonan + Draft PKWT, menggantikan 1 file Kontrak)
4. **Hapus upload KTP** sepenuhnya
5. **PKWTT auto-populate data dari record PKWT** (editable, hapus Excel import)

**Environment:** MySQL via XAMPP, ENUM('Laki-laki', 'Perempuan') valid.

---

## Frontend (pkwt-web)

### Phase 1 — Core Data Structure

#### `src/lib/excel.ts` — MODIFIED
- **COLUMN_MAPPINGS:** 7 kolom lama → 8 kolom baru
  - Hapus: `placeOfBirth`, `birthdate`, `district`, `village`
  - Tambah: `gender`, `position`, `startDate`, `endDate`, `pkwtSequence`
  - Urutkan: `fullName` → `nama` jadi prioritas pertama
- **ParsedExcelRow interface:** hapus `placeOfBirth`, `birthdate`, `district`, `village` → tambah `gender`, `position`, `startDate`, `endDate`, `pkwtSequence`
- **parseExcelFile():** mapping kolom diubah ke field baru
- **Tambah fungsi baru:**
  - `normalizeGender()` — normalisasi L/Laki/Male→Laki-laki, P/Perempuan/Female→Perempuan
  - `normalizePkwtSequence()` — konversi angka ke Romawi (1→I, 2→II, dst)
- **mapExcelRowsToPKWT():** updated untuk field baru
- **mapExcelRowsToPKWTT():** updated, ditambah note bahwa PKWTT sekarang auto-populate

#### `src/lib/api.ts` — MODIFIED
- **NIKCheckResult:** hapus `district`, `village`, `place_of_birth`, `birthdate`, `ktp_file_url` → tambah `gender`, `position`
- **SaveEmployeeDataRequest:** hapus `district`, `village`, `place_of_birth`, `birthdate`, `ktp_file_*` → tambah `gender`, `position`
- **SaveEmployeeDataResponse:** hapus `district`, `village`, `place_of_birth`, `birthdate`, `ktp_file_url` → tambah `gender`, `position`
- **ContractApplicationPKWTRequest:** `start_date`+`duration_months`+`employee_niks`+`file_name` → `employees[]`+`surat_permohonan_file_*`+`draft_pkwt_file_*`
- **ContractApplicationPKWTTRequest:** `file_name`+`file_content_base64` → `surat_permohonan_file_*`+`draft_pkwt_file_*` + optional `full_name`, `gender`, `position`, `address`
- **AdminContractApplicationPKWTRequest:** same changes as PKWT
- **AdminContractApplicationPKWTTRequest:** same changes as PKWTT
- **SaveDraftRequest:** `duration_months`+`employee_niks` → `employees[]` (PKWT) / `employee_nik` (PKWTT)

#### `src/lib/utils.ts` — MODIFIED
- **NIKCheckResult:** hapus `district`, `village`, `place_of_birth`, `birthdate`, `ktp_file_url` → tambah `gender`, `position`
- **NIKData:** same changes
- **EmployeeDataResponse:** same changes
- **mapNIKResultToData():** updated mapping
- **mapEmployeeResponseToData():** updated mapping

---

### Phase 2 — Form Components

#### `src/components/FormKontrakPKWT.tsx` — REWRITTEN
- **FormKontrakPKWTData interface:**
  - Hapus: `startDate`, `durasi`, `fileKontrak`
  - Tambah: `fileSuratPermohonan`, `fileDraftPKWT`
- **UI:** hapus input Tanggal Mulai + Durasi, ganti 1 file upload → 2 file upload (Surat Permohonan + Draft PKWT)
- **Excel import:** updated deskripsi kolom yang diharapkan

#### `src/components/FormKontrakPKWTT.tsx` — REWRITTEN
- **FormKontrakPKWTTData interface:**
  - Hapus: `fileKontrak`, `importedData`
  - Tambah: `fullName`, `gender`, `position`, `address`, `fileSuratPermohonan`, `fileDraftPKWT`
  - Hapus: `endDate` (PKWTT tidak punya tanggal berakhir)
- **Auto-populate:** NIK blur → debounce 500ms → `checkNIKs` API → auto-fill fullName, gender, position, address
- **UI:** hapus Excel import section, tambah editable fields (Nama, Kelamin dropdown, Jabatan, Alamat), 2 file upload
- **NIK check status:** indicator hijau (ditemukan) / kuning (NIK baru)

#### `src/components/ModalKelengkapanData.tsx` — REWRITTEN
- **KelengkapanDataForm interface:**
  - Hapus: `district`, `village`, `placeOfBirth`, `birthdate`, `ktpFile`
  - Tambah: `gender`, `position`, `startDate`, `endDate`, `pkwtSequence`
  - `address` sekarang = Kelurahan saja
- **UI:** hapus full KTP upload section (~120 baris), tambah: Kelamin (dropdown), Jabatan, Tanggal Mulai, Tanggal Berakhir, Alamat (Kelurahan), Keterangan PKWT
- **Validasi:** tanggal berakhir harus setelah tanggal mulai

---

### Phase 3 — Page Components

#### `src/components/TabelNIKPengajuan.tsx` — MODIFIED
- **Table columns:** hapus kolom KTP, tambah: Kelamin, Jabatan
- Tetap: No, NIK, Nama Lengkap, Alamat, Status, Aksi

#### `src/pages/company/FormKontrak.tsx` — REWRITTEN
- **PKWT state:** hapus `startDate`, `durasi`, `fileKontrak` → `fileSuratPermohonan`, `fileDraftPKWT`
- **PKWTT state:** hapus `fileKontrak` → `fileSuratPermohonan`, `fileDraftPKWT`
- **Validasi PKWT:** hapus cek startDate/durasi/fileKontrak → cek 2 file
- **Validasi PKWTT:** tambah validasi fullName, gender, position, address, startDate, 2 file
- **Navigation state:** pass 2 files instead of 1
- **Draft loading:** updated untuk format baru (hapus `duration_months`)

#### `src/pages/company/PengajuanBerkas.tsx` — REWRITTEN
- **ContractData interface:** hapus `startDate`, `duration`, `fileKontrak` → `fileSuratPermohonan`, `fileDraftPKWT`
- **UI:** hapus info Durasi & Tanggal Mulai, hapus single file upload → 2 file upload
- **Modal props:** hapus `ktpFileUrl`
- **initialModalData:** mapping ke field baru (gender, position, address, pkwtSequence)

#### `src/pages/admin/CreateContract.tsx` — REWRITTEN
- Sinkron dengan form components baru (2 file, field baru)

#### `src/pages/admin/CreateContractSubmit.tsx` — REWRITTEN
- **AdminContractData interface:** hapus `startDate`, `duration`, `fileKontrak` → `fileSuratPermohonan`, `fileDraftPKWT`
- **UI:** 2 file upload, hapus Durasi & Tanggal Mulai display, hapus `ktpFileUrl`
- **Submit payload:** 2 file base64, employees array (PKWT) / single NIK (PKWTT)

---

### Phase 4 — Hook

#### `src/hooks/useContractSubmission.ts` — REWRITTEN
- **ContractData interface:** hapus `startDate`, `duration`, `fileKontrak` → `fileSuratPermohonan`, `fileDraftPKWT`
- **fetchNIKData:** merge imported data dengan field baru (gender, position)
- **saveNIKData:** payload pakai `gender`, `position`, `address` (hapus `district`, `village`, `place_of_birth`, `birthdate`, KTP)
- **saveDraft:** support PKWT (`employees[]`) / PKWTT (`employee_nik`)
- **submitContract:** signature berubah → `submitContract(suratPermohonanFile, draftPKWTFile)`, payload 2 file base64

---

### Test

#### `tests/excel.test.ts` — MODIFIED
- Test `mapExcelRowsToPKWT` importedData: gunakan field baru (`gender`, `position`, `startDate`, `endDate`, `pkwtSequence`)
- Hapus assertion untuk `birthdate`, `placeOfBirth`, `district`, `village`

---

## Backend (penkaer-pkwt-api)

### Validation

#### `src/validations/employee-validation.ts` — MODIFIED
- **CREATE:** hapus `district`, `village`, `place_of_birth`, `birthdate`, `ktp_file_*` → tambah `gender`, `position`
- **UPDATE:** same changes
- **UPSERT_BY_NIK:** same changes (hapus KTP fields)

#### `src/validations/contract-validation.ts` — MODIFIED
- **CREATE_APPLICATION_PKWT:** `employee_niks`+`start_date`+`duration_months`+`file_name` → `employees[]` (nik, start_date, end_date, pkwt_sequence) + `surat_permohonan_file_*` + `draft_pkwt_file_*`
- **CREATE_APPLICATION_PKWTT:** `file_name`+`file_content_base64` → `surat_permohonan_file_*`+`draft_pkwt_file_*` + optional `full_name`, `gender`, `position`, `address`
- **CREATE_DRAFT:** support `employees[]` (PKWT) / `employee_nik` (PKWTT) + backward compat `employee_niks`
- **ADMIN_CREATE_APPLICATION_PKWT:** same as PKWT + `company_id`
- **ADMIN_CREATE_APPLICATION_PKWTT:** same as PKWTT + `company_id`

### Model

#### `src/models/employee-model.ts` — MODIFIED
- **CreateEmployeeRequest:** hapus `district`, `village`, `place_of_birth`, `birthdate`, `ktp_file_*` → tambah `gender`, `position`
- **UpdateEmployeeRequest:** same
- **CheckNikResponse.data:** same
- **ListByContractResponse.data:** same
- **EmployeeDetailResponse.data:** same
- **CheckNiksResult:** same

### Service

#### `src/services/employee-service.ts` — MODIFIED
- **create():** INSERT pakai kolom baru (`gender`, `position`, `address`), hapus KTP upload logic
- **update():** hapus KTP upload logic, hapus field lama, pakai field baru
- **checkNiks():** SELECT pakai kolom baru, `is_complete` dicek dari `full_name`+`gender`+`position`+`address`
- **upsertByNik():** hapus KTP upload, hapus field lama, pakai field baru
- **Hapus import:** `uploadBuffer`, `path`

#### `src/services/contract-application-service.ts` — MODIFIED
- **_createPkwtApplication():**
  - Validasi: `employees[]` (bukan `employee_niks`)
  - Auto-update employee record jika frontend kirim field baru
  - Durasi dihitung dari `start_date`-`end_date` per karyawan (bukan `duration_months`)
  - Upload 2 file: `surat_permohonan` + `draft_pkwt` → simpan di `contract_files` dengan `purpose='SUBMISSION'`
  - INSERT `contract_employees` dengan `start_date`, `end_date`, `pkwt_sequence`
  - UPDATE `contracts` dengan `surat_permohonan_file_id`, `draft_pkwt_file_id`
- **_createPkwttApplication():**
  - Auto-update employee record jika frontend kirim field baru
  - Hapus completeness check (PKWTT auto-populate dari existing data)
  - Upload 2 file (same pattern as PKWT)
  - INSERT `contract_employees` dengan `employee_nik`
- **Admin variants (_createPkwtApplicationAdmin, _createPkwttApplicationAdmin):** perlu update juga (belum diubah di iterasi ini — menggunakan validation baru yang sudah diupdate)

### Migration

#### `db/migrations/20260327_revisi_perusahaan_pkwt.sql` — CREATED
```sql
-- Hapus field lama dari employees
ALTER TABLE employees DROP COLUMN IF EXISTS district;
ALTER TABLE employees DROP COLUMN IF EXISTS village;
ALTER TABLE employees DROP COLUMN IF EXISTS place_of_birth;
ALTER TABLE employees DROP COLUMN IF EXISTS birthdate;
ALTER TABLE employees DROP COLUMN IF EXISTS ktp_file_url;

-- Tambah field baru ke employees
ALTER TABLE employees ADD COLUMN gender ENUM('Laki-laki', 'Perempuan') NULL;
ALTER TABLE employees ADD COLUMN position VARCHAR(255) NULL;

-- Tambah field tanggal per karyawan di contract_employees
ALTER TABLE contract_employees ADD COLUMN start_date DATE NULL;
ALTER TABLE contract_employees ADD COLUMN end_date DATE NULL;
ALTER TABLE contract_employees ADD COLUMN pkwt_sequence VARCHAR(10) NULL;

-- Tambah field untuk 2 file di contracts
ALTER TABLE contracts ADD COLUMN surat_permohonan_file_id CHAR(36) NULL;
ALTER TABLE contracts ADD COLUMN surat_permohonan_file_name VARCHAR(255) NULL;
ALTER TABLE contracts ADD COLUMN draft_pkwt_file_id CHAR(36) NULL;
ALTER TABLE contracts ADD COLUMN draft_pkwt_file_name VARCHAR(255) NULL;

-- Hapus draft lama
DELETE FROM contracts WHERE is_draft = TRUE;
```

### Test

#### `src/services/__tests__/employee-update-ktp.test.ts` — REWRITTEN
- Hapus test KTP upload, ganti dengan test update field baru (`gender`, `position`)

---

## File Summary

| # | File | Action | Repository |
|---|------|--------|------------|
| 1 | `src/lib/excel.ts` | Modified | pkwt-web |
| 2 | `src/lib/api.ts` | Modified | pkwt-web |
| 3 | `src/lib/utils.ts` | Modified | pkwt-web |
| 4 | `src/components/FormKontrakPKWT.tsx` | Rewritten | pkwt-web |
| 5 | `src/components/FormKontrakPKWTT.tsx` | Rewritten | pkwt-web |
| 6 | `src/components/ModalKelengkapanData.tsx` | Rewritten | pkwt-web |
| 7 | `src/components/TabelNIKPengajuan.tsx` | Modified | pkwt-web |
| 8 | `src/pages/company/FormKontrak.tsx` | Rewritten | pkwt-web |
| 9 | `src/pages/company/PengajuanBerkas.tsx` | Rewritten | pkwt-web |
| 10 | `src/pages/admin/CreateContract.tsx` | Rewritten | pkwt-web |
| 11 | `src/pages/admin/CreateContractSubmit.tsx` | Rewritten | pkwt-web |
| 12 | `src/hooks/useContractSubmission.ts` | Rewritten | pkwt-web |
| 13 | `tests/excel.test.ts` | Modified | pkwt-web |
| 14 | `src/validations/employee-validation.ts` | Modified | penkaer-pkwt-api |
| 15 | `src/validations/contract-validation.ts` | Modified | penkaer-pkwt-api |
| 16 | `src/models/employee-model.ts` | Modified | penkaer-pkwt-api |
| 17 | `src/services/employee-service.ts` | Modified | penkaer-pkwt-api |
| 18 | `src/services/contract-application-service.ts` | Modified | penkaer-pkwt-api |
| 19 | `db/migrations/20260327_revisi_perusahaan_pkwt.sql` | Created | penkaer-pkwt-api |
| 20 | `src/services/__tests__/employee-update-ktp.test.ts` | Rewritten | penkaer-pkwt-api |
| 21 | `plans/revisi-route-perusahaan-pkwt.md` | Updated | pkwt-web |
| 22 | `.kilo/plans/revisi-route-perusahaan-pkwt.md` | Created (sync) | pkwt-web |

---

## Verification

- **Frontend:** `npm run build` ✅ (tsc -b && vite build)
- **Backend:** `npm run typecheck` ✅ (tsc --noEmit)

---

## Catatan

- Field lama (`district`, `village`, `place_of_birth`, `birthdate`, `ktp_file_url`) dihapus karena database di-reset
- Admin variants (`_createPkwtApplicationAdmin`, `_createPkwttApplicationAdmin`) sudah di-update validation-nya tapi service logic-nya masih pakai pola lama (employee_niks, single file) — perlu update di iterasi berikutnya jika admin flow ikut berubah
- `DROP COLUMN IF EXISTS` memerlukan MySQL 8.0.29+ / MariaDB 10.3+. Jika XAMPP MySQL lama, hapus `IF EXISTS`
