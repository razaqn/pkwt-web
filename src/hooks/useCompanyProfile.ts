import { useState, useEffect } from 'react';
import { getCompanyProfile } from '../lib/api';
import type { CompanyProfileData } from '../lib/api';

// Frontend interface - maps backend snake_case to camelCase for UI
export interface CompanyProfile {
    // Informasi Dasar
    companyName: string;
    phoneNumber: string;
    activeContractsPKWT: number;
    activeContractsPKWTT: number;

    // Alamat
    address: string;
    village: string | null; // kelurahan
    district: string | null; // kecamatan
    city: string | null;

    // Informasi Digital
    websiteUrl: string | null;

    // Tentang Perusahaan
    description: string | null;
}

// Map backend response to frontend format
function mapProfileData(data: CompanyProfileData): CompanyProfile {
    return {
        companyName: data.company_name,
        phoneNumber: data.phone_number,
        activeContractsPKWT: data.active_contracts_pkwt,
        activeContractsPKWTT: data.active_contracts_pkwtt,
        address: data.address,
        village: data.village,
        district: data.district,
        city: data.city,
        websiteUrl: data.website_url,
        description: data.description
    };
}

export function useCompanyProfile() {
    const [profile, setProfile] = useState<CompanyProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    function refetch() {
        setRefreshKey((k) => k + 1);
    }

    useEffect(() => {
        let isMounted = true;

        async function fetchProfile() {
            try {
                setLoading(true);
                setError(null);

                const response = await getCompanyProfile();

                if (isMounted) {
                    const mappedProfile = mapProfileData(response.data);
                    setProfile(mappedProfile);
                }
            } catch (err: any) {
                if (isMounted) {
                    setError(err?.message || 'Gagal memuat data profil perusahaan');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchProfile();

        return () => {
            isMounted = false;
        };
    }, [refreshKey]);

    return { profile, loading, error, refetch };
}