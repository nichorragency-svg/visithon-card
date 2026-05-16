import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { apiErrorMessage } from '../../apiClient';
import { createReminder } from '../../api/visithonApi';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import GlassShell from '../components/GlassShell';

const TYPES = ['Follow Up', 'Meeting', 'Personal', 'Other'];

export default function AddReminder() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('Follow Up');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const onSave = async () => {
    setError('');
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!date) {
      setError('Date is required.');
      return;
    }
    if (!time) {
      setError('Time is required.');
      return;
    }
    setSaving(true);
    try {
      await createReminder({
        title: title.trim(),
        date,
        time,
        type,
        note: note.trim(),
      });
      navigate('/card/reminders');
    } catch (e) {
      setError(apiErrorMessage(e, 'Could not save reminder.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <GlassShell>
      <header className="shrink-0 flex items-center gap-3 border-b border-white/10 px-5 py-4 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => navigate('/card/reminders')}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-white/[0.07] text-white/90"
          aria-label="Back"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-xl font-bold text-white">Add Reminder</h1>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-5">
        {error && (
          <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-center text-sm text-red-100">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4 rounded-2xl border border-white/12 bg-white/[0.05] p-5 shadow-inner shadow-black/25 backdrop-blur-xl">
          <CustomInput
            label="Title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Follow up with client"
            maxLength={200}
          />
          <div>
            <label htmlFor="rem-date" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-fuchsia-100/85">
              Date
            </label>
            <input
              id="rem-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-2xl border border-white/15 bg-white/[0.07] px-4 py-3.5 text-white shadow-inner shadow-black/20 backdrop-blur-xl outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-cyan-400/25"
            />
          </div>
          <div>
            <label htmlFor="rem-time" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-fuchsia-100/85">
              Time
            </label>
            <input
              id="rem-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-2xl border border-white/15 bg-white/[0.07] px-4 py-3.5 text-white shadow-inner shadow-black/20 backdrop-blur-xl outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-cyan-400/25"
            />
          </div>
          <div>
            <label htmlFor="rem-type" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-fuchsia-100/85">
              Type
            </label>
            <div className="relative">
              <select
                id="rem-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-white/15 bg-white/[0.07] px-4 py-3.5 pr-10 text-white shadow-inner shadow-black/20 backdrop-blur-xl outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-cyan-400/25"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t} className="bg-slate-900">
                    {t}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/40">▾</span>
            </div>
          </div>
          <CustomInput
            label="Note"
            name="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Discuss project details"
            multiline
            rows={4}
            maxLength={2000}
          />
        </div>
      </div>

      <div className="shrink-0 border-t border-white/10 bg-white/[0.06] px-5 pb-8 pt-4 backdrop-blur-2xl">
        <CustomButton variant="gradient" onClick={onSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Reminder'}
        </CustomButton>
      </div>
    </GlassShell>
  );
}
