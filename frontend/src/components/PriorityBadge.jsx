import React from 'react';
import { AlertTriangle, AlertCircle, ArrowDown } from 'lucide-react';

export default function PriorityBadge({ priority, size = 'md' }) {
  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5 gap-1' 
    : size === 'lg'
    ? 'text-sm px-3.5 py-1.5 gap-2 font-semibold'
    : 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14;

  switch (priority) {
    case 'High':
      return (
        <span className={`inline-flex items-center rounded-full bg-red-50 text-red-700 border border-red-200/80 font-semibold ${sizeClasses}`}>
          <AlertTriangle size={iconSize} className="text-red-600" />
          <span>High Priority</span>
        </span>
      );
    case 'Medium':
      return (
        <span className={`inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 ${sizeClasses}`}>
          <AlertCircle size={iconSize} className="text-amber-500" />
          <span>Medium Priority</span>
        </span>
      );
    case 'Low':
      return (
        <span className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${sizeClasses}`}>
          <ArrowDown size={iconSize} className="text-emerald-500" />
          <span>Low Priority</span>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
          <span>{priority || 'Normal'}</span>
        </span>
      );
  }
}
