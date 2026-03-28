import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { ClipLoader, MoonLoader } from 'react-spinners';
import { getDocumentTemplate, createDocumentTemplate, updateDocumentTemplate } from '../../lib/api';
import type { Block, TemplatePage, TemplateData, TextBlock, ImageBlock, TableBlock, DividerBlock, SpacerBlock, SignatureBlock } from '../../lib/api';
import BlockPalette from '../../components/document-editor/BlockPalette';
import TextBlockEditor from '../../components/document-editor/TextBlockEditor';
import PropertyPanel from '../../components/document-editor/PropertyPanel';
import VariableDropdown from '../../components/document-editor/VariableDropdown';
import ImageUploader from '../../components/document-editor/ImageUploader';
import { toUserMessage } from '../../lib/errors';
import { useDialog } from '../../hooks/useDialog';

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function createBlock(type: string): Block {
  switch (type) {
    case 'text': return { id: generateId(), type: 'text', content: '', style: { fontSize: 12, align: 'left' } };
    case 'image': return { id: generateId(), type: 'image', src: '', width: 100, align: 'left' };
    case 'table': return { id: generateId(), type: 'table', columns: [
      { key: 'no', header: 'No', width: '5%', dataSource: 'employee.no' },
      { key: 'nik', header: 'NIK', width: '14%', dataSource: 'employee.nik' },
      { key: 'full_name', header: 'Nama Lengkap', width: '18%', dataSource: 'employee.full_name' },
      { key: 'position', header: 'Jabatan', width: '12%', dataSource: 'employee.position' },
      { key: 'no_pkwt', header: 'No.PKWT', width: '20%', dataSource: 'auto_nomor_surat' },
      { key: 'pkwt_ke', header: 'PKWT ke', width: '8%', dataSource: 'auto_no_pkwt' },
      { key: 'start_date', header: 'Tgl Mulai', width: '12%', dataSource: 'employee.start_date' },
      { key: 'end_date', header: 'Tgl Berakhir', width: '12%', dataSource: 'employee.end_date' },
    ] };
    case 'divider': return { id: generateId(), type: 'divider', style: 'solid', color: '#000000', thickness: 1 };
    case 'spacer': return { id: generateId(), type: 'spacer', height: 20 };
    case 'signature': return { id: generateId(), type: 'signature', leftLabel: '', rightLabel: '', rightName: '', rightTitle: '' };
    default: return { id: generateId(), type: 'text', content: '', style: { fontSize: 11 } };
  }
}

function createPage(): TemplatePage {
  return { id: generateId(), orientation: 'portrait', size: 'A4', blocks: [] };
}

const EMPTY_TEMPLATE: TemplateData = {
  pages: [createPage(), createPage(), createPage()],
};

