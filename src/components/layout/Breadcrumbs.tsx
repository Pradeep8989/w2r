import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
  customer: 'Customer Portal',
  scan: 'AI Waste Scan',
  analysis: 'Analysis Results',
  recovery: 'Recovery Route',
  listings: 'Waste Listings',
  new: 'Create Listing',
  'collection-points': 'Drop-off Points',
  rewards: 'Rewards & Leaderboard',
  impact: 'Environmental Impact',
  recycler: 'Recycler Hub',
  requests: 'Incoming Requests',
  pickups: 'Pickup Schedule',
  verification: 'Weight Verification',
  admin: 'Admin Console',
  materials: 'Materials & Pricing',
  recyclers: 'Recycler Partners',
  evaluation: 'AI Model Evaluation',
  methodology: 'Methodology & Factors',
};

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center text-xs text-slate-500 mb-4 overflow-x-auto whitespace-nowrap py-1">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-[#166534] transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Home</span>
      </Link>

      {pathnames.map((segment, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const label = ROUTE_LABELS[segment] || (segment.startsWith('WTR-') ? segment : segment);

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 mx-1.5 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-slate-800">{label}</span>
            ) : (
              <Link to={to} className="hover:text-[#166534] transition-colors">
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
