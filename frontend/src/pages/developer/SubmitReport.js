import React, { useEffect, useState } from 'react';
import { submitReport, getAssignedProposals } from '../../utils/api';
import toast from 'react-hot-toast';

export default function SubmitReport() {
  const [work, setWork] = useState([]);
  const [form, setForm] = useState({ proposal_id: '', work_done: '', issues_faced: '', hours_worked: '', is_final: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => { getAssignedProposals().then(r => setWork(r.data)).catch(() => {}); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitReport({ ...form, hours_worked: Number(form.hours_worked), proposal_id: form.proposal_id ? Number(form.proposal_id) : undefined });
      toast.success('Report submitted!');
      setForm({ proposal_id: '', work_done: '', issues_faced: '', hours_worked: '', is_final: false });
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Submit Work Report</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project (optional)</label>
          <select value={form.proposal_id} onChange={e => setForm(f => ({ ...f, proposal_id: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="">General / No specific project</option>
            {work.map(w => <option key={w.id} value={w.id}>{w.project_title}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Work Done *</label>
          <textarea required rows={4} value={form.work_done}
            onChange={e => setForm(f => ({ ...f, work_done: e.target.value }))}
            placeholder="Describe what you worked on today..."
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Issues Faced</label>
          <textarea rows={2} value={form.issues_faced}
            onChange={e => setForm(f => ({ ...f, issues_faced: e.target.value }))}
            placeholder="Any blockers or issues? (optional)"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hours Worked *</label>
          <input type="number" required step="0.5" min="0.5" max="24" value={form.hours_worked}
            onChange={e => setForm(f => ({ ...f, hours_worked: e.target.value }))}
            placeholder="e.g. 7.5"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.is_final}
            onChange={e => setForm(f => ({ ...f, is_final: e.target.checked }))}
            className="w-4 h-4 rounded" />
          <span className="text-sm text-gray-700">This is the final report for this project</span>
        </label>
        <button type="submit" disabled={loading}
          className="w-full bg-[#1e3a5f] hover:bg-blue-800 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-60">
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
}
