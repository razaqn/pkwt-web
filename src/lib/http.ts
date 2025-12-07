import { extractErrorMessage } from './errors';

export async function request<T = any>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (res.ok) return res.json() as Promise<T>;
  const text = await res.text();
  const msg = extractErrorMessage(text);
  throw new Error(msg);
}
