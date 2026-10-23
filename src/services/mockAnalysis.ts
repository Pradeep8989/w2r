import { MaterialCategory } from '../types';
import { storageService } from './storageService';

export interface DetectedMaterial {
  categoryId: string;
  categoryName: string;
  confidence: number;
  percentageInStream: number;
  description: string;
  contaminationRisk: 'low' | 'moderate' | 'high';
  contaminationNotes: string;
  suggestedRoute: string;
  reuseTip: string;
}

export interface WasteAnalysisResult {
  analysisId: string;
  imageUrl: string;
  imageName: string;
  timestamp: string;
  overallConfidence: number;
  materials: DetectedMaterial[];
  defaultEstimatedQty: number;
  unit: string;
  isMultiCategory: boolean;
  indicativeValueMin: number;
  indicativeValueMax: number;
  disclaimer: string;
}

export const SAMPLE_SCENARIOS = {
  PLASTIC_BOTTLES: {
    id: 'sample_plastic',
    label: 'Try sample: Plastic bottle',
    image: '/samples/plastic_bottles.jpg',
    defaultQty: 3.5,
    materials: [
      {
        categoryId: 'pet_plastic',
        categoryName: 'PET Plastic (Bottles & Containers)',
        confidence: 0.94,
        percentageInStream: 100,
        description: 'Clear post-consumer PET #1 bottles with rigid caps.',
        contaminationRisk: 'low' as const,
        contaminationNotes: 'Labels detected. Minimal liquid residue detected.',
        suggestedRoute: 'Direct collection with certified mechanical recycler for bottle-to-bottle pelletizing.',
        reuseTip: 'Can be flattened and bundled dry for maximum density collection.',
      },
    ],
  },
  CARDBOARD: {
    id: 'sample_cardboard',
    label: 'Try sample: Cardboard',
    image: '/samples/cardboard.jpg',
    defaultQty: 7.0,
    materials: [
      {
        categoryId: 'cardboard',
        categoryName: 'Cardboard & Paperboard',
        confidence: 0.96,
        percentageInStream: 100,
        description: 'Double-wall corrugated shipping boxes and kraft cartons.',
        contaminationRisk: 'low' as const,
        contaminationNotes: 'Clean, unsoiled fibers. Remove packing tape where feasible.',
        suggestedRoute: 'Paper mill hydropulping for renewed packaging liner.',
        reuseTip: 'Flatten and tie with biodegradable twine to speed up recycler weight verification.',
      },
    ],
  },
  MIXED_WASTE: {
    id: 'sample_mixed',
    label: 'Try sample: Mixed waste',
    image: '/samples/mixed_waste.jpg',
    defaultQty: 5.5,
    materials: [
      {
        categoryId: 'aluminum',
        categoryName: 'Aluminium Cans & Clean Metals',
        confidence: 0.91,
        percentageInStream: 45,
        description: 'Clean aluminum beverage cans and food tins.',
        contaminationRisk: 'low' as const,
        contaminationNotes: 'Liquid residue minimal.',
        suggestedRoute: 'Secondary aluminum smelting with 95% energy savings.',
        reuseTip: 'High financial recovery value per kilogram.',
      },
      {
        categoryId: 'cardboard',
        categoryName: 'Cardboard & Paperboard',
        confidence: 0.88,
        percentageInStream: 35,
        description: 'Cereal boxes and paperboard packaging.',
        contaminationRisk: 'moderate' as const,
        contaminationNotes: 'Keep separated from liquid beverage cans to avoid moisture degradation.',
        suggestedRoute: 'Fiber repulping.',
        reuseTip: 'Store in dry indoor container.',
      },
      {
        categoryId: 'glass',
        categoryName: 'Glass Bottles & Jars',
        confidence: 0.85,
        percentageInStream: 20,
        description: 'Clear and amber beverage glass.',
        contaminationRisk: 'low' as const,
        contaminationNotes: 'Remove caps before collection.',
        suggestedRoute: 'Cullet glass remelting.',
        reuseTip: 'Handle gently to avoid breakage during transit.',
      },
    ],
  },
};

