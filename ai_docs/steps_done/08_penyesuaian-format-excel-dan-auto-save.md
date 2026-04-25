# Penyesuaian Format Excel Baru, Field Tambahan, dan Auto-Save Karyawan

Dokumen ini mencatat perubahan yang dilakukan untuk mendukung format Excel PKWT baru (nested header), penambahan field `No. PKWT` dan `Keterangan`, serta implementasi fitur auto-save karyawan.

## 1. Perubahan Database & Backend (`penkaer-pkwt-api`)

- **Skema Database (`contract_employees`):**
  - Mengubah tipe data kolom `pkwt_sequence` menjadi `VARCHAR(255)` untuk menampung format nomor kontrak yang lebih panjang/variatif.
  - Menambahkan kolom `keterangan` (Tipe: `TEXT`) untuk menyimpan catatan tambahan per karyawan dalam satu kontrak.

- **Validasi (Zod Schemas):**
  - **`employee-validation.ts` & `contract-validation.ts`**: Merelaksasi validasi NIK. Sekarang NIK hanya divalidasi sebagai angka (`numeric`) tanpa batasan panjang kaku (sebelumnya harus 16 digit), untuk mendukung berbagai format ID/KTP.
  - Menambahkan field `keterangan` pada schema pengajuan kontrak.

- **Layanan (`contract-application-service.ts`):**
  - Memperbarui `ContractApplicationService` untuk menyimpan `keterangan` ke tabel `contract_employees`.
  - Memastikan `start_date` disimpan per karyawan di tabel relasi, sangat penting untuk konsistensi data PKWTT.

## 2. Pembaruan Excel Parser (`pkwt-web/src/lib/excel.ts`)

- **Logika Nested Header:** Tulis ulang fungsi `findColumnIndices` agar mampu memindai beberapa baris awal (multi-row scanning) untuk mendeteksi header bertingkat (contoh: Header "Jenis Kelamin" yang membawahi sub-header "L" dan "P").
- **Deteksi Kolom Dinamis:** Menambahkan pencarian kolom untuk `No. PKWT` (atau `No. Kontrak`) dan `Keterangan` secara cerdas.
- **Normalisasi NIK:** Memperbaiki penanganan angka dalam notasi ilmiah (scientific notation) dari Excel (misal: 3.27E+15) agar tetap terbaca sebagai string angka utuh menggunakan `BigInt`.
- **Pembersihan Data:** Menambahkan logika untuk mengabaikan baris yang hanya berisi nomor urut tanpa data Nama/NIK (menghindari baris "sampah").
- **Date Parsing:** Memperbarui `parseDateFlexible` agar mendukung objek `Date` asli dari library SheetJS untuk akurasi tanggal yang lebih baik.

## 3. Komponen UI & Logic Frontend (`pkwt-web`)

- **`TabelNIKPengajuan.tsx`:** Menampilkan kolom baru `No. PKWT` dan `Keterangan` pada tabel pratinjau data NIK.
- **`ModalKelengkapanData.tsx`:**
  - Menambahkan input field untuk `No. PKWT` dan `Keterangan`.
  - Implementasi validasi kondisional: Tanggal dan No PKWT hanya wajib diisi jika jenis kontrak adalah **PKWT**. Untuk **PKWTT**, field tersebut opsional/disembunyikan.
- **`useContractSubmission.ts` (Hook):**
  - **Auto-Calculated Completeness:** Status "Lengkap" (Indikator Hijau) kini dihitung secara otomatis saat data Excel di-import berdasarkan kelengkapan field wajib.
  - **Auto-Save Karyawan Baru:** Menambahkan logika di fungsi `submitContract` untuk otomatis memanggil API `saveEmployeeData` bagi seluruh karyawan yang ada di daftar sebelum melakukan pengajuan kontrak. Ini mencegah error "NIK not found" pada karyawan yang baru pertama kali di-import.
- **`CreateContractSubmit.tsx` (Admin):**
  - Implementasi logika **Auto-Save** yang sama untuk alur admin (Disnaker).
  - Sinkronisasi payload pengajuan agar menyertakan seluruh metadata karyawan (Nama, Jabatan, Alamat, Kelamin).

## 4. API & Testing

- **`api.ts`:** Memperbarui interface Request dan Response untuk endpoint pengajuan kontrak (User & Admin) agar mencakup field `pkwt_sequence` dan `keterangan`.
- **`excel.test.ts`:** Memperbarui unit test untuk mencerminkan perubahan validasi NIK dan fungsionalitas parser yang baru.

## Kesimpulan
Sistem sekarang lebih fleksibel dalam menerima berbagai template Excel, lebih informatif dengan adanya field tambahan, dan lebih user-friendly karena data karyawan baru tersimpan secara otomatis tanpa perlu interaksi manual di modal satu per satu.
