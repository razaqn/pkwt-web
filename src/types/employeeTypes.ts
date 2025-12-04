/**
 * Type definition for Employee data
 */
export interface Employee {
    id: string;
    fullName: string;
    nik: string;
    address: string;
    city: string;
    district: string;
    birthPlace: string;
    birthDate: string;
    company: string;
    currentContract: string;
    totalContracts: number;
}

/**
 * Type definition for Contract history
 */
export interface Contract {
    id: string;
    employeeId: string;
    title: string;
    company: string;
    startDate: string;
    duration: string;
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