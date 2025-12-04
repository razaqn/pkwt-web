type Role = 'candidate' | 'company' | 'super_admin' | 'disnaker';

export function setAuth(token: string, role: Role) {
  localStorage.setItem('auth_token', token);
  localStorage.setItem('auth_role', role);
}

export function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function getRole(): Role | null {
  return (localStorage.getItem('auth_role') as Role) || null;
}

export function clearAuth() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_role');
}
