import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProposal } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const industries = ['Technology','Healthcare','Finance','Education','Retail','Manufacturing','Real Estate','Entertainment','Logistics','Other'];

export default function CreateProposal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    business_name: '', client_name: user?.name || '', project_title: '',
    industry: '', description: '', objectives: '', scope_of_work: '',
    deliverables: '', timeline: '', budget: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createProposal({ ...form, budget: form.budget ? Number(form.budget) : undefined });
      toast.success('Proposal submitted successfully!');
      navigate('/client/proposals');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit');
    } finally { setLoading(false); }
  };

  const field = (label, key, type = 'text', required = false, placeholder = '') => (
    <div key={key}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && ' *'}</label>
      <input type={type} value={form[key]} placeholder={placeholder}
        onChange={e => set(key, e.target.value)} required={required}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
    </div>
  );

  const textarea = (label, key, required = false, placeholder = '') => (
    <div key={key}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && ' *'}</label>
      <textarea value={form[key]} placeholder={placeholder} rows={3}
        onChange={e => set(key, e.target.value)} required={required}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Submit New Proposal</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {field('Business Name', 'business_name', 'text', true, 'Acme Corp')}
          {field('Contact Name', 'client_name', 'text', true, 'Your name')}
        </div>
        {field('Project Title', 'project_title', 'text', true, 'E-commerce platform with AI recommendations')}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Industry *</label>
          <select value={form.industry} onChange={e => set('industry', e.target.value)} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
            <option value="">Select industry</option>
            {industries.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        {textarea('Project Description', 'description', true, 'Describe what you want to build...')}
        {textarea('Objectives', 'objectives', false, 'What are the main goals?')}
        {textarea('Scope of Work', 'scope_of_work', false, 'List the key features and modules...')}
        {textarea('Deliverables', 'deliverables', false, 'What should be delivered at the end?')}
        <div className="grid md:grid-cols-2 gap-4">
          {field('Timeline (months)', 'timeline', 'number', false, '3')}
          {field('Budget (INR)', 'budget', 'number', false, '100000')}
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-[#1e3a5f] hover:bg-blue-800 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-60">
          {loading ? 'Submitting...' : 'Submit Proposal'}
        </button>
      </form>
    </div>
  );
}
