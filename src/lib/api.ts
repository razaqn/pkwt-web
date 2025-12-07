import { request } from './http';

// API base already includes the /api prefix. In dev, use the Vite proxy ("/api").
export const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function login(email: string, password: string) {
  return request(`${API_BASE}/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
}
