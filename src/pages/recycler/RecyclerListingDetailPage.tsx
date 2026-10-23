import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
  Truck,
  Scale,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { MaterialTag } from '../../components/waste/MaterialTag';
import { StatusTimeline } from '../../components/waste/StatusTimeline';
import { storageService } from '../../services/storageService';
import { listingService } from '../../services/listingService';
import { recyclerService } from '../../services/recyclerService';
import { WasteListing, RecyclerPartner } from '../../types';
import { useToast } from '../../components/ui/Toast';

export const RecyclerListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [listing, setListing] = useState<WasteListing | null>(null);
  const [recyclers, setRecyclers] = useState<RecyclerPartner[]>([]);
  const [selectedWindow, setSelectedWindow] = useState('Tomorrow, 09:00 AM - 12:00 PM');

  const loadData = () => {
    if (id) {
      const item = storageService.getListingById(id);
      if (item) setListing(item);
    }
    setRecyclers(storageService.getRecyclers());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('wtr_data_changed', handleUpdate);
    return () => window.removeEventListener('wtr_data_changed', handleUpdate);
  }, [id]);

  if (!listing) {
    return (
      <div className="p-12 text-center text-slate-500">
        <h3 className="text-base font-bold text-slate-800">Listing not found</h3>
        <Link to="/recycler/requests">
          <Button size="sm" className="mt-3">
            Back to Requests
          </Button>
        </Link>
      </div>
    );
  }

  const activeRecycler = recyclers[0]; // EcoCycle Polymers
  const isCompatible = activeRecycler
    ? recyclerService.canRecyclerAcceptListing(activeRecycler, listing).canAccept
    : true;

  const handleAccept = () => {
    if (!activeRecycler) return;
    listingService.acceptByRecycler(listing.id, activeRecycler.id, activeRecycler.name);
    listingService.schedulePickup(listing.id, selectedWindow);
    showToast(`Listing ${listing.id} accepted and pickup scheduled!`, 'success');
    navigate('/recycler/pickups');
  };

  const handleDecline = () => {
    if (window.confirm('Are you sure you want to decline this request?')) {
      listingService.cancel(listing.id, `Declined by ${activeRecycler?.name}`, activeRecycler?.name);
      showToast(`Request ${listing.id} declined.`, 'info');
      navigate('/recycler/requests');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            to="/recycler/requests"
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
              Request ID: {listing.id} &bull; Resident: {listing.customerName}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Request Inspection Details */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-5 space-y-4">
            <div className="flex items-start gap-4">
              <img
                src={listing.photoUrl || '/samples/plastic_bottles.jpg'}
                alt={listing.title}
                className="w-28 h-28 rounded-2xl object-cover border border-slate-200 shrink-0"
              />
              <div className="space-y-1.5 flex-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Material Stream Details
                </span>
                <div className="flex flex-wrap gap-1">
                  {listing.materials.map((m, i) => (
                    <MaterialTag key={i} categoryId={m.categoryId} categoryName={m.categoryName} />
                  ))}
                </div>
                <div className="text-xs text-slate-700 pt-1">
                  Estimated Quantity:{' '}
                  <strong>~{listing.materials.reduce((a, b) => a + b.estimatedQuantity, 0)} kg</strong>
                </div>
                <div className="text-xs text-emerald-800 font-semibold">
                  Indicative Value: ${listing.estimatedValueMin.toFixed(2)} - ${listing.estimatedValueMax.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-slate-700">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  Address: <strong>{listing.customerAddress}, {listing.locality}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  Requested Window: <strong>{listing.preferredPickupWindow || 'Flexible'}</strong>
                </span>
              </div>
            </div>

            {listing.contaminationNotes && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                <span className="font-bold block mb-0.5">Customer Contamination Notes:</span>
                {listing.contaminationNotes}
              </div>
            )}

            {/* Accept / Schedule Pickup Form */}
            {listing.status === 'awaiting_recycler' && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Assign Vehicle Pickup Window
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Tomorrow, 09:00 AM - 12:00 PM',
                    'Tomorrow, 02:00 PM - 05:00 PM',
                    'Friday, 10:00 AM - 01:00 PM',
                  ].map((win) => (
                    <button
                      key={win}
                      type="button"
                      onClick={() => setSelectedWindow(win)}
                      className={`p-2.5 rounded-xl border text-xs text-left cursor-pointer transition-all ${
                        selectedWindow === win
                          ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold ring-1 ring-blue-500'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {win}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <Button size="sm" variant="outline" onClick={handleDecline}>
                    Decline Request
                  </Button>
                  <Button
                    size="md"
                    variant="primary"
                    disabled={!isCompatible}
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    onClick={handleAccept}
                  >
                    Accept &amp; Confirm Pickup
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Status Timeline */}
        <div className="lg:col-span-5">
          <Card className="p-5">
            <CardHeader
              title="Audit Timeline"
              subtitle="Material lifecycle tracking records"
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
