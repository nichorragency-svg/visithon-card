import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CardManagementPage = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Data Fetch Krna
  const fetchCards = async () => {
    try {
      const token = localStorage.getItem('visithon_admin_token');
      const res = await axios.get('/api/admin/all-cards', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCards(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Cards fetch krny m masla:", err);
    }
  };

  useEffect(() => { fetchCards(); }, []);

  // 2. Status Update Function (Approve/Reject)
  const updateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('visithon_admin_token');
      await axios.patch(`/api/admin/card-status/${id}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Card ${newStatus} ho gya!`);
      fetchCards(); // List refresh kren
    } catch (err) {
      alert("Status update nahi ho saka.");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Cards...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Card Management (Approval System)</h2>
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
            {cards.map((card) => (
              <tr key={card._id} className="border-b">
                <td className="px-4 py-2">{card.user?.name || 'N/A'}</td>
                <td className="px-4 py-2">{card.cardTitle}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-sm ${
                    card.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
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