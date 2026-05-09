import React from 'react';

export default function AdminSection({ title, subtitle = 'This section is coming soon.' }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
      <p className="mt-2 max-w-xl text-sm text-white/45">{subtitle}</p>
    </div>
  );
}
