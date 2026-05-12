import React, { useEffect, useMemo, useState } from 'react';
import { FaEdit, FaTrash, FaPlus, FaPaperPlane } from 'react-icons/fa';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { ADMIN_TOKEN_KEY, getFastApiRoot } from '../constants';

const adminApiRoot = getFastApiRoot(API_BASE_URL);

const seedThemes = [
  {
    id: 'thm_01',
    name: 'Doctor Theme',
    category: 'Healthcare',
    previewUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80',
    isActive: true,
  },
  {
    id: 'thm_02',
    name: 'Luxury Real Estate',
    category: 'Business',
    previewUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80',
    isActive: false,
  },
];

function ThemeForm({ value, onChange, onSubmit, busy, submitLabel }) {
  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-white/10 bg-[#12151c] p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-xs uppercase tracking-wider text-white/45">Template Name</label>
          <input
            required
            type="text"
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            placeholder="Doctor Theme"
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-400/60"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-white/45">Category</label>
          <input
            required
            type="text"
            value={value.category}
            onChange={(e) => onChange({ ...value, category: e.target.value })}
            placeholder="Healthcare"
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-400/60"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs uppercase tracking-wider text-white/45">Preview Image URL</label>
        <input
          required
          type="url"
          value={value.previewUrl}
          onChange={(e) => onChange({ ...value, previewUrl: e.target.value })}
          placeholder="https://..."
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-400/60"
        />
      </div>
      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60 md:w-fit"
      >
        <FaPlus className="size-3.5" />
        {busy ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}

function ThemeCard({ theme, onToggle, onEdit, onDelete, onSendWizard }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#12151c] shadow-lg shadow-black/30">
      <img
        src={theme.previewUrl}
        alt={theme.name}
        className="h-40 w-full object-cover"
        onError={(e) => {
          e.currentTarget.src = 'https://placehold.co/1000x600/0f172a/94a3b8?text=Preview+Not+Available';
        }}
      />
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-white">{theme.name}</h3>
            <p className="text-sm text-white/45">{theme.category}</p>
          </div>
          <button
            type="button"
            onClick={() => onToggle(theme.id)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              theme.isActive ? 'bg-emerald-500/90' : 'bg-white/20'
            }`}
            aria-label={theme.isActive ? 'Deactivate theme' : 'Activate theme'}
            title={theme.isActive ? 'Active' : 'Inactive'}
          >
            <span
              className={`inline-block size-5 transform rounded-full bg-white transition ${
                theme.isActive ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(theme)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-white/85 hover:bg-white/10"
          >
            <FaEdit className="size-3.5" /> Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(theme.id)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-300 hover:bg-rose-500/20"
          >
            <FaTrash className="size-3.5" /> Delete
          </button>
        </div>
        <button
          type="button"
          onClick={() => onSendWizard(theme.id)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-sky-300/30 bg-sky-500/10 px-3 py-2 text-xs font-medium text-sky-200 hover:bg-sky-500/20"
        >
          <FaPaperPlane className="size-3.5" /> Send to User Wizard
        </button>
      </div>
    </article>
  );
}

export default function TemplatesThemesPage() {
  const [themes, setThemes] = useState([]);
  const [form, setForm] = useState({ name: '', category: '', previewUrl: '' });
  const [formLayoutKey, setFormLayoutKey] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [pageError, setPageError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const token = (() => {
    try {
      return localStorage.getItem(ADMIN_TOKEN_KEY) || '';
    } catch {
      return '';
    }
  })();

  const authHeaders = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token]
  );

  const title = useMemo(() => (editingId ? 'Update Theme' : 'Create Theme'), [editingId]);

  const resetForm = () => {
    setForm({ name: '', category: '', previewUrl: '' });
    setFormLayoutKey('');
    setEditingId(null);
  };

  const loadThemes = async () => {
    setLoadingList(true);
    setPageError('');
    try {
      const { data } = await axios.get(`${adminApiRoot}/admin/themes`, authHeaders);
      const items = Array.isArray(data?.items) ? data.items : [];
      setThemes(
        items.map((t) => ({
          id: t._id,
          name: t.name || '',
          category: t.category || '',
          previewUrl: t.preview_url || '',
          isActive: Boolean(t.is_active),
          sourceUrl: t.source_url || '',
          layoutKey: t.layout_key || '',
          uiTokens: t.ui_tokens || {},
        }))
      );
    } catch (err) {
      setPageError(err.response?.data?.detail || 'Could not load themes.');
      setThemes(seedThemes);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadThemes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setBusy(true);
    setPageError('');
    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      preview_url: form.previewUrl.trim(),
    };

    try {
      if (editingId) {
        await axios.patch(
          `${adminApiRoot}/admin/themes/${editingId}`,
          { ...payload, layout_key: formLayoutKey || undefined },
          authHeaders
        );
      } else {
        const fallbackKey = `theme-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const normalized = (formLayoutKey || form.name || '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') || fallbackKey;
        await axios.post(
          `${adminApiRoot}/admin/themes`,
          { ...payload, is_active: true, layout_key: normalized },
          authHeaders
        );
      }
      await loadThemes();
      resetForm();
      setStatusMsg('Theme saved successfully.');
    } catch (err) {
      setPageError(err.response?.data?.detail || 'Could not save theme.');
    } finally {
      setBusy(false);
    }
  };

  const handleToggleActive = async (id) => {
    const theme = themes.find((t) => t.id === id);
    if (!theme) return;
    try {
      await axios.patch(
        `${adminApiRoot}/admin/themes/${id}`,
        { is_active: !theme.isActive },
        authHeaders
      );
      await loadThemes();
      setStatusMsg('Theme status updated.');
    } catch (err) {
      setPageError(err.response?.data?.detail || 'Could not update active state.');
    }
  };

  const handleEdit = (theme) => {
    setEditingId(theme.id);
    setFormLayoutKey(theme.layoutKey || '');
    setForm({ name: theme.name, category: theme.category, previewUrl: theme.previewUrl });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${adminApiRoot}/admin/themes/${id}`, authHeaders);
      await loadThemes();
      if (editingId === id) resetForm();
      setStatusMsg('Theme deleted.');
    } catch (err) {
      setPageError(err.response?.data?.detail || 'Could not delete theme.');
    }
  };

  const handleSendWizard = async (id) => {
    try {
      await axios.patch(`${adminApiRoot}/admin/themes/${id}`, { is_active: true }, authHeaders);
      await loadThemes();
      setStatusMsg('Theme sent to user wizard (active).');
    } catch (err) {
      setPageError(err.response?.data?.detail || 'Could not send to wizard.');
    }
  };

  return (
    <div className="space-y-6 p-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Templates & Themes Management</h1>
        <p className="mt-1 text-sm text-white/45">
          CRUD is synced to MongoDB collection <code>visithon_themes</code>.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {loadingList ? <span className="text-xs text-white/50">Loading themes...</span> : null}
        </div>
        {pageError ? <p className="mt-3 text-sm text-rose-300">{pageError}</p> : null}
        {statusMsg ? <p className="mt-2 text-sm text-emerald-300">{statusMsg}</p> : null}
      </header>

      <div className="space-y-5">
        <ThemeForm
          value={form}
          onChange={setForm}
          onSubmit={handleSave}
          busy={busy}
          submitLabel={title}
        />
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
          {themes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              onToggle={handleToggleActive}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSendWizard={handleSendWizard}
            />
          ))}
        </section>
      </div>
    </div>
  );
}
