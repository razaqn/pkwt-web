# Steps Done: Implementasi Fitur Pengelola BPJS

Dokumen ini mencatat perubahan yang dilakukan untuk mengimplementasikan fitur login dan pengelolaan data bagi role baru `petugas_bpjs`. Fitur ini memungkinkan petugas BPJS untuk mengunggah data kepesertaan melalui Excel dan melihat daftar data di sistem.

## Perubahan Backend (penkaer-pkwt-api)

### 1. Database & Migrasi
- **File**: `db/migrations/20260408_create_bpjs_tables.sql` (Baru)
- **Deskripsi**: Membuat tabel `bpjs_submissions` dan `bpjs_records` untuk menyimpan data pengajuan dan detail peserta. Menambahkan role `petugas_bpjs` ke tabel `app_roles`.

### 2. Autentikasi & RBAC
- **File**: `src/middleware/rbac-middleware.ts` (Modifikasi)
- **Deskripsi**: Menambahkan role `petugas_bpjs` ke dalam daftar role yang didukung pada middleware `requireRole`.

### 3. Validasi
- **File**: `src/validations/bpjs-validation.ts` (Baru)
- **Deskripsi**: Menambahkan schema Zod `SUBMIT_DATA` untuk memvalidasi input array records BPJS (NIK, Nama, dll).

### 4. Controller & Service
- **File**: `src/models/bpjs-model.ts` (Baru) – Definisi tipe data request/response.
- **File**: `src/services/bpjs-service.ts` (Baru) – Logika simpan data dengan transaksi database dan pengambilan data dengan search/pagination.
- **File**: `src/controllers/bpjs-controller.ts` (Baru) – Handler untuk endpoint submissions dan records.

### 5. Routing
- **File**: `src/routes/api.ts` (Modifikasi)
- **Deskripsi**: Mendaftarkan endpoint:
    - `POST /api/bpjs/submissions` (Hanya role `petugas_bpjs`)
    - `GET /api/bpjs/records` (Hanya role `petugas_bpjs`)

---

## Perubahan Frontend (pkwt-web)

### 1. Store & Layout
- **File**: `src/store/auth.ts` (Modifikasi) – Menambahkan `petugas_bpjs` ke dalam tipe `Role`.
- **File**: `src/components/BpjsSidebar.tsx` (Baru) – Navigasi khusus untuk petugas BPJS (Masukkan Data & Lihat Data).
- **File**: `src/layouts/AppLayout.tsx` (Modifikasi) – Integrasi `BpjsSidebar` saat user login sebagai petugas BPJS.
- **File**: `src/App.tsx` (Modifikasi) – Penambahan routing untuk halaman-halaman BPJS.

### 2. Library & Utilitas
- **File**: `src/lib/excel-bpjs.ts` (Baru)
- **Deskripsi**: Logika parsing Excel khusus BPJS dengan pemetaan kolom yang fleksibel (NIK, Nama, Kecamatan, Desa, dll) dan pembersihan data (normalisasi NIK).

### 3. Halaman (Pages)
- **File**: `src/pages/bpjs/Dashboard.tsx` (Baru) – Dashboard menu utama.
- **File**: `src/pages/bpjs/FormBPJS.tsx` (Baru) – Halaman upload file Excel.
- **File**: `src/pages/bpjs/PengajuanBPJS.tsx` (Baru) – Halaman preview, validasi, dan edit data sebelum submit final.
- **File**: `src/pages/bpjs/ListBPJS.tsx` (Baru) – Halaman daftar data peserta BPJS dengan fitur pencarian.

## Ringkasan Alur Fitur
1. Petugas BPJS login ke sistem.
2. Memilih menu "Masukkan Data" dan mengunggah file Excel template.
3. Review data di halaman pengajuan (bisa edit data yang ditandai error).
4. Kirim data ke server.
5. Memantau data yang sudah masuk di menu "Lihat Data".
