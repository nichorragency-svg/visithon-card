import React from 'react';
import AdminPasswordInput from '../components/AdminPasswordInput';

const bootInputClass =
  'w-full rounded-lg border border-white/10 bg-black/40 py-2.5 pl-3 pr-11 text-white outline-none focus:border-teal-500/50';

export default function AdminLoginSelfRegister({
  showCreate,
  onToggleCreate,
  onCreateAdmin,
  cName,
  setCName,
  cEmail,
  setCEmail,
  cPassword,
  setCPassword,
  showCPw,
  setShowCPw,
  cConfirm,
  setCConfirm,
  showCConfirm,
  setShowCConfirm,
  cBootstrap,
  setCBootstrap,
  showCBootstrap,
  setShowCBootstrap,
  cErr,
  cLoading,
}) {
  return (
    <>
      <button
        type="button"
        onClick={onToggleCreate}
        className="w-full rounded-lg border border-white/15 bg-white/5 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10"
      >
        {showCreate ? 'Hide create admin' : 'Create admin'}
      </button>

      {showCreate ? (
        <form onSubmit={onCreateAdmin} className="mt-5 space-y-3">
          <p className="text-xs text-white/40">
            First admin: leave bootstrap empty. Later:{' '}
            <code className="rounded bg-black/40 px-1 text-white/60">ADMIN_BOOTSTRAP_SECRET</code> +{' '}
            <code className="rounded bg-black/40 px-1 text-white/60">ADMIN_REGISTER_PUBLIC=true</code>.
          </p>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-white/40">Name (optional)</label>
            <input
              type="text"
              value={cName}
              onChange={(e) => setCName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-teal-500/50"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-white/40">Email</label>
            <input
              type="email"
              required
              value={cEmail}
              onChange={(e) => setCEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-teal-500/50"
              autoComplete="off"
            />
          </div>
          <AdminPasswordInput
            id="admin-c-pw"
            label="Password (min 8)"
            value={cPassword}
            onChange={setCPassword}
            show={showCPw}
            onToggle={() => setShowCPw((v) => !v)}
            autoComplete="new-password"
            required
            minLength={8}
            inputClassName={bootInputClass}
          />
          <AdminPasswordInput
            id="admin-c-pw2"
            label="Confirm password"
            value={cConfirm}
            onChange={setCConfirm}
            show={showCConfirm}
            onToggle={() => setShowCConfirm((v) => !v)}
            autoComplete="new-password"
            required
            inputClassName={bootInputClass}
          />
          <AdminPasswordInput
            id="admin-c-boot"
            label="Bootstrap secret (if admins already exist)"
            value={cBootstrap}
            onChange={setCBootstrap}
            show={showCBootstrap}
            onToggle={() => setShowCBootstrap((v) => !v)}
            autoComplete="off"
            placeholder="Only when adding 2nd+ admin"
            inputClassName={bootInputClass}
            toggleAriaLabel={showCBootstrap ? 'Hide bootstrap secret' : 'Show bootstrap secret'}
          />
          {cErr ? <p className="text-sm text-rose-400">{cErr}</p> : null}
          <button
            type="submit"
            disabled={cLoading}
            className="w-full rounded-lg bg-white/15 py-2.5 text-sm font-medium text-white hover:bg-white/20 disabled:opacity-50"
          >
            {cLoading ? 'Creating…' : 'Create admin account'}
          </button>
        </form>
      ) : null}
    </>
  );
}
