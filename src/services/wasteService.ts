import { storageService } from './storageService';
import { listingService } from './listingService';
import { WasteListing, TimelineEvent, WasteListingStatus } from '../types';
import { BoundedMaterial, WasteCategory, ContaminationLevel } from '../data/materialRules';

export interface SubmitWasteParams {
  category: WasteCategory;
  material: BoundedMaterial;
  weightKg: number;
  recoveryRoute: string;
  estimatedRewardPoints: number;
  confidence: number;
  contamination: ContaminationLevel;
  reason: string;
  photoUrl?: string;
}

export interface WasteSubmissionResult {
  listingId: string;
  material: string;
  category: string;
  weightKg: number;
  recoveryRoute: string;
  estimatedRewardPoints: number;
  trackingStatus: string;
  createdAt: string;
}

export const TRACKING_STAGES = [
  'Submitted',
  'AI Classified',
  'Recovery Route Assigned',
  'Pickup Requested',
  'Collected',
  'Processing',
  'Recovered',
] as const;

export type TrackingStage = typeof TRACKING_STAGES[number];

class WasteService {
  /**
   * Submits a newly scanned and classified waste item for recovery
   */
  public submitScannedWaste(params: SubmitWasteParams): WasteSubmissionResult {
    const currentUser = storageService.getCurrentUser();
    const customerId = currentUser?.id || `usr_demo_${Date.now()}`;
    const customerName = currentUser?.name || 'Sustainable Citizen';

    const now = new Date();
    const nowIso = now.toISOString();

    // Map bounded material to an appropriate category ID
    const catId = params.category === 'plastic' ? 'mat_pet' : 'mat_cardboard';

    // Build timeline including initial stages: Submitted -> AI Classified -> Recovery Route Assigned
    const timeline: TimelineEvent[] = [
      {
        status: 'awaiting_recycler' as WasteListingStatus,
        label: 'Submitted for Recovery',
        timestamp: nowIso,
        actor: customerName,
        notes: `User submitted ${params.weightKg} kg of ${params.material}.`,
      },
      {
        status: 'awaiting_recycler' as WasteListingStatus,
        label: 'AI Classified',
        timestamp: new Date(now.getTime() + 1000).toISOString(),
        actor: 'Gemini Vision AI Engine',
        notes: `Identified as ${params.material} (${Math.round(params.confidence * 100)}% confidence). Contamination: ${params.contamination}.`,
      },
      {
        status: 'awaiting_recycler' as WasteListingStatus,
        label: 'Recovery Route Assigned',
        timestamp: new Date(now.getTime() + 2000).toISOString(),
        actor: 'Waste2Resource Route Engine',
        notes: `Assigned to optimal facility: ${params.recoveryRoute}.`,
      },
    ];

    const listing = listingService.create({
      title: `${params.material} (${params.weightKg} kg)`,
      customerId,
      customerName,
      customerAddress: '42 Pine Crest Ave, Apt 3B',
      locality: 'Greenwood District',
      photoUrl: params.photoUrl || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80',
      pickupPreference: 'pickup',
      estimatedValueMin: params.estimatedRewardPoints * 0.1, // cash equivalent indicative
      estimatedValueMax: params.estimatedRewardPoints * 0.15,
      materials: [
        {
          categoryId: catId,
          categoryName: params.material,
          estimatedQuantity: params.weightKg,
          unit: 'kg',
          conditionNotes: `${params.contamination} contamination. ${params.reason}`,
          detectedConfidence: params.confidence,
        },
      ],
      rewardPointsEarned: params.estimatedRewardPoints,
      notes: `AI Scan: ${params.reason}`,
    });

    // Update timeline with AI lifecycle
    listing.statusTimeline = timeline;
    storageService.updateListing(listing);

    // Credit estimated reward points to user transaction ledger
    storageService.addRewardTransaction({
      listingId: listing.id,
      points: params.estimatedRewardPoints,
      type: 'earn',
      title: `Recovered ${params.material}`,
      description: `Estimated reward for ${params.weightKg} kg of ${params.material}`,
    });

    return {
      listingId: listing.id,
      material: params.material,
      category: params.category,
      weightKg: params.weightKg,
      recoveryRoute: params.recoveryRoute,
      estimatedRewardPoints: params.estimatedRewardPoints,
      trackingStatus: 'Recovery Route Assigned',
      createdAt: nowIso,
    };
  }

  /**
   * Advances mock tracking progression for demonstration
   */
  public advanceMockProgression(listingId: string): WasteListing | null {
    const listing = storageService.getListingById(listingId);
    if (!listing) return null;

    const currentLabels = listing.statusTimeline.map((t) => t.label);
    const now = new Date().toISOString();

    if (!currentLabels.includes('Pickup Requested')) {
      listing.statusTimeline.push({
        status: 'pickup_scheduled',
        label: 'Pickup Requested',
        timestamp: now,
        actor: 'Logistics Dispatch',
        notes: 'Driver assigned for neighborhood collection route.',
      });
      listing.status = 'pickup_scheduled';
    } else if (!currentLabels.includes('Collected')) {
      listing.statusTimeline.push({
        status: 'collected',
        label: 'Collected',
        timestamp: now,
        actor: 'EcoHaul Van #12',
        notes: 'Material picked up and loaded for transport.',
      });
      listing.status = 'collected';
    } else if (!currentLabels.includes('Processing')) {
      listing.statusTimeline.push({
        status: 'weight_verified',
        label: 'Processing',
        timestamp: now,
        actor: 'Apex Circular Facility',
        notes: 'Bale sorting and optical flake screening in progress.',
      });
      listing.status = 'weight_verified';
    } else if (!currentLabels.includes('Recovered')) {
      listing.statusTimeline.push({
        status: 'recovery_confirmed',
        label: 'Recovered',
        timestamp: now,
        actor: 'Circular Polymer Remanufacturer',
        notes: '100% recycled pellet conversion verified. Reward finalized!',
      });
      listing.status = 'recovery_confirmed';
    }

    storageService.updateListing(listing);
    return listing;
  }
}

export const wasteService = new WasteService();
