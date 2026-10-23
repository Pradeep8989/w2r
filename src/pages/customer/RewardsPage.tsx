import React, { useState, useEffect } from 'react';
import {
  Award,
  Sparkles,
  Trophy,
  Flame,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  ShieldAlert,
  Tag,
  Gift,
  Users,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { storageService } from '../../services/storageService';
import { RewardTransaction, RewardBadge, CommunityChallenge } from '../../types';
import { useToast } from '../../components/ui/Toast';
import confetti from 'canvas-confetti';

export const RewardsPage: React.FC = () => {
  const { showToast } = useToast();
  const [totalPoints, setTotalPoints] = useState(0);
  const [transactions, setTransactions] = useState<RewardTransaction[]>([]);
  const [badges, setBadges] = useState<RewardBadge[]>([]);
  const [challenge, setChallenge] = useState<CommunityChallenge | null>(null);

  const loadData = () => {
    setTotalPoints(storageService.getTotalPoints());
    setTransactions(storageService.getRewardTransactions());
    setBadges(storageService.getBadges());
    setChallenge(storageService.getCommunityChallenge());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('wtr_data_changed', handleUpdate);
    return () => window.removeEventListener('wtr_data_changed', handleUpdate);
  }, []);

  const handleRedeemCoupon = (cost: number, couponTitle: string) => {
    if (totalPoints < cost) {
      showToast(`Insufficient Resource Points. You need ${cost} points.`, 'error');
      return;
    }

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
    });

    storageService.addRewardTransaction({
      points: -cost,
      title: `Redeemed: ${couponTitle}`,
      description: `Non-cash community voucher code generated: ECO-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'redeem',
    });

    showToast(`Successfully unlocked voucher: ${couponTitle}!`, 'success');
  };

  const sampleCoupons = [
    {
      id: 'c1',
      title: '15% Off Zero-Waste Household Starter Kit',
      sponsor: 'EcoLiving Collective',
      pointsCost: 100,
      validUntil: 'Nov 30, 2026',
    },
    {
      id: 'c2',
      title: 'Free Fair-Trade Roasted Coffee (Bring Reusable Mug)',
      sponsor: 'Green Roastery & Cafe',
      pointsCost: 75,
      validUntil: 'Dec 15, 2026',
    },
    {
      id: 'c3',
      title: '20% Off Biodegradable Garden Planters',
      sponsor: 'Urban Flora Co.',
      pointsCost: 150,
      validUntil: 'Nov 20, 2026',
    },
  ];

  const currentUser = storageService.getCurrentUser();
  const userName = currentUser?.name || 'You';

  const leaderboard = [
    { rank: 1, name: `${userName} (You)`, locality: 'Your Neighborhood', points: totalPoints, streak: totalPoints > 0 ? 'Active' : 'New', isUser: true },
    { rank: 2, name: 'Marcus Vance', locality: 'West Valley', points: 640, streak: '6 wks' },
    { rank: 3, name: 'Elena Rostova', locality: 'Civic Plaza', points: 410, streak: '4 wks' },
    { rank: 4, name: 'Jordan Hayes', locality: 'North Suburbs', points: 290, streak: '3 wks' },
    { rank: 5, name: 'Amina Al-Mansoor', locality: 'East Bay', points: 215, streak: '2 wks' },
  ]
    .sort((a, b) => b.points - a.points)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Resource Points &amp; Community Rewards
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Non-cash incentives celebrating verified circular recovery, community streak milestones, and neighborhood goals.
        </p>
      </div>

      {/* Strict Non-Cash Disclaimer */}
      <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Non-Financial Reward System Policy:</span> Resource Points have zero monetary or cash value. Points cannot be traded, withdrawn, or deposited into bank accounts or payment gateways. They are distributed exclusively upon certified physical material weighment to incentivize neighborhood circular recovery.
        </div>
      </div>

      {/* Points & Streak Hero Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-[#166534] to-[#14532d] text-white flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-emerald-200 font-bold block">
              Current Balance
            </span>
            <div className="text-4xl font-extrabold text-white mt-2 flex items-baseline gap-2">
              {totalPoints} <span className="text-sm font-semibold text-emerald-300">Resource Pts</span>
            </div>
            <p className="text-xs text-emerald-100/80 mt-1">
              Earned from verified physical material recoveries.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-emerald-800 text-xs flex items-center justify-between">
            <span className="text-emerald-200">Current Tier:</span>
            <span className="font-bold text-amber-300 bg-emerald-900/80 px-2 py-0.5 rounded-full border border-emerald-700">
              Silver Circular Steward
            </span>
          </div>
        </Card>

        {/* Streak Counter */}
        <Card className="p-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Active Recycling Streak
            </span>
            <div className="text-3xl font-extrabold text-slate-900">
              3 Consecutive Weeks
            </div>
            <p className="text-xs text-slate-500">
              Recycle once every 7 days to maintain your streak and earn +25 bonus points.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Next milestone: 4 Weeks</span>
            <span className="text-orange-600 font-bold">+50 pts</span>
          </div>
        </Card>

        {/* Community Challenge Widget */}
        <Card className="p-6 flex flex-col justify-between">
          {challenge ? (
            <>
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
                  Neighborhood Goal
                </span>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {challenge.title}
                </h4>
                <div>
                  <div className="flex justify-between text-xs mb-1 font-medium text-slate-600">
                    <span>{challenge.currentKg} / {challenge.targetKg} kg</span>
                    <span className="text-emerald-700 font-bold">
                      {Math.round((challenge.currentKg / challenge.targetKg) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#166534] rounded-full"
                      style={{ width: `${(challenge.currentKg / challenge.targetKg) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                <span>{challenge.daysRemaining} days left</span>
                <span className="text-emerald-700 font-semibold">{challenge.participantsCount} participants</span>
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400">Loading challenge...</div>
          )}
        </Card>
      </div>

      {/* Badges Grid */}
      <Card className="p-6">
        <CardHeader
          title="Achievement Badges"
          subtitle="Unlocked through verified sustainable behaviors and material recovery milestones"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                badge.unlocked
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-slate-50/70 border-slate-200/80 opacity-70'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  badge.unlocked
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {badge.unlocked ? (
                  <Sparkles className="w-5 h-5 text-emerald-200" />
                ) : (
                  <Lock className="w-5 h-5 text-slate-400" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-slate-900 text-xs">{badge.name}</h4>
                  {badge.unlocked && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{badge.description}</p>
                <div className="text-[10px] text-slate-400 mt-1.5 font-medium">
                  {badge.unlocked
                    ? `Unlocked: ${new Date(badge.unlockedAt || '').toLocaleDateString()}`
                    : `Requirement: ${badge.requirement}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Sponsor Vouchers & Community Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Illustrative Sponsor Vouchers */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-6">
            <CardHeader
              title="Redeem Illustrative Sponsor Coupons"
              subtitle="Exchange non-cash points for zero-waste partner perks"
            />
            <div className="space-y-3 mt-4">
              {sampleCoupons.map((coupon) => {
                const canAfford = totalPoints >= coupon.pointsCost;
                return (
                  <div
                    key={coupon.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {coupon.sponsor}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm mt-1">
                        {coupon.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Valid through {coupon.validUntil} &bull; Single-use voucher
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-bold text-amber-600">
                        {coupon.pointsCost} pts
                      </span>
                      <Button
                        size="sm"
                        variant={canAfford ? 'primary' : 'outline'}
                        disabled={!canAfford}
                        onClick={() => handleRedeemCoupon(coupon.pointsCost, coupon.title)}
                      >
                        {canAfford ? 'Redeem Voucher' : 'Need More Pts'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right: Community Leaderboard */}
        <div className="lg:col-span-5">
          <Card className="p-6">
            <CardHeader
              title="Neighborhood Leaderboard"
              subtitle="Top recovery stewards this month"
            />
            <div className="divide-y divide-slate-100 mt-2">
              {leaderboard.map((item) => (
                <div
                  key={item.rank}
                  className={`py-3 flex items-center justify-between text-xs ${
                    item.isUser ? 'bg-emerald-50/70 -mx-3 px-3 rounded-xl font-semibold' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        item.rank === 1
                          ? 'bg-amber-100 text-amber-700'
                          : item.rank === 2
                          ? 'bg-slate-200 text-slate-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {item.rank}
                    </span>
                    <div>
                      <div className="text-slate-900 font-bold">{item.name}</div>
                      <div className="text-[10px] text-slate-400">{item.locality}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-extrabold text-[#166534] block">
                      {item.points} pts
                    </span>
                    <span className="text-[10px] text-orange-600 font-medium">
                      🔥 {item.streak}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Points Ledger History */}
      <Card className="p-6">
        <CardHeader
          title="Points Transaction Ledger"
          subtitle="Audit log of all earned points and redeemed vouchers"
        />
        <div className="divide-y divide-slate-100 mt-2">
          {transactions.map((tx) => (
            <div key={tx.id} className="py-3 flex items-start justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 block">{tx.title}</span>
                <span className="text-slate-500 text-[11px] block mt-0.5">{tx.description}</span>
                <span className="text-slate-400 text-[10px] font-mono mt-0.5 block">
                  {new Date(tx.timestamp).toLocaleString()}
                </span>
              </div>
              <div
                className={`font-black text-sm shrink-0 ${
                  tx.points > 0 ? 'text-emerald-700' : 'text-slate-700'
                }`}
              >
                {tx.points > 0 ? `+${tx.points}` : tx.points} pts
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
