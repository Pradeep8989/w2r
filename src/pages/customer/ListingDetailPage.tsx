import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Package,
  Calendar,
  MapPin,
  Truck,
  Scale,
  Award,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Info,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatusTimeline } from '../../components/waste/StatusTimeline';
import { MaterialTag } from '../../components/waste/MaterialTag';
import { storageService } from '../../services/storageService';
import { listingService } from '../../services/listingService';
import { WasteListing } from '../../types';
import { useToast } from '../../components/ui/Toast';

export const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [listing, setListing] = useState<WasteListing | null>(null);

  const loadListing = () => {
    if (id) {
      const item = storageService.getListingById(id);
      if (item) setListing(item);
    }
  };

  useEffect(() => {
    loadListing();
    const handleUpdate = () => loadListing();
    window.addEventListener('wtr_data_changed', handleUpdate);
    return () => window.removeEventListener('wtr_data_changed', handleUpdate);
  }, [id]);

  if (!listing) {
    return (
      <div className="p-12 text-center text-slate-500">
        <Package className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-800">Listing not found</h3>
        <p className="text-xs text-slate-400 mt-1 mb-4">
          The requested listing ID ({id}) could not be retrieved from local storage.
        </p>
        <Link to="/customer/listings">
          <Button size="sm">Back to Listings</Button>
        </Link>
      </div>
    );
  }

  const currentUser = storageService.getCurrentUser();

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this listing?')) {
      listingService.cancel(listing.id, 'Cancelled by customer', currentUser?.name || 'Customer');
      showToast('Listing marked as cancelled', 'info');
      loadListing();
    }
  };

  const handlePublishDraft = () => {
    listing.status = 'awaiting_recycler';
    listing.statusTimeline.push({
      status: 'awaiting_recycler',
      label: 'Listing Published',
      timestamp: new Date().toISOString(),
      actor: currentUser?.name || 'Customer',
      notes: 'Published to certified recycler network.',
    });
    storageService.updateListing(listing);
    showToast('Listing submitted to recyclers!', 'success');
    loadListing();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            to="/customer/listings"
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {listing.title}
              </h1>
              <Badge status={listing.status}>{listing.status.replace(/_/g, ' ')}</Badge>
            </div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">
              ID: {listing.id} &bull; Created {new Date(listing.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        {listing.status === 'draft' && (
          <Button size="sm" variant="accent" onClick={handlePublishDraft}>
            Publish Listing
          </Button>
        )}
      </div>

      {/* Completion Trophy Card */}
      {listing.status === 'recovery_confirmed' && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900 to-[#166534] text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-800 text-emerald-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Circular Recovery Complete
            </span>
            <h3 className="text-xl font-extrabold tracking-tight">
              Material Certified &amp; Points Awarded!
            </h3>
            <p className="text-xs text-emerald-100/90 max-w-xl">
              Certified scale weighmaster recorded {listing.verifiedWeightKg} kg of recovered material.
              Your account has been credited with {listing.rewardPointsEarned} Resource Points.
            </p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-3xl font-black text-amber-300">
              +{listing.rewardPointsEarned} pts
            </div>
            <Link to="/customer/rewards" className="text-xs text-emerald-200 underline mt-1 block">
              View Rewards Wallet &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Main Grid: Details & Live Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Listing Details */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-5 space-y-4">
            <div className="flex items-start gap-4">
              <img
                src={listing.photoUrl || '/samples/plastic_bottles.jpg'}
                alt={listing.title}
                className="w-24 h-24 rounded-2xl object-cover border border-slate-200 shrink-0"
              />
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Material Stream
                </span>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {listing.materials.map((m, i) => (
                    <MaterialTag key={i} categoryId={m.categoryId} categoryName={m.categoryName} />
                  ))}
                </div>
                <p className="text-xs text-slate-600 pt-1">
                  <strong>Contamination Note:</strong> {listing.contaminationNotes || 'Clean and unsoiled.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Weight</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {listing.verifiedWeightKg
                    ? `${listing.verifiedWeightKg} kg (verified)`
                    : `~${listing.materials.reduce((a, b) => a + b.estimatedQuantity, 0)} kg (est.)`}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Indicative Value</span>
                <span className="font-bold text-emerald-800 text-sm mt-0.5 block">
                  {listing.finalIndicativeValue
                    ? `$${listing.finalIndicativeValue.toFixed(2)}`
                    : `$${listing.estimatedValueMin.toFixed(2)} - $${listing.estimatedValueMax.toFixed(2)}`}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Assigned Partner</span>
                <span className="font-bold text-slate-900 text-xs mt-0.5 block truncate">
                  {listing.recyclerName || 'Matching partner...'}
                </span>
              </div>
            </div>

            {/* Address & Window Information */}
            <div className="pt-2 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  Pickup Address: <strong>{listing.customerAddress}, {listing.locality}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  Window:{' '}
                  <strong>
                    {listing.preferredPickupWindow || 'Standard daylight window (09:00 AM - 05:00 PM)'}
                  </strong>
                </span>
              </div>
              {listing.notes && (
                <div className="p-3 rounded-xl bg-slate-50 text-slate-700 mt-2">
                  <span className="font-semibold block text-slate-900">Driver Notes:</span>
                  {listing.notes}
                </div>
              )}
            </div>

            {/* Status-specific actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              {listing.status === 'draft' && (
                <Button size="sm" variant="primary" onClick={handlePublishDraft}>
                  Submit Listing to Recycler Network
                </Button>
              )}

              {listing.status === 'awaiting_recycler' && (
                <Button size="sm" variant="danger" onClick={handleCancel}>
                  Cancel Listing
                </Button>
              )}

              {listing.status === 'recovery_confirmed' && (
                <Link to="/customer/impact">
                  <Button size="sm" variant="secondary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    View Impact Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </Card>

          {/* Verification Details Card (if verified) */}
          {(listing.status === 'weight_verified' || listing.status === 'recovery_confirmed') && (
            <Card className="p-5 border-l-4 border-l-teal-600 space-y-3">
              <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-700" /> Certified Weighment &amp; Recovery Certificate
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Gross Verified Weight:</span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {listing.verifiedWeightKg} kg
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Rejected / Contaminated:</span>
                  <span className="font-semibold text-slate-700 text-sm">
                    {listing.rejectedWeightKg || 0} kg
                  </span>
                </div>
              </div>
              {listing.recoveryOutcome && (
                <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 text-xs text-teal-900">
                  <span className="font-bold block mb-0.5">Circular Reprocessing Outcome:</span>
                  {listing.recoveryOutcome}
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Right Column: Live Status Timeline */}
        <div className="lg:col-span-5">
          <Card className="p-5">
            <CardHeader
              title="Verified Status Timeline"
              subtitle="Step-by-step audit trail of material custody"
            />
            <CardContent>
              <StatusTimeline
                timeline={listing.statusTimeline}
                currentStatus={listing.status}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
