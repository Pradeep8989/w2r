import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  RotateCcw,
  Save,
  HelpCircle,
  ShieldAlert,
  Scale,
  Sliders,
  Layers,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { ConfidenceMeter } from '../../components/waste/ConfidenceMeter';
import { MaterialTag } from '../../components/waste/MaterialTag';
import { storageService } from '../../services/storageService';
import { listingService } from '../../services/listingService';
import { mockAnalysisService, WasteAnalysisResult, SAMPLE_SCENARIOS } from '../../services/mockAnalysis';
import { useToast } from '../../components/ui/Toast';

export const WasteAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [analysis, setAnalysis] = useState<WasteAnalysisResult | null>(null);
  const [estimatedQuantity, setEstimatedQuantity] = useState<number>(3.5);
  const [indicativeMin, setIndicativeMin] = useState<number>(0);
  const [indicativeMax, setIndicativeMax] = useState<number>(0);

  useEffect(() => {
    // Load from sessionStorage or fallback to sample
    const raw = sessionStorage.getItem('wtr_latest_analysis');
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as WasteAnalysisResult;
        setAnalysis(parsed);
        setEstimatedQuantity(parsed.defaultEstimatedQty);
        return;
      } catch {
        // fallback
      }
    }

    // Default fallback if directly visited
    mockAnalysisService.runAnalysis('', 'PLASTIC_BOTTLES').then((res) => {
      setAnalysis(res);
      setEstimatedQuantity(res.defaultEstimatedQty);
    });
  }, []);

  // Recalculate indicative values when quantity changes
  useEffect(() => {
    if (!analysis) return;
    const configuredMaterials = storageService.getMaterials();
    const matInputs = analysis.materials.map((m) => ({
      categoryId: m.categoryId,
      quantity: estimatedQuantity * (m.percentageInStream / 100),
    }));

    const vals = mockAnalysisService.calculateIndicativeValue(matInputs, configuredMaterials);
    setIndicativeMin(vals.min);
    setIndicativeMax(vals.max);
  }, [analysis, estimatedQuantity]);

  if (!analysis) {
    return (
      <div className="p-12 text-center text-slate-500">
        Loading material analysis...
      </div>
    );
  }

  const handleSaveDraft = () => {
    const currentUser = storageService.getCurrentUser();
    const draft = listingService.saveDraft({
      title: `${analysis.materials[0]?.categoryName || 'Recyclable Stream'} (${estimatedQuantity} kg)`,
      customerId: currentUser?.id || `usr_${Date.now()}`,
      customerName: currentUser?.name || 'Resident',
      customerAddress: '42 Pine Crest Ave, Apt 3B',
      locality: 'Central Metro',
      materials: analysis.materials.map((m) => ({
        categoryId: m.categoryId,
        categoryName: m.categoryName,
        estimatedQuantity: Math.round(estimatedQuantity * (m.percentageInStream / 100) * 10) / 10,
        unit: 'kg',
        conditionNotes: m.contaminationNotes,
        detectedConfidence: m.confidence,
      })),
      estimatedValueMin: indicativeMin,
      estimatedValueMax: indicativeMax,
      photoUrl: analysis.imageUrl,
      pickupPreference: 'pickup',
    });

    showToast(`Draft ${draft.id} saved to your listings!`, 'success');
    navigate('/customer/listings');
  };

  const handleContinueToRecovery = () => {
    // Save current parameters in session for recovery page
    sessionStorage.setItem(
      'wtr_recovery_state',
      JSON.stringify({
        analysis,
        estimatedQuantity,
        indicativeMin,
        indicativeMax,
      })
    );
    navigate('/customer/recovery');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner / Disclaimer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Classification &amp; Material Recovery Assessment
            </h1>
            <span className="text-[10px] bg-emerald-100 text-[#166534] font-bold px-2 py-0.5 rounded-full uppercase">
              AI Ready
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Image analyzed at {new Date(analysis.timestamp).toLocaleTimeString()} &bull; Analysis ID: {analysis.analysisId}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/customer/scan">
            <Button size="sm" variant="outline" leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
              Scan Another
            </Button>
          </Link>
          <Button size="sm" variant="secondary" leftIcon={<Save className="w-3.5 h-3.5" />} onClick={handleSaveDraft}>
            Save Draft
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image & Confidence */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="overflow-hidden">
            <div className="relative bg-slate-900/5 aspect-square flex items-center justify-center p-3">
              <img
                src={analysis.imageUrl}
                alt="Analyzed waste"
                className="w-full h-full object-cover rounded-xl shadow-xs"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-lg">
                <ConfidenceMeter
                  confidence={analysis.overallConfidence}
                  label="Overall Classification Confidence"
                />
              </div>
            </div>

            <CardContent className="space-y-3 pt-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Detected Streams:</span>
                <span className="font-semibold text-slate-800">
                  {analysis.materials.length} Category {analysis.materials.length > 1 ? 'Streams' : 'Stream'}
                </span>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Exact weights cannot be inferred from a single photograph. Please specify your approximate batch quantity below.
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quantity Input Adjuster Card */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="qty-input" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-emerald-700" />
                Estimated Batch Quantity
              </label>
              <span className="text-sm font-extrabold text-slate-900">
                {estimatedQuantity.toFixed(1)} kg
              </span>
            </div>

            <input
              id="qty-input"
              type="range"
              min="0.5"
              max="25.0"
              step="0.5"
              value={estimatedQuantity}
              onChange={(e) => setEstimatedQuantity(parseFloat(e.target.value))}
              className="w-full accent-emerald-700 cursor-pointer"
            />

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>0.5 kg (Small bag)</span>
              <span>12 kg (Bale)</span>
              <span>25 kg (Bulk)</span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <span className="text-xs text-slate-500">Or type exact kg:</span>
              <input
                type="number"
                min="0.1"
                max="500"
                step="0.1"
                value={estimatedQuantity}
                onChange={(e) => setEstimatedQuantity(Math.max(0.1, parseFloat(e.target.value) || 0))}
                className="w-24 px-2 py-1 text-xs border border-slate-300 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </Card>
        </div>

        {/* Right Column: Detected Categories, Contamination Warnings, Value */}
        <div className="lg:col-span-7 space-y-6">
          {/* Detected Materials List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-700" /> Detected Material Breakdown
            </h3>

            {analysis.materials.map((mat, idx) => (
              <Card key={idx} className="p-5 border-l-4 border-l-emerald-600">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <MaterialTag categoryId={mat.categoryId} categoryName={mat.categoryName} />
                      {analysis.materials.length > 1 && (
                        <span className="text-xs font-bold text-slate-500">
                          ~{mat.percentageInStream}% of stream
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-2">{mat.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Confidence
                    </span>
                    <span className="text-xs font-bold text-emerald-800">
                      {Math.round(mat.confidence * 100)}%
                    </span>
                  </div>
                </div>

                {/* Contamination Alert */}
                <div
                  className={`mt-3 p-3 rounded-xl text-xs flex items-start gap-2.5 ${
                    mat.contaminationRisk === 'high'
                      ? 'bg-rose-50 border border-rose-200 text-rose-900'
                      : mat.contaminationRisk === 'moderate'
                      ? 'bg-amber-50 border border-amber-200 text-amber-900'
                      : 'bg-emerald-50/70 border border-emerald-100 text-emerald-900'
                  }`}
                >
                  {mat.contaminationRisk === 'high' ? (
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  ) : mat.contaminationRisk === 'moderate' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-semibold block">Preparation &amp; Quality Guidance:</span>
                    <span className="text-[11px] mt-0.5 block">{mat.contaminationNotes}</span>
                  </div>
                </div>

                {/* Recommended Route */}
                <div className="mt-3 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-900">Suggested Recovery Route: </span>
                  {mat.suggestedRoute}
                </div>
              </Card>
            ))}
          </div>

          {/* Indicative Resource Value Card */}
          <Card className="p-6 bg-gradient-to-br from-emerald-50/90 to-white border-2 border-emerald-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#166534] uppercase tracking-wider block">
                  Indicative Material Resource Value
                </span>
                <div className="text-3xl font-extrabold text-slate-900 mt-1">
                  ${indicativeMin.toFixed(2)} - ${indicativeMax.toFixed(2)}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
                  *Indicative rate based on configured partner market index for {estimatedQuantity} kg.
                  Not a guaranteed cash quote. Final credit depends on certified scale weighment.
                </p>
              </div>

              <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">Reward Yield</span>
                  <span className="text-sm font-bold text-amber-600">
                    +{Math.round(estimatedQuantity * 20)} Resource Points
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-600">
                Ready to route this material into certified recovery?
              </span>
              <Button
                size="md"
                variant="primary"
                onClick={handleContinueToRecovery}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Choose Recovery Route
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
