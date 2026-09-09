import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  Clock, 
  CheckCircle2, 
  User, 
  ShieldCheck, 
  AlertCircle,
  MessageSquare,
  Star,
  Sparkles,
  Calendar,
  Layers,
  Award,
  RefreshCw,
  XCircle,
  CornerDownRight
} from 'lucide-react';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import StarRating from '../../components/StarRating';

export default function AdminIssueDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { fetchNotifications } = useNotifications();

  const [issueData, setIssueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Status update state
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusSuccess, setStatusSuccess] = useState(false);

  // Reply state
  const [replyMessage, setReplyMessage] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const cannedReplies = [
    "Your issue has been acknowledged and forwarded to the campus maintenance department. A technician has been assigned to inspect this shortly.",
    "Your request has been forwarded to the IT Network Operations team. Engineers are testing the access points.",
    "The examination controller committee is reviewing this schedule conflict. A revised circular will be published today.",
    "The hostel warden and estate manager have been instructed to conduct an immediate on-site inspection."
  ];

  const loadIssue = async () => {
    try {
      const data = await api.get(`/issues/${id}`);
      setIssueData(data);
      setSelectedStatus(data.issue.status);
    } catch (err) {
      setError(err.message || 'Failed to load issue details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssue();
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedStatus) return;

    setUpdatingStatus(true);
    setStatusSuccess(false);

    try {
      await api.patch(`/issues/${id}/status`, {
        status: selectedStatus,
        note: statusNote.trim() || undefined
      });
      setStatusSuccess(true);
      setStatusNote('');
      await loadIssue();
      fetchNotifications();
      setTimeout(() => setStatusSuccess(false), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update issue status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setSubmittingReply(true);
    try {
      await api.post(`/issues/${id}/replies`, { message: replyMessage.trim() });
      setReplyMessage('');
      await loadIssue();
      fetchNotifications();
    } catch (err) {
      alert(err.message || 'Failed to send admin reply.');
    } finally {
      setSubmittingReply(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-sm text-slate-400">Loading administrative ticket...</div>;
  }

  if (error || !issueData) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Issue Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'This issue does not exist in the database.'}</p>
        <Link
          to="/admin/issues"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold text-xs"
        >
          <ArrowLeft size={14} />
          <span>Back to All Issues</span>
        </Link>
      </div>
    );
  }

  const { issue, student, replies, feedback } = issueData;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Breadcrumb & Badges */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/issues"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-purple-700 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to All Issues</span>
        </Link>
        <div className="flex items-center gap-2">
          <PriorityBadge priority={issue.priority} size="md" />
          <StatusBadge status={issue.status} size="md" />
        </div>
      </div>

      {/* Main Issue Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-lg border border-purple-200">
              {issue.id}
            </span>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
              {issue.category}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>Received: {new Date(issue.created_at).toLocaleString()}</span>
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {issue.title}
          </h1>
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-sm text-slate-800 leading-relaxed whitespace-pre-line">
            {issue.description}
          </div>
        </div>

        {/* Student Information Box */}
        <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs text-purple-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-700 text-white font-bold flex items-center justify-center text-sm shadow-sm">
              {student?.name?.charAt(0) || 'S'}
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">{student?.name}</div>
              <div className="text-[11px] text-slate-500 font-mono">
                Student ID: {student?.id} • {student?.email}
              </div>
            </div>
          </div>
          <div className="text-right sm:text-left">
            <span className="text-slate-500">Department:</span> <strong>{student?.department}</strong>
            <span className="mx-2 text-slate-300">|</span>
            <span className="text-slate-500">Year:</span> <strong>{student?.year}</strong>
          </div>
        </div>
      </div>

      {/* Admin Status Lifecycle Management Card */}
      <div className="bg-white rounded-3xl border border-purple-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-purple-600" />
            <h2 className="text-base font-bold text-slate-900">Manage Issue Status & Official Transition</h2>
          </div>
          <span className="text-xs text-purple-700 font-bold bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
            Admin Action
          </span>
        </div>

        {statusSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>Status updated successfully. Student notification dispatched.</span>
          </div>
        )}

        <form onSubmit={handleStatusUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Current Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { val: 'Pending', label: 'Pending', icon: Clock, col: 'amber' },
                { val: 'Under Review', label: 'Under Review', icon: RefreshCw, col: 'blue' },
                { val: 'Resolved', label: 'Resolved', icon: CheckCircle2, col: 'emerald' },
                { val: 'Rejected', label: 'Rejected', icon: XCircle, col: 'rose' }
              ].map((st) => {
                const Icon = st.icon;
                const isSelected = selectedStatus === st.val;
                return (
                  <button
                    key={st.val}
                    type="button"
                    onClick={() => setSelectedStatus(st.val)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                      isSelected
                        ? st.col === 'emerald'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-200'
                          : st.col === 'blue'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-200'
                          : st.col === 'amber'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-md ring-2 ring-amber-200'
                          : 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-200'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{st.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Official Status Transition Note (Optional Reply to Student)
            </label>
            <input
              type="text"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="e.g. Work order completed by IT services, or Forwarded to department head..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={updatingStatus || selectedStatus === issue.status}
              className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md shadow-purple-700/20 transition-all disabled:opacity-40"
            >
              {updatingStatus ? 'Updating...' : `Save Status: ${selectedStatus}`}
            </button>
          </div>
        </form>
      </div>

      {/* Communication Section: Student Message -> Admin Reply -> Thread */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-purple-600" />
            <h2 className="text-base font-bold text-slate-900">Communication & Timeline</h2>
          </div>
          <span className="text-xs text-slate-400">
            {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
          </span>
        </div>

        {/* Thread timeline */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 mt-1">
              <User size={15} />
            </div>
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-900">{issue.student_name} (Student)</span>
                <span className="text-[10px] text-slate-400">
                  {new Date(issue.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(issue.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed">{issue.description}</p>
            </div>
          </div>

          {replies.map((reply) => {
            const isAdmin = reply.sender_role === 'admin';
            return (
              <div key={reply.id} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-1 ${
                  isAdmin ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-200' : 'bg-blue-100 text-blue-700'
                }`}>
                  {isAdmin ? <ShieldCheck size={16} /> : <User size={15} />}
                </div>

                <div className={`flex-1 rounded-2xl p-4 text-xs ${
                  isAdmin 
                    ? 'bg-purple-50/70 border border-purple-200 text-purple-950 shadow-xs' 
                    : 'bg-slate-50 border border-slate-200 text-slate-700'
                }`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${isAdmin ? 'text-purple-900' : 'text-slate-900'}`}>
                        {reply.sender_name}
                      </span>
                      {isAdmin && (
                        <span className="text-[10px] uppercase tracking-wider font-bold bg-purple-200/80 text-purple-900 px-2 py-0.5 rounded-full">
                          Official Reply
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(reply.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-line">{reply.message}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Canned Response Buttons */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-500" />
            <span>Insert Quick Response Template</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {cannedReplies.map((canned, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setReplyMessage(canned)}
                className="text-left p-2 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200 text-[11px] text-slate-600 line-clamp-2 transition-colors"
              >
                "{canned.substring(0, 75)}..."
              </button>
            ))}
          </div>
        </div>

        {/* Reply Composer */}
        <form onSubmit={handleSendReply} className="pt-2 space-y-3">
          <label className="block text-xs font-bold text-slate-700">
            Write an Official Administrative Reply
          </label>
          <div className="space-y-2">
            <textarea
              rows={3}
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="e.g. Your issue has been forwarded to the maintenance department. It will be resolved shortly."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white text-slate-900"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingReply || !replyMessage.trim()}
                className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all disabled:opacity-40"
              >
                <Send size={14} />
                <span>{submittingReply ? 'Sending Reply...' : 'Post Admin Reply'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Student Feedback Review Card (Visible when student has provided feedback) */}
      {feedback && (
        <div className="bg-white rounded-3xl border border-emerald-200 shadow-sm p-6 sm:p-8 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-emerald-700">
              <Award size={20} />
              <h3 className="text-base font-bold text-slate-900">Student Resolution Feedback</h3>
            </div>
            <span className="text-xs text-slate-400">
              {new Date(feedback.created_at).toLocaleDateString()}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-2">
            <div className="flex items-center gap-2">
              <StarRating value={feedback.rating} readOnly={true} size={20} />
              <span className="text-xs font-bold text-emerald-800">
                ({feedback.rating} / 5 Stars)
              </span>
            </div>
            {feedback.comment && (
              <p className="text-xs text-slate-800 italic leading-relaxed pt-1">
                "{feedback.comment}"
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
