import React from 'react';
import { FaCamera } from 'react-icons/fa';

export default function ProfileAvatarUpload({
  previewUrl,
  uploading,
  fileInputRef,
  onPick,
  onFileChange,
  hint,
}) {
  return (
    <div className="mb-8 flex flex-col items-center">
      <div className="relative p-[3px]">
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 opacity-90 blur-[2px]"
          aria-hidden
        />
        <div className="relative flex h-[7.25rem] w-[7.25rem] items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10 shadow-xl shadow-black/30 backdrop-blur-xl">
          {previewUrl ? (
            <img src={previewUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-white/40">Photo</span>
          )}
        </div>
        <button
          type="button"
          onClick={onPick}
          disabled={uploading}
          className="absolute -bottom-1 -right-1 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/40 ring-4 ring-slate-950/80 transition hover:brightness-110 active:scale-95 disabled:opacity-60"
          aria-label="Upload profile photo"
        >
          <FaCamera className="animate-vt-icon-bling text-white" size={16} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          style={{ display: 'none' }}
          aria-hidden
          onChange={onFileChange}
        />
      </div>
      {uploading && <p className="mt-2 text-xs text-cyan-200/80">Uploading…</p>}
      {hint && !uploading && (
        <p className="mt-2 max-w-[260px] text-center text-xs text-white/45">{hint}</p>
      )}
    </div>
  );
}
