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
  address: string | null;
  district: string | null;
  village: string | null;
  place_of_birth: string | null;
  birthdate: string | null; // YYYY-MM-DD
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

// Admin-wide employee listing (no company_id filter)
export interface GetAllEmployeesParams {
  contract_type: 'PKWT' | 'PKWTT';
  approved?: boolean;
  limit?: number;
  offset?: number;
}

export async function getAllEmployeesByContract(
  params: GetAllEmployeesParams
): Promise<GetEmployeesByContractResponse> {
  const queryParams = new URLSearchParams();
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
    `${API_BASE}/api/admin/employees/by-contract?${queryParams.toString()}`
  );
}

// Employee Detail types
export interface Contract {
  id: string;
  title: string;
  start_date: string | null; // YYYY-MM-DD
  duration_months: number | null;
  contract_type: 'PKWT' | 'PKWTT';
  file_id: string | null;
  company_name: string; // Company name for contract history
}

export interface EmployeeDetail {
  id: string;
  full_name: string;
  nik: string;
  address: string | null;
  district: string | null;
  village: string | null;
  place_of_birth: string | null;
  birthdate: string | null; // YYYY-MM-DD
  birthdate_formatted: string | null; // e.g., "15 Januari 1990"
  company_id: string;
  current_contract_id: string | null;
  contracts: Contract[];
}

export interface GetEmployeeDetailResponse {
  data: EmployeeDetail;
}

// Get employee detail by ID
export async function getEmployeeDetail(
  employeeId: string
): Promise<GetEmployeeDetailResponse> {
  return request(`${API_BASE}/api/employees/${employeeId}/detail`);
}

// Check NIK Existence types
export interface NIKCheckResult {
  nik: string;
  exists: boolean;
  full_name: string | null;
  address: string | null;
  district: string | null;
  village: string | null;
  place_of_birth: string | null;
  birthdate: string | null; // YYYY-MM-DD
  ktp_file_url: string | null; // URL to uploaded KTP image
  is_complete: boolean;
}

export interface CheckNIKsResponse {
  ok: boolean;
  data: NIKCheckResult[];
}

// Check NIK existence (batch)
export async function checkNIKs(niks: string[]): Promise<CheckNIKsResponse> {
  return request(`${API_BASE}/api/employees/check-niks`, {
    method: 'POST',
    body: JSON.stringify({ niks })
  });
}

// Save/Update Employee Data types
export interface SaveEmployeeDataRequest {
  full_name: string;
  address: string;
  district: string;
  village: string;
  place_of_birth: string;
  birthdate: string; // YYYY-MM-DD
  ktp_file_name?: string; // Optional: filename of KTP image
  ktp_file_content_base64?: string; // Optional: base64 encoded image (jpg/jpeg/png, max 5MB)
}

export interface SaveEmployeeDataResponse {
  message: string; // "Employee updated" or "Employee created"
  data: {
    id: string;
    nik: string;
    full_name: string;
    address: string;
    district: string;
    village: string;
    place_of_birth: string;
    birthdate: string;
    ktp_file_url: string | null; // URL to uploaded KTP
    company_id: string;
    created_at?: string; // timestamp
    updated_at?: string; // timestamp
  };
}

