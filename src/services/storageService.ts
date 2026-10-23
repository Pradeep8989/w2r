import {
  Role,
  WasteListing,
  MaterialCategory,
  RecyclerPartner,
  CollectionPoint,
  RewardTransaction,
  RewardBadge,
  CommunityChallenge,
  ClassificationEvaluationItem,
  EnvironmentalFactor,
  ActivityNotification,
  ImpactComparisonMetric,
} from '../types';
import {
  INITIAL_LISTINGS,
  INITIAL_RECYCLERS,
  INITIAL_COLLECTION_POINTS,
  INITIAL_REWARD_TRANSACTIONS,
  INITIAL_BADGES,
  INITIAL_COMMUNITY_CHALLENGE,
  INITIAL_EVALUATION_DATA,
  INITIAL_IMPACT_METRICS,
  INITIAL_NOTIFICATIONS,
} from '../data/seedData';
import { INITIAL_MATERIALS, INITIAL_ENVIRONMENTAL_FACTORS } from '../data/materials';
import { supabaseService } from './supabaseService';

const KEYS = {
  ROLE: 'wtr_active_role',
  LISTINGS: 'wtr_listings',
  MATERIALS: 'wtr_materials',
  RECYCLERS: 'wtr_recyclers',
  COLLECTION_POINTS: 'wtr_collection_points',
  REWARD_TRANSACTIONS: 'wtr_reward_transactions',
  BADGES: 'wtr_badges',
  CHALLENGE: 'wtr_community_challenge',
  EVALUATION: 'wtr_evaluation_data',
  IMPACT_METRICS: 'wtr_impact_metrics',
  FACTORS: 'wtr_environmental_factors',
  NOTIFICATIONS: 'wtr_notifications',
};

function safeGet<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (err) {
    console.warn(`Error parsing localStorage key "${key}", using default`, err);
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('wtr_data_changed'));
  } catch (err) {
    console.error(`Error saving to localStorage key "${key}"`, err);
  }
}

