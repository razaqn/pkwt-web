export default function Dashboard() {
  return (
    <div className="grid gap-6">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="text-lg font-semibold text-slate-800">Selamat Datang di E-PKWT!</div>
        <p className="mt-1 text-slate-600">Bagian utama akan dibuat kemudian.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="rounded-xl border bg-white p-6 shadow-sm h-40"></div>
        <div className="rounded-xl border bg-white p-6 shadow-sm h-40"></div>
        <div className="rounded-xl border bg-white p-6 shadow-sm h-40"></div>
      </div>
    </div>
  );
}
