import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  X,
  Crown,
  Check,
  Sparkles,
  Heart,
  ShieldCheck,
  Zap,
  RotateCcw,
  Lightbulb,
  Shuffle,
  PlusCircle,
  Gift,
  Coins,
  CreditCard,
  QrCode,
  ShoppingBag,
  TrendingUp,
  Palette,
  Eye,
  CheckCircle2,
  Lock,
  ArrowRight,
  Clock,
  Flame,
  Radio,
  Tv,
} from 'lucide-react';
import { sounds } from '../utils/audio';
import { triggerHaptic, getTodayDateString } from '../utils/storage';
import { PlayerProfile, ItemThemeId } from '../types/game';
import { GAME_THEMES } from '../data/themes';

export interface VipModalProps {
  isOpen: boolean;
  profile: PlayerProfile;
  isOnline?: boolean;
  initialTab?: 'vip' | 'coins' | 'boosters' | 'themes';
  onUpgradeVip: (tier: 'lifetime' | 'weekly', priceLabel: string, method: string) => void;
  onBuyCoins: (amount: number, bonusCoins: number, label: string, priceLabel: string, method: string) => void;
  onBuyBooster: (
    type: 'undo' | 'hint' | 'shuffle' | 'extraBottle' | 'bundle',
    count: number,
    costCoins: number,
    itemTitle: string
  ) => boolean;
  onClaimVipDailyGift?: () => void;
  onWatchAdForCoins?: () => void;
  onSelectTheme?: (themeId: ItemThemeId) => void;
  onBuyTheme?: (themeId: ItemThemeId, cost: number) => void;
  onClose: () => void;
}

type ShopTab = 'vip' | 'coins' | 'boosters' | 'themes';

interface PurchaseTarget {
  type: 'vip_lifetime' | 'vip_weekly' | 'coin_pack' | 'booster' | 'theme';
  title: string;
  subtitle: string;
  price: string;
  priceNum: number;
  currency: string;
  isCoinsPayment?: boolean;
  coinsCost?: number;
  data: any;
}

