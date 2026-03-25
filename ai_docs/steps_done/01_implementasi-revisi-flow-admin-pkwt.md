# 01 — Implementasi Revisi Flow Admin PKWT

Tanggal: 2026-03-25

## Ringkasan

Implementasi dua fitur utama pada route admin:
1. **Revisi Flow Persetujuan ("Setujui")** — Admin dapat preview, download dokumen Word yang digenerate otomatis, lalu upload kembali dokumen yang sudah diedit/konfirmasi sebelum approve.
2. **Admin Buat PKWT Mandiri** — Admin dapat membuat kontrak PKWT/PKWTT atas nama perusahaan manapun dengan memilih perusahaan dari dropdown.

---

## Dependensi Baru

| Package | Versi | Tujuan |
|---------|-------|--------|
| `docx` | latest | Generate dokumen Word (.docx) di frontend (browser) |

---

## File yang Dibuat (3 file)

### 1. `src/lib/word-generator.ts`
Utility untuk generate dokumen kontrak dalam format Word (.docx) secara client-side.

**Export utama:**
- `generateContractDocument(data: ContractDocData): Promise<Blob>` — Generate dokumen Word dari data kontrak (nama perusahaan, alamat, jenis kontrak, tanggal mulai, durasi, tabel karyawan).
- `approvalToDocData(approval: ApprovalDetail): ContractDocData` — Konversi data `ApprovalDetail` ke format yang dibutuhkan generator.
- `downloadBlob(blob: Blob, filename: string): void` — Trigger download file dari Blob.
- `openBlobInNewTab(blob: Blob): void` — Buka dokumen di tab baru untuk preview.
- `getContractFileName(companyName: string, contractType: string): string` — Generate nama file yang sanitized.

**Struktur dokumen yang dihasilkan:**
- Judul: "PERJANJIAN KERJA WAKTU TERTENTU (PKWT)" atau "PERJANJIAN KERJA WAKTU TIDAK TERTENTU (PKWTT)"
- Informasi perusahaan (nama, alamat)
- Detail kontrak (jenis, tanggal mulai, durasi)
- Tabel karyawan (No, NIK, Nama, Alamat, Tanggal Lahir)
- Placeholder tanda tangan
- Footer tanggal generate

### 2. `src/pages/admin/CreateContract.tsx`
Halaman form untuk admin membuat kontrak mandiri.

**Fitur:**
- **Company Selector** — Dropdown dengan pencarian untuk memilih perusahaan. Menggunakan `getAllCompanies()` API yang sudah ada.
- **Tab PKWT/PKWTT** — Sama seperti form di perusahaan.
- Reuse komponen `FormKontrakPKWT` dan `FormKontrakPKWTT` yang sudah ada (tidak dimodifikasi).
- Validasi termasuk pengecekan company_id.
- Navigasi ke `/admin/create-contract/submit` dengan state (companyId, contractType, niks, dll).

### 3. `src/pages/admin/CreateContractSubmit.tsx`
Halaman pengajuan berkas untuk admin (mirip `PengajuanBerkas.tsx`).

**Fitur:**
- Menampilkan info perusahaan yang dipilih + ringkasan kontrak.
- Tabel NIK dengan data karyawan (reuse `TabelNIKPengajuan`).
- Modal kelengkapan data (reuse `ModalKelengkapanData`).
- Upload file kontrak PDF (untuk PKWT).
- Submit via `adminSubmitContractApplication()` ke endpoint `POST /api/admin/contracts/applications` dengan `company_id`.
- Redirect ke `/admin/approvals` setelah berhasil.

---

## File yang Dimodifikasi (4 file)

### 1. `src/components/ApprovalActionModal.tsx`
**Perubahan utama pada flow "Setujui":**

Perubahan:
- Props baru: `approvalData?: ApprovalDetail | null` — untuk akses data kontrak saat generate dokumen.
- Saat modal dibuka dengan `actionType='approve'`, sistem otomatis generate dokumen Word menggunakan `approvalToDocData()` + `generateContractDocument()`.
- Tombol **"Preview Dokumen"** — buka dokumen di tab baru (`openBlobInNewTab`).
- Tombol **"Unduh Dokumen"** — download dokumen Word (`downloadBlob`).
- File upload berubah: `accept=".pdf,.docx"` (sebelumnya hanya PDF).
- Label upload: "Unggah Dokumen yang Sudah Diedit (PDF/Word)".
- Status generating ditunjukkan dengan spinner "Menggenerate dokumen...".
- Fallback: jika generate gagal, tampilkan pesan warning dan admin tetap bisa upload manual.

