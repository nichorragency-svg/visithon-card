import React from 'react';
import {
  FaBell,
  FaCog,
  FaDesktop,
  FaEdit,
  FaEllipsisV,
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
  goReminders,
  goSettings,
}) {
  return (
    <header
      className={`sticky top-0 z-30 flex items-center justify-between border-b ${
        isLightTheme ? 'border-slate-300/65 bg-white/95' : 'border-white/10 bg-slate-900/90'
      } px-4 py-3.5 backdrop-blur-md`}
      style={headerInlineStyle}
    >
      {/* --- LOGO SECTION --- */}
      <div className="flex h-11 items-center justify-start min-w-[44px]">
        <img 
          src="/logo.png" 
          alt="Logo" 
          className="h-10 w-auto object-contain" // Height thori barhai hy visibility k liye
          onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/1162/1162456.png" }}
        />
      </div>

      <h1
        className={`max-w-[52%] bg-gradient-to-r ${selectedTheme.title} bg-clip-text text-center text-[10px] font-bold uppercase leading-tight tracking-[0.22em] text-transparent sm:text-[11px]`}
      >
        Visithon Card
      </h1>

      <div className="relative flex items-center justify-end">
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

        {/* --- FIXED DROPDOWN MENU --- */}
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

            <button
              type="button"
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white/90 transition hover:bg-white/[0.1]"
              onClick={() => {
                setMenuOpen(false);
                goReminders();
              }}
            >
              <FaBell className="text-lg text-amber-300" /> Reminders
              {!hasToken && (
                <span className="ml-auto text-[10px] font-medium uppercase tracking-wide text-white/35">
                  Login
                </span>
              )}
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
              {!hasToken && (
                <span className="ml-auto text-[10px] font-medium uppercase tracking-wide text-white/35">
                  Login
                </span>
              )}
            </button>

            {isOwner && (
              <button
                type="button"
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white/90 transition hover:bg-white/[0.1]"
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/card/wizard/step-1');
                }}
              >
                <FaEdit className="text-lg text-fuchsia-300" /> Edit card
              </button>
            )}

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
      </div>
    </header>
  );
}