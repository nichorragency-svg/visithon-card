import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiErrorMessage } from '../../apiClient';
import { fetchWizardThemes, getWizardState, patchStep3 } from '../../api/visithonApi';
import CustomButton from '../components/CustomButton';
import GlassShell from '../components/GlassShell';
import { THEME_STYLE_BY_ID } from './themeVisuals';

const CHIPS = [
  { id: 'all', label: 'All' },
  { id: 'professional', label: 'Professional' },
  { id: 'modern', label: 'Modern' },
  { id: 'creative', label: 'Creative' },
  { id: 'healthcare', label: 'Healthcare' },
];

const FALLBACK_PREVIEW_BY_CATEGORY = {
  professional: { preview: 'from-sky-500 via-blue-800 to-slate-950', ring: 'ring-sky-400/60', glow: 'shadow-sky-500/30' },
  modern: { preview: 'from-slate-700 via-slate-900 to-black', ring: 'ring-slate-400/50', glow: 'shadow-slate-400/20' },
  creative: { preview: 'from-fuchsia-600 via-purple-600 to-indigo-900', ring: 'ring-fuchsia-400/60', glow: 'shadow-fuchsia-500/35' },
  healthcare: { preview: 'from-emerald-500 via-cyan-700 to-slate-950', ring: 'ring-emerald-400/55', glow: 'shadow-emerald-500/30' },
};

export default function WizardStep3() {
  const navigate = useNavigate();
  const [themes, setThemes] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState('');
  const [skipServicesStep, setSkipServicesStep] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Security Guard: Check for token
    const token = localStorage.getItem('visithon_card_token');
    if (!token) {
      navigate('/card/login');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const [listData, stateData] = await Promise.all([
          fetchWizardThemes(),
          getWizardState(),
        ]);
        if (cancelled) return;

        setThemes(listData.themes || []);
        
        const saved = stateData.profile?.step1?.theme;
        if (saved) setSelected(saved);

        const spe = stateData.profile?.step1?.shop_portfolio_enabled;
        setSkipServicesStep(spe === false);
      } catch (e) {
        if (!cancelled) setError(apiErrorMessage(e, 'Could not load themes.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const visible = useMemo(() => {
    if (filter === 'all') return themes;
    return themes.filter((t) => t.category === filter);
  }, [themes, filter]);

  const onContinue = async () => {
    setError('');
    if (!selected) {
      setError('Please choose a theme.');
      return;
    }
    setSaving(true);
    try {
      // Theme save karein
      await patchStep3({ theme: selected });
      
      // Yahan ab koi condition nahi, seedha Step-4 par bhejein
      navigate('/card/wizard/step-4'); 
    } catch (e) {
      setError(apiErrorMessage(e, 'Could not save theme.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <GlassShell>
      <div className="shrink-0 px-5 pt-4 pb-3">
        <h1 className="bg-gradient-to-r from-fuchsia-200 via-white to-cyan-200 bg-clip-text text-center text-2xl font-bold tracking-tight text-transparent">
          Choose Theme
        </h1>
        <p className="mt-2 text-center text-xs text-white/45">
          Select a visual style for your Visithon Card.
        </p>
      </div>

      {/* Categories Filter */}
      <div className="shrink-0 px-5 pb-3">
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CHIPS.map((c) => {
            const on = filter === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setFilter(c.id)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium backdrop-blur-md transition ${
                  on
                    ? 'border-sky-400/60 bg-white/15 text-white shadow-lg shadow-sky-500/20'
                    : 'border-white/10 bg-white/[0.06] text-white/70 hover:border-white/25'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
        {loading ? (
          <div className="flex flex-col items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-400 mb-2"></div>
            <p className="text-sm text-white/50">Loading Themes...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-center text-sm text-red-100 backdrop-blur-xl">
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 pb-4">
              {visible.map((t) => {
                const on = selected === t.id;
                const light = t.id === 'minimal_light';
                const st =
                  THEME_STYLE_BY_ID[t.id] ||
                  FALLBACK_PREVIEW_BY_CATEGORY[t.category] ||
                  THEME_STYLE_BY_ID.professional;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setSelected(t.id);
                      setError('');
                    }}
                    className={`group relative overflow-hidden rounded-2xl border bg-white/[0.07] p-0 text-left shadow-lg backdrop-blur-xl transition hover:brightness-[1.03] ${
                      on ? `ring-2 ${st.ring} ${st.glow} border-white/25` : 'border-white/10 hover:border-white/25'
                    }`}
                  >
                    <div
                      className={`h-24 w-full bg-gradient-to-br ${st.preview} opacity-95 transition group-hover:opacity-100`}
                    />
                    <div
                      className={`border-t border-white/10 px-3 py-2.5 ${
                        light ? 'bg-white/90 text-slate-900' : 'bg-black/40 text-white'
                      }`}
                    >
                      <p className={`text-sm font-semibold ${light ? 'text-slate-900' : 'text-white'}`}>
                        {t.name}
                      </p>
                      <p className={`text-xs ${light ? 'text-slate-600' : 'text-white/60'}`}>{t.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            {visible.length === 0 && (
              <p className="py-8 text-center text-sm text-white/45">No themes in this category.</p>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-white/10 bg-white/[0.06] px-5 pb-8 pt-4 shadow-[0_-12px_40px_rgba(0,0,0,0.25)] backdrop-blur-2xl">
        <CustomButton variant="gradient" onClick={onContinue} disabled={saving || loading}>
          {saving ? 'Saving…' : 'Continue'} <span aria-hidden>→</span>
        </CustomButton>
      </div>
    </GlassShell>
  );
}