import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShoppingBag, FaUser } from 'react-icons/fa';
import { apiErrorMessage } from '../../apiClient';
import { getWizardState, patchStep1ShopFlag } from '../../api/visithonApi';
import CustomButton from '../components/CustomButton';
import GlassShell from '../components/GlassShell';

export default function WizardStep1Feature() {
  const navigate = useNavigate();
  const [choice, setChoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [hasProfession, setHasProfession] = useState(false);

  useEffect(() => {
    // Security Check: Redirect if no token is found
    const token = localStorage.getItem('visithon_card_token');
    if (!token) {
      navigate('/card/login');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const data = await getWizardState();
        if (cancelled) return;

        const s1 = data.profile?.step1 || {};
        const profession = String(s1.profession || '').trim();
        setHasProfession(Boolean(profession));

        const spe = s1.shop_portfolio_enabled;
        if (spe === true) setChoice('yes');
        else if (spe === false) setChoice('no');
      } catch (e) {
        if (!cancelled) setError(apiErrorMessage(e, 'Could not load profile.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // Logic to ensure user has completed step 1
  useEffect(() => {
    if (!loading && !hasProfession) {
      navigate('/card/wizard/step-1', { replace: true });
    }
  }, [loading, hasProfession, navigate]);

  const onContinue = async () => {
    setError('');
    if (choice !== 'yes' && choice !== 'no') {
      setError('Please select Yes or No.');
      return;
    }
    setSaving(true);
    try {
      const enabled = choice === 'yes';
      await patchStep1ShopFlag({
        shop_portfolio_enabled: enabled,
      });
      // Pricing plan is step 10 (after payment step 9), not here
      navigate('/card/wizard/step-2');
    } catch (e) {
      setError(apiErrorMessage(e, 'Could not save.'));
    } finally {
      setSaving(false);
    }
  };

  const options = [
    {
      key: 'yes',
      title: 'Yes',
      subtitle: 'Shop / portfolio tools, products & gallery-style setup. Pricing plan comes after payment (step 10).',
      Icon: FaShoppingBag,
      tileClass: 'bg-gradient-to-br from-emerald-500/45 via-cyan-500/35 to-fuchsia-500/40 shadow-lg shadow-emerald-500/20',
      iconClass: 'text-white',
    },
    {
      key: 'no',
      title: 'No',
      subtitle: 'A simple Visithon digital card — basics, theme, contacts, and social.',
      Icon: FaUser,
      tileClass: 'bg-gradient-to-br from-slate-500/40 via-indigo-500/35 to-violet-500/40 shadow-lg shadow-violet-500/15',
      iconClass: 'text-white',
    },
  ];

  return (
    <GlassShell>
      <div className="shrink-0 px-5 pt-4 pb-2">
        <h1 className="bg-gradient-to-r from-fuchsia-200 via-white to-cyan-200 bg-clip-text text-left text-2xl font-bold leading-tight tracking-tight text-transparent drop-shadow-[0_0_24px_rgba(168,85,247,0.25)]">
          Feature Selection
        </h1>
        <p className="mt-2 text-left text-sm leading-relaxed text-white/55">
          Do you want to enable a shop / portfolio system on your Visithon Card?
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-2">
        {loading ? (
          <div className="flex flex-col items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-400 mb-2"></div>
            <p className="text-sm text-white/50">Loading Options...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-center text-sm text-red-100 backdrop-blur-xl">
                {error}
              </div>
            )}
            <ul className="flex flex-col gap-2.5">
              {options.map((opt, idx) => {
                const Icon = opt.Icon;
                const active = choice === opt.key;
                return (
                  <li key={opt.key}>
                    <button
                      type="button"
                      onClick={() => {
                        setChoice(opt.key);
                        setError('');
                      }}
                      className={`flex w-full items-center gap-4 rounded-2xl border px-3 py-3.5 text-left transition ${
                        active
                          ? 'border-fuchsia-400/40 border-cyan-400/30 bg-white/[0.12] shadow-lg shadow-fuchsia-500/15 ring-1 ring-cyan-400/25 backdrop-blur-xl'
                          : 'border-white/10 bg-white/[0.05] backdrop-blur-md hover:border-white/20 hover:bg-white/[0.08]'
                      }`}
                    >
                      <span
                        className={`relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl backdrop-blur-sm ${opt.tileClass}`}
                        style={{ animationDelay: `${idx * 0.12}s` }}
                      >
                        <Icon className={`relative z-[1] text-[1.05rem] ${opt.iconClass}`} aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block text-base font-semibold ${active ? 'text-white' : 'text-slate-100/90'}`}
                        >
                          {opt.title}
                        </span>
                        <span className="mt-0.5 block text-xs leading-snug text-white/45">{opt.subtitle}</span>
                      </span>
                      {active && (
                        <span
                          className="mr-1 h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-to-r from-fuchsia-400 to-cyan-400 shadow shadow-cyan-400/50"
                          aria-hidden
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      <div className="shrink-0 border-t border-white/10 bg-white/[0.06] px-5 pb-8 pt-4 shadow-[0_-12px_40px_rgba(0,0,0,0.25)] backdrop-blur-2xl">
        <CustomButton variant="gradient" onClick={onContinue} disabled={saving || loading}>
          {saving ? 'Saving…' : 'Continue'} <span aria-hidden>→</span>
        </CustomButton>
      </div>
    </GlassShell>
  );
}