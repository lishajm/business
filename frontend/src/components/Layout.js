import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout as apiLogout } from '../utils/api';
import toast from 'react-hot-toast';

const navMap = {
  client: [
    { path: '/client', label: '🏠 Dashboard' },
    { path: '/client/proposals/new', label: '📝 New Proposal' },
    { path: '/client/proposals', label: '📋 My Proposals' },
    { path: '/client/meetings', label: '📅 My Meetings' },
  ],
  admin: [
    { path: '/admin', label: '🏠 Dashboard' },
    { path: '/admin/proposals', label: '📋 All Proposals' },
    { path: '/admin/meetings', label: '📅 Meetings' },
    { path: '/admin/users', label: '👥 Users' },
    { path: '/admin/reports', label: '📊 Reports' },
    { path: '/admin/logs', label: '🔐 Activity Logs' },
  ],
  developer: [
    { path: '/developer', label: '🏠 Dashboard' },
    { path: '/developer/work', label: '💼 My Work' },
    { path: '/developer/reports', label: '📝 Submit Report' },
    { path: '/developer/my-reports', label: '📊 My Reports' },
  ],
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sideOpen, setSideOpen] = useState(false);

  const handleLogout = async () => {
    try { await apiLogout(); } catch {}
    logout();
    navigate('/login');
    toast.success('Logged out');
  };

  const links = navMap[user?.role] || [];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1e3a5f] text-white transform transition-transform duration-200
        ${sideOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:flex md:flex-col`}>
        <div className="p-4 border-b border-blue-800">
          <h1 className="text-xl font-bold">BPQG</h1>
          <p className="text-xs text-blue-300 mt-1">Business Proposal Generator</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map(l => (
            <Link key={l.path} to={l.path}
              onClick={() => setSideOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm transition-colors
                ${location.pathname === l.path ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-800'}`}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-blue-800">
          <p className="text-xs text-blue-300">{user?.name}</p>
          <p className="text-xs text-blue-400 capitalize">{user?.role}</p>
          <button onClick={handleLogout}
            className="mt-2 w-full text-sm bg-red-600 hover:bg-red-700 text-white py-1.5 rounded-lg">
            Logout
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sideOpen && <div className="fixed inset-0 z-40 bg-black opacity-50 md:hidden" onClick={() => setSideOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between md:hidden">
          <button onClick={() => setSideOpen(true)} className="text-gray-600 text-xl">☰</button>
          <span className="font-bold text-[#1e3a5f]">BPQG</span>
          <span className="text-sm text-gray-500 capitalize">{user?.role}</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
