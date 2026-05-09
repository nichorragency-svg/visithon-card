import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

export default function AdminShell() {
  return (
    <div className="flex min-h-screen w-full bg-[#080a0f] text-white">
      <AdminSidebar />
      <div className="min-h-screen min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