// Save or update employee data by NIK
export async function saveEmployeeData(
  nik: string,
  data: SaveEmployeeDataRequest
): Promise<SaveEmployeeDataResponse> {
  return request(`${API_BASE}/api/employees/${nik}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

// Contract Application types
export interface ContractApplicationPKWTRequest {
  contract_type: 'PKWT';
  start_date: string; // YYYY-MM-DD
  duration_months: number;
  employee_niks: string[];
}

export interface ContractApplicationPKWTTRequest {
  contract_type: 'PKWTT';
  start_date: string; // YYYY-MM-DD
  employee_nik: string;
  file_name: string;
  file_content_base64: string;
}

export interface ContractApplicationPKWTResponse {
  ok: boolean;
  message: string;
  data: {
    contract_ids: string[];
    contract_type: 'PKWT';
    start_date: string;
    duration_months: number;
    status: string;
    employee_count: number;
    submitted_at: string;
    company_id: string;
  };
}

export interface ContractApplicationPKWTTResponse {
  ok: boolean;
  message: string;
  data: {
    contract_id: string;
    contract_type: 'PKWTT';
    start_date: string;
    duration_months: null;
    status: string;
    employee_count: number;
    submitted_at: string;
    company_id: string;
  };
}

// Submit contract application (PKWT or PKWTT)
export async function submitContractApplication(
  data: ContractApplicationPKWTRequest | ContractApplicationPKWTTRequest
): Promise<ContractApplicationPKWTResponse | ContractApplicationPKWTTResponse> {
  return request(`${API_BASE}/api/contracts/applications`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

// Draft Contract types
export interface SaveDraftRequest {
  contract_type: 'PKWT' | 'PKWTT';
  start_date: string; // YYYY-MM-DD
  duration_months: number | null;
  employee_niks: string[]; // Array of NIKs
}

export interface SaveDraftResponse {
  ok: boolean;
  message: string;
  data: {
    id: string; // Draft contract ID
    contract_type: 'PKWT' | 'PKWTT';
    start_date: string;
    duration_months: number | null;
    employee_count: number;
    employee_niks: string[];
    is_draft: true;
  };
}

export interface DraftContractDetail {
  id: string;
  contract_type: 'PKWT' | 'PKWTT';
  start_date: string;
  duration_months: number | null;
  employee_niks: string[];
}

// Save or update draft contract
export async function saveDraftContract(data: SaveDraftRequest): Promise<SaveDraftResponse> {
  return request(`${API_BASE}/api/contracts/drafts`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

// Get draft contract detail
export async function getDraftContractDetail(draftId: string): Promise<{ ok: boolean; data: DraftContractDetail }> {
  return request(`${API_BASE}/api/contracts/drafts/${draftId}`);
}

// Delete draft contract
export async function deleteDraftContract(draftId: string): Promise<{ ok: boolean; message: string }> {
  return request(`${API_BASE}/api/contracts/drafts/${draftId}`, {
    method: 'DELETE'
  });
}

// Contract Application Status Monitoring types
export interface ContractApplicationBatch {
  id: string;
  title: string; // e.g., "PKWT-001 (3 Karyawan)" - pre-formatted from backend
  start_date: string; // YYYY-MM-DD
  duration_months: number | null;
  contract_type: 'PKWT' | 'PKWTT';
  approval_status: 'PENDING' | 'REJECTED' | 'APPROVED' | null; // null for drafts
  employee_count: number; // For batch display
  is_draft?: boolean; // Indicates if this is a draft
}

export interface GetContractApplicationsParams {
  company_id: string;
  limit?: number; // Default 7
  offset?: number; // Default 0
  approval_status?: 'PENDING' | 'REJECTED' | 'APPROVED' | null; // Optional filter
  is_draft?: boolean; // Optional: filter drafts only
}

export interface GetContractApplicationsResponse {
  ok: boolean;
  data: ContractApplicationBatch[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

// Get grouped contract applications with pagination and status filter
export async function getContractApplications(
  params: GetContractApplicationsParams
): Promise<GetContractApplicationsResponse> {
  const queryParams = new URLSearchParams();
  queryParams.append('company_id', params.company_id);
  if (params.limit !== undefined) {
    queryParams.append('limit', String(params.limit));
  }
  if (params.offset !== undefined) {
    queryParams.append('offset', String(params.offset));
  }
  if (params.approval_status !== undefined && params.approval_status !== null) {
    queryParams.append('approval_status', params.approval_status);
  }
  if (params.is_draft !== undefined) {
    queryParams.append('is_draft', String(params.is_draft));
  }

  return request(
    `${API_BASE}/api/contracts/applications?${queryParams.toString()}`
  );
}

// Contract Detail types (for monitoring page)
export interface ContractApplicationDetail {
  id: string;
  title: string;
  start_date: string; // YYYY-MM-DD
  duration_months: number | null;
  contract_type: 'PKWT' | 'PKWTT';
  approval_status: 'PENDING' | 'REJECTED' | 'APPROVED';
  admin_comment: string | null; // Admin comment (single text)
}

export interface GetContractApplicationDetailResponse {
  ok: boolean;
  data: ContractApplicationDetail;
}

// Get single contract application detail with admin comment
export async function getContractApplicationDetail(
  contractId: string
): Promise<GetContractApplicationDetailResponse> {
  return request(`${API_BASE}/api/contracts/applications/${contractId}`);
}

// Contract Employees types (for detail page employee table)
export interface ContractEmployee {
  nik: string;
  full_name: string;
  data_complete: boolean; // true = Lengkap, false = Belum Lengkap
}

export interface GetContractEmployeesResponse {
  ok: boolean;
  data: ContractEmployee[];
}

// Get employees in a contract batch
export async function getContractEmployees(
  contractId: string
): Promise<GetContractEmployeesResponse> {
  return request(`${API_BASE}/api/contracts/applications/${contractId}/employees`);
}

// Dashboard summary & notifications types
export interface DashboardNotification {
  id: string;
  contract_id: string;
  status: 'APPROVED' | 'REJECTED';
  title: string;
  updated_at: string;
  is_read: boolean;
}

export interface DashboardExpiringEmployee {
  nik: string;
  name: string;
  end_date: string;
  days_until_expiry: number;
}

export interface DashboardSummary {
  active_employees: {
    pkwt: number;
    pkwtt: number;
    total: number;
  };
  expiring_soon: DashboardExpiringEmployee[];
  notifications: {
    items: DashboardNotification[];
    total_unread: number;
  };
}

export interface DashboardSummaryResponse {
  ok: boolean;
  data: DashboardSummary;
}

export async function getDashboardSummary(): Promise<DashboardSummaryResponse> {
  return request(`${API_BASE}/api/company/dashboard-summary`);
}

export async function markNotificationAsRead(notificationId: string): Promise<{ ok: boolean }> {
  return request(`${API_BASE}/api/company/notifications/${notificationId}/read`, {
    method: 'PATCH'
  });
}

export async function markAllNotificationsAsRead(): Promise<{ ok: boolean }> {
  return request(`${API_BASE}/api/company/notifications/mark-all-read`, {
    method: 'PATCH'
  });
}

// Company Profile types
export interface CompanyProfileData {
  company_name: string;
  phone_number: string;
  active_contracts_pkwt: number;
  active_contracts_pkwtt: number;
  address: string;
  village: string | null;
  district: string | null;
  city: string | null;
  website_url: string | null;
  description: string | null;
}

export interface GetCompanyProfileResponse {
  ok: boolean;
  data: CompanyProfileData;
}

// Get company profile for logged-in user
export async function getCompanyProfile(): Promise<GetCompanyProfileResponse> {
  return request(`${API_BASE}/api/company/profile`);
}

// Company Listing types (Admin)
export interface Company {
  id: string;
  company_name: string;
  phone_number: string;
  address: string;
  village: string | null;
  district: string | null;
  active_contracts_pkwt: number;
  active_contracts_pkwtt: number;
}

export interface GetAllCompaniesParams {
  limit?: number;
  offset?: number;
  search?: string;
}

export interface GetAllCompaniesResponse {
  data: Company[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

// Get all companies (admin only)
export async function getAllCompanies(
  params: GetAllCompaniesParams
): Promise<GetAllCompaniesResponse> {
  const queryParams = new URLSearchParams();
  if (params.limit !== undefined) {
    queryParams.append('limit', String(params.limit));
  }
  if (params.offset !== undefined) {
    queryParams.append('offset', String(params.offset));
  }
  if (params.search !== undefined && params.search.trim()) {
    queryParams.append('search', params.search);
  }

  return request(
    `${API_BASE}/api/admin/companies?${queryParams.toString()}`
  );
}

// Get specific company detail by ID (admin only)
export async function getCompanyDetailById(
  companyId: string
): Promise<GetCompanyProfileResponse> {
  return request(`${API_BASE}/api/admin/companies/${companyId}`);
}