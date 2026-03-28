import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, WidthType, BorderStyle, PageOrientation,
} from 'docx';
import type { TemplateData, TemplatePage, Block, TextBlock, TableBlock, DividerBlock, SpacerBlock, SignatureBlock, ContractDataForTemplate } from './api';

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

function blockToDocxParagraphs(block: Block, data: ContractDataForTemplate): Paragraph[] {
  const result: Paragraph[] = [];

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

    case 'table': {
      const b = block as TableBlock;
      const cols = b.columns;
      if (!cols.length) break;

      // Header
      const headerRow = new TableRow({
        tableHeader: true,
        children: cols.map(col => new TableCell({
          width: { size: Math.round(parseFloat(col.width) || 100 / cols.length), type: WidthType.PERCENTAGE },
          shading: { fill: 'E8F5E9' },
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: col.header, bold: true, size: 20 })],
          })],
        })),
      });

      // Data rows
      const dataRows = data.employees.map((emp, idx) =>
        new TableRow({
          children: cols.map(col => new TableCell({
            width: { size: Math.round(parseFloat(col.width) || 100 / cols.length), type: WidthType.PERCENTAGE },
            children: [new Paragraph({
              children: [new TextRun({
                text: getEmployeeValue(emp, col.dataSource, col.customValue, idx),
                size: 20,
              })],
            })],
          })),
        })
      );

      result.push(new Paragraph({
        children: [
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [headerRow, ...dataRows],
          }),
        ],
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
      // Use a table with 2 columns for signature layout
      const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
      const borders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

      result.push(new Paragraph({
        spacing: { before: 400 },
        children: [
          new Table({
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
          }),
        ],
      }));
      break;
    }
  }

  return result;
}

function pageToDocxSection(page: TemplatePage, data: ContractDataForTemplate) {
  const paragraphs: Paragraph[] = [];
  for (const block of page.blocks) {
    paragraphs.push(...blockToDocxParagraphs(block, data));
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
    children: paragraphs,
  };
}

export async function generateDOCXBlob(templateData: TemplateData, contractData: ContractDataForTemplate): Promise<Blob> {
  const sections = templateData.pages.map(page => pageToDocxSection(page, contractData));

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
