import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { FaTimes, FaUniversity } from 'react-icons/fa';

function toStr(v) {
  return v == null ? '' : String(v).trim();
}

/** Payment Accounts modal: multiple bank/wallet accounts + QR + copy iban/account number. */
export function CardDisplayAccountModal({ open, onClose, user, onSaved }) {
  const [copiedKey, setCopiedKey] = useState('');
  const paymentMethods = useMemo(() => {
    const raw = Array.isArray(user?.payment_methods) ? user.payment_methods : [];
    return raw
      .map((m) => ({
        bank_name: toStr(m?.bank_name),
        account_title: toStr(m?.account_title),
        iban: toStr(m?.iban),
        pay_qr_img: toStr(m?.pay_qr_img),
      }))
      .filter((m) => m.bank_name || m.account_title || m.iban || m.pay_qr_img);
  }, [user]);

  const isOwner =
    typeof localStorage !== 'undefined' &&
    (() => {
      try {
        const raw = localStorage.getItem('visithon_user_info');
        if (!raw) return false;
        return JSON.parse(raw).id === user?.id;
      } catch {
        return false;
      }
    })();

  const [drafts, setDrafts] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const initial = paymentMethods.map((m) => ({
      bank_name: m.bank_name,
      iban: m.iban,
      account_title: m.account_title,
      pay_qr_img: m.pay_qr_img,
      file: null,
    }));

    setDrafts(
      initial.length > 0
        ? initial
        : [
            {
              bank_name: '',
              iban: '',
              account_title: '',
              pay_qr_img: '',
              file: null,
            },
          ],
    );
  }, [open, paymentMethods]);

  const copyText = async (key, text) => {
    const v = toStr(text);
    if (!v) return;
    try {
      await navigator.clipboard.writeText(v);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(''), 1400);
    } catch {
      setCopiedKey('');
    }
  };

  const savePaymentAccounts = async () => {
    if (!user?.id) return;
    const sanitizedDrafts = drafts.filter((d) => {
      const hasAny =
        toStr(d.bank_name) ||
        toStr(d.account_title) ||
        toStr(d.iban) ||
        toStr(d.pay_qr_img) ||
        !!d.file;
      return !!hasAny;
    });

    if (sanitizedDrafts.length === 0) return;

    const accounts_json = sanitizedDrafts.map((d) => ({
      bank_name: toStr(d.bank_name),
      account_title: toStr(d.account_title),
      iban: toStr(d.iban),
      pay_qr_img: toStr(d.pay_qr_img),
    }));

    const fd = new FormData();
    fd.append('accounts_json', JSON.stringify(accounts_json));
    sanitizedDrafts.forEach((d, idx) => {
      if (d.file) fd.append(`qr_file_${idx}`, d.file);
    });

    setSaving(true);
    try {
      await axios.post(
        `${API_BASE_URL}/card-auth/update-multi-bank/${user.id}`,
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      onSaved?.();
    } catch (e) {
      console.error('Save payment accounts failed:', e);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[#070d1a]/150 p-4 pb-10 backdrop-blur-sm sm:items-center sm:pb-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-accounts-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-white/15 bg-[#0d1425] px-4 py-4 shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 id="payment-accounts-modal-title" className="text-base font-bold text-white">
              Payment Accounts
            </h2>
            <p className="mt-1 text-[11px] text-white/45">
              Copy account number and scan QR for quick payments.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 touch-manipulation shrink-0 items-center justify-center rounded-2xl border border-white/12 text-white/80 hover:bg-white/[0.08]"
            aria-label="Close"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {paymentMethods.length > 0 ? (
          <div className="max-h-[75vh] space-y-3 overflow-y-auto pr-1 text-sm text-white/85">
            {paymentMethods.map((m, idx) => {
              const key = `${idx}:${m.iban}`;
              const qrUrl = m.pay_qr_img ? `${API_BASE_URL}/static/card_bank_qrs/${m.pay_qr_img}` : '';
              return (
                <div
                  key={key || idx}
                  className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {m.bank_name ? (
                        <div className="flex items-center gap-2">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0b3a8a]/25 text-white/90">
                            <FaUniversity />
                          </span>
                          <p className="truncate text-sm font-semibold text-white/90">{m.bank_name}</p>
                        </div>
                      ) : null}
                      {m.account_title ? (
                        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-white/40">
                          {m.account_title}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* IBAN / Account Number Section */}
{/* IBAN / Account Number Section */}
{m.iban ? (
  <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.08] p-4 shadow-inner">
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
          Account / IBAN
        </span>
        <button
          type="button"
          className={`shrink-0 rounded-lg px-3 py-1 text-[11px] font-bold transition-all ${
            copiedKey === key 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-white/10 text-white/90 hover:bg-white/20'
          }`}
          onClick={() => copyText(key, m.iban)}
        >
          {copiedKey === key ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      
      {/* Modern Font Style with Letter Spacing */}
      <span className="break-all font-sans text-2xl font-extrabold tracking-widest text-white drop-shadow-sm">
        {m.iban}
      </span>
    </div>
  </div>
) : null}

                  {qrUrl ? (
                    <div className="mt-3 flex justify-center">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2">
                        <img
                          src={qrUrl}
                          alt="Payment QR"
                          className="h-[180px] w-[180px] rounded-xl object-contain"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-white/55">
            No payment accounts added on this card.
          </p>
        )}

        {user?.id ? (
          <p className="mt-3 border-t border-white/10 pt-3 text-[11px] text-white/40">
            Card reference:{' '}
            <span className="font-mono text-white/55">{String(user.id).slice(-10)}…</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}