Flow "Tolak": **tidak ada perubahan** (komentar wajib, file opsional).

### 2. `src/pages/admin/ApprovalDetail.tsx`
**Perubahan kecil:**
- Menambahkan prop `approvalData={approval}` pada komponen `<ApprovalActionModal>` agar modal memiliki akses ke data kontrak, perusahaan, dan karyawan untuk generate dokumen.

### 3. `src/lib/api.ts`
**Penambahan:**
- Interface `AdminContractApplicationPKWTRequest` — dengan field `company_id`, `contract_type: 'PKWT'`, `start_date`, `duration_months`, `employee_niks`, `file_name`, `file_content_base64`.
- Interface `AdminContractApplicationPKWTTRequest` — dengan field `company_id`, `contract_type: 'PKWTT'`, `start_date`, `employee_nik`, `file_name`, `file_content_base64`.
- Function `adminSubmitContractApplication()` — POST ke `/api/admin/contracts/applications` dengan payload yang menyertakan `company_id`.

### 4. `src/App.tsx`
**Penambahan import:**
```tsx
import CreateContract from './pages/admin/CreateContract';
import CreateContractSubmit from './pages/admin/CreateContractSubmit';
```

**Penambahan routes:**
```tsx
<Route path="/admin/create-contract" element={<RequireAuth><AppLayout><CreateContract /></AppLayout></RequireAuth>} />
<Route path="/admin/create-contract/submit" element={<RequireAuth><AppLayout><CreateContractSubmit /></AppLayout></RequireAuth>} />
```

### 5. `src/components/AdminSidebar.tsx`
**Penambahan:**
- Import `FilePlus` dari lucide-react.
- Menu item baru "Buat Kontrak" setelah "Persetujuan Kontrak":
  - Route: `/admin/create-contract`
  - Icon: `FilePlus`
  - Deskripsi: "Buat PKWT/PKWTT mandiri"

---

## File yang Dihapus

Tidak ada.

---

## File yang Tidak Berubah (direuse)

| File | Digunakan oleh |
|------|---------------|
| `src/components/FormKontrakPKWT.tsx` | `CreateContract.tsx` |
| `src/components/FormKontrakPKWTT.tsx` | `CreateContract.tsx` |
| `src/components/TabelNIKPengajuan.tsx` | `CreateContractSubmit.tsx` |
| `src/components/ModalKelengkapanData.tsx` | `CreateContractSubmit.tsx` |
| `src/hooks/useContractSubmission.ts` | `CreateContractSubmit.tsx` |
| `src/lib/utils.ts` (`fileToBase64`) | `CreateContractSubmit.tsx` |
| `src/lib/api.ts` (`getAllCompanies`, `checkNIKs`) | `CreateContract.tsx` |

---

## Endpoint API

### Endpoint yang sudah ada (tidak berubah)
| Method | Path | Digunakan untuk |
|--------|------|----------------|
| GET | `/api/admin/companies` | Fetch daftar perusahaan untuk company selector |
| POST | `/api/employees/check-niks` | Validasi NIK saat buat kontrak |
| PATCH | `/api/employees/:nik` | Simpan data karyawan |
| POST | `/api/admin/contracts/approvals/:id/approve` | Approve kontrak |
| POST | `/api/admin/contracts/approvals/:id/reject` | Reject kontrak |

### Endpoint baru (backend harus support)
| Method | Path | Body | Digunakan untuk |
|--------|------|------|----------------|
| POST | `/api/admin/contracts/applications` | `{ company_id, contract_type, start_date, duration_months?, employee_niks?, employee_nik?, file_name, file_content_base64 }` | Admin buat kontrak mandiri |

---

## Verifikasi

| Check | Status |
|-------|--------|
| ESLint (0 errors) | ✅ Pass |
| TypeScript (`tsc -b --noEmit`) | ✅ Pass |
| Production build (`npm run build`) | ✅ Pass |

---

## Catatan Backend

1. Endpoint `POST /api/admin/contracts/applications` harus menerima field `company_id` untuk admin membuat kontrak atas nama perusahaan tertentu.
2. Endpoint approve/reject sudah support upload file — tidak perlu perubahan untuk mendukung format .docx (hanya perubahan di frontend validation).
