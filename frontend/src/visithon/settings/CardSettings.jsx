import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaLayerGroup } from 'react-icons/fa';
import { getWizardState } from '../../supabase/supabaseWizard';
import GlassShell from '../components/GlassShell';

export default function CardSettings() {
  const navigate = useNavigate();
  const [shopFlag, setShopFlag] = useState(null);
  const [pricingPlan, setPricingPlan] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getWizardState();
        if (cancelled) return;
        const s1 = data.profile?.step1 || {};
        setShopFlag(typeof s1.shop_portfolio_enabled === 'boolean' ? s1.shop_portfolio_enabled : null);
        setPricingPlan(String(s1.pricing_plan || ''));
      } catch {
        /* silent — settings still usable */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const showProductServiceMgmt = shopFlag !== false;

  return (
    <GlassShell>
      <header className="shrink-0 flex items-center gap-3 border-b border-white/10 px-5 py-4 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-white/[0.07] text-white/90"
          aria-label="Back"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-xl font-bold text-white">Settings</h1>
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-6">
        <p className="text-sm text-white/50">Manage your Visithon Card account.</p>
        <p className="text-xs leading-relaxed text-white/38">
          <span className="text-white/55">Edit card</span> and <span className="text-white/55">Log out</span> are in your
          live card’s <span className="text-white/55">⋮</span> menu.
        </p>

        {showProductServiceMgmt && (
          <button
            type="button"
            onClick={() => navigate('/card/wizard/step-4')}
            className="flex w-full items-center gap-4 rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-4 text-left backdrop-blur-xl transition hover:border-emerald-400/30 hover:bg-white/[0.09]"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/35 bg-emerald-500/15 text-emerald-200">
              <FaLayerGroup />
            </span>
            <span>
              <span className="block font-semibold text-white">Product / service management</span>
              <span className="text-xs text-white/45">
                Manage your services list ·{' '}
                {shopFlag === true && pricingPlan
                  ? `Plan: ${pricingPlan}`
                  : shopFlag === true
                    ? 'Shop / portfolio enabled'
                    : 'From your wizard'}
              </span>
            </span>
          </button>
        )}

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 backdrop-blur-xl">
          <p className="text-xs text-white/40">Reminders stay on this device account. Public card viewers do not see them.</p>
        </div>
      </div>
    </GlassShell>
  );
}
