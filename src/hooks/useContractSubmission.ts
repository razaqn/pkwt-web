import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkNIKs, saveEmployeeData, submitContractApplication, saveDraftContract, type SaveDraftRequest } from '../lib/api';
import { fileToBase64, mapNIKResultToData, type NIKData } from '../lib/utils';
import { toUserMessage } from '../lib/errors';
import type { KelengkapanDataForm } from '../components/ModalKelengkapanData';

type ContractType = 'PKWT' | 'PKWTT';
type ContractStatus = 'draft' | 'pending' | 'rejected' | 'approved' | null;

interface ContractData {
    contractType: ContractType;
    companyId?: string; // For admin flow
    niks: string[];
    fileSuratPermohonan?: File | null;
    fileDraftPKWT?: File | null;
    importedData?: Record<string, any>;
    draftId?: string;
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
    const [contractStatus, setContractStatus] = useState<ContractStatus>(contractData?.draftId ? 'draft' : null);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch NIK data on mount
    useEffect(() => {
        if (!contractData) {
            navigate('/form-kontrak', { replace: true });
            return;
        }

        let isMounted = true;

        async function fetchNIKData() {
            if (!contractData) return;

            setLoading(true);
            setError(null);

            try {
                const response = await checkNIKs(contractData.niks);

                if (!isMounted) return;

                // Map backend data
                const nikData = response.data.map(result => {
                    const backendData = mapNIKResultToData(result);

                    // Merge with imported data (backend wins, Excel supplements empty fields)
                    if (contractData.importedData && contractData.importedData[result.nik]) {
                        const imported = contractData.importedData[result.nik];

                        return {
                            ...backendData,
                            fullName: backendData.fullName || imported.fullName || null,
                            address: backendData.address || imported.address || null,
                            gender: backendData.gender || imported.gender || null,
                            position: backendData.position || imported.position || null,
                            startDate: imported.startDate || backendData.startDate || null,
                            endDate: imported.endDate || backendData.endDate || null,
                        };
                    }

                    return backendData;
                });

                setNikDataList(nikData);
            } catch (err: any) {
                if (isMounted) {
                    setError(toUserMessage(err, 'Gagal mengecek data NIK'));
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchNIKData();
        return () => { isMounted = false; };
    }, [contractData, navigate]);

    // Save employee data
    const saveNIKData = useCallback(async (nik: string, formData: KelengkapanDataForm) => {
        setLoading(true);
        setError(null);

        try {
            const payload: any = {
                full_name: formData.fullName,
                gender: formData.gender,
                position: formData.position,
                address: formData.address,
            };

            // For admin flow, include company_id
            if (contractData?.companyId) {
                payload.company_id = contractData.companyId;
            }

            const response = await saveEmployeeData(nik, payload);

            // Update local state with saved data + modal fields (startDate, endDate, pkwtSequence)
            setNikDataList(prev =>
                prev.map(item =>
                    item.nik === nik
                        ? {
                            nik,
                            fullName: response.data.full_name || formData.fullName,
                            address: response.data.address || formData.address,
                            gender: response.data.gender || formData.gender,
                            position: response.data.position || formData.position,
                            startDate: formData.startDate || item.startDate,
                            endDate: formData.endDate || item.endDate,
                            isComplete: true,
                        }
                        : item
                )
            );

            return true;
        } catch (err: any) {
            setError(toUserMessage(err, 'Gagal menyimpan data'));
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
                start_date: new Date().toISOString().split('T')[0],
                ...(contractData.contractType === 'PKWTT'
                    ? { employee_nik: contractData.niks[0] }
                    : { employees: contractData.niks.map(nik => {
                        const d = nikDataList.find(x => x.nik === nik);
                        return { nik, start_date: d?.startDate || '', end_date: d?.endDate || '' };
                    })}
                ),
            };

            const response = await saveDraftContract(draftPayload);
            setContractStatus('draft');
            return response.data.id;
        } catch (err: any) {
            setError(toUserMessage(err, 'Gagal menyimpan draf'));
            return null;
        }
    }, [contractData]);

    // Submit contract application
    const submitContract = useCallback(async (suratPermohonanFile?: File | null, draftPKWTFile?: File | null) => {
        if (!contractData) return false;

        const allComplete = nikDataList.every(data => data.isComplete);
        if (!allComplete) {
            setError('Harap lengkapi semua data NIK terlebih dahulu');
            return false;
        }

        // Both files are required
        if (!suratPermohonanFile || !draftPKWTFile) {
            setError('Surat Permohonan dan Draft PKWT wajib diunggah');
            return false;
        }

        setSubmitLoading(true);
        setError(null);

        try {
            const suratPermohonanBase64 = await fileToBase64(suratPermohonanFile);
            const draftPKWTBase64 = await fileToBase64(draftPKWTFile);

            if (contractData.contractType === 'PKWT') {
                const payload = {
                    contract_type: 'PKWT' as const,
                    employees: contractData.niks.map(nik => {
                        const nikData = nikDataList.find(d => d.nik === nik);
                        return {
                            nik,
                            start_date: nikData?.startDate || '',
                            end_date: nikData?.endDate || '',
                            full_name: nikData?.fullName || undefined,
                            gender: nikData?.gender || undefined,
                            position: nikData?.position || undefined,
                            address: nikData?.address || undefined,
                        };
                    }),
                    surat_permohonan_file_name: suratPermohonanFile.name,
                    surat_permohonan_file_content_base64: suratPermohonanBase64,
                    draft_pkwt_file_name: draftPKWTFile.name,
                    draft_pkwt_file_content_base64: draftPKWTBase64,
                };
                await submitContractApplication(payload);
            } else {
                const payload = {
                    contract_type: 'PKWTT' as const,
                    employee_nik: contractData.niks[0],
                    start_date: new Date().toISOString().split('T')[0],
                    full_name: nikDataList[0]?.fullName || undefined,
                    gender: nikDataList[0]?.gender || undefined,
                    position: nikDataList[0]?.position || undefined,
                    address: nikDataList[0]?.address || undefined,
                    surat_permohonan_file_name: suratPermohonanFile.name,
                    surat_permohonan_file_content_base64: suratPermohonanBase64,
                    draft_pkwt_file_name: draftPKWTFile.name,
                    draft_pkwt_file_content_base64: draftPKWTBase64,
                };
                await submitContractApplication(payload);
            }

            setContractStatus('pending');

            setTimeout(() => {
                navigate('/list-karyawan');
            }, 1500);

            return true;
        } catch (err: any) {
            setError(toUserMessage(err, 'Gagal mengirim pengajuan'));
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
