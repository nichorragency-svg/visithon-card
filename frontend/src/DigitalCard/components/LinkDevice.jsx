import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaShareAlt } from 'react-icons/fa';
import { SUPABASE_CONFIGURED } from '../../config';
import { fetchPublishedCardPayload } from '../../supabase/publicCardFetch';
import GlassShell from '../../visithon/components/GlassShell';
import { staticUrl } from '../../visithon/utils/staticUrl';

function resolveAvatar(u) {
  if (!u) return '';
  if (u.avatar_static_path) return staticUrl(u.avatar_static_path);
  if (u.legacy_profile_img) return staticUrl(u.legacy_profile_img);
  return '';
}

export default function LinkDevice() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [qrImage, setQrImage] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (!SUPABASE_CONFIGURED || !userId) {
        setUser(null);
        setQrImage('');
        return;
      }
      const { payload } = await fetchPublishedCardPayload(String(userId).trim());
      const u = payload?.data ?? null;
      setUser(u);
      const cardUrl = `${window.location.origin}/card/view/${encodeURIComponent(String(userId).trim())}`;
      setQrImage(
        `https://api.qrserver.com/v1/create-qr-code/?size=420x420&data=${encodeURIComponent(cardUrl)}`,
      );
    } catch (err) {
      console.error('QR / card fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const displayName = user?.name?.trim() || 'Visithon member';
  const companyName = (user?.company || '').trim();
  const avatarSrc = resolveAvatar(user);

  const isOwner = (() => {
    try {
      const raw = localStorage.getItem('visithon_user_info');
      if (!raw) return false;
      return JSON.parse(raw).id === userId;
    } catch {
      return false;
    }
  })();

  const onShare = async () => {
    const shareUrl = `${window.location.origin}/card/view/${userId}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${displayName} — Visithon Card`,
          text: 'Scan to open my digital card.',
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('Card link copied to clipboard.');
      }
    } catch {
      /* user cancelled share */
    }
  };

  const onCustomize = () => {
    if (isOwner) navigate('/card/wizard/step-1?edit=1', { state: { editMode: true } });
    else navigate('/card/login', { state: { from: 'customize-qr' } });
  };

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
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center px-5 pb-10 pt-6">
        {loading ? (
          <div className="flex flex-col items-center py-16">
            <div className="h-11 w-11 animate-spin rounded-full border-2 border-white/15 border-t-sky-400 [animation-duration:0.9s]" />
            <p className="mt-4 text-sm text-white/45">Preparing your code…</p>
          </div>
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
              </div>

              <div className="relative">
                {qrImage ? (
                  <img src={qrImage} alt="" className="w-full rounded-2xl" />
                ) : (
                  <div className="flex aspect-square min-h-[260px] items-center justify-center rounded-2xl bg-slate-100 text-slate-500 sm:min-h-[300px]">
                    QR unavailable
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
                href={qrImage || undefined}
                download={qrImage ? `${displayName.replace(/\s+/g, '_')}_Visithon_QR.png` : undefined}
                className={`flex flex-1 items-center justify-center rounded-2xl py-3.5 text-center text-sm font-semibold shadow-lg transition ${
                  qrImage
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-900/30 hover:brightness-110'
                    : 'cursor-not-allowed bg-white/10 text-white/35'
                }`}
                aria-disabled={!qrImage}
                onClick={(e) => {
                  if (!qrImage) e.preventDefault();
                }}
              >
                Download
              </a>
              <button
                type="button"
                onClick={onShare}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:brightness-110"
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
