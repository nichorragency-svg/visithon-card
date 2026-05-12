import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import { ADMIN_TOKEN_KEY, getFastApiRoot } from '../constants';
import AdminPasswordInput from '../components/AdminPasswordInput';
import AdminLoginSelfRegister from './AdminLoginSelfRegister';

function detailMessage(detail) {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((x) => (typeof x === 'object' && x?.msg) || String(x)).join(' ');
  }
  if (detail && typeof detail === 'object') {
    const msg = detail.msg || detail.message;
    if (typeof msg === 'string') return msg;
  }
  return '';
}

const SHOW_SELF_SERVICE_REGISTER =
  String(process.env.REACT_APP_ADMIN_SHOW_REGISTER || '').toLowerCase() === 'true';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [cEmail, setCEmail] = useState('');
  const [cPassword, setCPassword] = useState('');
  const [cConfirm, setCConfirm] = useState('');
  const [cName, setCName] = useState('');
  const [cBootstrap, setCBootstrap] = useState('');
  const [cErr, setCErr] = useState('');
  const [cLoading, setCLoading] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [showCConfirm, setShowCConfirm] = useState(false);
  const [showCBootstrap, setShowCBootstrap] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const base = getFastApiRoot(API_BASE_URL);
      if (!base) {
        setErr(
          'Admin API URL missing. Vercel → Environment Variables → set REACT_APP_API_BASE_URL or REACT_APP_API_URL = FastAPI root (https://…), NOT visithon-card.vercel.app — then Redeploy. Local: npm start uses http://127.0.0.1:8000.',
        );
        return;
      }
      const loginUrl = `${base}/admin/login`;
      const { data } = await axios.post(loginUrl, { email, password });
      const token = data?.access_token;
      if (!token) {
        setErr('Invalid response from server.');
        return;
      }
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
      navigate('/admin', { replace: true });
    } catch (ex) {
      const resp = ex.response;
      if (!resp) {
        const base = getFastApiRoot(API_BASE_URL) || '(no base URL)';
        setErr(
          `Server tak request nahi pohonchi (${base}). Backend chal raha hai? CORS / HTTPS theek hai? Error: ${ex.message || 'network'}`,
        );
        return;
      }
      const fromApi = detailMessage(resp.data?.detail);
      setErr(fromApi || 'Login failed. Check email and password.');
    } finally {
      setLoading(false);
    }
  };

  const onCreateAdmin = async (e) => {
    e.preventDefault();
    setCErr('');
    if (cPassword !== cConfirm) {
      setCErr('Passwords do not match.');
      return;
    }
    setCLoading(true);
    try {
      const { data } = await axios.post(`${getFastApiRoot(API_BASE_URL)}/admin/register`, {
        email: cEmail,
        password: cPassword,
        name: cName.trim() || undefined,
        bootstrap_secret: cBootstrap.trim() || undefined,
      });
      const token = data?.access_token;
      if (!token) {
        setCErr('Invalid response from server.');
        return;
      }
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
      navigate('/admin', { replace: true });
    } catch (ex) {
      setCErr(detailMessage(ex.response?.data?.detail) || 'Could not create admin.');
    } finally {
      setCLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0c10] px-4 py-10">
      <div className="w-full max-w-md space-y-4">
        <div className="rounded-2xl border border-white/10 bg-[#12151c] p-8 shadow-2xl shadow-black/60">
          <h1 className="text-xl font-semibold tracking-tight text-white">Visithon Admin</h1>
          <p className="mt-1 text-sm text-white/45">Restricted access · admins collection only</p>
          <p className="mt-2 break-all text-[11px] leading-snug text-white/35">
            <span className="text-white/50">API base (env):</span>{' '}
            {String(getFastApiRoot(API_BASE_URL) || '').trim() || (
              <span className="text-amber-200/85">empty — address bar wala Vercel URL yahan mat lagao</span>
            )}
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-xs font-medium uppercase tracking-wider text-white/40">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-white placeholder:text-white/25 outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30"
                required
              />
            </div>
            <AdminPasswordInput
              id="admin-password"
              label="Password"
              value={password}
              onChange={setPassword}
              show={showLoginPw}
              onToggle={() => setShowLoginPw((v) => !v)}
              autoComplete="current-password"
              required
            />

            {err ? <p className="text-sm text-rose-400">{err}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-medium text-white transition hover:bg-teal-500 disabled:opacity-50"
            >
              {loading ? 'Logging in…' : 'Login'}
            </button>
          </form>

          <div className="mt-6 border-t border-white/10 pt-6 space-y-2">
            {!SHOW_SELF_SERVICE_REGISTER ? (
              <p className="text-xs leading-relaxed text-white/45">
                <strong className="text-white/60">Super admin:</strong> Mongo admins only. Reset:{' '}
                <code className="rounded bg-black/40 px-1 text-[11px] text-teal-200/90">
                  python scripts/create_visithon_admin.py --reset you@example.com NewPassword123
                </code>
                . Extra self-service admin UI is off by default.
              </p>
            ) : (
              <AdminLoginSelfRegister
                showCreate={showCreate}
                onToggleCreate={() => {
                  setShowCreate((v) => !v);
                  setCErr('');
                }}
                onCreateAdmin={onCreateAdmin}
                cName={cName}
                setCName={setCName}
                cEmail={cEmail}
                setCEmail={setCEmail}
                cPassword={cPassword}
                setCPassword={setCPassword}
                showCPw={showCPw}
                setShowCPw={setShowCPw}
                cConfirm={cConfirm}
                setCConfirm={setCConfirm}
                showCConfirm={showCConfirm}
                setShowCConfirm={setShowCConfirm}
                cBootstrap={cBootstrap}
                setCBootstrap={setCBootstrap}
                showCBootstrap={showCBootstrap}
                setShowCBootstrap={setShowCBootstrap}
                cErr={cErr}
                cLoading={cLoading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
