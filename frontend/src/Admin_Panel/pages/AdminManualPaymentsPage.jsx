import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { getFastApiRoot } from '../constants';
import { adminAuthHeaders } from '../utils/adminHeaders';
import PaymentsTransactionsTable, {
  formatAmount,
  formatDate,
  StatusBadge,
} from '../components/PaymentsTransactionsTable';

function proofUrl(path) {
  if (!path) return '';
  const s = String(path).trim();
  if (/^https?:\/\//i.test(s)) return s;
  const root = getFastApiRoot(API_BASE_URL);
  if (!root) return '';
  return `${root}/static/${s.replace(/^\//, '')}`;
}

export default function AdminManualPaymentsPage() {
  const [filter, setFilter] = useState('pending');
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAll, setLoadingAll] = useState(true);
  const [err, setErr] = useState('');
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const transactionsRef = useRef(null);

  const base = getFastApiRoot(API_BASE_URL);

  const loadPending = useCallback(async () => {
    setErr('');
    setLoading(true);
    try {
      const { data } = await axios.get(`${base}/admin/manual-payment-requests`, {
        params: filter ? { status: filter } : {},
        headers: adminAuthHeaders(),
      });
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (e) {
      setErr(e?.response?.data?.detail || e?.message || 'Load failed');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [base, filter]);

  const loadAll = useCallback(async () => {
    setLoadingAll(true);
    try {
      const { data } = await axios.get(`${base}/admin/manual-payment-requests`, {
        headers: adminAuthHeaders(),
      });
      setAllItems(Array.isArray(data?.items) ? data.items : []);
    } catch {
      setAllItems([]);
    } finally {
      setLoadingAll(false);
    }
  }, [base]);

  useEffect(() => {
    void loadPending();
  }, [loadPending]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const refresh = () => {
    void loadPending();
    void loadAll();
  };

  const expandTransactions = () => {
    setShowAllTransactions(true);
    window.setTimeout(() => {
      transactionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const resolve = async (id, status) => {
    const note = window.prompt('Admin note (optional):', '') ?? '';
    try {
      await axios.patch(
        `${base}/admin/manual-payment-requests/${id}`,
        { status, admin_note: note },
        { headers: { ...adminAuthHeaders(), 'Content-Type': 'application/json' } },
      );
      refresh();
    } catch (e) {
      window.alert(e?.response?.data?.detail || e?.message || 'Update failed');
    }
  };

  if (!base) {
    return (
      <div className="p-4 text-sm text-amber-200 sm:p-8">
        Set REACT_APP_API_BASE_URL to your API root.
      </div>
    );
  }

  return (
    <div className="min-w-0 w-full max-w-full space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">Payments</h1>
        <p className="mt-1 text-sm text-white/45">Transactions overview and manual payment approvals</p>
      </div>

      <div ref={transactionsRef}>
        <PaymentsTransactionsTable
          rows={allItems}
          loading={loadingAll}
          previewLimit={6}
          showAll={showAllTransactions}
          onViewAll={expandTransactions}
          onViewAllFooter={expandTransactions}
        />
      </div>

      <section
        className="rounded-2xl border border-white/[0.08] bg-[#0f1219] shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
      >
        <div className="flex flex-col gap-3 border-b border-white/[0.06] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/90 sm:text-xs">
              Manage requests
            </h2>
            <p className="mt-0.5 text-xs text-white/40">Approve or reject bank transfer proofs</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['pending', 'approved', 'rejected', ''].map((f) => (
              <button
                key={f || 'all'}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize ${
                  filter === f ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/15'
                }`}
              >
                {f || 'all'}
              </button>
            ))}
          </div>
        </div>

        {err ? (
          <div className="mx-4 mt-4 rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm sm:mx-5">
            {err}
          </div>
        ) : null}

        {loading ? (
          <div className="py-12 text-center text-sm text-white/50">Loading…</div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-sm text-white/40">No requests for this filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-[10px] font-semibold uppercase tracking-wider text-white/40">
                  <th className="px-4 py-3 sm:px-5">User</th>
                  <th className="px-3 py-3">Plan</th>
                  <th className="px-3 py-3">Amount</th>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Proof</th>
                  <th className="px-3 py-3 text-right">Status</th>
                  <th className="px-4 py-3 sm:px-5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-4 py-3.5 sm:px-5">
                      <div className="font-medium text-white/92">{row.payer_name || '—'}</div>
                      <div className="text-xs text-white/45">{row.payer_email}</div>
                    </td>
                    <td className="px-3 py-3.5 text-white/65">{row.plan_label || '—'}</td>
                    <td className="px-3 py-3.5 text-white/80">
                      {formatAmount(row.amount, row.currency)}
                    </td>
                    <td className="px-3 py-3.5 text-white/55">{formatDate(row.created_at)}</td>
                    <td className="px-3 py-3.5">
                      {row.proof_static_path ? (
                        <a
                          href={proofUrl(row.proof_static_path)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-300 underline"
                        >
                          View
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-3 py-3.5 text-right">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3.5 sm:px-5">
                      {row.status === 'pending' ? (
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-500"
                            onClick={() => void resolve(row.id, 'approved')}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-rose-500"
                            onClick={() => void resolve(row.id, 'rejected')}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-white/40">{row.admin_note || '—'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
}