export default function DocumentTemplateEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = id && id !== 'new';
  const dialog = useDialog();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [contractType, setContractType] = useState<'PKWT' | 'PKWTT' | 'BOTH'>('BOTH');
  const [templateData, setTemplateData] = useState<TemplateData>(EMPTY_TEMPLATE);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [selectedPageIdx, setSelectedPageIdx] = useState(0);
  const [loading, setLoading] = useState(!!isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await getDocumentTemplate(id!);
        if (cancelled) return;
        const t = res.data;
        setName(t.name);
        setDescription(t.description || '');
        setContractType(t.contract_type);
        setTemplateData(t.template_data);
      } catch (err: any) {
        if (!cancelled) setError(toUserMessage(err, 'Gagal memuat template'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id, isEdit]);

  const currentPage = templateData.pages[selectedPageIdx] || templateData.pages[0];

  const addBlock = useCallback((type: string) => {
    const block = createBlock(type);
    setTemplateData(prev => {
      const pages = [...prev.pages];
      const page = { ...pages[selectedPageIdx] };
      page.blocks = [...page.blocks, block];
      pages[selectedPageIdx] = page;
      return { pages };
    });
    setSelectedBlockId(block.id);
  }, [selectedPageIdx]);

  const updateBlock = useCallback((updated: Block) => {
    setTemplateData(prev => {
      const pages = [...prev.pages];
      const page = { ...pages[selectedPageIdx] };
      page.blocks = page.blocks.map(b => b.id === updated.id ? updated : b);
      pages[selectedPageIdx] = page;
      return { pages };
    });
  }, [selectedPageIdx]);

  const deleteBlock = useCallback((blockId: string) => {
    setTemplateData(prev => {
      const pages = [...prev.pages];
      const page = { ...pages[selectedPageIdx] };
      page.blocks = page.blocks.filter(b => b.id !== blockId);
      pages[selectedPageIdx] = page;
      return { pages };
    });
    if (selectedBlockId === blockId) setSelectedBlockId(null);
  }, [selectedPageIdx, selectedBlockId]);

  const addPage = useCallback(() => {
    setTemplateData(prev => ({
      pages: [...prev.pages, createPage()],
    }));
  }, []);

  const deletePage = useCallback((idx: number) => {
    if (templateData.pages.length <= 1) return;
    setTemplateData(prev => ({
      pages: prev.pages.filter((_, i) => i !== idx),
    }));
    if (selectedPageIdx >= templateData.pages.length - 1) {
      setSelectedPageIdx(Math.max(0, templateData.pages.length - 2));
    }
  }, [templateData.pages.length, selectedPageIdx]);

  const toggleOrientation = useCallback((idx: number) => {
    setTemplateData(prev => {
      const pages = [...prev.pages];
      const page = { ...pages[idx] };
      page.orientation = page.orientation === 'portrait' ? 'landscape' : 'portrait';
      pages[idx] = page;
      return { pages };
    });
  }, []);

  const moveBlock = useCallback((blockId: string, direction: 'up' | 'down') => {
    setTemplateData(prev => {
      const pages = [...prev.pages];
      const page = { ...pages[selectedPageIdx] };
      const idx = page.blocks.findIndex(b => b.id === blockId);
      if (idx === -1) return prev;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= page.blocks.length) return prev;
      const blocks = [...page.blocks];
      [blocks[idx], blocks[newIdx]] = [blocks[newIdx], blocks[idx]];
      page.blocks = blocks;
      pages[selectedPageIdx] = page;
      return { pages };
    });
  }, [selectedPageIdx]);

  const selectedBlock = currentPage?.blocks.find(b => b.id === selectedBlockId) || null;

  async function handleSave() {
    if (!name.trim()) {
      setError('Nama template harus diisi');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await updateDocumentTemplate(id!, { name, description, contract_type: contractType, template_data: templateData });
      } else {
        await createDocumentTemplate({ name, description, contract_type: contractType, template_data: templateData });
      }
      await dialog.alert({ title: 'Berhasil', message: 'Template berhasil disimpan', tone: 'success' });
      navigate('/admin/document-templates');
    } catch (err: any) {
      setError(toUserMessage(err, 'Gagal menyimpan template'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <MoonLoader size={48} color="#419823" />
          <span className="text-slate-600 font-medium">Memuat template...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <button onClick={() => navigate('/admin/document-templates')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary mb-1 hover:underline">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </button>
          <h1 className="text-2xl font-bold text-slate-900">{isEdit ? 'Edit Template' : 'Buat Template Baru'}</h1>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50">
          {saving && <ClipLoader size={14} color="#fff" />}
          <Save className="h-4 w-4" />
          {saving ? 'Menyimpan...' : 'Simpan Template'}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Template Info */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600">Nama Template</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Dokumen Persetujuan PKWT"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Jenis Kontrak</label>
            <select value={contractType} onChange={e => setContractType(e.target.value as any)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="BOTH">PKWT & PKWTT</option>
              <option value="PKWT">PKWT saja</option>
              <option value="PKWTT">PKWTT saja</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Deskripsi</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Opsional"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
        </div>
      </div>

      {/* Editor Layout */}
      <div className="flex gap-4" style={{ minHeight: '70vh' }}>
        {/* Left Panel */}
        <div className="w-52 shrink-0 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <BlockPalette onAddBlock={addBlock} />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <VariableDropdown onSelect={() => {}} />
          </div>
        </div>

        {/* Center — Canvas */}
        <div className="flex-1 space-y-3">
          {/* Page tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {templateData.pages.map((page, idx) => (
              <div key={page.id} className="flex items-center gap-1">
                <button onClick={() => { setSelectedPageIdx(idx); setSelectedBlockId(null); }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${selectedPageIdx === idx
                    ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  Hal {idx + 1} ({page.orientation === 'portrait' ? 'P' : 'L'})
                </button>
              </div>
            ))}
            <button onClick={addPage} className="rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs text-slate-500 hover:border-primary hover:text-primary">
              <Plus className="inline h-3 w-3 mr-1" /> Halaman
            </button>
          </div>

          {/* Canvas */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Halaman {selectedPageIdx + 1} — {currentPage.orientation === 'portrait' ? 'Portrait' : 'Landscape'}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleOrientation(selectedPageIdx)}
                  className="rounded px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200">
                  Ubah Orientasi
                </button>
                {templateData.pages.length > 1 && (
                  <button onClick={() => deletePage(selectedPageIdx)}
                    className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50">
                    <Trash2 className="inline h-3 w-3" /> Hapus Halaman
                  </button>
                )}
              </div>
            </div>

            <div className="p-6 space-y-2" style={{ minHeight: 400 }}>
              {currentPage.blocks.length === 0 && (
                <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
                  Klik block di panel kiri untuk menambah konten
                </div>
              )}
              {currentPage.blocks.map((block) => (
                <div key={block.id}
                  onClick={() => setSelectedBlockId(block.id)}
                  className={`group relative rounded-lg border-2 transition cursor-pointer ${selectedBlockId === block.id
                    ? 'border-primary bg-primary/5' : 'border-transparent hover:border-slate-200'}`}>

                  {/* Move controls */}
                  <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition flex flex-col gap-0.5">
                    <button onClick={e => { e.stopPropagation(); moveBlock(block.id, 'up'); }}
                      className="rounded p-0.5 hover:bg-slate-100"><ChevronUp className="h-3 w-3" /></button>
                    <button onClick={e => { e.stopPropagation(); moveBlock(block.id, 'down'); }}
                      className="rounded p-0.5 hover:bg-slate-100"><ChevronDown className="h-3 w-3" /></button>
                  </div>

                  {/* Block content */}
                  <div className="p-3">
                    {block.type === 'text' && (
                      <TextBlockEditor
                        content={(block as TextBlock).content}
                        onChange={content => updateBlock({ ...block, content } as Block)}
                        style={(block as TextBlock).style}
                        selected={selectedBlockId === block.id}
                      />
                    )}
                    {block.type === 'image' && (
                      <ImageUploader
                        onUpload={src => updateBlock({ ...block, src } as Block)}
                        currentSrc={(block as ImageBlock).src}
                      />
                    )}
                    {block.type === 'table' && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs border border-slate-200">
                          <thead>
                            <tr className="bg-green-50">
                              {(block as TableBlock).columns.map(col => (
                                <th key={col.key} className="border border-slate-200 px-2 py-1 text-left font-medium">{col.header}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="text-slate-400">
                              {(block as TableBlock).columns.map(col => (
                                <td key={col.key} className="border border-slate-200 px-2 py-1">
                                  {col.dataSource === 'custom' ? (col.customValue || '-') : `[${col.dataSource}]`}
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                    {block.type === 'divider' && (
                      <hr style={{
                        borderTopWidth: (block as DividerBlock).thickness,
                        borderTopColor: (block as DividerBlock).color,
                        borderTopStyle: (block as DividerBlock).style,
                      }} />
                    )}
                    {block.type === 'spacer' && (
                      <div style={{ height: (block as SpacerBlock).height }} className="border border-dashed border-slate-200 flex items-center justify-center">
                        <span className="text-xs text-slate-300">{(block as SpacerBlock).height}px</span>
                      </div>
                    )}
                    {block.type === 'signature' && (
                      <div className="flex justify-between text-xs text-slate-500">
                        <div className="text-center w-2/5">
                          <p>{(block as SignatureBlock).leftLabel || 'Kiri'}</p>
                          <div className="h-12 border-b border-slate-300 mx-4 my-2" />
                        </div>
                        <div className="text-center w-2/5">
                          <p>{(block as SignatureBlock).rightLabel || 'Kanan'}</p>
                          <div className="h-12 border-b border-slate-300 mx-4 my-2" />
                          <p className="font-medium">{(block as SignatureBlock).rightName || 'Nama'}</p>
                          <p className="text-slate-400">{(block as SignatureBlock).rightTitle || 'NIP'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-56 shrink-0">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sticky top-4">
            <PropertyPanel
              block={selectedBlock}
              onUpdate={updateBlock}
              onDelete={deleteBlock}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
