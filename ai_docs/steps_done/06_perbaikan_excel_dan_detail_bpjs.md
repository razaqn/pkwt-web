# Step 06 - Perbaikan Baca Excel dan Penambahan Fitur Detail BPJS

## Perubahan yang Dilakukan

### 1. Perbaikan Pembacaan Excel (`excel-bpjs.ts`)
*   **Fix Date Offset (-1 hari)**: Menggunakan `Math.round(rawDate * 86400000)` dan metode `.getUTCDate()` untuk memastikan tanggal lahir dari file Excel terbaca dengan benar tanpa tergeser zona waktu.
*   **Normalisasi Jenis Kelamin**: Menambahkan pemetaan fleksibel untuk jenis kelamin. Sekarang sistem dapat mengenali input seperti "lk", "pr", "pria", "p", dll., secara *case-insensitive* dan mengonversinya ke standar "Laki-laki" atau "Perempuan".
*   **Mapping Kolom Baru**: Menambahkan pengenalan kolom "Status Kepesertaan" dan memperbaiki mapping kolom "Pekerjaan" agar sesuai dengan format header yang bervariasi.

### 2. Update Database & Backend (API)
*   **Skema Database**: Menambahkan kolom `status_kepesertaan` pada tabel `bpjs_records`.
*   **Backend Validation**: Memperbarui Zod schema di `bpjs-validation.ts` untuk menerima field `status_kepesertaan`.
*   **Backend Models**: Menambahkan properti `status_kepesertaan` pada interface `BpjsRecordInput` dan response.
*   **Backend Service**: Mengupdate query `INSERT` dan `SELECT` di `bpjs-service.ts` agar dapat menyimpan dan menampilkan data status kepesertaan.

### 3. Peningkatan UI Pengajuan (`PengajuanBPJS.tsx`)
*   **Review Table**: Menambahkan kolom "Status & Kelas" pada tabel review hasil unggah excel.
*   **Edit Modal**: 
    *   Menambahkan input untuk: Kecamatan, Biaya Iuran APBD, Status Kepesertaan, serta Keterangan.
    *   Mengganti input "Tanggal Lahir" menjadi tipe **Date Picker** asli agar lebih mudah digunakan.

### 4. Fitur Detail Data (`ListBPJS.tsx`)
*   **Action Column**: Menambahkan kolom aksi dengan tombol "Detail" pada setiap baris data di halaman Lihat Data.
*   **Detail Modal**: Menampilkan modal pop-up yang menyajikan profil lengkap peserta BPJS secara terperinci (NIK, Nama, Alamat, Pekerjaan, Status, dll).

## Ringkasan Teknis
*   **Frontend**: `pkwt-web/src/lib/excel-bpjs.ts`, `pkwt-web/src/pages/bpjs/PengajuanBPJS.tsx`, `pkwt-web/src/pages/bpjs/ListBPJS.tsx`.
*   **Backend**: `penkaer-pkwt-api/src/services/bpjs-service.ts`, `penkaer-pkwt-api/src/validations/bpjs-validation.ts`, `penkaer-pkwt-api/src/models/bpjs-model.ts`.
*   **Database**: Kolom `status_kepesertaan` ditambahkan secara manual melalui CLI/migration script.

---
*Dokumentasi ini dibuat secara otomatis oleh Antigravity pada 08 April 2026.*
