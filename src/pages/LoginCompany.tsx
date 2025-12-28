import { useState } from 'react';
import { login } from '../lib/api';
import { setAuth } from '../store/auth';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { toUserMessage } from '../lib/errors';
import { Mail, Phone } from 'lucide-react';

type LoginMethod = 'email' | 'phone';

export default function LoginCompany() {
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  function handleTabChange(method: LoginMethod) {
    setLoginMethod(method);
    setError(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const credentials = loginMethod === 'email'
        ? { email, password }
        : { no_handphone: phone, password };

      const res = await login(credentials);
      if (String(res.role) !== 'company') {
        throw new Error('Akun bukan perusahaan. Silakan gunakan halaman admin.');
      }
      setAuth(res.token, res.role, res.company_id);
      navigate('/dashboard');
    } catch (err: any) {
      setError(toUserMessage(err, 'Login gagal'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#f3f8ff] via-[#e8eef7] to-[#dbe7f2] flex items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <div className="flex justify-center mb-6">
          <img src="/siap-pkwt-logo-1.png" alt="siap PKWT Logo" className="h-30 w-auto" />
        </div>
        <p className="mt-2 text-center text-slate-600">Sistem Aplikasi Pencatatan PKWT</p>
        <div className="mt-6 mx-auto w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200">
          <div className="p-6">
            {/* Tab Switcher */}
            <div className="flex mb-6 border-b border-slate-200">
              <button
                type="button"
                onClick={() => handleTabChange('email')}
                className={`flex items-center justify-center gap-2 flex-1 py-3 text-sm font-medium transition-colors ${loginMethod === 'email'
                    ? 'text-primary border-b-2 border-primary -mb-px'
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                <Mail size={16} />
                Email
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('phone')}
                className={`flex items-center justify-center gap-2 flex-1 py-3 text-sm font-medium transition-colors ${loginMethod === 'phone'
                    ? 'text-primary border-b-2 border-primary -mb-px'
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                <Phone size={16} />
                No. Telepon
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              {/* Email Input */}
              {loginMethod === 'email' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">Email Perusahaan</label>
                  <div className="relative mt-1">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                      <Mail size={18} />
                    </span>
                    <input
                      type="email"
                      className="w-full h-10 rounded-lg border border-slate-200 pl-10 pr-3 text-sm placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary"
                      placeholder="nama@perusahaan.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Phone Input */}
              {loginMethod === 'phone' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">No. Telepon Perusahaan</label>
                  <div className="relative mt-1">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                      <Phone size={18} />
                    </span>
                    <input
                      type="tel"
                      className="w-full h-10 rounded-lg border border-slate-200 pl-10 pr-3 text-sm placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary"
                      placeholder="08xxxxxxxxxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      minLength={8}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700">Kata Sandi</label>
                  <a className="text-sm text-slate-600 hover:text-slate-800" href="#">Lupa kata sandi?</a>
                </div>
                <div className="relative mt-1">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a2.25 2.25 0 00-2.25 2.25v6A2.25 2.25 0 006.75 20.25h10.5A2.25 2.25 0 0019.5 18V12a2.25 2.25 0 00-2.25-2.25v-3A5.25 5.25 0 0012 1.5zM8.25 6.75a3.75 3.75 0 117.5 0v3h-7.5v-3z" /></svg>
                  </span>
                  <input
                    type="password"
                    className="w-full h-10 rounded-lg border border-slate-200 pl-10 pr-3 text-sm placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary"
                    placeholder="Masukkan kata sandi"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input id="remember" type="checkbox" className="rounded border-slate-300" />
                <label htmlFor="remember" className="text-sm text-slate-700">Ingat saya</label>
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-md bg-secondary text-slate-900 text-sm font-medium hover:bg-secondary/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <ClipLoader size={16} color="#1F2937" />}
                {loading ? 'Memproses...' : 'Masuk ke Sistem'}
              </button>
            </form>

            <div className="mt-4 border-t pt-4 text-sm text-slate-600 flex items-center justify-between">
              <a className="hover:text-slate-800" href="#">Pusat Bantuan</a>
              <a className="hover:text-slate-800" href="#">Hubungi Admin DISNAKER</a>
            </div>
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-slate-600">Belum memiliki akun? <a className="text-primary hover:underline" href="https://adikara.vercel.app/register/company" target="_blank" rel="noopener noreferrer">Daftar Perusahaan</a></p>
      </div>
    </div>
  );
}
