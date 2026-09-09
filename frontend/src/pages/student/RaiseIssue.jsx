import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  PlusCircle, 
  ArrowLeft, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export default function RaiseIssue() {
  const { user } = useAuth();
  const { fetchNotifications } = useNotifications();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedIssue, setSubmittedIssue] = useState(null);

  const categories = [
    'Academic',
    'Examination',
    'Faculty',
    'Classroom',
    'Hostel',
    'Transport',
    'Infrastructure',
    'Library',
    'Internet / Wi-Fi',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please provide a brief title for your issue.');
      return;
    }
    if (!category) {
      setError('Please select an issue category.');
      return;
    }
    if (!description.trim() || description.trim().length < 15) {
      setError('Please describe your issue with at least 15 characters of detail.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await api.post('/issues', {
        title: title.trim(),
        category,
        priority,
        description: description.trim()
      });

      setSubmittedIssue(data.issue);
      fetchNotifications();
    } catch (err) {
      setError(err.message || 'Failed to submit issue. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedIssue) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
            <CheckCircle2 size={36} />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Submitted Successfully
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Issue Registered: {submittedIssue.id}
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Your issue has been logged into the university system with status <strong className="text-amber-600">Pending</strong>. Campus administration has been notified.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 text-left text-xs space-y-2.5 max-w-md mx-auto">
            <div className="flex justify-between">
              <span className="text-slate-500">Title:</span>
              <span className="font-semibold text-slate-900 text-right">{submittedIssue.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Category:</span>
              <span className="font-semibold text-slate-900">{submittedIssue.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Priority:</span>
              <span className="font-semibold text-slate-900">{submittedIssue.priority}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date & Time:</span>
              <span className="font-semibold text-slate-900">{new Date(submittedIssue.created_at).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to={`/student/issues/${submittedIssue.id}`}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-colors"
            >
              View Issue Thread →
            </Link>
            <Link
              to="/student/my-issues"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
            >
              Back to My Issues
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/student/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-2"
          >
            <ArrowLeft size={14} />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Raise New Issue or Requirement
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit a formal ticket to campus administrators. Please provide clear details for fast resolution.
          </p>
        </div>
      </div>

      {/* Auto-filled Student Details Bar */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-blue-900">
        <div className="flex items-center gap-2">
          <Info size={16} className="text-blue-600 shrink-0" />
          <span>
            Logged in as: <strong>{user?.name}</strong> ({user?.id})
          </span>
        </div>
        <div className="text-blue-700 font-medium">
          Dept: {user?.department} • {user?.year}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-700">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Issue Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Issue Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Wi-Fi disconnection in Hostel Block B 3rd Floor"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900"
          />
          <div className="flex justify-between items-center mt-1.5 text-[11px] text-slate-400">
            <span>Be specific and concise</span>
            <span>{title.length}/120</span>
          </div>
        </div>

        {/* Category & Priority Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900"
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Priority Level <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Low', 'Medium', 'High'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all ${
                    priority === p
                      ? p === 'High'
                        ? 'bg-rose-50 border-rose-400 text-rose-700 shadow-xs ring-2 ring-rose-200'
                        : p === 'Medium'
                        ? 'bg-amber-50 border-amber-400 text-amber-800 shadow-xs ring-2 ring-amber-200'
                        : 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-xs ring-2 ring-emerald-200'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Detailed Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Issue Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue in detail. Include room/hall number, device number, specific symptoms, or requirements so that administrators can diagnose and take immediate action."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900 resize-y"
          />
          <span className="text-[11px] text-slate-400 mt-1 block">
            Minimum 15 characters ({description.length} entered)
          </span>
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/student/dashboard')}
            className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
          >
            <Send size={15} />
            <span>{submitting ? 'Submitting Issue...' : 'Submit Issue'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
