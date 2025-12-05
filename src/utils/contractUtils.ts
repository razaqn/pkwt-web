/**
 * Utility functions for contract type detection
 */

/**
 * Determines the contract type from currentContract string
 * @param currentContract - The current contract string (e.g., "PKWT 1 Tahun", "PKWTT")
 * @returns "PKWT" | "PKWTT" | "UNKNOWN"
 */
export function getContractType(currentContract: string): "PKWT" | "PKWTT" | "UNKNOWN" {
    if (currentContract.toUpperCase().includes('PKWT')) {
        return 'PKWT';
    } else if (currentContract.toUpperCase().includes('PKWTT')) {
        return 'PKWTT';
    }
    return 'UNKNOWN';
}

/**
 * Gets the company ID from the logged-in company
 * @returns string - The company ID
 */
export function getCompanyIdFromAuth(): string {
    // In a real application, this would come from auth context
    // For now, we'll simulate based on the company name
    const role = localStorage.getItem('auth_role');
    const companyName = localStorage.getItem('company_name');

    if (role === 'company') {
        // Map company names to IDs based on dummy data
        const companyMap: Record<string, string> = {
            'PT Maju Bersama': '1',
            'PT Sejahtera Abadi': '2',
            'PT Teknologi Canggih': '3'
        };

        return companyMap[companyName || 'PT Maju Bersama'] || '1'; // Default to PT Maju Bersama
    }

    return '1'; // Default for development
}