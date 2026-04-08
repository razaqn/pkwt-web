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
  keterangan?: string;
}

const BPJS_COLUMN_MAPPINGS = {
  nik: ['nik', 'no ktp', 'ktp', 'no. ktp', 'nomor ktp'],
  nama: ['nama', 'nama lengkap', 'nama peserta', 'nama lengkap peserta'],
  tanggal_lahir: ['tanggal lahir', 'tgl lahir', 'tgl. lahir'],
  jenis_kelamin: ['jenis kelamin', 'kelamin', 'jk', 'j. kel'],
  kecamatan: ['kecamatan', 'kec'],
  desa: ['desa', 'kelurahan', 'desa / kelurahan', 'desa/kelurahan'],
  jenis_pekerjaan: ['nama kelompok pekerjaan', 'jenis pekerjaan', 'kelompok pekerjaan', 'pekerjaan'],
  biaya_iuran_apbd: ['biaya iuran yang ditanggung apbd', 'biaya iuran', 'apbd'],
  jenis_kepesertaan: ['jenis kepesertaan', 'kepesertaan'],
  keterangan: ['keterangan', 'ket']
};

function normalizeHeader(header: string): string {
  return header.toString().toLowerCase().trim().replace(/\s+/g, ' ');
}

function findColumnMatcher(headers: string[]): Record<keyof typeof BPJS_COLUMN_MAPPINGS, string | null> {
  const result: Record<string, string | null> = {};
  
  for (const [key, aliases] of Object.entries(BPJS_COLUMN_MAPPINGS)) {
    result[key] = null;
    for (const header of headers) {
      const normalizedHeader = normalizeHeader(header);
      if (aliases.includes(normalizedHeader)) {
        result[key] = header;
        break;
      }
    }
  }
  
  return result as Record<keyof typeof BPJS_COLUMN_MAPPINGS, string | null>;
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

        if (!colMapping.nik || !colMapping.nama) {
          throw new Error('Kolom NIK dan Nama wajib ada dalam file Excel');
        }

        const jsonObjects = XLSX.utils.sheet_to_json(worksheet, { range: headerRowIdx }) as Record<string, any>[];
        
        const result: BpjsExcelRow[] = [];

        for (const row of jsonObjects) {
          const rawNik = colMapping.nik ? row[colMapping.nik] : undefined;
          if (!rawNik) continue; 
          
          let nikStr = String(rawNik).replace(/\s+/g, '');
          
          // Fix scientific notation for NIK if the file isn't formatted properly
          if (typeof rawNik === 'number' && nikStr.includes('e+')) {
              nikStr = BigInt(Math.round(rawNik)).toString();
          }

          if (!/^\d{16}$/.test(nikStr)) continue; // skip bad nik
          
          const nama = colMapping.nama ? String(row[colMapping.nama] || '').trim() : '';
          if (!nama) continue;

          let parsedTanggalLahir: string | undefined = undefined;
          if (colMapping.tanggal_lahir && row[colMapping.tanggal_lahir]) {
            const rawDate = row[colMapping.tanggal_lahir];
            if (rawDate instanceof Date) {
              parsedTanggalLahir = formatDateToYMD(rawDate) || undefined;
            } else if (typeof rawDate === 'number') {
              const excelEpoch = new Date(1899, 11, 30);
              const jsDate = new Date(excelEpoch.getTime() + rawDate * 86400000);
              parsedTanggalLahir = formatDateToYMD(jsDate) || undefined;
            } else {
              try {
                parsedTanggalLahir = formatDateToYMD(String(rawDate)) || undefined;
              } catch (e) {
                // Ignore parsing errors for edgecases
              }
            }
          }

          result.push({
            nik: nikStr,
            nama: nama,
            tanggal_lahir: parsedTanggalLahir,
            jenis_kelamin: colMapping.jenis_kelamin ? String(row[colMapping.jenis_kelamin] || '').trim() : undefined,
            kecamatan: colMapping.kecamatan ? String(row[colMapping.kecamatan] || '').trim() : undefined,
            desa: colMapping.desa ? String(row[colMapping.desa] || '').trim() : undefined,
            jenis_pekerjaan: colMapping.jenis_pekerjaan ? String(row[colMapping.jenis_pekerjaan] || '').trim() : undefined,
            biaya_iuran_apbd: colMapping.biaya_iuran_apbd ? String(row[colMapping.biaya_iuran_apbd] || '').trim() : undefined,
            jenis_kepesertaan: colMapping.jenis_kepesertaan ? String(row[colMapping.jenis_kepesertaan] || '').trim() : undefined,
            keterangan: colMapping.keterangan ? String(row[colMapping.keterangan] || '').trim() : undefined,
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
