import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaEllipsisV, FaEye } from 'react-icons/fa';
import { API_BASE_URL } from '../../config';
import { ADMIN_TOKEN_KEY } from '../constants';
import { avatarSrc, formatJoined, formatPhone, statusBadgeClass } from '../utils/adminUsersFormatters';

export default function AdminUsersManagementPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [menuId, setMenuId] = useState(null);

  const authHeaders = useMemo(() => {
    const t = typeof localStorage !== 'undefined' ? localStorage.getItem(ADMIN_TOKEN_KEY) : '';
    return t?.trim() ? { Authorization: `Bearer ${t.trim()}` } : {};
  }, []);

  const base = useMemo(() => String(API_BASE_URL || '').replace(/\/$/, ''), []);

  const load = useCallback(async () => {
    setErr('');
    setLoading(true);
    try {
      if (!base) {
        setErr('Set REACT_APP_API_BASE_URL.');
        setRows([]);
        return;
      }
      const { data } = await axios.get(`${base}/admin/all-cards`, { headers: authHeaders });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      let msg = e?.response?.data?.detail || e?.message || 'Load failed.';
      if (typeof msg !== 'string') msg = String(msg);
      if (!e?.response && base && typeof window !== 'undefined') {
        msg += ` If the browser blocked the request (CORS), add to API server .env: CORS_ALLOWED_ORIGINS=${window.location.origin}`;
      }
      setErr(msg);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [base, authHeaders]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!menuId) return undefined;
    const close = (ev) => {
      const rowEl = typeof document !== 'undefined' ? document.querySelector(`[data-admin-row="${menuId}"]`) : null;
      if (rowEl && rowEl.contains(ev.target)) return;
      setMenuId(null);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuId]);

  const patchStatus = async (id, status) => {
    try {
      await axios.patch(
        `${base}/admin/card-status/${id}`,
        { status },
        { headers: { ...authHeaders, 'Content-Type': 'application/json' } },
      );
      setMenuId(null);
      void load();
    } catch (e) {
      window.alert(e?.response?.data?.detail || 'Update failed.');
    }
  };

  const copyLink = (id) => {
    const url = `${window.location.origin}/card/view/${encodeURIComponent(id)}`;
    void navigator.clipboard?.writeText(url).then(() => window.alert('Link copied.'));
    setMenuId(null);
  };

  return (
    <div className="min-h-full bg-[#0a0c10] px-5 py-6 text-white">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-lg font-bold uppercase tracking-[0.2em] text-white">Users management</h1>
          <p className="mt-1 text-sm text-white/45">All users</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/create-card-user')}
          className="shrink-0 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:opacity-95"
        >
          Add new user +
        </button>
      </header>

      {err ? (
        <div className="mb-4 rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">{err}</div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e1118]">
        {loading ? (
          <div className="py-16 text-center text-sm text-white/40">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-white/[0.08] bg-white/[0.03] text-[11px] font-semibold uppercase tracking-wider text-white/40">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Joined on</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {rows.map((row) => {
                  const img = avatarSrc(row.avatar_path);
                  const name = String(row.user?.name || row.headline || '—');
                  const initials = name
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join('')
                    .toUpperCase();
                  return (
                    <tr key={row._id} className="hover:bg-white/[0.02]" data-admin-row={row._id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-slate-800">
                            {img ? (
                              <img src={img} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center text-xs font-bold text-white/60">
                                {initials}
                              </span>
                            )}
                          </div>
                          <span className="font-medium text-white/95">{name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/65">{formatPhone(row.phone)}</td>
                      <td className="px-4 py-3 text-white/75">{row.plan_label || 'Free Plan'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusBadgeClass(row.status)}`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/55">{formatJoined(row.joined_at)}</td>
                      <td className="relative px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2 text-white/50">
                          <button
                            type="button"
                            aria-label="View card"
                            className="rounded-lg p-2 hover:bg-white/10 hover:text-white"
                            onClick={() =>
                              window.open(`${window.location.origin}/card/view/${encodeURIComponent(row._id)}`, '_blank')
                            }
                          >
                            <FaEye />
                          </button>
                          <button
                            type="button"
                            aria-label="Account login"
                            className="rounded-lg p-2 hover:bg-white/10 hover:text-white"
                            onClick={() =>
                              navigate('/card/login', {
                                state: { returnTo: `/card/view/${encodeURIComponent(row._id)}` },
                              })
                            }
                          >
                            <FaEdit />
                          </button>
                          <button
                            type="button"
                            aria-label="More"
                            className="rounded-lg p-2 hover:bg-white/10 hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuId((id) => (id === row._id ? null : row._id));
                            }}
                          >
                            <FaEllipsisV />
                          </button>
                        </div>
                        {menuId === row._id ? (
                          <div className="absolute right-2 top-full z-20 mt-1 min-w-[10rem] rounded-xl border border-white/15 bg-[#1a1f2e] py-1 text-left shadow-xl">
                            <button
                              type="button"
                              className="block w-full px-3 py-2 text-left text-xs hover:bg-white/10"
                              onClick={() => void patchStatus(row._id, 'active')}
                            >
                              Set active
                            </button>
                            <button
                              type="button"
                              className="block w-full px-3 py-2 text-left text-xs hover:bg-white/10"
                              onClick={() => void patchStatus(row._id, 'pending')}
                            >
                              Set pending
                            </button>
                            <button
                              type="button"
                              className="block w-full px-3 py-2 text-left text-xs hover:bg-white/10"
                              onClick={() => void patchStatus(row._id, 'rejected')}
                            >
                              Set rejected
                            </button>
                            <button
                              type="button"
                              className="block w-full px-3 py-2 text-left text-xs hover:bg-white/10"
                              onClick={() => copyLink(row._id)}
                            >
                              Copy card link
                            </button>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && rows.length > 0 ? (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => void load()}
            className="w-full max-w-md rounded-2xl border border-white/20 bg-transparent py-3.5 text-sm font-semibold text-white/85 transition hover:border-indigo-400/50 hover:bg-white/[0.04]"
          >
            View all users →
          </button>
        </div>
      ) : null}
    </div>
  );
}
