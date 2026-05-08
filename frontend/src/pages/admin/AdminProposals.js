import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllProposals } from '../../utils/api';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-teal-100 text-teal-700',
  quoted: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  assigned: 'bg-purple-100 text-purple-700',
  completed: 'bg-gray-200 text-gray-700',
  rejected: 'bg-red-100 text-red-700',
  negotiation_requested: 'bg-orange-100 text-orange-700',
  standard_selected: 'bg-indigo-100 text-indigo-700',
};

export default function AdminProposals() {
  const [proposals, setProposals] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProposals().then(r => setProposals(r.data)).finally(() => setLoading(false));
  }, []);

  const statuses = ['all', 'pending', 'quoted', 'accepted', 'assigned', 'completed', 'rejected'];
  const filtered = filter === 'all' ? proposals : proposals.filter(p => p.status === filter);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">All Proposals</h2>

      <div className="flex gap-2 flex-wrap mb-6">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors
              ${filter === s ? 'bg-[#1e3a5f] text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}>
            {s} {s === 'all' ? `(${proposals.length})` : `(${proposals.filter(p => p.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(p => (
          <Link key={p.id} to={`/admin/proposals/${p.id}`}
            className="block bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-800">{p.project_title}</h3>
                <p className="text-sm text-gray-500">{p.client_user_name} · {p.business_name}</p>
                {p.budget && <p className="text-xs text-gray-400 mt-1">Budget: ₹{Number(p.budget).toLocaleString('en-IN')}</p>}
              </div>
              <div className="text-right">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[p.status] || 'bg-gray-100'}`}>
                  {p.status.replace(/_/g, ' ')}
                </span>
                <p className="text-xs text-gray-400 mt-2">{new Date(p.created_at).toLocaleDateString('en-IN')}</p>
              </div>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <p className="text-gray-400">No proposals found</p>
          </div>
        )}
      </div>
    </div>
  );
}
