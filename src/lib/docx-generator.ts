import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, WidthType, BorderStyle, PageOrientation, ImageRun,
} from 'docx';
import type { TemplateData, TemplatePage, Block, TextBlock, ImageBlock, TableBlock, DividerBlock, SpacerBlock, SignatureBlock, ContractDataForTemplate } from './api';
import { API_BASE } from './api';

function toRoman(num: number): string {
  const map: Record<number, string> = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X' };
  return map[num] || String(num);
}

function resolveVariable(content: string, data: ContractDataForTemplate): string {
  const vars: Record<string, string> = {
    '{{nomor_surat}}': data.nomor_surat,
    '{{tanggal_surat}}': data.tanggal_surat,
    '{{company_name}}': data.company_name,
    '{{company_address}}': data.company_address,
    '{{contract_type}}': data.contract_type,
    '{{jumlah_karyawan}}': data.jumlah_karyawan,
    '{{start_date}}': data.start_date,
    '{{end_date}}': data.end_date,
  };
  let result = content;
  for (const [key, val] of Object.entries(vars)) {
    result = result.split(key).join(val);
  }
  return result;
}

function getEmployeeValue(emp: any, dataSource: string, customValue?: string, rowIndex?: number): string {
  if (dataSource === 'custom') return customValue || '';
  if (dataSource === 'auto_no_pkwt') {
    if (emp.pkwt_sequence) return `PKWT ${emp.pkwt_sequence}`;
    return rowIndex !== undefined ? `PKWT ${toRoman(rowIndex + 1)}` : '-';
  }
  if (dataSource === 'auto_nomor_surat') {
    const now = new Date();
    const bulanRomawi = toRoman(now.getMonth() + 1);
    const tahun = now.getFullYear();
    const nomor = String(rowIndex !== undefined ? rowIndex + 1 : 1).padStart(3, '0');
    return `${nomor}/STP/KKWT-4/${bulanRomawi}/${tahun}`;
  }
  const key = dataSource.replace('employee.', '');
  if (key === 'no') return rowIndex !== undefined ? String(rowIndex + 1) : '-';
  const val = emp[key];
  if (val === null || val === undefined) return '-';
  if (key === 'start_date' || key === 'end_date') {
    const d = new Date(val);
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }
  return String(val);
}

