import * as XLSX from 'xlsx';
import { formatDateToYMD } from './date';

export interface BpjsExcelRow {
  nik: string;
  nama: string;
  tanggal_lahir?: string;
  jenis_kelamin?: string;
  kecamatan?: string;
  desa?: string;
  jenis_pekerjaan?: string;
  biaya_iuran_apbd?: string;
  jenis_kepesertaan?: string;
  status_kepesertaan?: string;
  keterangan?: string;
}

const BPJS_COLUMN_MAPPINGS = {
  nik: ['nik', 'no ktp', 'ktp', 'no. ktp', 'nomor ktp'],
  nama: ['nama', 'nama lengkap', 'nama peserta', 'nama lengkap peserta'],
  tanggal_lahir: ['tanggal lahir', 'tgl lahir', 'tgl. lahir'],
  jenis_kelamin: ['jenis kelamin', 'kelamin', 'jk', 'j. kel'],
  kecamatan: ['kecamatan', 'kec'],
  desa: ['desa', 'kelurahan', 'desa / kelurahan', 'desa/kelurahan'],
  jenis_pekerjaan: ['nama kelompok pekerjaan/ jenis pekerjaan', 'nama kelompok pekerjaan / jenis pekerjaan', 'nama kelompok pekerjaan', 'jenis pekerjaan', 'kelompok pekerjaan', 'pekerjaan'],
  biaya_iuran_apbd: ['biaya iuran yang ditanggung apbd', 'biaya iuran', 'apbd'],
  jenis_kepesertaan: ['jenis kepesertaan'],
  status_kepesertaan: ['status kepesertaan', 'status'],
  keterangan: ['keterangan', 'ket']
};

function normalizeHeader(header: string): string {
  return header.toString().toLowerCase().trim().replace(/\s+/g, ' ');
}

function findColumnMatcher(headers: string[]): Record<keyof typeof BPJS_COLUMN_MAPPINGS, number | null> {
  const result: Record<string, number | null> = {};

  for (const [key, aliases] of Object.entries(BPJS_COLUMN_MAPPINGS)) {
    result[key] = null;
    for (let i = 0; i < headers.length; i++) {
      const normalizedHeader = normalizeHeader(headers[i]);
      if (aliases.includes(normalizedHeader)) {
        result[key] = i; // Return column index, not header name
        break;
      }
    }
  }

  return result as Record<keyof typeof BPJS_COLUMN_MAPPINGS, number | null>;
}

function getCellValue(row: any[], colIndex: number | null): any {
  if (colIndex === null || colIndex >= row.length) return undefined;
  return row[colIndex];
}

