import React from 'react';
import {
  FaBell,
  FaBookmark,
  FaCog,
  FaDesktop,
  FaEdit,
  FaEllipsisV,
  FaIdCard,
  FaQrcode,
  FaShareAlt,
} from 'react-icons/fa';

export function CardDisplayHeader({
  user,
  userId,
  navigate,
  selectedTheme,
  isLightTheme,
  headerInlineStyle,
  menuOpen,
  setMenuOpen,
  isOwner,
  hasToken,
  isWalletSaved,
  onToggleWalletSave,
  walletSavedCount,
  goReminders,
  goSettings,
}) {
  const bookmarkIconColor = isWalletSaved ? '#fbbf24' : isLightTheme ? '#475569' : '#f1f5f9';
  const idCardIconColor = isLightTheme ? '#0284c7' : '#7dd3fc';

  return (
    <header
      className={`sticky top-0 z-30 flex items-center justify-between border-b ${
        isLightTheme ? 'border-slate-300/65 bg-white/95' : 'border-white/10 bg-slate-900/90'
      } px-4 py-3.5 backdrop-blur-md`}
      style={headerInlineStyle}
    >
      {/* --- LOGO SECTION --- */}
      <div className="flex h-11 min-w-[44px] shrink-0 items-center justify-start">
        <img 
          src="/logo.png" 
          alt="Logo" 
          className="h-10 w-auto object-contain" // Height thori barhai hy visibility k liye
          onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/1162/1162456.png" }}
        />
      </div>

      <h1
        className={`min-w-0 flex-1 bg-gradient-to-r ${selectedTheme.title} bg-clip-text px-1 text-center text-[10px] font-bold uppercase leading-tight tracking-[0.22em] text-transparent sm:text-[11px]`}
      >
        Visithon Card
      </h1>

      <div className="relative flex shrink-0 items-center justify-end gap-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWalletSave?.();
          }}
          className="flex h-9 w-9 min-h-[36px] min-w-[36px] touch-manipulation items-center justify-center rounded-xl border border-white/15 bg-white/[0.08] shadow-inner shadow-black/15 transition active:opacity-90 hover:border-amber-400/40 hover:bg-white/[0.12] sm:h-10 sm:w-10"
          aria-label={isWalletSaved ? 'Remove from My cards' : 'Save to My cards'}
          title={hasToken ? (isWalletSaved ? 'Remove from My cards' : 'Save to My cards') : 'Login to save this card'}
        >
          <FaBookmark style={{ width: 19, height: 19, color: bookmarkIconColor }} aria-hidden />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (hasToken) navigate('/card/saved');
            else navigate('/card/login', { state: { from: 'saved-cards' } });
          }}
          className="relative flex h-9 w-9 min-h-[36px] min-w-[36px] touch-manipulation items-center justify-center rounded-xl border border-white/15 bg-white/[0.08] shadow-inner shadow-black/15 transition active:opacity-90 hover:border-sky-400/35 hover:bg-white/[0.12] sm:h-10 sm:w-10"
          aria-label="My cards"
          title={hasToken ? 'My saved cards' : 'Login to open My cards'}
        >
          <FaIdCard style={{ width: 19, height: 19, color: idCardIconColor }} aria-hidden />
          {hasToken && walletSavedCount > 0 ? (
            <span className="pointer-events-none absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-400 px-[3px] text-[9px] font-bold leading-none text-slate-900 shadow-sm">
              {walletSavedCount > 99 ? '99+' : walletSavedCount}
            </span>
          ) : null}
        </button>
        {hasToken ? (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((o) => !o);
              }}
              className="flex h-11 w-11 min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center rounded-2xl border border-white/12 bg-white/[0.07] text-white/95 shadow-inner shadow-black/20 transition active:opacity-90 hover:border-fuchsia-400/35 hover:bg-white/[0.12]"
              aria-label="Menu"
            >
              <FaEllipsisV />
            </button>

            {/* Menu only after login */}
            {menuOpen && (
          <div
            // Yahan z-50 aur bg-slate-950 fix kiya hy
            className="absolute right-0 top-14 z-50 w-56 overflow-hidden rounded-2xl border border-white/20 bg-slate-950 py-1 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white/90 transition hover:bg-white/[0.1]"
              onClick={() => {
                setMenuOpen(false);
                navigate('/card/scan');
              }}
            >
              <FaQrcode className="text-lg text-violet-300" /> Scan QR
            </button>
            
            <button
              type="button"
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white/90 transition hover:bg-white/[0.1]"
              onClick={() => {
                setMenuOpen(false);
                navigate(`/card/link-device/${userId}`);
              }}
            >
              <FaDesktop className="text-lg text-cyan-300" /> My QR code
            </button>

            {isOwner && (
              <button
                type="button"
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white/90 transition hover:bg-white/[0.1]"
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/card/wizard/step-1?edit=1', { state: { editMode: true } });
                }}
              >
                <FaEdit className="text-lg text-fuchsia-300" /> Edit card
              </button>
            )}

            <button
              type="button"
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white/90 transition hover:bg-white/[0.1]"
              onClick={() => {
                setMenuOpen(false);
                goReminders();
              }}
            >
              <FaBell className="text-lg text-amber-300" /> Reminders
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white/90 transition hover:bg-white/[0.1]"
              onClick={() => {
                setMenuOpen(false);
                goSettings();
              }}
            >
              <FaCog className="text-lg text-slate-300" /> Settings
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white/90 transition hover:bg-white/[0.1] border-t border-white/5 mt-1"
              onClick={() => {
                setMenuOpen(false);
                if (navigator.share) {
                  navigator.share({ title: `${user.name} — Visithon`, url: window.location.href });
                } else {
                  navigator.clipboard?.writeText(window.location.href);
                }
              }}
            >
              <FaShareAlt className="text-lg text-emerald-300" /> Share
            </button>
          </div>
            )}
          </>
        ) : null}
      </div>
    </header>
  );
}