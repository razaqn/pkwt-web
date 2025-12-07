import { request } from './http';

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function login(email: string, password: string) {
  return request(`${API_BASE}/api/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
}
