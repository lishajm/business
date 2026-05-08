import React, { useEffect, useState } from 'react';
import { getLogs } from '../../utils/api';

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getLogs().then(r => setLogs(r.data)).finally(() => setLoading(false)); }, []);

  const roleColors = { admin: 'bg-red-100 text-red-700', developer: 'bg-blue-100 text-blue-700', client: 'bg-green-100 text-green-700' };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Activity Logs</h2>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['User', 'Role', 'Login', 'Logout', 'Duration'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.map(l => (
              <tr key={l.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{l.name}</p>
                  <p className="text-xs text-gray-400">{l.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[l.role]}`}>{l.role}</span>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">
                  {new Date(l.login_time).toLocaleString('en-IN')}
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">
                  {l.logout_time ? new Date(l.logout_time).toLocaleString('en-IN') : <span className="text-green-500">Active</span>}
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">
                  {l.work_duration ? `${parseFloat(l.work_duration).toFixed(2)}h` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
