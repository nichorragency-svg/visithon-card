import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FaHome,
  FaUsers,
  FaCreditCard,
  FaDollarSign,
  FaChartBar,
  FaBullseye,
  FaFileAlt,
  FaQrcode,
  FaBell,
  FaBox,
  FaHeadset,
  FaCog,
  FaSignOutAlt,
  FaChevronRight,
  FaChartLine,
  FaTimes,
} from 'react-icons/fa';
import { API_BASE_URL } from '../../config';
import { ADMIN_TOKEN_KEY, getFastApiRoot } from '../constants';

const navItems = [
  { to: '/admin', end: true, label: 'Dashboard', icon: FaHome },
  { to: '/admin/users', label: 'Users', icon: FaUsers },
  { to: '/admin/cards', label: 'Cards', icon: FaCreditCard },
  { to: '/admin/payments', label: 'Payments', icon: FaDollarSign },
  { to: '/admin/analytics', label: 'Analytics', icon: FaChartBar },
  { to: '/admin/leads', label: 'Leads', icon: FaBullseye },
  { to: '/admin/templates', label: 'Templates & Themes', icon: FaFileAlt },
  { to: '/admin/qr-scan', label: 'QR & Scan', icon: FaQrcode },
  { to: '/admin/reminders', label: 'Reminders', icon: FaBell },
  { to: '/admin/packages', label: 'Packages', icon: FaBox },
  { to: '/admin/support', label: 'Support Tickets', icon: FaHeadset },
  { to: '/admin/settings', label: 'Payment settings', icon: FaCog },
];

function VisithonLogo() {
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none" aria-hidden className="shrink-0">
      <path d="M20 4L34 28H6L20 4Z" fill="url(#vg)" opacity="0.95" />
      <path d="M20 12L29 26H11L20 12Z" fill="url(#vg2)" />
      <defs>
        <linearGradient id="vg" x1="6" y1="28" x2="34" y2="4" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="vg2" x1="11" y1="26" x2="29" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a78bfa" />
          <stop offset="1" stopColor="#5b21b6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function AdminSidebar({ mobileOpen = false, onClose }) {
  const navigate = useNavigate();

  const closeMobile = () => {
    onClose?.();
  };
  const [profile, setProfile] = useState({ email: '', name: '' });

  useEffect(() => {
    let cancelled = false;
    const token = (() => {
      try {
        return localStorage.getItem(ADMIN_TOKEN_KEY);
      } catch {
        return null;
      }
    })();
    if (!token?.trim()) return undefined;
    axios
      .get(`${getFastApiRoot(API_BASE_URL)}/admin/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (cancelled) return;
        const email = res.data?.email || '';
        const bit = email.split('@')[0] || 'Admin';
        const name = bit.replace(/\./g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        setProfile({ email, name: name || 'Admin' });
      })
      .catch(() => {
        if (!cancelled) setProfile({ email: '', name: 'Admin' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const initials = profile.name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || 'A';

  const signOut = () => {
    try {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    } catch {
      /* noop */
    }
    navigate('/admin/login', { replace: true });
  };

  const itemClass =
    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors';

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex h-full w-[min(270px,88vw)] max-w-[88vw] flex-col border-r border-white/[0.06] bg-[#0c0e14] px-4 pb-5 pt-6 shadow-2xl shadow-black/50 transition-transform duration-200 ease-out md:static md:z-auto md:h-auto md:w-[270px] md:max-w-none md:shrink-0 md:translate-x-0 md:shadow-none ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-1">
        <VisithonLogo />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-bold uppercase tracking-[0.12em] text-white">VISITHON CARD</div>
          <div className="text-xs text-white/45">Admin Dashboard</div>
        </div>
        <button
          type="button"
          onClick={closeMobile}
          className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white/70 transition hover:bg-white/[0.08] md:hidden"
          aria-label="Close menu"
        >
          <FaTimes className="size-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="mt-8 flex flex-1 flex-col gap-1 overflow-y-auto pb-6">
        {navItems.map(({ to, end, label, icon: Icon }) => (
          <NavLink
            key={to + label}
            to={to}
            end={end}
            onClick={closeMobile}
            className={({ isActive }) =>
              `${itemClass} ${
                isActive ? 'bg-[#5D5FEF] text-white shadow-[0_4px_20px_-4px_rgba(93,95,239,0.55)]' : 'text-white/72 hover:bg-white/[0.05] hover:text-white'
              }`
            }
          >
            <Icon className="size-[18px] shrink-0 opacity-90" />
            <span className="flex-1 truncate text-left">{label}</span>
            <FaChevronRight className="size-3 shrink-0 text-white/35" aria-hidden />
          </NavLink>
        ))}

        <button
          type="button"
          onClick={signOut}
          className={`${itemClass} mt-1 text-white/72 hover:bg-rose-500/15 hover:text-rose-200`}
        >
          <FaSignOutAlt className="size-[18px] shrink-0" />
          <span className="flex-1 text-left">Logout</span>
        </button>
      </nav>

      {/* Profile + Quick actions */}
      <div className="rounded-xl border border-white/[0.08] bg-[#12162a]/90 p-4 shadow-inner shadow-black/20">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-white">{profile.name}</div>
            <div className="text-[11px] text-white/40">Super Admin</div>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
              <span className="text-[11px] font-medium text-emerald-400/95">Online</span>
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-white/[0.06] pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/38">Quick Actions</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { navigate('/admin/create-card-user'); closeMobile(); } }
              className="rounded-lg border border-white/10 bg-[#0c0e14]/80 px-2 py-2 text-left text-[10px] font-medium leading-tight text-white/85 hover:bg-white/[0.06]"
            >
              <span className="text-violet-300">+ </span>Create New Card
            </button>
            <button
              type="button"
              onClick={() => { navigate('/admin/create-card-user'); closeMobile(); } }
              className="rounded-lg border border-white/10 bg-[#0c0e14]/80 px-2 py-2 text-left text-[10px] font-medium leading-tight text-white/85 hover:bg-white/[0.06]"
            >
              <span className="text-violet-300">+ </span>Add New User
            </button>
            <button
              type="button"
              onClick={() => { navigate('/admin/qr-scan'); closeMobile(); } }
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0c0e14]/80 px-2 py-2 text-left text-[10px] font-medium text-white/85 hover:bg-white/[0.06]"
            >
              <FaQrcode className="size-3 shrink-0 text-violet-300" aria-hidden /> Generate QR
            </button>
            <button
              type="button"
              onClick={() => { navigate('/admin/analytics'); closeMobile(); } }
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0c0e14]/80 px-2 py-2 text-left text-[10px] font-medium text-white/85 hover:bg-white/[0.06]"
            >
              <FaChartLine className="size-3 shrink-0 text-violet-300" aria-hidden /> Analytics
            </button>
            <button
              type="button"
              onClick={() => { navigate('/admin/templates'); closeMobile(); } }
              className="col-span-2 rounded-lg border border-indigo-300/25 bg-indigo-500/10 px-2 py-2 text-left text-[10px] font-medium text-indigo-200 hover:bg-indigo-500/20"
            >
              Open Templates & Themes
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
