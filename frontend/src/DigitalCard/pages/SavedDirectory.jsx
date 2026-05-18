import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBars, FaMicrophone, FaSearch } from 'react-icons/fa';
import { listSavedContacts } from '../../api/visithonApi';
import { staticUrl } from '../../visithon/utils/staticUrl';
import { getSavedCards } from '../utils/savedCardsStorage';

function initialsFromName(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return 'V';
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

function ContactAvatar({ name, avatarPath }) {
  const [imgFailed, setImgFailed] = useState(false);
  const src = avatarPath && !imgFailed ? staticUrl(avatarPath) : '';
  const initials = initialsFromName(name);

  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-lg font-bold text-sky-300/95 shadow-md ring-1 ring-white/10 sm:h-20 sm:w-20">
      {src ? (
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span className="tracking-tight">{initials}</span>
      )}
    </div>
  );
}

export default function SavedDirectory() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const items = await listSavedContacts();
      if (items.length) {
        setContacts(items);
      } else {
        const local = getSavedCards().map((c) => ({
          card_user_id: c.userId,
          name: c.name || 'Visithon contact',
          avatar_path: '',
        }));
        setContacts(local);
      }
    } catch {
      setContacts(
        getSavedCards().map((c) => ({
          card_user_id: c.userId,
          name: c.name || 'Visithon contact',
          avatar_path: '',
        })),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) => String(c.name || '').toLowerCase().includes(q));
  }, [contacts, query]);

  const openCard = (cardUserId) => {
    const id = String(cardUserId || '').trim();
    if (!id) return;
    navigate(`/card/view/${encodeURIComponent(id)}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0e17] text-white">
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0a0e17]/95 backdrop-blur-md">
        <div className="mx-auto w-full max-w-md px-4 pb-3 pt-4">
          <div className="mb-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/80 transition active:scale-95 hover:bg-white/10"
              aria-label="Back"
            >
              <FaArrowLeft />
            </button>
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-white/10 bg-[#141a26] px-4 py-2.5 shadow-inner">
              <FaSearch className="shrink-0 text-lg text-white/35" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search contacts..."
                className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/35 outline-none"
                autoComplete="off"
              />
              <button
                type="button"
                className="shrink-0 text-lg text-white/35 transition active:scale-90"
                aria-label="Voice search"
                onClick={() => {}}
              >
                <FaMicrophone />
              </button>
            </div>
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-sky-500/30 bg-sky-500/15 text-sky-300 transition active:scale-95"
              aria-label="Add contact"
              onClick={() => navigate('/card/scan')}
            >
              <span className="text-xl leading-none">+</span>
            </button>
          </div>

          <div className="flex items-center justify-between px-1">
            <nav className="flex items-center gap-5 text-sm font-semibold">
              <span className="text-white/35">History</span>
              <span className="text-sky-400">Contacts</span>
              <span className="text-white/35">Favorites</span>
            </nav>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white/40 transition active:scale-95 hover:bg-white/5"
              aria-label="Menu"
            >
              <FaBars />
            </button>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto pb-10">
        <div className="mx-auto w-full max-w-md px-4 py-2">
          {loading ? (
            <p className="py-16 text-center text-sm text-white/45">Loading contacts…</p>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-14 text-center">
              <p className="text-sm text-white/55">No saved contacts yet.</p>
              <p className="mt-2 text-xs text-white/35">
                Open a Visithon card and tap <strong className="text-white/55">Save contact</strong> to add
                them here.
              </p>
              <button
                type="button"
                onClick={() => navigate('/card/scan')}
                className="mt-6 rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition active:scale-95 hover:bg-sky-500"
              >
                Scan a card
              </button>
            </div>
          ) : (
            <ul className="grid grid-cols-3 gap-4 justify-items-center sm:grid-cols-4 md:grid-cols-5">
              {filtered.map((c) => {
                const id = String(c.card_user_id || '').trim();
                const name = (c.name || 'Contact').trim();
                return (
                  <li key={id} className="w-full max-w-[88px]">
                    <button
                      type="button"
                      onClick={() => openCard(id)}
                      className="group flex w-full flex-col items-center rounded-xl p-1 transition-transform active:scale-95"
                    >
                      <ContactAvatar name={name} avatarPath={c.avatar_path} />
                      <span className="mt-2 max-w-[80px] truncate text-center text-xs font-medium line-clamp-1 text-white/92 transition-colors group-hover:text-sky-200 sm:text-sm">
                        {name}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
