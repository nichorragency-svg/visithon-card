import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaLink,
  FaTwitter,
  FaYoutube,
} from 'react-icons/fa';
import { apiErrorMessage } from '../../apiClient';
import { getWizardState, normalizeStep5Social, patchStep5 } from '../../supabase/supabaseWizard';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import GlassShell from '../components/GlassShell';
import GlassToggle from '../components/GlassToggle';

const EMPTY = { enabled: false, url: '' };

const PLATFORMS = [
  { key: 'facebook', label: 'Facebook', Icon: FaFacebookF, iconWrap: 'bg-blue-600/90', toggle: 'bg-sky-500 shadow-sky-500/40' },
  { key: 'instagram', label: 'Instagram', Icon: FaInstagram, iconWrap: 'bg-gradient-to-br from-amber-500 via-pink-600 to-purple-700' },
  { key: 'linkedin', label: 'LinkedIn', Icon: FaLinkedinIn, iconWrap: 'bg-[#0A66C2]' },
  { key: 'youtube', label: 'YouTube', Icon: FaYoutube, iconWrap: 'bg-red-600' },
  { key: 'twitter', label: 'Twitter (X)', Icon: FaTwitter, iconWrap: 'bg-neutral-800' },
  { key: 'custom', label: 'Add Custom Link', Icon: FaLink, iconWrap: 'bg-violet-600/90' },
];

function defaultSocial() {
  return {
    facebook: { ...EMPTY },
    instagram: { ...EMPTY },
    linkedin: { ...EMPTY },
    youtube: { ...EMPTY },
    twitter: { ...EMPTY },
    custom: { ...EMPTY },
  };
}

export default function WizardStep5() {
  const navigate = useNavigate();
  const [social, setSocial] = useState(defaultSocial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Security Guard
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
        const s5 = data.profile?.step5;
        setSocial(normalizeStep5Social(s5 && typeof s5 === 'object' ? s5 : {}));
      } catch (e) {
        if (!cancelled) setError(apiErrorMessage(e, 'Could not load social links.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const patch = (key, partial) => {
    setSocial((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...partial },
    }));
  };

  const displayUrl = (key, url) => {
    if (url) return url.length > 36 ? `${url.slice(0, 34)}…` : url;
    if (key === 'custom') return 'https://yourlink.com';
    return `your ${PLATFORMS.find((p) => p.key === key)?.label.toLowerCase() || 'link'}`;
  };

  const onContinue = async () => {
    setError('');
    setSaving(true);
    try {
      await patchStep5(social);
      // Step-7 ki bajaye Step-6 par bhejein
      navigate('/card/wizard/step-6'); 
    } catch (e) {
      setError(apiErrorMessage(e, 'Could not save social links.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <GlassShell>
      <div className="shrink-0 px-5 pt-4 pb-3 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white">Social Links</h1>
        <p className="mt-1 text-xs text-white/45">Connect your online presence.</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
        {loading ? (
          <div className="flex flex-col items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-sky-400 mb-2"></div>
            <p className="text-sm text-white/50">Loading links...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-center text-sm text-red-100 backdrop-blur-xl">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              {PLATFORMS.map(({ key, label, Icon, iconWrap, toggle }) => {
                const row = social[key];
                const on = row.enabled;
                const toggleActive =
                  toggle ||
                  (key === 'facebook'
                    ? 'bg-sky-500 shadow-sky-500/40'
                    : 'bg-emerald-500 shadow-lg shadow-emerald-500/35');
                return (
                  <div
                    key={key}
                    className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 shadow-inner shadow-black/20 backdrop-blur-xl"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-lg ${iconWrap}`}
                      >
                        <Icon className="text-lg" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-white">{label}</p>
                        <p className="truncate text-xs text-white/45">{displayUrl(key, row.url)}</p>
                      </div>
                      <GlassToggle
                        checked={on}
                        onChange={(v) => patch(key, { enabled: v })}
                        activeClass={toggleActive}
                      />
                    </div>
                    {on && (
                      <div className="mt-3 border-t border-white/10 pt-3">
                        <CustomInput
                          label="Profile URL"
                          name={`url_${key}`}
                          value={row.url ?? ''}
                          onChange={(e) => patch(key, { url: e.target.value })}
                          placeholder="Paste full profile URL (e.g. facebook.com/YourPage) — avoid site home only."
                          maxLength={500}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className="shrink-0 border-t border-white/10 bg-white/[0.06] px-5 pb-8 pt-4 shadow-2xl backdrop-blur-2xl">
        <CustomButton variant="gradient" onClick={onContinue} disabled={saving || loading}>
          {saving ? 'Saving…' : 'Continue'} <span aria-hidden>→</span>
        </CustomButton>
      </div>
    </GlassShell>
  );
}