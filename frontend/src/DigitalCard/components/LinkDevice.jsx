import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaShareAlt } from 'react-icons/fa';
import { fetchPublishedCardPayload } from '../../api/visithonApi';
import GlassShell from '../../visithon/components/GlassShell';
import { staticUrl } from '../../visithon/utils/staticUrl';
import { shareCardLink } from '../../helpers/shareCardLink';
import { buildCardQrImageUrl, buildPublicCardViewUrl } from '../utils/cardPublicUrl';

function resolveAvatar(u) {
  if (!u) return '';
  if (u.avatar_static_path) return staticUrl(u.avatar_static_path);
  if (u.legacy_profile_img) return staticUrl(u.legacy_profile_img);
  return '';
}

export default function LinkDevice() {
  const { userId: routeCardId } = useParams();
  const navigate = useNavigate();
  const cardId = useMemo(() => String(routeCardId || '').trim(), [routeCardId]);
  const publicCardUrl = useMemo(() => buildPublicCardViewUrl(cardId), [cardId]);
  const qrImage = useMemo(() => buildCardQrImageUrl(cardId), [cardId]);

  const [user, setUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(!!cardId);

  const fetchProfile = useCallback(async () => {
    if (!cardId) {
      setUser(null);
      setLoadingProfile(false);
      return;
    }
    setLoadingProfile(true);
    try {
      const { payload } = await fetchPublishedCardPayload(cardId);
      setUser(payload?.data ?? null);
    } catch (err) {
      console.error('Card profile fetch:', err);
      setUser(null);
    } finally {
      setLoadingProfile(false);
    }
  }, [cardId]);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const displayName = user?.name?.trim() || 'Visithon member';
  const companyName = (user?.company || '').trim();
  const avatarSrc = resolveAvatar(user);

  const isOwner = (() => {
    try {
      const raw = localStorage.getItem('visithon_user_info');
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return String(parsed?.id || parsed?._id || '') === cardId;
    } catch {
      return false;
    }
  })();

  const onShare = () => {
    if (!publicCardUrl) return;
    void shareCardLink({
      title: `${displayName} — Visithon Card`,
      text: 'Scan to open my digital card.',
      url: publicCardUrl,
    });
  };

  const onCustomize = () => {
    if (isOwner) navigate('/card/wizard/step-1?edit=1', { state: { editMode: true } });
    else navigate('/card/login', { state: { from: 'customize-qr' } });
  };

  const showQr = Boolean(qrImage && publicCardUrl);

  return (
    <GlassShell>
      <header className="shrink-0 flex items-center gap-3 border-b border-white/10 px-4 py-4 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-white/[0.07] text-white/90 transition hover:bg-white/[0.11]"
          aria-label="Back"
        >
          <FaArrowLeft />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold tracking-tight text-white">My QR Code</h1>
          {publicCardUrl ? (
            <p className="mt-0.5 truncate text-[10px] text-white/40" title={publicCardUrl}>
              {publicCardUrl}
            </p>
          ) : null}
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center px-5 pb-10 pt-6">
        {!cardId ? (
          <p className="py-16 text-sm text-white/50">Invalid card link.</p>
        ) : (
          <>
            <div className="w-full max-w-[min(94vw,400px)] rounded-3xl border border-white/12 bg-white px-4 pb-4 pt-5 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
              <div className="mb-4 text-center">
                <p className="text-[1.15rem] font-bold leading-snug text-slate-900 sm:text-xl">{displayName}</p>
                {companyName ? (
                  <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 sm:text-sm">
                    {companyName}
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs text-slate-400 sm:text-sm">Visithon Card</p>
                )}
                {loadingProfile ? (
                  <p className="mt-2 text-[10px] text-slate-400">Updating profile…</p>
                ) : null}
              </div>

              <div className="relative">
                {showQr ? (
                  <img src={qrImage} alt="QR code for digital card" className="w-full rounded-2xl" />
                ) : (
                  <div className="flex aspect-square min-h-[260px] items-center justify-center rounded-2xl bg-slate-100 text-slate-500 sm:min-h-[300px]">
                    QR unavailable — check card id
                  </div>
                )}
                <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
                  <div className="h-[5.25rem] w-[5.25rem] overflow-hidden rounded-full border-[3px] border-white bg-white shadow-lg ring-2 ring-slate-200/90 sm:h-[5.75rem] sm:w-[5.75rem]">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-xl font-bold text-slate-500 sm:text-2xl">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-5 text-center text-sm text-white/55">Scan to view my card</p>

            <div className="mt-8 flex w-full max-w-[min(94vw,400px)] gap-3">
              <a
                href={showQr ? qrImage : undefined}
                download={showQr ? `${displayName.replace(/\s+/g, '_')}_Visithon_QR.png` : undefined}
                className={`flex flex-1 items-center justify-center rounded-2xl py-3.5 text-center text-sm font-semibold shadow-lg transition ${
                  showQr
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-900/30 hover:brightness-110'
                    : 'cursor-not-allowed bg-white/10 text-white/35'
                }`}
                aria-disabled={!showQr}
                onClick={(e) => {
                  if (!showQr) e.preventDefault();
                }}
              >
                Download
              </a>
              <button
                type="button"
                onClick={onShare}
                disabled={!publicCardUrl}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:brightness-110 disabled:opacity-40"
              >
                <FaShareAlt className="text-sm opacity-90" />
                Share
              </button>
            </div>

            <button
              type="button"
              onClick={onCustomize}
              className="mt-4 w-full max-w-[min(94vw,400px)] rounded-2xl border-2 border-sky-400/45 bg-transparent py-3.5 text-sm font-semibold text-sky-200 transition hover:border-sky-300/70 hover:bg-sky-500/10"
            >
              Customize
            </button>
            {!isOwner && (
              <p className="mt-3 max-w-[min(94vw,400px)] text-center text-[11px] text-white/35">
                Sign in as this card&apos;s owner to edit layout and details.
              </p>
            )}
          </>
        )}
      </div>
    </GlassShell>
  );
}
