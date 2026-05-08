import React, { useEffect, useState } from 'react';
import { getMyReports } from '../../utils/api';

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getMyReports().then(r => setReports(r.data)).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  const totalHours = reports.reduce((sum, r) => sum + (r.hours_worked || 0), 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Reports</h2>
        <div className="bg-white rounded-lg px-4 py-2 shadow-sm text-sm text-gray-600">
          Total: <span className="font-bold text-gray-800">{totalHours.toFixed(1)}h</span>
        </div>
      </div>
      {reports.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm text-gray-400">No reports submitted yet</div>
      ) : (
        <div className="space-y-4">
          {reports.map(r => (
            <div key={r.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex justify-between items-start mb-2">
                <p className="font-medium text-gray-800">{r.project_title || 'General Report'}</p>
                <div className="flex gap-2 items-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${r.is_final ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {r.is_final ? 'Final' : 'Daily'}
                  </span>
                  <span className="text-xs text-gray-400">{r.report_date}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{r.work_done}</p>
              {r.issues_faced && <p className="text-sm text-red-500">⚠️ {r.issues_faced}</p>}
              <p className="text-xs text-gray-400 mt-2">⏱ {r.hours_worked} hours</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
