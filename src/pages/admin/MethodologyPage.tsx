import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileText,
  ExternalLink,
  ShieldCheck,
  Edit2,
  Save,
  HelpCircle,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { storageService } from '../../services/storageService';
import { EnvironmentalFactor } from '../../types';
import { useToast } from '../../components/ui/Toast';

export const MethodologyPage: React.FC = () => {
  const { showToast } = useToast();
  const [factors, setFactors] = useState<EnvironmentalFactor[]>([]);
  const [editingFactor, setEditingFactor] = useState<EnvironmentalFactor | null>(null);

  const loadData = () => {
    setFactors(storageService.getEnvironmentalFactors());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('wtr_data_changed', handleUpdate);
    return () => window.removeEventListener('wtr_data_changed', handleUpdate);
  }, []);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFactor) return;

    const list = storageService.getEnvironmentalFactors();
    const idx = list.findIndex((f) => f.id === editingFactor.id);
    if (idx !== -1) {
      list[idx] = editingFactor;
      storageService.saveEnvironmentalFactors(list);
      showToast(`Updated factor for ${editingFactor.materialName}`, 'success');
      setEditingFactor(null);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Environmental Methodology, Standards &amp; Calculation Formulas
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Open documentation of greenhouse gas lifecycle factors, material displacement boundaries, and citations.
        </p>
      </div>

      {/* Honest Provenance Banner */}
      <div className="p-3.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
        <div className="font-bold flex items-center gap-1.5 text-slate-900">
          <BookOpen className="w-4 h-4 text-emerald-700" />
          Factor Verification Status Taxonomy
        </div>
        <p className="text-slate-600 text-[11px] leading-relaxed">
          <strong>Measured:</strong> Empirically tested on calibrated material recovery scales &bull;{' '}
          <strong>Sourced:</strong> Extracted directly from peer-reviewed databases (EPA WARM v15, DEFRA, IPCC) &bull;{' '}
          <strong>Hypothetical:</strong> Modeled pilot assumptions explicitly requiring local lab validation prior to municipal certification.
        </p>
      </div>

      {/* Factors Table Card */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Material Stream</th>
                <th className="px-5 py-3.5">Factor Value &amp; Unit</th>
                <th className="px-5 py-3.5">Mathematical Formula</th>
                <th className="px-5 py-3.5">Authoritative Source</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Last Verified</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {factors.map((factor) => (
                <tr key={factor.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4 font-bold text-slate-900">
                    {factor.materialName}
                  </td>

                  <td className="px-5 py-4 font-mono font-bold text-emerald-800 text-sm">
                    {factor.factorValue.toFixed(2)}{' '}
                    <span className="text-[10px] text-slate-500 font-normal block font-sans">
                      {factor.unit}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-slate-700 font-mono text-[11px]">
                    {factor.formula}
                  </td>

                  <td className="px-5 py-4 text-slate-600 text-[11px] max-w-xs">
                    {factor.source}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        factor.verificationStatus === 'sourced'
                          ? 'bg-sky-100 text-sky-800'
                          : factor.verificationStatus === 'measured'
                          ? 'bg-emerald-100 text-[#166534]'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {factor.verificationStatus}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-slate-500 text-[11px] font-mono">
                    {factor.lastVerified}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                      onClick={() => setEditingFactor({ ...factor })}
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

      {/* Edit Factor Modal */}
      {editingFactor && (
        <Modal
          isOpen={true}
          onClose={() => setEditingFactor(null)}
          title={`Edit Environmental Factor: ${editingFactor.materialName}`}
          description="Update lifecycle conversion multiplier and documented reference citation."
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Factor Value (kg CO2e / kg material)
              </label>
              <input
                type="number"
                step="0.01"
                value={editingFactor.factorValue}
                onChange={(e) =>
                  setEditingFactor({
                    ...editingFactor,
                    factorValue: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Mathematical Calculation Formula
              </label>
              <input
                type="text"
                value={editingFactor.formula}
                onChange={(e) =>
                  setEditingFactor({ ...editingFactor, formula: e.target.value })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Authoritative Citation / Source
              </label>
              <input
                type="text"
                value={editingFactor.source}
                onChange={(e) =>
                  setEditingFactor({ ...editingFactor, source: e.target.value })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Verification Status
                </label>
                <select
                  value={editingFactor.verificationStatus}
                  onChange={(e) =>
                    setEditingFactor({
                      ...editingFactor,
                      verificationStatus: e.target.value as any,
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="sourced">Sourced (Documented)</option>
                  <option value="measured">Measured (Empirical Scale)</option>
                  <option value="hypothetical">Hypothetical (Modeled)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Date Last Verified
                </label>
                <input
                  type="date"
                  value={editingFactor.lastVerified}
                  onChange={(e) =>
                    setEditingFactor({ ...editingFactor, lastVerified: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingFactor(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" leftIcon={<Save className="w-3.5 h-3.5" />}>
                Save Factor
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
