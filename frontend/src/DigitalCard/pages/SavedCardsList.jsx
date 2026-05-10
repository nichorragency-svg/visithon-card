import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBookmark, FaChevronRight, FaTrash } from 'react-icons/fa';
import GlassShell from '../../visithon/components/GlassShell';
import { getSavedCards, removeSavedCard } from '../utils/savedCardsStorage';

export default function SavedCardsList() {
  const navigate = useNavigate();
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const cards = useMemo(() => getSavedCards(), [version]);

  const onOpen = (id) => {
    navigate(`/card/view/${encodeURIComponent(id)}`);
  };

  const onRemove = (e, id) => {
    e.stopPropagation();
    removeSavedCard(id);
    refresh();
  };

  return (
    <GlassShell>
      <header className="flex shrink-0 items-center gap-3 border-b border-white/10 px-4 py-4 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-white/[0.07] text-white/90"
          aria-label="Back"
        >
          <FaArrowLeft />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 text-xl font-bold text-white">
            <FaBookmark className="text-amber-300" aria-hidden />
            My cards
          </h1>
          <p className="text-xs text-white/45">
            Saved on this device — open the digital card again (login required to use this list).
          </p>
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-5">
        {cards.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-10 text-center">
            <p className="text-sm text-white/55">No saved cards yet.</p>
            <p className="mt-2 text-xs text-white/35">
              Open someone&apos;s card while logged in, then tap <strong className="text-white/50">Save to My cards</strong>.
            </p>
            <button
              type="button"
              onClick={() => navigate('/card/scan')}
              className="mt-5 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-500"
            >
              Scan QR
            </button>
          </div>
        ) : (
          cards.map((c) => {
            const label = (c.name || '').trim() || 'Visithon card';
            const sub = String(c.userId || '').slice(0, 8);
            return (
              <div
                key={c.userId}
                role="button"
                tabIndex={0}
                onClick={() => onOpen(c.userId)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onOpen(c.userId);
                }}
                className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-left backdrop-blur-xl transition hover:border-sky-400/30 hover:bg-white/[0.09]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-500/15 text-amber-200">
                  <FaBookmark className="text-lg" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{label}</p>
                  <p className="truncate text-[11px] text-white/35">ID · {sub}…</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => onRemove(e, c.userId)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-rose-300/80 transition hover:bg-rose-500/15"
                  aria-label="Remove"
                >
                  <FaTrash className="text-sm" />
                </button>
                <FaChevronRight className="shrink-0 text-white/25" />
              </div>
            );
          })
        )}
      </div>
    </GlassShell>
  );
}
