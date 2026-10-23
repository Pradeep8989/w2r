import {
  BoundedMaterial,
  ContaminationLevel,
  BOUNDED_MATERIAL_RULES,
} from '../data/materialRules';

export interface RouteRecommendation {
  route: string;
  routeDescription: string;
  processingType: string;
  isRecyclable: boolean;
  contaminationNotice?: string;
  cleaningAdvice?: string;
}

export const routeService = {
  /**
   * Deterministic, rule-based recovery route engine.
   * Gemini identifies the material & contamination; the application enforces the routing rules.
   */
  getRecoveryRoute(
    material: BoundedMaterial,
    contamination: ContaminationLevel = 'low'
  ): RouteRecommendation {
    const rule = BOUNDED_MATERIAL_RULES[material] || BOUNDED_MATERIAL_RULES['other plastic'];

    // If contamination is high, material may require pre-treatment or alternative route
    if (contamination === 'high') {
      if (rule.category === 'paper') {
        // High contamination on paper (oil/grease/mud) breaks paper hydropulping
        return {
          route: 'Composting / Reject Facility',
          routeDescription:
            'Severe food grease or chemical moisture ruins cellulose fibers and fouls hydropulping vats. Diverted away from standard paper mills.',
          processingType: 'Industrial Aerobic Composting or Refuse-Derived Fuel',
          isRecyclable: false,
          contaminationNotice: 'High Contamination: Not suitable for clean paper recycling.',
          cleaningAdvice: 'Severely soaked cardboard or food-stained paper cannot be washed. Separate clean sections with scissors or dispose in organics.',
        };
      }

      // Plastic with high contamination needs pre-wash but is still salvageable
      return {
        route: `${rule.baseRecoveryRoute} (Pre-Wash Required)`,
        routeDescription: `${rule.routeDescription} Must undergo industrial hot caustic pre-wash before shredding.`,
        processingType: `Industrial Wash Line & ${rule.processingType}`,
        isRecyclable: true,
        contaminationNotice: 'High Contamination: Material requires thorough cleaning before baling.',
        cleaningAdvice: 'Rinse with warm water and degreaser to remove solid food, oils, and chemical residue before collection.',
      };
    }

    if (contamination === 'medium') {
      return {
        route: rule.baseRecoveryRoute,
        routeDescription: rule.routeDescription,
        processingType: rule.processingType,
        isRecyclable: true,
        contaminationNotice: 'Medium Contamination: Light residue detected.',
        cleaningAdvice: 'A quick water rinse and air drying will maximize recovery value and prevent mold.',
      };
    }

    // Clean / Low contamination (Default optimum route)
    return {
      route: rule.baseRecoveryRoute,
      routeDescription: rule.routeDescription,
      processingType: rule.processingType,
      isRecyclable: true,
      contaminationNotice: 'Low Contamination: Ideal clean feedstock for circular processing.',
      cleaningAdvice: 'No additional cleaning needed. Ready for direct recovery pickup or drop-off.',
    };
  },
};
