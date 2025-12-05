/**
 * Type definition for Approval data
 */
export interface Approval {
    id: string;
    companyId: string;
    companyName: string;
    employeeCount: number;
    status: 'pending' | 'approved' | 'rejected';
    submissionDate: string;
    pkwtType: 'PKWT' | 'PKWTT';
    contractDuration: string;
    contractFile?: string;
    submissionNotes?: string;
}

/**
 * Type definition for Approval Employee data
 */
export interface ApprovalEmployee {
    id: string;
    approvalId: string;
    employeeId: string;
    fullName: string;
    nik: string;
    birthDate: string;
    previousContracts: number;
    contractTitle: string;
    contractStartDate: string;
    contractDuration: string;
}

/**
 * Type definition for Pagination state
 */
export interface PaginationState {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
}