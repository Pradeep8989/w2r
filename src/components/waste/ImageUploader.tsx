import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, X, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE_BYTES } from '../../services/aiService';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  previewUrl: string | null;
  onClearImage: () => void;
  weightKg: number;
  onWeightChange: (weight: number) => void;
  onAnalyze: () => void;
  isProcessing?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  previewUrl,
  onClearImage,
  weightKg,
  onWeightChange,
  onAnalyze,
  isProcessing = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const validateAndSelect = (file: File) => {
    setLocalError(null);

    // Validate mime type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setLocalError('Please upload a valid image (JPG, JPEG, PNG, or WEBP).');
      return;
    }

    // Validate size limit (10MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setLocalError('Image file is too large (maximum size is 10MB).');
      return;
    }

    onImageSelected(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelect(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-5">
      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Error Banner */}
      {localError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{localError}</span>
        </div>
      )}

      {!previewUrl ? (
        /* Drag & Drop Zone */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/60 scale-[0.99]'
              : 'border-slate-300 bg-slate-50/70 hover:bg-slate-50 hover:border-emerald-400'
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center mx-auto text-emerald-600 mb-4 transition-transform group-hover:scale-105">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Click to upload or drag &amp; drop
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Supported formats: JPG, JPEG, PNG, WEBP (Max size: 10MB)
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100/60 px-3 py-1.5 rounded-full">
            <ImageIcon className="w-3.5 h-3.5" />
            Bounded to Paper &amp; Plastic Streams
          </div>
        </div>
      ) : (
        /* Image Preview & Controls */
        <div className="space-y-4">
          <div className="relative aspect-4/3 sm:aspect-16/10 w-full bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-200 flex items-center justify-center">
            <img
              src={previewUrl}
              alt="Uploaded waste preview"
              className="w-full h-full object-contain"
            />
            <button
              type="button"
              onClick={onClearImage}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-3 left-3">
              <span className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-emerald-300 font-medium text-xs flex items-center gap-1.5 border border-emerald-500/30">
                ✓ Image Ready
              </span>
            </div>
          </div>

          {/* Change Image Button & Weight Input Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto text-slate-700 border-slate-300 hover:bg-slate-100"
              >
                Change Image
              </Button>
            </div>

            {/* Approximate Weight Input */}
            <div className="flex items-center justify-start sm:justify-end gap-2.5">
              <label
                htmlFor="approx-weight-input"
                className="text-xs font-semibold text-slate-700 shrink-0"
              >
                Approximate Weight:
              </label>
              <div className="relative w-28">
                <input
                  id="approx-weight-input"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="100"
                  value={weightKg}
                  onChange={(e) => onWeightChange(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                  className="w-full py-1.5 px-3 pr-8 rounded-lg border border-slate-300 bg-white text-slate-900 font-bold text-sm text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                  kg
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic text-center sm:text-right">
            Note: The user enters approximate weight manually. The AI does not calculate exact weight from the image.
          </p>

          {/* Analyze Waste Button */}
          <div className="pt-2 text-center">
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={onAnalyze}
              disabled={isProcessing}
              className="w-full sm:w-auto px-10 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md hover:shadow-emerald-600/25 flex items-center justify-center gap-2 mx-auto"
            >
              <Sparkles className="w-5 h-5" />
              {isProcessing ? 'Analyzing Waste...' : 'Analyze Waste'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
