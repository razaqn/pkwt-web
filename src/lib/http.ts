import { extractErrorMessage } from './errors';
import { getToken } from '../store/auth';

export async function request<T = any>(url: string, init?: RequestInit): Promise<T> {
  const token = getToken();

  // Merge headers with Authorization if token exists
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...init,
    headers,
  });

  if (res.ok) return res.json() as Promise<T>;

  const text = await res.text();
  const msg = extractErrorMessage(text);
  throw new Error(msg);
}
