import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Inbox,
  Truck,
  Scale,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Building2,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { MaterialTag } from '../../components/waste/MaterialTag';
import { storageService } from '../../services/storageService';
import { WasteListing, RecyclerPartner } from '../../types';

export const RecyclerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [recyclers, setRecyclers] = useState<RecyclerPartner[]>([]);
  const [selectedRecyclerId, setSelectedRecyclerId] = useState<string>('rec_ecocycle');

  const loadData = () => {
    setListings(storageService.getListings());
    setRecyclers(storageService.getRecyclers());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('wtr_data_changed', handleUpdate);
    return () => window.removeEventListener('wtr_data_changed', handleUpdate);
  }, []);

  const activeRecycler = recyclers.find((r) => r.id === selectedRecyclerId) || recyclers[0];

  // Counts
  const newRequests = listings.filter((l) => l.status === 'awaiting_recycler');
  const acceptedListings = listings.filter((l) => l.status === 'recycler_accepted');
  const scheduledPickups = listings.filter((l) => l.status === 'pickup_scheduled');
  const awaitingVerification = listings.filter((l) => l.status === 'collected');
  const verifiedListings = listings.filter(
    (l) => l.status === 'weight_verified' || l.status === 'recovery_confirmed'
  );

  const totalVerifiedKg = verifiedListings.reduce(
    (acc, l) => acc + (l.verifiedWeightKg || 0),
    0
  );

  const currentUser = storageService.getCurrentUser();
  const displayName = currentUser?.role === 'recycler' && currentUser?.name ? currentUser.name : activeRecycler?.name;

  return (
    <div className="space-y-6">
      {/* Top Partner Context Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{displayName}</h1>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full uppercase">
                Collection Partner
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Service Area: {activeRecycler?.serviceArea} &bull; Rating: ★ {activeRecycler?.rating} ({activeRecycler?.reviewsCount} reviews)
            </p>
          </div>
        </div>

        {/* Demo Partner Switcher Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Switch Partner Profile:</span>
          <select
            value={selectedRecyclerId}
            onChange={(e) => setSelectedRecyclerId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {recyclers.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          className="p-5 cursor-pointer hover:border-amber-300 transition-all"
          onClick={() => navigate('/recycler/requests')}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>New Broadcasted Requests</span>
            <Inbox className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600">{newRequests.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting recycler acceptance</p>
        </Card>

        <Card
          className="p-5 cursor-pointer hover:border-blue-300 transition-all"
          onClick={() => navigate('/recycler/pickups')}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Upcoming Pickups</span>
            <Truck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-extrabold text-blue-700">{scheduledPickups.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Scheduled for driver route</p>
        </Card>

        <Card
          className="p-5 cursor-pointer hover:border-purple-300 transition-all"
          onClick={() => navigate('/recycler/pickups')}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Awaiting Scale Weighing</span>
            <Scale className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-extrabold text-purple-700">
            {awaitingVerification.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Collected, at facility</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Verified Recovered</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-[#166534]">
            {totalVerifiedKg.toFixed(1)} <span className="text-xs font-semibold text-slate-500">kg</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Scale certified circular material</p>
        </Card>
      </div>

      {/* Immediate Attention: Materials Awaiting Verification */}
      {awaitingVerification.length > 0 && (
        <Card className="p-5 border-l-4 border-l-purple-600 bg-purple-50/20">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-purple-700" />
                Action Required: Materials Collected Awaiting Facility Weighment
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Driver marked these items collected. Weigh on certified scales to confirm points for customer.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {awaitingVerification.map((l) => (
              <div
                key={l.id}
                className="p-3.5 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">{l.title}</span>
                    <span className="text-[11px] text-slate-400 font-mono">({l.id})</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Customer: {l.customerName} &bull; Estimated: ~
                    {l.materials.reduce((a, b) => a + b.estimatedQuantity, 0)} kg
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => navigate(`/recycler/verification/${l.id}`)}
                  leftIcon={<Scale className="w-3.5 h-3.5" />}
                >
                  Enter Scale Weights
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Incoming Requests Overview */}
      <Card>
        <CardHeader
          title="Broadcasted Collection Requests"
          subtitle="New resident listings in your service perimeter"
          action={
            <Link to="/recycler/requests">
              <Button size="sm" variant="ghost" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                View All ({newRequests.length})
              </Button>
            </Link>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3">Listing</th>
                <th className="px-5 py-3">Material Stream</th>
                <th className="px-5 py-3">Est. Weight</th>
                <th className="px-5 py-3">Locality</th>
                <th className="px-5 py-3">Requested Window</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {newRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    No new pending requests right now.
                  </td>
                </tr>
              ) : (
                newRequests.slice(0, 4).map((listing) => (
                  <tr key={listing.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{listing.title}</td>
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
                    <td className="px-5 py-3.5 font-semibold text-slate-800">
                      ~{listing.materials.reduce((a, b) => a + b.estimatedQuantity, 0)} kg
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{listing.locality}</td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {listing.preferredPickupWindow || 'Flexible daylight window'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate(`/recycler/requests/${listing.id}`)}
                      >
                        Inspect Request
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
