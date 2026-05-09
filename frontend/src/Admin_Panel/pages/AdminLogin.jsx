import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import { ADMIN_TOKEN_KEY } from '../constants';

function detailMessage(detail) {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((x) => (typeof x === 'object' && x?.msg) || String(x)).join(' ');
  }
  return 'Something went wrong.';
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/admin/login`, { email, password });
      const token = data?.access_token;
      if (!token) {
        setErr('Invalid response from server.');
        return;
      }
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
      navigate('/admin', { replace: true });
    } catch (ex) {
      setErr(detailMessage(ex.response?.data?.detail) || 'Login failed. Check email and password.');
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
      const { data } = await axios.post(`${API_BASE_URL}/admin/register`, {
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
            <div>
              <label htmlFor="admin-password" className="block text-xs font-medium uppercase tracking-wider text-white/40">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-white placeholder:text-white/25 outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30"
                required
              />
            </div>

            {err ? <p className="text-sm text-rose-400">{err}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-medium text-white transition hover:bg-teal-500 disabled:opacity-50"
            >
              {loading ? 'Logging in…' : 'Login'}
            </button>
          </form>

          <div className="mt-6 border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={() => {
                setShowCreate((v) => !v);
                setCErr('');
              }}
              className="w-full rounded-lg border border-white/15 bg-white/5 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10"
            >
              {showCreate ? 'Hide create admin' : 'Create admin'}
            </button>

            {showCreate ? (
              <form onSubmit={onCreateAdmin} className="mt-5 space-y-3">
                <p className="text-xs text-white/40">
                  First admin: leave bootstrap secret empty. Later admins need{' '}
                  <code className="rounded bg-black/40 px-1 text-white/60">ADMIN_BOOTSTRAP_SECRET</code> in server .env
                  and same value below.
                </p>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-white/40">Name (optional)</label>
                  <input
                    type="text"
                    value={cName}
                    onChange={(e) => setCName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-teal-500/50"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-white/40">Email</label>
                  <input
                    type="email"
                    required
                    value={cEmail}
                    onChange={(e) => setCEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-teal-500/50"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-white/40">Password (min 8)</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={cPassword}
                    onChange={(e) => setCPassword(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-teal-500/50"
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-white/40">Confirm password</label>
                  <input
                    type="password"
                    required
                    value={cConfirm}
                    onChange={(e) => setCConfirm(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-teal-500/50"
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-white/40">
                    Bootstrap secret (if admins already exist)
                  </label>
                  <input
                    type="password"
                    value={cBootstrap}
                    onChange={(e) => setCBootstrap(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-teal-500/50"
                    autoComplete="off"
                    placeholder="Only when adding 2nd+ admin"
                  />
                </div>
                {cErr ? <p className="text-sm text-rose-400">{cErr}</p> : null}
                <button
                  type="submit"
                  disabled={cLoading}
                  className="w-full rounded-lg bg-white/15 py-2.5 text-sm font-medium text-white hover:bg-white/20 disabled:opacity-50"
                >
                  {cLoading ? 'Creating…' : 'Create admin account'}
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
