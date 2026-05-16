import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCheck } from 'react-icons/fa';
import { apiErrorMessage } from '../../apiClient';
import { getWizardState, patchStep1PricingPlan } from '../../api/visithonApi';
import CustomButton from '../components/CustomButton';
import GlassShell from '../components/GlassShell';

const PLANS = [
  {
    id: 'free',
    title: 'Free',
    price: 'Rs 0',
    period: '/ month',
    blurb: 'Best to try Visithon with light shop use.',
    features: ['Digital card hosting', 'Up to 5 catalog items', 'Basic gallery'],
    badge: null,
    ringPassive: 'border-white/12 bg-white/[0.06]',
    ringActive: 'border-cyan-400/45 bg-white/[0.1] shadow-lg shadow-cyan-500/20 ring-1 ring-fuchsia-500/25',
    iconGlow: 'from-sky-500/35 to-indigo-500/30',
  },
  {
    id: 'basic',
    title: 'Basic',
    price: 'Rs 1999',
    period: '/ month',
    blurb: 'More room to grow your services & offers.',
    features: ['Everything in Free', 'Up to 25 catalog items', 'Priority thumbnails', 'Email support'],
    badge: null,
    ringPassive: 'border-white/12 bg-white/[0.06]',
    ringActive: 'border-cyan-400/45 bg-white/[0.1] shadow-lg shadow-fuchsia-500/15 ring-1 ring-cyan-400/30',
    iconGlow: 'from-fuchsia-500/35 to-violet-500/30',
  },
  {
    id: 'pro',
    title: 'Pro',
    price: 'Rs 2,999',
    period: '/ month',
    blurb: 'Full portfolio & shop toolkit for busy pros.',
    features: ['Everything in Basic', 'Unlimited items (fair use)', 'Branded catalogue layout', 'Chat support'],
    badge: 'Recommended',
    ringPassive: 'border-white/12 bg-white/[0.07]',
    ringActive: 'border-fuchsia-400/55 bg-gradient-to-br from-white/[0.12] to-violet-500/10 shadow-xl shadow-fuchsia-500/25 ring-2 ring-cyan-400/35',
    iconGlow: 'from-amber-400/40 via-fuchsia-500/45 to-cyan-400/35',
  },
];

export default function WizardStep1Plan() {
  const navigate = useNavigate();
  const location = useLocation();
  const isStep10 = location.pathname.includes('/wizard/step-10');
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [shopOn, setShopOn] = useState(false);

  useEffect(() => {
    // Security Guard: Check if user is logged in
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
        setShopOn(s1.shop_portfolio_enabled === true);
        const saved = String(s1.pricing_plan || '').toLowerCase();
        if (['free', 'basic', 'pro'].includes(saved)) setPlan(saved);
        else setPlan('free');
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

  useEffect(() => {
    if (!loading && !shopOn) {
      if (isStep10) {
        try {
          const info = JSON.parse(localStorage.getItem('visithon_user_info') || '{}');
          const id = String(info?.id || '').trim();
          if (id) navigate(`/card/view/${id}`, { replace: true });
          else navigate('/card/wizard/step-1-feature', { replace: true });
        } catch {
          navigate('/card/wizard/step-1-feature', { replace: true });
        }
      } else {
        navigate('/card/wizard/step-1-feature', { replace: true });
      }
    }
  }, [loading, shopOn, navigate, isStep10]);

  const defaultPlan = useMemo(() => PLANS.find((p) => p.id === 'free'), []);

  const onContinue = async () => {
    setError('');
    const pick = plan || defaultPlan?.id || 'free';
    if (!['free', 'basic', 'pro'].includes(pick)) {
      setError('Please pick a pricing plan.');
      return;
    }
    setSaving(true);
    try {
      await patchStep1PricingPlan({ pricing_plan: pick });
      if (isStep10) {
        const info = JSON.parse(localStorage.getItem('visithon_user_info') || '{}');
        const id = String(info?.id || '').trim();
        if (id) navigate(`/card/view/${id}`);
        else navigate('/card/login');
      } else {
        navigate('/card/wizard/step-2');
      }
    } catch (e) {
      setError(apiErrorMessage(e, 'Could not save plan.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <GlassShell>
      <div className="shrink-0 px-5 pt-4 pb-2">
        <h1 className="bg-gradient-to-r from-fuchsia-200 via-white to-cyan-200 bg-clip-text text-left text-2xl font-bold leading-tight tracking-tight text-transparent drop-shadow-[0_0_24px_rgba(168,85,247,0.25)]">
          {isStep10 ? 'Step 10 · Pricing plans' : 'Pricing Plans'}
        </h1>
        <p className="mt-2 text-left text-xs leading-relaxed text-white/45">
          {isStep10
            ? 'Shop / portfolio ke liye package yahan choose karein — payment pehle step 9 par save ho chuki hai.'
            : 'Choose a plan to activate product / service management on your card. You can change billing later.'}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-2">
        {loading ? (
          <div className="flex flex-col items-center py-20">
             <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-fuchsia-500 mb-2"></div>
             <p className="text-sm text-white/50">Fetching Plans...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-center text-sm text-red-100 backdrop-blur-xl">
                {error}
              </div>
            )}
            <ul className="flex flex-col gap-3">
              {PLANS.map((row, idx) => {
                const active = plan === row.id || (!plan && row.id === defaultPlan?.id);
                return (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setPlan(row.id);
                        setError('');
                      }}
                      className={`relative w-full rounded-2xl border px-4 py-4 text-left transition ${
                        active ? row.ringActive : row.ringPassive
                      } backdrop-blur-xl`}
                    >
                      {row.badge && (
                        <span className="absolute right-4 top-4 rounded-full border border-fuchsia-400/40 bg-fuchsia-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-fuchsia-100">
                          {row.badge}
                        </span>
                      )}
                      <div className="flex items-start gap-3 pr-24">
                        <span
                          className={`relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${row.iconGlow}`}
                          style={{ animationDelay: `${idx * 0.1}s` }}
                        >
                          <span className="text-xs font-black text-white">{row.title.slice(0, 2)}</span>
                        </span>
                        <div className="min-w-0">
                          <p className={`text-lg font-bold ${active ? 'text-white' : 'text-white/90'}`}>{row.title}</p>
                          <p className="mt-1 text-xs leading-snug text-white/45">{row.blurb}</p>
                          <p className="mt-3 flex flex-wrap items-baseline gap-1">
                            <span className="bg-gradient-to-r from-cyan-200 to-fuchsia-200 bg-clip-text text-xl font-extrabold text-transparent">
                              {row.price}
                            </span>
                            <span className="text-xs text-white/35">{row.period}</span>
                          </p>
                        </div>
                      </div>
                      <ul className="mt-4 space-y-2 border-t border-white/10 pt-3">
                        {row.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-xs text-white/75">
                            <FaCheck className="shrink-0 text-emerald-400/90" aria-hidden />
                            {f}
                          </li>
                        ))}
                      </ul>
                      {active && (
                        <span
                          className="absolute right-4 bottom-4 h-2.5 w-2.5 rounded-full bg-gradient-to-r from-fuchsia-400 to-cyan-400 shadow shadow-cyan-400/60"
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