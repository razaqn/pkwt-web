import type { Block, TextBlock, ImageBlock, TableBlock, DividerBlock, SpacerBlock, SignatureBlock, TableColumn } from '../../lib/api';

interface PropertyPanelProps {
  block: Block | null;
  onUpdate: (block: Block) => void;
  onDelete: (id: string) => void;
}

export default function PropertyPanel({ block, onUpdate, onDelete }: PropertyPanelProps) {
  if (!block) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-xs text-slate-400 text-center">Pilih block untuk mengedit propertinya</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-1">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Properti: {block.type}
        </h3>
        <button
          type="button"
          onClick={() => onDelete(block.id)}
          className="rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50"
        >
          Hapus
        </button>
      </div>

      {block.type === 'text' && <TextProperties block={block as TextBlock} onUpdate={onUpdate} />}
      {block.type === 'image' && <ImageProperties block={block as ImageBlock} onUpdate={onUpdate} />}
      {block.type === 'table' && <TableProperties block={block as TableBlock} onUpdate={onUpdate} />}
      {block.type === 'divider' && <DividerProperties block={block as DividerBlock} onUpdate={onUpdate} />}
      {block.type === 'spacer' && <SpacerProperties block={block as SpacerBlock} onUpdate={onUpdate} />}
      {block.type === 'signature' && <SignatureProperties block={block as SignatureBlock} onUpdate={onUpdate} />}
    </div>
  );
}

