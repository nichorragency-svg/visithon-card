import React from 'react';

export function CardDisplayLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#030712]">
      <div className="rounded-2xl border border-white/12 bg-white/[0.06] px-10 py-10 shadow-xl backdrop-blur-xl">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-sky-400 [animation-duration:1s]" />
        <p className="mt-5 text-center text-sm text-white/50">Loading…</p>
      </div>
    </div>
  );
}

export function CardDisplayNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#030712] text-rose-300/90">
      Card not found.
    </div>
  );
}

export function CardDisplayFetchError({ message, onRetry }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#030712] px-6 text-center">
      <p className="max-w-sm text-sm text-white/70">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-xl transition hover:bg-white/15"
      >
        Retry
      </button>
    </div>
  );
}
