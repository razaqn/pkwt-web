import { API_BASE } from './api';
import { request } from './http';

export type EmployeeApi = {
    id?: string;
    full_name?: string;
    nik?: string;
    address?: string;
    district?: string;
    village?: string;
    place_of_birth?: string;
    birthdate?: string;
    company_id?: string;
};

export async function checkEmployeesBatch(nikList: string[], token?: string) {
    const resp = await request<{ data?: EmployeeApi[] }>(`${API_BASE}/employees/batch`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ nik_list: nikList }),
    });

    return resp?.data || [];
}
