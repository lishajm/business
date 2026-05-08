import React, { useEffect, useState } from 'react';
import { getMyMeetings, updateMeeting } from '../../utils/api';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
  rescheduled: 'bg-blue-100 text-blue-700',
};

export default function ScheduleMeeting() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    getMyMeetings().then(r => setMeetings(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    if (!window.confirm('Cancel this meeting?')) return;
    try {
      await updateMeeting(id, { status: 'cancelled' });
      toast.success('Meeting cancelled');
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Meetings</h2>
      {meetings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm">
          <p className="text-gray-400">No meetings scheduled yet</p>
          <p className="text-sm text-gray-400 mt-1">Select a Standard or Premium quotation to schedule a meeting</p>
        </div>
      ) : (
        <div className="space-y-4">
          {meetings.map(m => (
            <div key={m.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800">{m.project_title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Requested: {m.preferred_date} at {m.preferred_time}
                  </p>
                  {(m.admin_date || m.admin_time) && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ Confirmed: {m.admin_date} at {m.admin_time}
                    </p>
                  )}
                  {m.meeting_link && (
                    <a href={m.meeting_link} target="_blank" rel="noreferrer"
                      className="text-sm text-blue-600 hover:underline mt-1 block">
                      🔗 Join Meeting
                    </a>
                  )}
                  {m.admin_note && <p className="text-sm text-gray-500 mt-1 italic">"{m.admin_note}"</p>}
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[m.status] || 'bg-gray-100 text-gray-600'}`}>
                  {m.status}
                </span>
              </div>
              {m.status === 'pending' && (
                <button onClick={() => cancel(m.id)}
                  className="mt-3 text-xs text-red-500 hover:text-red-700 border border-red-200 px-3 py-1 rounded-lg">
                  Cancel Meeting
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
