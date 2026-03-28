import { Type, Image, Table, Minus, MoveVertical, PenLine } from 'lucide-react';

const BLOCK_TYPES = [
  { type: 'text', label: 'Teks', icon: Type, description: 'Tulis konten teks' },
  { type: 'image', label: 'Gambar', icon: Image, description: 'Upload logo/cap/tanda tangan' },
  { type: 'table', label: 'Tabel', icon: Table, description: 'Tabel data karyawan' },
  { type: 'divider', label: 'Garis', icon: Minus, description: 'Garis pemisah' },
  { type: 'spacer', label: 'Spasi', icon: MoveVertical, description: 'Jarak kosong' },
  { type: 'signature', label: 'Tanda Tangan', icon: PenLine, description: 'Blok tanda tangan' },
] as const;

interface BlockPaletteProps {
  onAddBlock: (type: string) => void;
}

export default function BlockPalette({ onAddBlock }: BlockPaletteProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tambah Block</h3>
      <div className="grid grid-cols-2 gap-2">
        {BLOCK_TYPES.map(bt => (
          <button
            key={bt.type}
            type="button"
            onClick={() => onAddBlock(bt.type)}
            className="flex flex-col items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-3 text-center transition hover:border-primary/50 hover:bg-primary/5"
          >
            <bt.icon className="h-5 w-5 text-slate-600" />
            <span className="text-xs font-medium text-slate-700">{bt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
