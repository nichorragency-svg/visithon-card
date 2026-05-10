import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUniversity, FaUserAlt, FaCreditCard, FaPlus, FaTrash, FaQrcode, FaChevronDown } from 'react-icons/fa';
import { apiErrorMessage } from '../../apiClient';
import {
  finalizeBankAccountsFromWizard,
  getWizardState,
  refreshLocalUserInfoForSession,
} from '../../supabase/supabaseWizard';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import GlassShell from '../components/GlassShell';

// Pakistan Banks & Wallets Library
const PAK_BANKS = [
  "EasyPaisa",
  "JazzCash",
  "SadaPay",
  "NayaPay",
  "Meezan Bank",
  "Habib Bank (HBL)",
  "Bank Alfalah",
  "United Bank (UBL)",
  "Allied Bank (ABL)",
  "MCB Bank",
  "Standard Chartered",
  "National Bank (NBP)",
  "Askari Bank",
  "Faysal Bank",
  "Bank AL Habib",
  "Dubai Islamic Bank",
  "Al Baraka Bank",
  "U Microfinance Bank"
].sort();

function emptyAccount() {
  return { bank_name: '', account_title: '', iban: '', pay_qr_img: '', file: null };
}

function sanitizeAccountsList(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return [emptyAccount()];
  return raw.map((a) => {
    if (!a || typeof a !== 'object') return emptyAccount();
    return {
      bank_name: String(a.bank_name || '').trim(),
      account_title: String(a.account_title || '').trim(),
      iban: String(a.iban || '').trim(),
      pay_qr_img: String(a.pay_qr_img || a.qr_image_url || '').trim(),
      file: a.file instanceof File ? a.file : null,
    };
  });
}

export default function WizardStep9() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([emptyAccount()]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('visithon_card_token');
    if (!token) {
      navigate('/card/login');
      return;
    }

    const loadData = async () => {
      try {
        let list = null;
        const saved = localStorage.getItem('visithon_temp_accounts');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length) list = sanitizeAccountsList(parsed);
          } catch {
            localStorage.removeItem('visithon_temp_accounts');
          }
        }
        if (!list) {
          const data = await getWizardState();
          const raw = data.profile?.step9?.accounts;
          if (Array.isArray(raw) && raw.length) list = sanitizeAccountsList(raw);
        }
        setAccounts(list || [emptyAccount()]);
      } catch (e) {
        setError(apiErrorMessage(e, 'Could not load payment step.'));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [navigate]);

  const updateAccount = (index, field, value) => {
    const newAccounts = accounts.map((acc, i) => (i === index ? { ...acc, [field]: value } : acc));
    setAccounts(newAccounts);
    // Real-time save in local storage
    localStorage.setItem('visithon_temp_accounts', JSON.stringify(newAccounts));
  };

  const removeAccount = (index) => {
    if (accounts.length > 1) {
      const filtered = accounts.filter((_, i) => i !== index);
      setAccounts(filtered);
      localStorage.setItem('visithon_temp_accounts', JSON.stringify(filtered));
    }
  };

  const onSave = async () => {
    setError('');
    setSaving(true);
    try {
      const info = JSON.parse(localStorage.getItem('visithon_user_info') || '{}');
      
      if (!info.id) {
        setError("User session expired. Please login again.");
        return;
      }
  
      await finalizeBankAccountsFromWizard(accounts);

      localStorage.removeItem('visithon_temp_accounts');
      await refreshLocalUserInfoForSession();
      navigate(`/card/view/${info.id}`);
      
    } catch (e) {
      setError(apiErrorMessage(e, 'Could not save bank details.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <GlassShell>
        <div className="flex h-full items-center justify-center font-semibold text-white/20 animate-pulse">
          Loading Library...
        </div>
      </GlassShell>
    );
  }

  return (
    <GlassShell>
      <div className="shrink-0 px-5 pt-4 pb-3">
        <h1 className="text-left text-2xl font-bold tracking-tight text-white">Payment Accounts</h1>
        <p className="mt-1 text-xs text-white/45">Choose your bank and enter details.</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
        {error && (
          <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-center text-sm text-red-100">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-6">
          {accounts.map((a, i) => (
            <div key={i} className="relative rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl transition-all">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Account #{i + 1}</span>
                {accounts.length > 1 && (
                  <button onClick={() => removeAccount(i)} className="text-red-400/60 hover:text-red-400 p-1 transition-colors">
                    <FaTrash size={14} />
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {/* Bank Selector Dropdown */}
                <div className="relative flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-3 py-1">
                  <FaUniversity className="text-white/20 shrink-0" />
                  <select
                    value={a.bank_name}
                    onChange={(e) => updateAccount(i, 'bank_name', e.target.value)}
                    className="w-full bg-transparent py-3 text-sm text-white outline-none appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="bg-[#1a1a1a]">Select Bank / Wallet</option>
                    {PAK_BANKS.map((bank) => (
                      <option key={bank} value={bank} className="bg-[#1a1a1a]">
                        {bank}
                      </option>
                    ))}
                  </select>
                  <FaChevronDown className="absolute right-4 text-[10px] text-white/20 pointer-events-none" />
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-3 py-1">
                  <FaUserAlt className="text-white/20 shrink-0" />
                  <CustomInput
                    placeholder="Account Title"
                    value={a.account_title ?? ''}
                    onChange={(e) => updateAccount(i, 'account_title', e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-3 py-1">
                  <FaCreditCard className="text-white/20 shrink-0" />
                  <CustomInput
                    placeholder="Account Number / IBAN"
                    value={a.iban ?? ''}
                    onChange={(e) => updateAccount(i, 'iban', e.target.value)}
                  />
                </div>

                <div className="mt-2">
                  <p className="mb-2 text-[10px] font-bold uppercase text-white/30 ml-1">Upload QR (Optional)</p>
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] py-4 text-white/40 hover:bg-white/[0.05] transition-all">
                    <FaQrcode size={20} className={a.file ? "text-violet-400" : ""} />
                    <span className="text-[10px] truncate max-w-[150px]">
                      {a.file ? a.file.name : 'Choose QR Code Image'}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => updateAccount(i, 'file', e.target.files[0])}
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={() => setAccounts([...accounts, emptyAccount()])}
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/5 bg-white/[0.03] py-4 text-xs font-semibold text-white/40 hover:bg-white/10 transition-all active:scale-95"
          >
            <FaPlus size={10} /> Add Another Account
          </button>
        </div>
      </div>

      <div className="shrink-0 border-t border-white/10 bg-white/[0.06] px-5 pb-8 pt-4 backdrop-blur-2xl">
        <CustomButton variant="gradient" onClick={onSave} disabled={saving}>
          {saving ? 'Finalizing...' : 'Finish & View Card'} →
        </CustomButton>
      </div>
    </GlassShell>
  );
}