async function fetchImageAsBuffer(src: string): Promise<Buffer | null> {
  try {
    const url = src.startsWith('http') ? src : `${API_BASE}${src.startsWith('/') ? '' : '/'}${src}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const arrayBuf = await res.arrayBuffer();
    return Buffer.from(arrayBuf);
  } catch {
    return null;
  }
}

async function blockToDocx(block: Block, data: ContractDataForTemplate): Promise<(Paragraph | Table)[]> {
  const result: (Paragraph | Table)[] = [];

  switch (block.type) {
    case 'text': {
      const b = block as TextBlock;
      const resolved = resolveVariable(b.content, data);
      const lines = resolved.split('\n');
      for (const line of lines) {
        result.push(new Paragraph({
          alignment: b.style.align === 'center' ? AlignmentType.CENTER
            : b.style.align === 'right' ? AlignmentType.RIGHT
            : b.style.align === 'justify' ? AlignmentType.JUSTIFIED
            : AlignmentType.LEFT,
          spacing: { after: 100, line: b.style.lineHeight ? Math.round(b.style.lineHeight * 240) : 360 },
          children: [
            new TextRun({
              text: line,
              size: (b.style.fontSize || 12) * 2,
              bold: b.style.bold || false,
              italics: b.style.italic || false,
              underline: b.style.underline ? {} : undefined,
              color: b.style.color?.replace('#', '') || '000000',
            }),
          ],
        }));
      }
      break;
    }

    case 'image': {
      const b = block as ImageBlock;
      if (!b.src) break;
      const imgBuffer = await fetchImageAsBuffer(b.src);
      if (imgBuffer) {
        const ext = b.src.toLowerCase().split('.').pop() || 'png';
        const imgType = ext === 'jpg' ? 'jpg' : ext === 'png' ? 'png' : ext === 'gif' ? 'gif' : 'png';
        result.push(new Paragraph({
          alignment: b.align === 'center' ? AlignmentType.CENTER
            : b.align === 'right' ? AlignmentType.RIGHT : AlignmentType.LEFT,
          children: [
            new ImageRun({
              data: imgBuffer,
              type: imgType,
              transformation: { width: b.width || 100, height: Math.round((b.width || 100) * 0.5) },
            }),
          ],
        }));
      }
      break;
    }

    case 'table': {
      const b = block as TableBlock;
      const cols = b.columns;
      if (!cols.length) break;

      // Normalize widths
      const parsedWidths = cols.map(c => {
        const n = parseFloat(c.width);
        return isNaN(n) || n <= 0 ? 100 / cols.length : n;
      });
      const totalWidth = parsedWidths.reduce((a, b) => a + b, 0);
      const widths = totalWidth > 0 && totalWidth < 100
        ? parsedWidths.map((w, i) => i === parsedWidths.length - 1 ? 100 - parsedWidths.slice(0, -1).reduce((a, b) => a + b, 0) : w)
        : parsedWidths;

      // Header row
      const headerRow = new TableRow({
        tableHeader: true,
        children: cols.map((col, ci) => new TableCell({
          width: { size: Math.round(widths[ci]), type: WidthType.PERCENTAGE },
          shading: { fill: 'E8F5E9' },
          borders: { top: { style: BorderStyle.SINGLE, size: 1, color: '999999' }, bottom: { style: BorderStyle.SINGLE, size: 1, color: '999999' }, left: { style: BorderStyle.SINGLE, size: 1, color: '999999' }, right: { style: BorderStyle.SINGLE, size: 1, color: '999999' } },
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: col.header, bold: true, size: 20 })],
          })],
        })),
      });

      // Data rows
      const dataRows = data.employees.map((emp, idx) =>
        new TableRow({
          children: cols.map((col, ci) => new TableCell({
            width: { size: Math.round(widths[ci]), type: WidthType.PERCENTAGE },
            borders: { top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }, bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }, left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }, right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } },
            children: [new Paragraph({
              children: [new TextRun({
                text: getEmployeeValue(emp, col.dataSource, col.customValue, idx),
                size: 20,
              })],
            })],
          })),
        })
      );

      // Table as direct section child, NOT inside Paragraph
      result.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [headerRow, ...dataRows],
      }));
      break;
    }

    case 'divider': {
      const b = block as DividerBlock;
      result.push(new Paragraph({
        spacing: { before: 100, after: 100 },
        border: {
          bottom: {
            style: b.style === 'dashed' ? BorderStyle.DASHED : BorderStyle.SINGLE,
            size: Math.round((b.thickness || 1) * 2),
            color: b.color?.replace('#', '') || '000000',
            space: 1,
          },
        },
        children: [],
      }));
      break;
    }

    case 'spacer': {
      const b = block as SpacerBlock;
      result.push(new Paragraph({
        spacing: { before: Math.round((b.height || 20) * 5.67), after: 0 },
        children: [],
      }));
      break;
    }

    case 'signature': {
      const b = block as SignatureBlock;
      const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
      const borders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

      result.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, borders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: b.leftLabel || '', size: 24 })] })] }),
              new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, borders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: b.rightLabel || '', size: 24 })] })] }),
            ],
          }),
          new TableRow({
            height: { value: 1200, rule: 'atLeast' as const },
            children: [
              new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, borders, children: [new Paragraph({ children: [] })] }),
              new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, borders, children: [new Paragraph({ children: [] })] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, borders, children: [new Paragraph({ children: [] })] }),
              new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, borders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: b.rightName || '', bold: true, size: 24, underline: {} })] })] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, borders, children: [new Paragraph({ children: [] })] }),
              new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, borders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: b.rightTitle || '', size: 22 })] })] }),
            ],
          }),
        ],
      }));
      break;
    }
  }

  return result;
}

async function pageToDocxSection(page: TemplatePage, data: ContractDataForTemplate) {
  const children: (Paragraph | Table)[] = [];
  for (const block of page.blocks) {
    children.push(...(await blockToDocx(block, data)));
  }

  return {
    properties: {
      page: {
        size: {
          width: page.orientation === 'landscape' ? 15840 : 11906,
          height: page.orientation === 'landscape' ? 11906 : 15840,
          orientation: page.orientation === 'landscape' ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT,
        },
        margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
      },
    },
    children,
  };
}

export async function generateDOCXBlob(templateData: TemplateData, contractData: ContractDataForTemplate): Promise<Blob> {
  const sections = await Promise.all(templateData.pages.map(page => pageToDocxSection(page, contractData)));

  const doc = new Document({
    sections,
  });

  return Packer.toBlob(doc);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
