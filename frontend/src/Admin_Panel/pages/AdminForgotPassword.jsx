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
          <p className="mt-2 rounded-lg border border-sky-500/25 bg-sky-500/10 px-3 py-2 text-sm text-sky-100/90">
            <strong>Yeh page password set nahi karti.</strong> Neeche jo steps hain woh sirf guide hain — asal password tumhara{' '}
            <strong className="text-white">PC / server</strong> par <strong className="text-white">Python command</strong>{' '}
            se MongoDB mein likha jata hai. Is page par type karke naya password save nahi hota.
          </p>
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
              <p className="font-medium text-amber-200/90">Naya password yahan kaise lagta hai?</p>
              <p className="mt-2 text-white/60">
                <strong className="text-amber-100/90">1)</strong> Apne laptop par Cursor / Terminal khol kar backend folder mein jao.
                <br />
                <strong className="text-amber-100/90">2)</strong> Neeche wali Python line chalao (email apna admin wala, password jo tum set karna chahte ho).
              </p>
              <p className="mt-2 font-mono text-xs leading-relaxed text-teal-300/80">
                cd path\to\Eventthon card\backend
                <br />
                python scripts/create_visithon_admin.py --reset your-admin@gmail.com TumharaNayaPassword
              </p>
              <p className="mt-2 text-xs text-white/45">
                Jab terminal mein likha aa jaye{' '}
                <code className="text-emerald-300/90">&quot;Password updated for admin&quot;</code>, tab{' '}
                <Link to="/admin/login" className="underline decoration-teal-500/60 hover:text-teal-200">
                  Admin login
                </Link>{' '}
                par wahi email + naya password use karo. Pehli dafa admin (DB khali): same script{' '}
                <strong className="text-white/60">bina</strong> <code className="text-white/55">--reset</code>.
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
