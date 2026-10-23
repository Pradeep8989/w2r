import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Scan,
  MapPin,
  Package,
  Award,
  Leaf,
  ArrowRight,
  Truck,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { MaterialTag } from '../../components/waste/MaterialTag';
import { storageService } from '../../services/storageService';
import { impactService } from '../../services/impactService';
import { WasteListing, CommunityChallenge } from '../../types';

export const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [challenge, setChallenge] = useState<CommunityChallenge | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);

  const loadData = () => {
    setListings(storageService.getListings());
    setChallenge(storageService.getCommunityChallenge());
    setTotalPoints(storageService.getTotalPoints());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('wtr_data_changed', handleUpdate);
    return () => window.removeEventListener('wtr_data_changed', handleUpdate);
  }, []);

  const impact = impactService.calculateImpact('usr_sarah');

  // Find active pickup (either scheduled or in-transit)
  const activePickup = listings.find((l) =>
    ['pickup_scheduled', 'collected'].includes(l.status)
  );

  const recentListings = listings.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Welcome & Primary Actions Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-[#166534] to-[#14532d] text-white p-6 sm:p-8 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Effortless Circular Recovery Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, Sarah! 👋
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-2 leading-relaxed">
            Ready to divert more waste today? Scan any item with our AI detector to discover its
            recovery route, estimated material value, and partner collection options.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Link to="/customer/scan">
              <Button
                variant="accent"
                size="md"
                leftIcon={<Scan className="w-4 h-4 text-white" />}
                className="font-bold shadow-md hover:shadow-lg"
              >
                Scan Waste Now
              </Button>
            </Link>
            <Link to="/customer/collection-points">
              <Button
                variant="outline"
                size="md"
                leftIcon={<MapPin className="w-4 h-4 text-white" />}
                className="bg-emerald-800/60 hover:bg-emerald-800 text-white border-emerald-700/80"
              >
                Find Drop-off Point
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative background element */}
        <div className="absolute right-[-40px] top-[-40px] w-64 h-64 bg-emerald-700/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#166534] flex items-center justify-center shrink-0">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Recovered Material</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {impact.totalVerifiedRecoveredKg} <span className="text-xs font-semibold text-slate-500">kg</span>
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Scale-verified weight</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Verified Collections</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {impact.verifiedCollectionsCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Closed loop recoveries</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Resource Points</div>
            <div className="text-2xl font-extrabold text-amber-600 mt-0.5">
              {totalPoints} <span className="text-xs font-semibold text-slate-500">pts</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Non-cash reward balance</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">CO2e Emissions Saved</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {impact.totalCo2eAvoidedKg} <span className="text-xs font-semibold text-slate-500">kg</span>
            </div>
            <div className="text-[10px] text-teal-600 font-semibold mt-0.5">EPA WARM formula</div>
          </div>
        </Card>
      </div>

      {/* Active Pickup & Community Goal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Pickup Alert / Card */}
        <div className="lg:col-span-7">
          <Card className="h-full">
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-700" />
                  <span>Current Active Pickup</span>
                </div>
              }
              action={
                activePickup ? (
                  <Badge status={activePickup.status}>
                    {activePickup.status === 'pickup_scheduled' ? 'Scheduled' : 'In-Transit'}
                  </Badge>
                ) : (
                  <span className="text-xs text-slate-400">No pickup in transit</span>
                )
              }
            />
            <CardContent>
              {activePickup ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{activePickup.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Partner: <span className="font-semibold text-slate-800">{activePickup.recyclerName}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Collection Window: <span className="font-semibold text-emerald-800">{activePickup.preferredPickupWindow}</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs text-slate-400 block">Est. Value</span>
                      <span className="text-sm font-bold text-slate-800">
                        ${activePickup.estimatedValueMin.toFixed(2)} - ${activePickup.estimatedValueMax.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500">
                      ID: <span className="font-mono font-medium">{activePickup.id}</span>
                    </span>
                    <Link
                      to={`/customer/listings/${activePickup.id}`}
                      className="text-[#166534] hover:text-[#14532d] font-semibold flex items-center gap-1 group"
                    >
                      <span>Track Live Status Timeline</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-500">
                  <p>You have no scheduled pickups right now.</p>
                  <Link to="/customer/scan" className="mt-2 inline-block">
                    <Button size="sm" variant="secondary">
                      Create New Waste Listing
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Community Goal Progress */}
        <div className="lg:col-span-5">
          <Card className="h-full">
            <CardHeader
              title="Community Recovery Goal"
              subtitle="Oct 2026 Neighborhood Drive"
              action={
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {challenge ? `${challenge.daysRemaining} days left` : 'Active'}
                </span>
              }
            />
            <CardContent>
              {challenge && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 leading-snug">
                    {challenge.title}
                  </h4>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                      <span className="text-slate-600">
                        {challenge.currentKg.toLocaleString()} kg recovered
                      </span>
                      <span className="text-emerald-700 font-bold">
                        {Math.round((challenge.currentKg / challenge.targetKg) * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#166534] to-[#22c55e] rounded-full transition-all duration-500"
                        style={{
                          width: `${(challenge.currentKg / challenge.targetKg) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                      <span>Target: {challenge.targetKg.toLocaleString()} kg</span>
                      <span>{challenge.participantsCount} Neighbors Joined</span>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs">
                    <span className="font-semibold text-emerald-900 block mb-0.5">
                      Sponsor Reward:
                    </span>
                    <span className="text-slate-600 text-[11px]">
                      {challenge.sponsorReward}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Waste Listings Table */}
      <Card>
        <CardHeader
          title="Recent Waste Listings"
          subtitle="Real-time status updates from our verified collection network"
          action={
            <Link to="/customer/listings">
              <Button size="sm" variant="ghost" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                View All
              </Button>
            </Link>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Listing</th>
                <th className="px-5 py-3">Materials</th>
                <th className="px-5 py-3">Est. Weight</th>
                <th className="px-5 py-3">Indicative Value</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentListings.map((listing) => (
                <tr key={listing.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-slate-900">{listing.title}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{listing.id}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {listing.materials.map((m, i) => (
                        <MaterialTag
                          key={i}
                          categoryId={m.categoryId}
                          categoryName={m.categoryName}
                          size="sm"
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-700">
                    {listing.verifiedWeightKg ? (
                      <span className="text-emerald-700 font-bold">
                        {listing.verifiedWeightKg} kg (verified)
                      </span>
                    ) : (
                      <span>
                        ~{listing.materials.reduce((a, b) => a + b.estimatedQuantity, 0)} kg
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-800">
                    {listing.finalIndicativeValue ? (
                      <span className="font-bold text-emerald-700">
                        ${listing.finalIndicativeValue.toFixed(2)}
                      </span>
                    ) : (
                      <span>
                        ${listing.estimatedValueMin.toFixed(2)} - ${listing.estimatedValueMax.toFixed(2)}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge status={listing.status}>
                      {listing.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/customer/listings/${listing.id}`)}
                    >
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