export async function parseBPJSExcelFile(file: File): Promise<BpjsExcelRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });

        if (workbook.SheetNames.length === 0) {
          throw new Error('File Excel kosong');
        }

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Read as 2D array for reliable column access
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        if (rawData.length < 2) {
          throw new Error('Data tidak ditemukan dalam file Excel');
        }

        let headerRowIdx = -1;
        let headers: string[] = [];

        for (let i = 0; i < Math.min(10, rawData.length); i++) {
          const row = rawData[i];
          if (!row || !Array.isArray(row)) continue;

          const rowStrings = row.map(cell => cell ? String(cell).toLowerCase().trim() : '');
          if (rowStrings.some(s => s === 'nik' || s === 'nama' || s === 'nama lengkap')) {
            headerRowIdx = i;
            headers = row.map(h => h ? String(h).trim() : '');
            break;
          }
        }

        if (headerRowIdx === -1) {
          throw new Error('Tidak dapat menemukan baris header (harus ada kolom NIK dan Nama)');
        }

        const colMapping = findColumnMatcher(headers);

        if (colMapping.nik === null || colMapping.nama === null) {
          throw new Error('Kolom NIK dan Nama wajib ada dalam file Excel');
        }

        const result: BpjsExcelRow[] = [];

        // Process data rows (skip header row)
        for (let i = headerRowIdx + 1; i < rawData.length; i++) {
          const row = rawData[i];
          if (!row || !Array.isArray(row)) continue;

          // Get NIK value
          const rawNik = getCellValue(row, colMapping.nik);
          if (!rawNik) continue;

          let nikStr = String(rawNik).replace(/\s+/g, '');

          // Fix scientific notation for NIK if the file isn't formatted properly
          if (typeof rawNik === 'number' && nikStr.includes('e+')) {
            nikStr = BigInt(Math.round(rawNik)).toString();
          }

          if (!/^\d{16}$/.test(nikStr)) continue; // skip bad nik

          const nama = getCellValue(row, colMapping.nama);
          const namaStr = nama ? String(nama).trim() : '';
          if (!namaStr) continue;

          let parsedTanggalLahir: string | undefined = undefined;
          if (colMapping.tanggal_lahir !== null) {
            const rawDate = getCellValue(row, colMapping.tanggal_lahir);
            if (rawDate) {
              if (rawDate instanceof Date) {
                const year = rawDate.getUTCFullYear();
                const month = String(rawDate.getUTCMonth() + 1).padStart(2, '0');
                const day = String(rawDate.getUTCDate()).padStart(2, '0');
                parsedTanggalLahir = `${year}-${month}-${day}`;
              } else if (typeof rawDate === 'number') {
                // Excel serial date number - convert to JS Date
                const excelEpoch = new Date(Date.UTC(1899, 11, 30));
                const totalDays = Math.floor(rawDate);
                const jsDate = new Date(excelEpoch.getTime() + totalDays * 86400000);
                const year = jsDate.getUTCFullYear();
                const month = String(jsDate.getUTCMonth() + 1).padStart(2, '0');
                const day = String(jsDate.getUTCDate()).padStart(2, '0');
                parsedTanggalLahir = `${year}-${month}-${day}`;
              } else {
                try {
                  parsedTanggalLahir = formatDateToYMD(String(rawDate).trim()) || undefined;
                } catch (e) {
                  // Ignore parsing errors for edgecases
                }
              }
            }
          }

          let jkObj = colMapping.jenis_kelamin !== null ? String(getCellValue(row, colMapping.jenis_kelamin) || '').trim() : '';
          if (jkObj) {
            const jkLower = jkObj.toLowerCase();
            if (['laki-laki', 'laki laki', 'lakilaki', 'l', 'pria', 'lk'].includes(jkLower)) {
              jkObj = 'Laki-laki';
            } else if (['perempuan', 'wanita', 'p', 'w', 'pr'].includes(jkLower)) {
              jkObj = 'Perempuan';
            }
          }

          result.push({
            nik: nikStr,
            nama: namaStr,
            tanggal_lahir: parsedTanggalLahir,
            jenis_kelamin: jkObj || undefined,
            kecamatan: colMapping.kecamatan !== null ? String(getCellValue(row, colMapping.kecamatan) || '').trim() : undefined,
            desa: colMapping.desa !== null ? String(getCellValue(row, colMapping.desa) || '').trim() : undefined,
            jenis_pekerjaan: colMapping.jenis_pekerjaan !== null ? String(getCellValue(row, colMapping.jenis_pekerjaan) || '').trim() : undefined,
            biaya_iuran_apbd: colMapping.biaya_iuran_apbd !== null ? String(getCellValue(row, colMapping.biaya_iuran_apbd) || '').trim() : undefined,
            jenis_kepesertaan: colMapping.jenis_kepesertaan !== null ? String(getCellValue(row, colMapping.jenis_kepesertaan) || '').trim() : undefined,
            status_kepesertaan: colMapping.status_kepesertaan !== null ? String(getCellValue(row, colMapping.status_kepesertaan) || '').trim() : undefined,
            keterangan: colMapping.keterangan !== null ? String(getCellValue(row, colMapping.keterangan) || '').trim() : undefined,
          });
        }

        resolve(result);
      } catch (error: any) {
        reject(new Error(`Gagal memproses file Excel: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Gagal membaca file'));
    };

    reader.readAsArrayBuffer(file);
  });
}
