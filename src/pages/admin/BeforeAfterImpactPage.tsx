import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Scale,
  Edit2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Save,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { storageService } from '../../services/storageService';
import { ImpactComparisonMetric } from '../../types';
import { useToast } from '../../components/ui/Toast';

export const BeforeAfterImpactPage: React.FC = () => {
  const { showToast } = useToast();
  const [metrics, setMetrics] = useState<ImpactComparisonMetric[]>([]);
  const [editingMetric, setEditingMetric] = useState<ImpactComparisonMetric | null>(null);

  const loadData = () => {
    setMetrics(storageService.getImpactMetrics());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('wtr_data_changed', handleUpdate);
    return () => window.removeEventListener('wtr_data_changed', handleUpdate);
  }, []);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMetric) return;

    // Recalculate percentages from numerators and denominators
    const baselineRate =
      Math.round((editingMetric.baselineNumerator / editingMetric.baselineDenominator) * 1000) / 10;
    const prototypeRate =
      Math.round((editingMetric.prototypeNumerator / editingMetric.prototypeDenominator) * 1000) / 10;

    const updated = {
      ...editingMetric,
      baselineRate,
      prototypeRate,
    };

    storageService.updateImpactMetric(updated);
    showToast(`Updated metric: ${editingMetric.metricName}`, 'success');
    setEditingMetric(null);
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Before vs. After Impact Assessment
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Comparative analysis between municipal baseline waste segregation and Waste-to-Resource prototype telemetry.
        </p>
      </div>

      {/* Honest Scientific Caution Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-amber-900">
            Scientific Rigor &amp; Experimental Integrity Disclaimer:
          </span>
          <p className="text-amber-800 leading-relaxed mt-0.5">
            The before/after metrics below represent simulated cohort model data designed to reflect pilot outcomes.
            In a live municipal pilot, baseline rates are derived from municipal waste audits and prototype rates from
            recycler facility weighmaster weighments. Numerators and denominators are explicitly displayed for transparent auditability.
          </p>
        </div>
      </div>

      {/* Comparison Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics.map((metric) => {
          const isImprovement =
            metric.id === 'met_contamination'
              ? metric.prototypeRate < metric.baselineRate // Lower contamination is better
              : metric.prototypeRate > metric.baselineRate; // Higher compliance/recovery is better

          const diff = Math.abs(
            Math.round((metric.prototypeRate - metric.baselineRate) * 10) / 10
          );

          return (
            <Card key={metric.id} className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-bold text-slate-900 text-base">{metric.metricName}</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                    onClick={() => setEditingMetric({ ...metric })}
                  >
                    Edit
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mb-4">{metric.description}</p>

                {/* Comparative Meter */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  {/* Baseline */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Municipal Baseline
                    </span>
                    <div className="text-2xl font-black text-slate-700 mt-1">
                      {metric.baselineRate}%
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {metric.baselineNumerator} / {metric.baselineDenominator} samples
                    </div>
                  </div>

                  {/* Prototype */}
                  <div className="border-l border-slate-200 pl-4">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                      WTR Prototype
                    </span>
                    <div className="text-2xl font-black text-[#166534] mt-1">
                      {metric.prototypeRate}%
                    </div>
                    <div className="text-[10px] text-emerald-700 font-mono mt-0.5">
                      {metric.prototypeNumerator} / {metric.prototypeDenominator} samples
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">
                  Observed delta:
                </span>
                <span
                  className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
                    isImprovement
                      ? 'bg-emerald-100 text-[#166534]'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {isImprovement ? `✓ Net Improvement of ${diff}%` : `Underperforming by ${diff}%`}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Edit Metric Modal */}
      {editingMetric && (
        <Modal
          isOpen={true}
          onClose={() => setEditingMetric(null)}
          title={`Edit Impact Metric: ${editingMetric.metricName}`}
          description="Adjust underlying sample numerators and denominators for transparent percentage recalculation."
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Metric Title</label>
              <input
                type="text"
                value={editingMetric.metricName}
                onChange={(e) =>
                  setEditingMetric({ ...editingMetric, metricName: e.target.value })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Baseline Numerator</label>
                <input
                  type="number"
                  value={editingMetric.baselineNumerator}
                  onChange={(e) =>
                    setEditingMetric({
                      ...editingMetric,
                      baselineNumerator: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Baseline Denominator</label>
                <input
                  type="number"
                  value={editingMetric.baselineDenominator}
                  onChange={(e) =>
                    setEditingMetric({
                      ...editingMetric,
                      baselineDenominator: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
              <div>
                <label className="font-bold text-emerald-900 block mb-1">Prototype Numerator</label>
                <input
                  type="number"
                  value={editingMetric.prototypeNumerator}
                  onChange={(e) =>
                    setEditingMetric({
                      ...editingMetric,
                      prototypeNumerator: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full p-2 rounded-lg border border-emerald-300"
                />
              </div>
              <div>
                <label className="font-bold text-emerald-900 block mb-1">Prototype Denominator</label>
                <input
                  type="number"
                  value={editingMetric.prototypeDenominator}
                  onChange={(e) =>
                    setEditingMetric({
                      ...editingMetric,
                      prototypeDenominator: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full p-2 rounded-lg border border-emerald-300"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingMetric(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" leftIcon={<Save className="w-3.5 h-3.5" />}>
                Recalculate &amp; Save
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
