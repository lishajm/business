import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyProposals, getMyMeetings } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  quoted: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  assigned: 'bg-purple-100 text-purple-800',
  completed: 'bg-gray-100 text-gray-800',
  rejected: 'bg-red-100 text-red-800',
  negotiation_requested: 'bg-orange-100 text-orange-800',
  standard_selected: 'bg-indigo-100 text-indigo-800',
};

export default function ClientDashboard() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    getMyProposals().then(r => setProposals(r.data)).catch(() => {});
    getMyMeetings().then(r => setMeetings(r.data)).catch(() => {});
  }, []);

  const stats = [
    { label: 'Total Proposals', value: proposals.length, color: 'bg-blue-500' },
    { label: 'Pending Review', value: proposals.filter(p => p.status === 'pending').length, color: 'bg-yellow-500' },
    { label: 'In Progress', value: proposals.filter(p => p.status === 'assigned').length, color: 'bg-purple-500' },
    { label: 'Completed', value: proposals.filter(p => p.status === 'completed').length, color: 'bg-green-500' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome, {user?.name} 👋</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm p-4">
            <div className={`w-10 h-10 ${s.color} rounded-lg mb-3`} />
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">Recent Proposals</h3>
            <Link to="/client/proposals/new" className="text-sm text-blue-600 hover:underline">+ New</Link>
          </div>
          {proposals.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No proposals yet</p>
          ) : proposals.slice(0, 5).map(p => (
            <Link to={`/client/proposals/${p.id}`} key={p.id}
              className="flex justify-between items-center py-3 border-b last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded">
              <div>
                <p className="text-sm font-medium text-gray-800">{p.project_title}</p>
                <p className="text-xs text-gray-400">{p.business_name}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[p.status] || 'bg-gray-100 text-gray-600'}`}>
                {p.status}
              </span>
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">Upcoming Meetings</h3>
            <Link to="/client/meetings" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          {meetings.filter(m => m.status !== 'cancelled' && m.status !== 'rejected').slice(0, 4).map(m => (
            <div key={m.id} className="py-3 border-b last:border-0">
              <p className="text-sm font-medium text-gray-800">{m.project_title}</p>
              <p className="text-xs text-gray-500">{m.admin_date || m.preferred_date} at {m.admin_time || m.preferred_time}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[m.status] || 'bg-gray-100 text-gray-600'}`}>
                {m.status}
              </span>
            </div>
          ))}
          {meetings.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No meetings scheduled</p>}
        </div>
      </div>
    </div>
  );
}
