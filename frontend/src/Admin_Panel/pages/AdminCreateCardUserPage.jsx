import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import { ADMIN_TOKEN_KEY, getFastApiRoot } from '../constants';
import AdminPasswordInput from '../components/AdminPasswordInput';
import {
  applyCardUserSessionPayload,
  navigateToCardWizardEdit,
  restoreAdminToken,
  snapshotAdminToken,
} from '../utils/adminCardSession';

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

  const base = useMemo(() => getFastApiRoot(API_BASE_URL), []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setOk('');

    if (password !== confirm) {
      setErr('Passwords do not match.');
      return;
    }

    if (!base) {
      setErr('Backend API configuration missing. Please check your settings.');
      return;
    }

    const adminToken = snapshotAdminToken();
    const emailVal = email.trim().toLowerCase();
    const nameVal = fullName.trim();

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${base}/admin/provision-card-user`,
        { full_name: nameVal, email: emailVal, password },
        { headers: { ...authHeaders, 'Content-Type': 'application/json' } },
      );

      if (data?.ok) {
        let sessionReady = applyCardUserSessionPayload(data, {
          fullName: nameVal,
          email: emailVal,
        });

        if (!sessionReady) {
          const { data: loginData } = await axios.post(
            `${base}/card-auth/login`,
            { email: emailVal, password },
            { headers: { 'Content-Type': 'application/json' } },
          );
          sessionReady = applyCardUserSessionPayload(
            {
              token: loginData?.token,
              card_id: loginData?.user?.id,
              user_id: loginData?.user?.user_id,
              user: loginData?.user,
            },
            { fullName: nameVal, email: emailVal },
          );
        }

        restoreAdminToken(adminToken);

        if (sessionReady) {
          navigateToCardWizardEdit(navigate, {
            cardId: data.card_id,
            userId: data.user_id,
            fullName: nameVal,
            email: emailVal,
            from: 'admin-provision',
          });
          return;
        }
      }

      restoreAdminToken(adminToken);
      setOk(
        data?.user_id
          ? `User created (ID: ${data.user_id}). Sign in on the card app to finish setup.`
          : 'User created successfully.',
      );
      setFullName('');
      setEmail('');
      setPassword('');
      setConfirm('');
    } catch (ex) {
      restoreAdminToken(adminToken);
      const d = ex.response?.data?.detail;
      const detailStr = typeof d === 'string' ? d : '';
      if (ex.response?.status === 503) {
        setErr(
          detailStr ||
            'Server (503): MongoDB unreachable or write failed. Check MONGO_URI on the API server and Atlas IP allowlist.',
        );
      } else {
        let msg = detailStr;
        if (!msg && Array.isArray(d)) msg = d.map((x) => x?.msg || String(x)).join(', ');
        setErr(msg || ex.message || 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-[#0a0c10] px-5 py-6 text-white">
      <header className="mb-6">
        <h1 className="text-lg font-bold uppercase tracking-[0.2em] text-white">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-white/45">
          System Mode: <span className="text-emerald-400 font-medium">MongoDB Direct Access</span>
        </p>
      </header>

      <div className="mx-auto max-w-md rounded-2xl border border-white/[0.08] bg-[#0e1118] p-6 shadow-2xl">
        <h2 className="mb-6 text-xl font-semibold">Create New Card User</h2>

        {err && (
          <div className="mb-4 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-400 border border-rose-500/20 animate-pulse">
            <strong>Error:</strong> {err}
          </div>
        )}

        {ok && (
          <div className="mb-4 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-400 border border-emerald-500/20">
            {ok}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-white/40 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="John Doe"
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-violet-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-white/40 mb-1">Gmail / Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="user@gmail.com"
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-violet-500/50"
            />
          </div>

          <AdminPasswordInput
            label="Password"
            value={password}
            onChange={setPassword}
            show={showPw}
            onToggle={() => setShowPw(!showPw)}
            required
            minLength={8}
            inputClassName={violetInput}
          />

          <AdminPasswordInput
            label="Confirm Password"
            value={confirm}
            onChange={setConfirm}
            show={showCf}
            onToggle={() => setShowCf(!showCf)}
            required
            minLength={8}
            inputClassName={violetInput}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Provision User Access'}
          </button>
        </form>

        <div className="mt-6 flex justify-between border-t border-white/10 pt-6 text-sm">
          <button type="button" className="text-violet-300 hover:underline" onClick={() => navigate('/card/login')}>
            Card Login
          </button>
          <button type="button" className="text-white/40 hover:text-white" onClick={() => navigate('/admin/users')}>
            ← Back to Users
          </button>
        </div>
      </div>
    </div>
  );
}