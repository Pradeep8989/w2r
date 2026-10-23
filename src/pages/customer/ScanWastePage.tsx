import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileImage,
  Sparkles,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Package,
  Box,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { mockAnalysisService, SAMPLE_SCENARIOS } from '../../services/mockAnalysis';
import { useToast } from '../../components/ui/Toast';

export const ScanWastePage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<
    'PLASTIC_BOTTLES' | 'CARDBOARD' | 'MIXED_WASTE' | null
  >(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setErrorMessage(null);
    setSelectedScenarioKey(null);

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Please upload a valid image file (JPG, PNG, or WEBP).');
      showToast('Unsupported image format', 'error');
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 10MB limit. Please choose a smaller photo.');
      showToast('Image file too large (max 10MB)', 'error');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (scenarioKey: 'PLASTIC_BOTTLES' | 'CARDBOARD' | 'MIXED_WASTE') => {
    setSelectedFile(null);
    setErrorMessage(null);
    setSelectedScenarioKey(scenarioKey);
    const scenario = SAMPLE_SCENARIOS[scenarioKey];
    setPreviewUrl(scenario.image);
    showToast(`Loaded "${scenario.label}"`, 'info');
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setSelectedScenarioKey(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStartAnalysis = async () => {
    if (!previewUrl && !selectedFile) {
      setErrorMessage('Please select or upload a waste photo first.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(15);

    const progressTimer = setInterval(() => {
      setAnalysisProgress((prev) => (prev >= 90 ? prev : prev + 25));
    }, 250);

    try {
      const result = await mockAnalysisService.runAnalysis(
        selectedFile || previewUrl || '',
        selectedScenarioKey || undefined
      );

      clearInterval(progressTimer);
      setAnalysisProgress(100);

      // Persist temporary analysis in sessionStorage so the analysis page can consume it
      sessionStorage.setItem('wtr_latest_analysis', JSON.stringify(result));
      showToast('Waste analysis complete!', 'success');

      setTimeout(() => {
        navigate('/customer/analysis');
      }, 300);
    } catch (err) {
      clearInterval(progressTimer);
      setIsAnalyzing(false);
      setErrorMessage('Error running analysis simulation. Please try again.');
      showToast('Analysis failed', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title & Explanatory Banner */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          AI Waste Identification &amp; Material Analysis
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Upload an image of household or commercial waste to instantly classify materials, check
          contamination risks, and calculate circular recovery options.
        </p>
      </div>

      {/* Honest Demo Disclaimer Notice */}
      <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-900 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-bold">Demo Analysis Notice:</span> External computer vision AI backend is not
          connected in this prototype. Analysis is executed locally via simulated classification
          scenarios to ensure 100% reliable hackathon presentation without external API dependencies.
        </div>
      </div>

      {/* Sample Quick Action Bar */}
      <Card className="p-4 bg-slate-50/80 border border-slate-200">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          Quick Test: Select Pre-configured Scenario
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handleSelectSample('PLASTIC_BOTTLES')}
            className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
              selectedScenarioKey === 'PLASTIC_BOTTLES'
                ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400/40'
                : 'bg-white border-slate-200 hover:border-emerald-300'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">Plastic Bottles (PET)</span>
              <span className="text-[10px] text-slate-500">94% Confidence &bull; Single-stream</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSelectSample('CARDBOARD')}
            className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
              selectedScenarioKey === 'CARDBOARD'
                ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400/40'
                : 'bg-white border-slate-200 hover:border-emerald-300'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">Cardboard Packaging</span>
              <span className="text-[10px] text-slate-500">96% Confidence &bull; Dry fibers</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSelectSample('MIXED_WASTE')}
            className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
              selectedScenarioKey === 'MIXED_WASTE'
                ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400/40'
                : 'bg-white border-slate-200 hover:border-emerald-300'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">Mixed Household Waste</span>
              <span className="text-[10px] text-slate-500">Multi-stream separation needed</span>
            </div>
          </button>
        </div>
      </Card>

      {/* Main Upload / Preview Area */}
      <Card className="p-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        {!previewUrl ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
                : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50/50'
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#166534] mx-auto flex items-center justify-center mb-4">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Drag &amp; drop your waste photo here, or browse
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Supports high-resolution JPG, PNG, and WEBP photos (up to 10MB).
            </p>
            <div className="mt-5">
              <Button size="sm" variant="secondary" type="button">
                Select Photo from Computer
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-96 flex items-center justify-center bg-slate-900/5">
              <img
                src={previewUrl}
                alt="Waste preview"
                className="max-h-96 w-auto object-contain rounded-xl"
              />
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-700 shadow-md backdrop-blur-xs transition-colors cursor-pointer text-xs flex items-center gap-1 font-medium"
                  title="Replace photo"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Replace</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="p-2 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white shadow-md backdrop-blur-xs transition-colors cursor-pointer text-xs"
                  title="Remove photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>
                Selected image:{' '}
                <strong className="text-slate-800">
                  {selectedFile ? selectedFile.name : selectedScenarioKey ? `${selectedScenarioKey.toLowerCase()}.jpg` : 'Sample'}
                </strong>
              </span>
              <span>Ready for simulated AI classification</span>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Loading Progress State */}
        {isAnalyzing && (
          <div className="mt-6 p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-900">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
                Executing Simulated Neural Material Classification...
              </span>
              <span>{analysisProgress}%</span>
            </div>
            <div className="w-full h-2.5 bg-emerald-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#166534] transition-all duration-300 rounded-full"
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Analyze Action Button */}
        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            size="lg"
            disabled={!previewUrl || isAnalyzing}
            isLoading={isAnalyzing}
            onClick={handleStartAnalysis}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Analyze Waste
          </Button>
        </div>
      </Card>
    </div>
  );
};
