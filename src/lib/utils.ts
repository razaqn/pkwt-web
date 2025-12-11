// Utility functions for common tasks

/**
 * Convert File to base64 string
 * @param file - File object to convert
 * @returns Promise<string> - Base64 encoded string (without data URL prefix)
 */
export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Remove data URL prefix (e.g., "data:application/pdf;base64,")
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
        };
        reader.onerror = (error) => reject(error);
    });
}

/**
 * Map API employee data (snake_case) to frontend format (camelCase)
 */
export interface NIKCheckResult {
    nik: string;
    full_name: string | null;
    address: string | null;
    district: string | null;
    village: string | null;
    place_of_birth: string | null;
    birthdate: string | null;
    ktp_file_url: string | null;
    is_complete: boolean;
}

export interface NIKData {
    nik: string;
    fullName: string | null;
    address: string | null;
    district: string | null;
    village: string | null;
    placeOfBirth: string | null;
    birthdate: string | null;
    ktpFileUrl: string | null; // URL to KTP image
    isComplete: boolean;
}

/**
 * Convert API NIK result to frontend NIKData format
 */
export function mapNIKResultToData(result: NIKCheckResult): NIKData {
    return {
        nik: result.nik,
        fullName: result.full_name,
        address: result.address,
        district: result.district,
        village: result.village,
        placeOfBirth: result.place_of_birth,
        birthdate: result.birthdate,
        ktpFileUrl: result.ktp_file_url,
        isComplete: result.is_complete,
    };
}

/**
 * Convert employee data from API response to NIKData format
 */
export interface EmployeeDataResponse {
    id: string;
    nik: string;
    full_name: string;
    address: string;
    district: string;
    village: string;
    place_of_birth: string;
    birthdate: string;
    ktp_file_url: string | null;
    company_id: string;
}

export function mapEmployeeResponseToData(data: EmployeeDataResponse): Omit<NIKData, 'nik'> {
    return {
        fullName: data.full_name,
        address: data.address,
        district: data.district,
        village: data.village,
        placeOfBirth: data.place_of_birth,
        birthdate: data.birthdate,
        ktpFileUrl: data.ktp_file_url,
        isComplete: true,
    };
}

/**
 * Format timestamp into relative time in Bahasa Indonesia
 */
export function formatRelativeTime(input: string | number | Date): string {
    const date = new Date(input);
    const now = new Date();

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));

    if (diffSeconds < 60) return 'Baru saja';

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes} menit lalu`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Kemarin';
    return `${diffDays} hari lalu`;
}

/**
 * Build countdown label and color class for contract expiry
 * Backend sends contracts with days_until_expiry between -3 and 30
 */
export function getCountdownStatus(daysUntilExpiry: number): { label: string; colorClass: string } {
    const abs = Math.abs(daysUntilExpiry);

    let label = '';
    if (daysUntilExpiry < 0) {
        label = abs === 1 ? 'Lewat 1 hari' : `Lewat ${abs} hari`;
    } else if (daysUntilExpiry === 0) {
        label = 'Hari ini';
    } else if (daysUntilExpiry === 1) {
        label = 'Besok';
    } else {
        label = `${daysUntilExpiry} hari lagi`;
    }

    // Color logic: red for expired, yellow for ≤7 days, amber for 8-14, slate for >14
    let colorClass = 'text-slate-600';
    if (daysUntilExpiry < 0) {
        colorClass = 'text-red-600';
    } else if (daysUntilExpiry <= 7) {
        colorClass = 'text-yellow-600';
    } else if (daysUntilExpiry <= 14) {
        colorClass = 'text-amber-600';
    }

    return { label, colorClass };
}
