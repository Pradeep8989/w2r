import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Scale,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Building2,
  Layers,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { MaterialTag } from '../../components/waste/MaterialTag';
import { storageService } from '../../services/storageService';
import { listingService } from '../../services/listingService';
import { WasteListing, MaterialCategory } from '../../types';
import { useToast } from '../../components/ui/Toast';
import confetti from 'canvas-confetti';

export const WeightVerificationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [listing, setListing] = useState<WasteListing | null>(null);
  const [materials, setMaterials] = useState<MaterialCategory[]>([]);

  // Form states
  const [verifiedWeight, setVerifiedWeight] = useState<number>(5.5);
  const [rejectedWeight, setRejectedWeight] = useState<number>(0.0);
  const [recoveryRoute, setRecoveryRoute] = useState('Mechanical Pelletizing Line 2 (Bottle-to-Bottle)');
  const [weighmasterNotes, setWeighmasterNotes] = useState('Grade A clean stream. Passed optical sorter with zero residual liquid.');
  const [weighmasterName, setWeighmasterName] = useState('Chief Weighmaster Robert');
  const [isConfirmed, setIsConfirmed] = useState(false);

  const loadData = () => {
    if (id) {
      const item = storageService.getListingById(id);
      if (item) {
        setListing(item);
        if (item.verifiedWeightKg) setVerifiedWeight(item.verifiedWeightKg);
        if (item.rejectedWeightKg) setRejectedWeight(item.rejectedWeightKg);
        if (item.status === 'recovery_confirmed') setIsConfirmed(true);
      }
    }
    setMaterials(storageService.getMaterials());
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
        <Link to="/recycler/pickups">
          <Button size="sm" className="mt-3">
            Back to Pickups
          </Button>
        </Link>
      </div>
    );
  }

  // Calculate final indicative value from active configured material rates
  const primaryMat = listing.materials[0];
  const cat = materials.find((m) => m.id === primaryMat?.categoryId);
  const avgRate = cat ? (cat.ratePerKgMin + cat.ratePerKgMax) / 2 : 0.25;
  const computedValue = Math.round(verifiedWeight * avgRate * 100) / 100;
  const pointsToAward = Math.round(verifiedWeight * 20);

  const handleConfirmVerificationAndRecovery = () => {
    if (verifiedWeight <= 0) {
      showToast('Verified weight must be greater than 0 kg.', 'error');
      return;
    }

    if (rejectedWeight < 0) {
      showToast('Rejected weight cannot be negative.', 'error');
      return;
    }

    // Step 1: Record weight verification
    listingService.verifyWeight(
      listing.id,
      verifiedWeight,
      rejectedWeight,
      recoveryRoute,
      weighmasterName,
      weighmasterNotes
    );

    // Step 2: Confirm recovery & credit customer reward points
    listingService.confirmRecovery(listing.id, `${listing.recyclerName || 'EcoCycle'} Quality Operations`);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    setIsConfirmed(true);
    showToast(
      `Recovery verified! +${pointsToAward} Resource Points credited to ${listing.customerName}.`,
      'success'
    );
    loadData();
  };

  const handleSwitchToCustomer = () => {
    storageService.setCurrentRole('customer');
    showToast('Switched back to Customer view to inspect points & timeline', 'info');
    navigate(`/customer/listings/${listing.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Facility Weighment &amp; Quality Certification
            </h1>
            <Badge status={listing.status}>{listing.status.replace(/_/g, ' ')}</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Listing: <strong>{listing.id}</strong> &bull; Customer: {listing.customerName} &bull; Received from route driver
          </p>
        </div>

        {isConfirmed && (
          <Button
            size="sm"
            variant="accent"
            leftIcon={<Sparkles className="w-4 h-4" />}
            onClick={handleSwitchToCustomer}
          >
            Demo: Switch to Customer View &rarr;
          </Button>
        )}
      </div>

      {/* Completion Banner */}
      {isConfirmed && (
        <div className="p-6 rounded-3xl bg-emerald-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Weighment Certified &amp; Loop Closed
            </span>
            <h3 className="text-xl font-bold">Material Successfully Recovered</h3>
            <p className="text-xs text-emerald-100/90 max-w-lg">
              {verifiedWeight} kg of verified {primaryMat?.categoryName || 'material'} has been routed to{' '}
              {recoveryRoute}. Customer has received +{pointsToAward} Resource Points.
            </p>
          </div>
          <Button size="md" variant="secondary" onClick={handleSwitchToCustomer}>
            View Customer Result &rarr;
          </Button>
        </div>
      )}

      {/* Main Form Card */}
      <Card className="p-6 space-y-6">
        {/* Listing Context Banner */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-800 text-sm block">{listing.title}</span>
            <span className="text-slate-500 mt-0.5 block">
              Initial Resident Estimated Weight: ~
              {listing.materials.reduce((a, b) => a + b.estimatedQuantity, 0)} kg
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {listing.materials.map((m, i) => (
              <MaterialTag key={i} categoryId={m.categoryId} categoryName={m.categoryName} />
            ))}
          </div>
        </div>

        {/* Weights Entry */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
            <label className="text-xs font-bold text-[#166534] uppercase tracking-wider block flex items-center justify-between">
              <span>Certified Scale Weight (kg) *</span>
              <Scale className="w-4 h-4 text-emerald-700" />
            </label>
            <input
              type="number"
              step="0.05"
              min="0.1"
              disabled={isConfirmed}
              value={verifiedWeight}
              onChange={(e) => setVerifiedWeight(parseFloat(e.target.value) || 0)}
              className="w-full text-2xl font-black text-slate-900 bg-white p-3 rounded-xl border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <span className="text-[11px] text-emerald-800 font-medium block">
              Gross accepted weight on certified digital platform scale.
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block flex items-center justify-between">
              <span>Rejected / Contaminated (kg)</span>
              <AlertCircle className="w-4 h-4 text-slate-400" />
            </label>
            <input
              type="number"
              step="0.05"
              min="0"
              disabled={isConfirmed}
              value={rejectedWeight}
              onChange={(e) => setRejectedWeight(parseFloat(e.target.value) || 0)}
              className="w-full text-2xl font-black text-slate-900 bg-white p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <span className="text-[11px] text-slate-500 font-medium block">
              Unrecyclable debris, liquid residue, or non-target resins.
            </span>
          </div>
        </div>

        {/* Calculated Indicative Valuation */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold block">
              Calculated Indicative Material Value
            </span>
            <div className="text-3xl font-extrabold text-emerald-400 mt-1">
              ${computedValue.toFixed(2)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Derived from configured demo rate (~${avgRate.toFixed(2)}/kg) &times; {verifiedWeight} kg.
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold block">
              Incentive Points Generated
            </span>
            <div className="text-2xl font-extrabold text-amber-300 mt-1">
              +{pointsToAward} pts
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Awarded directly to resident upon confirmation.
            </p>
          </div>
        </div>

        {/* Recovery Route & Weighmaster Notes */}
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-800 uppercase tracking-wider block mb-1">
              Destination Circular Recovery Route *
            </label>
            <select
              value={recoveryRoute}
              disabled={isConfirmed}
              onChange={(e) => setRecoveryRoute(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-semibold focus:ring-1 focus:ring-emerald-500"
            >
              <option value="Mechanical Pelletizing Line 2 (Bottle-to-Bottle)">
                Mechanical Pelletizing Line 2 (Bottle-to-Bottle)
              </option>
              <option value="Hydropulping & Corrugated Kraft Baling">
                Hydropulping &amp; Corrugated Kraft Baling
              </option>
              <option value="Secondary Smelter Ingot Casting">
                Secondary Smelter Ingot Casting
              </option>
              <option value="Industrial Aerobic Windrow Composting">
                Industrial Aerobic Windrow Composting
              </option>
              <option value="WEEE Authorized E-Waste Smelting & Precious Refining">
                WEEE Authorized E-Waste Smelting &amp; Precious Refining
              </option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-800 uppercase tracking-wider block mb-1">
              Quality Inspection &amp; Tare Notes
            </label>
            <input
              type="text"
              disabled={isConfirmed}
              value={weighmasterNotes}
              onChange={(e) => setWeighmasterNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Certifying Officer
              </label>
              <input
                type="text"
                disabled={isConfirmed}
                value={weighmasterName}
                onChange={(e) => setWeighmasterName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-800"
              />
            </div>
            <div>
              <label className="font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Scale Calibration
              </label>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 font-mono text-[11px]">
                NIST Calibrated Digital Platform #SCALE-42
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {!isConfirmed ? (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate('/recycler/pickups')}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="lg"
              leftIcon={<ShieldCheck className="w-5 h-5 text-emerald-300" />}
              onClick={handleConfirmVerificationAndRecovery}
            >
              Confirm Recovery &amp; Award Customer Points
            </Button>
          </div>
        ) : (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Listing is locked and verified in localStorage.
            </span>
            <Button size="md" variant="accent" onClick={handleSwitchToCustomer}>
              Switch to Customer View &rarr;
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
