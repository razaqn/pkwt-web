import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Check, Building2 } from 'lucide-react';
import FormKontrakPKWT, { type FormKontrakPKWTData } from '../../components/FormKontrakPKWT';
import FormKontrakPKWTT, { type FormKontrakPKWTTData } from '../../components/FormKontrakPKWTT';
import { checkNIKs, getAllCompanies } from '../../lib/api';
import type { Company } from '../../lib/api';
import { toUserMessage } from '../../lib/errors';
import { ClipLoader } from 'react-spinners';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

type ContractType = 'PKWT' | 'PKWTT';

interface FormErrors {
    submit?: string;
    company?: string;
    niks?: string;
    startDate?: string;
    durasi?: string;
    fileKontrak?: string;
}

export default function CreateContract() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<ContractType>('PKWT');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    // Company selector state
    const [companies, setCompanies] = useState<Company[]>([]);
    const [companiesLoading, setCompaniesLoading] = useState(true);
    const [selectedCompanyId, setSelectedCompanyId] = useState('');
    const [companySearch, setCompanySearch] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);

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

    // Fetch companies on mount
    useEffect(() => {
        let cancelled = false;
        async function fetchCompanies() {
            try {
                const res = await getAllCompanies({ limit: 1000 });
                if (!cancelled) {
                    setCompanies(res.data);
                }
            } catch {
                // Silently handle
            } finally {
                if (!cancelled) setCompaniesLoading(false);
            }
        }
        fetchCompanies();
        return () => { cancelled = true; };
    }, []);

    const filteredCompanies = companies.filter(c =>
        c.company_name.toLowerCase().includes(companySearch.toLowerCase())
    );

    const selectedCompany = companies.find(c => c.id === selectedCompanyId);

    const validatePKWT = useCallback((): boolean => {
        const newErrors: FormErrors = {};

        if (!selectedCompanyId) {
            newErrors.company = 'Pilih perusahaan terlebih dahulu';
        }

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
    }, [pkwtData, selectedCompanyId]);

    const validatePKWTT = useCallback((): boolean => {
        const newErrors: FormErrors = {};

        if (!selectedCompanyId) {
            newErrors.company = 'Pilih perusahaan terlebih dahulu';
        }

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
    }, [pkwttData, selectedCompanyId]);

    const handleSubmitPKWT = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validatePKWT()) return;

        setLoading(true);
        setErrors({});

        try {
            const nikList = pkwtData.niks.map((entry: any) => entry.nik);
            const response = await checkNIKs(nikList);
            if (!response.ok) throw new Error('Gagal melakukan pengecekan NIK');

            navigate('/admin/create-contract/submit', {
                state: {
                    companyId: selectedCompanyId,
                    companyName: selectedCompany?.company_name,
                    contractType: 'PKWT',
                    niks: nikList,
                    startDate: pkwtData.startDate,
                    duration: pkwtData.durasi,
                    fileKontrak: pkwtData.fileKontrak,
                    importedData: pkwtData.importedData || {},
                },
            });
        } catch (err: any) {
            setErrors({ submit: toUserMessage(err, 'Terjadi kesalahan saat memproses data') });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitPKWTT = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validatePKWTT()) return;

        setLoading(true);
        setErrors({});

        try {
            const response = await checkNIKs([pkwttData.nik]);
            if (!response.ok) throw new Error('Gagal melakukan pengecekan NIK');

            navigate('/admin/create-contract/submit', {
                state: {
                    companyId: selectedCompanyId,
                    companyName: selectedCompany?.company_name,
                    contractType: 'PKWTT',
                    niks: [pkwttData.nik],
                    startDate: pkwttData.startDate,
                    duration: null,
                    fileKontrak: pkwttData.fileKontrak,
                    importedData: pkwttData.importedData || {},
                },
            });
        } catch (err: any) {
            setErrors({ submit: toUserMessage(err, 'Terjadi kesalahan saat memproses data') });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-semibold text-primary">Admin</p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Buat Kontrak Mandiri</h1>
                    <p className="mt-1 text-sm text-slate-600">Buat kontrak PKWT atau PKWTT atas nama perusahaan.</p>
                </div>
            </div>

            {/* Error Alert */}
            {errors.submit && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 shadow-sm">
                    <p className="text-sm text-red-800">{errors.submit}</p>
                </div>
            )}

            {/* Company Selector */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                    Pilih Perusahaan <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        disabled={companiesLoading}
                        className={`flex w-full items-center justify-between gap-3 rounded-lg border ${errors.company ? 'border-red-300' : 'border-slate-300'} bg-white px-4 py-2.5 text-left text-sm shadow-sm transition hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50`}
                    >
                        <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-slate-400" />
                            {companiesLoading ? (
                                <span className="text-slate-400">Memuat perusahaan...</span>
                            ) : selectedCompany ? (
                                <span className="text-slate-900">{selectedCompany.company_name}</span>
                            ) : (
                                <span className="text-slate-400">Pilih perusahaan...</span>
                            )}
                        </div>
                        <ChevronDown className={`h-4 w-4 text-slate-400 transition ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {dropdownOpen && !companiesLoading && (
                        <div className="absolute z-20 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
                            <div className="border-b border-slate-200 p-2">
                                <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5">
                                    <Search className="h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={companySearch}
                                        onChange={(e) => setCompanySearch(e.target.value)}
                                        placeholder="Cari perusahaan..."
                                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="max-h-60 overflow-y-auto p-1">
                                {filteredCompanies.length === 0 ? (
                                    <p className="px-3 py-2 text-sm text-slate-500">Tidak ada perusahaan ditemukan</p>
                                ) : (
                                    filteredCompanies.map((company) => (
                                        <button
                                            key={company.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedCompanyId(company.id);
                                                setDropdownOpen(false);
                                                setCompanySearch('');
                                                setErrors(prev => ({ ...prev, company: undefined }));
                                            }}
                                            className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition hover:bg-primary/5 ${selectedCompanyId === company.id ? 'bg-primary/10 text-primary' : 'text-slate-700'
                                                }`}
                                        >
                                            <span className="flex-1">{company.company_name}</span>
                                            {selectedCompanyId === company.id && <Check className="h-4 w-4" />}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
                {errors.company && <p className="text-sm text-red-500">{errors.company}</p>}
            </div>

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
                    <p className="mt-1 text-sm text-slate-600">Lengkapi data di bawah, lalu lanjutkan ke tahap pengajuan berkas.</p>
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
                            onClick={() => navigate('/admin/approvals')}
                            disabled={loading}
                            className="inline-flex w-full items-center justify-center rounded-lg border border-primary/30 bg-white px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 disabled:opacity-50 sm:w-auto"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
