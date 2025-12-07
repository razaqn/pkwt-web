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
        isComplete: true,
    };
}
