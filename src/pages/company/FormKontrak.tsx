import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import FormKontrakPKWT, { type FormKontrakPKWTData } from '../../components/FormKontrakPKWT';
import FormKontrakPKWTT, { type FormKontrakPKWTTData } from '../../components/FormKontrakPKWTT';
import { checkNIKs } from '../../lib/api';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

type ContractType = 'PKWT' | 'PKWTT';

interface FormErrors {
    submit?: string;
    niks?: string;
    startDate?: string;
    durasi?: string;
    fileKontrak?: string;
}

export default function FormKontrak() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<ContractType>('PKWT');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    const [pkwtData, setPkwtData] = useState<FormKontrakPKWTData>({
        niks: [],
        startDate: '',
        durasi: 0,
    });

    const [pkwttData, setPkwttData] = useState<FormKontrakPKWTTData>({
        nik: '',
        startDate: '',
        fileKontrak: null,
    });

    const validatePKWT = useCallback((): boolean => {
        const newErrors: FormErrors = {};

        if (pkwtData.niks.length === 0) {
            newErrors.niks = 'Minimal 1 NIK harus ditambahkan';
        } else if (pkwtData.niks.some((entry: any) => !entry.nik.trim())) {
            newErrors.niks = 'Semua NIK harus diisi';
        }

        if (!pkwtData.startDate) {
            newErrors.startDate = 'Tanggal mulai harus diisi';
        }

        if (!pkwtData.durasi || pkwtData.durasi < 1) {
            newErrors.durasi = 'Durasi harus lebih dari 0 bulan';
        }

        if (!pkwtData.fileKontrak) {
            newErrors.fileKontrak = 'File kontrak harus diunggah';
        } else if (pkwtData.fileKontrak.size > MAX_FILE_SIZE_BYTES) {
            newErrors.fileKontrak = `File terlalu besar. Maksimal ${MAX_FILE_SIZE_MB}MB, file Anda ${(pkwtData.fileKontrak.size / 1024 / 1024).toFixed(2)}MB`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [pkwtData]);

    const validatePKWTT = useCallback((): boolean => {
        const newErrors: FormErrors = {};

        if (!pkwttData.nik.trim()) {
            newErrors.niks = 'NIK harus diisi';
        }

        if (!pkwttData.startDate) {
            newErrors.startDate = 'Tanggal mulai harus diisi';
        }

        if (!pkwttData.fileKontrak) {
            newErrors.fileKontrak = 'File kontrak harus diunggah';
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
            // Lakukan pengecekan NIK ke backend
            const nikList = pkwtData.niks.map((entry: any) => entry.nik);
            const response = await checkNIKs(nikList);

            if (!response.ok) {
                throw new Error('Gagal melakukan pengecekan NIK');
            }

            // Navigate to pengajuan berkas page with contract data
            navigate('/pengajuan-berkas', {
                state: {
                    contractType: 'PKWT',
                    niks: nikList,
                    startDate: pkwtData.startDate,
                    duration: pkwtData.durasi,
                    fileKontrak: pkwtData.fileKontrak,
                },
            });
        } catch (err: any) {
            setErrors({
                submit: err?.message || 'Terjadi kesalahan saat memproses data',
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
            // Lakukan pengecekan NIK ke backend
            const response = await checkNIKs([pkwttData.nik]);

            if (!response.ok) {
                throw new Error('Gagal melakukan pengecekan NIK');
            }

            // Navigate to pengajuan berkas page with contract data
            navigate('/pengajuan-berkas', {
                state: {
                    contractType: 'PKWTT',
                    niks: [pkwttData.nik],
                    startDate: pkwttData.startDate,
                    duration: null, // PKWTT has no duration
                    fileKontrak: pkwttData.fileKontrak,
                },
            });
        } catch (err: any) {
            setErrors({
                submit: err?.message || 'Terjadi kesalahan saat memproses data',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Form Kontrak</h1>
                <p className="mt-1 text-slate-600">Tambahkan karyawan dan daftarkan kontrak baru</p>
            </div>

            {/* Error Alert */}
            {errors.submit && (
                <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3">
                    <p className="text-sm text-red-800">{errors.submit}</p>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('PKWT')}
                    className={`px-4 py-3 font-medium text-sm transition border-b-2 ${activeTab === 'PKWT'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                >
                    PKWT
                </button>
                <button
                    onClick={() => setActiveTab('PKWTT')}
                    className={`px-4 py-3 font-medium text-sm transition border-b-2 ${activeTab === 'PKWTT'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                >
                    PKWTT
                </button>
            </div>

            {/* Form Content */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <form onSubmit={activeTab === 'PKWT' ? handleSubmitPKWT : handleSubmitPKWTT} className="space-y-6">
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
                    <div className="flex gap-3 pt-6 border-t border-slate-200">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
                        >
                            {loading ? 'Memproses...' : 'Lanjut ke Pengajuan'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/list-karyawan')}
                            disabled={loading}
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
