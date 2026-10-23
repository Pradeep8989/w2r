import { WasteListing, WasteListingStatus, TimelineEvent } from '../types';
import { storageService } from './storageService';

export const listingService = {
  getAll(): WasteListing[] {
    return storageService.getListings();
  },

  getById(id: string): WasteListing | undefined {
    return storageService.getListingById(id);
  },

  create(listingData: Omit<WasteListing, 'id' | 'createdAt' | 'status' | 'statusTimeline'>): WasteListing {
    const newId = `WTR-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const initialTimeline: TimelineEvent[] = [
      {
        status: 'awaiting_recycler',
        label: 'Listing Created',
        timestamp: now,
        actor: `${listingData.customerName} (Customer)`,
        notes: 'Broadcasted to compatible recovery partners.',
      },
    ];

    const newListing: WasteListing = {
      ...listingData,
      id: newId,
      createdAt: now,
      status: 'awaiting_recycler',
      statusTimeline: initialTimeline,
    };

    storageService.createListing(newListing);
    return newListing;
  },

  saveDraft(listingData: Omit<WasteListing, 'id' | 'createdAt' | 'status' | 'statusTimeline'>): WasteListing {
    const newId = `WTR-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const newListing: WasteListing = {
      ...listingData,
      id: newId,
      createdAt: now,
      status: 'draft',
      statusTimeline: [
        {
          status: 'draft',
          label: 'Saved as Draft',
          timestamp: now,
          actor: listingData.customerName,
          notes: 'Saved for future submission.',
        },
      ],
    };

    storageService.createListing(newListing);
    return newListing;
  },

  acceptByRecycler(listingId: string, recyclerId: string, recyclerName: string, notes?: string): WasteListing {
    const listing = storageService.getListingById(listingId);
    if (!listing) throw new Error(`Listing ${listingId} not found`);

    const now = new Date().toISOString();
    listing.status = 'recycler_accepted';
    listing.recyclerId = recyclerId;
    listing.recyclerName = recyclerName;
    if (notes) listing.recyclerNotes = notes;

    listing.statusTimeline.push({
      status: 'recycler_accepted',
      label: 'Accepted by Recycler',
      timestamp: now,
      actor: recyclerName,
      notes: notes || 'Listing accepted. Preparing pickup route assignment.',
    });

    storageService.updateListing(listing);

    storageService.addNotification({
      role: 'customer',
      title: 'Partner Accepted Your Listing!',
      message: `${recyclerName} accepted ${listing.id}. Pickup scheduling in progress.`,
      link: `/customer/listings/${listing.id}`,
    });

    return listing;
  },

  schedulePickup(listingId: string, scheduledDateStr: string, notes?: string): WasteListing {
    const listing = storageService.getListingById(listingId);
    if (!listing) throw new Error(`Listing ${listingId} not found`);

    const now = new Date().toISOString();
    listing.status = 'pickup_scheduled';
    listing.scheduledPickupDate = scheduledDateStr;

    listing.statusTimeline.push({
      status: 'pickup_scheduled',
      label: 'Pickup Window Scheduled',
      timestamp: now,
      actor: listing.recyclerName || 'Recycler Logistics',
      notes: notes || `Vehicle scheduled for ${scheduledDateStr}.`,
    });

    storageService.updateListing(listing);

    storageService.addNotification({
      role: 'customer',
      title: 'Pickup Confirmed!',
      message: `Pickup for ${listing.id} scheduled for ${scheduledDateStr}.`,
      link: `/customer/listings/${listing.id}`,
    });

    return listing;
  },

  markCollected(listingId: string, actorName = 'Route Driver', notes?: string): WasteListing {
    const listing = storageService.getListingById(listingId);
    if (!listing) throw new Error(`Listing ${listingId} not found`);

    const now = new Date().toISOString();
    listing.status = 'collected';
    listing.collectedAt = now;

    listing.statusTimeline.push({
      status: 'collected',
      label: 'Materials Collected',
      timestamp: now,
      actor: actorName,
      notes: notes || 'Material collected from customer location. En route to weighing facility.',
    });

    storageService.updateListing(listing);

    storageService.addNotification({
      role: 'customer',
      title: 'Waste Collected!',
      message: `Driver picked up your materials for ${listing.id}. Moving to certified weighing.`,
      link: `/customer/listings/${listing.id}`,
    });

    return listing;
  },

  verifyWeight(
    listingId: string,
    verifiedWeightKg: number,
    rejectedWeightKg: number,
    recoveryOutcome: string,
    weighmasterName = 'Facility Inspector',
    conditionNotes?: string
  ): WasteListing {
    const listing = storageService.getListingById(listingId);
    if (!listing) throw new Error(`Listing ${listingId} not found`);

    const now = new Date().toISOString();
    const materials = storageService.getMaterials();
    const primaryMat = listing.materials[0];
    const cat = materials.find((m) => m.id === primaryMat?.categoryId);

    const avgRate = cat ? (cat.ratePerKgMin + cat.ratePerKgMax) / 2 : 0.25;
    const finalVal = Math.round(verifiedWeightKg * avgRate * 100) / 100;

    listing.status = 'weight_verified';
    listing.verifiedWeightKg = verifiedWeightKg;
    listing.rejectedWeightKg = rejectedWeightKg;
    listing.finalIndicativeValue = finalVal;
    listing.recoveryOutcome = recoveryOutcome;
    listing.verifiedAt = now;
    if (conditionNotes) listing.contaminationNotes = conditionNotes;

    listing.statusTimeline.push({
      status: 'weight_verified',
      label: 'Weight & Quality Certified',
      timestamp: now,
      actor: weighmasterName,
      notes: `Gross verified: ${verifiedWeightKg} kg (Rejected: ${rejectedWeightKg} kg). Indicative value: $${finalVal.toFixed(2)}. ${recoveryOutcome}`,
    });

    storageService.updateListing(listing);
    return listing;
  },

  confirmRecovery(listingId: string, certifierName = 'Recycler Operations'): WasteListing {
    const listing = storageService.getListingById(listingId);
    if (!listing) throw new Error(`Listing ${listingId} not found`);

    const now = new Date().toISOString();
    const verifiedKg = listing.verifiedWeightKg || 5.0;

    // 20 Resource Points per verified kg recovered
    const pointsAwarded = Math.round(verifiedKg * 20);

    listing.status = 'recovery_confirmed';
    listing.confirmedAt = now;
    listing.rewardPointsEarned = pointsAwarded;

    listing.statusTimeline.push({
      status: 'recovery_confirmed',
      label: 'Recovery Verified & Closed',
      timestamp: now,
      actor: certifierName,
      notes: `Material safely routed to circular reprocessing. +${pointsAwarded} Resource Points credited to customer.`,
    });

    storageService.updateListing(listing);

    // Award reward points
    storageService.addRewardTransaction({
      listingId: listing.id,
      points: pointsAwarded,
      title: `Verified Material Recovery (${listing.id})`,
      description: `${verifiedKg} kg of ${listing.materials[0]?.categoryName || 'material'} successfully processed.`,
      type: 'earn',
    });

    // Update community challenge
    storageService.incrementCommunityChallenge(verifiedKg);

    // Unlock badges if appropriate
    if (listing.rejectedWeightKg === 0) {
      storageService.unlockBadge('badge_zero_contam');
    }
    if (listing.materials.some((m) => m.categoryId === 'pet_plastic') && verifiedKg >= 5) {
      storageService.unlockBadge('badge_plastic_hero');
    }

    return listing;
  },

  cancel(listingId: string, reason: string, actor = 'User'): WasteListing {
    const listing = storageService.getListingById(listingId);
    if (!listing) throw new Error(`Listing ${listingId} not found`);

    const now = new Date().toISOString();
    listing.status = 'cancelled';
    listing.statusTimeline.push({
      status: 'cancelled',
      label: 'Listing Cancelled',
      timestamp: now,
      actor,
      notes: reason,
    });

    storageService.updateListing(listing);
    return listing;
  },
};
