import React from 'react';
import { FaArrowRight } from 'react-icons/fa';

function formatAmount(amount, currency = 'PKR') {
  const raw = String(amount ?? '').replace(/,/g, '').trim();
  const num = Number(raw);
  const cur = String(currency || 'PKR').trim() || 'PKR';
  if (!Number.isFinite(num)) return `${cur} ${raw || '—'}`;
  return `${cur} ${num.toLocaleString('en-PK')}`;
}

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function statusLabel(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'approved') return 'Paid';
  if (s === 'pending') return 'Pending';
  if (s === 'rejected') return 'Rejected';
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '—';
}

function StatusBadge({ status }) {
  const s = String(status || '').toLowerCase();
  const label = statusLabel(status);
  const paid = s === 'approved';
  const pending = s === 'pending';
  const rejected = s === 'rejected';

  return (
    <span
      className={`inline-flex min-w-[4.5rem] items-center justify-center rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wide ${
        paid
          ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25'
          : pending
            ? 'bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/25'
            : rejected
              ? 'bg-amber-500/12 text-amber-300/90 ring-1 ring-amber-500/20'
              : 'bg-white/8 text-white/55 ring-1 ring-white/10'
      }`}
    >
      {label}
    </span>
  );
}

export default function PaymentsTransactionsTable({
  rows = [],
  loading = false,
  previewLimit = 6,
  showAll = false,
  onViewAll,
  onViewAllFooter,
  compact = false,
}) {
  const visible = showAll ? rows : rows.slice(0, previewLimit);
  const hasMore = !showAll && rows.length > previewLimit;

  return (
    <section
      className={`rounded-2xl border border-white/[0.08] bg-[#0f1219] shadow-[0_12px_40px_rgba(0,0,0,0.35)] ${
        compact ? '' : 'overflow-hidden'
      }`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-4 sm:px-5">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/90 sm:text-xs">
          Payments &amp; Transactions
        </h2>
        {hasMore && onViewAll ? (
          <button
            type="button"
            onClick={onViewAll}
            className="shrink-0 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[11px] font-medium text-white/75 transition hover:bg-white/[0.1] hover:text-white"
          >
            View All
          </button>
        ) : null}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[640px] w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-[10px] font-semibold uppercase tracking-wider text-white/40">
              <th className="px-4 py-3 sm:px-5">User</th>
              <th className="px-3 py-3">Plan</th>
              <th className="px-3 py-3">Amount</th>
              <th className="px-3 py-3">Date</th>
              <th className="px-4 py-3 text-right sm:px-5">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-white/45">
                  Loading transactions…
                </td>
              </tr>
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-white/40">
                  No transactions yet.
                </td>
              </tr>
            ) : (
              visible.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-white/[0.04] transition hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3.5 font-medium text-white/92 sm:px-5">
                    {row.payer_name || row.payer_email || '—'}
                  </td>
                  <td className="px-3 py-3.5 text-white/65">{row.plan_label || '—'}</td>
                  <td className="px-3 py-3.5 text-white/80">
                    {formatAmount(row.amount, row.currency)}
                  </td>
                  <td className="px-3 py-3.5 text-white/55">{formatDate(row.created_at)}</td>
                  <td className="px-4 py-3.5 text-right sm:px-5">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {hasMore && onViewAllFooter ? (
        <div className="border-t border-white/[0.06] p-3 sm:p-4">
          <button
            type="button"
            onClick={onViewAllFooter}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] py-3 text-sm font-medium text-white/80 transition hover:border-white/15 hover:bg-white/[0.07] hover:text-white"
          >
            View All Transactions
            <FaArrowRight className="size-3 opacity-70" aria-hidden />
          </button>
        </div>
      ) : null}
    </section>
  );
}

export { formatAmount, formatDate, statusLabel, StatusBadge };
