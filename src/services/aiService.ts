import { supabase } from '../lib/supabase';
import {
  BoundedMaterial,
  WasteCategory,
  ContaminationLevel,
} from '../data/materialRules';
import { routeService } from './routeService';

/**
 * WasteAnalysisResult as specified in Section 17
 */
export interface WasteAnalysisResult {
  category: 'paper' | 'plastic';
  material:
    | 'newspaper'
    | 'office paper'
    | 'corrugated cardboard'
    | 'paperboard'
    | 'PET'
    | 'HDPE'
    | 'other plastic';
  confidence: number;
  contamination: 'low' | 'medium' | 'high';
  recyclable: boolean;
  recommended_route: string;
  reason: string;
}

/**
 * Extended UI metadata for display & demo feedback
 */
export interface StructuredWasteAnalysis extends WasteAnalysisResult {
  isLowConfidence: boolean; // true if confidence < 0.70
  isDemoMode: boolean; // true if client-side fallback simulation was used
  processedImageUrl?: string;
  analyzedAt: string;
}

/**
 * Valid image types accepted by the AI pipeline.
 */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Helper to convert a File or Data URL to base64 & MIME type.
 * Also resizes overly large images (> 1280px) to prevent payload transmission overhead.
 */
export async function preprocessImage(
  fileOrDataUrl: File | string,
  maxWidth = 1280,
  maxHeight = 1280,
  quality = 0.85
): Promise<{ base64: string; mimeType: string; previewUrl: string }> {
  return new Promise((resolve, reject) => {
    // If it's a File, extract native MIME type
    let determinedMime =
      typeof fileOrDataUrl !== 'string' && fileOrDataUrl.type
        ? fileOrDataUrl.type.toLowerCase()
        : 'image/jpeg';

    if (!ALLOWED_IMAGE_TYPES.includes(determinedMime)) {
      determinedMime = 'image/jpeg';
    }

    const img = new Image();

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Maintain aspect ratio while clamping dimensions
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context not available'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      const targetMime = determinedMime === 'image/png' ? 'image/png' : 'image/jpeg';
      const dataUrl = canvas.toDataURL(targetMime, quality);
      const base64 = dataUrl.split(',')[1] || '';

      resolve({
        base64,
        mimeType: targetMime,
        previewUrl: dataUrl,
      });
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for preprocessing.'));
    };

    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}

/**
 * Client-side simulation fallback when the Supabase Edge Function is not yet deployed or is unreachable.
 */
function runClientSideSimulatedAnalysis(
  demoHint?: 'PLASTIC_BOTTLES' | 'PAPER' | 'CARDBOARD' | 'MIXED_WASTE' | 'LOW_CONFIDENCE'
): StructuredWasteAnalysis {
  switch (demoHint) {
    case 'PAPER':
      return {
        category: 'paper',
        material: 'newspaper',
        confidence: 0.94,
        contamination: 'low',
        recyclable: true,
        recommended_route: 'Paper Recycling',
        reason: 'Clean newsprint sheets detected with standard non-glossy fiber composition.',
        isLowConfidence: false,
        isDemoMode: true,
        analyzedAt: new Date().toISOString(),
      };
    case 'CARDBOARD':
      return {
        category: 'paper',
        material: 'corrugated cardboard',
        confidence: 0.96,
        contamination: 'low',
        recyclable: true,
        recommended_route: 'Cardboard Recycling',
        reason: 'Corrugated wave fiber structure identified with clean dry surface.',
        isLowConfidence: false,
        isDemoMode: true,
        analyzedAt: new Date().toISOString(),
      };
    case 'MIXED_WASTE':
    case 'LOW_CONFIDENCE':
      return {
        category: 'plastic',
        material: 'other plastic',
        confidence: 0.58, // Below 0.70 threshold triggers Low-Confidence UI
        contamination: 'high',
        recyclable: false,
        recommended_route: 'Manual Inspection Required',
        reason: 'Mixed material packaging with visible surface grease and reflective multi-layer film.',
        isLowConfidence: true,
        isDemoMode: true,
        analyzedAt: new Date().toISOString(),
      };
    case 'PLASTIC_BOTTLES':
    default:
      return {
        category: 'plastic',
        material: 'PET',
        confidence: 0.94,
        contamination: 'low',
        recyclable: true,
        recommended_route: 'PET Plastic Recycling',
        reason: 'Clear PET beverage bottle geometry and transparent polymer profile detected.',
        isLowConfidence: false,
        isDemoMode: true,
        analyzedAt: new Date().toISOString(),
      };
  }
}

/**
 * Service to execute waste analysis via the backend Supabase Edge Function 'analyze-waste'.
 * NEVER exposes the GEMINI_API_KEY in the frontend.
 */
export const aiService = {
  /**
   * Main function required by Section 14:
   * analyzeWasteImage(file)
   *
   * Architecture:
   * React Frontend
   *   → Supabase Edge Function ('analyze-waste')
   *   → Gemini Vision API
   *   → Structured JSON response
   *   → React Frontend
   */
  async analyzeWasteImage(
    fileOrUrl: File | string,
    demoHint?: 'PLASTIC_BOTTLES' | 'PAPER' | 'CARDBOARD' | 'MIXED_WASTE' | 'LOW_CONFIDENCE'
  ): Promise<StructuredWasteAnalysis> {
    // 1. Convert selected image to base64 & determine MIME type
    let processed;
    try {
      processed = await preprocessImage(fileOrUrl);
    } catch {
      processed = {
        base64: '',
        mimeType: 'image/jpeg',
        previewUrl: typeof fileOrUrl === 'string' ? fileOrUrl : '',
      };
    }

    // 2. Call Supabase Edge Function 'analyze-waste'
    try {
      const { data, error } = await supabase.functions.invoke('analyze-waste', {
        body: {
          imageBase64: processed.base64,
          mimeType: processed.mimeType,
        },
      });

      if (!error && data && data.material) {
        // Enforce rule-based route recommendation
        const route = routeService.getRecoveryRoute(
          data.material as BoundedMaterial,
          data.contamination || 'low'
        );

        const confidence = Number(data.confidence ?? 0.92);
        return {
          category: data.category === 'paper' ? 'paper' : 'plastic',
          material: data.material as WasteAnalysisResult['material'],
          confidence: Math.round(confidence * 100) / 100,
          contamination: data.contamination || 'low',
          recyclable: typeof data.recyclable === 'boolean' ? data.recyclable : route.isRecyclable,
          recommended_route: data.recommended_route || route.route,
          reason:
            data.reason ||
            'Gemini Vision detected characteristics matching standard circular streams.',
          isLowConfidence: confidence < 0.70,
          isDemoMode: false,
          processedImageUrl: processed.previewUrl,
          analyzedAt: new Date().toISOString(),
        };
      } else if (error) {
        console.warn(
          "Supabase Edge Function 'analyze-waste' response note:",
          error.message || error
        );
      }
    } catch (err) {
      console.info(
        "Supabase Edge Function 'analyze-waste' not reachable, falling back to local simulation:",
        err
      );
    }

    // 3. Fallback: Realistic client-side simulator if Edge function is not yet deployed
    await new Promise((r) => setTimeout(r, 650));
    const sim = runClientSideSimulatedAnalysis(demoHint);
    sim.processedImageUrl = processed.previewUrl;
    return sim;
  },

  /**
   * Alias for backward compatibility
   */
  async classifyWasteImage(
    fileOrUrl: File | string,
    demoHint?: 'PLASTIC_BOTTLES' | 'PAPER' | 'CARDBOARD' | 'MIXED_WASTE' | 'LOW_CONFIDENCE'
  ): Promise<StructuredWasteAnalysis> {
    return this.analyzeWasteImage(fileOrUrl, demoHint);
  },
};
