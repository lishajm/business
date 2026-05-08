import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyProposals } from '../../utils/api';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  quoted: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  assigned: 'bg-purple-100 text-purple-700',
  completed: 'bg-gray-200 text-gray-700',
  rejected: 'bg-red-100 text-red-700',
  negotiation_requested: 'bg-orange-100 text-orange-700',
  standard_selected: 'bg-indigo-100 text-indigo-700',
  approved: 'bg-teal-100 text-teal-700',
};

export default function MyProposals() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyProposals().then(r => setProposals(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Proposals</h2>
        <Link to="/client/proposals/new"
          className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800">
          + New Proposal
        </Link>
      </div>
      {proposals.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm">
          <p className="text-gray-400 text-lg">No proposals yet</p>
          <Link to="/client/proposals/new" className="text-blue-600 text-sm mt-2 inline-block hover:underline">
            Submit your first proposal →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map(p => (
            <Link key={p.id} to={`/client/proposals/${p.id}`}
              className="block bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800">{p.project_title}</h3>
                  <p className="text-sm text-gray-500">{p.business_name} · {p.industry}</p>
                  {p.budget && <p className="text-sm text-gray-400 mt-1">Budget: ₹{Number(p.budget).toLocaleString('en-IN')}</p>}
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[p.status] || 'bg-gray-100 text-gray-600'}`}>
                  {p.status.replace(/_/g, ' ')}
                </span>
              </div>
              {p.admin_notes && (
                <div className="mt-3 bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                  <span className="font-medium">Admin note: </span>{p.admin_notes}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-3">
                Submitted: {new Date(p.created_at).toLocaleDateString('en-IN')}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
