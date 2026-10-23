import { RecyclerPartner, WasteListing } from '../types';
import { storageService } from './storageService';

export const recyclerService = {
  getAll(): RecyclerPartner[] {
    return storageService.getRecyclers();
  },

  getActive(): RecyclerPartner[] {
    return storageService.getRecyclers().filter((r) => r.active);
  },

  getById(id: string): RecyclerPartner | undefined {
    return storageService.getRecyclers().find((r) => r.id === id);
  },

  findCompatibleRecyclers(materialCategoryIds: string[]): RecyclerPartner[] {
    const all = this.getActive();
    if (materialCategoryIds.length === 0) return all;

    return all.filter((recycler) => {
      // Must accept at least one of the listed materials
      return materialCategoryIds.some((matId) => recycler.acceptedMaterialIds.includes(matId));
    });
  },

  canRecyclerAcceptListing(recycler: RecyclerPartner, listing: WasteListing): {
    canAccept: boolean;
    reason?: string;
    matchedMaterials: string[];
    unmatchedMaterials: string[];
  } {
    const listingMatIds = listing.materials.map((m) => m.categoryId);
    const matched = listingMatIds.filter((id) => recycler.acceptedMaterialIds.includes(id));
    const unmatched = listingMatIds.filter((id) => !recycler.acceptedMaterialIds.includes(id));

    if (matched.length === 0) {
      return {
        canAccept: false,
        reason: `${recycler.name} does not accept materials in this listing (${listing.materials.map((m) => m.categoryName).join(', ')}).`,
        matchedMaterials: matched,
        unmatchedMaterials: unmatched,
      };
    }

    const totalEstimatedQty = listing.materials.reduce((acc, m) => acc + m.estimatedQuantity, 0);
    if (totalEstimatedQty < recycler.minQuantityKg) {
      return {
        canAccept: true, // Allow with warning
        reason: `Note: Minimum pickup quantity for this partner is ${recycler.minQuantityKg} kg (estimated is ${totalEstimatedQty} kg).`,
        matchedMaterials: matched,
        unmatchedMaterials: unmatched,
      };
    }

    return {
      canAccept: true,
      matchedMaterials: matched,
      unmatchedMaterials: unmatched,
    };
  },
};
