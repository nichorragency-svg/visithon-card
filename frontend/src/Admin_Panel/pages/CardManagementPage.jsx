import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { ADMIN_TOKEN_KEY } from '../constants';

const CardManagementPage = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const authHeaders = useMemo(() => {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem(ADMIN_TOKEN_KEY) : '';
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchCards = async () => {
    setFetchError('');
    setLoading(true);
    try {
      const base = String(API_BASE_URL || '').replace(/\/$/, '');
      if (!base) {
        setFetchError('API base URL missing. Set REACT_APP_API_BASE_URL in env.');
        setCards([]);
        return;
      }
      const res = await axios.get(`${base}/admin/all-cards`, { headers: authHeaders });
      setCards(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Cards fetch:', err);
      setFetchError(err?.response?.data?.detail || err?.message || 'Could not load cards.');
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      const base = String(API_BASE_URL || '').replace(/\/$/, '');
      await axios.patch(
        `${base}/admin/card-status/${id}`,
        { status: newStatus },
        { headers: authHeaders },
      );
      alert(`Card ${newStatus} ho gya!`);
      fetchCards();
    } catch (err) {
      alert(err?.response?.data?.detail || 'Status update nahi ho saka.');
    }
  };

  if (loading) return <div className="p-10 text-center text-white/80">Loading cards…</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-1">Users &amp; cards</h2>
      <p className="mb-4 text-sm text-white/50">
        MongoDB <code className="text-white/70">visithon_cards</code> — approve or reject from here.
      </p>
      {fetchError ? (
        <p className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {fetchError}
        </p>
      ) : null}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">User Name</th>
              <th className="px-4 py-2 text-left">Card Title</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cards.length === 0 && !fetchError ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No card users in MongoDB yet, or list is empty.
                </td>
              </tr>
            ) : null}
            {cards.map((card) => (
              <tr key={card._id} className="border-b">
                <td className="px-4 py-2">{card.user?.name || 'N/A'}</td>
                <td className="px-4 py-2">{card.cardTitle}</td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded px-2 py-1 text-sm ${
                      card.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : card.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {card.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-center">
                  {card.status !== 'active' && (
                    <button 
                      onClick={() => updateStatus(card._id, 'active')}
                      className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600"
                    >
                      Approve
                    </button>
                  )}
                  <button 
                    onClick={() => updateStatus(card._id, 'rejected')}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CardManagementPage;