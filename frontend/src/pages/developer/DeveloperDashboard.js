import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAssignedProposals, getMyReports } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function DeveloperDashboard() {
  const { user } = useAuth();
  const [work, setWork] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    getAssignedProposals().then(r => setWork(r.data)).catch(() => {});
    getMyReports().then(r => setReports(r.data)).catch(() => {});
  }, []);

  const stats = [
    { label: 'Assigned', value: work.filter(w => w.assignment_status === 'assigned').length, color: 'bg-yellow-500' },
    { label: 'In Progress', value: work.filter(w => w.assignment_status === 'in_progress').length, color: 'bg-blue-500' },
    { label: 'Completed', value: work.filter(w => w.assignment_status === 'completed').length, color: 'bg-green-500' },
    { label: 'Reports Submitted', value: reports.length, color: 'bg-purple-500' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome, {user?.name} 👨‍💻</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm p-4">
            <div className={`w-10 h-10 ${s.color} rounded-lg mb-3`} />
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-700">Active Assignments</h3>
          <Link to="/developer/work" className="text-sm text-blue-600 hover:underline">View all</Link>
        </div>
        {work.filter(w => w.assignment_status !== 'completed').slice(0, 5).map(w => (
          <Link key={w.id} to="/developer/work"
            className="flex justify-between items-center py-3 border-b last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded">
            <div>
              <p className="text-sm font-medium text-gray-800">{w.project_title}</p>
              <p className="text-xs text-gray-400">{w.client_name_user} · Due: {w.deadline}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium
              ${w.assignment_status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {w.assignment_status?.replace(/_/g, ' ')}
            </span>
          </Link>
        ))}
        {work.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No assignments yet</p>}
      </div>
    </div>
  );
}
