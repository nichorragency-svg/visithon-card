import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaTimes } from 'react-icons/fa';
import GlassShell from '../../visithon/components/GlassShell';
import { buildPublicCardViewUrl, cardViewRoutePath, parseCardIdFromScanText } from '../utils/cardPublicUrl';
import { upsertSavedCard } from '../utils/savedCardsStorage';

const SCAN_CONFIG = {
  fps: 15,
  qrbox: { width: 260, height: 260 },
  aspectRatio: 1.0,
};

const BACK_CAMERA_ATTEMPTS = [
  { facingMode: { exact: 'environment' } },
  { facingMode: 'environment' },
  { facingMode: { ideal: 'environment' } },
];

function isLoggedInForWallet() {
  return typeof localStorage !== 'undefined' && !!localStorage.getItem('visithon_card_token');
}

async function pickRearCameraId() {
  const cameras = await Html5Qrcode.getCameras();
  if (!cameras?.length) return null;
  const rear = cameras.find((cam) => /back|rear|environment|trás|arrière/i.test(cam.label || ''));
  return rear?.id || cameras[cameras.length - 1]?.id || cameras[0]?.id;
}

async function startRearCamera(html5Qr, onSuccess, onError) {
  let lastError;
  for (const constraints of BACK_CAMERA_ATTEMPTS) {
    try {
      await html5Qr.start(constraints, SCAN_CONFIG, onSuccess, onError);
      return;
    } catch (err) {
      lastError = err;
    }
  }

  const cameraId = await pickRearCameraId();
  if (cameraId) {
    await html5Qr.start(cameraId, SCAN_CONFIG, onSuccess, onError);
    return;
  }

  throw lastError || new Error('Unable to open back camera');
}

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const navigate = useNavigate();
  const handledRef = useRef(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    handledRef.current = false;
    setCameraError('');

    const html5Qr = new Html5Qrcode('reader', { verbose: false });
    scannerRef.current = html5Qr;

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
      html5Qr
        .stop()
        .catch(() => {})
        .finally(() => {
          scannerRef.current = null;
        });

      setScanResult(cardId);

      const route = cardViewRoutePath(cardId);
      const cardUrl = buildPublicCardViewUrl(cardId);

      if (isLoggedInForWallet() && cardUrl) {
        upsertSavedCard({ userId: cardId, name: '', cardUrl });
      }

      navigate(route, { replace: true });
    };

    const onScanError = () => {};

    void startRearCamera(html5Qr, onScanSuccess, onScanError).catch((err) => {
      const msg =
        err?.message ||
        'Could not open the back camera. Allow camera access and try again.';
      setCameraError(msg);
    });

    return () => {
      const active = scannerRef.current;
      scannerRef.current = null;
      if (!active) return;
      if (active.isScanning) {
        active.stop().catch(() => {});
      } else {
        active.clear();
      }
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
          <div id="reader" className="min-h-[280px] w-full" />
        </div>

        {cameraError ? (
          <p className="mt-3 text-center text-sm text-rose-300/90">{cameraError}</p>
        ) : null}

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
        #reader video {
          width: 100% !important;
          height: auto !important;
          object-fit: cover !important;
        }
        #reader__scan_region { background: #020617 !important; }
        #reader__dashboard_section,
        #reader__dashboard_section_csr,
        #reader__header_message { display: none !important; }
        .modern-scanner, #reader { background: #020617 !important; }
      `}</style>
    </GlassShell>
  );
};

export default QRScanner;
