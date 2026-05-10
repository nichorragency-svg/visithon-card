import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaTimes } from 'react-icons/fa';
import { SUPABASE_CONFIGURED } from '../../config';
import { supabase } from '../../supabase/client';
import GlassShell from '../../visithon/components/GlassShell';
import { parseViewUserIdFromUrl, upsertSavedCard } from '../utils/savedCardsStorage';

async function isLoggedInForWallet() {
  if (typeof localStorage !== 'undefined' && localStorage.getItem('visithon_card_token')) return true;
  if (!SUPABASE_CONFIGURED || !supabase) return false;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return !!session?.access_token;
}

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: { width: 260, height: 260 },
      fps: 20,
      rememberLastUsedCamera: true,
      aspectRatio: 1.0,
    });

    scanner.render(onScanSuccess, () => {});

    function onScanSuccess(result) {
      scanner.clear();
      setScanResult(result);

      if (result.includes('/card/view/')) {
        void (async () => {
          const uid = parseViewUserIdFromUrl(result);
          if (uid && (await isLoggedInForWallet())) {
            let cardUrl = String(result).trim();
            try {
              cardUrl = new URL(cardUrl, window.location.origin).href;
            } catch {
              cardUrl = `${window.location.origin}/card/view/${encodeURIComponent(uid)}`;
            }
            upsertSavedCard({ userId: uid, name: '', cardUrl });
          }
          window.location.href = result;
        })();
      } else {
        alert(`Scanned: ${result}`);
      }
    }

    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  return (
    <GlassShell>
      <header className="shrink-0 flex items-center gap-3 border-b border-white/10 px-4 py-4 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-white/[0.07] text-white/90"
          aria-label="Back"
        >
          <FaArrowLeft />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-white">Scan QR Code</h1>
          <p className="text-sm text-white/50">Align the code in the frame to open a Visithon Card.</p>
        </div>
      </header>

      <div className="flex flex-1 flex-col px-5 pb-8 pt-4">
        <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-black/40 shadow-inner">
          <div id="reader" className="min-h-[280px]" />
        </div>

        {scanResult && (
          <p className="mt-4 text-center text-sm font-medium text-emerald-300/90">Opening card…</p>
        )}

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.08] py-3.5 text-sm font-semibold text-white/90 backdrop-blur-md transition hover:bg-white/[0.12]"
        >
          <FaTimes />
          Close
        </button>
      </div>

      <style>{`
        #reader { border: none !important; }
        #reader img { display: none !important; }
        #reader__dashboard_section_csr button {
          background: linear-gradient(to right, #2563eb, #4f46e5) !important;
          color: white !important;
          border: none !important;
          padding: 10px 18px !important;
          border-radius: 12px !important;
          cursor: pointer !important;
          margin-top: 10px !important;
        }
        #reader__status_span { color: rgba(255,255,255,0.55) !important; }
        .modern-scanner, #reader { background: #020617 !important; }
      `}</style>
    </GlassShell>
  );
};

export default QRScanner;
