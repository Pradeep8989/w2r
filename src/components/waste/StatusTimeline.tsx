import React from 'react';
import { TimelineEvent, WasteListingStatus } from '../../types';
import { CheckCircle2, Clock, Truck, Scale, ShieldCheck, XCircle, FileEdit, UserCheck } from 'lucide-react';

interface StatusTimelineProps {
  timeline: TimelineEvent[];
  currentStatus: WasteListingStatus;
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ timeline, currentStatus }) => {
  const getIcon = (status: WasteListingStatus) => {
    switch (status) {
      case 'draft':
        return <FileEdit className="w-4 h-4 text-slate-500" />;
      case 'awaiting_recycler':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'recycler_accepted':
        return <UserCheck className="w-4 h-4 text-blue-500" />;
      case 'pickup_scheduled':
        return <Truck className="w-4 h-4 text-indigo-500" />;
      case 'collected':
        return <Truck className="w-4 h-4 text-purple-500" />;
      case 'weight_verified':
        return <Scale className="w-4 h-4 text-teal-600" />;
      case 'recovery_confirmed':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-rose-500" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-slate-400" />;
    }
  };

  const getBorderColor = (status: WasteListingStatus) => {
    switch (status) {
      case 'recovery_confirmed':
        return 'border-emerald-500 bg-emerald-50';
      case 'weight_verified':
        return 'border-teal-500 bg-teal-50';
      case 'collected':
        return 'border-purple-500 bg-purple-50';
      case 'pickup_scheduled':
        return 'border-indigo-500 bg-indigo-50';
      case 'recycler_accepted':
        return 'border-blue-500 bg-blue-50';
      case 'awaiting_recycler':
        return 'border-amber-400 bg-amber-50';
      case 'cancelled':
        return 'border-rose-400 bg-rose-50';
      default:
        return 'border-slate-300 bg-slate-50';
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
      {timeline.map((event, idx) => {
        const isCurrent = event.status === currentStatus;
        return (
          <div key={idx} className="relative flex items-start group">
            {/* Timeline node */}
            <div
              className={`absolute -left-[24px] top-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white shadow-xs ${getBorderColor(
                event.status
              )} ${isCurrent ? 'ring-2 ring-emerald-400/50 scale-110' : ''}`}
            >
              {getIcon(event.status)}
            </div>

            {/* Event detail */}
            <div className="flex-1 ml-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={`text-sm font-semibold ${isCurrent ? 'text-emerald-900' : 'text-slate-800'}`}>
                  {event.label}
                </span>
                <span className="text-xs text-slate-400">{formatDate(event.timestamp)}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">By {event.actor}</p>
              {event.notes && (
                <div className="mt-1.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700">
                  {event.notes}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
