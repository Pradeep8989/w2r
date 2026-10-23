import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { MaterialTag } from '../../components/waste/MaterialTag';
import { storageService } from '../../services/storageService';
import { recyclerService } from '../../services/recyclerService';
import { RecyclerPartner, CollectionPoint } from '../../types';
import { WasteAnalysisResult } from '../../services/mockAnalysis';
import { useToast } from '../../components/ui/Toast';

export const RecoveryOptionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'pickup' | 'dropoff'>('pickup');
  const [analysis, setAnalysis] = useState<WasteAnalysisResult | null>(null);
  const [estimatedQuantity, setEstimatedQuantity] = useState<number>(3.5);
  const [selectedPartner, setSelectedPartner] = useState<RecyclerPartner | null>(null);
  const [selectedWindow, setSelectedWindow] = useState<string>('');

  useEffect(() => {
    const raw = sessionStorage.getItem('wtr_recovery_state');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setAnalysis(parsed.analysis);
        setEstimatedQuantity(parsed.estimatedQuantity || 3.5);
      } catch {
        // ignore
      }
    }
  }, []);

  const materialIds = analysis ? analysis.materials.map((m) => m.categoryId) : ['pet_plastic'];
  const allPartners = storageService.getRecyclers();
  const collectionPoints = storageService.getCollectionPoints();

  const handleSelectPartner = (partner: RecyclerPartner) => {
    setSelectedPartner(partner);
    setSelectedWindow(partner.availableWindows[0] || partner.nextPickupSlot);
  };

  const handleProceedToCreateListing = () => {
    if (activeTab === 'pickup' && !selectedPartner) {
      showToast('Please select a collection partner first.', 'error');
      return;
    }

    // Persist choice for listing creation form
    sessionStorage.setItem(
      'wtr_listing_draft',
      JSON.stringify({
        analysis,
        estimatedQuantity,
        preference: activeTab,
        partnerId: selectedPartner?.id,
        partnerName: selectedPartner?.name,
        pickupWindow: selectedWindow,
      })
    );

    navigate('/customer/listings/new');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title & Navigation */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Select Material Recovery Route
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Choose whether you prefer doorstep collection by a certified recycler or dropping off at a nearby community smart bin.
        </p>
      </div>

      {/* Honest Demo Disclaimer */}
      <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-slate-700 text-xs flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
        <span>
          <strong>Simulated Partner Network:</strong> Partners and drop-off depots are simulated for demonstration purposes. Distances and pickup windows are illustrative.
        </span>
      </div>

      {/* Route Switcher Tabs */}
      <div className="flex bg-slate-200/80 p-1 rounded-2xl max-w-md">
        <button
          onClick={() => setActiveTab('pickup')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'pickup'
              ? 'bg-white text-[#166534] shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Doorstep Partner Collection</span>
        </button>
        <button
          onClick={() => setActiveTab('dropoff')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'dropoff'
              ? 'bg-white text-[#166534] shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Community Drop-off Point</span>
        </button>
      </div>

      {/* Content for Pickup Mode */}
      {activeTab === 'pickup' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Showing verified recovery partners accepting your detected materials</span>
            <span className="font-semibold text-slate-800">{allPartners.length} Available Partners</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allPartners.map((partner) => {
              const isCompatible = materialIds.some((id) =>
                partner.acceptedMaterialIds.includes(id)
              );
              const isSelected = selectedPartner?.id === partner.id;

              return (
                <div
                  key={partner.id}
                  onClick={() => handleSelectPartner(partner)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-50/70 border-[#166534] ring-2 ring-emerald-500/30 shadow-md'
                      : 'bg-white border-slate-200/90 hover:border-emerald-300 hover:shadow-xs'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{partner.name}</h4>
                          <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                            Simulated Partner
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{partner.facilityType}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-800 block">
                          ~{partner.distanceKm} km
                        </span>
                        <span className="text-[10px] text-slate-400">service radius</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          Next window: <strong>{partner.nextPickupSlot}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Min. Batch: {partner.minQuantityKg} kg (You have ~{estimatedQuantity} kg)</span>
                      </div>
                    </div>

                    {/* Accepted materials */}
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                        Accepted Materials
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {partner.acceptedMaterialIds.map((matId) => (
                          <MaterialTag key={matId} categoryId={matId} categoryName={matId.replace('_', ' ')} size="sm" />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">{partner.indicativePricingNote}</span>
                    <span className={`font-bold flex items-center gap-1 ${isSelected ? 'text-[#166534]' : 'text-slate-400'}`}>
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Selected
                        </>
                      ) : (
                        'Select Partner'
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Window Picker */}
          {selectedPartner && (
            <Card className="p-5 bg-emerald-50/50 border border-emerald-200">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#166534]" />
                Select Preferred Collection Window with {selectedPartner.name}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {selectedPartner.availableWindows.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedWindow(slot)}
                    className={`p-3 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                      selectedWindow === slot
                        ? 'bg-white border-[#166534] ring-2 ring-emerald-500/20 text-[#166534] font-bold'
                        : 'bg-white/80 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>
      ) : (
        /* Drop-off Point Mode */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Find automated smart chute or drop-off bins near you</span>
            <Link to="/customer/collection-points" className="text-[#166534] font-semibold hover:underline">
              View Map Directory &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collectionPoints.map((cp) => (
              <Card key={cp.id} className="p-5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{cp.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{cp.address}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ~{cp.distanceKm} km
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <strong>Instructions:</strong> {cp.dropoffInstructions}
                  </p>

                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{cp.openingHours}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Managed by {cp.managedBy}</span>
                  <Link to="/customer/collection-points">
                    <Button size="sm" variant="outline">
                      View Depot Info
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="text-xs text-slate-600 text-center sm:text-left">
          {activeTab === 'pickup' && selectedPartner ? (
            <span>
              Selected Partner: <strong>{selectedPartner.name}</strong> ({selectedWindow})
            </span>
          ) : (
            <span>Proceed to fill in collection address and publish your listing</span>
          )}
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            size="md"
            variant="primary"
            onClick={handleProceedToCreateListing}
            className="w-full sm:w-auto"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Create Waste Listing
          </Button>
        </div>
      </div>
    </div>
  );
};
