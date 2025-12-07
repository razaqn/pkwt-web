"use client";

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { EmployeeDraftModal, type DraftEmployee } from '../components/EmployeeDraftModal';
import { checkEmployeesBatch, type EmployeeApi } from '../lib/employees';
import { getToken } from '../store/auth';

type TabKey = 'PKWT' | 'PKWTT';
type Step = 'form' | 'review';
type NikStatus = 'registered' | 'missing' | 'drafted';

type PkwtFormState = {
    nikInput: string;
    nikList: string[];
    startDate: string;
    duration: string;
};

type PkwttFormState = {
    nik: string;
    startDate: string;
    contractFile: File | null;
};

type NikCheckResult = {
    nik: string;
    status: NikStatus;
    employee?: EmployeeApi;
    message?: string;
};

export default function FormPKWT() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabKey>('PKWT');
    const [step, setStep] = useState<Step>('form');
    const [pkwtForm, setPkwtForm] = useState<PkwtFormState>({
        nikInput: '',
        nikList: [],
        startDate: '',
        duration: '',
    });
    const [pkwttForm, setPkwttForm] = useState<PkwttFormState>({
        nik: '',
        startDate: '',
        contractFile: null,
    });
    const [nikChecks, setNikChecks] = useState<NikCheckResult[]>([]);
    const [draftData, setDraftData] = useState<Record<string, DraftEmployee>>({});
    const [modalNik, setModalNik] = useState<string | null>(null);
    const [isCheckingNik, setIsCheckingNik] = useState(false);
    const [checkError, setCheckError] = useState<string | null>(null);

    const handleAddNik = () => {
        const trimmed = pkwtForm.nikInput.trim();
        if (!trimmed) return;
        if (pkwtForm.nikList.includes(trimmed)) {
            setPkwtForm((prev) => ({ ...prev, nikInput: '' }));
            return;
        }

        setPkwtForm((prev) => ({
            ...prev,
            nikList: [...prev.nikList, trimmed],
            nikInput: '',
        }));
    };

    const handleRemoveNik = (index: number) => {
        setPkwtForm((prev) => ({
            ...prev,
            nikList: prev.nikList.filter((_, idx) => idx !== index),
        }));
    };

    const handleSubmitPkwt = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setCheckError(null);

        if (pkwtForm.nikList.length === 0) {
            alert('Tambahkan minimal satu NIK.');
            return;
        }
        if (!pkwtForm.startDate || !pkwtForm.duration) {
            alert('Lengkapi tanggal mulai dan durasi.');
            return;
        }

        setIsCheckingNik(true);
        const token = getToken();

        try {
            const existing = await checkEmployeesBatch(pkwtForm.nikList, token || undefined);
            const results: NikCheckResult[] = pkwtForm.nikList.map((nik) => {
                const found = existing.find((item) => item.nik === nik);
                return {
                    nik,
                    status: found ? 'registered' : 'missing',
                    employee: found,
                    message: found ? 'Sudah terdaftar' : 'Lengkapi data karyawan',
                };
            });

            setNikChecks(results);
            setStep('review');
        } catch (error: any) {
            setCheckError(error?.message || 'Gagal memeriksa NIK.');
        } finally {
            setIsCheckingNik(false);
        }
    };

    const handleSubmitPkwtt = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!pkwttForm.contractFile) {
            alert('Unggah file kontrak (PDF).');
            return;
        }

        const payload = {
            ...pkwttForm,
            contractType: 'PKWTT' as const,
        };

        console.log('PKWTT form submitted', payload);
        alert('Form PKWTT tersimpan (demo).');
    };

    const allDataCompleted = useMemo(() => {
        if (nikChecks.length === 0) return false;
        return nikChecks.every((item) => item.status === 'registered' || draftData[item.nik]);
    }, [nikChecks, draftData]);

    const statusBadge = (status: NikStatus) => {
        if (status === 'registered') {
            return 'bg-green-50 text-green-700 ring-1 ring-green-100';
        }
        if (status === 'drafted') {
            return 'bg-blue-50 text-blue-700 ring-1 ring-blue-100';
        }
        return 'bg-amber-50 text-amber-700 ring-1 ring-amber-100';
    };

    const handleSaveDraft = (nik: string, data: DraftEmployee) => {
        setDraftData((prev) => ({ ...prev, [nik]: data }));
        setNikChecks((prev) => prev.map((item) => item.nik === nik ? { ...item, status: 'drafted' } : item));
        setModalNik(null);
    };

    const handleAjukanBerkas = () => {
        if (!allDataCompleted) return;

        navigate('/pengajuan-berkas', {
            state: {
                contractType: 'PKWT' as const,
                startDate: pkwtForm.startDate,
                duration: pkwtForm.duration,
                nikList: pkwtForm.nikList,
                nikChecks,
                draftData,
                status: 'null' as const,
            },
        });
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <TabsList className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 flex">
                    <TabsTrigger
                        value="PKWT"
                        isActive={activeTab === 'PKWT'}
                        onClick={() => setActiveTab('PKWT')}
                        className={`flex-1 px-8 py-4 text-sm font-semibold text-center transition-all ${activeTab === 'PKWT'
                            ? 'text-blue-700 bg-white border-b-2 border-blue-600 shadow-sm'
                            : 'text-slate-600 hover:text-blue-700 hover:bg-white/50'
                            }`}
                    >
                        Form PKWT
                    </TabsTrigger>
                    <TabsTrigger
                        value="PKWTT"
                        isActive={activeTab === 'PKWTT'}
                        onClick={() => setActiveTab('PKWTT')}
                        className={`flex-1 px-8 py-4 text-sm font-semibold text-center transition-all ${activeTab === 'PKWTT'
                            ? 'text-blue-700 bg-white border-b-2 border-blue-600 shadow-sm'
                            : 'text-slate-600 hover:text-blue-700 hover:bg-white/50'
                            }`}
                    >
                        Form PKWTT
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="PKWT" activeTab={activeTab} className="p-8">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-1">Formulir Pengajuan PKWT</h2>
                        <p className="text-sm text-slate-600">Isi data karyawan untuk pengajuan kontrak waktu tertentu</p>
                    </div>

                    <form onSubmit={handleSubmitPkwt} className="space-y-6">
                        <div className="space-y-6">
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                                <label className="block text-sm font-semibold text-slate-900 mb-3">NIK Karyawan</label>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <input
                                        type="text"
                                        value={pkwtForm.nikInput}
                                        onChange={(e) => setPkwtForm((prev) => ({ ...prev, nikInput: e.target.value }))}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddNik();
                                            }
                                        }}
                                        placeholder="Masukkan NIK (16 digit)"
                                        className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddNik}
                                        className="sm:w-auto w-full inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors whitespace-nowrap"
                                    >
                                        + Tambah
                                    </button>
                                </div>
                                {pkwtForm.nikList.length === 0 ? (
                                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-3">
                                        <p className="text-sm text-blue-700">
                                            <span className="font-medium">Tip:</span> Tambahkan satu atau lebih NIK untuk pengajuan PKWT. Tekan Enter atau klik tombol Tambah.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="mt-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-sm font-medium text-slate-700">
                                                NIK yang ditambahkan ({pkwtForm.nikList.length})
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {pkwtForm.nikList.map((nik, index) => (
                                                <span
                                                    key={`${nik}-${index}`}
                                                    className="inline-flex items-center gap-2 rounded-lg bg-white border border-blue-200 px-4 py-2 text-sm text-slate-900 shadow-sm"
                                                >
                                                    <span className="font-medium">{nik}</span>
                                                    <button
                                                        type="button"
                                                        aria-label={`Hapus NIK ${nik}`}
                                                        onClick={() => handleRemoveNik(index)}
                                                        className="ml-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full w-5 h-5 flex items-center justify-center transition-colors"
                                                    >
                                                        <span className="text-base font-bold">×</span>
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        Tanggal Mulai Kontrak <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={pkwtForm.startDate}
                                        onChange={(e) => setPkwtForm((prev) => ({ ...prev, startDate: e.target.value }))}
                                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        Durasi Kontrak (bulan) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={pkwtForm.duration}
                                        onChange={(e) => setPkwtForm((prev) => ({ ...prev, duration: e.target.value }))}
                                        placeholder="Contoh: 12"
                                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <p className="mt-2 text-xs text-slate-500">Masukkan durasi dalam satuan bulan</p>
                                </div>
                            </div>
                        </div>

                        {checkError && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {checkError}
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={() => {
                                    setPkwtForm({ nikInput: '', nikList: [], startDate: '', duration: '' });
                                    setNikChecks([]);
                                    setDraftData({});
                                    setStep('form');
                                }}
                                className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors"
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                disabled={isCheckingNik}
                                className={`inline-flex items-center rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${isCheckingNik ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                            >
                                {isCheckingNik ? 'Memeriksa NIK...' : 'Simpan & Ajukan PKWT'}
                            </button>
                        </div>
                    </form>

                    {step !== 'form' && nikChecks.length > 0 && (
                        <div className="mt-8 space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
                                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Ringkasan Pengajuan</h3>
                                    <dl className="space-y-2 text-sm text-slate-700">
                                        <div className="flex justify-between"><dt className="text-slate-500">Keterangan</dt><dd className="font-semibold">PKWT</dd></div>
                                        <div className="flex justify-between"><dt className="text-slate-500">Jumlah Orang</dt><dd className="font-semibold">{pkwtForm.nikList.length} karyawan</dd></div>
                                        <div className="flex justify-between"><dt className="text-slate-500">Durasi</dt><dd className="font-semibold">{pkwtForm.duration} bulan</dd></div>
                                        <div className="flex justify-between"><dt className="text-slate-500">Start Date</dt><dd className="font-semibold">{pkwtForm.startDate || '-'}</dd></div>
                                        <div className="flex justify-between"><dt className="text-slate-500">Status</dt><dd className="font-semibold">{allDataCompleted ? 'Siap ajukan berkas' : 'Draft / Perlu data'}</dd></div>
                                    </dl>
                                    <div className="mt-4 flex gap-2">
                                        <button
                                            type="button"
                                            onClick={handleAjukanBerkas}
                                            disabled={!allDataCompleted}
                                            className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${allDataCompleted ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                                }`}
                                        >
                                            Ajukan Berkas
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold border border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
                                        >
                                            Detail Page
                                        </button>
                                    </div>
                                </div>

                                <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
                                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Status NIK</h3>
                                    <p className="text-sm text-slate-600">Hijau: sudah terdaftar. Kuning: perlu dilengkapi.</p>
                                </div>
                            </div>

                            <div className="border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                            <th className="px-4 py-3">NIK</th>
                                            <th className="px-4 py-3">Nama</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {nikChecks.map((item) => {
                                            const draft = draftData[item.nik];
                                            const displayName = item.employee?.full_name || draft?.full_name || '-';
                                            const isRegistered = item.status === 'registered';
                                            return (
                                                <tr key={item.nik} className="border-b border-slate-100 last:border-0">
                                                    <td className="px-4 py-3 font-semibold text-slate-900">{item.nik}</td>
                                                    <td className="px-4 py-3 text-slate-700">{displayName}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(isRegistered ? 'registered' : item.status)}`}>
                                                            <span className={`h-2 w-2 rounded-full ${isRegistered ? 'bg-green-500' : 'bg-amber-400'}`} />
                                                            {isRegistered ? 'Sudah terdaftar' : item.status === 'drafted' ? 'Draft tersimpan' : 'Perlu data'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {!isRegistered && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setModalNik(item.nik)}
                                                                className="inline-flex items-center rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-600"
                                                            >
                                                                Lengkapi Data
                                                            </button>
                                                        )}
                                                        {isRegistered && (
                                                            <span className="text-xs text-slate-500">Tidak perlu aksi</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Upload step now handled in PengajuanBerkas page */}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="PKWTT" activeTab={activeTab} className="p-8">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-1">Formulir Pengajuan PKWTT</h2>
                        <p className="text-sm text-slate-600">Isi data karyawan untuk pengajuan kontrak waktu tidak tertentu</p>
                    </div>

                    <form onSubmit={handleSubmitPkwtt} className="space-y-6">
                        <div className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        NIK Karyawan <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={pkwttForm.nik}
                                        onChange={(e) => setPkwttForm((prev) => ({ ...prev, nik: e.target.value }))}
                                        placeholder="Masukkan NIK (16 digit)"
                                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        Tanggal Mulai Kontrak <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={pkwttForm.startDate}
                                        onChange={(e) => setPkwttForm((prev) => ({ ...prev, startDate: e.target.value }))}
                                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-2">
                                    File Kontrak (PDF) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        required
                                        onChange={(e) => setPkwttForm((prev) => ({ ...prev, contractFile: e.target.files ? e.target.files[0] : null }))}
                                        className="w-full rounded-lg border-2 border-dashed border-slate-300 px-4 py-6 text-sm bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer transition-colors"
                                    />
                                </div>
                                <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Unggah dokumen kontrak dalam format PDF (maksimal 5MB)
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={() => {
                                    setPkwttForm({ nik: '', startDate: '', contractFile: null });
                                }}
                                className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors"
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            >
                                Simpan & Ajukan PKWTT
                            </button>
                        </div>
                    </form>
                </TabsContent>
            </div>

            {modalNik && (
                <EmployeeDraftModal
                    nik={modalNik}
                    initialData={draftData[modalNik]}
                    onClose={() => setModalNik(null)}
                    onSave={(data) => handleSaveDraft(modalNik, data)}
                />)
            }
        </div>
    );
}
