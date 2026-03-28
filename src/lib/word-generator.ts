import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  type ITableCellOptions,
} from 'docx';
import type { ApprovalDetail, ApprovalEmployee } from './api';

export interface ContractDocData {
  companyName: string;
  companyAddress: string;
  contractType: 'PKWT' | 'PKWTT';
  startDate: string;
  durationMonths: number | null;
  employees: ApprovalEmployee[];
}

function formatDateToIndonesian(dateString: string): string {
  const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(dateString);
  const date = m
    ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    : new Date(dateString);

  if (Number.isNaN(date.getTime())) return dateString;

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function todayIndonesian(): string {
  return formatDateToIndonesian(new Date().toISOString().slice(0, 10));
}

function buildEmployeeTable(employees: ApprovalEmployee[]): Table {
  const headerCells: ITableCellOptions[] = [
    { children: [new Paragraph({ children: [new TextRun({ text: 'No', bold: true, size: 20 })], alignment: AlignmentType.CENTER })], width: { size: 8, type: WidthType.PERCENTAGE }, shading: { fill: 'E8F5E9' } },
    { children: [new Paragraph({ children: [new TextRun({ text: 'NIK', bold: true, size: 20 })], alignment: AlignmentType.CENTER })], width: { size: 22, type: WidthType.PERCENTAGE }, shading: { fill: 'E8F5E9' } },
    { children: [new Paragraph({ children: [new TextRun({ text: 'Nama Lengkap', bold: true, size: 20 })], alignment: AlignmentType.CENTER })], width: { size: 30, type: WidthType.PERCENTAGE }, shading: { fill: 'E8F5E9' } },
    { children: [new Paragraph({ children: [new TextRun({ text: 'Alamat', bold: true, size: 20 })], alignment: AlignmentType.CENTER })], width: { size: 25, type: WidthType.PERCENTAGE }, shading: { fill: 'E8F5E9' } },
    { children: [new Paragraph({ children: [new TextRun({ text: 'Jabatan', bold: true, size: 20 })], alignment: AlignmentType.CENTER })], width: { size: 15, type: WidthType.PERCENTAGE }, shading: { fill: 'E8F5E9' } },
  ];

  const headerRow = new TableRow({
    children: headerCells.map(c => new TableCell({ ...c, borders: { top: { style: BorderStyle.SINGLE, size: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1 }, left: { style: BorderStyle.SINGLE, size: 1 }, right: { style: BorderStyle.SINGLE, size: 1 } } })),
    tableHeader: true,
  });

  const dataRows = employees.map((emp, idx) => {
    const cells: ITableCellOptions[] = [
      { children: [new Paragraph({ children: [new TextRun({ text: String(idx + 1), size: 20 })], alignment: AlignmentType.CENTER })], width: { size: 8, type: WidthType.PERCENTAGE } },
      { children: [new Paragraph({ children: [new TextRun({ text: emp.nik, size: 20 })] })], width: { size: 22, type: WidthType.PERCENTAGE } },
      { children: [new Paragraph({ children: [new TextRun({ text: emp.full_name, size: 20 })] })], width: { size: 30, type: WidthType.PERCENTAGE } },
      { children: [new Paragraph({ children: [new TextRun({ text: emp.address || '-', size: 20 })] })], width: { size: 25, type: WidthType.PERCENTAGE } },
      { children: [new Paragraph({ children: [new TextRun({ text: emp.position || '-', size: 20 })] })], width: { size: 15, type: WidthType.PERCENTAGE } },
    ];
    return new TableRow({
      children: cells.map(c => new TableCell({ ...c, borders: { top: { style: BorderStyle.SINGLE, size: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1 }, left: { style: BorderStyle.SINGLE, size: 1 }, right: { style: BorderStyle.SINGLE, size: 1 } } })),
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  });
}

function buildSignatureBlock(): Paragraph[] {
  return [
    new Paragraph({ spacing: { before: 600 } }),
    new Paragraph({ children: [new TextRun({ text: '_____________________, _____________________', size: 20 })], alignment: AlignmentType.RIGHT }),
    new Paragraph({ spacing: { before: 200 } }),
    new Paragraph({ children: [new TextRun({ text: 'Pihak Pertama', bold: true, size: 20 })], alignment: AlignmentType.RIGHT }),
    new Paragraph({ spacing: { before: 400 } }),
    new Paragraph({ children: [new TextRun({ text: '( _____________________ )', size: 20 })], alignment: AlignmentType.RIGHT }),
    new Paragraph({ spacing: { before: 200 } }),
    new Paragraph({ children: [new TextRun({ text: 'Pihak Kedua', bold: true, size: 20 })], alignment: AlignmentType.RIGHT }),
    new Paragraph({ spacing: { before: 400 } }),
    new Paragraph({ children: [new TextRun({ text: '( _____________________ )', size: 20 })], alignment: AlignmentType.RIGHT }),
  ];
}

export async function generateContractDocument(data: ContractDocData): Promise<Blob> {
  const contractTitle = data.contractType === 'PKWT'
    ? 'PERJANJIAN KERJA WAKTU TERTENTU (PKWT)'
    : 'PERJANJIAN KERJA WAKTU TIDAK TERTENTU (PKWTT)';

  const durationText = data.contractType === 'PKWT' && data.durationMonths
    ? `${data.durationMonths} (${data.durationMonths}) bulan`
    : data.contractType === 'PKWTT'
      ? 'Tidak terbatas waktu'
      : '-';

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            children: [new TextRun({ text: contractTitle, bold: true, size: 28 })],
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({ spacing: { after: 200 } }),

          // Company info
          new Paragraph({
            children: [
              new TextRun({ text: 'Nama Perusahaan: ', size: 22 }),
              new TextRun({ text: data.companyName, bold: true, size: 22 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Alamat: ', size: 22 }),
              new TextRun({ text: data.companyAddress, size: 22 }),
            ],
          }),
          new Paragraph({ spacing: { after: 200 } }),

          // Contract details
          new Paragraph({
            children: [
              new TextRun({ text: 'Jenis Kontrak: ', size: 22 }),
              new TextRun({ text: data.contractType, bold: true, size: 22 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Tanggal Mulai: ', size: 22 }),
              new TextRun({ text: formatDateToIndonesian(data.startDate), size: 22 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Durasi: ', size: 22 }),
              new TextRun({ text: durationText, size: 22 }),
            ],
          }),
          new Paragraph({ spacing: { after: 300 } }),

          // Employee table
          new Paragraph({
            children: [new TextRun({ text: 'Daftar Karyawan', bold: true, size: 24 })],
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({ spacing: { after: 100 } }),
          buildEmployeeTable(data.employees),

          // Signature block
          ...buildSignatureBlock(),

          // Footer
          new Paragraph({ spacing: { before: 600 } }),
          new Paragraph({
            children: [new TextRun({ text: `Dokumen digenerate otomatis pada ${todayIndonesian()}`, size: 18, italics: true, color: '888888' })],
            alignment: AlignmentType.CENTER,
          }),
        ],
      },
    ],
  });

  return Packer.toBlob(doc);
}

export function approvalToDocData(approval: ApprovalDetail): ContractDocData {
  return {
    companyName: approval.company.company_name,
    companyAddress: approval.company.address,
    contractType: approval.contract.contract_type,
    startDate: approval.contract.start_date,
    durationMonths: approval.contract.duration_months,
    employees: approval.employees,
  };
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function openBlobInNewTab(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  // Note: URL is revoked when the tab closes or after a delay
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export function getContractFileName(companyName: string, contractType: string): string {
  const sanitized = companyName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
  return `${contractType}_${sanitized}_kontrak.docx`;
}
