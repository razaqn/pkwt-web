import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
import { MoonLoader, ClipLoader } from 'react-spinners';
import { getDocumentTemplates, deleteDocumentTemplate } from '../../lib/api';
import type { DocumentTemplate } from '../../lib/api';
import { toUserMessage } from '../../lib/errors';
import { useDialog } from '../../hooks/useDialog';

export default function DocumentTemplates() {
  const navigate = useNavigate();
  const dialog = useDialog();
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  async function fetchTemplates() {
    setLoading(true);
    try {
      const res = await getDocumentTemplates();
      setTemplates(res.data);
    } catch (err: any) {
      setError(toUserMessage(err, 'Gagal memuat template'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchTemplates(); }, []);

  async function handleDelete(id: string, name: string) {
    const confirmed = await dialog.confirm({
      title: 'Hapus Template',
      message: `Apakah Anda yakin ingin menghapus "${name}"?`,
      tone: 'warning',
      confirmText: 'Hapus',
    });
    if (!confirmed) return;

    setDeleting(id);
    try {
      await deleteDocumentTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      await dialog.alert({ title: 'Error', message: toUserMessage(err, 'Gagal menghapus'), tone: 'error' });
    } finally {
      setDeleting(null);
    }
  }

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Admin</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Template Dokumen</h1>
          <p className="mt-1 text-sm text-slate-600">Kelola template dokumen resmi disnaker untuk persetujuan kontrak.</p>
        </div>
        <button onClick={() => navigate('/admin/document-templates/new')}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Buat Template Baru
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <MoonLoader size={40} color="#419823" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>
      ) : templates.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <FileText className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-3 text-sm font-semibold text-slate-700">Belum ada template</p>
          <p className="mt-1 text-sm text-slate-500">Buat template dokumen pertama Anda.</p>
          <button onClick={() => navigate('/admin/document-templates/new')}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
            <Plus className="h-4 w-4" /> Buat Template
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map(t => (
            <div key={t.id} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 bg-gradient-to-r from-primary/10 via-white to-secondary/20 px-4 py-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900 truncate">{t.name}</h3>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${t.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {t.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  {t.contract_type} — {t.template_data.pages.length} halaman
                </p>
              </div>
              <div className="p-4">
                {t.description && <p className="text-xs text-slate-600 mb-3">{t.description}</p>}
                <p className="text-xs text-slate-400">Diupdate: {formatDate(t.updated_at)}</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => navigate(`/admin/document-templates/${t.id}/edit`)}
                    className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20">
                    <Edit className="h-3 w-3" /> Edit
                  </button>
                  <button onClick={() => handleDelete(t.id, t.name)} disabled={deleting === t.id}
                    className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50">
                    {deleting === t.id ? <ClipLoader size={10} color="#dc2626" /> : <Trash2 className="h-3 w-3" />}
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
