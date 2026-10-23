export type Role = 'customer' | 'recycler' | 'admin';

export type WasteListingStatus =
  | 'draft'
  | 'awaiting_recycler'
  | 'recycler_accepted'
  | 'pickup_scheduled'
  | 'collected'
  | 'weight_verified'
  | 'recovery_confirmed'
  | 'cancelled';

export interface MaterialCategory {
  id: string;
  name: string;
  category: 'plastics' | 'paper' | 'metals' | 'glass' | 'organics' | 'electronics' | 'mixed';
  description: string;
  unit: string;
  ratePerKgMin: number;
  ratePerKgMax: number;
  emissionFactorPerKg: number; // kg CO2e saved per kg recovered
  landfillDiversionRatio: number; // 0 to 1
  recoveryRoutes: string[];
  contaminationRules: string;
  active: boolean;
  color: string;
  bgColor: string;
  iconName: string;
  minimumQuantityKg: number;
}

export interface WasteListingMaterialItem {
  categoryId: string;
  categoryName: string;
  estimatedQuantity: number;
  unit: string;
  conditionNotes?: string;
  detectedConfidence?: number;
}

export interface TimelineEvent {
  status: WasteListingStatus;
  label: string;
  timestamp: string;
  actor: string;
  notes?: string;
}

export interface WasteListing {
  id: string;
  title: string;
  customerId: string;
  customerName: string;
  customerAddress: string;
  locality: string;
  createdAt: string;
  status: WasteListingStatus;
  materials: WasteListingMaterialItem[];
  estimatedValueMin: number;
  estimatedValueMax: number;
  photoUrl: string;
  pickupPreference: 'pickup' | 'dropoff';
  preferredPickupWindow?: string;
  scheduledPickupDate?: string;
  collectedAt?: string;
  verifiedAt?: string;
  confirmedAt?: string;
  recyclerId?: string;
  recyclerName?: string;
  recyclerNotes?: string;
  contaminationNotes?: string;
  notes?: string;
  verifiedWeightKg?: number;
  rejectedWeightKg?: number;
  finalIndicativeValue?: number;
  rewardPointsEarned?: number;
  recoveryOutcome?: string;
  statusTimeline: TimelineEvent[];
}

export interface RecyclerPartner {
  id: string;
  name: string;
  rating: number;
  reviewsCount: number;
  acceptedMaterialIds: string[];
  serviceArea: string;
  distanceKm: number;
  minQuantityKg: number;
  indicativePricingNote: string;
  nextPickupSlot: string;
  availableWindows: string[];
  active: boolean;
  contactEmail?: string;
  facilityType: string;
  verifiedRecoveryCount: number;
}

export interface CollectionPoint {
  id: string;
  name: string;
  locality: string;
  address: string;
  acceptedMaterialIds: string[];
  distanceKm: number;
  openingHours: string;
  dropoffInstructions: string;
  isSimulated?: boolean;
  coordinates: { lat: number; lng: number };
  managedBy: string;
}

export interface RewardTransaction {
  id: string;
  listingId?: string;
  points: number;
  title: string;
  description: string;
  timestamp: string;
  type: 'earn' | 'redeem';
}

export interface RewardBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  requirement: string;
}

export interface CommunityChallenge {
  id: string;
  title: string;
  targetKg: number;
  currentKg: number;
  participantsCount: number;
  daysRemaining: number;
  sponsorName: string;
  sponsorReward: string;
  category: string;
}

export interface ClassificationEvaluationItem {
  id: string;
  sampleId: string;
  filename: string;
  groundTruthCategory: string;
  predictedCategory: string;
  confidence: number;
  isCorrect: boolean;
  notes: string;
}

export interface EnvironmentalFactor {
  id: string;
  materialId: string;
  materialName: string;
  metric: string;
  factorValue: number;
  unit: string;
  source: string;
  verificationStatus: 'measured' | 'sourced' | 'hypothetical';
  formula: string;
  lastVerified: string;
}

export interface ActivityNotification {
  id: string;
  timestamp: string;
  role: Role;
  title: string;
  message: string;
  read: boolean;
  link?: string;
}

export interface ImpactComparisonMetric {
  id: string;
  metricName: string;
  baselineRate: number;
  prototypeRate: number;
  unit: string;
  baselineNumerator: number;
  baselineDenominator: number;
  prototypeNumerator: number;
  prototypeDenominator: number;
  description: string;
}
