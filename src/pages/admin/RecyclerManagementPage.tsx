import React, { useState, useEffect } from 'react';
import {
  Users,
  Edit2,
  CheckCircle2,
  ShieldCheck,
  Building2,
  MapPin,
  Clock,
  Layers,
  Save,
  AlertCircle,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { MaterialTag } from '../../components/waste/MaterialTag';
import { Modal } from '../../components/ui/Modal';
import { storageService } from '../../services/storageService';
import { RecyclerPartner, MaterialCategory } from '../../types';
import { useToast } from '../../components/ui/Toast';

export const RecyclerManagementPage: React.FC = () => {
  const { showToast } = useToast();
  const [recyclers, setRecyclers] = useState<RecyclerPartner[]>([]);
  const [materials, setMaterials] = useState<MaterialCategory[]>([]);
  const [editingPartner, setEditingPartner] = useState<RecyclerPartner | null>(null);

  const loadData = () => {
    setRecyclers(storageService.getRecyclers());
    setMaterials(storageService.getMaterials());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('wtr_data_changed', handleUpdate);
    return () => window.removeEventListener('wtr_data_changed', handleUpdate);
  }, []);

  const handleToggleStatus = (partner: RecyclerPartner) => {
    const updated = { ...partner, active: !partner.active };
    storageService.updateRecycler(updated);
    showToast(`Updated status for ${partner.name}`, 'info');
    loadData();
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartner) return;

    storageService.updateRecycler(editingPartner);
    showToast(`Partner profile updated: ${editingPartner.name}`, 'success');
    setEditingPartner(null);
    loadData();
  };

  const handleToggleMaterialAccepted = (materialId: string) => {
    if (!editingPartner) return;
    const exists = editingPartner.acceptedMaterialIds.includes(materialId);
    let updated: string[];
    if (exists) {
      updated = editingPartner.acceptedMaterialIds.filter((id) => id !== materialId);
    } else {
      updated = [...editingPartner.acceptedMaterialIds, materialId];
    }
    setEditingPartner({ ...editingPartner, acceptedMaterialIds: updated });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Recycler Partners &amp; Facility Network
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage participating commercial mechanical recyclers, certified smelters, and composting facilities.
        </p>
      </div>

      {/* Honest Demo Disclaimer */}
      <div className="p-3.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
        <span>
          <strong>Simulated Partner Profiles:</strong> Partner entities and facility data are modeled for prototype evaluation. Commercial contacts and telephone numbers are placeholders.
        </span>
      </div>

      {/* Partner Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recyclers.map((partner) => (
          <Card key={partner.id} className="p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      {partner.name}
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                        â˜… {partner.rating}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">{partner.facilityType}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleStatus(partner)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer shrink-0 ${
                    partner.active
                      ? 'bg-emerald-100 text-[#166534] hover:bg-emerald-200'
                      : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                  }`}
                >
                  {partner.active ? 'Active' : 'Disabled'}
                </button>
              </div>

              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Service Area: {partner.serviceArea}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Next Pickup: {partner.nextPickupSlot}</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Contact: {partner.contactEmail ?? '—'}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                  Supported Material Streams
                </span>
                <div className="flex flex-wrap gap-1">
                  {partner.acceptedMaterialIds.map((matId) => (
                    <MaterialTag key={matId} categoryId={matId} categoryName={matId.replace('_', ' ')} size="sm" />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">
                Min. Batch: <strong>{partner.minQuantityKg} kg</strong> &bull; Total Recoveries: {partner.verifiedRecoveryCount}
              </span>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                onClick={() => setEditingPartner({ ...partner })}
              >
                Edit Profile
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Partner Modal */}
      {editingPartner && (
        <Modal
          isOpen={true}
          onClose={() => setEditingPartner(null)}
          title={`Edit Recycler: ${editingPartner.name}`}
          description="Update supported streams, service boundaries, and collection minimums."
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Partner Name</label>
              <input
                type="text"
                value={editingPartner.name}
                onChange={(e) =>
                  setEditingPartner({ ...editingPartner, name: e.target.value })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Service Area Radius</label>
              <input
                type="text"
                value={editingPartner.serviceArea}
                onChange={(e) =>
                  setEditingPartner({ ...editingPartner, serviceArea: e.target.value })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Minimum Batch Quantity (kg)
              </label>
              <input
                type="number"
                step="0.5"
                value={editingPartner.minQuantityKg}
                onChange={(e) =>
                  setEditingPartner({
                    ...editingPartner,
                    minQuantityKg: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
              />
            </div>

            {/* Supported materials checkboxes */}
            <div>
              <label className="font-bold text-slate-800 block mb-1.5">
                Supported Material Categories (Click to toggle)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {materials.map((m) => {
                  const isChecked = editingPartner.acceptedMaterialIds.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleToggleMaterialAccepted(m.id)}
                      className={`p-2 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <span>{m.name.split(' (')[0]}</span>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingPartner(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" leftIcon={<Save className="w-3.5 h-3.5" />}>
                Save Partner
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};


