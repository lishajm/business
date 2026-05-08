import React, { useEffect, useState } from 'react';
import { getAllMeetings, updateMeeting, requestMeeting, getAllProposals } from '../../utils/api';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
  rescheduled: 'bg-blue-100 text-blue-700',
};

export default function MeetingManagement() {
  const [meetings, setMeetings] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [form, setForm] = useState({ status: 'approved', admin_date: '', admin_time: '', admin_note: '', meeting_link: '' });
  const [showNew, setShowNew] = useState(false);
  const [newMtg, setNewMtg] = useState({ proposal_id: '', preferred_date: '', preferred_time: '', notes: '', meeting_link: '' });
  const [loading, setLoading] = useState(true);

  const load = () => {
    getAllMeetings().then(r => setMeetings(r.data)).finally(() => setLoading(false));
    getAllProposals().then(r => setProposals(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleUpdate = async (id) => {
    try {
      await updateMeeting(id, form);
      toast.success('Meeting updated');
      setActiveId(null);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleNew = async (e) => {
    e.preventDefault();
    try {
      await requestMeeting({ ...newMtg, proposal_id: Number(newMtg.proposal_id) });
      toast.success('Meeting scheduled');
      setShowNew(false);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Meetings</h2>
        <button onClick={() => setShowNew(!showNew)}
          className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800">
          + Schedule Meeting
        </button>
      </div>

      {showNew && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">New Meeting (Admin Initiated)</h3>
          <form onSubmit={handleNew} className="space-y-3">
            <select value={newMtg.proposal_id} onChange={e => setNewMtg(f => ({ ...f, proposal_id: e.target.value }))} required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">Select proposal</option>
              {proposals.map(p => <option key={p.id} value={p.id}>{p.project_title} - {p.client_user_name}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input type="date" required value={newMtg.preferred_date}
                onChange={e => setNewMtg(f => ({ ...f, preferred_date: e.target.value }))}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <input type="time" required value={newMtg.preferred_time}
                onChange={e => setNewMtg(f => ({ ...f, preferred_time: e.target.value }))}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <input type="url" placeholder="Meeting link (optional)" value={newMtg.meeting_link}
              onChange={e => setNewMtg(f => ({ ...f, meeting_link: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <div className="flex gap-2">
              <button type="submit" className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800">Create</button>
              <button type="button" onClick={() => setShowNew(false)} className="border px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {meetings.map(m => (
          <div key={m.id} className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-800">{m.project_title}</h3>
                <p className="text-sm text-gray-500">{m.client_name} · {m.client_email}</p>
                <p className="text-sm text-gray-500 mt-1">Requested: {m.preferred_date} at {m.preferred_time}</p>
                {m.meeting_link && <a href={m.meeting_link} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">🔗 Link</a>}
              </div>
              <div className="text-right">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[m.status] || 'bg-gray-100'}`}>
                  {m.status}
                </span>
                {m.status === 'pending' && (
                  <button onClick={() => { setActiveId(m.id); setForm({ status: 'approved', admin_date: m.preferred_date, admin_time: m.preferred_time, admin_note: '', meeting_link: '' }); }}
                    className="block mt-2 text-xs text-blue-600 hover:underline">
                    Respond
                  </button>
                )}
              </div>
            </div>

            {activeId === m.id && (
              <div className="mt-4 border-t pt-4 space-y-3">
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="approved">Approve</option>
                  <option value="rescheduled">Reschedule</option>
                  <option value="rejected">Reject</option>
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" value={form.admin_date} onChange={e => setForm(f => ({ ...f, admin_date: e.target.value }))}
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  <input type="time" value={form.admin_time} onChange={e => setForm(f => ({ ...f, admin_time: e.target.value }))}
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <input type="url" placeholder="Meeting link (Zoom, Meet, etc.)" value={form.meeting_link}
                  onChange={e => setForm(f => ({ ...f, meeting_link: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                <input type="text" placeholder="Note to client" value={form.admin_note}
                  onChange={e => setForm(f => ({ ...f, admin_note: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                <div className="flex gap-2">
                  <button onClick={() => handleUpdate(m.id)} className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800">Save</button>
                  <button onClick={() => setActiveId(null)} className="border px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {meetings.length === 0 && <div className="text-center py-16 bg-white rounded-xl shadow-sm text-gray-400">No meetings yet</div>}
      </div>
    </div>
  );
}
