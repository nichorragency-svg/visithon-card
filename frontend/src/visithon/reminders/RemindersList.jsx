import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaTrash } from 'react-icons/fa';
import { apiClient, apiErrorMessage } from '../../apiClient';
import CustomButton from '../components/CustomButton';
import GlassShell from '../components/GlassShell';

export default function RemindersList() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const { data } = await apiClient.get('/visithon/reminders');
      setItems(data.reminders || []);
    } catch (e) {
      setError(apiErrorMessage(e, 'Could not load reminders.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (id) => {
    try {
      await apiClient.delete(`/visithon/reminders/${encodeURIComponent(id)}`);
      setItems((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      setError(apiErrorMessage(e, 'Could not delete.'));
    }
  };

  return (
    <GlassShell>
      <header className="shrink-0 flex items-center justify-between border-b border-white/10 px-5 py-4 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/12 bg-white/[0.07] text-white/90 transition hover:bg-white/[0.11]"
          aria-label="Back"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-lg font-bold text-white">Reminders</h1>
        <button
          type="button"
          onClick={() => navigate('/card/reminders/add')}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-400/35 bg-sky-500/15 text-sky-200 transition hover:bg-sky-500/25"
          aria-label="Add"
        >
          <FaPlus />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-4">
        {loading ? (
          <p className="py-16 text-center text-sm text-white/45">Loading…</p>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-center text-sm text-red-100">
                {error}
              </div>
            )}
            {items.length === 0 ? (
              <div className="rounded-2xl border border-white/12 bg-white/[0.06] px-5 py-12 text-center backdrop-blur-xl">
                <p className="text-sm text-white/55">No reminders yet.</p>
                <CustomButton variant="gradient" className="mt-6" onClick={() => navigate('/card/reminders/add')}>
                  Add reminder
                </CustomButton>
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {items.map((r) => (
                  <li
                    key={r.id}
                    className="flex gap-3 rounded-2xl border border-white/12 bg-white/[0.07] px-4 py-3.5 shadow-inner shadow-black/20 backdrop-blur-xl"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white">{r.title}</p>
                      <p className="mt-1 text-xs text-white/50">
                        {r.date} · {r.time} · <span className="text-sky-200/80">{r.type}</span>
                      </p>
                      {r.note ? <p className="mt-2 text-sm text-white/65 line-clamp-3">{r.note}</p> : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(r.id)}
                      className="shrink-0 self-start rounded-xl border border-white/10 bg-white/[0.06] p-2.5 text-rose-300 transition hover:bg-rose-500/15"
                      aria-label="Delete"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </GlassShell>
  );
}
