import React from 'react';
import { useNavigate } from 'react-router-dom';

const cards = [
  { id: 'users', label: 'Users', note: 'Manage Visithon card users' },
  { id: 'plans', label: 'Plans', note: 'Pricing & packages' },
  { id: 'orders', label: 'Orders', note: 'Orders & subscriptions' },
  { id: 'themes', label: 'Templates & Themes', note: 'Manage all theme layouts' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-white/45">Overview · use the sidebar to open each area</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-white/[0.08] bg-[#12151c] p-5 shadow-lg shadow-black/30"
          >
            <h2 className="text-base font-medium text-white">{item.label}</h2>
            <p className="mt-2 text-sm text-white/40">{item.note}</p>
          </div>
        ))}
      </section>
      <button
        type="button"
        onClick={() => navigate('/admin/templates')}
        className="mt-6 rounded-lg border border-indigo-400/40 bg-indigo-500/15 px-4 py-2 text-sm font-medium text-indigo-200 hover:bg-indigo-500/25"
      >
        Open Templates & Themes
      </button>
    </div>
  );
}
