import { request } from './http';

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Auth types
export interface LoginResponse {
  ok: boolean;
  message: string;
  id: string;
  role: 'candidate' | 'company' | 'super_admin' | 'disnaker';
  token: string;
  company_id?: string; // Only present for company role
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  return request(`${API_BASE}/api/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
}

// Employee types
export interface LatestContract {
  id: string;
  title: string;
  start_date: string; // YYYY-MM-DD
  duration_months: number | null;
  contract_type: 'PKWT' | 'PKWTT';
  file_id: string | null;
  company_name: string;
}

export interface Employee {
  id: string;
  full_name: string;
  nik: string;
  company_id: string;
  current_contract_id: string | null;
  latest_contract: LatestContract;
}

export interface GetEmployeesByContractResponse {
  data: Employee[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface GetEmployeesByContractParams {
  company_id: string;
  contract_type: 'PKWT' | 'PKWTT';
  approved?: boolean;
  limit?: number;
  offset?: number;
}

// Get employees by contract type (PKWT or PKWTT)
export async function getEmployeesByContract(
  params: GetEmployeesByContractParams
): Promise<GetEmployeesByContractResponse> {
  const queryParams = new URLSearchParams();
  queryParams.append('company_id', params.company_id);
  queryParams.append('contract_type', params.contract_type);
  if (params.approved !== undefined) {
    queryParams.append('approved', String(params.approved));
  }
  if (params.limit !== undefined) {
    queryParams.append('limit', String(params.limit));
  }
  if (params.offset !== undefined) {
    queryParams.append('offset', String(params.offset));
  }

  return request(
    `${API_BASE}/api/employees/by-contract?${queryParams.toString()}`
  );
}