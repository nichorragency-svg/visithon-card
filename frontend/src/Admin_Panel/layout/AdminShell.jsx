import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import AdminSidebar from './AdminSidebar';

export default function AdminShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!sidebarOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  return (
    <div className="flex min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-[#080a0f] text-white">
      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] md:hidden"
          aria-label="Close navigation menu"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <AdminSidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-screen min-w-0 w-full max-w-full flex-1 flex-col">
        <header className="sticky top-0 z-30 flex shrink-0 items-center gap-3 border-b border-white/[0.06] bg-[#080a0f]/95 px-4 py-3 backdrop-blur-md md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-white/90 transition hover:bg-white/[0.1]"
            aria-label="Open navigation menu"
          >
            <FaBars className="size-[18px]" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold uppercase tracking-[0.14em] text-white">Visithon Admin</p>
            <p className="truncate text-[11px] text-white/45">Dashboard</p>
          </div>
        </header>

        <main className="min-h-0 min-w-0 w-full max-w-full flex-1 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}


