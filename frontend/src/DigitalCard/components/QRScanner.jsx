import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaTimes } from 'react-icons/fa';
import GlassShell from '../../visithon/components/GlassShell';
import { buildPublicCardViewUrl, cardViewRoutePath, parseCardIdFromScanText } from '../utils/cardPublicUrl';
import { upsertSavedCard } from '../utils/savedCardsStorage';

function isLoggedInForWallet() {
  return typeof localStorage !== 'undefined' && !!localStorage.getItem('visithon_card_token');
}

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const navigate = useNavigate();
  const handledRef = useRef(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: { width: 260, height: 260 },
      fps: 15,
      rememberLastUsedCamera: true,
      aspectRatio: 1.0,
    });

    const onScanSuccess = (decodedText) => {
      if (handledRef.current) return;
      const raw = String(decodedText || '').trim();
      if (!raw) return;

      const cardId = parseCardIdFromScanText(raw);
      if (!cardId) {
        window.alert('Not a Visithon card link. Scan a /card/view/… QR code.');
        return;
      }

      handledRef.current = true;
      scanner.clear().catch(() => {});
      setScanResult(cardId);

      const route = cardViewRoutePath(cardId);
      const cardUrl = buildPublicCardViewUrl(cardId);

      if (isLoggedInForWallet() && cardUrl) {
        upsertSavedCard({ userId: cardId, name: '', cardUrl });
      }

      navigate(route, { replace: true });
    };

    scanner.render(onScanSuccess, () => {});

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [navigate]);

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
