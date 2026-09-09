import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Clock, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileSpreadsheet, 
  ArrowRight,
  TrendingUp,
  Star,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await api.get('/stats');
        setStats(data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-purple-500/10 skew-x-12 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-800/60 border border-purple-500/30 text-xs text-purple-200">
              <ShieldCheck size={14} className="text-purple-300" />
              <span>{user?.department || 'Dean of Student Affairs'} • Administrator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Administrator Oversight Dashboard
            </h1>
            <p className="text-sm text-purple-200/90 max-w-xl">
              Centralized monitoring for student complaints, facility work orders, and academic escalation tickets.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Link
              to="/admin/issues"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-sm shadow-lg shadow-purple-500/30 transition-all transform hover:-translate-y-0.5"
            >
              <FileSpreadsheet size={18} />
              <span>Manage All Issues</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Summary Cards: 6 Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        {/* Total */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total</span>
            <FileSpreadsheet size={16} className="text-slate-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {loading ? '...' : (stats?.total || 0)}
          </p>
          <span className="text-[10px] text-slate-400">All submissions</span>
        </div>

        {/* Pending */}
        <Link 
          to="/admin/issues?status=Pending"
          className="bg-white rounded-2xl p-4 border border-amber-200 hover:border-amber-400 shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending</span>
            <Clock size={16} className="text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600">
            {loading ? '...' : (stats?.pending || 0)}
          </p>
          <span className="text-[10px] text-amber-700/80 font-medium">Needs review →</span>
        </Link>

        {/* Under Review */}
        <Link 
          to="/admin/issues?status=Under Review"
          className="bg-white rounded-2xl p-4 border border-blue-200 hover:border-blue-400 shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Under Review</span>
            <RefreshCw size={16} className="text-blue-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-extrabold text-blue-600">
            {loading ? '...' : (stats?.underReview || 0)}
          </p>
          <span className="text-[10px] text-blue-700/80 font-medium">In progress →</span>
        </Link>

        {/* Resolved */}
        <Link 
          to="/admin/issues?status=Resolved"
          className="bg-white rounded-2xl p-4 border border-emerald-200 hover:border-emerald-400 shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Resolved</span>
            <CheckCircle2 size={16} className="text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600">
            {loading ? '...' : (stats?.resolved || 0)}
          </p>
          <span className="text-[10px] text-emerald-700/80 font-medium">Completed →</span>
        </Link>

        {/* Rejected */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Rejected</span>
            <XCircle size={16} className="text-rose-500" />
          </div>
          <p className="text-2xl font-extrabold text-rose-600">
            {loading ? '...' : (stats?.rejected || 0)}
          </p>
          <span className="text-[10px] text-slate-400">Declined/invalid</span>
        </div>

        {/* High Priority */}
        <div className="bg-rose-50/80 rounded-2xl p-4 border border-rose-200 shadow-sm">
          <div className="flex items-center justify-between text-rose-700 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Urgent Active</span>
            <AlertTriangle size={16} className="text-rose-600 animate-bounce" />
          </div>
          <p className="text-2xl font-extrabold text-rose-700">
            {loading ? '...' : (stats?.highPriority || 0)}
          </p>
          <span className="text-[10px] text-rose-600 font-bold">High Priority</span>
        </div>

      </div>

      {/* Analytics Breakdown & Satisfaction Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Breakdown (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Issues Distribution by Category</h2>
            </div>
            <span className="text-xs text-slate-400">Departmental breakdown</span>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="py-6 text-center text-xs text-slate-400">Loading categories...</div>
            ) : !stats?.categoryBreakdown || stats.categoryBreakdown.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">No categorized issues yet.</div>
            ) : (
              stats.categoryBreakdown.map((item) => {
                const percentage = Math.round((item.count / (stats.total || 1)) * 100);
                return (
                  <div key={item.category} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800">{item.category}</span>
                      <span className="text-slate-500 font-mono">{item.count} tickets ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Student Satisfaction Rating (1 Col) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Star size={18} className="text-amber-500 fill-amber-500" />
              <h2 className="text-sm font-bold text-slate-900">Student Satisfaction</h2>
            </div>
            
            <div className="mt-6 text-center">
              <div className="text-5xl font-extrabold text-slate-900 tracking-tight">
                {loading ? '...' : stats?.feedbackSummary?.average || '5.0'}
              </div>
              <div className="flex items-center justify-center gap-1 mt-2 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={18} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Based on {loading ? '...' : (stats?.feedbackSummary?.totalReviews || 0)} verified student reviews
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-800">
            <span className="font-bold block mb-0.5">High Performance SLA</span>
            Most resolved issues received 4 to 5 star ratings praising prompt turnaround.
          </div>
        </div>

      </div>

      {/* Recently Submitted Issues Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recently Submitted Student Issues</h2>
            <p className="text-xs text-slate-500 mt-0.5">Newest tickets requiring review or action</p>
          </div>
          <Link
            to="/admin/issues"
            className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1.5 transition-colors"
          >
            <span>View All Issues</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-400">Loading issues...</div>
        ) : !stats?.recentIssues || stats.recentIssues.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No issues submitted yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-6">Issue ID</th>
                  <th className="py-3 px-6">Student</th>
                  <th className="py-3 px-6">Title</th>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6">Priority</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {stats.recentIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-purple-700 whitespace-nowrap">
                      {issue.id}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{issue.student_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{issue.student_id}</div>
                    </td>
                    <td className="py-4 px-6 max-w-xs truncate font-medium text-slate-800">
                      {issue.title}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 font-medium text-slate-700 text-[11px]">
                        {issue.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <PriorityBadge priority={issue.priority} size="sm" />
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <StatusBadge status={issue.status} size="sm" />
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <Link
                        to={`/admin/issues/${issue.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white font-semibold text-xs transition-all"
                      >
                        <span>Review & Reply</span>
                        <ChevronRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
