type Role = 'candidate' | 'company' | 'super_admin' | 'disnaker';

export function setAuth(token: string, role: Role, companyId?: string) {
  localStorage.setItem('auth_token', token);
  localStorage.setItem('auth_role', role);
  if (companyId) {
    localStorage.setItem('auth_company_id', companyId);
  }
}

export function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function getRole(): Role | null {
  return (localStorage.getItem('auth_role') as Role) || null;
}

export function getCompanyId(): string | null {
  return localStorage.getItem('auth_company_id');
}

export function clearAuth() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_role');
  localStorage.removeItem('auth_company_id');
}
