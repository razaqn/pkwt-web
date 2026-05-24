# Langkah 11: PKWT Excel Overflow Fix
**Tanggal:** 2026-05-24 21:53:41

## 1. Ringkasan
Saya menelusuri error upload Excel PKWT/PKWTT di route perusahaan dan admin. Masalah utamanya bukan file gagal dibaca, tetapi parser menghitung baris template kosong/terformat sebagai data sehingga kena batas maksimum 500 baris. Saya perbaiki parsing agar hanya menghitung baris bermakna, menyesuaikan mapping kolom PKWT (`No. PKWT`, `Ket`, `TMT Mulai`, `TMT Akhir`), menambah test regresi, dan sempat menambahkan log sementara untuk tracing sebelum akhirnya log debug dihapus setelah masalah terverifikasi selesai.

## 2. Perubahan
- **Baru:** Test regresi di `tests/excel.test.ts` untuk template PKWT dengan header bertingkat dan kasus 996 baris fisik tetapi hanya 2 baris data bermakna.
- **Ubah:** `src/lib/excel.ts` agar:
  - mengenali kolom `No. PKWT` dan `Ket` dari template gambar,
  - mengabaikan baris kosong/format-only saat menghitung limit 500,
  - tetap mem-parsing baris data yang valid.
- **Ubah:** `src/components/FormKontrakPKWT.tsx` untuk sementara menampilkan log upload dan error saat tracing, lalu log tersebut dihapus setelah root cause ditemukan.
- **Ubah:** `src/hooks/useContractSubmission.ts` untuk menyesuaikan alur PKWTT/PKWT dengan data import dan start date yang benar.
- **Ubah:** `src/pages/admin/CreateContract.tsx` dan `src/pages/admin/CreateContractSubmit.tsx` untuk membawa data import dan alur admin.
- **Ubah:** `src/lib/api.ts` untuk menambah field `no_pkwt` di request PKWT admin/perusahaan.
- **Hapus:** Semua `console.log` debug sementara yang dipakai saat investigasi upload.

## 3. Status & Dampak
Upload Excel PKWT sekarang tidak lagi gagal hanya karena template memiliki banyak baris format kosong. Parser hanya menghitung baris yang benar-benar berisi data, sehingga file template yang sama bisa diproses di flow perusahaan dan admin. Build dan test parser sudah lolos, dan log debug sementara sudah dibersihkan dari codebase.
