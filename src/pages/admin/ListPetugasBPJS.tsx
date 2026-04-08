import { useState, useEffect, useCallback } from 'react';
import type { FormEvent } from 'react';
import { Shield, Plus, Edit2, Trash2, X } from 'lucide-react';
import { adminGetUsers, adminCreateUser, adminUpdateUser, adminDeleteUser } from '../../lib/api';
import type { UserItem } from '../../lib/api';
import { useDialog } from '../../hooks/useDialog';
import { toUserMessage } from '../../lib/errors';

// Modal Form
function ModalPetugas({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: UserItem | null;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setEmail(initialData.email || '');
        setPhone(initialData.no_handphone || '');
        setPassword('');
      } else {
        setEmail('');
        setPhone('');
        setPassword('');
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload: any = { role: 'petugas_bpjs' };
      if (email) payload.email = email;
      if (phone) payload.no_handphone = phone;
      if (password) payload.password = password;

      if (!initialData && !password) {
        throw new Error('Password wajib diisi untuk akun baru');
      }

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(toUserMessage(err, 'Gagal menyimpan data'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">
            {initialData ? 'Edit Petugas BPJS' : 'Tambah Petugas BPJS'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-lg border-gray-300 border px-3 py-2 focus:ring-[#48A32A] focus:border-[#48A32A]"
              placeholder="contoh@bpjs.go.id"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">No. Handphone</label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full rounded-lg border-gray-300 border px-3 py-2 focus:ring-[#48A32A] focus:border-[#48A32A]"
              placeholder="081234567890"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password {initialData && <span className="text-gray-400 font-normal">(Kosongkan jika tidak ingin diubah)</span>}
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-lg border-gray-300 border px-3 py-2 focus:ring-[#48A32A] focus:border-[#48A32A]"
              placeholder={initialData ? "••••••••" : "Masukkan password baru"}
              required={!initialData}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border rounded-lg transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-[#48A32A] hover:bg-[#3d8b24] rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ListPetugasBPJS() {
  const { confirm, alert } = useDialog();
  const [data, setData] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;
  const [refreshKey, setRefreshKey] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UserItem | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        const res = await adminGetUsers({ page, limit, role: 'petugas_bpjs' });
        if (isMounted) {
          setData(res.data || []);
          setTotalItems(res.pagination?.total || 0);
        }
      } catch (err: any) {
        if (isMounted) setError(toUserMessage(err, 'Gagal memuat data petugas BPJS'));
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetch();
    return () => { isMounted = false; };
  }, [page, refreshKey]);

  const refetch = useCallback(() => setRefreshKey(v => v + 1), []);

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: UserItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (item: UserItem) => {
    const isOk = await confirm({
      title: 'Hapus Petugas', 
      message: `Apakah Anda yakin ingin menghapus akun ${item.email || item.no_handphone}?`,
      tone: 'error' 
    });
    if (!isOk) return;

    try {
      await adminDeleteUser(item.id);
      refetch();
    } catch (err: any) {
       // Check for 409 error structure
       let msg = toUserMessage(err, 'Gagal menghapus data petugas');
       if (err?.message?.includes('409') || err?.response?.status === 409 || err?.message?.toLowerCase().includes('related records')) {
          msg = 'Pengguna tidak dapat dihapus karena sudah memiliki riwayat data.';
       }
       await alert({ title: 'Error', message: msg, tone: 'error' });
    }
  };

  const handleSubmitModal = async (payload: any) => {
    if (editingItem) {
      await adminUpdateUser(editingItem.id, payload);
    } else {
      await adminCreateUser(payload);
    }
    refetch();
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-[#48A32A]" />
            Akun Petugas BPJS
          </h1>
          <p className="text-gray-500 mt-1">Kelola akun pengguna untuk role petugas BPJS</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-[#48A32A] hover:bg-[#3d8b24] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Tambah Petugas
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading && data.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Memuat data...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <p>{error}</p>
            <button onClick={refetch} className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200">Coba Lagi</button>
          </div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <Shield className="h-12 w-12 text-gray-300 mb-3" />
            <p className="font-medium text-gray-800">Tidak ada Petugas BPJS</p>
            <p className="text-sm">Silakan tambah petugas BPJS baru.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-600 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold text-center w-16">No</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">No Handphone</th>
                  <th className="px-6 py-4 font-semibold">Tgl Dibuat</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-6 py-4 text-center text-gray-500">
                      {(page - 1) * limit + idx + 1}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {item.email || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {item.no_handphone || '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Edit Petugas"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                          title="Hapus Petugas"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Halaman {page} dari {totalPages} (Total: {totalItems})
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1.5 border rounded-md text-sm font-medium disabled:opacity-50 hover:bg-gray-100 bg-white"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1.5 border rounded-md text-sm font-medium disabled:opacity-50 hover:bg-gray-100 bg-white"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      <ModalPetugas
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitModal}
        initialData={editingItem}
      />
    </div>
  );
}
