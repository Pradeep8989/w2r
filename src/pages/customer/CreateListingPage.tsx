import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  MapPin,
  Calendar,
  Layers,
  Scale,
  Camera,
  AlertCircle,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { MaterialTag } from '../../components/waste/MaterialTag';
import { storageService } from '../../services/storageService';
import { listingService } from '../../services/listingService';
import { MaterialCategory } from '../../types';
import { useToast } from '../../components/ui/Toast';

export const CreateListingPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [title, setTitle] = useState('Household Recyclables for Verification');
  const [address, setAddress] = useState('42 Pine Crest Ave, Apt 3B');
  const [locality, setLocality] = useState('Central Metro');
  const [quantity, setQuantity] = useState(3.5);
  const [preference, setPreference] = useState<'pickup' | 'dropoff'>('pickup');
  const [collectionWindow, setCollectionWindow] = useState('Tomorrow, 09:00 AM - 12:00 PM');
  const [contaminationNotes, setContaminationNotes] = useState('Rinsed clean, bottles flattened, caps loosened.');
  const [notes, setNotes] = useState('Can leave in storage bin next to front porch.');
  const [photoUrl, setPhotoUrl] = useState('/samples/plastic_bottles.jpg');
  const [selectedCategoryId, setSelectedCategoryId] = useState('pet_plastic');
  const [partnerId, setPartnerId] = useState<string | undefined>('rec_ecocycle');
  const [partnerName, setPartnerName] = useState<string | undefined>('EcoCycle Polymers & Fibers');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const materials = storageService.getMaterials();

  useEffect(() => {
    // Read from session draft if arrived from scan / recovery
    const raw = sessionStorage.getItem('wtr_listing_draft');
    if (raw) {
      try {
        const draft = JSON.parse(raw);
        if (draft.analysis) {
          const firstMat = draft.analysis.materials[0];
          if (firstMat) {
            setSelectedCategoryId(firstMat.categoryId);
            setTitle(`${firstMat.categoryName} (${draft.estimatedQuantity || 3.5} kg)`);
            setContaminationNotes(firstMat.contaminationNotes || 'Clean and segregated.');
          }
          if (draft.analysis.imageUrl) {
            setPhotoUrl(draft.analysis.imageUrl);
          }
        }
        if (draft.estimatedQuantity) setQuantity(draft.estimatedQuantity);
        if (draft.preference) setPreference(draft.preference);
        if (draft.partnerId) setPartnerId(draft.partnerId);
        if (draft.partnerName) setPartnerName(draft.partnerName);
        if (draft.pickupWindow) setCollectionWindow(draft.pickupWindow);
      } catch {
        // ignore
      }
    }
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!address.trim()) errs.address = 'Pickup address is required';
    if (!locality.trim()) errs.locality = 'Locality is required';
    if (quantity <= 0) errs.quantity = 'Estimated weight must be greater than 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please fix the errors in the form.', 'error');
      return;
    }

    setIsSubmitting(true);
    const selectedMat = materials.find((m) => m.id === selectedCategoryId) || materials[0];

    // Compute indicative value
    const valMin = Math.round(quantity * selectedMat.ratePerKgMin * 100) / 100;
    const valMax = Math.round(quantity * selectedMat.ratePerKgMax * 100) / 100;

    const newListing = listingService.create({
      title,
      customerId: 'usr_sarah',
      customerName: 'Sarah Jenkins',
      customerAddress: address,
      locality,
      materials: [
        {
          categoryId: selectedMat.id,
          categoryName: selectedMat.name,
          estimatedQuantity: quantity,
          unit: 'kg',
          conditionNotes: contaminationNotes,
          detectedConfidence: 0.94,
        },
      ],
      estimatedValueMin: valMin,
      estimatedValueMax: valMax,
      photoUrl,
      pickupPreference: preference,
      preferredPickupWindow: collectionWindow,
      recyclerId: partnerId,
      recyclerName: partnerName,
      contaminationNotes,
      notes,
    });

    showToast(`Listing ${newListing.id} created successfully!`, 'success');

    // Clean session draft
    sessionStorage.removeItem('wtr_listing_draft');
    sessionStorage.removeItem('wtr_recovery_state');

    setTimeout(() => {
      navigate(`/customer/listings/${newListing.id}`);
    }, 400);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Create Waste Recovery Listing
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review detected materials and collection specifics to publish your verified pickup request.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
              Listing Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Bundled PET Bottles (5 kg)"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.title ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
              }`}
            />
            {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title}</p>}
          </div>

          {/* Primary Material Stream */}
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
              Primary Material Category *
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} (${m.ratePerKgMin.toFixed(2)} - ${m.ratePerKgMax.toFixed(2)} / kg)
                </option>
              ))}
            </select>
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Estimated Quantity (kg) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.quantity ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  }`}
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-semibold">
                  kg
                </span>
              </div>
              {errors.quantity && <p className="text-xs text-rose-600 mt-1">{errors.quantity}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Collection Preference
              </label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPreference('pickup')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    preference === 'pickup' ? 'bg-white text-[#166534] shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Doorstep Pickup
                </button>
                <button
                  type="button"
                  onClick={() => setPreference('dropoff')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    preference === 'dropoff' ? 'bg-white text-[#166534] shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Drop-off Point
                </button>
              </div>
            </div>
          </div>

          {/* Address & Locality */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Pickup Address *
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address or building number"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.address ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.address && <p className="text-xs text-rose-600 mt-1">{errors.address}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Locality / District *
              </label>
              <input
                type="text"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="e.g. Central Metro"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.locality ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.locality && <p className="text-xs text-rose-600 mt-1">{errors.locality}</p>}
            </div>
          </div>

          {/* Collection Window */}
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
              Preferred Collection Window
            </label>
            <input
              type="text"
              value={collectionWindow}
              onChange={(e) => setCollectionWindow(e.target.value)}
              placeholder="e.g. Tomorrow, 09:00 AM - 12:00 PM"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Contamination Notes */}
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
              Condition &amp; Cleanliness Notes
            </label>
            <input
              type="text"
              value={contaminationNotes}
              onChange={(e) => setContaminationNotes(e.target.value)}
              placeholder="e.g. Clean, rinsed, dry, oil-free"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Additional Notes */}
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
              Driver Instructions / Access Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Gate code #1234 or leave with building reception"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Mixed materials warning */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Stream Purity Reminder:</strong> Please ensure that non-recyclable items or food contamination are removed before handing off to the collection driver.
            </span>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/customer/listings')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Publish Waste Listing
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};
