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
        } catch {}
      }
      return e;
    }
    if (typeof data?.message === 'string') return data.message;
    return raw;
  } catch {
    return raw;
  }
}
