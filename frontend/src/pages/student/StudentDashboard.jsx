import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Clock, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  ArrowRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await api.get('/stats');
        setStats(data);
      } catch (err) {
        console.error('Failed to load student stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-700/60 border border-blue-400/30 text-xs text-blue-200">
              <Sparkles size={14} className="text-amber-400" />
              <span>{user?.department} • {user?.year}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-sm text-blue-200 max-w-xl">
              Track your raised campus issues, view administrative responses, and submit new service or academic requirements.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Link
              to="/student/raise-issue"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-blue-900 hover:bg-blue-50 font-bold text-sm shadow-lg shadow-black/10 transition-all transform hover:-translate-y-0.5"
            >
              <PlusCircle size={18} className="text-blue-700" />
              <span>Raise New Issue</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Issues */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Raised</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {loading ? '...' : (stats?.total || 0)}
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">Lifetime submissions</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <FileText size={24} />
          </div>
        </div>

        {/* Pending Issues */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">
              {loading ? '...' : (stats?.pending || 0)}
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">Awaiting admin review</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <Clock size={24} />
          </div>
        </div>

        {/* Under Review */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Under Review</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-1">
              {loading ? '...' : (stats?.underReview || 0)}
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">Department assigned</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <RefreshCw size={24} />
          </div>
        </div>

        {/* Resolved Issues */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Resolved</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
              {loading ? '...' : (stats?.resolved || 0)}
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">Closed & feedback ready</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <CheckCircle2 size={24} />
          </div>
        </div>

      </div>

      {/* Recent Issues Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Issues Raised</h2>
            <p className="text-xs text-slate-500 mt-0.5">Most recent complaints and requests submitted by you</p>
          </div>
          <Link
            to="/student/my-issues"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition-colors"
          >
            <span>View All Issues</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-400">Loading your issues...</div>
        ) : !stats?.recentIssues || stats.recentIssues.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText size={26} />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">No issues raised yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              If you have any academic, hostel, Wi-Fi, classroom, or facility issues, raise a ticket and the administration will look into it.
            </p>
            <Link
              to="/student/raise-issue"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
            >
              <PlusCircle size={15} />
              <span>Raise Your First Issue</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-6">Issue ID</th>
                  <th className="py-3 px-6">Title</th>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6">Priority</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {stats.recentIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-blue-700">
                      {issue.id}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-900 max-w-xs truncate">
                      {issue.title}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 font-medium text-slate-700 text-[11px]">
                        {issue.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <PriorityBadge priority={issue.priority} size="sm" />
                    </td>
                    <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                      {new Date(issue.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={issue.status} size="sm" />
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <Link
                        to={`/student/issues/${issue.id}`}
                        className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 hover:underline text-xs"
                      >
                        <span>Details</span>
                        <ArrowRight size={13} />
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
