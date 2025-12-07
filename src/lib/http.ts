import { extractErrorMessage } from './errors';

export async function request<T = any>(url: string, init?: RequestInit): Promise<T> {
  // Ambil token dari localStorage
  const token = localStorage.getItem('auth_token');
  
  // Siapkan headers
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Gabungkan headers dengan init yang ada
  const config: RequestInit = {
    ...init,
    headers,
  };
  
  const res = await fetch(url, config);
  if (res.ok) return res.json() as Promise<T>;
  
  const text = await res.text();
  const msg = extractErrorMessage(text);
  throw new Error(msg);
}
