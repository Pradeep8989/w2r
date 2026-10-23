import { BoundedMaterial, BOUNDED_MATERIAL_RULES } from '../data/materialRules';

export interface RewardEstimateResult {
  material: BoundedMaterial;
  displayName: string;
  weightKg: number;
  ratePerKg: number;
  pointsPerKg: number;
  estimatedPoints: number;
  isEstimated: true;
  disclaimer: string;
}

export const rewardService = {
  /**
   * Calculates the estimated reward points based on approximate user weight.
   * Final reward will be calculated using the verified weight after collection.
   */
  calculateEstimatedReward(material: BoundedMaterial, weightKg: number): RewardEstimateResult {
    const safeWeight = Math.max(0.1, Number(weightKg) || 0.1);
    const rule = BOUNDED_MATERIAL_RULES[material] || BOUNDED_MATERIAL_RULES['other plastic'];
    const ratePerKg = rule.rewardPointsPerKg;
    const estimatedPoints = Math.round(safeWeight * ratePerKg);

    return {
      material,
      displayName: rule.displayName,
      weightKg: Math.round(safeWeight * 10) / 10,
      ratePerKg,
      pointsPerKg: ratePerKg,
      estimatedPoints,
      isEstimated: true,
      disclaimer: 'Final reward will be calculated using the verified weight after collection.',
    };
  },

  getRateForMaterial(material: BoundedMaterial): number {
    return BOUNDED_MATERIAL_RULES[material]?.rewardPointsPerKg ?? 15;
  },
};