export const mockAnalysisService = {
  async runAnalysis(
    input: File | string,
    scenarioKey?: 'PLASTIC_BOTTLES' | 'CARDBOARD' | 'MIXED_WASTE'
  ): Promise<WasteAnalysisResult> {
    // Simulate neural network classification latency
    await new Promise((resolve) => setTimeout(resolve, 1100));

    const configuredMaterials = storageService.getMaterials();
    const matMap = new Map<string, MaterialCategory>();
    configuredMaterials.forEach((m) => matMap.set(m.id, m));

    let detectedMaterials: DetectedMaterial[] = [];
    let imageUrl = '';
    let imageName = 'uploaded_waste.jpg';
    let defaultQty = 3.0;

    if (scenarioKey && SAMPLE_SCENARIOS[scenarioKey]) {
      const scenario = SAMPLE_SCENARIOS[scenarioKey];
      imageUrl = scenario.image;
      imageName = scenario.id + '.jpg';
      defaultQty = scenario.defaultQty;
      detectedMaterials = scenario.materials;
    } else if (typeof input === 'string') {
      imageUrl = input;
      imageName = 'sample_image.jpg';
      detectedMaterials = SAMPLE_SCENARIOS.PLASTIC_BOTTLES.materials;
    } else if (input instanceof File) {
      imageUrl = URL.createObjectURL(input);
      imageName = input.name;

      // Smart classification heuristics based on file name or default
      const lower = input.name.toLowerCase();
      if (lower.includes('card') || lower.includes('box') || lower.includes('paper')) {
        detectedMaterials = SAMPLE_SCENARIOS.CARDBOARD.materials;
        defaultQty = 6.0;
      } else if (lower.includes('can') || lower.includes('metal') || lower.includes('mix')) {
        detectedMaterials = SAMPLE_SCENARIOS.MIXED_WASTE.materials;
        defaultQty = 4.5;
      } else {
        detectedMaterials = SAMPLE_SCENARIOS.PLASTIC_BOTTLES.materials;
        defaultQty = 3.0;
      }
    }

    // Calculate indicative values
    let valMin = 0;
    let valMax = 0;
    detectedMaterials.forEach((dm) => {
      const cat = matMap.get(dm.categoryId);
      const fraction = dm.percentageInStream / 100;
      const weightForMat = defaultQty * fraction;
      if (cat) {
        valMin += weightForMat * cat.ratePerKgMin;
        valMax += weightForMat * cat.ratePerKgMax;
      } else {
        valMin += weightForMat * 0.1;
        valMax += weightForMat * 0.2;
      }
    });

    const avgConfidence =
      detectedMaterials.reduce((acc, m) => acc + m.confidence, 0) / detectedMaterials.length;

    return {
      analysisId: `ana_${Date.now()}`,
      imageUrl,
      imageName,
      timestamp: new Date().toISOString(),
      overallConfidence: Math.round(avgConfidence * 100) / 100,
      materials: detectedMaterials,
      defaultEstimatedQty: defaultQty,
      unit: 'kg',
      isMultiCategory: detectedMaterials.length > 1,
      indicativeValueMin: Math.round(valMin * 100) / 100,
      indicativeValueMax: Math.round(valMax * 100) / 100,
      disclaimer: 'AI-assisted classification. Results are indicative and may vary based on image quality and material condition.',
    };
  },

  calculateIndicativeValue(
    materials: Array<{ categoryId: string; quantity: number }>,
    configuredMaterials: MaterialCategory[]
  ): { min: number; max: number } {
    let min = 0;
    let max = 0;
    const catMap = new Map(configuredMaterials.map((c) => [c.id, c]));

    materials.forEach((item) => {
      const cat = catMap.get(item.categoryId);
      if (cat) {
        min += item.quantity * cat.ratePerKgMin;
        max += item.quantity * cat.ratePerKgMax;
      }
    });

    return {
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
    };
  },
};

