# Backend Guide — Revisi Flow Admin PKWT

Tanggal: 2026-03-25

Dokumen ini berisi panduan untuk backend agar bisa menyesuaikan dengan perubahan yang telah dilakukan di frontend. Silakan review setiap bagian dan konfirmasi apakah endpoint sudah support atau perlu perubahan.

---

## Ringkasan Perubahan Frontend

1. **Flow Persetujuan Baru** — Admin sekarang melihat preview dokumen Word yang digenerate otomatis, download, edit, lalu upload ulang sebelum approve.
2. **Admin Buat Kontrak Mandiri** — Admin bisa membuat PKWT/PKWTT atas nama perusahaan manapun, dengan memilih `company_id`.

---

## Endpoint Baru yang Dibutuhkan

### `POST /api/admin/contracts/applications`

Admin membuat kontrak PKWT atau PKWTT atas nama perusahaan tertentu.

#### Request — PKWT

```json
{
  "company_id": "uuid-perusahaan",
  "contract_type": "PKWT",
  "start_date": "2026-04-01",
  "duration_months": 12,
  "employee_niks": ["3201234567890001", "3201234567890002"],
  "file_name": "kontrak_batch.pdf",
  "file_content_base64": "base64encoded..."
}
```

#### Request — PKWTT

```json
{
  "company_id": "uuid-perusahaan",
  "contract_type": "PKWTT",
  "start_date": "2026-04-01",
  "employee_nik": "3201234567890001",
  "file_name": "kontrak_pkwtt.pdf",
  "file_content_base64": "base64encoded..."
}
```

#### Expected Response

```json
{
  "ok": true,
  "message": "Kontrak berhasil dibuat",
  "data": {
    "contract_ids": ["uuid-1", "uuid-2"],
    "contract_type": "PKWT",
    "start_date": "2026-04-01",
    "duration_months": 12,
    "status": "PENDING",
    "employee_count": 2,
    "submitted_at": "2026-03-25T15:30:00.000Z",
    "company_id": "uuid-perusahaan"
  }
}
```

#### Behavior yang Diharapkan

| # | Behavior | Keterangan |
|---|----------|------------|
| 1 | Validasi `company_id` | Pastikan company_id valid dan perusahaan ada di database |
| 2 | Validasi NIK | Pastikan semua NIK (`employee_niks` / `employee_nik`) ada dan milik perusahaan tersebut, atau bisa dibuat baru |
| 3 | Simpan kontrak | Buat record kontrak dengan status `PENDING` (siap untuk di-approve oleh admin/disnaker lain) |
| 4 | Simpan file | Simpan file PDF yang diupload sebagai dokumen pengajuan (`submission_file_url` / `file_url`) |
| 5 | Tidak perlu approval sendiri | Kontrak yang dibuat admin tetap masuk status `PENDING` agar bisa di-review oleh admin/disnaker lain |

---

## Endpoint Existing yang Perlu Direview

### `POST /api/admin/contracts/approvals/:id/approve`

Frontend sekarang mengirim file dalam format **PDF atau Word (.docx)**.

#### Request Format (tidak berubah dari frontend)

```json
{
  "comment": "Catatan admin (opsional)",
  "approval_file_name": "kontrak_edited.docx",
  "approval_file_content_base64": "base64encoded..."
}
```

#### Yang Perlu Diperhatikan

