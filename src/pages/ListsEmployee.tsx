import { Users } from 'lucide-react';

export default function ListsEmployee() {
    return (
        <div className="p-0">
            <div className="px-6 pt-6 pb-2">
                <p className="text-sm text-gray-500">Daftar karyawan kontrak yang terdaftar</p>
            </div>

            {/* Placeholder content */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                            <Users className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Daftar Karyawan Kosong</h3>
                        <p className="text-sm text-gray-500 mt-1">Belum ada data karyawan yang tersedia</p>
                    </div>
                </div>
            </div>
        </div>
    );
}