export const VipModal: React.FC<VipModalProps> = ({
  isOpen,
  profile,
  isOnline = true,
  initialTab = 'vip',
  onUpgradeVip,
  onBuyCoins,
  onBuyBooster,
  onClaimVipDailyGift,
  onWatchAdForCoins,
  onSelectTheme,
  onBuyTheme,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<ShopTab>(initialTab);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'gplay' | 'upi' | 'card' | 'paypal'>('gplay');
  const [activeCheckout, setActiveCheckout] = useState<PurchaseTarget | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successReceipt, setSuccessReceipt] = useState<{
    orderId: string;
    itemTitle: string;
    amount: string;
    timestamp: number;
  } | null>(null);

  // Store Freebie Timer (4-hour countdown simulator)
  const [storeFreebieClaimed, setStoreFreebieClaimed] = useState<boolean>(() => {
    try {
      const last = localStorage.getItem('sm_last_store_freebie');
      if (!last) return false;
      return Date.now() - parseInt(last, 10) < 4 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setActiveCheckout(null);
      setSuccessReceipt(null);
      setIsProcessing(false);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const isVip = profile.vipAdFree;
  const currencySymbol = profile.preferredCurrency === 'INR' ? '₹' : '$';
  const todayStr = getTodayDateString();
  const hasClaimedVipDaily = profile.lastVipDailyClaimDate === todayStr;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'],
      });
    } catch {
      // Confetti fallback
    }
  };

  // Claim Store 4-Hour Freebie (50 Coins + 1 Free Undo)
  const handleClaimStoreFreebie = () => {
    if (storeFreebieClaimed) return;
    sounds.playCoin();
    triggerHaptic();
    triggerConfetti();
    try {
      localStorage.setItem('sm_last_store_freebie', Date.now().toString());
    } catch {
      // Ignored
    }
    setStoreFreebieClaimed(true);
    onBuyCoins(50, 0, 'Store 4-Hour Freebie Gift', 'FREE', 'free_gift');
    onBuyBooster('undo', 1, 0, 'Store 4-Hour Freebie Undo');
  };

  // Initiate purchase flow
  const startCheckout = (target: PurchaseTarget) => {
    sounds.playClick();
    triggerHaptic();
    if (target.isCoinsPayment) {
      // Direct In-Game Coin deduction
      if (profile.coins < (target.coinsCost || 0)) {
        sounds.playError();
        setActiveTab('coins');
        return;
      }

      const success = onBuyBooster(
        target.data.boosterType,
        target.data.count,
        target.coinsCost || 0,
        target.title
      );
      if (success) {
        sounds.playPowerup();
        triggerConfetti();
        setSuccessReceipt({
          orderId: `COIN-${Math.floor(100000 + Math.random() * 900000)}`,
          itemTitle: target.title,
          amount: `${target.coinsCost} Coins`,
          timestamp: Date.now(),
        });
      }
      return;
    }

    setActiveCheckout(target);
  };

  // Execute Simulated Payment Transaction
  const handleExecutePayment = () => {
    if (!activeCheckout) return;
    setIsProcessing(true);
    sounds.playClick();
    triggerHaptic();

    setTimeout(() => {
      setIsProcessing(false);
      const generatedOrderId = `GPA.${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

      if (activeCheckout.type === 'vip_lifetime') {
        onUpgradeVip('lifetime', activeCheckout.price, selectedPaymentMethod);
      } else if (activeCheckout.type === 'vip_weekly') {
        onUpgradeVip('weekly', activeCheckout.price, selectedPaymentMethod);
      } else if (activeCheckout.type === 'coin_pack') {
        onBuyCoins(
          activeCheckout.data.amount,
          activeCheckout.data.bonusCoins,
          activeCheckout.title,
          activeCheckout.price,
          selectedPaymentMethod
        );
      }

      sounds.playWin();
      triggerConfetti();
      setSuccessReceipt({
        orderId: generatedOrderId,
        itemTitle: activeCheckout.title,
        amount: activeCheckout.price,
        timestamp: Date.now(),
      });
      setActiveCheckout(null);
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-lg max-h-[92vh] overflow-hidden rounded-3xl bg-slate-900 border border-amber-500/40 shadow-2xl text-white flex flex-col"
        >
          {/* Top Header Bar */}
          <div className="p-4 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-2xl bg-gradient-to-br from-amber-500/30 to-yellow-600/20 text-amber-400 border border-amber-500/40 shadow-lg shadow-amber-500/10">
                <Crown className="w-6 h-6 fill-amber-400" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-black text-white tracking-wide">Sort Master VIP & Shop</h3>
                  {isVip && (
                    <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-[10px] font-black tracking-wider uppercase shadow">
                      VIP ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-xs text-amber-400/90 font-medium">
                  {isVip ? 'Exclusive VIP Benefactor Perks & Store' : 'Unlock Infinite Lives, Boosters & Ad-Free Play'}
                </p>
              </div>
            </div>

            {/* Coins Balance & Close */}
            <div className="flex items-center space-x-2.5">
              <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 rounded-2xl border border-amber-500/30 text-amber-300 text-xs font-bold font-mono shadow-inner">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>{profile.coins.toLocaleString()}</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Category Tabs */}
          <div className="grid grid-cols-4 p-1.5 bg-slate-950/60 border-b border-slate-800 text-xs font-bold gap-1">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('vip');
              }}
              className={`py-2 px-1 rounded-xl flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                activeTab === 'vip'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>VIP Pass</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('coins');
              }}
              className={`py-2 px-1 rounded-xl flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                activeTab === 'coins'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Coin Vault</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('boosters');
              }}
              className={`py-2 px-1 rounded-xl flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                activeTab === 'boosters'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Power-ups</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('themes');
              }}
              className={`py-2 px-1 rounded-xl flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                activeTab === 'themes'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Themes</span>
            </button>
          </div>

          {/* TAB CONTENTS SCROLLABLE BODY */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {/* 1. VIP PASS TAB */}
            {activeTab === 'vip' && (
              <div className="space-y-4">
                {/* Royal VIP Card Banner */}
                <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-amber-950/90 via-slate-900 to-yellow-950/90 border border-amber-500/60 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-2 px-7 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-[10px] tracking-wider uppercase rotate-12 shadow-lg">
                    {isVip ? 'MEMBERSHIP' : '👑 BEST VALUE'}
                  </div>

                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-inner">
                      <Crown className="w-7 h-7 fill-amber-400 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-amber-300">Sort Master Royal VIP Pass</h4>
                      <p className="text-xs text-slate-300">
                        {isVip ? 'Active Status: Lifetime Royal Benefactor' : 'Permanent One-Time Lifetime Membership'}
                      </p>
                    </div>
                  </div>

                  {/* VIP Perks List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-3.5 text-xs text-slate-200">
                    <div className="flex items-center space-x-2 p-2 rounded-xl bg-slate-950/50 border border-amber-500/20">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>100% Ad-Free</strong> – Zero popups or interruptions</span>
                    </div>

                    <div className="flex items-center space-x-2 p-2 rounded-xl bg-slate-950/50 border border-amber-500/20">
                      <Heart className="w-4 h-4 text-rose-400 fill-rose-400 shrink-0" />
                      <span><strong>Infinite Lives ❤️</strong> – Play non-stop with zero wait</span>
                    </div>

                    <div className="flex items-center space-x-2 p-2 rounded-xl bg-slate-950/50 border border-amber-500/20">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <span><strong>Instant +1,000 In-Game Coins & Royal VIP Status</strong></span>
                    </div>

                    <div className="flex items-center space-x-2 p-2 rounded-xl bg-slate-950/50 border border-amber-500/20">
                      <Gift className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span><strong>Daily VIP Care Package</strong> (+100 Coins & Boosters)</span>
                    </div>

                    <div className="flex items-center space-x-2 p-2 rounded-xl bg-slate-950/50 border border-amber-500/20">
                      <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>+20% Extra Level Cash Points</strong> passive booster</span>
                    </div>

                    <div className="flex items-center space-x-2 p-2 rounded-xl bg-slate-950/50 border border-amber-500/20">
                      <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                      <span><strong>Royal Crown Avatar Badge</strong> on leaderboards</span>
                    </div>
                  </div>

                  {/* VIP Actions */}
                  {isVip ? (
                    <div className="space-y-2 mt-2">
                      <div className="w-full py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-center text-xs flex items-center justify-center space-x-2 shadow-inner">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>VIP Status Active (Lifetime Access)</span>
                      </div>

                      {/* Daily VIP Care Package Button */}
                      <button
                        type="button"
                        disabled={hasClaimedVipDaily}
                        onClick={() => {
                          if (hasClaimedVipDaily) return;
                          sounds.playWin();
                          triggerHaptic();
                          triggerConfetti();
                          onClaimVipDailyGift?.();
                        }}
                        className={`w-full py-3 rounded-2xl text-xs font-black flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                          !hasClaimedVipDaily
                            ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/30 active:scale-98 animate-pulse'
                            : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                        }`}
                      >
                        <Gift className="w-4 h-4" />
                        <span>
                          {hasClaimedVipDaily
                            ? '✅ Today\'s VIP Care Package Claimed (Come back tomorrow)'
                            : '🎁 Claim Today\'s VIP Care Package (+100 Coins & 3 Boosters!)'}
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      {/* Lifetime VIP Pass Option */}
                      <button
                        type="button"
                        onClick={() =>
                          startCheckout({
                            type: 'vip_lifetime',
                            title: 'VIP Lifetime Pass',
                            subtitle: 'Ad-Free • Infinite Lives • +1,000 In-Game Coins',
                            price: profile.preferredCurrency === 'INR' ? '₹349.00' : '$3.99',
                            priceNum: profile.preferredCurrency === 'INR' ? 349 : 3.99,
                            currency: profile.preferredCurrency || 'INR',
                            data: { tier: 'lifetime' },
                          })
                        }
                        className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/30 flex flex-col items-center justify-center space-y-1 transition-all active:scale-98 cursor-pointer ring-2 ring-yellow-300/40"
                      >
                        <div className="flex items-center space-x-1.5">
                          <Crown className="w-4 h-4 fill-slate-950" />
                          <span className="text-sm font-black">Lifetime VIP Pass</span>
                        </div>
                        <span className="text-xs bg-slate-950/20 px-2.5 py-0.5 rounded-full font-extrabold">
                          {profile.preferredCurrency === 'INR' ? '₹349.00 / One-Time' : '$3.99 / One-Time'}
                        </span>
                      </button>

                      {/* 7-Day Royal Pass Option */}
                      <button
                        type="button"
                        onClick={() =>
                          startCheckout({
                            type: 'vip_weekly',
                            title: '7-Day Royal Pass',
                            subtitle: 'Ad-Free • Infinite Lives for 7 full days',
                            price: profile.preferredCurrency === 'INR' ? '₹79.00' : '$0.99',
                            priceNum: profile.preferredCurrency === 'INR' ? 79 : 0.99,
                            currency: profile.preferredCurrency || 'INR',
                            data: { tier: 'weekly' },
                          })
                        }
                        className="p-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-bold text-xs shadow-lg flex flex-col items-center justify-center space-y-1 transition-all active:scale-98 cursor-pointer"
                      >
                        <div className="flex items-center space-x-1.5">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span className="text-sm font-black">7-Day VIP Pass</span>
                        </div>
                        <span className="text-xs text-slate-300 font-semibold">
                          {profile.preferredCurrency === 'INR' ? '₹79.00 / 7 Days' : '$0.99 / 7 Days'}
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {/* VIP Perks Comparison Table */}
                <div className="p-4 rounded-3xl bg-slate-950/60 border border-slate-800 text-xs">
                  <h5 className="font-extrabold text-white text-xs uppercase tracking-wider mb-3 flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Free Player vs VIP Member</span>
                  </h5>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                      <span className="text-slate-300">Energy & Lives</span>
                      <div className="flex items-center space-x-4 font-semibold">
                        <span className="text-slate-500">5 Lives (15m recharge)</span>
                        <span className="text-amber-400 font-black">❤️ Infinite (No wait)</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                      <span className="text-slate-300">Interstitial Ads</span>
                      <div className="flex items-center space-x-4 font-semibold">
                        <span className="text-slate-500">Between Levels</span>
                        <span className="text-emerald-400 font-black">100% Disabled 🚫</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                      <span className="text-slate-300">Daily Care Package</span>
                      <div className="flex items-center space-x-4 font-semibold">
                        <span className="text-slate-500">Standard Daily</span>
                        <span className="text-cyan-400 font-black">+100 🪙 & 3 Boosters</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-slate-300">Level Points Rate</span>
                      <div className="flex items-center space-x-4 font-semibold">
                        <span className="text-slate-500">1.0× Normal</span>
                        <span className="text-amber-300 font-black">1.2× VIP Boost ⚡</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. COIN VAULT TAB */}
            {activeTab === 'coins' && (
              <div className="space-y-4">
                {/* Free Coins & Store Bonuses Row */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Free Video Reward */}
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      onWatchAdForCoins?.();
                    }}
                    className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/80 to-slate-900 border border-indigo-500/40 text-left transition-all hover:border-indigo-400 active:scale-98 cursor-pointer shadow-lg relative"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-2xl">🎬</span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-black border border-indigo-500/30">
                        FREE
                      </span>
                    </div>
                    <div className="text-sm font-black text-white">+100 Free Coins</div>
                    <div className="text-[11px] text-slate-300 mt-1">Watch a short video sponsor</div>
                  </button>

                  {/* 4-Hour Store Freebie Gift */}
                  <button
                    type="button"
                    disabled={storeFreebieClaimed}
                    onClick={handleClaimStoreFreebie}
                    className={`p-3.5 rounded-2xl border text-left transition-all shadow-lg relative ${
                      !storeFreebieClaimed
                        ? 'bg-gradient-to-br from-emerald-950/80 to-slate-900 border-emerald-500/50 hover:border-emerald-400 active:scale-98 cursor-pointer animate-pulse'
                        : 'bg-slate-900/60 border-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-2xl">🎁</span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${
                          !storeFreebieClaimed
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}
                      >
                        {!storeFreebieClaimed ? 'READY' : 'CLAIMED'}
                      </span>
                    </div>
                    <div className="text-sm font-black text-white">+50 🪙 + 1 Undo</div>
                    <div className="text-[11px] text-slate-300 mt-1">
                      {!storeFreebieClaimed ? 'Claim 4-Hour Store Gift' : 'Available in next cycle'}
                    </div>
                  </button>
                </div>

                {/* Coin Packages Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {/* Tier 1: Handful */}
                  <div
                    onClick={() =>
                      startCheckout({
                        type: 'coin_pack',
                        title: 'Pouch of Coins',
                        subtitle: '500 In-Game Coins',
                        price: profile.preferredCurrency === 'INR' ? '₹79.00' : '$0.99',
                        priceNum: profile.preferredCurrency === 'INR' ? 79 : 0.99,
                        currency: profile.preferredCurrency || 'INR',
                        data: { amount: 500, bonusCoins: 0 },
                      })
                    }
                    className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 flex flex-col items-center text-center transition-all cursor-pointer active:scale-98 shadow-md"
                  >
                    <div className="text-3xl mb-1">🪙</div>
                    <div className="font-black text-sm text-white">500 Coins</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Starter Stash</div>
                    <div className="w-full mt-2.5 py-1.5 px-3 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-300 font-black text-xs">
                      {profile.preferredCurrency === 'INR' ? '₹79.00' : '$0.99'}
                    </div>
                  </div>

                  {/* Tier 2: Sack */}
                  <div
                    onClick={() =>
                      startCheckout({
                        type: 'coin_pack',
                        title: 'Sack of Coins',
                        subtitle: '1,400 Coins (Includes +200 Bonus)',
                        price: profile.preferredCurrency === 'INR' ? '₹159.00' : '$1.99',
                        priceNum: profile.preferredCurrency === 'INR' ? 159 : 1.99,
                        currency: profile.preferredCurrency || 'INR',
                        data: { amount: 1200, bonusCoins: 200 },
                      })
                    }
                    className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-amber-500/40 hover:border-amber-400 flex flex-col items-center text-center transition-all cursor-pointer active:scale-98 shadow-md relative"
                  >
                    <div className="absolute -top-2 right-2 px-2 py-0.5 bg-emerald-500 text-slate-950 text-[9px] font-black rounded-full shadow">
                      +200 BONUS
                    </div>
                    <div className="text-3xl mb-1">💰</div>
                    <div className="font-black text-sm text-white">1,400 Coins</div>
                    <div className="text-[10px] text-emerald-400 font-bold mt-0.5">+16% Extra</div>
                    <div className="w-full mt-2.5 py-1.5 px-3 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-300 font-black text-xs">
                      {profile.preferredCurrency === 'INR' ? '₹159.00' : '$1.99'}
                    </div>
                  </div>

                  {/* Tier 3: Chest (Popular) */}
                  <div
                    onClick={() =>
                      startCheckout({
                        type: 'coin_pack',
                        title: 'Chest of Coins',
                        subtitle: '4,500 Coins (Includes +1,000 Bonus)',
                        price: profile.preferredCurrency === 'INR' ? '₹399.00' : '$4.99',
                        priceNum: profile.preferredCurrency === 'INR' ? 399 : 4.99,
                        currency: profile.preferredCurrency || 'INR',
                        data: { amount: 3500, bonusCoins: 1000 },
                      })
                    }
                    className="p-3.5 rounded-2xl bg-gradient-to-b from-amber-950/40 to-slate-900 border border-amber-500/60 hover:border-amber-400 flex flex-col items-center text-center transition-all cursor-pointer active:scale-98 shadow-lg relative ring-1 ring-amber-500/30"
                  >
                    <div className="absolute -top-2 right-2 px-2 py-0.5 bg-amber-500 text-slate-950 text-[9px] font-black rounded-full shadow">
                      POPULAR ⭐
                    </div>
                    <div className="text-3xl mb-1">👑</div>
                    <div className="font-black text-sm text-amber-300">4,500 Coins</div>
                    <div className="text-[10px] text-emerald-400 font-bold mt-0.5">+1,000 Bonus</div>
                    <div className="w-full mt-2.5 py-1.5 px-3 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-black text-xs">
                      {profile.preferredCurrency === 'INR' ? '₹399.00' : '$4.99'}
                    </div>
                  </div>

                  {/* Tier 4: Treasury (Best Value) */}
                  <div
                    onClick={() =>
                      startCheckout({
                        type: 'coin_pack',
                        title: 'Royal Treasury of Coins',
                        subtitle: '13,000 Coins (Includes +3,000 Bonus)',
                        price: profile.preferredCurrency === 'INR' ? '₹799.00' : '$9.99',
                        priceNum: profile.preferredCurrency === 'INR' ? 799 : 9.99,
                        currency: profile.preferredCurrency || 'INR',
                        data: { amount: 10000, bonusCoins: 3000 },
                      })
                    }
                    className="p-3.5 rounded-2xl bg-gradient-to-b from-yellow-950/60 to-slate-900 border border-yellow-400/70 hover:border-yellow-300 flex flex-col items-center text-center transition-all cursor-pointer active:scale-98 shadow-xl relative ring-2 ring-yellow-400/40"
                  >
                    <div className="absolute -top-2 right-2 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 text-[9px] font-black rounded-full shadow">
                      BEST VALUE 🔥
                    </div>
                    <div className="text-3xl mb-1">🏛️</div>
                    <div className="font-black text-sm text-amber-300">13,000 Coins</div>
                    <div className="text-[10px] text-emerald-400 font-bold mt-0.5">+3,000 Bonus</div>
                    <div className="w-full mt-2.5 py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs shadow-md">
                      {profile.preferredCurrency === 'INR' ? '₹799.00' : '$9.99'}
                    </div>
                  </div>

                  {/* Tier 5: Whale Sovereign Vault */}
                  <div
                    onClick={() =>
                      startCheckout({
                        type: 'coin_pack',
                        title: 'Sovereign Whale Vault',
                        subtitle: '30,000 Coins (Includes +8,000 Bonus)',
                        price: profile.preferredCurrency === 'INR' ? '₹1,599.00' : '$19.99',
                        priceNum: profile.preferredCurrency === 'INR' ? 1599 : 19.99,
                        currency: profile.preferredCurrency || 'INR',
                        data: { amount: 22000, bonusCoins: 8000 },
                      })
                    }
                    className="col-span-2 sm:col-span-2 p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-amber-950/60 border border-purple-400/50 hover:border-amber-400 flex items-center justify-between transition-all cursor-pointer active:scale-98 shadow-xl relative"
                  >
                    <div className="flex items-center space-x-3 text-left">
                      <div className="text-4xl">💎</div>
                      <div>
                        <div className="font-black text-sm text-white flex items-center space-x-1.5">
                          <span>30,000 Coins</span>
                          <span className="text-[9px] px-1.5 py-0.2 bg-purple-500/30 text-purple-300 rounded font-black border border-purple-400/40">
                            2.5X VALUE
                          </span>
                        </div>
                        <div className="text-xs text-emerald-400 font-bold">+8,000 Bonus Coins Included</div>
                      </div>
                    </div>
                    <div className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs shadow-md">
                      {profile.preferredCurrency === 'INR' ? '₹1,599.00' : '$19.99'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. BOOSTERS & POWER-UPS TAB */}
            {activeTab === 'boosters' && (
              <div className="space-y-3.5">
                {/* Mega Combo Pack Banner */}
                <div
                  onClick={() =>
                    startCheckout({
                      type: 'booster',
                      title: 'Ultimate Master Combo Pack',
                      subtitle: '10 Undos • 8 Hints • 6 Shuffles • 4 Extra Tubes',
                      price: '500 Coins',
                      priceNum: 500,
                      currency: 'COINS',
                      isCoinsPayment: true,
                      coinsCost: 500,
                      data: { boosterType: 'bundle', count: 28 },
                    })
                  }
                  className="p-4 rounded-3xl bg-gradient-to-r from-indigo-950/90 via-purple-950/90 to-slate-900 border border-indigo-400/60 shadow-2xl text-white cursor-pointer active:scale-98 transition-all hover:border-indigo-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-2 px-6 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-black text-[9px] uppercase rotate-12 shadow">
                    SAVE 40%
                  </div>

                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-3xl">🎁</span>
                    <div>
                      <h4 className="font-black text-sm text-indigo-300">Ultimate Master Combo Bundle</h4>
                      <p className="text-[11px] text-slate-300">Everything needed to conquer tricky milestone stages</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 p-2 bg-slate-950/60 rounded-2xl border border-slate-800 text-center text-xs font-bold my-2.5">
                    <div className="text-sky-300">10 Undos</div>
                    <div className="text-amber-300">8 Hints</div>
                    <div className="text-emerald-300">6 Shuffles</div>
                    <div className="text-purple-300">4 Tubes</div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-300">
                      Balance: <strong className="text-amber-300">{profile.coins} 🪙</strong>
                    </span>
                    <button
                      type="button"
                      className="py-1.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs shadow-md"
                    >
                      Buy for 500 🪙
                    </button>
                  </div>
                </div>

                {/* Individual Booster Packs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* 1. Undo Pack */}
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-sky-500/40 transition-all flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                        <RotateCcw className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-xs text-white">Undo Pack (x5)</div>
                        <div className="text-[11px] text-slate-400 font-medium">Rewind bad taps</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        startCheckout({
                          type: 'booster',
                          title: '5x Undo Pack',
                          subtitle: 'Rewind mistakes instantly',
                          price: '75 Coins',
                          priceNum: 75,
                          currency: 'COINS',
                          isCoinsPayment: true,
                          coinsCost: 75,
                          data: { boosterType: 'undo', count: 5 },
                        })
                      }
                      className="py-1.5 px-3 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 font-bold text-xs cursor-pointer active:scale-95 transition-all"
                    >
                      75 🪙
                    </button>
                  </div>

                  {/* 2. Hint Pack */}
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-amber-500/40 transition-all flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        <Lightbulb className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-xs text-white">Hint Pack (x5)</div>
                        <div className="text-[11px] text-slate-400 font-medium">Reveal optimal moves</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        startCheckout({
                          type: 'booster',
                          title: '5x Hint Pack',
                          subtitle: 'Highlight best liquid transfers',
                          price: '150 Coins',
                          priceNum: 150,
                          currency: 'COINS',
                          isCoinsPayment: true,
                          coinsCost: 150,
                          data: { boosterType: 'hint', count: 5 },
                        })
                      }
                      className="py-1.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs cursor-pointer active:scale-95 transition-all"
                    >
                      150 🪙
                    </button>
                  </div>

                  {/* 3. Shuffle Pack */}
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-emerald-500/40 transition-all flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <Shuffle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-xs text-white">Shuffle Pack (x5)</div>
                        <div className="text-[11px] text-slate-400 font-medium">Scramble blocked items</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        startCheckout({
                          type: 'booster',
                          title: '5x Shuffle Pack',
                          subtitle: 'Reset board flow',
                          price: '150 Coins',
                          priceNum: 150,
                          currency: 'COINS',
                          isCoinsPayment: true,
                          coinsCost: 150,
                          data: { boosterType: 'shuffle', count: 5 },
                        })
                      }
                      className="py-1.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs cursor-pointer active:scale-95 transition-all"
                    >
                      150 🪙
                    </button>
                  </div>

                  {/* 4. Extra Tube Booster */}
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-purple-500/40 transition-all flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        <PlusCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-xs text-white">Extra Tube Crate (x3)</div>
                        <div className="text-[11px] text-slate-400 font-medium">Unlock extra bottle</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        startCheckout({
                          type: 'booster',
                          title: '3x Extra Tube Crate',
                          subtitle: 'Add extra sorting headroom',
                          price: '200 Coins',
                          priceNum: 200,
                          currency: 'COINS',
                          isCoinsPayment: true,
                          coinsCost: 200,
                          data: { boosterType: 'extraBottle', count: 3 },
                        })
                      }
                      className="py-1.5 px-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-bold text-xs cursor-pointer active:scale-95 transition-all"
                    >
                      200 🪙
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 4. THEMES WARDROBE TAB */}
            {activeTab === 'themes' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.values(GAME_THEMES).map((theme) => {
                  const isUnlocked = profile.unlockedThemes.includes(theme.id);
                  const isEquipped = profile.currentTheme === theme.id;
                  const canAfford = profile.coins >= theme.cost;

                  return (
                    <div
                      key={theme.id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                        isEquipped
                          ? 'bg-gradient-to-b from-purple-950/70 to-slate-900 border-purple-400 shadow-lg shadow-purple-500/20 ring-1 ring-purple-400/40'
                          : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{theme.icon}</span>
                            <div>
                              <h4 className="text-xs font-bold text-white leading-tight">{theme.name}</h4>
                              <span className="text-[9px] text-slate-400 uppercase font-semibold">
                                {theme.category}
                              </span>
                            </div>
                          </div>
                          {isEquipped && (
                            <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/40">
                              Active
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">{theme.description}</p>

                        {/* Swatches */}
                        <div className="flex items-center space-x-1 p-1.5 bg-slate-950/60 rounded-xl border border-slate-800/80 mb-2.5">
                          {theme.itemPalette.slice(0, 5).map((item) => (
                            <div
                              key={item.id}
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-xs shadow-inner"
                              style={{
                                backgroundColor: item.color,
                                boxShadow: `0 0 6px ${item.color}40`,
                              }}
                              title={item.name}
                            >
                              {item.emoji}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        {isEquipped ? (
                          <div className="w-full py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center justify-center space-x-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Equipped</span>
                          </div>
                        ) : isUnlocked ? (
                          <button
                            type="button"
                            onClick={() => {
                              sounds.playClick();
                              onSelectTheme?.(theme.id);
                            }}
                            className="w-full py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-colors cursor-pointer"
                          >
                            Equip Theme
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={!canAfford}
                            onClick={() => {
                              if (canAfford) {
                                sounds.playPowerup();
                                triggerConfetti();
                                onBuyTheme?.(theme.id, theme.cost);
                              } else {
                                sounds.playError();
                              }
                            }}
                            className={`w-full py-1.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-transform active:scale-98 cursor-pointer ${
                              canAfford
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20'
                                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                            }`}
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Unlock ({theme.cost} 🪙)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SIMULATED PAYMENT CHECKOUT MODAL OVERLAY */}
          <AnimatePresence>
            {activeCheckout && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                className="absolute inset-0 z-30 bg-slate-950/95 backdrop-blur-xl p-5 flex flex-col justify-between text-white"
              >
                {/* Checkout Header */}
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                      <ShoppingBag className="w-5 h-5 text-amber-400" />
                      <h4 className="font-bold text-white text-sm">Google Play Secure Billing Checkout</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveCheckout(null)}
                      className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Order Summary Box */}
                  <div className="my-4 p-4 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Selected Item:</span>
                      <span className="text-xs font-black text-amber-300">{activeCheckout.title}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Perks:</span>
                      <span className="text-[11px] text-slate-200">{activeCheckout.subtitle}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <span className="text-xs font-bold text-white">Total Charge:</span>
                      <span className="text-base font-black text-emerald-400 font-mono">
                        {activeCheckout.price}
                      </span>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 block">Choose Payment Method:</label>

                    <div className="space-y-1.5">
                      {/* Google Play Billing */}
                      <div
                        onClick={() => setSelectedPaymentMethod('gplay')}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          selectedPaymentMethod === 'gplay'
                            ? 'bg-emerald-500/10 border-emerald-400 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Radio className={`w-4 h-4 ${selectedPaymentMethod === 'gplay' ? 'text-emerald-400' : 'text-slate-600'}`} />
                          <div>
                            <div className="text-xs font-bold">Google Play 1-Tap Buy</div>
                            <div className="text-[10px] text-slate-400">Play Balance & Play Points</div>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-400">FASTEST</span>
                      </div>

                      {/* UPI / GPay / PhonePe */}
                      <div
                        onClick={() => setSelectedPaymentMethod('upi')}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          selectedPaymentMethod === 'upi'
                            ? 'bg-amber-500/10 border-amber-400 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <QrCode className="w-4 h-4 text-amber-400" />
                          <div>
                            <div className="text-xs font-bold">UPI / GPay / PhonePe</div>
                            <div className="text-[10px] text-slate-400">Instant QR & VPA Payment</div>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-amber-400">0% FEE</span>
                      </div>

                      {/* Credit / Debit Card */}
                      <div
                        onClick={() => setSelectedPaymentMethod('card')}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          selectedPaymentMethod === 'card'
                            ? 'bg-sky-500/10 border-sky-400 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <CreditCard className="w-4 h-4 text-sky-400" />
                          <div>
                            <div className="text-xs font-bold">Credit / Debit Card</div>
                            <div className="text-[10px] text-slate-400">Visa, MasterCard, RuPay</div>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400">•••• 4892</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Pay Button */}
                <div className="pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleExecutePayment}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Authorizing Sandbox Payment...</span>
                      </div>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Confirm & Authorize {activeCheckout.price}</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SIMULATED SUCCESS RECEIPT MODAL OVERLAY */}
          <AnimatePresence>
            {successReceipt && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-xl p-5 flex flex-col items-center justify-center text-center text-white"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/20 animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <h4 className="text-lg font-black text-white">Purchase Successful!</h4>
                <p className="text-xs text-emerald-400 font-semibold mb-4">
                  Items have been credited to your account profile
                </p>

                {/* Receipt Card */}
                <div className="w-full max-w-xs p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-2 mb-5 text-left font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Order ID:</span>
                    <span className="text-amber-300 font-bold">{successReceipt.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Item:</span>
                    <span className="text-white font-bold">{successReceipt.itemTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Paid:</span>
                    <span className="text-emerald-400 font-bold">{successReceipt.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="text-emerald-400 font-bold">COMPLETED</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setSuccessReceipt(null);
                  }}
                  className="w-full max-w-xs py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs shadow-lg cursor-pointer active:scale-98 transition-all"
                >
                  Return to Game
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
