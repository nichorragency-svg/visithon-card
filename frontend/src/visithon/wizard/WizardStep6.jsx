import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaGlobe, FaMapMarkerAlt, FaPhoneAlt, FaWhatsapp } from 'react-icons/fa';
import { apiErrorMessage } from '../../apiClient';
import { getWizardState, normalizeStep6Body, patchStep6 } from '../../supabase/supabaseWizard';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import GlassShell from '../components/GlassShell';
import GlassToggle from '../components/GlassToggle';

const initialContact = () => ({
  phone: '',
  whatsapp: '',
  whatsapp_visible: true,
  email: '',
  website: '',
  location: '',
  show_all_contacts: true,
});

const ROWS = [
  { key: 'phone', label: 'Phone Number', Icon: FaPhoneAlt, box: 'bg-blue-600' },
  { key: 'whatsapp', label: 'WhatsApp Number', Icon: FaWhatsapp, box: 'bg-green-500', whatsappToggle: true },
  { key: 'email', label: 'Email Address', Icon: FaEnvelope, box: 'bg-purple-600' },
  { key: 'website', label: 'Website', Icon: FaGlobe, box: 'bg-indigo-700' },
  { key: 'location', label: 'Location', Icon: FaMapMarkerAlt, box: 'bg-orange-500' },
];

export default function WizardStep6() {
  const navigate = useNavigate();
  const [c, setC] = useState(initialContact);
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
        const data = await getWizardState();
        if (cancelled) return;
        const s6 = data.profile?.step6;
        const merged =
          s6 && typeof s6 === 'object' ? { ...initialContact(), ...s6 } : initialContact();
        setC(normalizeStep6Body(merged));
      } catch (e) {
        if (!cancelled) setError(apiErrorMessage(e, 'Could not load contact details.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const setField = (key, value) => {
    setC((prev) => ({ ...prev, [key]: value }));
  };

  const onContinue = async () => {
    setError('');
    setSaving(true);
    try {
      await patchStep6({
        phone: c.phone.trim(),
        whatsapp: c.whatsapp.trim(),
        whatsapp_visible: !!c.whatsapp_visible,
        email: c.email.trim(),
        website: c.website.trim(),
        location: c.location.trim(),
        show_all_contacts: !!c.show_all_contacts,
      });
  
      // ISAY CHANGE KAREIN: Step-3 ki bajaye Step-7 par bhejein
      navigate('/card/wizard/step-7'); 
  
    } catch (e) {
      setError(apiErrorMessage(e, 'Could not save contact details.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <GlassShell>
      <div className="shrink-0 px-5 pt-4 pb-3">
        <h1 className="text-left text-2xl font-bold tracking-tight text-white">Contact Details</h1>
        <p className="mt-1 text-xs text-white/45">How people reach you on your public card.</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
        {loading ? (
          <p className="py-12 text-center text-sm text-white/50">Loading…</p>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-center text-sm text-red-100 backdrop-blur-xl">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              {ROWS.map(({ key, label, Icon, box, whatsappToggle }) => (
                <div
                  key={key}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 backdrop-blur-xl"
                >
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-lg ${box}`}>
                    <Icon className="text-lg" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">{label}</p>
                    <div className="mt-1">
                      <CustomInput
                        name={key}
                        value={c[key] ?? ''}
                        onChange={(e) => setField(key, e.target.value)}
                        placeholder={
                          key === 'phone' || key === 'whatsapp'
                            ? '+92 300 1234567'
                            : key === 'email'
                            ? 'you@example.com'
                            : key === 'website'
                            ? 'https://…'
                            : 'City or address'
                        }
                        maxLength={240}
                      />
                    </div>
                  </div>

                  {whatsappToggle && (
                    <GlassToggle
                      checked={!!c.whatsapp_visible}
                      onChange={(v) => setField('whatsapp_visible', v)}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3.5 backdrop-blur-xl">
              <span className="text-sm font-medium text-white/90">Show contact information</span>
              <GlassToggle
                checked={!!c.show_all_contacts}
                onChange={(v) => setField('show_all_contacts', v)}
              />
            </div>
          </>
        )}
      </div>

      <div className="shrink-0 border-t border-white/10 bg-white/[0.06] px-5 pb-8 pt-4 backdrop-blur-2xl">
        <CustomButton variant="gradient" onClick={onContinue} disabled={saving || loading}>
          {saving ? 'Saving…' : 'Continue'} →
        </CustomButton>
      </div>
    </GlassShell>
  );
}