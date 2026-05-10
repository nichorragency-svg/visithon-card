import React from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config';

export default function AdminForgotPassword() {
  const apiHint = API_BASE_URL || '(set REACT_APP_API_BASE_URL — your FastAPI server URL)';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0c10] px-4 py-10">
      <div className="w-full max-w-lg space-y-4">
        <div className="rounded-2xl border border-white/10 bg-[#12151c] p-8 shadow-2xl shadow-black/60">
          <h1 className="text-xl font-semibold tracking-tight text-white">Admin · password help</h1>
          <p className="mt-2 text-sm text-white/50">
            Pehle admin screen tak pohnchne ke liye: isi browser tab mein <strong className="text-white/70">Alt+A</strong>{' '}
            jaldi do dafa dabao (shortcut unlock), phir login / yeh page khulega.
          </p>
          <p className="mt-2 text-sm text-white/50">
            Visithon <strong className="text-white/70">Admin</strong> alag system hai: login{' '}
            <strong className="text-white/70">MongoDB + FastAPI</strong> par hota hai — Supabase card login is
            se juda hai. Yahan automatic email reset (jaise card forgot password) <strong className="text-white/70">nahi</strong>{' '}
            chalta jab tak backend par email setup na ho.
          </p>

          <div className="mt-6 space-y-4 text-sm text-white/70">
            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="font-medium text-white/90">Admin login kaise?</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-white/60">
                <li>
                  Browser mein kholo: <code className="text-teal-300/90">/admin/login</code> (jaise{' '}
                  <code className="break-all text-teal-300/90">yoursite.vercel.app/admin/login</code>).
                </li>
                <li>
                  <code className="text-white/80">REACT_APP_API_BASE_URL</code> Vercel par tumhara{' '}
                  <strong className="text-white/80">live FastAPI</strong> URL hona chahiye (jahan{' '}
                  <code className="text-teal-300/90">/admin/login</code> chal raha ho).
                </li>
                <li className="text-white/50">Abhi build API base: {apiHint}</li>
              </ol>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="font-medium text-amber-200/90">Password bhool gaye?</p>
              <p className="mt-2 text-white/60">
                Jis ke paas <strong className="text-white/80">MongoDB</strong> access hai, woh password reset kar
                sakta hai:
              </p>
              <p className="mt-2 font-mono text-xs leading-relaxed text-teal-300/80">
                cd backend
                <br />
                python scripts/create_visithon_admin.py --reset your@email.com NewStrongPass123
              </p>
              <p className="mt-2 text-xs text-white/45">
                Pehli dafa admin banana (agar collection khali ho): same script bina{' '}
                <code className="text-white/55">--reset</code>, ya admin login page par &quot;Create admin&quot;.
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            <Link
              to="/admin/login"
              className="inline-flex w-full items-center justify-center rounded-lg bg-teal-600 py-2.5 text-sm font-medium text-white transition hover:bg-teal-500"
            >
              Back to admin login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
