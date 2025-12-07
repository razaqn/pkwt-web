export function extractErrorMessage(raw: string): string {
  try {
    const data = JSON.parse(raw);
    const e = data?.errors;
    if (Array.isArray(e)) {
      const msgs = e.map((i: any) => `${i?.path || 'field'}: ${i?.message || 'invalid'}`);
      return msgs.join('\n');
    }
    if (typeof e === 'string') {
      const prefix = 'Validation Error : ';
      if (e.startsWith(prefix)) {
        const json = e.slice(prefix.length);
        try {
          const z = JSON.parse(json);
          if (Array.isArray(z?.issues) && z.issues.length > 0) {
            const msgs = z.issues.map((i: any) => `${i?.path?.[0] ?? 'field'}: ${i?.message ?? 'invalid'}`);
            return msgs.join('\n');
          }
        } catch { }
      }
      return e;
    }
    if (typeof data?.message === 'string') return data.message;
    return raw;
  } catch {
    return raw;
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

  // Return original error if no match
  return error;
}
