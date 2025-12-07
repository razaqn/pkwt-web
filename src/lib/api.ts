import { request } from './http';

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function login(email: string, password: string) {
  return request(`${API_BASE}/api/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
}

// Employee API
export async function checkEmployeeByNIK(nik: string) {
  return request(`${API_BASE}/api/employees/check-nik?nik=${nik}`);
}

export async function checkNIKAvailability(nik: string) {
  return request(`${API_BASE}/api/employees/check-nik?nik=${nik}`);
}

export async function checkEmployeesBatch(nikList: string[]) {
  return Promise.all(nikList.map(nik => checkNIKAvailability(nik)));
}

export async function createEmployee(data: {
  full_name: string;
  nik: string;
  address: string;
  district: string;
  village: string;
  place_of_birth: string;
  birthdate: string;
  company_id?: string;
}) {
  return request(`${API_BASE}/api/employees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export async function updateEmployee(id: string, data: {
  full_name?: string;
  nik?: string;
  address?: string;
  district?: string;
  village?: string;
  place_of_birth?: string;
  birthdate?: string;
  company_id?: string;
}) {
  return request(`${API_BASE}/api/employees/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export async function getEmployee(id: string) {
  return request(`${API_BASE}/api/employees/${id}`);
}
