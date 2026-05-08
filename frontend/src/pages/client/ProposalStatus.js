import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProposal, getQuotations, selectQuotation, requestMeeting, getQuotationPdf } from '../../utils/api';
import toast from 'react-hot-toast';

const INR = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const tierColors = {
  basic: 'border-blue-400',
  standard: 'border-purple-400',
  premium: 'border-yellow-500',
};
const tierBg = {
  basic: 'bg-blue-50',
  standard: 'bg-purple-50',
  premium: 'bg-yellow-50',
};

export default function ProposalStatus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [selection, setSelection] = useState(null);
  const [meetingForm, setMeetingForm] = useState({ date: '', time: '', notes: '' });
  const [showMeeting, setShowMeeting] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    getProposal(id).then(r => setProposal(r.data)).catch(() => navigate('/client/proposals'));
    getQuotations(id).then(r => { setQuotations(r.data.quotations || []); setSelection(r.data.selection); }).catch(() => {});
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const handleSelect = async (q) => {
    if (!window.confirm(`Select ${q.tier} package for ${INR(q.total_cost)}?`)) return;
    try {
      const { data } = await selectQuotation({ proposal_id: Number(id), quotation_id: q.id });
      toast.success(data.message);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleMeeting = async (e) => {
    e.preventDefault();
    try {
      await requestMeeting({ proposal_id: Number(id), preferred_date: meetingForm.date, preferred_time: meetingForm.time, notes: meetingForm.notes });
      toast.success('Meeting request sent!');
      setShowMeeting(false);
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handlePdf = async (qId) => {
    try {
      const { data } = await getQuotationPdf(qId);
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a'); a.href = url;
      a.download = `Quotation_${qId}.pdf`; a.click();
    } catch { toast.error('PDF download failed'); }
  };

  if (loading || !proposal) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800">{proposal.project_title}</h2>
        <p className="text-gray-500 text-sm">{proposal.business_name} · {proposal.industry}</p>
        <div className="mt-3 flex gap-3 flex-wrap">
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm capitalize">
            {proposal.status?.replace(/_/g,' ')}
          </span>
          {proposal.estimated_cost && (
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
              Est. Cost: {INR(proposal.estimated_cost)}
            </span>
          )}
        </div>
        {proposal.admin_notes && (
          <div className="mt-4 bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
            <span className="font-semibold">Admin Notes: </span>{proposal.admin_notes}
          </div>
        )}
      </div>

      {/* Quotations */}
      {quotations.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-700 mb-3">Choose Your Package</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {quotations.map(q => {
              const services = (() => { try { return JSON.parse(q.services); } catch { return []; } })();
              const benefits = (() => { try { return JSON.parse(q.benefits); } catch { return []; } })();
              const isSelected = selection?.tier === q.tier;
              return (
                <div key={q.id} className={`rounded-xl border-2 p-4 ${tierColors[q.tier]} ${tierBg[q.tier]} ${isSelected ? 'ring-2 ring-offset-2 ring-green-400' : ''}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold capitalize text-gray-800">{q.tier}</h4>
                    {isSelected && <span className="text-green-600 text-xs font-bold">✓ Selected</span>}
                  </div>
                  <p className="text-xs text-gray-500 italic mb-3">{q.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{INR(q.total_cost)}</p>
                  <p className="text-xs text-gray-500">incl. 18% GST · {q.timeline}</p>

                  <div className="mt-3 space-y-1">
                    {services.slice(0, 4).map((s, i) => (
                      <p key={i} className="text-xs text-gray-600">✓ {s.name}</p>
                    ))}
                    {services.length > 4 && <p className="text-xs text-gray-400">+{services.length - 4} more services</p>}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
                    {benefits.slice(0, 3).map((b, i) => (
                      <p key={i} className="text-xs text-green-700">▶ {b}</p>
                    ))}
                  </div>

                  <div className="mt-3 flex gap-2">
                    {!selection && (
                      <button onClick={() => handleSelect(q)}
                        className="flex-1 bg-[#1e3a5f] text-white text-xs py-2 rounded-lg hover:bg-blue-800">
                        Select
                      </button>
                    )}
                    <button onClick={() => handlePdf(q.id)}
                      className="flex-1 border border-gray-300 text-gray-600 text-xs py-2 rounded-lg hover:bg-gray-50">
                      PDF
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Schedule Meeting */}
      {(proposal.status === 'standard_selected' || proposal.status === 'negotiation_requested') && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-2">
            {proposal.status === 'negotiation_requested' ? '🔴 Negotiation Meeting Required' : '📅 Schedule Optional Meeting'}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {proposal.status === 'negotiation_requested'
              ? 'Premium package requires a negotiation meeting with admin before proceeding.'
              : 'You can optionally schedule a meeting with admin to discuss the standard package.'}
          </p>
          {!showMeeting ? (
            <button onClick={() => setShowMeeting(true)}
              className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800">
              Schedule Meeting
            </button>
          ) : (
            <form onSubmit={handleMeeting} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Preferred Date</label>
                  <input type="date" required value={meetingForm.date}
                    onChange={e => setMeetingForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Preferred Time</label>
                  <input type="time" required value={meetingForm.time}
                    onChange={e => setMeetingForm(f => ({ ...f, time: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              </div>
              <textarea placeholder="Notes (optional)" rows={2} value={meetingForm.notes}
                onChange={e => setMeetingForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
              <div className="flex gap-2">
                <button type="submit" className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800">
                  Send Request
                </button>
                <button type="button" onClick={() => setShowMeeting(false)}
                  className="border border-gray-300 px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
