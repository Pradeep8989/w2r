import { supabase } from '../lib/supabase';
import { WasteListing, MaterialCategory, RecyclerPartner } from '../types';

/**
 * Service to interact directly with Supabase Database and Realtime
 */
export const supabaseService = {
  // --- Listings ---
  async getListings(): Promise<{ data: WasteListing[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map snake_case DB columns to WasteListing camelCase if needed, or parse JSON columns
      const mappedListings: WasteListing[] = (data || []).map((row: any) => ({
        id: row.id,
        title: row.title,
        customerId: row.customer_id,
        customerName: row.customer_name,
        customerAddress: row.customer_address,
        locality: row.locality,
        createdAt: row.created_at,
        status: row.status,
        materials: typeof row.materials === 'string' ? JSON.parse(row.materials) : row.materials,
        estimatedValueMin: Number(row.estimated_value_min || 0),
        estimatedValueMax: Number(row.estimated_value_max || 0),
        photoUrl: row.photo_url || '',
        pickupPreference: row.pickup_preference,
        preferredPickupWindow: row.preferred_pickup_window,
        scheduledPickupDate: row.scheduled_pickup_date,
        collectedAt: row.collected_at,
        verifiedAt: row.verified_at,
        confirmedAt: row.confirmed_at,
        recyclerId: row.recycler_id,
        recyclerName: row.recycler_name,
        recyclerNotes: row.recycler_notes,
        contaminationNotes: row.contamination_notes,
        notes: row.notes,
        verifiedWeightKg: row.verified_weight_kg ? Number(row.verified_weight_kg) : undefined,
        rejectedWeightKg: row.rejected_weight_kg ? Number(row.rejected_weight_kg) : undefined,
        finalIndicativeValue: row.final_indicative_value ? Number(row.final_indicative_value) : undefined,
        rewardPointsEarned: row.reward_points_earned ? Number(row.reward_points_earned) : undefined,
        recoveryOutcome: row.recovery_outcome,
        statusTimeline: typeof row.status_timeline === 'string' ? JSON.parse(row.status_timeline) : (row.status_timeline || []),
      }));

      return { data: mappedListings, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  async createListing(listing: WasteListing): Promise<{ error: Error | null }> {
    try {
      const row = {
        id: listing.id,
        title: listing.title,
        customer_id: listing.customerId,
        customer_name: listing.customerName,
        customer_address: listing.customerAddress,
        locality: listing.locality,
        created_at: listing.createdAt,
        status: listing.status,
        materials: listing.materials,
        estimated_value_min: listing.estimatedValueMin,
        estimated_value_max: listing.estimatedValueMax,
        photo_url: listing.photoUrl,
        pickup_preference: listing.pickupPreference,
        preferred_pickup_window: listing.preferredPickupWindow,
        scheduled_pickup_date: listing.scheduledPickupDate,
        collected_at: listing.collectedAt,
        verified_at: listing.verifiedAt,
        confirmed_at: listing.confirmedAt,
        recycler_id: listing.recyclerId,
        recycler_name: listing.recyclerName,
        recycler_notes: listing.recyclerNotes,
        contaminationNotes: listing.contaminationNotes,
        notes: listing.notes,
        verified_weight_kg: listing.verifiedWeightKg,
        rejected_weight_kg: listing.rejectedWeightKg,
        final_indicative_value: listing.finalIndicativeValue,
        reward_points_earned: listing.rewardPointsEarned,
        recovery_outcome: listing.recoveryOutcome,
        status_timeline: listing.statusTimeline,
      };

      const { error } = await supabase.from('listings').insert(row);
      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  },

  async updateListing(listing: WasteListing): Promise<{ error: Error | null }> {
    try {
      const row = {
        title: listing.title,
        status: listing.status,
        materials: listing.materials,
        estimated_value_min: listing.estimatedValueMin,
        estimated_value_max: listing.estimatedValueMax,
        photo_url: listing.photoUrl,
        pickup_preference: listing.pickupPreference,
        preferred_pickup_window: listing.preferredPickupWindow,
        scheduled_pickup_date: listing.scheduledPickupDate,
        collected_at: listing.collectedAt,
        verified_at: listing.verifiedAt,
        confirmed_at: listing.confirmedAt,
        recycler_id: listing.recyclerId,
        recycler_name: listing.recyclerName,
        recycler_notes: listing.recyclerNotes,
        contamination_notes: listing.contaminationNotes,
        notes: listing.notes,
        verified_weight_kg: listing.verifiedWeightKg,
        rejected_weight_kg: listing.rejectedWeightKg,
        final_indicative_value: listing.finalIndicativeValue,
        reward_points_earned: listing.rewardPointsEarned,
        recovery_outcome: listing.recoveryOutcome,
        status_timeline: listing.statusTimeline,
      };

      const { error } = await supabase
        .from('listings')
        .update(row)
        .eq('id', listing.id);

      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  },

  async deleteListing(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.from('listings').delete().eq('id', id);
      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  },

  // --- Realtime subscription for listings ---
  subscribeToListings(onUpdate: () => void) {
    const channel = supabase
      .channel('public:listings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'listings' }, () => {
        onUpdate();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
