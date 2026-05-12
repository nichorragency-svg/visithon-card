import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { adminAuthHeaders } from '../utils/adminHeaders';

function assetUrl(relativePath) {
  if (!relativePath) return '';
  const s = String(relativePath).trim();
  if (/^https?:\/\//i.test(s)) return s;
  const base = String(API_BASE_URL || '').replace(/\/$/, '');
  if (!base) return '';
  return `${base}/static/${s.replace(/^\//, '')}`;
}

const empty = {
  bank_name: '',
  account_title: '',
  account_number: '',
  iban: '',
  wallet_label: '',
  wallet_number: '',
  qr_static_path: '',
  instructions: '',
};

export default function AdminPlatformPaymentSettings() {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  const base = String(API_BASE_URL || '').replace(/\/$/, '');

  const load = useCallback(async () => {
    setErr('');
    setLoading(true);
    try {
      const { data } = await axios.get(`${base}/admin/platform-payment-settings`, {
        headers: adminAuthHeaders(),
      });
      setForm({ ...empty, ...data });
    } catch (e) {
      setErr(e?.response?.data?.detail || e?.message || 'Load failed');
    } finally {
      setLoading(false);
    }
  }, [base]);

  useEffect(() => {
    void load();
  }, [load]);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const onSave = async (e) => {
    e.preventDefault();
    setErr('');
    setOk('');
    setSaving(true);
    try {
      await axios.put(`${base}/admin/platform-payment-settings`, form, {
        headers: { ...adminAuthHeaders(), 'Content-Type': 'application/json' },
      });
      setOk('Saved.');
    } catch (e) {
      setErr(e?.response?.data?.detail || e?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const onQr = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setErr('');
    setOk('');
    const fd = new FormData();
    fd.append('file', file);
    try {
      const { data } = await axios.post(`${base}/admin/platform-payment-settings/qr`, fd, {
        headers: { ...adminAuthHeaders(), 'Content-Type': 'multipart/form-data' },
      });
      if (data?.qr_static_path) setForm((p) => ({ ...p, qr_static_path: data.qr_static_path }));
      setOk('QR uploaded.');
    } catch (ex) {
      setErr(ex?.response?.data?.detail || ex?.message || 'Upload failed');
    }
  };

  if (!base) {
    return (
      <div className="p-8 text-sm text-amber-200">
        Set REACT_APP_API_BASE_URL (or REACT_APP_API_URL) to your API root.
      </div>
    );
  }

  if (loading) {
    return <div className="p-10 text-center text-white/60">Loading…</div>;
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-xl font-semibold">Platform payment (Pakistan manual)</h1>
      <p className="mt-1 max-w-xl text-sm text-white/50">
        Bank / wallet details and QR shown to users who pay manually. Proof submissions are reviewed under
        Payments.
      </p>

      {err ? (
        <div className="mt-4 rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-100">
          {err}
        </div>
      ) : null}
      {ok ? (
        <div className="mt-4 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
          {ok}
        </div>
      ) : null}

      <form onSubmit={onSave} className="mt-6 grid max-w-lg gap-3">
        {[
          ['bank_name', 'Bank name'],
          ['account_title', 'Account title'],
          ['account_number', 'Account number'],
          ['iban', 'IBAN / other reference'],
          ['wallet_label', 'Wallet label (e.g. JazzCash)'],
          ['wallet_number', 'Wallet number'],
        ].map(([key, label]) => (
          <label key={key} className="grid gap-1 text-sm">
            <span className="text-white/50">{label}</span>
            <input
              value={form[key] || ''}
              onChange={(ev) => setField(key, ev.target.value)}
              className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 outline-none focus:border-indigo-400/60"
            />
          </label>
        ))}
        <label className="grid gap-1 text-sm">
          <span className="text-white/50">Instructions for payer</span>
          <textarea
            value={form.instructions || ''}
            onChange={(ev) => setField('instructions', ev.target.value)}
            rows={3}
            className="resize-none rounded-lg border border-white/15 bg-black/30 px-3 py-2 outline-none focus:border-indigo-400/60"
          />
        </label>

        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
          <p className="text-xs text-white/45">Payment QR (PNG/JPG)</p>
          {form.qr_static_path ? (
            <img
              src={assetUrl(form.qr_static_path)}
              alt="QR"
              className="mt-2 h-32 w-32 rounded border border-white/10 object-contain"
            />
          ) : (
            <p className="mt-2 text-xs text-white/35">No QR yet</p>
          )}
          <input type="file" accept="image/*" className="mt-2 text-xs" onChange={onQr} />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save details'}
        </button>
      </form>
    </div>
  );
}
