import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import { ADMIN_TOKEN_KEY } from '../constants';
import AdminPasswordInput from '../components/AdminPasswordInput';

const violetInput =
  'w-full rounded-lg border border-white/10 bg-black/40 py-2.5 pl-3 pr-11 text-white outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30';

export default function AdminCreateCardUserPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [loading, setLoading] = useState(false);

  const authHeaders = useMemo(() => {
    const t = typeof localStorage !== 'undefined' ? localStorage.getItem(ADMIN_TOKEN_KEY) : '';
    return t?.trim() ? { Authorization: `Bearer ${t.trim()}` } : {};
  }, []);

  const base = useMemo(() => String(API_BASE_URL || '').replace(/\/$/, ''), []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setOk('');
    if (password !== confirm) {
      setErr('Passwords do not match.');
      return;
    }
    if (!base) {
      setErr('API base URL missing (REACT_APP_API_BASE_URL).');
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${base}/admin/provision-card-user`,
        { full_name: fullName.trim(), email: email.trim(), password },
        { headers: { ...authHeaders, 'Content-Type': 'application/json' } },
      );
      const uid = data?.user_id;
      setOk(
        uid
          ? `User ready — ID: ${uid}. They can log in at Card login and complete the wizard.`
          : 'User created. Open Card login with this email and password.',
      );
      setPassword('');
      setConfirm('');
    } catch (ex) {
      const d = ex.response?.data?.detail;
      let msg = typeof d === 'string' ? d : '';
      if (!msg && Array.isArray(d)) msg = d.map((x) => (typeof x === 'object' && x?.msg) || String(x)).join(' ');
      if (!msg && d && typeof d === 'object') msg = d.msg || d.message || '';
      setErr(msg || ex.message || 'Request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-[#0a0c10] px-5 py-6 text-white">
      <header className="mb-6">
        <h1 className="text-lg font-bold uppercase tracking-[0.2em] text-white">Create card user</h1>
        <p className="mt-1 text-sm text-white/45">
          Confirmed account (no email wait). Server needs <code className="text-violet-300/90">SUPABASE_SERVICE_ROLE_KEY</code>.
        </p>
      </header>

      <div className="mx-auto max-w-md rounded-2xl border border-white/[0.08] bg-[#0e1118] p-6">
        {err ? <p className="mb-4 text-sm text-rose-400">{err}</p> : null}
        {ok ? <p className="mb-4 text-sm text-emerald-400/95">{ok}</p> : null}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="cc-name" className="block text-xs font-medium uppercase tracking-wider text-white/40">
              Full name
            </label>
            <input
              id="cc-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-violet-500/50"
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="cc-email" className="block text-xs font-medium uppercase tracking-wider text-white/40">
              Gmail / email
            </label>
            <input
              id="cc-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-violet-500/50"
              autoComplete="off"
            />
          </div>
          <AdminPasswordInput
            id="cc-pw"
            label="Password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            show={showPw}
            onToggle={() => setShowPw((v) => !v)}
            required
            minLength={8}
            inputClassName={violetInput}
          />
          <AdminPasswordInput
            id="cc-pw2"
            label="Confirm password"
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
            show={showCf}
            onToggle={() => setShowCf((v) => !v)}
            required
            minLength={8}
            inputClassName={violetInput}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:opacity-95 disabled:opacity-50"
          >
            {loading ? 'Creating…' : 'Create user & card access'}
          </button>
        </form>

        <div className="mt-6 flex flex-wrap gap-3 border-t border-white/10 pt-6 text-sm">
          <button
            type="button"
            className="text-violet-300/90 underline-offset-2 hover:underline"
            onClick={() => navigate('/card/login')}
          >
            Open card login
          </button>
          <button
            type="button"
            className="text-white/50 hover:text-white/80"
            onClick={() => navigate('/admin/users')}
          >
            ← Users list
          </button>
        </div>
      </div>
    </div>
  );
}
