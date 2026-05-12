import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import GlassShell from '../../visithon/components/GlassShell';

function assetUrl(relativePath) {
  if (!relativePath) return '';
  const s = String(relativePath).trim();
  if (/^https?:\/\//i.test(s)) return s;
  const base = String(API_BASE_URL || '').replace(/\/$/, '');
  if (!base) return '';
  return `${base}/static/${s.replace(/^\//, '')}`;
}

export default function ManualPaymentSubmit() {
  const [cfg, setCfg] = useState(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [plan, setPlan] = useState('');
  const [note, setNote] = useState('');
  const [file, setFile] = useState(null);
  const [err, setErr] = useState('');
  const [done, setDone] = useState('');
  const [busy, setBusy] = useState(false);

  const base = String(API_BASE_URL || '').replace(/\/$/, '');

  useEffect(() => {
    if (!base) return;
    axios
      .get(`${base}/public/platform-payment-settings`)
      .then((res) => setCfg(res.data || {}))
      .catch(() => setCfg({}));
  }, [base]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setDone('');
    if (!file) {
      setErr('Attach payment screenshot.');
      return;
    }
    setBusy(true);
    const fd = new FormData();
    fd.append('payer_email', email);
    fd.append('payer_name', name);
    fd.append('amount', amount);
    fd.append('currency', 'PKR');
    fd.append('plan_label', plan);
    fd.append('note', note);
    fd.append('proof', file);
    try {
      await axios.post(`${base}/public/manual-payment-requests`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setDone('Submitted. We will verify and contact you.');
      setFile(null);
    } catch (ex) {
      setErr(ex?.response?.data?.detail || ex?.message || 'Submit failed');
    } finally {
      setBusy(false);
    }
  };

  if (!base) {
    return (
      <GlassShell>
        <p className="p-6 text-sm text-white/80">API URL is not configured.</p>
      </GlassShell>
    );
  }

  return (
    <GlassShell>
      <div className="shrink-0 border-b border-white/10 px-5 py-4">
        <h1 className="text-xl font-bold text-white">Manual payment</h1>
        <p className="mt-1 text-xs text-white/50">Send payment to the account below, then upload proof.</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {cfg && (
          <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.05] p-4 text-sm text-white/85">
            {cfg.bank_name ? <p>Bank: {cfg.bank_name}</p> : null}
            {cfg.account_title ? <p>Title: {cfg.account_title}</p> : null}
            {cfg.account_number ? <p>Account: {cfg.account_number}</p> : null}
            {cfg.iban ? <p>IBAN / ref: {cfg.iban}</p> : null}
            {cfg.wallet_label ? (
              <p>
                {cfg.wallet_label}: {cfg.wallet_number || '—'}
              </p>
            ) : null}
            {cfg.qr_static_path ? (
              <img
                src={assetUrl(cfg.qr_static_path)}
                alt="Payment QR"
                className="mt-3 h-40 w-40 rounded border border-white/10 object-contain"
              />
            ) : null}
            {cfg.instructions ? <p className="mt-3 text-xs text-white/55">{cfg.instructions}</p> : null}
          </div>
        )}

        {err ? (
          <div className="mb-4 rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-100">
            {err}
          </div>
        ) : null}
        {done ? (
          <div className="mb-4 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
            {done}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="grid max-w-md gap-3">
          <label className="grid gap-1 text-sm text-white">
            <span className="text-white/50">Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white outline-none"
            />
          </label>
          <label className="grid gap-1 text-sm text-white">
            <span className="text-white/50">Name</span>
            <input
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white outline-none"
            />
          </label>
          <label className="grid gap-1 text-sm text-white">
            <span className="text-white/50">Amount (PKR)</span>
            <input
              required
              value={amount}
              onChange={(ev) => setAmount(ev.target.value)}
              className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white outline-none"
            />
          </label>
          <label className="grid gap-1 text-sm text-white">
            <span className="text-white/50">Plan / reference</span>
            <input
              value={plan}
              onChange={(ev) => setPlan(ev.target.value)}
              className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white outline-none"
            />
          </label>
          <label className="grid gap-1 text-sm text-white">
            <span className="text-white/50">Note</span>
            <textarea
              value={note}
              onChange={(ev) => setNote(ev.target.value)}
              rows={2}
              className="resize-none rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white outline-none"
            />
          </label>
          <label className="grid gap-1 text-sm text-white">
            <span className="text-white/50">Screenshot</span>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(ev) => setFile(ev.target.files?.[0] || null)}
              className="text-xs"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {busy ? 'Sending…' : 'Submit proof'}
          </button>
        </form>
      </div>
    </GlassShell>
  );
}
