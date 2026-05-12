import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaWhatsapp } from 'react-icons/fa';
import { API_BASE_URL } from '../../config';
import { ADMIN_TOKEN_KEY } from '../constants';
import { staticUrl } from '../../visithon/utils/staticUrl';

function formatCount(n) {
  const x = Number(n);
  if (!Number.isFinite(x) || x < 0) return '0';
  return x.toLocaleString('en-US');
}

function avatarSrc(path) {
  if (!path) return '';
  const s = String(path).trim();
  if (/^https?:\/\//i.test(s)) return s;
  return staticUrl(s);
}

function CardTile({ card, onApprove, onReject }) {
  const img = avatarSrc(card.avatar_path);
  const title = String(card.headline || card.cardTitle || card.user?.name || 'Card').trim();
  const sub = String(card.subline || card.user?.name || '').trim();
  const st = String(card.status || 'active').toLowerCase();
  const statusCls =
    st === 'active'
      ? 'text-emerald-400'
      : st === 'rejected'
        ? 'text-rose-400'
        : 'text-amber-300';
  const initials = title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || '?';

  return (
    <article className="flex flex-col rounded-2xl border border-white/[0.08] bg-[#12151c] p-4 shadow-lg shadow-black/30">
      <div className="flex gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-slate-700 to-slate-900">
          {img ? (
            <img src={img} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-sm font-bold text-white/70">
              {initials}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-bold leading-tight text-white">{title}</h3>
          <p className="mt-0.5 truncate text-xs text-white/45">{sub || '—'}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs text-white/55">
        <span className="flex items-center gap-1.5">
          <FaEye className="text-sky-400/90" aria-hidden />
          {formatCount(card.views)}
        </span>
        <span className="flex items-center gap-1.5">
          <FaWhatsapp className="text-emerald-400/90" aria-hidden />
          {formatCount(card.whatsapp_taps)}
        </span>
      </div>
      <p className={`mt-3 text-center text-xs font-semibold uppercase tracking-wide ${statusCls}`}>{st}</p>
      {st === 'pending' ? (
        <div className="mt-2 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => onApprove(card._id)}
            className="rounded-lg bg-emerald-600/90 px-3 py-1 text-[11px] font-semibold text-white hover:bg-emerald-500"
          >
            Approve
          </button>
          <button
            type="button"
            onClick={() => onReject(card._id)}
            className="rounded-lg bg-rose-600/90 px-3 py-1 text-[11px] font-semibold text-white hover:bg-rose-500"
          >
            Reject
          </button>
        </div>
      ) : st !== 'active' ? (
        <div className="mt-2 flex justify-center">
          <button
            type="button"
            onClick={() => onApprove(card._id)}
            className="rounded-lg border border-white/15 px-3 py-1 text-[11px] font-medium text-white/70 hover:bg-white/10"
          >
            Set active
          </button>
        </div>
      ) : null}
    </article>
  );
}

export default function CardManagementPage() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const authHeaders = useMemo(() => {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem(ADMIN_TOKEN_KEY) : '';
    return token?.trim() ? { Authorization: `Bearer ${token.trim()}` } : {};
  }, []);

  const base = useMemo(() => String(API_BASE_URL || '').replace(/\/$/, ''), []);

  const fetchCards = useCallback(async () => {
    setFetchError('');
    setLoading(true);
    try {
      if (!base) {
        setFetchError('Set REACT_APP_API_BASE_URL in environment.');
        setCards([]);
        return;
      }
      const res = await axios.get(`${base}/admin/all-cards`, { headers: authHeaders });
      setCards(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setFetchError(err?.response?.data?.detail || err?.message || 'Could not load cards.');
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, [base, authHeaders]);

  useEffect(() => {
    void fetchCards();
  }, [fetchCards]);

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(
        `${base}/admin/card-status/${id}`,
        { status: newStatus },
        { headers: { ...authHeaders, 'Content-Type': 'application/json' } },
      );
      void fetchCards();
    } catch (err) {
      window.alert(err?.response?.data?.detail || 'Update failed.');
    }
  };

  return (
    <div className="min-h-full bg-[#0a0c10] px-5 py-6 text-white">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-lg font-bold uppercase tracking-[0.2em] text-white">Cards management</h1>
          <p className="mt-1 text-sm text-white/45">All cards</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/card/signup')}
          className="shrink-0 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:opacity-95"
        >
          Create new card +
        </button>
      </header>

      {fetchError ? (
        <div className="mb-6 rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {fetchError}
        </div>
      ) : null}

      {loading ? (
        <div className="py-20 text-center text-sm text-white/40">Loading cards…</div>
      ) : cards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 py-16 text-center text-sm text-white/40">
          No cards yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <CardTile key={c._id} card={c} onApprove={(id) => updateStatus(id, 'active')} onReject={(id) => updateStatus(id, 'rejected')} />
          ))}
        </div>
      )}

      {!loading && cards.length > 0 ? (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => void fetchCards()}
            className="w-full max-w-md rounded-2xl border border-white/20 bg-transparent py-3.5 text-sm font-semibold text-white/85 transition hover:border-indigo-400/50 hover:bg-white/[0.04]"
          >
            View all cards →
          </button>
        </div>
      ) : null}
    </div>
  );
}
