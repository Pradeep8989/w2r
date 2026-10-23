import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, AlertCircle, Sparkles, SwitchCamera, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/Button';

interface CameraScannerProps {
  onCapture: (imageDataUrl: string) => void;
  onSwitchToUpload: () => void;
  isProcessing?: boolean;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  onCapture,
  onSwitchToUpload,
  isProcessing = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isInitializing, setIsInitializing] = useState(true);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setIsInitializing(true);
    setErrorMessage(null);
    stopStream();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasPermission(false);
      setErrorMessage('Camera access is not supported by your current browser.');
      setIsInitializing(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setHasPermission(true);
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setHasPermission(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Camera permission was denied. Please allow camera access in your browser or switch to image upload.');
      } else {
        setErrorMessage('Could not connect to camera device. Please try using image upload instead.');
      }
    } finally {
      setIsInitializing(false);
    }
  }, [facingMode, stopStream]);

  useEffect(() => {
    if (!capturedImage) {
      startCamera();
    }
    return () => {
      stopStream();
    };
  }, [startCamera, capturedImage, stopStream]);

  const handleCaptureFrame = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    stopStream();
    setCapturedImage(dataUrl);
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleToggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // If permission denied or camera error
  if (hasPermission === false && !capturedImage) {
    return (
      <div className="bg-rose-50/70 border-2 border-rose-200 rounded-2xl p-8 text-center space-y-4">
        <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-bold text-rose-900">Camera Unavailable</h3>
          <p className="text-sm text-rose-700 mt-1.5 leading-relaxed">
            {errorMessage || 'Camera access was blocked or is not available on this device.'}
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={startCamera}
            className="flex items-center gap-2 border-rose-300 text-rose-700 hover:bg-rose-100"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Camera Access
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onSwitchToUpload}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            <ImageIcon className="w-4 h-4" />
            Upload Image Instead
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Live Viewport or Captured Preview */}
      <div className="relative aspect-4/3 sm:aspect-16/10 w-full bg-slate-950 rounded-2xl overflow-hidden shadow-lg border border-slate-800 flex items-center justify-center">
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Scanning Target Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 border-2 border-emerald-400/80 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.35)]">
                {/* Corner guide accents */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                {/* Animated scanline */}
                <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Top Bar inside camera view */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white/90 text-xs pointer-events-auto">
              <span className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md font-medium flex items-center gap-1.5 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Camera
              </span>
              <button
                type="button"
                onClick={handleToggleFacingMode}
                className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 hover:bg-black/80 transition-colors text-white"
                title="Switch Camera"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>
            </div>

            {/* Instruction tooltip */}
            <div className="absolute bottom-4 left-4 right-4 text-center pointer-events-none">
              <span className="px-4 py-2 rounded-xl bg-black/70 backdrop-blur-md text-white text-xs font-medium border border-white/10 inline-block">
                Center paper or plastic item in the frame
              </span>
            </div>
          </>
        ) : (
          <div className="relative w-full h-full">
            <img
              src={capturedImage}
              alt="Captured waste"
              className="w-full h-full object-contain bg-slate-900"
            />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-emerald-300 font-medium text-xs flex items-center gap-1.5 border border-emerald-500/30">
                ✓ Image Captured
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Camera Action Buttons */}
      <div className="flex items-center justify-center gap-3 pt-1">
        {!capturedImage ? (
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={handleCaptureFrame}
            disabled={isInitializing}
            className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md hover:shadow-emerald-600/25 flex items-center gap-2.5 transition-all text-base"
          >
            <Camera className="w-5 h-5" />
            Capture Image
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleRetake}
              disabled={isProcessing}
              className="flex items-center gap-2 text-slate-700 border-slate-300 hover:bg-slate-100"
            >
              <RefreshCw className="w-4 h-4" />
              Retake
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => onCapture(capturedImage)}
              disabled={isProcessing}
              className="px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              {isProcessing ? 'Analyzing...' : 'Analyze Waste'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
