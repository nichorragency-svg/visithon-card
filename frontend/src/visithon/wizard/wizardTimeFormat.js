/** 24h "HH:MM" → "9:00 AM" style for wizard Business Hours. */
export function to12Hour(hhmm) {
  if (!hhmm || typeof hhmm !== 'string' || !/^\d{2}:\d{2}$/.test(hhmm)) return '—';
  const [hs, ms] = hhmm.split(':');
  const h = parseInt(hs, 10);
  const m = parseInt(ms, 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const ap = h >= 12 ? 'PM' : 'AM';
  let hr = h % 12;
  if (hr === 0) hr = 12;
  return `${hr}:${String(m).padStart(2, '0')} ${ap}`;
}

export function formatTimeRange12(open, close) {
  if (!open || !close) return '—';
  return `${to12Hour(open)} – ${to12Hour(close)}`;
}
