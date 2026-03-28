import { AlertCircle, Paperclip, X, Eye, Download as DownloadIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { ClipLoader } from 'react-spinners';
import { toUserMessage } from '../lib/errors';
import { getDocumentTemplates, getContractDataForTemplate } from '../lib/api';
import type { ApprovalDetail, DocumentTemplate, ContractDataForTemplate } from '../lib/api';
import { generatePDFBlob } from '../lib/pdf-generator';
import { generateDOCXBlob, downloadBlob as downloadDocxBlob } from '../lib/docx-generator';

interface ApprovalActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { comment: string; file: File | null }) => Promise<void>;
    actionType: 'approve' | 'reject';
    loading?: boolean;
    approvalData?: ApprovalDetail | null;
}

export default function ApprovalActionModal({
    isOpen,
    onClose,
    onSubmit,
    actionType,
    loading = false,
    approvalData = null,
}: ApprovalActionModalProps) {
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [fileError, setFileError] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [generating, setGenerating] = useState(false);
    const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
    const [contractData, setContractData] = useState<ContractDataForTemplate | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const MAX_COMMENT_LENGTH = 500;
    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    const isApprove = actionType === 'approve';
    const iconColor = isApprove ? 'text-primary' : 'text-red-600';
    const buttonColor = isApprove
        ? 'bg-primary hover:bg-primary/90'
        : 'bg-red-600 hover:bg-red-700';
    const title = isApprove ? 'Setujui Permohonan' : 'Tolak Permohonan';
    const description = isApprove
        ? 'Anda yakin ingin menyetujui permohonan kontrak ini? Generate dokumen resmi, preview, lalu unggah.'
        : 'Anda yakin ingin menolak permohonan kontrak ini? Silakan berikan alasan penolakan.';

    const commentCount = useMemo(() => comment.length, [comment]);

    // Fetch templates and contract data when modal opens in approve mode
    useEffect(() => {
        if (!isOpen || !isApprove || !approvalData) return;
        let cancelled = false;

        async function fetchData() {
            try {
                const [tplRes, dataRes] = await Promise.all([
                    getDocumentTemplates(),
                    getContractDataForTemplate(approvalData!.contract.id),
                ]);
                if (cancelled) return;

                const activeTemplates = tplRes.data.filter(t => t.is_active);
                setTemplates(activeTemplates);
                setContractData(dataRes.data);

                if (activeTemplates.length > 0) {
                    setSelectedTemplateId(activeTemplates[0].id);
                }
            } catch {
                // Silently fail
            }
        }
        fetchData();
        return () => { cancelled = true; };
    }, [isOpen, isApprove, approvalData]);

    // Generate PDF when template is selected
    useEffect(() => {
        if (!selectedTemplateId || !contractData) return;
        let cancelled = false;

        async function generate() {
            const tpl = templates.find(t => t.id === selectedTemplateId);
            if (!tpl || !contractData) return;

            setGenerating(true);
            setGeneratedBlob(null);
            try {
                const blob = await generatePDFBlob(tpl.template_data, contractData);
                if (!cancelled) setGeneratedBlob(blob);
            } catch {
                // Silently fail
            } finally {
                if (!cancelled) setGenerating(false);
            }
        }
        generate();
        return () => { cancelled = true; };
    }, [selectedTemplateId, contractData, templates]);

    // Focus textarea on open
    useEffect(() => {
        if (isOpen) {
            const t = window.setTimeout(() => textareaRef.current?.focus(), 0);
            return () => window.clearTimeout(t);
        }
    }, [isOpen]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setGeneratedBlob(null);
            setGenerating(false);
            setFile(null);
            setComment('');
            setError('');
            setFileError('');
        }
    }, [isOpen]);

    const handlePreviewDocument = useCallback(() => {
        if (generatedBlob) {
            const url = URL.createObjectURL(generatedBlob);
            window.open(url, '_blank');
            setTimeout(() => URL.revokeObjectURL(url), 60000);
        }
    }, [generatedBlob]);

    const handleDownloadDocument = useCallback(async () => {
        const tpl = templates.find(t => t.id === selectedTemplateId);
        if (!tpl || !contractData || !approvalData) return;
        try {
            const blob = await generateDOCXBlob(tpl.template_data, contractData);
            const name = approvalData.company.company_name.replace(/[^a-zA-Z0-9]/g, '_');
            const type = approvalData.contract.contract_type;
            downloadDocxBlob(blob, `${type}_${name}_disnaker.docx`);
        } catch {
            // fallback: download the preview blob as PDF if DOCX fails
            if (generatedBlob) {
                const url = URL.createObjectURL(generatedBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'document.pdf';
                a.click();
                URL.revokeObjectURL(url);
            }
        }
    }, [selectedTemplateId, contractData, approvalData, templates, generatedBlob]);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setError('');
            setFileError('');

            const trimmedComment = comment.trim();
            if (!isApprove) {
                if (!trimmedComment) {
                    setError('Komentar wajib diisi untuk penolakan');
                    return;
                }
                if (trimmedComment.length < 5) {
                    setError('Komentar minimal 5 karakter');
                    return;
                }
            }

            if (isApprove && !file) {
                setFileError('Dokumen wajib diunggah (PDF atau Word)');
                return;
            }

            try {
                await onSubmit({ comment: trimmedComment, file });
            } catch (err: any) {
                setError(toUserMessage(err, 'Terjadi kesalahan'));
            }
        },
        [comment, file, isApprove, onSubmit]
    );

    const handleClose = useCallback(() => {
        if (!loading) onClose();
    }, [loading, onClose]);

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFileError('');
            const selected = e.target.files?.[0];
            if (!selected) { setFile(null); return; }

            const isPdf = selected.type === 'application/pdf';
            const isDocx = selected.name.toLowerCase().endsWith('.docx');

            if (!isPdf && !isDocx) {
                setFileError('Format file harus PDF atau Word (.docx)');
                setFile(null);
                return;
            }

            if (selected.size > MAX_FILE_SIZE) {
                const sizeMb = (selected.size / 1024 / 1024).toFixed(2);
                setFileError(`File terlalu besar. Maksimal 5MB, file Anda ${sizeMb}MB`);
                setFile(null);
                return;
            }

            setFile(selected);
        },
        []
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-200 p-6">
                    <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isApprove ? 'bg-primary/10' : 'bg-red-100'}`}>
                            <AlertCircle className={`h-6 w-6 ${iconColor}`} />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                    </div>
                    <button onClick={handleClose} disabled={loading}
                        className="text-slate-400 transition-colors hover:text-slate-600 disabled:cursor-not-allowed">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 p-6 max-h-[70vh] overflow-y-auto">
                        <p className="text-sm text-slate-600">{description}</p>

                        {isApprove && (
                            <>
                                {/* Template Selector */}
                                {templates.length > 0 && (
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-slate-700">
                                            Pilih Template Dokumen
                                        </label>
                                        <select
                                            value={selectedTemplateId}
                                            onChange={e => setSelectedTemplateId(e.target.value)}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                        >
                                            {templates.map(t => (
                                                <option key={t.id} value={t.id}>
                                                    {t.name} ({t.template_data.pages.length} halaman)
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Preview & Download */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700">
                                        Dokumen Resmi Disnaker
                                    </label>
                                    {generating ? (
                                        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                                            <ClipLoader size={16} color="#419823" />
                                            <span className="text-sm text-slate-600">Menggenerate dokumen...</span>
                                        </div>
                                    ) : generatedBlob ? (
                                        <div className="flex gap-2">
                                            <button type="button" onClick={handlePreviewDocument}
                                                className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-white px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5">
                                                <Eye className="h-4 w-4" />
                                                Preview
                                            </button>
                                            <button type="button" onClick={handleDownloadDocument}
                                                className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-white px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5">
                                                <DownloadIcon className="h-4 w-4" />
                                                Unduh
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3">
                                            <p className="text-sm text-yellow-700">
                                                {templates.length === 0
                                                    ? 'Tidak ada template aktif. Buat template di menu Dokumen Resmi terlebih dahulu.'
                                                    : 'Gagal menggenerate dokumen. Silakan upload dokumen secara manual.'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* File Upload */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                {isApprove ? 'Unggah Dokumen Disnaker' : 'Unggah Dokumen'}{' '}
                                <span className="text-slate-500 font-normal">(PDF/Word)</span>
                                {isApprove && <span className="text-red-600 ml-1">*</span>}
                            </label>
                            <label
                                className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border ${fileError ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'} px-4 py-3 shadow-sm transition hover:border-primary`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                        <Paperclip className="h-5 w-5 text-primary" />
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-slate-900">
                                            {file ? file.name : 'Pilih file PDF atau Word'}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Maksimal 5MB'}
                                        </span>
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                    onChange={handleFileChange}
                                    disabled={loading}
                                    className="hidden"
                                />
                                <span className="text-sm font-semibold text-primary">Unggah</span>
                            </label>
                            {fileError && <p className="text-sm text-red-600">{fileError}</p>}
                        </div>

                        {/* Comment */}
                        <div>
                            <label htmlFor="comment" className="block text-sm font-medium text-slate-700">
                                Komentar {!isApprove && <span className="text-red-600">*</span>}
                            </label>
                            <textarea
                                id="comment"
                                value={comment}
                                ref={textareaRef}
                                onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT_LENGTH))}
                                rows={4}
                                disabled={loading}
                                placeholder={isApprove ? 'Tambahkan catatan (opsional)' : 'Jelaskan alasan penolakan'}
                                className="mt-1 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:text-slate-500"
                            />
                            <div className="mt-2 flex items-center justify-between">
                                <p className="text-xs text-slate-500">
                                    {!isApprove ? 'Contoh: Dokumen PKWT belum ditandatangani.' : 'Catatan akan tersimpan sebagai komentar admin.'}
                                </p>
                                <p className={`text-xs ${commentCount >= MAX_COMMENT_LENGTH ? 'text-red-600' : 'text-slate-500'}`}>
                                    {commentCount}/{MAX_COMMENT_LENGTH}
                                </p>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                                <AlertCircle className="mt-0.5 h-4 w-4 text-red-600" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                        <button type="button" onClick={handleClose} disabled={loading}
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
                            Batal
                        </button>
                        <button type="submit" disabled={loading}
                            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${buttonColor}`}>
                            {loading && <ClipLoader size={16} color="#ffffff" />}
                            {loading ? 'Memproses...' : isApprove ? 'Setujui' : 'Tolak'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
