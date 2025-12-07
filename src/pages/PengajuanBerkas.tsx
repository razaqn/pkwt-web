"use client";

import { useLocation, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { EmployeeDraftModal, type DraftEmployee } from '../components/EmployeeDraftModal';

import type { EmployeeApi } from '../lib/employees';

type NikStatus = 'registered' | 'missing' | 'drafted';

type NikCheckResult = {
    nik: string;
    status: NikStatus;
    employee?: EmployeeApi;
    message?: string;
};

type ContractStatus = 'null' | 'PENDING' | 'REJECTED' | 'APPROVED';

type PengajuanState = {
    contractType: 'PKWT' | 'PKWTT';
    startDate: string;
    duration?: string;
    nikList?: string[];
    nikChecks: NikCheckResult[];
    draftData: Record<string, DraftEmployee>;
    status?: ContractStatus;
    primaryName?: string;
};

export default function PengajuanBerkas() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const pengajuanState = (state || {}) as PengajuanState | undefined;

    const [status, setStatus] = useState<ContractStatus>(pengajuanState?.status || 'null');
    const [rows, setRows] = useState<NikCheckResult[]>(pengajuanState?.nikChecks || []);
    const [draftData, setDraftData] = useState<Record<string, DraftEmployee>>(pengajuanState?.draftData || {});
    const [modalNik, setModalNik] = useState<string | null>(null);
    const [uploadFile, setUploadFile] = useState<File | null>(null);

    const allDataComplete = useMemo(() => {
        if (!rows.length) return false;
        return rows.every((r) => r.status === 'registered' || draftData[r.nik]);
    }, [rows, draftData]);

    const isRejected = status === 'REJECTED';
    const contractType = pengajuanState?.contractType;

    const peopleLabel = useMemo(() => {
        if (contractType === 'PKWTT') {
            return pengajuanState?.primaryName || rows[0]?.employee?.full_name || draftData[rows[0]?.nik || '']?.full_name || 'Nama belum tersedia';
        }
        return `${pengajuanState?.nikList?.length || rows.length} karyawan`;
    }, [contractType, pengajuanState?.nikList, pengajuanState?.primaryName, rows, draftData]);

    const durationLabel = contractType === 'PKWTT' ? '-' : pengajuanState?.duration || '-';

    const statusBadge = (current: ContractStatus) => {
        if (current === 'APPROVED') return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100';
        if (current === 'REJECTED') return 'bg-red-50 text-red-700 ring-1 ring-red-100';
        if (current === 'PENDING') return 'bg-amber-50 text-amber-700 ring-1 ring-amber-100';
        return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
    };

    const nikBadge = (statusNik: NikStatus) => {
        if (statusNik === 'registered') return 'bg-green-50 text-green-700 border border-green-100';
        if (statusNik === 'drafted') return 'bg-blue-50 text-blue-700 border border-blue-100';
        return 'bg-amber-50 text-amber-700 border border-amber-100';
    };

    const handleSaveDraft = (nik: string, data: DraftEmployee) => {
        setDraftData((prev) => ({ ...prev, [nik]: data }));
        setRows((prev) => prev.map((row) => row.nik === nik ? { ...row, status: 'drafted', message: 'Draft tersimpan' } : row));
        setModalNik(null);
    };

    const handleSubmitFile = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!uploadFile) {
            alert('Tambahkan berkas kontrak terlebih dahulu.');
            return;
        }
        if (!allDataComplete) {
            alert('Lengkapi data karyawan terlebih dahulu.');
            return;
        }

        // Demo submission
        console.log('Pengajuan berkas disiapkan', {
            status,
            contractType,
            startDate: pengajuanState?.startDate,
            duration: pengajuanState?.duration,
            rows,
            draftData,
            uploadFile,
        });
        setStatus('PENDING');
        alert('Berkas siap diajukan (demo).');
    };

    if (!pengajuanState || !pengajuanState.nikChecks) {
        return (
            <div className="max-w-4xl mx-auto p-8">
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 text-center space-y-3">
                    <h1 className="text-xl font-semibold text-slate-900">Tidak ada data pengajuan</h1>
                    <p className="text-sm text-slate-600">Lakukan pengecekan NIK terlebih dahulu di halaman Form PKWT/PKWTT.</p>
                    <button
                        onClick={() => navigate('/form')}
                        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Kembali ke Form
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-sm text-slate-500">Tahap 2 · Pengajuan Berkas</p>
                    <h1 className="text-2xl font-semibold text-slate-900">{contractType === 'PKWTT' ? 'Pengajuan Berkas PKWTT' : 'Pengajuan Berkas PKWT'}</h1>
                    <p className="text-sm text-slate-600">Pastikan data karyawan lengkap sebelum mengajukan file kontrak.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ${statusBadge(status)}`}>
                        <span className={`h-2 w-2 rounded-full ${status === 'APPROVED' ? 'bg-emerald-500' : status === 'REJECTED' ? 'bg-red-500' : status === 'PENDING' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                        {status === 'null' ? 'Belum diajukan' : status}
                    </span>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Keterangan</div>
                    <div className="text-lg font-semibold text-slate-900">{contractType}</div>
                    <p className="text-sm text-slate-600 mt-1">Jenis kontrak yang diajukan</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Jumlah / Nama</div>
                    <div className="text-lg font-semibold text-slate-900">{peopleLabel}</div>
                    <p className="text-sm text-slate-600 mt-1">Total karyawan dalam pengajuan</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Durasi</div>
                    <div className="text-lg font-semibold text-slate-900">{durationLabel}</div>
                    <p className="text-sm text-slate-600 mt-1">Durasi kontrak (bulan)</p>
                </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Start Date</div>
                            <div className="text-lg font-semibold text-slate-900">{pengajuanState?.startDate || '-'}</div>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate('/perstujuan-pkwt')}
                            className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                        >
                            Detail Page
                        </button>
                    </div>
                    <p className="text-sm text-slate-600">Tanggal mulai kontrak untuk pengajuan ini.</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</div>
                            <div className="text-lg font-semibold text-slate-900">{status === 'null' ? 'Belum diajukan' : status}</div>
                        </div>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as ContractStatus)}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="null">Null</option>
                            <option value="PENDING">Pending</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="APPROVED">Approved</option>
                        </select>
                    </div>
                    <p className="text-sm text-slate-600">Status bisa diubah untuk simulasi alur (demo).</p>
                </div>
            </div>

            <div className="mt-6 bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-sm font-semibold text-slate-900">Daftar NIK</h2>
                        <p className="text-xs text-slate-600">Hijau = sudah terdata. Kuning = perlu dilengkapi.</p>
                    </div>
                </div>
                <div className="overflow-hidden border border-slate-200 rounded-lg">
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
                            {rows.map((row) => {
                                const draft = draftData[row.nik];
                                const displayName = row.employee?.full_name || draft?.full_name || '-';
                                const canEdit = row.status !== 'registered' || isRejected;

                                return (
                                    <tr key={row.nik} className="border-b border-slate-100 last:border-0">
                                        <td className="px-4 py-3 font-semibold text-slate-900">{row.nik}</td>
                                        <td className="px-4 py-3 text-slate-700">{displayName}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${nikBadge(row.status)}`}>
                                                <span className={`h-2 w-2 rounded-full ${row.status === 'registered' ? 'bg-green-500' : row.status === 'drafted' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                                                {row.status === 'registered' ? 'Sudah terdata' : row.status === 'drafted' ? 'Draft tersimpan' : 'Perlu data'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {canEdit ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setModalNik(row.nik)}
                                                    className="inline-flex items-center rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-600"
                                                >
                                                    Lengkapi Data
                                                </button>
                                            ) : (
                                                <span className="text-xs text-slate-500">Tidak perlu aksi</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-6 bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                        <h2 className="text-sm font-semibold text-slate-900">Ajukan File Kontrak</h2>
                        <p className="text-xs text-slate-600">Unggah berkas setelah semua data karyawan lengkap.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/form')}
                        className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                    >
                        Kembali ke Form
                    </button>
                </div>

                <form onSubmit={handleSubmitFile} className="space-y-4">
                    <div>
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                            className="w-full rounded-lg border-2 border-dashed border-slate-300 px-4 py-5 text-sm bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer transition-colors"
                        />
                        <p className="mt-2 text-xs text-slate-500">Format PDF. Pastikan data karyawan sudah lengkap sebelum mengajukan.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="submit"
                            disabled={!allDataComplete}
                            className={`inline-flex items-center rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${allDataComplete ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-300 cursor-not-allowed'}`}
                        >
                            Ajukan File
                        </button>
                        {!allDataComplete && (
                            <span className="text-xs text-slate-500">Lengkapi data NIK atau isi draft terlebih dahulu.</span>
                        )}
                    </div>
                </form>
            </div>

            {modalNik && (
                <EmployeeDraftModal
                    nik={modalNik}
                    initialData={draftData[modalNik]}
                    onClose={() => setModalNik(null)}
                    onSave={(data) => handleSaveDraft(modalNik, data)}
                />
            )}
        </div>
    );
}