function TextProperties({ block, onUpdate }: { block: TextBlock; onUpdate: (b: Block) => void }) {
  const s = block.style;
  const update = (changes: Partial<TextBlock['style']>) => {
    onUpdate({ ...block, style: { ...s, ...changes } });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-slate-600">Ukuran Font</label>
        <input type="number" min={6} max={72} value={s.fontSize || 12}
          onChange={e => update({ fontSize: Number(e.target.value) })}
          className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
        />
      </div>
      <div className="flex gap-2">
        <button onClick={() => update({ bold: !s.bold })}
          className={`rounded px-3 py-1 text-xs font-bold ${s.bold ? 'bg-primary text-white' : 'bg-slate-100'}`}>B</button>
        <button onClick={() => update({ italic: !s.italic })}
          className={`rounded px-3 py-1 text-xs italic ${s.italic ? 'bg-primary text-white' : 'bg-slate-100'}`}>I</button>
        <button onClick={() => update({ underline: !s.underline })}
          className={`rounded px-3 py-1 text-xs underline ${s.underline ? 'bg-primary text-white' : 'bg-slate-100'}`}>U</button>
      </div>
      <div>
        <label className="text-xs text-slate-600">Warna</label>
        <input type="color" value={s.color || '#000000'}
          onChange={e => update({ color: e.target.value })}
          className="mt-1 h-8 w-full rounded border border-slate-300"
        />
      </div>
      <div>
        <label className="text-xs text-slate-600">Align</label>
        <div className="mt-1 flex gap-1">
          {(['left', 'center', 'right', 'justify'] as const).map(a => (
            <button key={a} onClick={() => update({ align: a })}
              className={`rounded px-3 py-1 text-xs capitalize ${s.align === a ? 'bg-primary text-white' : 'bg-slate-100'}`}>
              {a === 'justify' ? 'Rata' : a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ImageProperties({ block, onUpdate }: { block: ImageBlock; onUpdate: (b: Block) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-slate-600">Lebar (px)</label>
        <input type="number" min={10} max={500} value={block.width || 100}
          onChange={e => onUpdate({ ...block, width: Number(e.target.value) })}
          className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
        />
      </div>
      <div>
        <label className="text-xs text-slate-600">Posisi</label>
        <div className="mt-1 flex gap-1">
          {(['left', 'center', 'right'] as const).map(a => (
            <button key={a} onClick={() => onUpdate({ ...block, align: a })}
              className={`rounded px-3 py-1 text-xs capitalize ${block.align === a ? 'bg-primary text-white' : 'bg-slate-100'}`}>
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function TableProperties({ block, onUpdate }: { block: TableBlock; onUpdate: (b: Block) => void }) {
  const columns = block.columns || [];

  const updateColumn = (idx: number, col: Partial<TableColumn>) => {
    const newCols = [...columns];
    newCols[idx] = { ...newCols[idx], ...col };
    onUpdate({ ...block, columns: newCols });
  };

  const addColumn = () => {
    const newCols = [...columns, { key: `col_${columns.length}`, header: 'Kolom', width: '20%', dataSource: 'custom', customValue: '' }];
    onUpdate({ ...block, columns: newCols });
  };

  const removeColumn = (idx: number) => {
    onUpdate({ ...block, columns: columns.filter((_, i) => i !== idx) });
  };

  const DATA_SOURCES = [
    { value: 'custom', label: 'Manual (ketik)' },
    { value: 'employee.no', label: 'Nomor Urut' },
    { value: 'employee.nik', label: 'NIK' },
    { value: 'employee.full_name', label: 'Nama Lengkap' },
    { value: 'employee.gender', label: 'Kelamin' },
    { value: 'employee.position', label: 'Jabatan' },
    { value: 'employee.address', label: 'Alamat' },
    { value: 'employee.start_date', label: 'Tanggal Mulai' },
    { value: 'employee.end_date', label: 'Tanggal Berakhir' },
    { value: 'auto_no_pkwt', label: 'PKWT ke- (auto dari DB/urutan)' },
    { value: 'auto_nomor_surat', label: 'No.PKWT (auto: 001/STP/KKWT-4/II/2026)' },
  ];

  return (
    <div className="space-y-3">
      {columns.map((col, idx) => (
        <div key={idx} className="rounded border border-slate-200 p-2 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Kolom {idx + 1}</span>
            <button onClick={() => removeColumn(idx)} className="text-xs text-red-600 hover:underline">Hapus</button>
          </div>
          <input type="text" placeholder="Header" value={col.header}
            onChange={e => updateColumn(idx, { header: e.target.value })}
            className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
          />
          <select value={col.dataSource}
            onChange={e => updateColumn(idx, { dataSource: e.target.value })}
            className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
          >
            {DATA_SOURCES.map(ds => <option key={ds.value} value={ds.value}>{ds.label}</option>)}
          </select>
          {col.dataSource === 'custom' && (
            <input type="text" placeholder="Nilai tetap" value={col.customValue || ''}
              onChange={e => updateColumn(idx, { customValue: e.target.value })}
              className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
            />
          )}
          <input type="text" placeholder="Lebar (ex: 15%)" value={col.width}
            onChange={e => updateColumn(idx, { width: e.target.value })}
            className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
          />
        </div>
      ))}
      <button onClick={addColumn}
        className="w-full rounded border border-dashed border-slate-300 py-2 text-xs text-slate-500 hover:border-primary hover:text-primary">
        + Tambah Kolom
      </button>
    </div>
  );
}

function DividerProperties({ block, onUpdate }: { block: DividerBlock; onUpdate: (b: Block) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-slate-600">Style</label>
        <select value={block.style} onChange={e => onUpdate({ ...block, style: e.target.value as 'solid' | 'dashed' })}
          className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm">
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
        </select>
      </div>
      <div>
        <label className="text-xs text-slate-600">Warna</label>
        <input type="color" value={block.color} onChange={e => onUpdate({ ...block, color: e.target.value })}
          className="mt-1 h-8 w-full rounded border border-slate-300" />
      </div>
      <div>
        <label className="text-xs text-slate-600">Ketebalan</label>
        <input type="number" min={0.5} max={5} step={0.5} value={block.thickness}
          onChange={e => onUpdate({ ...block, thickness: Number(e.target.value) })}
          className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm" />
      </div>
    </div>
  );
}

function SpacerProperties({ block, onUpdate }: { block: SpacerBlock; onUpdate: (b: Block) => void }) {
  return (
    <div>
      <label className="text-xs text-slate-600">Tinggi (px)</label>
      <input type="number" min={5} max={200} value={block.height}
        onChange={e => onUpdate({ ...block, height: Number(e.target.value) })}
        className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm" />
    </div>
  );
}

function SignatureProperties({ block, onUpdate }: { block: SignatureBlock; onUpdate: (b: Block) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-slate-600">Label Kiri</label>
        <input type="text" value={block.leftLabel}
          onChange={e => onUpdate({ ...block, leftLabel: e.target.value })}
          className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
          placeholder="Pihak Perusahaan" />
      </div>
      <div>
        <label className="text-xs text-slate-600">Label Kanan</label>
        <input type="text" value={block.rightLabel}
          onChange={e => onUpdate({ ...block, rightLabel: e.target.value })}
          className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
          placeholder="Kepala Dinas" />
      </div>
      <div>
        <label className="text-xs text-slate-600">Nama (Kanan)</label>
        <input type="text" value={block.rightName}
          onChange={e => onUpdate({ ...block, rightName: e.target.value })}
          className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
          placeholder="Nama Pejabat" />
      </div>
      <div>
        <label className="text-xs text-slate-600">NIP/Gelar (Kanan)</label>
        <input type="text" value={block.rightTitle}
          onChange={e => onUpdate({ ...block, rightTitle: e.target.value })}
          className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
          placeholder="NIP. XXXXXXXX" />
      </div>
    </div>
  );
}
