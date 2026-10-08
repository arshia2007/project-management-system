import React from 'react';
import { ProjectStatus, TaskPriority, TaskStatus } from '../types';

interface BadgeProps {
  type: 'projectStatus' | 'taskStatus' | 'priority';
  value: ProjectStatus | TaskStatus | TaskPriority | string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ type, value, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs font-medium px-2.5 py-1';

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  if (type === 'projectStatus' || type === 'taskStatus') {
    switch (value) {
      case 'Completed':
        colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'In Progress':
        colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'Not Started':
      case 'Pending':
        colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
        break;
    }
  } else if (type === 'priority') {
    switch (value) {
      case 'High':
        colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
        break;
      case 'Medium':
        colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
        break;
      case 'Low':
        colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
    }
  }

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${sizeClasses} ${colorClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {value}
    </span>
  );
};
