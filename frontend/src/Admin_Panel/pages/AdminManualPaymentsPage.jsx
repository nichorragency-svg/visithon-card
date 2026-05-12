import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { adminAuthHeaders } from '../utils/adminHeaders';

function proofUrl(path) {
  if (!path) return '';
  const s = String(path).trim();
  if (/^https?:\/\//i.test(s)) return s;
  const base = String(API_BASE_URL || '').replace(/\/$/, '');
  if (!base) return '';
  return `${base}/static/${s.replace(/^\//, '')}`;
}

export default function AdminManualPaymentsPage() {
  const [filter, setFilter] = useState('pending');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const base = String(API_BASE_URL || '').replace(/\/$/, '');

  const load = useCallback(async () => {
    setErr('');
    setLoading(true);
    try {
      const { data } = await axios.get(`${base}/admin/manual-payment-requests`, {
        params: filter ? { status: filter } : {},
        headers: adminAuthHeaders(),
      });
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (e) {
      setErr(e?.response?.data?.detail || e?.message || 'Load failed');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [base, filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const resolve = async (id, status) => {
    const note = window.prompt('Admin note (optional):', '') ?? '';
    try {
      await axios.patch(
        `${base}/admin/manual-payment-requests/${id}`,
        { status, admin_note: note },
        { headers: { ...adminAuthHeaders(), 'Content-Type': 'application/json' } },
      );
      void load();
    } catch (e) {
      window.alert(e?.response?.data?.detail || e?.message || 'Update failed');
    }
  };

  if (!base) {
    return (
      <div className="p-8 text-sm text-amber-200">
        Set REACT_APP_API_BASE_URL to your API root.
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-xl font-semibold">Manual payment proofs</h1>
      <p className="mt-1 text-sm text-white/50">Approve or reject after verifying bank transfer.</p>

      <div className="mt-4 flex gap-2">
        {['pending', 'approved', 'rejected', ''].map((f) => (
          <button
            key={f || 'all'}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
              filter === f ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/15'
            }`}
          >
            {f || 'all'}
          </button>
        ))}
      </div>

      {err ? (
        <div className="mt-4 rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm">{err}</div>
      ) : null}

      {loading ? (
        <div className="mt-8 text-center text-white/50">Loading…</div>
      ) : items.length === 0 ? (
        <div className="mt-8 text-center text-white/40">No requests.</div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.06] text-xs uppercase text-white/45">
              <tr>
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2">Payer</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Plan</th>
                <th className="px-3 py-2">Proof</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id} className="border-b border-white/5">
                  <td className="px-3 py-2 text-white/60">
                    {row.created_at ? new Date(row.created_at).toLocaleString() : '—'}
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{row.payer_name || '—'}</div>
                    <div className="text-xs text-white/45">{row.payer_email}</div>
                  </td>
                  <td className="px-3 py-2">
                    {row.amount} {row.currency || 'PKR'}
                  </td>
                  <td className="px-3 py-2 text-white/70">{row.plan_label || '—'}</td>
                  <td className="px-3 py-2">
                    {row.proof_static_path ? (
                      <a
                        href={proofUrl(row.proof_static_path)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-300 underline"
                      >
                        View
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-3 py-2 capitalize">{row.status}</td>
                  <td className="px-3 py-2">
                    {row.status === 'pending' ? (
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          className="rounded bg-emerald-600 px-2 py-1 text-xs"
                          onClick={() => void resolve(row.id, 'approved')}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="rounded bg-rose-600 px-2 py-1 text-xs"
                          onClick={() => void resolve(row.id, 'rejected')}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-white/40">{row.admin_note || '—'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
