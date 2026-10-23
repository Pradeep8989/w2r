import { supabase } from '../lib/supabase';
import {
  BoundedMaterial,
  WasteCategory,
  ContaminationLevel,
} from '../data/materialRules';
import { routeService } from './routeService';

export interface StructuredWasteAnalysis {
  category: WasteCategory;
  material: BoundedMaterial;
  confidence: number; // 0 to 1
  contamination: ContaminationLevel;
  recyclable: boolean;
  recommended_route: string;
  reason: string;
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
 * Compresses and resizes an image file using an HTML5 Canvas without losing visual fidelity.
 */
export async function preprocessImage(
  fileOrDataUrl: File | string,
  maxWidth = 1280,
  maxHeight = 1280,
  quality = 0.85
): Promise<{ base64: string; mimeType: string; previewUrl: string }> {
  return new Promise((resolve, reject) => {
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

      const mimeType = 'image/jpeg';
      const dataUrl = canvas.toDataURL(mimeType, quality);
      const base64 = dataUrl.split(',')[1] || '';

      resolve({
        base64,
        mimeType,
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
 * Realistic client-side fallback analyzer used when the Supabase Edge Function is not yet deployed.
 * Demonstrates deterministic, explainable AI responses bounded to Paper and Plastic.
 */
function runClientSideSimulatedAnalysis(
  hint?: 'PLASTIC_BOTTLES' | 'PAPER' | 'CARDBOARD' | 'MIXED_WASTE' | 'LOW_CONFIDENCE'
): StructuredWasteAnalysis {
  // Deterministic realistic demo patterns
  const now = new Date().toISOString();

  if (hint === 'LOW_CONFIDENCE') {
    return {
      category: 'plastic',
      material: 'other plastic',
      confidence: 0.58, // < 0.70 triggers low confidence workflow
      contamination: 'medium',
      recyclable: true,
      recommended_route: 'Manual Inspection Required',
      reason: 'The image has low lighting and blurred packaging details. Edge detection cannot verify resin code.',
      isLowConfidence: true,
      isDemoMode: true,
      analyzedAt: now,
    };
  }

  if (hint === 'CARDBOARD') {
    const route = routeService.getRecoveryRoute('corrugated cardboard', 'low');
    return {
      category: 'paper',
      material: 'corrugated cardboard',
      confidence: 0.96,
      contamination: 'low',
      recyclable: route.isRecyclable,
      recommended_route: route.route,
      reason: 'Detected corrugated fiberboard with characteristic fluted wave core and dry surface fibers.',
      isLowConfidence: false,
      isDemoMode: true,
      analyzedAt: now,
    };
  }

  if (hint === 'PAPER') {
    const route = routeService.getRecoveryRoute('office paper', 'low');
    return {
      category: 'paper',
      material: 'office paper',
      confidence: 0.94,
      contamination: 'low',
      recyclable: route.isRecyclable,
      recommended_route: route.route,
      reason: 'Detected stacked printed sheets of white bond paper with clean margins and minimal ink saturation.',
      isLowConfidence: false,
      isDemoMode: true,
      analyzedAt: now,
    };
  }

  if (hint === 'MIXED_WASTE') {
    const route = routeService.getRecoveryRoute('HDPE', 'medium');
    return {
      category: 'plastic',
      material: 'HDPE',
      confidence: 0.88,
      contamination: 'medium',
      recyclable: route.isRecyclable,
      recommended_route: route.route,
      reason: 'Identified rigid opaque detergent jug. Surface shows light liquid residue near spout.',
      isLowConfidence: false,
      isDemoMode: true,
      analyzedAt: now,
    };
  }

  // Default: PET Plastic bottle
  const route = routeService.getRecoveryRoute('PET', 'low');
  return {
    category: 'plastic',
    material: 'PET',
    confidence: 0.94,
    contamination: 'low',
    recyclable: route.isRecyclable,
    recommended_route: route.route,
    reason: 'Clear transparent container with characteristic injection gate base and screw thread geometry typical of PET (#1).',
    isLowConfidence: false,
    isDemoMode: true,
    analyzedAt: now,
  };
}

export const aiService = {
  /**
   * Alias for classifyWasteImage
   */
  async analyzeWasteImage(
    fileOrUrl: File | string,
    demoHint?: 'PLASTIC_BOTTLES' | 'PAPER' | 'CARDBOARD' | 'MIXED_WASTE' | 'LOW_CONFIDENCE'
  ): Promise<StructuredWasteAnalysis> {
    return this.classifyWasteImage(fileOrUrl, demoHint);
  },

  /**
   * Main entry point to analyze waste imagery.
   * Secure Architecture:
   *  1. Preprocesses & compresses image.
   *  2. Invokes Supabase Edge Function 'classify-waste' (where GEMINI_API_KEY lives safely).
   *  3. If Edge Function is offline or pending deployment, seamlessly switches to demo simulation.
   */
  async classifyWasteImage(
    fileOrUrl: File | string,
    demoHint?: 'PLASTIC_BOTTLES' | 'PAPER' | 'CARDBOARD' | 'MIXED_WASTE' | 'LOW_CONFIDENCE'
  ): Promise<StructuredWasteAnalysis> {
    // 1. Client-side preprocessing (validate, resize, compress, base64)
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

    // 2. Attempt secure backend Supabase Edge Function invocation
    try {
      const { data, error } = await supabase.functions.invoke('classify-waste', {
        body: {
          image: processed.base64,
          mimeType: processed.mimeType,
        },
      });

      if (!error && data && data.material) {
        // Enforce rule-based route recommendation
        const route = routeService.getRecoveryRoute(data.material, data.contamination || 'low');

        const confidence = Number(data.confidence ?? 0.92);
        return {
          category: data.category === 'paper' ? 'paper' : 'plastic',
          material: data.material,
          confidence,
          contamination: data.contamination || 'low',
          recyclable: data.recyclable ?? route.isRecyclable,
          recommended_route: route.route,
          reason: data.reason || 'AI Vision detected characteristics matching standard circular streams.',
          isLowConfidence: confidence < 0.70,
          isDemoMode: false,
          processedImageUrl: processed.previewUrl,
          analyzedAt: new Date().toISOString(),
        };
      }
    } catch (err) {
      console.info('Supabase Edge Function not reachable, engaging client-side AI simulator:', err);
    }

    // 3. Graceful fallback: Realistic client-side simulator
    // Simulates a realistic network inference delay (700ms)
    await new Promise((r) => setTimeout(r, 700));

    const sim = runClientSideSimulatedAnalysis(demoHint);
    sim.processedImageUrl = processed.previewUrl;
    return sim;
  },
};
