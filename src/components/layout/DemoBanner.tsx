import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useToast } from '../ui/Toast';

export const DemoBanner: React.FC = () => {
  const { showToast } = useToast();

  const handleReset = () => {
    if (window.confirm('Reset all demo data back to initial hackathon showcase state? Any created listings or edited rates will be restored to seed values.')) {
      storageService.resetDemoData();
      showToast('Demo data successfully restored to initial state!', 'success');
      window.location.reload();
    }
  };

  return (
    <div className="bg-emerald-950 text-emerald-100 text-xs px-3 py-1.5 flex items-center justify-between border-b border-emerald-900/60">
      <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
        <span className="flex items-center gap-1 font-semibold text-emerald-400 bg-emerald-900/80 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
          <AlertCircle className="w-3 h-3" />
          Demo Mode
        </span>
        <span className="text-emerald-300/80 hidden sm:inline">
          Illustrative prototype for hackathon evaluation. LocalStorage persistence &bull; AI model simulated.
        </span>
      </div>
      <button
        onClick={handleReset}
        className="flex items-center gap-1.5 text-emerald-300 hover:text-white bg-emerald-900/50 hover:bg-emerald-900 px-2 py-0.5 rounded-md transition-colors cursor-pointer text-xs"
        title="Reset demo listings and data to initial state"
      >
        <RotateCcw className="w-3 h-3" />
        <span className="hidden xs:inline">Reset Demo Data</span>
      </button>
    </div>
  );
};
