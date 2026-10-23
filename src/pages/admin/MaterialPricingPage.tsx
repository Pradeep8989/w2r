import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  Edit2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Save,
  RotateCcw,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { MaterialTag } from '../../components/waste/MaterialTag';
import { Modal } from '../../components/ui/Modal';
import { storageService } from '../../services/storageService';
import { MaterialCategory } from '../../types';
import { useToast } from '../../components/ui/Toast';

export const MaterialPricingPage: React.FC = () => {
  const { showToast } = useToast();
  const [materials, setMaterials] = useState<MaterialCategory[]>([]);
  const [editingMaterial, setEditingMaterial] = useState<MaterialCategory | null>(null);

  const loadData = () => {
    setMaterials(storageService.getMaterials());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('wtr_data_changed', handleUpdate);
    return () => window.removeEventListener('wtr_data_changed', handleUpdate);
  }, []);

  const handleToggleActive = (mat: MaterialCategory) => {
    const updated = { ...mat, active: !mat.active };
    storageService.updateMaterial(updated);
    showToast(`Updated active status for ${mat.name}`, 'info');
    loadData();
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial) return;

    storageService.updateMaterial(editingMaterial);
    showToast(`Saved changes for ${editingMaterial.name}`, 'success');
    setEditingMaterial(null);
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Material Categories &amp; Indicative Pricing Configuration
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure baseline recovery rates per kilogram, contamination thresholds, and authorized processing routes.
        </p>
      </div>

      {/* Honest Demo Disclaimer */}
      <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Indicative Rate Configuration Disclaimer:</span> All rates are local prototype examples. In commercial deployment, indicative pricing indices are refreshed daily from regional baled commodity indexes and certified recycler purchase orders.
        </div>
      </div>

      {/* Materials Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Material &amp; Category</th>
                <th className="px-5 py-3.5">Indicative Rate / kg</th>
                <th className="px-5 py-3.5">Min. Batch</th>
                <th className="px-5 py-3.5">CO2e Factor</th>
                <th className="px-5 py-3.5">Allowed Routes</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {materials.map((mat) => (
                <tr key={mat.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900">{mat.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 max-w-xs">
                      {mat.description}
                    </div>
                  </td>

                  <td className="px-5 py-4 font-mono font-bold text-emerald-800">
                    ${mat.ratePerKgMin.toFixed(2)} - ${mat.ratePerKgMax.toFixed(2)} / {mat.unit}
                  </td>

                  <td className="px-5 py-4 text-slate-700 font-semibold">
                    {mat.minimumQuantityKg} kg
                  </td>

                  <td className="px-5 py-4 font-mono text-sky-800 font-semibold">
                    {mat.emissionFactorPerKg} kg CO2e
                  </td>

                  <td className="px-5 py-4 text-[11px] text-slate-600">
                    {mat.recoveryRoutes.join(', ')}
                  </td>

                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(mat)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${
                        mat.active
                          ? 'bg-emerald-100 text-[#166534] hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {mat.active ? 'Active' : 'Disabled'}
                    </button>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                      onClick={() => setEditingMaterial({ ...mat })}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Material Modal */}
      {editingMaterial && (
        <Modal
          isOpen={true}
          onClose={() => setEditingMaterial(null)}
          title={`Edit Material: ${editingMaterial.name}`}
          description="Adjust local rates, minimum quantities, and contamination guidelines."
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Material Name</label>
              <input
                type="text"
                value={editingMaterial.name}
                onChange={(e) =>
                  setEditingMaterial({ ...editingMaterial, name: e.target.value })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Indicative Rate Min ($/kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editingMaterial.ratePerKgMin}
                  onChange={(e) =>
                    setEditingMaterial({
                      ...editingMaterial,
                      ratePerKgMin: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Indicative Rate Max ($/kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editingMaterial.ratePerKgMax}
                  onChange={(e) =>
                    setEditingMaterial({
                      ...editingMaterial,
                      ratePerKgMax: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Min. Collection Quantity (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={editingMaterial.minimumQuantityKg}
                  onChange={(e) =>
                    setEditingMaterial({
                      ...editingMaterial,
                      minimumQuantityKg: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Emission Factor (kg CO2e / kg)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={editingMaterial.emissionFactorPerKg}
                  onChange={(e) =>
                    setEditingMaterial({
                      ...editingMaterial,
                      emissionFactorPerKg: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Contamination &amp; Preparation Rules
              </label>
              <textarea
                rows={2}
                value={editingMaterial.contaminationRules}
                onChange={(e) =>
                  setEditingMaterial({ ...editingMaterial, contaminationRules: e.target.value })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingMaterial(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" leftIcon={<Save className="w-3.5 h-3.5" />}>
                Save Rates
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
