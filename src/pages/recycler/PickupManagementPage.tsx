import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Scale,
  Calendar,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { MaterialTag } from '../../components/waste/MaterialTag';
import { Modal } from '../../components/ui/Modal';
import { storageService } from '../../services/storageService';
import { listingService } from '../../services/listingService';
import { WasteListing } from '../../types';
import { useToast } from '../../components/ui/Toast';

export const PickupManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [listings, setListings] = useState<WasteListing[]>([]);
  const [selectedListingForCollect, setSelectedListingForCollect] = useState<WasteListing | null>(null);
  const [driverNotes, setDriverNotes] = useState('Collected from resident porch. Batch intact.');
  const [isCollecting, setIsCollecting] = useState(false);

  const loadData = () => {
    setListings(storageService.getListings());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('wtr_data_changed', handleUpdate);
    return () => window.removeEventListener('wtr_data_changed', handleUpdate);
  }, []);

  const activePickups = listings.filter((l) =>
    ['recycler_accepted', 'pickup_scheduled', 'collected'].includes(l.status)
  );

  const handleConfirmCollected = () => {
    if (!selectedListingForCollect) return;
    setIsCollecting(true);

    listingService.markCollected(selectedListingForCollect.id, 'Apex Driver #2', driverNotes);
    showToast(`Listing ${selectedListingForCollect.id} marked as collected!`, 'success');
    setIsCollecting(false);
    setSelectedListingForCollect(null);
    loadData();
  };

  const handleUnableToCollect = (listing: WasteListing) => {
    const reason = prompt('Please enter reason for inability to collect (e.g., Gate locked, contaminated batch):');
    if (reason) {
      listingService.cancel(listing.id, `Unable to collect: ${reason}`, 'Apex Logistics Dispatch');
      showToast(`Pickup marked as unable to collect.`, 'info');
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Collection Route &amp; Pickup Logistics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage assigned vehicle routes, confirm physical doorstep pickups, and transfer batches to facility scales.
        </p>
      </div>

      {activePickups.length === 0 ? (
        <Card className="p-12 text-center text-slate-400">
          <Truck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <h3 className="text-base font-bold text-slate-700">No pickups currently scheduled</h3>
          <p className="text-xs text-slate-400 mt-1">
            Accept incoming resident requests to populate your vehicle dispatch routes.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {activePickups.map((listing) => {
            const isCollected = listing.status === 'collected';
            return (
              <Card key={listing.id} className="p-5 border-l-4 border-l-blue-600">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={listing.photoUrl || '/samples/plastic_bottles.jpg'}
                      alt={listing.title}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                    />

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{listing.title}</h4>
                        <span className="text-[11px] text-slate-400 font-mono">({listing.id})</span>
                        <Badge status={listing.status}>{listing.status.replace(/_/g, ' ')}</Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-semibold text-slate-800">
                          <MapPin className="w-3.5 h-3.5 text-blue-600" />
                          {listing.customerAddress}, {listing.locality}
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Window: <strong>{listing.preferredPickupWindow || 'Standard Day'}</strong>
                        </span>
                        <span>&bull;</span>
                        <span>Resident: {listing.customerName}</span>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {listing.materials.map((m, i) => (
                          <MaterialTag
                            key={i}
                            categoryId={m.categoryId}
                            categoryName={`${m.categoryName} (~${m.estimatedQuantity} kg)`}
                            size="sm"
                          />
                        ))}
                      </div>

                      {listing.notes && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5">
                          "{listing.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    {!isCollected ? (
                      <>
                        <Button
                          size="sm"
                          variant="primary"
                          leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          onClick={() => setSelectedListingForCollect(listing)}
                        >
                          Mark Collected
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          onClick={() => handleUnableToCollect(listing)}
                        >
                          Unable to Collect
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="accent"
                        leftIcon={<Scale className="w-3.5 h-3.5" />}
                        onClick={() => navigate(`/recycler/verification/${listing.id}`)}
                      >
                        Enter Scale Weighment &rarr;
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Marking Collected */}
      <Modal
        isOpen={selectedListingForCollect !== null}
        onClose={() => setSelectedListingForCollect(null)}
        title="Confirm Doorstep Pickup"
        description="Verify driver has received physical materials from customer premises."
      >
        {selectedListingForCollect && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-900">{selectedListingForCollect.title}</div>
              <div className="text-slate-500 mt-0.5">
                Location: {selectedListingForCollect.customerAddress}, {selectedListingForCollect.locality}
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Driver Condition Notes:
              </label>
              <textarea
                rows={2}
                value={driverNotes}
                onChange={(e) => setDriverNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="p-3 bg-blue-50 text-blue-900 rounded-xl border border-blue-200 text-[11px]">
              Marking collected will update customer status to <strong>In-Transit</strong> and prompt the facility weighmaster for scale weight certification.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedListingForCollect(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isCollecting}
                onClick={handleConfirmCollected}
              >
                Confirm Collection
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
