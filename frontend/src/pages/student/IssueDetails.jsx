import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
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
  Award
} from 'lucide-react';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import StarRating from '../../components/StarRating';

export default function IssueDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { fetchNotifications } = useNotifications();

  const [issueData, setIssueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reply form state
  const [replyMessage, setReplyMessage] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Feedback form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const loadIssue = async () => {
    try {
      const data = await api.get(`/issues/${id}`);
      setIssueData(data);
      if (data.feedback) {
        setRating(data.feedback.rating);
        setComment(data.feedback.comment || '');
      }
    } catch (err) {
      setError(err.message || 'Failed to load issue details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssue();
  }, [id]);

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
      alert(err.message || 'Failed to post message.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    setFeedbackSuccess(false);

    try {
      await api.post(`/issues/${id}/feedback`, { rating, comment });
      setFeedbackSuccess(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 }
      });
      await loadIssue();
      fetchNotifications();
    } catch (err) {
      alert(err.message || 'Failed to record feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-sm text-slate-400">Loading issue details...</div>;
  }

  if (error || !issueData) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Issue Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'This issue does not exist or you do not have permission to view it.'}</p>
        <Link
          to="/student/my-issues"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs"
        >
          <ArrowLeft size={14} />
          <span>Back to My Issues</span>
        </Link>
      </div>
    );
  }

  const { issue, student, replies, feedback } = issueData;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/student/my-issues"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to My Issues</span>
        </Link>
        <div className="flex items-center gap-2">
          <PriorityBadge priority={issue.priority} size="md" />
          <StatusBadge status={issue.status} size="md" />
        </div>
      </div>

      {/* Main Issue Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
              {issue.id}
            </span>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
              {issue.category}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>Submitted: {new Date(issue.created_at).toLocaleString()}</span>
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

        {/* Student Information Sub-Card */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
              {student?.name?.charAt(0) || 'S'}
            </div>
            <div>
              <p className="font-bold text-slate-900">{student?.name}</p>
              <p className="text-[11px] text-slate-500">{student?.id} • {student?.email}</p>
            </div>
          </div>
          <div className="text-right sm:text-left">
            <span className="text-slate-500">Department:</span> <strong className="text-slate-800">{student?.department}</strong>
            <span className="mx-2 text-slate-300">|</span>
            <span className="text-slate-500">Year:</span> <strong className="text-slate-800">{student?.year}</strong>
          </div>
        </div>
      </div>

      {/* Communication Section: Student Message -> Admin Reply -> Thread */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Communication & Status Updates</h2>
          </div>
          <span className="text-xs text-slate-400">
            {replies.length} {replies.length === 1 ? 'message' : 'messages'}
          </span>
        </div>

        {/* Thread timeline */}
        <div className="space-y-4">
          {/* Original issue description as the opening conversation bubble */}
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
                          Official Admin Response
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

        {/* Reply Composer */}
        <form onSubmit={handleSendReply} className="pt-4 border-t border-slate-100 space-y-3">
          <label className="block text-xs font-bold text-slate-700">
            Post an Additional Message / Clarification
          </label>
          <div className="flex gap-2">
            <textarea
              rows={2}
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Type your message to campus administration..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
            />
            <button
              type="submit"
              disabled={submittingReply || !replyMessage.trim()}
              className="self-end px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition-all disabled:opacity-40"
            >
              <Send size={14} />
              <span>Send</span>
            </button>
          </div>
        </form>
      </div>

      {/* Student Feedback Section - Active only if issue is RESOLVED */}
      {issue.status === 'Resolved' && (
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/50 rounded-3xl border border-emerald-200 p-6 sm:p-8 space-y-5 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Award size={24} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Issue Resolution Feedback
              </span>
              <h3 className="text-lg font-extrabold text-emerald-950 mt-1">
                Rate the Resolution Quality
              </h3>
              <p className="text-xs text-emerald-800">
                Your feedback helps the university administration improve response times and facility standards.
              </p>
            </div>
          </div>

          {feedbackSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>Thank you! Your feedback has been recorded and submitted to the Dean's office.</span>
            </div>
          )}

          <form onSubmit={handleFeedbackSubmit} className="space-y-4 bg-white/80 backdrop-blur-xs p-5 rounded-2xl border border-emerald-200/60">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Overall Satisfaction Rating (1 to 5 Stars)
              </label>
              <StarRating
                value={rating}
                onChange={(val) => setRating(val)}
                size={28}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Optional Feedback / Comments
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience (e.g. Was the issue resolved swiftly? Was the maintenance staff polite?)"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">
                {feedback ? 'You previously rated this resolution.' : 'Rating will be visible to university administrators.'}
              </span>
              <button
                type="submit"
                disabled={submittingFeedback}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
              >
                {submittingFeedback ? 'Saving...' : feedback ? 'Update Rating & Feedback' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
