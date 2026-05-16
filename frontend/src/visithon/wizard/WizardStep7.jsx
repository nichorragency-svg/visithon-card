import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiErrorMessage } from '../../apiClient';
import {
  getWizardState,
  normalizeStep7Schedule,
  patchStep7,
} from '../../api/visithonApi';
import CustomButton from '../components/CustomButton';
import GlassShell from '../components/GlassShell';
import GlassToggle from '../components/GlassToggle';
import { formatTimeRange12 } from './wizardTimeFormat';
import { FaClock, FaCalendarAlt, FaChevronRight } from 'react-icons/fa';

const DAY_KEYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

function emptySchedule() {
  return Object.fromEntries(
    DAY_KEYS.map(({ key }, i) => [key, { enabled: i < 5, open: '09:00', close: '17:00' }])
  );
}

export default function WizardStep7() {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(emptySchedule);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [timeModal, setTimeModal] = useState(null);

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
        const s7 = data.profile?.step7;
        const base = emptySchedule();
        const legacyBh =
          s7?.business_hours && typeof s7.business_hours === 'object' ? s7.business_hours : null;
        if (s7 && typeof s7 === 'object') {
          DAY_KEYS.forEach(({ key }) => {
            let row = s7[key];
            if ((!row || typeof row !== 'object') && legacyBh && legacyBh[key]) {
              const br = legacyBh[key];
              if (br && typeof br === 'object') {
                row = {
                  enabled: !br.is_closed,
                  open: String(br.open != null ? br.open : '09:00').slice(0, 8),
                  close: String(br.close != null ? br.close : '17:00').slice(0, 8),
                };
              }
            }
            if (row && typeof row === 'object') {
              base[key] = {
                enabled: !!row.enabled,
                open: typeof row.open === 'string' ? row.open : base[key].open,
                close: typeof row.close === 'string' ? row.close : base[key].close,
              };
            }
          });
        }
        setSchedule(normalizeStep7Schedule(base));
      } catch (e) {
        if (!cancelled) setError(apiErrorMessage(e, 'Could not load business hours.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const patchDay = (key, partial) => {
    setSchedule((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...partial },
    }));
  };

  const schedulePayload = useMemo(() => {
    const o = {};
    DAY_KEYS.forEach(({ key }) => { o[key] = { ...schedule[key] }; });
    return o;
  }, [schedule]);

  const onContinue = async () => {
    setError('');
    setSaving(true);
    try {
      await patchStep7({ schedule: schedulePayload });
      navigate('/card/wizard/step-8');
    } catch (e) {
      setError(apiErrorMessage(e, 'Could not save business hours.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <GlassShell>
      {/* Header with Icon */}
      <div className="shrink-0 px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/30">
                <FaClock className="text-xl" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Business Hours</h1>
        </div>
        <p className="text-xs text-white/40 ml-12">Select your working days and set timings.</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
        {loading ? (
          <div className="flex justify-center items-center py-20">
             <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-400"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {error && !timeModal && (
              <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100 backdrop-blur-xl">
                {error}
              </div>
            )}

            {DAY_KEYS.map(({ key, label }) => {
              const row = schedule[key];
              const on = row.enabled;
              return (
                <div
                  key={key}
                  className={`group relative overflow-hidden transition-all duration-300 rounded-2xl border ${
                    on ? 'border-white/20 bg-white/[0.08] shadow-lg' : 'border-white/5 bg-white/[0.02] opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-4 px-4 py-4">
                    {/* Day Name */}
                    <div className="w-24 shrink-0">
                      <p className={`text-sm font-bold uppercase tracking-wider ${on ? 'text-white' : 'text-white/30'}`}>
                        {label.slice(0, 3)}
                      </p>
                      <p className="text-[10px] text-white/20 font-medium">{on ? 'Open' : 'Closed'}</p>
                    </div>

                    {/* Time Picker Trigger */}
                    <button
                      type="button"
                      disabled={!on}
                      onClick={() => on && setTimeModal({ key, open: row.open, close: row.close })}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 px-3 transition-all ${
                        on ? 'bg-white/5 hover:bg-white/10 text-white shadow-inner' : 'text-white/10'
                      }`}
                    >
                      <span className="text-sm font-semibold tracking-wide">
                        {on ? formatTimeRange12(row.open, row.close) : '-- : --'}
                      </span>
                      {on && <FaChevronRight className="text-[10px] text-white/20" />}
                    </button>

                    {/* Toggle */}
                    <div className="shrink-0 ml-2">
                      <GlassToggle checked={on} onChange={(v) => patchDay(key, { enabled: v })} />
                    </div>
                  </div>
                  
                  {/* Bottom Glow Line for Active Days */}
                  {on && <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Button */}
      <div className="shrink-0 border-t border-white/10 bg-white/[0.04] px-6 pb-10 pt-5 backdrop-blur-3xl">
        <CustomButton variant="gradient" onClick={onContinue} disabled={saving || loading} className="shadow-xl shadow-indigo-500/20">
          {saving ? 'Saving Schedule...' : 'Save & Continue'}
        </CustomButton>
      </div>

      {/* Modern Time Modal */}
      {timeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-md">
          <div className="w-full max-w-xs overflow-hidden rounded-[2.5rem] border border-white/20 bg-slate-950 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-b from-indigo-500/20 to-transparent p-6 pb-2 text-center">
                <div className="inline-flex p-3 rounded-2xl bg-indigo-500/20 mb-3">
                    <FaCalendarAlt className="text-indigo-400 text-xl" />
                </div>
                <h2 className="text-xl font-bold text-white capitalize">{timeModal.key}</h2>
                <p className="text-xs text-white/40 mt-1">Adjust your working hours</p>
            </div>
            
            <div className="p-6 pt-4 space-y-5">
              <div className="space-y-4">
                <div className="relative group">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400 mb-2 block ml-1">Starts At</label>
                  <input
                    type="time"
                    value={timeModal.open}
                    onChange={(e) => setTimeModal((m) => (m ? { ...m, open: e.target.value } : m))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-lg font-medium text-white focus:border-indigo-500/50 outline-none transition-all"
                  />
                </div>
                <div className="relative group">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-pink-400 mb-2 block ml-1">Ends At</label>
                  <input
                    type="time"
                    value={timeModal.close}
                    onChange={(e) => setTimeModal((m) => (m ? { ...m, close: e.target.value } : m))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-lg font-medium text-white focus:border-pink-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <CustomButton
                  variant="gradient"
                  onClick={() => {
                    patchDay(timeModal.key, { open: timeModal.open, close: timeModal.close });
                    setTimeModal(null);
                  }}
                >
                  Apply Changes
                </CustomButton>
                <button 
                  onClick={() => setTimeModal(null)}
                  className="text-sm font-medium text-white/40 hover:text-white transition py-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </GlassShell>
  );
}