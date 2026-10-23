import React from 'react';

interface ConfidenceMeterProps {
  confidence: number; // 0 to 1
  label?: string;
  showPercent?: boolean;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  confidence,
  label = 'AI Confidence',
  showPercent = true,
}) => {
  const percentage = Math.round(confidence * 100);

  let barColor = 'bg-emerald-500';
  let textColor = 'text-emerald-700';

  if (percentage < 70) {
    barColor = 'bg-amber-500';
    textColor = 'text-amber-700';
  } else if (percentage < 85) {
    barColor = 'bg-teal-500';
    textColor = 'text-teal-700';
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-slate-600 font-medium">{label}</span>
        {showPercent && (
          <span className={`font-semibold ${textColor}`}>
            {percentage}%
            {percentage < 75 && (
              <span className="text-[10px] text-amber-600 ml-1 font-normal">
                (Manual check suggested)
              </span>
            )}
          </span>
        )}
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-500 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
