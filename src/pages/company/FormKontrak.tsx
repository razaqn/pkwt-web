import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FormKontrakPKWT, { type FormKontrakPKWTData } from '../../components/FormKontrakPKWT';
import FormKontrakPKWTT, { type FormKontrakPKWTTData } from '../../components/FormKontrakPKWTT';
import { checkNIKs, getDraftContractDetail } from '../../lib/api';
import { toUserMessage } from '../../lib/errors';
import { MoonLoader, ClipLoader } from 'react-spinners';

type ContractType = 'PKWT' | 'PKWTT';

interface FormErrors {
    submit?: string;
    niks?: string;
    fullName?: string;
    gender?: string;
    position?: string;
    address?: string;
    startDate?: string;
    fileSuratPermohonan?: string;
    fileDraftPKWT?: string;
}

export default function FormKontrak() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const draftId = searchParams.get('draftId');

    const [activeTab, setActiveTab] = useState<ContractType>('PKWT');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [draftLoading, setDraftLoading] = useState(!!draftId);

    const [pkwtData, setPkwtData] = useState<FormKontrakPKWTData>({
        niks: [],
    });

    const [pkwttData, setPkwttData] = useState<FormKontrakPKWTTData>({
        nik: '',
        startDate: '',
    });

    // Load draft data on mount if draftId provided
    useEffect(() => {
        if (!draftId) {
            setDraftLoading(false);
            return;
        }

        let isMounted = true;

        async function loadDraft() {
            try {
                const response = await getDraftContractDetail(draftId as string);
                const draft = response.data;

                if (!isMounted) return;

                if (draft.contract_type === 'PKWT') {
                    setActiveTab('PKWT');
                    setPkwtData({
                        niks: (draft.employee_niks || []).map((nik: string) => ({
                            id: crypto.randomUUID(),
                            nik
                        })),
                    });
                } else {
                    setActiveTab('PKWTT');
                    setPkwttData({
                        nik: draft.employee_niks?.[0] || '',
                        startDate: '',
                    });
                }
            } catch (err: any) {
                if (isMounted) {
                    setErrors({
                        submit: toUserMessage(err, 'Gagal memuat draft'),
                    });
                }
            } finally {
                if (isMounted) {
                    setDraftLoading(false);
                }
            }
        }

        loadDraft();
        return () => { isMounted = false; };
    }, [draftId]);

    const validatePKWT = useCallback((): boolean => {
        const newErrors: FormErrors = {};

        if (pkwtData.niks.length === 0) {
            newErrors.niks = 'Minimal 1 NIK harus ditambahkan';
        } else if (pkwtData.niks.some((entry) => !entry.nik.trim())) {
            newErrors.niks = 'Semua NIK harus diisi';
        }

        if (!pkwtData.fileSuratPermohonan) {
            newErrors.fileSuratPermohonan = 'Surat Permohonan harus diunggah';
        }

        if (!pkwtData.fileDraftPKWT) {
            newErrors.fileDraftPKWT = 'Draft PKWT harus diunggah';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [pkwtData]);

    const validatePKWTT = useCallback((): boolean => {
        const newErrors: FormErrors = {};

        if (!pkwttData.nik.trim()) {
            newErrors.niks = 'NIK harus diisi';
        } else if (!/^[0-9]+$/.test(pkwttData.nik.trim())) {
            newErrors.niks = 'NIK harus berupa angka';
        }

        if (!pkwttData.fullName?.trim()) {
            newErrors.fullName = 'Nama lengkap harus diisi';
        }

        if (!pkwttData.gender) {
            newErrors.gender = 'Kelamin harus dipilih';
        }

        if (!pkwttData.position?.trim()) {
            newErrors.position = 'Jabatan harus diisi';
        }

        if (!pkwttData.address?.trim()) {
            newErrors.address = 'Alamat harus diisi';
        }

        if (!pkwttData.startDate) {
            newErrors.startDate = 'Tanggal mulai harus diisi';
        }

        if (!pkwttData.fileSuratPermohonan) {
            newErrors.fileSuratPermohonan = 'Surat Permohonan harus diunggah';
        }

        if (!pkwttData.fileDraftPKWT) {
            newErrors.fileDraftPKWT = 'Draft PKWT harus diunggah';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [pkwttData]);

    const handleSubmitPKWT = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validatePKWT()) {
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const nikList = pkwtData.niks.map((entry) => entry.nik);
            const response = await checkNIKs(nikList);

            if (!response.ok) {
                throw new Error('Gagal melakukan pengecekan NIK');
            }

            navigate('/pengajuan-berkas', {
                state: {
                    contractType: 'PKWT',
                    niks: nikList,
                    fileSuratPermohonan: pkwtData.fileSuratPermohonan,
                    fileDraftPKWT: pkwtData.fileDraftPKWT,
                    importedData: pkwtData.importedData || {},
                },
            });
        } catch (err: any) {
            setErrors({
                submit: toUserMessage(err, 'Terjadi kesalahan saat memproses data'),
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitPKWTT = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validatePKWTT()) {
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const response = await checkNIKs([pkwttData.nik]);

            if (!response.ok) {
                throw new Error('Gagal melakukan pengecekan NIK');
            }

            navigate('/pengajuan-berkas', {
                state: {
                    contractType: 'PKWTT',
                    niks: [pkwttData.nik],
                    fileSuratPermohonan: pkwttData.fileSuratPermohonan,
                    fileDraftPKWT: pkwttData.fileDraftPKWT,
                    importedData: {
                        [pkwttData.nik]: {
                            fullName: pkwttData.fullName,
                            gender: pkwttData.gender,
                            position: pkwttData.position,
                            address: pkwttData.address,
                        },
                    },
                },
            });
        } catch (err: any) {
            setErrors({
                submit: toUserMessage(err, 'Terjadi kesalahan saat memproses data'),
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Loading State */}
            {draftLoading && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 shadow-2xl flex flex-col items-center gap-4 border border-slate-200">
                        <MoonLoader size={48} color="#419823" />
                        <p className="text-slate-700 font-medium">Memuat draft kontrak...</p>
                    </div>
                </div>
            )}

            {/* Form Content */}
            {!draftLoading && (
                <>
                    {/* Header */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-primary">Kontrak</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Formulir Kontrak</h1>
                                {draftId && (
                                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/20">
                                        Mode Draft
                                    </span>
                                )}
                            </div>
                            <p className="mt-1 text-sm text-slate-600">Buat kontrak PKWT atau PKWTT, lalu lanjutkan ke tahap pengajuan.</p>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate('/status-pantau')}
                            className="inline-flex items-center justify-center rounded-lg border border-primary/30 bg-white px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
                        >
                            Lihat Status Pantau
                        </button>
                    </div>

                    {/* Error Alert */}
                    {errors.submit && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 shadow-sm">
                            <p className="text-sm text-red-800">{errors.submit}</p>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setActiveTab('PKWT')}
                                className={
                                    activeTab === 'PKWT'
                                        ? 'rounded-lg bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary ring-1 ring-inset ring-primary/20'
                                        : 'rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50'
                                }
                            >
                                PKWT
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('PKWTT')}
                                className={
                                    activeTab === 'PKWTT'
                                        ? 'rounded-lg bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary ring-1 ring-inset ring-primary/20'
                                        : 'rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50'
                                }
                            >
                                PKWTT
                            </button>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 bg-gradient-to-r from-primary/10 via-white to-secondary/20 px-6 py-5">
                            <p className="text-sm font-semibold text-slate-900">
                                {activeTab === 'PKWT' ? 'PKWT (Banyak Karyawan)' : 'PKWTT (Satu Karyawan)'}
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                                {activeTab === 'PKWT'
                                    ? 'Lengkapi data NIK dan upload 2 dokumen (Surat Permohonan + Draft PKWT).'
                                    : 'Masukkan NIK, data akan terisi otomatis jika sudah terdaftar. Upload 2 dokumen.'
                                }
                            </p>
                        </div>

                        <form onSubmit={activeTab === 'PKWT' ? handleSubmitPKWT : handleSubmitPKWTT} className="space-y-6 px-6 py-6">
                            {activeTab === 'PKWT' && (
                                <FormKontrakPKWT
                                    data={pkwtData}
                                    onChange={setPkwtData}
                                    errors={errors}
                                    loading={loading}
                                />
                            )}

                            {activeTab === 'PKWTT' && (
                                <FormKontrakPKWTT
                                    data={pkwttData}
                                    onChange={setPkwttData}
                                    errors={errors}
                                    loading={loading}
                                />
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col-reverse gap-3 pt-6 border-t border-slate-200 sm:flex-row sm:items-center sm:justify-between">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-secondary/90 disabled:opacity-50 sm:w-auto"
                                >
                                    {loading && <ClipLoader size={16} color="#1F2937" />}
                                    {loading ? 'Memproses...' : 'Lanjut ke Pengajuan'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/list-karyawan')}
                                    disabled={loading}
                                    className="inline-flex w-full items-center justify-center rounded-lg border border-primary/30 bg-white px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 disabled:opacity-50 sm:w-auto"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
}
