const VARIABLES = [
  { key: '{{nomor_surat}}', label: 'Nomor Surat', example: '560/ABC/III/2026' },
  { key: '{{tanggal_surat}}', label: 'Tanggal Surat', example: '27 Maret 2026' },
  { key: '{{company_name}}', label: 'Nama Perusahaan', example: 'PT. ABC Indonesia' },
  { key: '{{company_address}}', label: 'Alamat Perusahaan', example: 'Jl. Sudirman No. 1' },
  { key: '{{contract_type}}', label: 'Jenis Kontrak', example: 'PKWT' },
  { key: '{{jumlah_karyawan}}', label: 'Jumlah Karyawan', example: '3' },
  { key: '{{start_date}}', label: 'Tanggal Mulai', example: '27 Maret 2026' },
  { key: '{{end_date}}', label: 'Tanggal Berakhir', example: '27 Maret 2027' },
];

interface VariableDropdownProps {
  onSelect: (variable: string) => void;
}

export default function VariableDropdown({ onSelect }: VariableDropdownProps) {
  return (
    <div className="space-y-1">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Variabel</h3>
      <p className="text-xs text-slate-400">Klik untuk copy, lalu paste di blok teks</p>
      <div className="space-y-1 max-h-60 overflow-y-auto">
        {VARIABLES.map(v => (
          <button
            key={v.key}
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(v.key);
              onSelect(v.key);
            }}
            className="w-full flex items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition hover:bg-primary/5"
          >
            <span className="font-medium text-slate-700">{v.label}</span>
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-500">{v.key}</code>
          </button>
        ))}
      </div>
    </div>
  );
}
