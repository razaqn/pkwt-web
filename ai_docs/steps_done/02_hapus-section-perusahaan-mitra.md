# 02 — Hapus Section Perusahaan Mitra (Landing Page & Admin Config)

Tanggal: 2026-03-26

## Ringkasan

Menghapus section "Perusahaan Mitra" (Partner Logos) dari landing page publik dan menghapus tab konfigurasinya dari admin landing config.

---

## File yang Dimodifikasi (2 file)

### 1. `src/pages/public/Home.tsx`

**Yang dihapus:**

- **Komponen `Marquee`** (baris 25-36 sebelumnya) — Komponen wrapper animasi marquee yang hanya digunakan oleh section partners. Tidak digunakan di tempat lain.

- **Import `ReactNode`** — `import type { ReactNode } from 'react'` dihapus karena `ReactNode` hanya dipakai oleh komponen `Marquee` yang sudah dihapus.

- **Variabel `partnersEnabled` dan `partnerItems`** — Variabel state untuk mengontrol tampilan section partners:
  ```tsx
  const partnersEnabled = Boolean(config?.partners?.enabled);
  const partnerItems = (config?.partners?.items || [])
      .filter((x) => x && x.enabled)
      .slice()
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  ```

- **Block JSX section partners** — Seluruh section `{/* (6) Partner logos running images */}` yang menampilkan:
  - Judul "Partners" / "Mitra Kami"
  - Marquee dengan logo-logo perusahaan mitra
  - Fallback pesan "Belum ada logo mitra yang ditampilkan"

**Yang tidak dihapus:**
- Import `resolveUploadUrl` tetap dipertahankan karena masih digunakan untuk gambar ucapan di section lain.

### 2. `src/pages/admin/LandingConfig.tsx`

**Yang dihapus:**

- **Import `PartnersConfig`** — `import PartnersConfig from '../../components/landing-config/PartnersConfig'`

- **Tab `'partners'`** dari `TabType` union type:
  ```tsx
  // Sebelum
  type TabType = 'running-text' | 'ucapan' | 'partners' | 'faq' | 'contact';
  // Sesudah
  type TabType = 'running-text' | 'ucapan' | 'faq' | 'contact';
  ```

- **Entry `{ id: 'partners', label: 'Partner Logos' }`** dari array `TABS`

- **Destructuring `uploadPartner`** dari `useLandingConfig()` hook:
  ```tsx
  // Sebelum
  const { config, setConfig, loading, error, saving, saveConfig, uploadPartner, uploadUcapanImage } = useLandingConfig();
  // Sesudah
  const { config, setConfig, loading, error, saving, saveConfig, uploadUcapanImage } = useLandingConfig();
  ```

- **Render block `<PartnersConfig>`** — Seluruh conditional render untuk tab partners:
  ```tsx
  {activeTab === 'partners' && (
      <PartnersConfig config={config} onChange={setConfig} onUpload={uploadPartner} />
  )}
  ```

---

## File yang Tidak Berubah (tidak dihapus)

| File | Keterangan |
|------|------------|
| `src/components/landing-config/PartnersConfig.tsx` | Komponen masih ada di filesystem, tapi tidak lagi di-import atau di-render. Bisa dihapus jika tidak dibutuhkan. |

---

## File yang Dihapus

Tidak ada.

---

## Verifikasi

| Check | Status |
|-------|--------|
| ESLint (0 errors) | ✅ Pass |
| TypeScript (`tsc -b --noEmit`) | ✅ Pass |

---

## Catatan

- Data konfigurasi `partners` di backend/database **tidak dihapus** — hanya tidak ditampilkan di frontend. Jika backend masih menyimpan data `partners` di konfigurasi landing, data tersebut akan diabaikan oleh frontend.
- Jika di masa depan ingin mengembalikan section ini, cukup revert perubahan pada kedua file di atas dan pastikan `PartnersConfig.tsx` masih ada.
