import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getAllProposals,
  getAllMeetings,
  getAllUsers,
  getPendingClients,
  approveClient
} from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [proposals, setProposals] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [users, setUsers] = useState([]);
  const [pendingClients, setPendingClients] = useState([]);

  const loadData = () => {
    getAllProposals().then(r => setProposals(r.data)).catch(() => {});
    getAllMeetings().then(r => setMeetings(r.data)).catch(() => {});
    getAllUsers().then(r => setUsers(r.data)).catch(() => {});
    getPendingClients().then(r => setPendingClients(r.data)).catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  // ✅ Approve handler
  const handleApprove = async (id) => {
    try {
      await approveClient(id);
      toast.success('Client approved');
      loadData(); // refresh
    } catch {
      toast.error('Failed to approve');
    }
  };

  const pending = proposals.filter(p => p.status === 'pending').length;
  const pendingMeetings = meetings.filter(m => m.status === 'pending').length;
  const activeDevs = users.filter(u => u.role === 'developer' && u.is_active).length;
  const completed = proposals.filter(p => p.status === 'completed').length;

  const stats = [
    { label: 'Pending Proposals', value: pending, color: 'bg-yellow-500', link: '/admin/proposals' },
    { label: 'Pending Meetings', value: pendingMeetings, color: 'bg-blue-500', link: '/admin/meetings' },
    { label: 'Active Developers', value: activeDevs, color: 'bg-green-500', link: '/admin/users' },
    { label: 'Completed Projects', value: completed, color: 'bg-gray-500', link: '/admin/proposals' },
  ];

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    quoted: 'bg-blue-100 text-blue-700',
    accepted: 'bg-green-100 text-green-700',
    assigned: 'bg-purple-100 text-purple-700',
    completed: 'bg-gray-200 text-gray-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <Link key={s.label} to={s.link} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md">
            <div className={`w-10 h-10 ${s.color} rounded-lg mb-3`} />
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* 🔥 NEW: Pending Clients */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="font-semibold text-gray-700 mb-4">Pending Client Approvals</h3>

        {pendingClients.length === 0 ? (
          <p className="text-gray-400 text-sm">No pending clients</p>
        ) : (
          pendingClients.map(c => (
            <div key={c.id} className="flex justify-between items-center border-b py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">{c.name}</p>
                <p className="text-xs text-gray-400">{c.email}</p>
              </div>
              <button
                onClick={() => handleApprove(c.id)}
                className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-700"
              >
                Approve
              </button>
            </div>
          ))
        )}
      </div>

      {/* Existing sections */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Proposals */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Recent Proposals</h3>
            <Link to="/admin/proposals" className="text-sm text-blue-600">View all</Link>
          </div>

          {proposals.slice(0, 6).map(p => (
            <Link key={p.id} to={`/admin/proposals/${p.id}`}
              className="flex justify-between py-3 border-b hover:bg-gray-50 px-2 rounded">
              <div>
                <p className="text-sm font-medium text-gray-800">{p.project_title}</p>
                <p className="text-xs text-gray-400">{p.client_user_name}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[p.status]}`}>
                {p.status}
              </span>
            </Link>
          ))}
        </div>

        {/* Meetings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Pending Meetings</h3>
            <Link to="/admin/meetings" className="text-sm text-blue-600">View all</Link>
          </div>

          {meetings.filter(m => m.status === 'pending').map(m => (
            <div key={m.id} className="flex justify-between py-3 border-b">
              <div>
                <p className="text-sm font-medium text-gray-800">{m.project_title}</p>
                <p className="text-xs text-gray-400">{m.client_name}</p>
              </div>
              <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">
                pending
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}