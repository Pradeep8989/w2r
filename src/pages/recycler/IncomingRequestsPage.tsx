import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Inbox,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  MapPin,
  Clock,
  Scale,
  ShieldAlert,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { MaterialTag } from '../../components/waste/MaterialTag';
import { EmptyState } from '../../components/ui/EmptyState';
import { storageService } from '../../services/storageService';
import { listingService } from '../../services/listingService';
import { recyclerService } from '../../services/recyclerService';
import { WasteListing, RecyclerPartner } from '../../types';
import { useToast } from '../../components/ui/Toast';

export const IncomingRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [listings, setListings] = useState<WasteListing[]>([]);
  const [recyclers, setRecyclers] = useState<RecyclerPartner[]>([]);
  const [activeRecyclerId, setActiveRecyclerId] = useState<string>('rec_ecocycle');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterialFilter, setSelectedMaterialFilter] = useState<string>('all');

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

  const activeRecycler = recyclers.find((r) => r.id === activeRecyclerId) || recyclers[0];

  const pendingRequests = listings.filter((l) => l.status === 'awaiting_recycler');

  const filteredRequests = pendingRequests.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.locality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMaterial =
      selectedMaterialFilter === 'all' ||
      item.materials.some((m) => m.categoryId === selectedMaterialFilter);

    return matchesSearch && matchesMaterial;
  });

  const handleAccept = (listing: WasteListing) => {
    if (!activeRecycler) return;

    const compat = recyclerService.canRecyclerAcceptListing(activeRecycler, listing);
    if (!compat.canAccept) {
      showToast(compat.reason || 'This partner does not accept this material stream.', 'error');
      return;
    }

    listingService.acceptByRecycler(listing.id, activeRecycler.id, activeRecycler.name);
    showToast(`Accepted ${listing.id}! Moving to pickup scheduling.`, 'success');

    setTimeout(() => {
      navigate('/recycler/pickups');
    }, 400);
  };

  const handleDecline = (listing: WasteListing) => {
    if (window.confirm(`Decline collection request for ${listing.id}?`)) {
      listingService.cancel(listing.id, `Declined by ${activeRecycler?.name}`, activeRecycler?.name);
      showToast(`Request ${listing.id} declined.`, 'info');
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Incoming Collection Requests
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Available resident listings broadcasted to your recovery facility network.
          </p>
        </div>

        {/* Recycler Profile Selector */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
          <span className="text-slate-500 font-medium">Viewing as:</span>
          <select
            value={activeRecyclerId}
            onChange={(e) => setActiveRecyclerId(e.target.value)}
            className="font-bold text-[#166534] bg-transparent focus:outline-none cursor-pointer"
          >
            {recyclers.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Accepted Materials Notification */}
      {activeRecycler && (
        <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Your Accepted Streams:</span>
            <div className="flex flex-wrap gap-1">
              {activeRecycler.acceptedMaterialIds.map((matId) => (
                <MaterialTag key={matId} categoryId={matId} categoryName={matId.replace('_', ' ')} size="sm" />
              ))}
            </div>
          </div>
          <span className="text-[11px] text-blue-700">
            Min. Pickup: {activeRecycler.minQuantityKg} kg
          </span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by ID, locality, or resident name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <select
          value={selectedMaterialFilter}
          onChange={(e) => setSelectedMaterialFilter(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700"
        >
          <option value="all">All Material Categories</option>
          <option value="pet_plastic">PET Plastic</option>
          <option value="cardboard">Cardboard</option>
          <option value="aluminum">Aluminum</option>
          <option value="glass">Glass</option>
          <option value="e_waste">E-Waste</option>
          <option value="organics">Organics</option>
        </select>
      </div>

      {/* Requests Grid */}
      {filteredRequests.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No incoming requests found"
          description="There are currently no resident listings waiting for recycler acceptance under these filter conditions."
        />
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const compat = activeRecycler
              ? recyclerService.canRecyclerAcceptListing(activeRecycler, req)
              : { canAccept: true, reason: undefined };

            const totalEstQty = req.materials.reduce((a, b) => a + b.estimatedQuantity, 0);

            return (
              <Card key={req.id} className="p-5 hover:border-blue-300 transition-all">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={req.photoUrl || '/samples/plastic_bottles.jpg'}
                      alt={req.title}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{req.title}</h4>
                        <span className="text-[11px] text-slate-400 font-mono">({req.id})</span>
                        <Badge status={req.status}>Awaiting Match</Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {req.locality} ({req.customerAddress})
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Requested: {req.preferredPickupWindow || 'Flexible'}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {req.materials.map((m, i) => (
                          <MaterialTag
                            key={i}
                            categoryId={m.categoryId}
                            categoryName={`${m.categoryName} (~${m.estimatedQuantity} kg)`}
                            size="sm"
                          />
                        ))}
                      </div>

                      {/* Contamination info */}
                      {req.contaminationNotes && (
                        <p className="text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 inline-block mt-1">
                          <strong>Condition:</strong> {req.contaminationNotes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Metrics */}
                  <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-right sm:mr-4">
                      <span className="text-[10px] text-slate-400 block uppercase">
                        Est. Weight / Value
                      </span>
                      <span className="text-sm font-bold text-slate-900 block">
                        ~{totalEstQty} kg
                      </span>
                      <span className="text-xs text-emerald-800 font-semibold">
                        ${req.estimatedValueMin.toFixed(2)} - ${req.estimatedValueMax.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => navigate(`/recycler/requests/${req.id}`)}
                      >
                        Inspect
                      </Button>

                      <Button
                        size="sm"
                        variant="primary"
                        disabled={!compat.canAccept}
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        onClick={() => handleAccept(req)}
                      >
                        Accept Request
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        onClick={() => handleDecline(req)}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>

                {!compat.canAccept && (
                  <div className="mt-3 p-2 bg-rose-50 border border-rose-200 text-rose-800 text-[11px] rounded-lg flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Incompatible with current partner: {compat.reason}</span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