| # | Perhatian | Saran |
|---|-----------|-------|
| 1 | File bisa `.docx` sekarang | Pastikan backend tidak memvalidasi ekstensi file hanya sebagai `.pdf`. Terima `application/pdf` dan `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |
| 2 | MIME type validation | Jika ada validasi MIME type, tambahkan `application/vnd.openxmlformats-officedocument.wordprocessingml.document` ke whitelist |
| 3 | Storage | Pastikan storage (S3/local) bisa menyimpan file `.docx` tanpa masalah |
| 4 | Download link | `approval_file_url` yang dikembalikan harus bisa diakses untuk download file .docx |

---

### `POST /api/admin/contracts/approvals/:id/reject`

**Tidak ada perubahan** — frontend tetap mengirim komentar wajib + file opsional (bisa PDF/Word atau kosong).

---

### `POST /api/contracts/applications`

**Tidak ada perubahan** — endpoint ini tetap digunakan oleh company role. Admin menggunakan endpoint baru `/api/admin/contracts/applications`.

---

### `GET /api/admin/companies`

**Tidak ada perubahan** — endpoint ini sudah digunakan untuk company selector di halaman admin.

---

## Validasi & Otorisasi

### Yang Perlu Dicek

| # | Area | Pertanyaan untuk Backend |
|---|------|--------------------------|
| 1 | Role check | Apakah endpoint `/api/admin/contracts/applications` sudah mengecek bahwa caller adalah `super_admin` atau `disnaker`? |
| 2 | Company access | Apakah admin boleh membuat kontrak untuk SEMUA perusahaan, atau hanya perusahaan tertentu? (Frontend mengasumsikan semua perusahaan) |
| 3 | NIK ownership | Saat admin membuat kontrak dengan NIK, apakah NIK harus milik company yang dipilih? Atau bisa NIK baru yang belum terdaftar? |
| 4 | Dual approval | Kontrak yang dibuat admin sendiri — apakah perlu approve oleh admin lain, atau auto-approve? (Frontend mengasumsikan masuk `PENDING`) |

---

## Saran untuk Backend

### Priority Tinggi

1. **Buat endpoint `POST /api/admin/contracts/applications`**
   - Ini adalah endpoint utama yang dibutuhkan untuk fitur "Buat Kontrak Mandiri"
   - Pastikan menerima `company_id` dan membuat kontrak atas nama perusahaan tersebut
   - Status kontrak = `PENDING`

2. **Pastikan approve endpoint menerima `.docx`**
   - Cek validasi file di endpoint approve
   - Tambahkan support untuk MIME type Word jika belum ada

### Priority Sedang

3. **Tambah notifikasi untuk admin lain**
   - Ketika admin A membuat kontrak mandiri, admin B (atau disnaker) bisa melihat kontrak tersebut di daftar persetujuan
   - Pastikan kontrak muncul di `GET /api/admin/contracts/approvals` dengan status `PENDING`

4. **Audit trail**
   - Catat siapa (admin mana) yang membuat kontrak mandiri
   - Catat siapa yang approve/reject

### Priority Rendah

5. **Validasi durasi PKWT**
   - Sesuai regulasi, PKWT maksimal 21 bulan (atau sesuai kebijakan terbaru)
   - Backend tetap harus validasi, walau frontend juga validasi

6. **File size limit**
   - Frontend membatasi 5MB. Pastikan backend juga punya limit yang sama atau lebih besar

---

## Checklist untuk Backend

- [ ] Endpoint `POST /api/admin/contracts/applications` dibuat
- [ ] Endpoint approve menerima file `.docx` selain `.pdf`
- [ ] Role check: hanya `super_admin` / `disnaker` yang bisa akses endpoint baru
- [ ] `company_id` divalidasi saat buat kontrak mandiri
- [ ] NIK divalidasi (milik company atau bisa baru)
- [ ] Kontrak baru muncul di daftar persetujuan (`GET /api/admin/contracts/approvals`)
- [ ] Audit log: catat admin yang membuat dan yang approve
- [ ] Test: buat kontrak PKWT mandiri → muncul di approval list → bisa di-approve
- [ ] Test: buat kontrak PKWTT mandiri → muncul di approval list → bisa di-approve
- [ ] Test: upload file `.docx` saat approve → berhasil tersimpan

---

## Format File yang Didukung

| Endpoint | Format yang Diterima |
|----------|---------------------|
| `POST /api/admin/contracts/applications` | PDF |
| `POST /api/admin/contracts/approvals/:id/approve` | PDF, DOCX |
| `POST /api/admin/contracts/approvals/:id/reject` | PDF, DOCX (opsional) |
