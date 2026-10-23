import React from 'react';
import { WasteListingStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'neutral';
  status?: WasteListingStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  status,
  size = 'md',
  className = '',
}) => {
  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  if (status) {
    switch (status) {
      case 'draft':
        colorClasses = 'bg-gray-100 text-gray-700 border-gray-200';
        break;
      case 'awaiting_recycler':
        colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
        break;
      case 'recycler_accepted':
        colorClasses = 'bg-blue-50 text-blue-800 border-blue-200';
        break;
      case 'pickup_scheduled':
        colorClasses = 'bg-indigo-50 text-indigo-800 border-indigo-200';
        break;
      case 'collected':
        colorClasses = 'bg-purple-50 text-purple-800 border-purple-200';
        break;
      case 'weight_verified':
        colorClasses = 'bg-teal-50 text-teal-800 border-teal-200';
        break;
      case 'recovery_confirmed':
        colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold';
        break;
      case 'cancelled':
        colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
        break;
    }
  } else if (variant) {
    switch (variant) {
      case 'success':
        colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
        break;
      case 'warning':
        colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
        break;
      case 'danger':
        colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
        break;
      case 'info':
        colorClasses = 'bg-sky-50 text-sky-800 border-sky-200';
        break;
      case 'outline':
        colorClasses = 'bg-transparent text-slate-700 border-slate-300';
        break;
      case 'neutral':
        colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
        break;
      default:
        colorClasses = 'bg-emerald-100 text-emerald-900 border-emerald-200';
    }
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${sizeClasses} ${colorClasses} ${className}`}
    >
      {children}
    </span>
  );
};
