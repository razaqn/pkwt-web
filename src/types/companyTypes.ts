/**
 * Type definition for Company data
 */
export interface Company {
    id: string;
    name: string;
    address: string;
    city: string;
    district: string;
    subdistrict: string; // Kelurahan
    phone: string;
    website?: string;
    about?: string;
    logo?: string;
    activePkwts: number;
    activePkwtts: number;
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