import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaChevronRight,
  FaHeartbeat,
  FaNotesMedical,
  FaProcedures,
  FaStethoscope,
  FaUserMd,
} from 'react-icons/fa';
import { apiErrorMessage } from '../../apiClient';
import { getWizardState, normalizeStep4Items, patchStep4 } from '../../supabase/supabaseWizard';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import GlassShell from '../components/GlassShell';

const SERVICE_ICONS = [FaHeartbeat, FaStethoscope, FaNotesMedical, FaUserMd, FaProcedures];

function newServiceId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `svc_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export default function WizardStep4() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);

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
        const raw = data.profile?.step4?.items;
        setItems(normalizeStep4Items(raw));
      } catch (e) {
        if (!cancelled) setError(apiErrorMessage(e, 'Could not load services.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const iconForIndex = useMemo(() => (i) => SERVICE_ICONS[i % SERVICE_ICONS.length], []);

  const openAdd = () => {
    setError('');
    setModal({ mode: 'add', id: newServiceId(), name: '' });
  };

  const openEdit = (row) => {
    setError('');
    setModal({ mode: 'edit', id: row.id, name: row.name });
  };

  const closeModal = () => {
    setError('');
    setModal(null);
  }

  const saveModal = () => {
    if (!modal) return;
    const name = modal.name.trim();
    if (!name) {
      setError('Service name is required.');
      return;
    }
    setError('');
    if (modal.mode === 'add') {
      setItems((prev) => [...prev, { id: modal.id, name }]);
    } else {
      setItems((prev) => prev.map((x) => (x.id === modal.id ? { ...x, name } : x)));
    }
    closeModal();
  };

  const removeCurrent = () => {
    if (!modal || modal.mode !== 'edit') return;
    setItems((prev) => prev.filter((x) => x.id !== modal.id));
    closeModal();
  };

  const onContinue = async () => {
    setError('');
    setSaving(true);
    try {
      await patchStep4({ items });
      navigate('/card/wizard/step-5');
    } catch (e) {
      setError(apiErrorMessage(e, 'Could not save services.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <GlassShell>
      <div className="shrink-0 px-5 pt-4 pb-3">
        <h1 className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-left text-2xl font-bold tracking-tight text-transparent">
          Services / Products
        </h1>
        <p className="mt-1 text-xs text-white/45">
          Add what you offer. You can edit this later from your card.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
        {loading ? (
          <div className="flex flex-col items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-sky-400 mb-2"></div>
            <p className="text-sm text-white/50">Loading services...</p>
          </div>
        ) : (
          <>
            {error && !modal && (
              <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-center text-sm text-red-100 backdrop-blur-xl">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              {items.map((row, idx) => {
                const Icon = iconForIndex(idx);
                const key = row.id || `svc-fallback-${idx}`;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => openEdit(row)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-left shadow-lg backdrop-blur-xl transition hover:border-sky-400/25 hover:bg-white/[0.09]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-400/35 bg-sky-500/15 text-sky-300">
                      <Icon className="text-lg" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1 font-medium text-white">{row.name || 'Service'}</span>
                    <FaChevronRight className="shrink-0 text-white/35" aria-hidden />
                  </button>
                );
              })}

              <button
                type="button"
                onClick={openAdd}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/[0.03] py-3.5 text-sm font-medium text-sky-200/90 backdrop-blur-md transition hover:border-sky-400/40 hover:bg-white/[0.06]"
              >
                + Add New Service
              </button>
            </div>
          </>
        )}
      </div>

      <div className="shrink-0 border-t border-white/10 bg-white/[0.06] px-5 pb-8 pt-4 shadow-[0_-12px_40px_rgba(0,0,0,0.25)] backdrop-blur-2xl">
        <CustomButton variant="gradient" onClick={onContinue} disabled={saving || loading}>
          {saving ? 'Saving…' : 'Continue'} <span aria-hidden>→</span>
        </CustomButton>
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-3xl border border-white/12 bg-slate-950/95 p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-white mb-1">
              {modal.mode === 'add' ? 'New Service' : 'Edit Service'}
            </h2>
            <p className="text-xs text-white/40 mb-4">Define what this service is called.</p>
            
            {error && modal && (
              <div className="mb-4 rounded-xl bg-red-500/10 p-2 text-xs text-red-200 border border-red-500/20">
                {error}
              </div>
            )}
            
            <CustomInput
              label="Service Name"
              name="svcName"
              value={modal.name ?? ''}
              onChange={(e) => setModal((m) => (m ? { ...m, name: e.target.value } : m))}
              placeholder="e.g. Consultation"
              maxLength={200}
            />

            <div className="mt-6 flex flex-col gap-2">
              <CustomButton variant="gradient" onClick={saveModal}>
                Save Changes
              </CustomButton>
              {modal.mode === 'edit' && (
                <button 
                  onClick={removeCurrent}
                  className="py-2 text-sm font-medium text-red-400/80 hover:text-red-400 transition"
                >
                  Remove Service
                </button>
              )}
              <CustomButton variant="glass" onClick={closeModal}>
                Cancel
              </CustomButton>
            </div>
          </div>
        </div>
      )}
    </GlassShell>
  );
}