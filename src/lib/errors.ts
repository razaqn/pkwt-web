const FIELD_LABELS: Record<string, string> = {
  niks: 'NIK karyawan',
  employee_niks: 'NIK karyawan',
  nik: 'NIK',
  start_date: 'Tanggal mulai',
  duration_months: 'Durasi kontrak (bulan)',
  contract_type: 'Jenis kontrak',
  file_content_base64: 'File kontrak',
  file_name: 'Nama file kontrak',
  full_name: 'Nama lengkap',
  address: 'Alamat',
  district: 'Kecamatan',
  village: 'Kelurahan/Desa',
  place_of_birth: 'Tempat lahir',
  birthdate: 'Tanggal lahir',
  ktp_file_content_base64: 'File KTP',
  ktp_file_name: 'Nama file KTP',
};

function formatFieldLabel(path: string | number | Array<string | number> | undefined): string {
  if (path === undefined || path === null) return 'Kolom ini';
  const segments = Array.isArray(path) ? path : String(path).split('.');
  const [first, second] = segments;
  const baseKey = typeof first === 'number' ? String(first) : String(first || '').trim();
  const baseLabel = FIELD_LABELS[baseKey] || baseKey.replace(/_/g, ' ').trim() || 'Kolom ini';

  if (typeof second === 'number' || (typeof second === 'string' && /^\d+$/.test(second))) {
    const idx = Number(second);
    return `${baseLabel} ke-${idx + 1}`;
  }

  return baseLabel;
}

function simplifyMessage(message: string, label: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('^[0-9]{16}') || lower.includes('must match pattern') || lower.includes('16')) {
    return `${label} harus terdiri dari 16 digit angka.`;
  }

  if (lower.includes('required') || lower.includes('wajib') || lower.includes('must be non-empty')) {
    return `${label} wajib diisi.`;
  }

  if (lower.includes('invalid') || lower.includes('not valid')) {
    return `${label} tidak valid.`;
  }

  if (lower.includes('greater than') || lower.includes('less than')) {
    return `${label} belum sesuai.`;
  }

  return `${label}: ${message}`;
}

function formatIssue(path: any, message: string | undefined): string {
  const label = formatFieldLabel(path);
  if (!message || !message.trim()) return `${label} belum sesuai.`;
  return simplifyMessage(message.trim(), label);
}

function formatRawLine(raw: string): string {
  if (raw.includes(':')) {
    const [pathPart, ...rest] = raw.split(':');
    const msgPart = rest.join(':').trim();
    return formatIssue(pathPart.trim(), msgPart);
  }
  if (raw.includes('^[0-9]{16}')) {
    return 'NIK harus terdiri dari 16 digit angka.';
  }
  return raw;
}

export function extractErrorMessage(raw: string): string {
  try {
    const data = JSON.parse(raw);
    const e = data?.errors;
    if (Array.isArray(e)) {
      const msgs = e.map((i: any) => formatIssue(i?.path, i?.message));
      return msgs.join('\n');
    }
    if (typeof e === 'string') {
      const prefix = 'Validation Error : ';
      if (e.startsWith(prefix)) {
        const json = e.slice(prefix.length);
        try {
          const z = JSON.parse(json);
          if (Array.isArray(z?.issues) && z.issues.length > 0) {
            const msgs = z.issues.map((i: any) => formatIssue(i?.path, i?.message));
            return msgs.join('\n');
          }
        } catch {
          // Ignore invalid embedded JSON in validation error string.
        }
      }
      return formatRawLine(e);
    }
    if (typeof data?.message === 'string') return formatRawLine(data.message);
    return formatRawLine(raw);
  } catch {
    return formatRawLine(raw);
  }
}

/**
 * Convert technical error messages to user-friendly messages
 * Handles database errors, collation mismatches, and other backend errors
 */
export function getUserFriendlyErrorMessage(error: string): string {
  // Database collation errors (MySQL)
  if (error.includes('Illegal mix of collations')) {
    return 'Terjadi kesalahan saat mengakses data. Silakan coba beberapa saat lagi.';
  }

  // Network timeouts
  if (error.includes('timeout') || error.includes('timed out')) {
    return 'Koneksi timeout. Silakan periksa koneksi internet Anda.';
  }

  // 500 Internal Server Error
  if (error.includes('500') || error.includes('Internal Server Error')) {
    return 'Terjadi kesalahan server. Tim teknis kami sedang menangani masalah ini.';
  }

  // 403 Forbidden
  if (error.includes('403') || error.includes('Forbidden')) {
    return 'Anda tidak memiliki akses ke resource ini.';
  }

  // 404 Not Found
  if (error.includes('404') || error.includes('Not Found')) {
    return 'Data yang dicari tidak ditemukan.';
  }

  // Return formatted error if no match
  return formatRawLine(error);
}

export function toUserMessage(err: unknown, fallback = 'Terjadi kesalahan. Silakan coba lagi.'): string {
  const raw = typeof err === 'string' ? err : (err as any)?.message;
  if (typeof raw === 'string' && raw.trim()) {
    return getUserFriendlyErrorMessage(raw.trim());
  }
  return fallback;
}
