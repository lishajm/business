import React, { useEffect, useState } from 'react';
import { getAllReports, getDeveloperReports, getDevelopers } from '../../utils/api';

export default function DeveloperReports() {
  const [reports, setReports] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllReports().then(r => setReports(r.data)).finally(() => setLoading(false));
    getDevelopers().then(r => setDevelopers(r.data)).catch(() => {});
  }, []);

  const filtered = filter ? reports.filter(r => r.developer_id === Number(filter)) : reports;

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Developer Reports</h2>

      <div className="mb-6">
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="">All Developers</option>
          {developers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        {filtered.map(r => (
          <div key={r.id} className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-semibold text-gray-800">{r.developer_name}</p>
                <p className="text-sm text-gray-500">{r.project_title || 'General report'}</p>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${r.is_final ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {r.is_final ? 'Final' : 'Daily'}
                </span>
                <p className="text-xs text-gray-400 mt-1">{r.report_date}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 mb-2">
              <p className="font-medium text-xs text-gray-500 mb-1">Work Done</p>
              {r.work_done}
            </div>
            {r.issues_faced && (
              <div className="bg-red-50 rounded-lg p-3 text-sm text-red-700">
                <p className="font-medium text-xs text-red-500 mb-1">Issues</p>
                {r.issues_faced}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">⏱ {r.hours_worked} hours</p>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm text-gray-400">No reports found</div>
        )}
      </div>
    </div>
  );
}
