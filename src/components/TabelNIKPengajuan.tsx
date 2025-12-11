import { Edit, FileImage } from 'lucide-react';
import type { NIKData } from '../lib/utils';

interface TabelNIKPengajuanProps {
    data: NIKData[];
    onEdit: (nik: string) => void;
    loading?: boolean;
}

export default function TabelNIKPengajuan({ data, onEdit, loading = false }: TabelNIKPengajuanProps) {
    if (data.length === 0) {
        return (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-slate-600">Tidak ada data NIK</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium text-slate-700">No</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-700">NIK</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-700">Nama Lengkap</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-700">Alamat</th>
                            <th className="px-4 py-3 text-center font-medium text-slate-700">KTP</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-700">Status</th>
                            <th className="px-4 py-3 text-center font-medium text-slate-700">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {data.map((item, index) => (
                            <tr
                                key={item.nik}
                                className={`hover:bg-slate-50 transition ${item.isComplete ? 'bg-green-50/30' : 'bg-yellow-50/30'
                                    }`}
                            >
                                <td className="px-4 py-3 text-slate-900">{index + 1}</td>
                                <td className="px-4 py-3 font-medium text-slate-900">{item.nik}</td>
                                <td className="px-4 py-3 text-slate-900">
                                    {item.fullName || (
                                        <span className="text-slate-400 italic">Belum diisi</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                    {item.address ? (
                                        <span className="line-clamp-2">{item.address}</span>
                                    ) : (
                                        <span className="text-slate-400 italic">Belum diisi</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {item.ktpFileUrl ? (
                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100">
                                            <FileImage className="h-3.5 w-3.5 text-green-600" />
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100">
                                            <FileImage className="h-3.5 w-3.5 text-yellow-600" />
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {item.isComplete ? (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                            <span className="h-1.5 w-1.5 rounded-full bg-green-600"></span>
                                            Lengkap
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                                            <span className="h-1.5 w-1.5 rounded-full bg-yellow-600"></span>
                                            Belum Lengkap
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <button
                                        onClick={() => onEdit(item.nik)}
                                        disabled={loading}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
                                    >
                                        <Edit className="h-3.5 w-3.5" />
                                        {item.isComplete ? 'Edit' : 'Lengkapi'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Summary */}
            <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">
                        Total: <span className="font-medium text-slate-900">{data.length}</span> NIK
                    </span>
                    <div className="flex items-center gap-4">
                        <span className="text-green-700">
                            Lengkap: <span className="font-medium">{data.filter(d => d.isComplete).length}</span>
                        </span>
                        <span className="text-yellow-700">
                            Belum: <span className="font-medium">{data.filter(d => !d.isComplete).length}</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
