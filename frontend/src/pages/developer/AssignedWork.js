import React, { useEffect, useState } from 'react';
import { getAssignedProposals, updateAssignmentStatus } from '../../utils/api';
import toast from 'react-hot-toast';

const statusColors = {
  assigned: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  blocked: 'bg-red-100 text-red-700',
};

export default function AssignedWork() {
  const [work, setWork] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => getAssignedProposals().then(r => setWork(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const updateStatus = async (proposalId, status) => {
    try {
      await updateAssignmentStatus(proposalId, { status });
      toast.success(`Status updated to ${status}`);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Assignments</h2>
      {work.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm text-gray-400">No assignments yet</div>
      ) : (
        <div className="space-y-4">
          {work.map(w => (
            <div key={w.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{w.project_title}</h3>
                  <p className="text-sm text-gray-500">{w.client_name_user} · {w.industry}</p>
                  <p className="text-sm text-red-500 mt-1">📅 Deadline: {w.deadline}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[w.assignment_status]}`}>
                  {w.assignment_status?.replace(/_/g, ' ')}
                </span>
              </div>

              {w.instructions && (
                <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700 mb-3">
                  <span className="font-medium">Instructions: </span>{w.instructions}
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 mb-3">
                <p className="text-xs font-medium text-gray-400 mb-1">Description</p>
                {w.description?.slice(0, 150)}{w.description?.length > 150 ? '...' : ''}
              </div>

              {w.assignment_status !== 'completed' && (
                <div className="flex gap-2 flex-wrap">
                  {w.assignment_status !== 'in_progress' && (
                    <button onClick={() => updateStatus(w.id, 'in_progress')}
                      className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
                      Start Work
                    </button>
                  )}
                  {w.assignment_status === 'in_progress' && (
                    <button onClick={() => updateStatus(w.id, 'completed')}
                      className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">
                      Mark Complete
                    </button>
                  )}
                  <button onClick={() => updateStatus(w.id, 'blocked')}
                    className="text-xs border border-red-300 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50">
                    Mark Blocked
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
