import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Recycle,
  HelpCircle,
  Scale,
  Award,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  Info,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { StructuredWasteAnalysis } from '../../services/aiService';
import { routeService } from '../../services/routeService';
import { rewardService } from '../../services/rewardService';
import {
  BoundedMaterial,
  WasteCategory,
  PAPER_SUBMATERIALS,
  PLASTIC_SUBMATERIALS,
} from '../../data/materialRules';

interface AIAnalysisCardProps {
  analysis: StructuredWasteAnalysis;
  weightKg: number;
  onWeightChange: (weight: number) => void;
  onRetakeOrTryAgain: () => void;
  onSubmitForRecovery: (overrideData?: {
    material: BoundedMaterial;
    category: WasteCategory;
  }) => void;
  isSubmitting?: boolean;
}

export const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({
  analysis,
  weightKg,
  onWeightChange,
  onRetakeOrTryAgain,
  onSubmitForRecovery,
  isSubmitting = false,
}) => {
  const [selectedMaterial, setSelectedMaterial] = useState<BoundedMaterial>(analysis.material);
  const [selectedCategory, setSelectedCategory] = useState<WasteCategory>(analysis.category);
  const [isManualMode, setIsManualMode] = useState<boolean>(analysis.isLowConfidence);

  // Compute live recovery route and points based on current material & contamination
  const recoveryRouteInfo = routeService.getRecoveryRoute(
    selectedMaterial,
    analysis.contamination
  );

  const rewardCalculation = rewardService.calculateEstimatedReward(
    selectedMaterial,
    weightKg
  );

  const handleSelectMaterialManually = (mat: BoundedMaterial, cat: WasteCategory) => {
    setSelectedMaterial(mat);
    setSelectedCategory(cat);
  };

  const confidencePercentage = Math.round(analysis.confidence * 100);

  return (
    <div className="space-y-6">
      {/* ⚠️ Low-Confidence Warning Banner (Section 7) */}
      {analysis.isLowConfidence && !isManualMode && (
        <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 shadow-sm space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-200 text-amber-800 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-base text-amber-950">⚠️ Low Confidence ({confidencePercentage}%)</h4>
              <p className="text-sm text-amber-800 mt-1">
                We couldn't confidently identify this material with high certainty (threshold: 70%).
                Please upload a clearer image or choose the material manually.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetakeOrTryAgain}
              className="flex items-center gap-1.5 border-amber-400 text-amber-900 hover:bg-amber-100"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsManualMode(true)}
              className="flex items-center gap-1.5 bg-amber-700 hover:bg-amber-800 text-white"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Choose Manually
            </Button>
          </div>
        </div>
      )}

      {/* Manual Selection Panel (Section 7) */}
      {isManualMode && (
        <Card className="p-5 border-2 border-emerald-500/60 bg-emerald-50/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
              <h4 className="font-bold text-sm text-emerald-950">
                Manual Material Selection
              </h4>
            </div>
            <span className="text-xs text-emerald-700 font-medium bg-emerald-100 px-2.5 py-1 rounded-full">
              Bounded Waste Scope
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Paper Stream */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Paper Stream
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {PAPER_SUBMATERIALS.map((item) => (
                  <button
                    key={item.material}
                    type="button"
                    onClick={() => handleSelectMaterialManually(item.material, 'paper')}
                    className={`p-2 rounded-lg text-xs font-semibold text-left transition-all ${
                      selectedMaterial === item.material
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Plastic Stream */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Plastic Stream
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {PLASTIC_SUBMATERIALS.map((item) => (
                  <button
                    key={item.material}
                    type="button"
                    onClick={() => handleSelectMaterialManually(item.material, 'plastic')}
                    className={`p-2 rounded-lg text-xs font-semibold text-left transition-all ${
                      selectedMaterial === item.material
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Main AI Result Card (Section 9) */}
      <Card className="overflow-hidden border border-slate-200 shadow-sm bg-white">
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                AI Structured Analysis
              </div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>✓ {selectedCategory.toUpperCase()} Detected</span>
                {analysis.isDemoMode && (
                  <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Demo Mode
                  </span>
                )}
              </h3>
            </div>
          </div>

          {/* Confidence Badge */}
          <div className="text-right">
            <div className="text-2xl font-black text-emerald-400">
              {confidencePercentage}%
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              Confidence Score
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Key Classification Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Identified Material */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs font-medium text-slate-500 block mb-1">
                Material Type
              </span>
              <span className="text-sm font-bold text-slate-900 capitalize">
                {selectedMaterial}
              </span>
            </div>

            {/* Contamination Level (Section 8) */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs font-medium text-slate-500 block mb-1">
                Contamination
              </span>
              <span
                className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                  analysis.contamination === 'low'
                    ? 'bg-emerald-100 text-emerald-800'
                    : analysis.contamination === 'medium'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {analysis.contamination === 'low' && '✓ Low'}
                {analysis.contamination === 'medium' && '⚠ Medium'}
                {analysis.contamination === 'high' && '⚠ High'}
              </span>
            </div>

            {/* Recyclable */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs font-medium text-slate-500 block mb-1">
                Recyclable
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Yes
              </span>
            </div>

            {/* Points Rate */}
            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
              <span className="text-xs font-medium text-emerald-800 block mb-1">
                Reward Rate
              </span>
              <span className="text-sm font-bold text-emerald-900">
                {rewardCalculation.pointsPerKg} pts / kg
              </span>
            </div>
          </div>

          {/* High Contamination Advisory */}
          {analysis.contamination === 'high' && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <strong>Cleaning Advisory:</strong> This material exhibits heavy surface residue or grease.
                It may require rinsing/cleaning before mechanical recycling to avoid batch rejection.
              </div>
            </div>
          )}

          {/* Recommended Recovery Route (Section 10) */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-300">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Recycle className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  Recommended Recovery Route
                </span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                {recoveryRouteInfo.processingType}
              </span>
            </div>
            <h4 className="text-base font-bold text-emerald-950">
              ♻ {recoveryRouteInfo.route}
            </h4>
            <p className="text-xs text-emerald-800 mt-1">
              {recoveryRouteInfo.routeDescription}
            </p>
          </div>

          {/* Why? Explanation */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              Why this classification?
            </span>
            <p className="text-slate-600 leading-relaxed">
              {analysis.reason}
            </p>
          </div>

          {/* Approximate Weight & Reward Calculation (Sections 11 & 12) */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <label
                  htmlFor="weight-input"
                  className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1"
                >
                  Approximate Weight
                </label>
                <div className="relative w-36">
                  <input
                    id="weight-input"
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="100"
                    value={weightKg}
                    onChange={(e) => onWeightChange(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                    className="w-full py-1.5 px-3 pr-9 rounded-lg border border-slate-300 bg-white font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                    kg
                  </span>
                </div>
              </div>

              {/* Reward Calculation Formula Badge */}
              <div className="sm:text-right bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                  Formula: {weightKg} kg × {rewardCalculation.pointsPerKg} pts/kg
                </span>
                <div className="text-xl font-black text-emerald-700 flex items-center sm:justify-end gap-1.5">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>+{rewardCalculation.estimatedPoints} Estimated Points</span>
                </div>
                <span className="text-[10px] text-slate-400 italic block mt-0.5">
                  Final reward calculated using verified weight after collection.
                </span>
              </div>
            </div>
          </div>

          {/* Submit Waste Summary Bar (Section 13) */}
          <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2">
              <span><strong>Material:</strong> {selectedMaterial}</span>
              <span>•</span>
              <span><strong>Weight:</strong> {weightKg} kg</span>
              <span>•</span>
              <span><strong>Route:</strong> {recoveryRouteInfo.route}</span>
            </div>

            <Button
              type="button"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              onClick={() =>
                onSubmitForRecovery({
                  material: selectedMaterial,
                  category: selectedCategory,
                })
              }
              className="w-full sm:w-auto px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md hover:shadow-emerald-600/25 flex items-center justify-center gap-2"
            >
              <span>Submit for Recovery</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
