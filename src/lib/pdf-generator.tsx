import React from 'react';
import { Document, Page, View, Text, Image, pdf } from '@react-pdf/renderer';
import type { TemplateData, TemplatePage, Block, TextBlock, ImageBlock, TableBlock, DividerBlock, SpacerBlock, SignatureBlock, ContractDataForTemplate } from './api';
import { API_BASE } from './api';

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

function toRoman(num: number): string {
  const map: Record<number, string> = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X' };
  return map[num] || String(num);
}

function getEmployeeValue(emp: any, dataSource: string, customValue?: string, rowIndex?: number): string {
  if (dataSource === 'custom') return customValue || '';

  // "PKWT I", "PKWT II" — dari pkwt_sequence di DB atau auto dari urutan baris
  if (dataSource === 'auto_no_pkwt') {
    if (emp.pkwt_sequence) return `PKWT ${emp.pkwt_sequence}`;
    return rowIndex !== undefined ? `PKWT ${toRoman(rowIndex + 1)}` : '-';
  }

  // "001/STP/KKWT-4/II/2026" — nomor surat auto-increment
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

function renderBlock(block: Block, data: ContractDataForTemplate): React.ReactNode {
  switch (block.type) {
    case 'text': {
      const b = block as TextBlock;
      const resolved = resolveVariable(b.content, data);
      return React.createElement(Text, {
        key: b.id,
        style: {
          fontSize: b.style.fontSize || 12,
          fontWeight: b.style.bold ? 'bold' : 'normal',
          fontStyle: b.style.italic ? 'italic' : 'normal',
          textDecoration: b.style.underline ? 'underline' : 'none',
          color: b.style.color || '#000000',
          textAlign: b.style.align || 'left',
          lineHeight: b.style.lineHeight || 1.5,
          marginBottom: 4,
        },
      }, resolved);
    }
    case 'image': {
      const b = block as ImageBlock;
      if (!b.src) return null;
      // Convert relative path to absolute URL for @react-pdf/renderer
      const imageSrc = b.src.startsWith('http') ? b.src
        : `${API_BASE}${b.src.startsWith('/') ? '' : '/'}${b.src}`;
      const alignMap: Record<string, 'flex-start' | 'center' | 'flex-end'> = { left: 'flex-start', center: 'center', right: 'flex-end' };
      return React.createElement(View, {
        key: b.id,
        style: { display: 'flex', alignItems: alignMap[b.align] || 'flex-start', marginBottom: 8 },
      }, React.createElement(Image, {
        src: imageSrc,
        style: { width: b.width || 100 },
      }));
    }
    case 'table': {
      const b = block as TableBlock;
      const cols = b.columns;
      if (!cols.length) return null;

      // Ensure all columns have % width and total = 100%
      const parsedWidths = cols.map(c => {
        const n = parseFloat(c.width);
        return isNaN(n) || n <= 0 ? 0 : n;
      });
      const totalWidth = parsedWidths.reduce((a, b) => a + b, 0);
      const widths = totalWidth > 0 && totalWidth < 100
        ? parsedWidths.map((w, i) => i === parsedWidths.length - 1 ? `${100 - parsedWidths.slice(0, -1).reduce((a, b) => a + b, 0)}%` : `${w}%`)
        : cols.map(c => c.width);

      return React.createElement(View, {
        key: b.id,
        style: { marginBottom: 8 },
      },
        // Header row
        React.createElement(View, { style: { display: 'flex', flexDirection: 'row', backgroundColor: '#E8F5E9', borderBottomWidth: 1, borderBottomColor: '#000', borderBottomStyle: 'solid' } },
          ...cols.map((col, ci) => React.createElement(View, {
            key: col.key,
            style: { width: widths[ci], padding: 4, borderRightWidth: 1, borderRightColor: '#ccc', borderRightStyle: 'solid' },
          }, React.createElement(Text, { style: { fontSize: 10, fontWeight: 'bold', textAlign: 'center' } }, col.header)))
        ),
        // Data rows
        ...data.employees.map((emp, idx) =>
          React.createElement(View, {
            key: emp.id || idx,
            style: { display: 'flex', flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#ddd', borderBottomStyle: 'solid' },
          }, ...cols.map((col, ci) => React.createElement(View, {
            key: col.key,
            style: { width: widths[ci], padding: 4, borderRightWidth: 0.5, borderRightColor: '#eee', borderRightStyle: 'solid' },
          }, React.createElement(Text, { style: { fontSize: 10 } },
            getEmployeeValue(emp, col.dataSource, col.customValue, idx)
          ))))
        ),
      );
    }
    case 'divider': {
      const b = block as DividerBlock;
      return React.createElement(View, {
        key: b.id,
        style: {
          borderBottomWidth: b.thickness || 1,
          borderBottomColor: b.color || '#000',
          borderBottomStyle: b.style === 'dashed' ? 'dashed' as any : 'solid' as any,
          marginVertical: 8,
        },
      });
    }
    case 'spacer': {
      const b = block as SpacerBlock;
      return React.createElement(View, { key: b.id, style: { height: b.height || 20 } });
    }
    case 'signature': {
      const b = block as SignatureBlock;
      return React.createElement(View, {
        key: b.id,
        style: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
      },
        React.createElement(View, { style: { width: '40%' } },
          React.createElement(Text, { style: { fontSize: 12, textAlign: 'center' } }, b.leftLabel || ''),
          React.createElement(View, { style: { height: 60 } }),
        ),
        React.createElement(View, { style: { width: '40%' } },
          React.createElement(Text, { style: { fontSize: 12, textAlign: 'center' } }, b.rightLabel || ''),
          React.createElement(View, { style: { height: 60 } }),
          React.createElement(Text, { style: { fontSize: 12, fontWeight: 'bold', textAlign: 'center', textDecoration: 'underline' } }, b.rightName || ''),
          React.createElement(Text, { style: { fontSize: 12, textAlign: 'center' } }, b.rightTitle || ''),
        ),
      );
    }
    default:
      return null;
  }
}

function renderPage(page: TemplatePage, data: ContractDataForTemplate): React.ReactNode {
  const isLandscape = page.orientation === 'landscape';

  return React.createElement(Page, {
    key: page.id,
    size: 'A4',
    orientation: isLandscape ? 'landscape' : 'portrait',
    style: { padding: 40 },
  }, React.createElement(View, {},
    ...page.blocks.map(block => renderBlock(block, data))
  ));
}

export function DocumentPDF({ templateData, contractData }: {
  templateData: TemplateData;
  contractData: ContractDataForTemplate;
}) {
  return React.createElement(Document, {},
    ...templateData.pages.map(page => renderPage(page, contractData))
  ) as any;
}

export async function generatePDFBlob(templateData: TemplateData, contractData: ContractDataForTemplate): Promise<Blob> {
  const doc = DocumentPDF({ templateData, contractData });
  return pdf(doc as any).toBlob();
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
