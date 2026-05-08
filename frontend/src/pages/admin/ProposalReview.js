import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProposal, reviewProposal, generateQuotations, getDevelopers, assignDeveloper, getQuotations, updateQuotation } from '../../utils/api';
import toast from 'react-hot-toast';

const INR = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

export default function ProposalReview() {
  const { id } = useParams();
  const [proposal, setProposal] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [reviewForm, setReviewForm] = useState({ status: '', admin_notes: '', estimated_cost: '', admin_timeline: '' });
  const [assignForm, setAssignForm] = useState({ developer_id: '', deadline: '', instructions: '' });
  const [editQ, setEditQ] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    getProposal(id).then(r => { setProposal(r.data); setReviewForm(f => ({ ...f, status: r.data.status })); }).catch(() => {});
    getQuotations(id).then(r => setQuotations(r.data.quotations || [])).catch(() => {});
    getDevelopers().then(r => setDevelopers(r.data)).catch(() => {});
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      await reviewProposal(id, reviewForm);
      toast.success('Proposal updated');
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleGenerate = async () => {
    try {
      const { data } = await generateQuotations(id);
      toast.success(`Generated ${data.quotations.length} quotations`);
      setQuotations(data.quotations);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await assignDeveloper({ proposal_id: Number(id), ...assignForm, developer_id: Number(assignForm.developer_id) });
      toast.success('Developer assigned!');
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleEditQ = async (e) => {
    e.preventDefault();
    try {
      await updateQuotation(editQ.id, { cost: editQ.cost, timeline: editQ.timeline, admin_note: editQ.admin_note });
      toast.success('Quotation updated');
      setEditQ(null);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  if (loading || !proposal) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Proposal Info */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800">{proposal.project_title}</h2>
        <p className="text-sm text-gray-500">{proposal.client_user_name} · {proposal.business_name} · {proposal.industry}</p>
        <div className="mt-4 grid md:grid-cols-2 gap-3 text-sm">
          {[
            ['Description', proposal.description],
            ['Objectives', proposal.objectives],
            ['Scope of Work', proposal.scope_of_work],
            ['Deliverables', proposal.deliverables],
          ].filter(([, v]) => v).map(([l, v]) => (
            <div key={l} className="bg-gray-50 rounded-lg p-3">
              <p className="font-medium text-gray-600 text-xs mb-1">{l}</p>
              <p className="text-gray-700">{v}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-4 text-sm text-gray-500">
          {proposal.timeline && <span>⏱ {proposal.timeline} months</span>}
          {proposal.budget && <span>💰 {INR(proposal.budget)}</span>}
        </div>
      </div>

      {/* Review Form */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Review Proposal</h3>
        <form onSubmit={handleReview} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select value={reviewForm.status} onChange={e => setReviewForm(f => ({ ...f, status: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              {['pending','approved','modified','rejected','quoted','accepted','assigned','completed'].map(s =>
                <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <textarea placeholder="Admin notes" value={reviewForm.admin_notes} rows={2}
            onChange={e => setReviewForm(f => ({ ...f, admin_notes: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" placeholder="Estimated cost (INR)" value={reviewForm.estimated_cost}
              onChange={e => setReviewForm(f => ({ ...f, estimated_cost: e.target.value }))}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <input type="text" placeholder="Timeline estimate" value={reviewForm.admin_timeline}
              onChange={e => setReviewForm(f => ({ ...f, admin_timeline: e.target.value }))}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <button type="submit" className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800">
            Save Review
          </button>
        </form>
      </div>

      {/* Quotation Generator */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-700">AI Quotations</h3>
          <button onClick={handleGenerate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            ✨ Generate Quotations
          </button>
        </div>
        {quotations.length > 0 ? (
          <div className="space-y-3">
            {quotations.map(q => (
              <div key={q.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="capitalize font-semibold text-gray-800">{q.tier}</span>
                    <span className="text-gray-500 text-sm ml-2">{INR(q.total_cost)} · {q.timeline}</span>
                  </div>
                  <button onClick={() => setEditQ({ id: q.id, cost: q.cost, timeline: q.timeline, admin_note: q.admin_note || '' })}
                    className="text-xs text-blue-600 hover:underline">Edit</button>
                </div>
                {editQ?.id === q.id && (
                  <form onSubmit={handleEditQ} className="mt-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" value={editQ.cost} onChange={e => setEditQ(x => ({ ...x, cost: e.target.value }))}
                        placeholder="Cost (before GST)"
                        className="border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                      <input type="text" value={editQ.timeline} onChange={e => setEditQ(x => ({ ...x, timeline: e.target.value }))}
                        placeholder="Timeline"
                        className="border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                    </div>
                    <input type="text" value={editQ.admin_note} onChange={e => setEditQ(x => ({ ...x, admin_note: e.target.value }))}
                      placeholder="Admin note"
                      className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                    <div className="flex gap-2">
                      <button type="submit" className="bg-green-600 text-white px-3 py-1.5 rounded text-xs hover:bg-green-700">Save</button>
                      <button type="button" onClick={() => setEditQ(null)} className="text-gray-500 text-xs px-3 py-1.5 border rounded hover:bg-gray-50">Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No quotations generated yet. Click the button above.</p>
        )}
      </div>

      {/* Assign Developer */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Assign Developer</h3>
        {proposal.developer_name && (
          <div className="mb-4 bg-green-50 rounded-lg p-3 text-sm text-green-700">
            ✓ Assigned to: <strong>{proposal.developer_name}</strong>
          </div>
        )}
        <form onSubmit={handleAssign} className="space-y-3">
          <select value={assignForm.developer_id} onChange={e => setAssignForm(f => ({ ...f, developer_id: e.target.value }))} required
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="">Select developer</option>
            {developers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.email})</option>)}
          </select>
          <input type="date" required value={assignForm.deadline}
            onChange={e => setAssignForm(f => ({ ...f, deadline: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <textarea placeholder="Instructions (optional)" rows={2} value={assignForm.instructions}
            onChange={e => setAssignForm(f => ({ ...f, instructions: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
          <button type="submit" className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800">
            Assign Developer
          </button>
        </form>
      </div>
    </div>
  );
}
