import { useState } from 'react';

export type DraftEmployee = {
    full_name: string;
    address: string;
    district: string;
    village: string;
    place_of_birth: string;
    birthdate: string;
};

type EmployeeModalProps = {
    nik: string;
    initialData?: DraftEmployee;
    onClose: () => void;
    onSave: (data: DraftEmployee) => void;
};

export function EmployeeDraftModal({ nik, initialData, onClose, onSave }: EmployeeModalProps) {
    const [form, setForm] = useState<DraftEmployee>(initialData || {
        full_name: '',
        address: '',
        district: '',
        village: '',
        place_of_birth: '',
        birthdate: '',
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSave(form);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-xl rounded-xl bg-white shadow-xl border border-slate-200">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
                    <div>
                        <p className="text-sm text-slate-500">Lengkapi data karyawan</p>
                        <h3 className="text-lg font-semibold text-slate-900">NIK {nik}</h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-700"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                            <input
                                type="text"
                                required
                                value={form.full_name}
                                onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tempat Lahir</label>
                            <input
                                type="text"
                                required
                                value={form.place_of_birth}
                                onChange={(e) => setForm((prev) => ({ ...prev, place_of_birth: e.target.value }))}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Lahir</label>
                            <input
                                type="date"
                                required
                                value={form.birthdate}
                                onChange={(e) => setForm((prev) => ({ ...prev, birthdate: e.target.value }))}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Kabupaten/Kota</label>
                            <input
                                type="text"
                                required
                                value={form.district}
                                onChange={(e) => setForm((prev) => ({ ...prev, district: e.target.value }))}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Desa/Kelurahan</label>
                            <input
                                type="text"
                                required
                                value={form.village}
                                onChange={(e) => setForm((prev) => ({ ...prev, village: e.target.value }))}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Alamat</label>
                            <input
                                type="text"
                                required
                                value={form.address}
                                onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Simpan Draft
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
