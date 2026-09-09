import React from 'react';
import { Clock, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

export default function StatusBadge({ status, size = 'md' }) {
  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5 gap-1' 
    : size === 'lg'
    ? 'text-sm px-3.5 py-1.5 gap-2 font-semibold'
    : 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14;

  switch (status) {
    case 'Pending':
      return (
        <span className={`inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 ${sizeClasses}`}>
          <Clock size={iconSize} className="text-amber-500 animate-pulse" />
          <span>Pending</span>
        </span>
      );
    case 'Under Review':
      return (
        <span className={`inline-flex items-center rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 ${sizeClasses}`}>
          <RefreshCw size={iconSize} className="text-blue-500 animate-spin" style={{ animationDuration: '4s' }} />
          <span>Under Review</span>
        </span>
      );
    case 'Resolved':
      return (
        <span className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${sizeClasses}`}>
          <CheckCircle2 size={iconSize} className="text-emerald-500" />
          <span>Resolved</span>
        </span>
      );
    case 'Rejected':
      return (
        <span className={`inline-flex items-center rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 ${sizeClasses}`}>
          <XCircle size={iconSize} className="text-rose-500" />
          <span>Rejected</span>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
          <span>{status || 'Unknown'}</span>
        </span>
      );
  }
}
