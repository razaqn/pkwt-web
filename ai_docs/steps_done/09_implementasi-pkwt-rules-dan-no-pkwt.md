# Step 09: Implementasi Aturan PKWT, Auto-Sequence, dan Nomor PKWT (HRD)

Dokumen ini mencatat perubahan besar pada sistem backend dan frontend untuk mengakomodasi aturan baru PKWT, perhitungan urutan otomatis, serta pencatatan nomor surat internal HRD.

## Perubahan Backend (`pkwt-api`)

### 1. Database & Migrasi
- **File:** `db/migrations/20260422_add_no_pkwt_column.sql`
- **Tindakan:** Menambahkan kolom `no_pkwt` (VARCHAR 255, NULL) pada tabel `contract_employees`. Kolom ini digunakan untuk menyimpan nomor surat fisik/internal dari HRD perusahaan.

### 2. Aturan PKWT (Ownership Transfer)
- **File:** `src/services/employee-service.ts`
- **Tindakan:** Memperbarui fungsi `upsertByNik` agar mengizinkan pemindahan kepemilikan karyawan antar perusahaan. Jika karyawan dengan NIK yang sama didaftarkan oleh perusahaan baru, sistem akan memperbarui `company_id` karyawan tersebut alih-alih melempar error 403.

### 3. Auto-Sequence PKWT
- **File:** `src/services/contract-application-service.ts`
- **Tindakan:** Mengimplementasikan logika perhitungan `pkwt_sequence` otomatis:
    - Reset ke **1** jika karyawan pindah perusahaan.
    - Reset ke **1** jika ada jeda (gap) lebih dari 30 hari dari kontrak terakhir.
    - Increment (+1) jika masih di perusahaan yang sama dan dalam rentang 30 hari.

### 4. Penambahan Data pada History
- **File:** `src/services/employee-service.ts`
- **Tindakan:** Memperbarui query `getDetail` untuk melakukan `LEFT JOIN` ke `contract_employees` sehingga data `no_pkwt` dan `pkwt_sequence` muncul dalam riwayat kontrak karyawan.

### 5. Validasi
- **File:** `src/validations/contract-validation.ts`
- **Tindakan:** Menambahkan field `no_pkwt` ke dalam skema validasi `CREATE_APPLICATION_PKWT` dan `ADMIN_CREATE_APPLICATION_PKWT`.

---

## Perubahan Frontend (`pkwt-web`)

### 1. Fleksibilitas Import Excel
- **File:** `src/lib/excel.ts`
- **Tindakan:** 
    - Mengubah deteksi header kolom agar lebih cerdas. Sekarang kolom "No. PKWT" akan terdeteksi jika mengandung kata "pkwt" dan "no" atau "nomor" (misal: "Nomor PKWT", "No Surat PKWT").
    - Memetakan kolom tersebut ke field `noPkwt` sebagai teks bebas (*free text*).

### 2. Logika Kelengkapan Data (Completeness)
- **File:** `src/hooks/useContractSubmission.ts`
- **Tindakan:**
    - Memperbaiki penggabungan data (*merging*) agar nilai `noPkwt` dari Excel tidak hilang saat sinkronisasi dengan database.
    - Mengubah syarat status "Lengkap" (Indikator Hijau). Sebelumnya mewajibkan `pkwtSequence` (yang hanya ada di backend), sekarang mewajibkan **`noPkwt`** agar status otomatis menjadi lengkap setelah import Excel.

### 3. Tampilan Detail Karyawan
- **File:** `src/pages/admin/DetailKaryawan.tsx` & `src/pages/company/DetailKaryawan.tsx`
- **Tindakan:** Menambahkan kolom "No. PKWT" dan "PKWT Ke-" pada tabel riwayat kontrak untuk memberikan transparansi urutan kontrak kepada admin dan perusahaan.

### 4. Export Dokumen (Word)
- **File:** `src/lib/word-generator.ts`
- **Tindakan:** Menambahkan kolom "No. PKWT" dan "PKWT Ke-" ke dalam tabel karyawan pada dokumen Word yang dihasilkan saat proses verifikasi.

### 5. Perbaikan Bug & Build
- **File:** `src/lib/api.ts`: Memperbaiki kesalahan sintaksis (kurung kurawal hilang).
- **File:** `src/components/ModalKelengkapanData.tsx`: Menstandarisasi interface `KelengkapanDataForm` agar mendukung field baru.

## Hasil Pengujian
- **Unit Test (Backend):** Lolos pengujian logika urutan (sequence) dan pindah perusahaan.
- **Unit Test (Frontend):** Lolos pengujian parser Excel untuk berbagai variasi nama kolom.
- **Build Production:** Berhasil dikompilasi tanpa error tipe data (TypeScript).
