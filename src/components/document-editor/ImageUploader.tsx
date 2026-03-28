import { useState } from 'react';
import { Upload } from 'lucide-react';
import { uploadTemplateImage, API_BASE } from '../../lib/api';

interface ImageUploaderProps {
  onUpload: (url: string) => void;
  currentSrc?: string;
}

function resolveImageUrl(src: string): string {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  return `${API_BASE}${src.startsWith('/') ? '' : '/'}${src}`;
}

export default function ImageUploader({ onUpload, currentSrc }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Maksimal 5MB');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const res = await uploadTemplateImage(file);
      onUpload(res.data.file_path);
    } catch (err: any) {
      setError('Gagal upload');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-xs text-slate-600">Gambar</label>
      {currentSrc ? (
        <div className="space-y-2">
          <div className="rounded border border-slate-200 bg-slate-50 p-2">
            <img src={resolveImageUrl(currentSrc)} alt="Preview" className="max-h-24 mx-auto object-contain" />
          </div>
          <button type="button" onClick={() => onUpload('')}
            className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50">
            Ganti Gambar
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-4 cursor-pointer hover:border-primary/50 transition">
          {uploading ? (
            <span className="text-xs text-slate-500">Mengupload...</span>
          ) : (
            <>
              <Upload className="h-6 w-6 text-slate-400 mb-1" />
              <span className="text-xs text-slate-600">Pilih gambar</span>
              <span className="text-xs text-slate-400">PNG, JPG, max 5MB</span>
            </>
          )}
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploading} />
        </label>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