export const storageService = {
  // Role
  getCurrentRole(): Role {
    try {
      const role = localStorage.getItem(KEYS.ROLE) as Role;
      if (role === 'customer' || role === 'recycler' || role === 'admin') {
        return role;
      }
    } catch {
      // ignore
    }
    return 'customer';
  },

  setCurrentRole(role: Role): void {
    localStorage.setItem(KEYS.ROLE, role);
    window.dispatchEvent(new Event('wtr_role_changed'));
    window.dispatchEvent(new Event('wtr_data_changed'));
  },

  // Listings
  getListings(): WasteListing[] {
    return safeGet<WasteListing[]>(KEYS.LISTINGS, INITIAL_LISTINGS);
  },

  saveListings(listings: WasteListing[]): void {
    safeSet(KEYS.LISTINGS, listings);
  },

  getListingById(id: string): WasteListing | undefined {
    const list = this.getListings();
    return list.find((item) => item.id === id);
  },

  createListing(newListing: WasteListing): void {
    const list = this.getListings();
    const updated = [newListing, ...list];
    this.saveListings(updated);

    this.addNotification({
      role: 'customer',
      title: 'New Listing Published',
      message: `Listing ${newListing.id} created: ${newListing.title}`,
      link: `/customer/listings/${newListing.id}`,
    });

    // Asynchronously push to Supabase (graceful fallback if offline or table pending)
    supabaseService.createListing(newListing).catch((err) => {
      console.info('Supabase listing sync note:', err?.message || err);
    });
  },

  updateListing(updatedListing: WasteListing): void {
    const list = this.getListings();
    const index = list.findIndex((item) => item.id === updatedListing.id);
    if (index !== -1) {
      list[index] = updatedListing;
      this.saveListings([...list]);
    }

    // Asynchronously push update to Supabase
    supabaseService.updateListing(updatedListing).catch((err) => {
      console.info('Supabase listing update note:', err?.message || err);
    });
  },

  deleteListing(id: string): void {
    const list = this.getListings();
    const filtered = list.filter((l) => l.id !== id);
    this.saveListings(filtered);

    // Asynchronously delete from Supabase
    supabaseService.deleteListing(id).catch((err) => {
      console.info('Supabase listing deletion note:', err?.message || err);
    });
  },

  async syncWithSupabase(): Promise<boolean> {
    try {
      const { data, error } = await supabaseService.getListings();
      if (!error && data && data.length > 0) {
        // Merge Supabase listings into local storage
        const currentLocal = this.getListings();
        const localMap = new Map(currentLocal.map((item) => [item.id, item]));
        for (const item of data) {
          localMap.set(item.id, item);
        }
        const merged = Array.from(localMap.values());
        this.saveListings(merged);
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  },

  // Materials
  getMaterials(): MaterialCategory[] {
    return safeGet<MaterialCategory[]>(KEYS.MATERIALS, INITIAL_MATERIALS);
  },

  saveMaterials(materials: MaterialCategory[]): void {
    safeSet(KEYS.MATERIALS, materials);
  },

  updateMaterial(material: MaterialCategory): void {
    const list = this.getMaterials();
    const idx = list.findIndex((m) => m.id === material.id);
    if (idx !== -1) {
      list[idx] = material;
      this.saveMaterials([...list]);
    }
  },

  // Recyclers
  getRecyclers(): RecyclerPartner[] {
    return safeGet<RecyclerPartner[]>(KEYS.RECYCLERS, INITIAL_RECYCLERS);
  },

  saveRecyclers(recyclers: RecyclerPartner[]): void {
    safeSet(KEYS.RECYCLERS, recyclers);
  },

  updateRecycler(recycler: RecyclerPartner): void {
    const list = this.getRecyclers();
    const idx = list.findIndex((r) => r.id === recycler.id);
    if (idx !== -1) {
      list[idx] = recycler;
      this.saveRecyclers([...list]);
    }
  },

  // Collection Points
  getCollectionPoints(): CollectionPoint[] {
    return safeGet<CollectionPoint[]>(KEYS.COLLECTION_POINTS, INITIAL_COLLECTION_POINTS);
  },

  saveCollectionPoints(points: CollectionPoint[]): void {
    safeSet(KEYS.COLLECTION_POINTS, points);
  },

  // Rewards
  getRewardTransactions(): RewardTransaction[] {
    return safeGet<RewardTransaction[]>(KEYS.REWARD_TRANSACTIONS, INITIAL_REWARD_TRANSACTIONS);
  },

  getTotalPoints(): number {
    const txs = this.getRewardTransactions();
    return txs.reduce((acc, curr) => acc + curr.points, 0);
  },

  addRewardTransaction(tx: Omit<RewardTransaction, 'id' | 'timestamp'>): void {
    const txs = this.getRewardTransactions();
    const newTx: RewardTransaction = {
      ...tx,
      id: `tx_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    safeSet(KEYS.REWARD_TRANSACTIONS, [newTx, ...txs]);

    this.addNotification({
      role: 'customer',
      title: tx.points > 0 ? `+${tx.points} Resource Points Credited!` : `Points Redeemed: ${Math.abs(tx.points)} pts`,
      message: tx.description,
      link: '/customer/rewards',
    });
  },

  getBadges(): RewardBadge[] {
    return safeGet<RewardBadge[]>(KEYS.BADGES, INITIAL_BADGES);
  },

  unlockBadge(badgeId: string): void {
    const badges = this.getBadges();
    const b = badges.find((x) => x.id === badgeId);
    if (b && !b.unlocked) {
      b.unlocked = true;
      b.unlockedAt = new Date().toISOString();
      safeSet(KEYS.BADGES, [...badges]);

      this.addNotification({
        role: 'customer',
        title: `🏆 Badge Unlocked: ${b.name}!`,
        message: b.description,
        link: '/customer/rewards',
      });
    }
  },

  // Community Challenge
  getCommunityChallenge(): CommunityChallenge {
    return safeGet<CommunityChallenge>(KEYS.CHALLENGE, INITIAL_COMMUNITY_CHALLENGE);
  },

  incrementCommunityChallenge(addedKg: number): void {
    const chal = this.getCommunityChallenge();
    chal.currentKg = Math.min(chal.targetKg, chal.currentKg + addedKg);
    safeSet(KEYS.CHALLENGE, { ...chal });
  },

  // Evaluation dataset
  getEvaluationData(): ClassificationEvaluationItem[] {
    return safeGet<ClassificationEvaluationItem[]>(KEYS.EVALUATION, INITIAL_EVALUATION_DATA);
  },

  saveEvaluationData(data: ClassificationEvaluationItem[]): void {
    safeSet(KEYS.EVALUATION, data);
  },

  // Impact Metrics (Before vs After)
  getImpactMetrics(): ImpactComparisonMetric[] {
    return safeGet<ImpactComparisonMetric[]>(KEYS.IMPACT_METRICS, INITIAL_IMPACT_METRICS);
  },

  saveImpactMetrics(metrics: ImpactComparisonMetric[]): void {
    safeSet(KEYS.IMPACT_METRICS, metrics);
  },

  updateImpactMetric(metric: ImpactComparisonMetric): void {
    const list = this.getImpactMetrics();
    const idx = list.findIndex((m) => m.id === metric.id);
    if (idx !== -1) {
      list[idx] = metric;
      this.saveImpactMetrics([...list]);
    }
  },

  // Environmental Factors & Formulas
  getEnvironmentalFactors(): EnvironmentalFactor[] {
    return safeGet<EnvironmentalFactor[]>(KEYS.FACTORS, INITIAL_ENVIRONMENTAL_FACTORS);
  },

  saveEnvironmentalFactors(factors: EnvironmentalFactor[]): void {
    safeSet(KEYS.FACTORS, factors);
  },

  // Notifications
  getNotifications(): ActivityNotification[] {
    return safeGet<ActivityNotification[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },

  addNotification(notif: Omit<ActivityNotification, 'id' | 'timestamp' | 'read'>): void {
    const current = this.getNotifications();
    const newNotif: ActivityNotification = {
      ...notif,
      id: `notif_${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    safeSet(KEYS.NOTIFICATIONS, [newNotif, ...current]);
  },

  markNotificationsAsRead(): void {
    const current = this.getNotifications().map((n) => ({ ...n, read: true }));
    safeSet(KEYS.NOTIFICATIONS, current);
  },

  // Master Reset
  resetDemoData(): void {
    safeSet(KEYS.LISTINGS, INITIAL_LISTINGS);
    safeSet(KEYS.MATERIALS, INITIAL_MATERIALS);
    safeSet(KEYS.RECYCLERS, INITIAL_RECYCLERS);
    safeSet(KEYS.COLLECTION_POINTS, INITIAL_COLLECTION_POINTS);
    safeSet(KEYS.REWARD_TRANSACTIONS, INITIAL_REWARD_TRANSACTIONS);
    safeSet(KEYS.BADGES, INITIAL_BADGES);
    safeSet(KEYS.CHALLENGE, INITIAL_COMMUNITY_CHALLENGE);
    safeSet(KEYS.EVALUATION, INITIAL_EVALUATION_DATA);
    safeSet(KEYS.IMPACT_METRICS, INITIAL_IMPACT_METRICS);
    safeSet(KEYS.FACTORS, INITIAL_ENVIRONMENTAL_FACTORS);
    safeSet(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    localStorage.setItem(KEYS.ROLE, 'customer');
    window.dispatchEvent(new Event('wtr_data_changed'));
    window.dispatchEvent(new Event('wtr_role_changed'));
  },
};
