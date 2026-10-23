import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Image as ImageIcon,
  Sparkles,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Award,
  RefreshCw,
  Recycle,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { CameraScanner } from '../../components/waste/CameraScanner';
import { ImageUploader } from '../../components/waste/ImageUploader';
import { AIAnalysisCard } from '../../components/waste/AIAnalysisCard';
import { PerformanceDashboard } from '../../components/waste/PerformanceDashboard';
import { aiService, StructuredWasteAnalysis } from '../../services/aiService';
import { wasteService, WasteSubmissionResult } from '../../services/wasteService';
import { BoundedMaterial, WasteCategory } from '../../data/materialRules';
import { useToast } from '../../components/ui/Toast';

type ScanMode = 'camera' | 'upload';
type ActiveTab = 'scanner' | 'performance';

export const ScanWastePage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<ActiveTab>('scanner');
  const [scanMode, setScanMode] = useState<ScanMode>('upload');

  // Input State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [approxWeightKg, setApproxWeightKg] = useState<number>(1.2);

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<StructuredWasteAnalysis | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<WasteSubmissionResult | null>(null);

  const handleImageSelected = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setErrorMessage(null);
    setAnalysisResult(null);
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  const handleCameraCapture = async (imageDataUrl: string) => {
    setPreviewUrl(imageDataUrl);
    setSelectedFile(null);
    setAnalysisResult(null);
    setErrorMessage(null);

    // Trigger analysis immediately on camera capture
    await runAnalysis(imageDataUrl);
  };

  const runAnalysis = async (fileOrUrl?: File | string) => {
    const target = fileOrUrl || selectedFile || previewUrl;
    if (!target) {
      setErrorMessage('Please capture or select an image first.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysisProgress(20);

    const progressTimer = setInterval(() => {
      setAnalysisProgress((prev) => (prev >= 85 ? prev : prev + 20));
    }, 200);

    try {
      const result = await aiService.analyzeWasteImage(target);
      clearInterval(progressTimer);
      setAnalysisProgress(100);
      setAnalysisResult(result);

      if (result.isLowConfidence) {
        showToast('Low confidence detection. Please verify material.', 'info');
      } else {
        showToast(`Identified: ${result.material} (${Math.round(result.confidence * 100)}%)`, 'success');
      }
    } catch (err: any) {
      clearInterval(progressTimer);
      setErrorMessage(err.message || 'Waste classification failed. Please try again.');
      showToast('Analysis encountered an error', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmitForRecovery = async (override?: {
    material: BoundedMaterial;
    category: WasteCategory;
  }) => {
    if (!analysisResult) return;

    setIsSubmitting(true);
    try {
      const finalMaterial = override?.material || analysisResult.material;
      const finalCategory = override?.category || analysisResult.category;

      const result = wasteService.submitScannedWaste({
        category: finalCategory,
        material: finalMaterial,
        weightKg: approxWeightKg,
        recoveryRoute: analysisResult.recommended_route,
        estimatedRewardPoints: Math.round(approxWeightKg * 25), // calculated
        confidence: analysisResult.confidence,
        contamination: analysisResult.contamination,
        reason: analysisResult.reason,
        photoUrl: previewUrl || undefined,
      });

      setSubmissionSuccess(result);
      showToast('Waste submitted for recovery!', 'success');
    } catch (err: any) {
      showToast('Submission failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setPreviewUrl(null);
    setSelectedFile(null);
    setSubmissionSuccess(null);
    setErrorMessage(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation Tabs: Scan Waste vs Impact & AI Performance */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Scan Your Waste
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Identify your waste and find the right recovery route.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('scanner')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'scanner'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Scanner
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('performance')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'performance'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            AI Performance &amp; Impact
          </button>
        </div>
      </div>

      {activeTab === 'performance' ? (
        /* Performance Dashboard View */
        <PerformanceDashboard />
      ) : (
        /* Scanner Flow */
        <div className="space-y-6">
          {/* Success Confirmation Modal / Banner (Section 13) */}
          {submissionSuccess && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-xl space-y-4 animate-in fade-in duration-300">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">
                      Waste Submitted Successfully!
                    </h3>
                    <p className="text-emerald-100 text-xs sm:text-sm">
                      Your material has been registered and scheduled into the circular tracking stream.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-black/20 backdrop-blur-md border border-white/10 text-xs">
                <div>
                  <span className="text-white/70 block">Assigned Recovery Route:</span>
                  <span className="font-bold text-sm text-white">
                    {submissionSuccess.recoveryRoute}
                  </span>
                </div>
                <div>
                  <span className="text-white/70 block">Material &amp; Weight:</span>
                  <span className="font-bold text-sm text-white">
                    {submissionSuccess.material} ({submissionSuccess.weightKg} kg)
                  </span>
                </div>
                <div>
                  <span className="text-white/70 block">Estimated Reward:</span>
                  <span className="font-bold text-sm text-amber-300 flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    +{submissionSuccess.estimatedRewardPoints} Points
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  Scan Another Item
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => navigate('/customer/my-listings')}
                  className="bg-white text-emerald-900 hover:bg-emerald-50 font-bold"
                >
                  <span>View in My Waste</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {!analysisResult && !submissionSuccess && (
            <>
              {/* Dual Options Selector (Section 1) */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setScanMode('camera')}
                  className={`p-5 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
                    scanMode === 'camera'
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      scanMode === 'camera'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    📷 Use Camera
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Capture live feed
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setScanMode('upload')}
                  className={`p-5 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
                    scanMode === 'upload'
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      scanMode === 'upload'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    🖼 Upload Image
                  </span>
                  <span className="text-[11px] text-slate-500">
                    JPG, PNG, WEBP
                  </span>
                </button>
              </div>

              {/* Quick Sample Test Presets */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-slate-500 flex items-center gap-1.5 mr-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Quick Test Samples:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl('/samples/plastic_bottles.jpg');
                    setErrorMessage(null);
                    setScanMode('upload');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700 font-medium cursor-pointer shadow-2xs transition-colors"
                >
                  🥤 Plastic Bottles (PET)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl('/samples/cardboard.jpg');
                    setErrorMessage(null);
                    setScanMode('upload');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700 font-medium cursor-pointer shadow-2xs transition-colors"
                >
                  📦 Cardboard Box
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl('/samples/mixed_waste.jpg');
                    setErrorMessage(null);
                    setScanMode('upload');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/50 text-slate-700 font-medium cursor-pointer shadow-2xs transition-colors"
                >
                  ⚠️ Mixed / Unclear Waste
                </button>
              </div>

              {/* Active Scanner Mode Container */}
              <Card className="p-6 border border-slate-200 shadow-xs bg-white">
                {scanMode === 'camera' ? (
                  <CameraScanner
                    onCapture={handleCameraCapture}
                    onSwitchToUpload={() => setScanMode('upload')}
                    isProcessing={isAnalyzing}
                  />
                ) : (
                  <ImageUploader
                    onImageSelected={handleImageSelected}
                    previewUrl={previewUrl}
                    onClearImage={handleClearImage}
                    weightKg={approxWeightKg}
                    onWeightChange={setApproxWeightKg}
                    onAnalyze={() => runAnalysis()}
                    isProcessing={isAnalyzing}
                  />
                )}

                {/* Preprocessing & Analysis Progress Bar */}
                {isAnalyzing && (
                  <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
                        Preprocessing Image &amp; Consulting Gemini Vision...
                      </span>
                      <span>{analysisProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-emerald-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                        style={{ width: `${analysisProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {errorMessage && (
                  <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </Card>

              {/* Bounded Waste Scope Explainer */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Recycle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Strictly Bounded Scope:</strong> PAPER (Newspaper, Office Paper, Cardboard, Paperboard) &amp; PLASTIC (PET, HDPE, Other).
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Secure Server-Side AI Evaluation
                </span>
              </div>
            </>
          )}

          {/* AI Analysis Result Card (Sections 5-13) */}
          {analysisResult && !submissionSuccess && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Scan Another Item
                </button>
              </div>

              <AIAnalysisCard
                analysis={analysisResult}
                weightKg={approxWeightKg}
                onWeightChange={setApproxWeightKg}
                onRetakeOrTryAgain={handleReset}
                onSubmitForRecovery={handleSubmitForRecovery}
                isSubmitting={isSubmitting}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
