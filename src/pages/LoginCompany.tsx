import { useState } from 'react';
import { login } from '../lib/api';
import { setAuth } from '../store/auth';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';

export default function LoginCompany() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await login(email, password);
      if (String(res.role) !== 'company') {
        throw new Error('Akun bukan perusahaan. Silakan gunakan halaman admin.');
      }
      setAuth(res.token, res.role, res.company_id);
      navigate('/');
    } catch (err: any) {
      setError(err?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#f3f8ff] via-[#e8eef7] to-[#dbe7f2] flex items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <h1 className="text-center text-3xl font-bold tracking-tight text-[#1F4E8C]">Masuk ke E-PKWT</h1>
        <p className="mt-2 text-center text-slate-600">Sistem Elektronik Perjanjian Kerja Waktu Tertentu</p>
        <div className="mt-6 mx-auto w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200">
          <div className="p-6">
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Email Perusahaan</label>
                <div className="relative mt-1">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M2.25 6.75A2.25 2.25 0 014.5 4.5h15a2.25 2.25 0 012.25 2.25v.418a2.25 2.25 0 01-.993 1.874l-7.5 5a2.25 2.25 0 01-2.514 0l-7.5-5A2.25 2.25 0 012.25 7.168V6.75z" /><path d="M2.25 9.428v7.822A2.25 2.25 0 004.5 19.5h15a2.25 2.25 0 002.25-2.25V9.428l-6.933 4.622a3.75 3.75 0 01-4.184 0L2.25 9.428z" /></svg>
                  </span>
                  <input type="email" className="w-full h-10 rounded-lg border border-slate-200 pl-10 pr-3 text-sm placeholder-slate-400 focus:border-[#1F4E8C] focus:ring-2 focus:ring-[#1F4E8C]" placeholder="nama@perusahaan.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700">Kata Sandi</label>
                  <a className="text-sm text-slate-600 hover:text-slate-800" href="#">Lupa kata sandi?</a>
                </div>
                <div className="relative mt-1">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a2.25 2.25 0 00-2.25 2.25v6A2.25 2.25 0 006.75 20.25h10.5A2.25 2.25 0 0019.5 18V12a2.25 2.25 0 00-2.25-2.25v-3A5.25 5.25 0 0012 1.5zM8.25 6.75a3.75 3.75 0 117.5 0v3h-7.5v-3z" /></svg>
                  </span>
                  <input type="password" className="w-full h-10 rounded-lg border border-slate-200 pl-10 pr-3 text-sm placeholder-slate-400 focus:border-[#1F4E8C] focus:ring-2 focus:ring-[#1F4E8C]" placeholder="Masukkan kata sandi" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input id="remember" type="checkbox" className="rounded border-slate-300" />
                <label htmlFor="remember" className="text-sm text-slate-700">Ingat saya</label>
              </div>
              {error && <div className="text-sm text-red-600">{error}</div>}
              <button type="submit" disabled={loading} className="w-full h-10 rounded-md bg-[#1F4E8C] text-white text-sm font-medium hover:bg-[#1b437b] disabled:opacity-50 flex items-center justify-center gap-2">{loading && <ClipLoader size={16} color="#ffffff" />}{loading ? 'Memproses...' : 'Masuk ke Sistem'}</button>
            </form>
            <div className="mt-4 border-t pt-4 text-sm text-slate-600 flex items-center justify-between">
              <a className="hover:text-slate-800" href="#">Pusat Bantuan</a>
              <a className="hover:text-slate-800" href="#">Hubungi Admin DISNAKER</a>
            </div>
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-slate-600">Belum memiliki akun? <a className="text-[#1F4E8C] hover:underline" href="#">Daftar Perusahaan</a></p>
      </div>
    </div>
  );
}
