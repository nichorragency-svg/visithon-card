import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { apiClient, apiErrorMessage } from '../../apiClient';
import CustomButton from '../components/CustomButton';
import GlassShell from '../components/GlassShell';
import { STEP1_PROFESSIONS } from './constants';

export default function WizardStep1() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [profession, setProfession] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
  const token = localStorage.getItem('visithon_card_token');
  if (!token) {
    navigate('/card/login');
    return;
  }

  let cancelled = false;
  (async () => {
    try {
      const { data } = await apiClient.get('/visithon/wizard/state');
      if (cancelled) return;

      // Debugging k lye console check kren
      console.log("Wizard State Data:", data);

      // --- SAKHT CHECK ---
      // Agar wizard mukammal hy, ya is_published true hy, toh redirect kren
      if (data.wizard_completed === true || data.is_published === true) {
        const info = JSON.parse(localStorage.getItem('visithon_user_info') || '{}');
        const userId = info.id || data.profile?._id; // backup ID
        
        console.log("Redirecting to Card View...");
        navigate(`/card/view/${userId}`);
        return;
      }

      const saved = data.profile?.step1?.profession;
      if (saved) setProfession(saved);

    } catch (e) {
      if (!cancelled) setError(apiErrorMessage(e, 'Could not load profile.'));
    } finally {
      if (!cancelled) setLoading(false);
    }
  })();
  return () => { cancelled = true; };
}, [navigate]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return STEP1_PROFESSIONS;
    return STEP1_PROFESSIONS.filter((p) => p.label.toLowerCase().includes(q));
  }, [query]);

  const onContinue = async () => {
    setError('');
    if (!profession) {
      setError('Please select a profession.');
      return;
    }
    setSaving(true);
    try {
      await apiClient.patch('/visithon/wizard/step1', { profession });
      navigate('/card/wizard/step-1-feature');
    } catch (e) {
      setError(apiErrorMessage(e, 'Could not save.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <GlassShell>
      {/* Header Section */}
      <div className="shrink-0 px-5 pt-4 pb-2">
        <h1 className="bg-gradient-to-r from-fuchsia-200 via-white to-cyan-200 bg-clip-text text-left text-2xl font-bold leading-tight tracking-tight text-transparent">
          Select Your Profession
        </h1>
        <p className="text-white/50 text-sm mt-1">This will be displayed on your digital card.</p>
      </div>

      {/* Search Bar Section */}
      <div className="shrink-0 px-5 pt-3">
        <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.08] px-4 py-3.5 shadow-inner shadow-black/20 backdrop-blur-xl">
          <FaSearch
            className="shrink-0 animate-vt-search-glow text-white/40"
            size={16}
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search profession..."
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
            autoComplete="off"
          />
        </div>
      </div>

      {/* List Section */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-4">
        {loading ? (
          <div className="flex flex-col items-center py-20">
             <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-fuchsia-500 mb-2"></div>
             <p className="text-sm text-white/50">Loading Profile...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-center text-sm text-red-100 backdrop-blur-xl">
                {error}
              </div>
            )}
            <ul className="flex flex-col gap-2.5 pb-6">
              {filtered.map((p, idx) => {
                const Icon = p.Icon;
                const active = profession === p.id;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setProfession(p.id);
                        setError('');
                      }}
                      className={`flex w-full items-center gap-4 rounded-2xl border px-3 py-3.5 text-left transition ${
                        active
                          ? 'border-fuchsia-400/35 border-cyan-400/25 bg-white/[0.12] shadow-lg shadow-fuchsia-500/15 ring-1 ring-cyan-400/20 backdrop-blur-xl'
                          : 'border-white/10 bg-white/[0.05] hover:border-white/20 hover:bg-white/[0.08] backdrop-blur-md'
                      }`}
                    >
                      <span
                        className={`relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl backdrop-blur-sm animate-vt-icon-bling ${p.tileClass}`}
                        style={{ animationDelay: `${idx * 0.15}s` }}
                      >
                        <Icon className={`relative z-[1] text-[1.05rem] ${p.iconClass}`} aria-hidden />
                      </span>
                      <span
                        className={`text-base font-medium ${active ? 'text-white' : 'text-slate-100/90'}`}
                      >
                        {p.label}
                      </span>
                      {active && (
                        <span
                          className="ml-auto mr-1 h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-to-r from-fuchsia-400 to-cyan-400 shadow shadow-cyan-400/50"
                          aria-hidden
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            {filtered.length === 0 && (
              <p className="py-8 text-center text-sm text-white/45">No matches found.</p>
            )}
          </>
        )}
      </div>

      {/* Action Footer */}
      <div className="shrink-0 border-t border-white/10 bg-white/[0.06] px-5 pb-8 pt-4 shadow-[0_-12px_40px_rgba(0,0,0,0.25)] backdrop-blur-2xl">
        <CustomButton variant="gradient" onClick={onContinue} disabled={saving || loading}>
          {saving ? 'Saving…' : 'Continue'} <span aria-hidden>→</span>
        </CustomButton>
      </div>
    </GlassShell>
  );
}