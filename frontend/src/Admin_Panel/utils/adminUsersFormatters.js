import { staticUrl } from '../../visithon/utils/staticUrl';

export function avatarSrc(path) {
  if (!path) return '';
  const s = String(path).trim();
  if (/^https?:\/\//i.test(s)) return s;
  return staticUrl(s);
}

export function formatJoined(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso).slice(0, 10);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatPhone(raw) {
  const d = String(raw || '').replace(/\D/g, '');
  if (!d) return '—';
  if (d.startsWith('92') && d.length >= 11) {
    const rest = d.slice(2);
    return `+92 ${rest.slice(0, 3)} ${rest.slice(3)}`.trim();
  }
  if (d.startsWith('0') && d.length >= 10) return `+92 ${d.slice(1, 4)} ${d.slice(4)}`;
  return raw;
}

export function statusBadgeClass(st) {
  const s = String(st || '').toLowerCase();
  if (s === 'active') return 'bg-emerald-500/25 text-emerald-300 ring-1 ring-emerald-500/40';
  if (s === 'rejected') return 'bg-rose-500/20 text-rose-200 ring-1 ring-rose-500/35';
  return 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-500/40';
}
