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
  UserSession,
} from '../types';
import {
  INITIAL_RECYCLERS,
  INITIAL_COLLECTION_POINTS,
  INITIAL_BADGES,
  INITIAL_COMMUNITY_CHALLENGE,
  INITIAL_EVALUATION_DATA,
  INITIAL_IMPACT_METRICS,
} from '../data/seedData';
import { INITIAL_MATERIALS, INITIAL_ENVIRONMENTAL_FACTORS } from '../data/materials';

const KEYS = {
  CURRENT_USER: 'wtr_current_user',
  USERS: 'wtr_registered_users',
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
  // Auth & Session
  getCurrentUser(): UserSession | null {
    return safeGet<UserSession | null>(KEYS.CURRENT_USER, null);
  },

  setCurrentUser(user: UserSession | null): void {
    if (user) {
      safeSet(KEYS.CURRENT_USER, user);
      localStorage.setItem(KEYS.ROLE, user.role);
    } else {
      localStorage.removeItem(KEYS.CURRENT_USER);
    }
    window.dispatchEvent(new Event('wtr_auth_changed'));
    window.dispatchEvent(new Event('wtr_role_changed'));
    window.dispatchEvent(new Event('wtr_data_changed'));
  },

  getRegisteredUsers(): UserSession[] {
    return safeGet<UserSession[]>(KEYS.USERS, []);
  },

  registerUser(userData: Omit<UserSession, 'id'> & { id?: string }): UserSession {
    const users = this.getRegisteredUsers();
    const existingIndex = users.findIndex(
      (u) => u.email.toLowerCase() === userData.email.toLowerCase()
    );
    const user: UserSession = {
      id: userData.id || (existingIndex >= 0 ? users[existingIndex].id : `usr_${Date.now()}`),
      name: userData.name,
      email: userData.email.toLowerCase(),
      role: userData.role,
    };

    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    safeSet(KEYS.USERS, users);
    return user;
  },

  logout(): void {
    localStorage.removeItem(KEYS.CURRENT_USER);
    window.dispatchEvent(new Event('wtr_auth_changed'));
    window.dispatchEvent(new Event('wtr_role_changed'));
    window.dispatchEvent(new Event('wtr_data_changed'));
  },

  // Role
  getCurrentRole(): Role {
    const user = this.getCurrentUser();
    if (user?.role) return user.role;
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
    const user = this.getCurrentUser();
    if (user && user.role !== role) {
      this.setCurrentUser({ ...user, role });
    }
    window.dispatchEvent(new Event('wtr_role_changed'));
    window.dispatchEvent(new Event('wtr_data_changed'));
  },

  // Listings - Cleaned to display only scratch entries
  getListings(): WasteListing[] {
    const raw = safeGet<WasteListing[]>(KEYS.LISTINGS, []);
    return raw.filter(
      (l) =>
        !l.id.startsWith('WTR-108') &&
        l.customerId !== 'usr_sarah' &&
        l.customerId !== 'usr_david' &&
        l.customerId !== 'usr_maya' &&
        l.customerName !== 'Sarah Jenkins' &&
        l.customerName !== 'David Chen' &&
        l.customerName !== 'Maya Rodriguez'
    );
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
  },

  updateListing(updatedListing: WasteListing): void {
    const list = this.getListings();
    const index = list.findIndex((item) => item.id === updatedListing.id);
    if (index !== -1) {
      list[index] = updatedListing;
      this.saveListings([...list]);
    }
  },

  deleteListing(id: string): void {
    const list = this.getListings();
    const filtered = list.filter((l) => l.id !== id);
    this.saveListings(filtered);
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
    const raw = safeGet<RewardTransaction[]>(KEYS.REWARD_TRANSACTIONS, []);
    return raw.filter((tx) => !tx.id.startsWith('tx_10') && tx.listingId !== 'WTR-1081');
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
    const defaultBadges = INITIAL_BADGES.map((b) => ({ ...b, unlocked: false, unlockedAt: undefined }));
    return safeGet<RewardBadge[]>(KEYS.BADGES, defaultBadges);
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
    const raw = safeGet<ActivityNotification[]>(KEYS.NOTIFICATIONS, []);
    return raw.filter((n) => !n.id.startsWith('notif_1') && !n.id.startsWith('notif_2') && !n.id.startsWith('notif_3'));
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
    safeSet(KEYS.LISTINGS, []);
    safeSet(KEYS.MATERIALS, INITIAL_MATERIALS);
    safeSet(KEYS.RECYCLERS, INITIAL_RECYCLERS);
    safeSet(KEYS.COLLECTION_POINTS, INITIAL_COLLECTION_POINTS);
    safeSet(KEYS.REWARD_TRANSACTIONS, []);
    safeSet(KEYS.BADGES, INITIAL_BADGES.map((b) => ({ ...b, unlocked: false, unlockedAt: undefined })));
    safeSet(KEYS.CHALLENGE, INITIAL_COMMUNITY_CHALLENGE);
    safeSet(KEYS.EVALUATION, INITIAL_EVALUATION_DATA);
    safeSet(KEYS.IMPACT_METRICS, INITIAL_IMPACT_METRICS);
    safeSet(KEYS.FACTORS, INITIAL_ENVIRONMENTAL_FACTORS);
    safeSet(KEYS.NOTIFICATIONS, []);
    this.logout();
    window.dispatchEvent(new Event('wtr_data_changed'));
    window.dispatchEvent(new Event('wtr_role_changed'));
  },
};

