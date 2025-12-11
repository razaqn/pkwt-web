import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkNIKs, saveEmployeeData, submitContractApplication, saveDraftContract, type SaveDraftRequest } from '../lib/api';
import { fileToBase64, mapNIKResultToData, mapEmployeeResponseToData, type NIKData } from '../lib/utils';
import type { KelengkapanDataForm } from '../components/ModalKelengkapanData';

type ContractType = 'PKWT' | 'PKWTT';
type ContractStatus = 'draft' | 'pending' | 'rejected' | 'approved' | null;

interface ContractData {
    contractType: ContractType;
    niks: string[];
    startDate: string;
    duration: number | null;
    fileKontrak?: File | null;
    importedData?: Record<string, any>; // NIK -> imported Excel data mapping
    draftId?: string; // For updating existing draft
}

/**
 * Custom hook for managing contract submission flow
 * - Fetches NIK data from backend
 * - Handles employee data completion
 * - Submits contract application
 */
export function useContractSubmission(contractData: ContractData | null) {
    const navigate = useNavigate();

    const [nikDataList, setNikDataList] = useState<NIKData[]>([]);
    const [contractStatus, setContractStatus] = useState<ContractStatus>(null);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch NIK data on mount
    useEffect(() => {
        if (!contractData) {
            navigate('/form-kontrak', { replace: true });
            return;
        }

        async function fetchNIKData() {
            if (!contractData) return;

            setLoading(true);
            setError(null);

            try {
                const response = await checkNIKs(contractData.niks);

                // Map backend data
                const nikData = response.data.map(result => {
                    const backendData = mapNIKResultToData(result);

                    // Merge with imported data (backend wins, Excel supplements empty fields)
                    if (contractData.importedData && contractData.importedData[result.nik]) {
                        const imported = contractData.importedData[result.nik];

                        return {
                            ...backendData,
                            // Use imported data only if backend field is null
                            fullName: backendData.fullName || imported.fullName || null,
                            address: backendData.address || imported.address || null,
                            district: backendData.district || imported.district || null,
                            village: backendData.village || imported.village || null,
                            placeOfBirth: backendData.placeOfBirth || imported.placeOfBirth || null,
                            birthdate: backendData.birthdate || imported.birthdate || null,
                        };
                    }

                    return backendData;
                });

                setNikDataList(nikData);
            } catch (err: any) {
                setError(err?.message || 'Gagal mengecek data NIK');
                console.error('Error fetching NIK data:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchNIKData();
    }, [contractData, navigate]);

    // Save employee data
    const saveNIKData = useCallback(async (nik: string, formData: KelengkapanDataForm) => {
        setLoading(true);
        setError(null);

        try {
            const response = await saveEmployeeData(nik, {
                full_name: formData.fullName,
                address: formData.address,
                district: formData.district,
                village: formData.village,
                place_of_birth: formData.placeOfBirth,
                birthdate: formData.birthdate,
            });

            // Update local state with saved data
            setNikDataList(prev =>
                prev.map(item =>
                    item.nik === nik
                        ? { nik, ...mapEmployeeResponseToData(response.data) }
                        : item
                )
            );

            return true;
        } catch (err: any) {
            setError(err?.message || 'Gagal menyimpan data');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    // Save draft contract
    const saveDraft = useCallback(async () => {
        if (!contractData) return null;

        setError(null);

        try {
            const draftPayload: SaveDraftRequest = {
                contract_type: contractData.contractType,
                start_date: contractData.startDate,
                duration_months: contractData.duration || 0,
                employee_niks: contractData.niks,
            };

            const response = await saveDraftContract(draftPayload);
            return response.data.id; // Return draft ID for subsequent saves
        } catch (err: any) {
            setError(err?.message || 'Gagal menyimpan draf');
            return null;
        }
    }, [contractData]);

    // Submit contract application
    const submitContract = useCallback(async (pkwtFile?: File | null) => {
        if (!contractData) return false;

        const allComplete = nikDataList.every(data => data.isComplete);
        if (!allComplete) {
            setError('Harap lengkapi semua data NIK terlebih dahulu');
            return false;
        }

        setSubmitLoading(true);
        setError(null);

        try {
            if (contractData.contractType === 'PKWT') {
                // PKWT: Multiple contracts with file
                if (!pkwtFile) {
                    throw new Error('File kontrak harus diunggah untuk PKWT');
                }

                const fileBase64 = await fileToBase64(pkwtFile);

                const payload = {
                    contract_type: 'PKWT' as const,
                    start_date: contractData.startDate,
                    duration_months: contractData.duration || 0,
                    employee_niks: contractData.niks,
                    file_name: pkwtFile.name,
                    file_content_base64: fileBase64,
                };
                const response = await submitContractApplication(payload);

                if ('contract_ids' in response.data) {
                    console.log('PKWT contracts created:', response.data.contract_ids);
                }
            } else {
                // PKWTT: Single contract with file
                if (!contractData.fileKontrak) {
                    throw new Error('File kontrak wajib diisi untuk PKWTT');
                }

                const fileBase64 = await fileToBase64(contractData.fileKontrak);

                const payload = {
                    contract_type: 'PKWTT' as const,
                    start_date: contractData.startDate,
                    employee_nik: contractData.niks[0],
                    file_name: contractData.fileKontrak.name,
                    file_content_base64: fileBase64,
                };
                const response = await submitContractApplication(payload);

                if ('contract_id' in response.data) {
                    console.log('PKWTT contract created:', response.data.contract_id);
                }
            }

            setContractStatus('pending');

            // Navigate after short delay to show success message
            setTimeout(() => {
                navigate('/list-karyawan');
            }, 1500);

            return true;
        } catch (err: any) {
            setError(err?.message || 'Gagal mengirim pengajuan');
            return false;
        } finally {
            setSubmitLoading(false);
        }
    }, [contractData, nikDataList, navigate]);

    return {
        nikDataList,
        contractStatus,
        loading,
        submitLoading,
        error,
        saveNIKData,
        submitContract,
        saveDraft,
        allDataComplete: nikDataList.every(data => data.isComplete),
    };
}
