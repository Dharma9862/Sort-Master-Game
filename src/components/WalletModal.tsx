import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Wallet,
  Building2,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Coins,
  History,
  TrendingUp,
  CreditCard,
  Lock,
  Unlock,
  Copy,
  Check,
  Gift,
  RefreshCw,
  Award,
  ChevronRight,
  AlertCircle,
  Bot,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PlayerProfile, WalletLedgerEntry, WithdrawalRecord } from '../types/game';
import { sounds } from '../utils/audio';

interface WalletModalProps {
  isOpen: boolean;
  profile: PlayerProfile;
  onClose: () => void;
  onOpenWithdraw: () => void;
  onConvertPointsToCash: (points: number, cashAmount: number, currency: string) => void;
  onCurrencyChange: (currency: string) => void;
  onClaimDaily?: () => void;
}

export const CURRENCIES: Record<string, { symbol: string; ratePerLakh: number; name: string; minPoints: number }> = {
  INR: { symbol: '₹', ratePerLakh: 10.0, name: 'Indian Rupee', minPoints: 100000 },
  USD: { symbol: '$', ratePerLakh: 0.12, name: 'US Dollar', minPoints: 100000 },
  BDT: { symbol: '৳', ratePerLakh: 14.0, name: 'Bangladeshi Taka', minPoints: 100000 },
  EUR: { symbol: '€', ratePerLakh: 0.11, name: 'Euro', minPoints: 100000 },
  GBP: { symbol: '£', ratePerLakh: 0.095, name: 'British Pound', minPoints: 100000 },
  CAD: { symbol: 'C$', ratePerLakh: 0.16, name: 'Canadian Dollar', minPoints: 100000 },
  AUD: { symbol: 'A$', ratePerLakh: 0.18, name: 'Australian Dollar', minPoints: 100000 },
};

export const POINT_TIERS = [
  { points: 100000, label: '1 Lakh', requiredLevel: 50, popular: true },
  { points: 200000, label: '2 Lakh', requiredLevel: 100, popular: false },
  { points: 300000, label: '3 Lakh', requiredLevel: 150, popular: false },
  { points: 500000, label: '5 Lakh', requiredLevel: 200, popular: false, max: true },
];

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  profile,
  onClose,
  onOpenWithdraw,
  onConvertPointsToCash,
  onCurrencyChange,
}) => {
  const [activeTab, setActiveTab] = useState<'card' | 'convert' | 'withdraw' | 'history'>('card');
  const [selectedCurrency, setSelectedCurrency] = useState<string>(profile.preferredCurrency || 'INR');
  const [selectedConvertPoints, setSelectedConvertPoints] = useState<number>(100000);
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);
  const [conversionSuccessMsg, setConversionSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currencyConfig = CURRENCIES[selectedCurrency] || CURRENCIES.INR;
  const currentPoints = profile.rewardPoints || 0;
  const bankBalance = profile.bankBalance || 0;
  const playerLevel = profile.unlockedLevel || 1;
  const currentCoins = profile.coins || 0;

  // Portfolio calculation
  const pointsCashValue = (currentPoints / 100000) * currencyConfig.ratePerLakh;
  const totalPortfolioValue = bankBalance + pointsCashValue;

  // Conversion calculations
  const requiredLevelForConvert =
    selectedConvertPoints <= 100000
      ? 50
      : selectedConvertPoints <= 200000
      ? 100
      : selectedConvertPoints <= 300000
      ? 150
      : 200;

  const isConvertUnlocked = playerLevel >= requiredLevelForConvert;
  const hasEnoughPointsForConvert = currentPoints >= selectedConvertPoints;
  const convertCashYield = (selectedConvertPoints / 100000) * currencyConfig.ratePerLakh;

  // Handle instant points to wallet cash conversion
  const handlePerformConversion = () => {
    if (!isConvertUnlocked || !hasEnoughPointsForConvert) {
      sounds.playError();
      return;
    }

    sounds.playCashout();
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#34D399', '#F59E0B', '#3B82F6'],
      });
    } catch {
      // fallback
    }

    onConvertPointsToCash(selectedConvertPoints, convertCashYield, selectedCurrency);
    setConversionSuccessMsg(
      `Successfully converted ${selectedConvertPoints.toLocaleString()} Points to ${currencyConfig.symbol}${convertCashYield.toFixed(2)}!`
    );
    setTimeout(() => setConversionSuccessMsg(null), 4000);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTxId(id);
    sounds.playClick();
    setTimeout(() => setCopiedTxId(null), 2500);
  };

  // Compile combined ledger history
  const withdrawals: WithdrawalRecord[] = profile.withdrawHistory || [];
  const customTransactions: WalletLedgerEntry[] = profile.walletTransactions || [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-b from-slate-800 to-slate-900 border-b border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h2 className="text-lg font-black text-white tracking-tight">Virtual Wallet</h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-extrabold text-[9px] uppercase">
                    Live Escrow
                  </span>
                </div>
                <p className="text-xs text-slate-400">Vault & Points Management</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="p-2 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-around px-3 py-2 bg-slate-950/70 border-b border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('card');
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'card'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Card & Vault</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('convert');
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer relative ${
                activeTab === 'convert'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Convert</span>
              {currentPoints >= 100000 && playerLevel >= 50 && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute -top-0.5 -right-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('history');
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Passbook</span>
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Conversion Success Alert */}
            <AnimatePresence>
              {conversionSuccessMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-400 text-emerald-200 text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-emerald-500/20"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{conversionSuccessMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TAB 1: DIGITAL CARD & VAULT OVERVIEW */}
            {activeTab === 'card' && (
              <div className="space-y-4">
                {/* Visual Debit/Metal Fintech Card */}
                <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-tr from-slate-950 via-slate-900 to-emerald-950 border border-emerald-500/40 shadow-2xl shadow-emerald-950/50 text-white">
                  {/* Subtle Card Background Glow */}
                  <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

                  {/* Card Top Row */}
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
                        <Wallet className="w-4 h-4 text-emerald-300" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-bold block">
                          VIRTUAL VAULT PASS
                        </span>
                        <span className="text-xs font-extrabold text-white">LiquidSort Master</span>
                      </div>
                    </div>

                    <div className="px-2.5 py-1 rounded-full bg-slate-950/80 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-300 flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>FDIC Verified</span>
                    </div>
                  </div>

                  {/* Holographic Chip & Wave */}
                  <div className="my-4 flex items-center justify-between relative z-10">
                    <div className="w-10 h-7 rounded-lg bg-gradient-to-tr from-yellow-600 via-amber-400 to-yellow-200 border border-yellow-300/60 shadow-inner flex flex-col justify-around p-1">
                      <div className="w-full h-0.5 bg-yellow-800/40 rounded" />
                      <div className="w-full h-0.5 bg-yellow-800/40 rounded" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 tracking-widest">
                      •••• •••• •••• 8842
                    </span>
                  </div>

                  {/* Card Balance Display */}
                  <div className="relative z-10 pt-1">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                      Available Cash Balance
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white font-mono flex items-baseline space-x-1">
                      <span className="text-emerald-400">{currencyConfig.symbol}</span>
                      <span>{bankBalance.toFixed(2)}</span>
                      <span className="text-xs text-slate-400 font-sans font-medium ml-1">
                        {selectedCurrency}
                      </span>
                    </div>
                  </div>

                  {/* Card Bottom Meta */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 block">
                        Account Holder
                      </span>
                      <span className="font-bold text-slate-200">Champion Tier</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 block">
                        Unlocked Level
                      </span>
                      <span className="font-bold text-amber-300 font-mono">
                        Lvl {playerLevel} / 200
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3-Asset Portfolio Breakdown */}
                <div className="grid grid-cols-3 gap-2">
                  {/* Points Asset */}
                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                    <div className="flex items-center space-x-1 text-amber-400 text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Points</span>
                    </div>
                    <div className="mt-2">
                      <div className="text-sm font-black text-white font-mono">
                        {currentPoints >= 100000
                          ? `${(currentPoints / 100000).toFixed(1)} Lakh`
                          : currentPoints.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                        ≈ {currencyConfig.symbol}{pointsCashValue.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Gold Coins Asset */}
                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                    <div className="flex items-center space-x-1 text-yellow-400 text-xs font-bold">
                      <Coins className="w-3.5 h-3.5" />
                      <span>Coins</span>
                    </div>
                    <div className="mt-2">
                      <div className="text-sm font-black text-white font-mono">
                        {currentCoins.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        In-Game Shop
                      </div>
                    </div>
                  </div>

                  {/* Total Portfolio Asset */}
                  <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col justify-between">
                    <div className="flex items-center space-x-1 text-emerald-400 text-xs font-bold">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Net Worth</span>
                    </div>
                    <div className="mt-2">
                      <div className="text-sm font-black text-emerald-300 font-mono truncate">
                        {currencyConfig.symbol}{totalPortfolioValue.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-emerald-400/80 font-semibold mt-0.5">
                        Cash + Points
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  {/* Convert Points */}
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setActiveTab('convert');
                    }}
                    className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-98"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Convert Points</span>
                  </button>

                  {/* Cash Out / Withdraw */}
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      onOpenWithdraw();
                    }}
                    className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs border border-slate-600 shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-98"
                  >
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span>Bank Cashout</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>

                {/* Level Conversion Milestone Rules Card */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 flex items-center space-x-1.5">
                      <Award className="w-4 h-4 text-yellow-400" />
                      <span>Level Unlock Milestones</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                      Current: Lvl {playerLevel}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className={`p-2 rounded-xl border ${
                      playerLevel >= 50
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}>
                      <div className="flex items-center justify-between font-bold">
                        <span>1 Lakh Points</span>
                        {playerLevel >= 50 ? <Unlock className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-amber-400" />}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Required: Level 50+</div>
                    </div>

                    <div className={`p-2 rounded-xl border ${
                      playerLevel >= 100
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}>
                      <div className="flex items-center justify-between font-bold">
                        <span>2 Lakh Points</span>
                        {playerLevel >= 100 ? <Unlock className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-amber-400" />}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Required: Level 100+</div>
                    </div>

                    <div className={`p-2 rounded-xl border ${
                      playerLevel >= 150
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}>
                      <div className="flex items-center justify-between font-bold">
                        <span>3 Lakh Points</span>
                        {playerLevel >= 150 ? <Unlock className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-amber-400" />}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Required: Level 150+</div>
                    </div>

                    <div className={`p-2 rounded-xl border ${
                      playerLevel >= 200
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}>
                      <div className="flex items-center justify-between font-bold">
                        <span>5 Lakh Points</span>
                        {playerLevel >= 200 ? <Unlock className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-amber-400" />}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Required: Level 200</div>
                    </div>
                  </div>
                </div>

                {/* Currency Switcher */}
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="font-bold text-slate-300 block">Display Currency</span>
                    <span className="text-[10px] text-slate-400">Automatic real-time FX conversion</span>
                  </div>

                  <select
                    value={selectedCurrency}
                    onChange={(e) => {
                      setSelectedCurrency(e.target.value);
                      onCurrencyChange(e.target.value);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {Object.entries(CURRENCIES).map(([code, cur]) => (
                      <option key={code} value={code}>
                        {cur.symbol} {code} ({cur.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* TAB 2: CONVERT POINTS TO CASH */}
            {activeTab === 'convert' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-400">
                        Convertible Points Balance
                      </span>
                      <div className="text-xl font-black text-white font-mono mt-0.5">
                        ⭐ {currentPoints.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        Exchange Rate
                      </span>
                      <div className="text-xs font-extrabold text-emerald-300 font-mono mt-0.5">
                        1 Lakh = {currencyConfig.symbol}{currencyConfig.ratePerLakh.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Select Points Tier */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Select Tier to Convert</span>
                    <span className="text-[10px] text-amber-300 font-medium">
                      (Level 50 per 1 Lakh)
                    </span>
                  </label>

                  <div className="grid grid-cols-2 gap-2.5">
                    {POINT_TIERS.map((tier) => {
                      const tierYield = (tier.points / 100000) * currencyConfig.ratePerLakh;
                      const isSelected = selectedConvertPoints === tier.points;
                      const isAffordable = currentPoints >= tier.points;
                      const isTierUnlocked = playerLevel >= tier.requiredLevel;

                      return (
                        <button
                          key={tier.points}
                          type="button"
                          onClick={() => {
                            sounds.playClick();
                            setSelectedConvertPoints(tier.points);
                          }}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                            isSelected
                              ? isTierUnlocked
                                ? 'bg-emerald-500/20 border-emerald-400 ring-1 ring-emerald-400 text-white'
                                : 'bg-amber-500/20 border-amber-400 ring-1 ring-amber-400 text-white'
                              : isAffordable && isTierUnlocked
                              ? 'bg-slate-950/80 border-slate-700 hover:border-slate-500 text-slate-300'
                              : !isTierUnlocked
                              ? 'bg-slate-950/40 border-amber-500/30 text-slate-400'
                              : 'bg-slate-950/30 border-slate-800 text-slate-500'
                          }`}
                        >
                          {tier.popular && (
                            <span className="absolute -top-1.5 right-2 px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-black text-[7.5px]">
                              POPULAR
                            </span>
                          )}
                          {tier.max && (
                            <span className="absolute -top-1.5 right-2 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[7.5px]">
                              MAX
                            </span>
                          )}

                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-black font-mono">⭐ {tier.label}</span>
                            {isTierUnlocked ? (
                              <span className="text-[9px] font-bold text-emerald-400 flex items-center">
                                <Unlock className="w-2.5 h-2.5 mr-0.5" /> Lvl {tier.requiredLevel}+
                              </span>
                            ) : (
                              <span className="text-[9px] font-black text-amber-300 flex items-center">
                                <Lock className="w-2.5 h-2.5 mr-0.5" /> Lvl {tier.requiredLevel}
                              </span>
                            )}
                          </div>

                          <div className="text-base font-extrabold text-emerald-300 font-mono">
                            {currencyConfig.symbol}{tierYield.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {isAffordable ? 'Instant Credit' : 'Need More Points'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Level Unlock Status / Requirement Progress Card */}
                <div>
                  {!isConvertUnlocked ? (
                    <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 font-bold text-amber-300">
                          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Tier Locked: Requires Level {requiredLevelForConvert}</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                          Lvl {playerLevel} / {requiredLevelForConvert}
                        </span>
                      </div>

                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-amber-500/30">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, Math.max(5, (playerLevel / requiredLevelForConvert) * 100))}%`,
                          }}
                        />
                      </div>

                      <p className="text-[11px] text-amber-200/90 pt-0.5">
                        Clear <strong>{Math.max(0, requiredLevelForConvert - playerLevel)} more level(s)</strong> to unlock converting {selectedConvertPoints.toLocaleString()} Points!
                      </p>
                    </div>
                  ) : !hasEnoughPointsForConvert ? (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs flex items-center justify-between">
                      <span>Insufficient Points</span>
                      <span className="text-amber-300 font-mono font-bold">
                        Need {Math.max(0, selectedConvertPoints - currentPoints).toLocaleString()} more
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-semibold">
                          Level {requiredLevelForConvert} Cleared! Ready to Credit Vault.
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400">Verified</span>
                    </div>
                  )}
                </div>

                {/* Conversion Action Button */}
                <button
                  type="button"
                  disabled={!isConvertUnlocked || !hasEnoughPointsForConvert}
                  onClick={handlePerformConversion}
                  className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                    isConvertUnlocked && hasEnoughPointsForConvert
                      ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/30 active:scale-98'
                      : !isConvertUnlocked
                      ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40 cursor-not-allowed'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>
                    {!isConvertUnlocked
                      ? `Locked: Reach Level ${requiredLevelForConvert}`
                      : !hasEnoughPointsForConvert
                      ? `Need ${Math.max(0, selectedConvertPoints - currentPoints).toLocaleString()} More Points`
                      : `Credit ${currencyConfig.symbol}${convertCashYield.toFixed(2)} to Virtual Wallet`}
                  </span>
                </button>
              </div>
            )}

            {/* TAB 3: PASSBOOK & TRANSACTION LEDGER */}
            {activeTab === 'history' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>Passbook Records ({withdrawals.length + customTransactions.length})</span>
                  <span className="text-emerald-400 font-semibold font-mono">100% Encrypted</span>
                </div>

                {withdrawals.length === 0 && customTransactions.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950/50 rounded-3xl border border-slate-800 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mx-auto text-slate-500">
                      <History className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-white">No Transactions Yet</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      Convert points or initiate bank cashouts to see your instant passbook ledger records here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Custom Ledger Entries */}
                    {customTransactions.map((tx) => {
                      const isPointsDeduction = tx.pointsChange !== undefined && tx.pointsChange < 0;
                      const isAiSolver = tx.type === 'ai_solver';

                      return (
                        <div
                          key={tx.id}
                          className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2.5">
                            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                              isAiSolver
                                ? 'bg-indigo-500/20 border-indigo-400/30 text-indigo-400'
                                : isPointsDeduction
                                ? 'bg-amber-500/20 border-amber-400/30 text-amber-400'
                                : 'bg-emerald-500/20 border-emerald-400/30 text-emerald-400'
                            }`}>
                              {isAiSolver ? (
                                <Bot className="w-4 h-4" />
                              ) : isPointsDeduction ? (
                                <ArrowUpRight className="w-4 h-4" />
                              ) : (
                                <ArrowDownLeft className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white">{tx.title}</div>
                              <div className="text-[10px] text-slate-400">
                                {new Date(tx.timestamp).toLocaleDateString()} • {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            {tx.pointsChange !== undefined ? (
                              <div className={`text-xs font-black font-mono ${
                                tx.pointsChange > 0 ? 'text-emerald-300' : 'text-amber-300'
                              }`}>
                                {tx.pointsChange > 0 ? `+${tx.pointsChange.toLocaleString()}` : tx.pointsChange.toLocaleString()} ⭐
                              </div>
                            ) : (
                              <div className="text-xs font-black text-emerald-300 font-mono">
                                +{currencyConfig.symbol}{tx.amountChange.toFixed(2)}
                              </div>
                            )}
                            <div className={`text-[9px] font-bold uppercase ${
                              isAiSolver
                                ? 'text-indigo-400'
                                : isPointsDeduction
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}>
                              {isAiSolver ? 'AI SOLVER' : isPointsDeduction ? 'SPENT' : 'CREDITED'}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Bank Cashout Records */}
                    {withdrawals.map((record) => (
                      <div
                        key={record.id}
                        className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400 shrink-0">
                            <ArrowUpRight className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">
                              Cashout to {record.recipientDetail}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                              <span>{new Date(record.timestamp).toLocaleDateString()}</span>
                              <span>•</span>
                              <span className="font-mono text-slate-500">{record.transactionRef}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right flex flex-col items-end">
                          <div className="text-xs font-black text-white font-mono">
                            {record.currency === 'INR' ? '₹' : '$'}{record.amount.toFixed(2)}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(record.transactionRef, record.id)}
                            className="text-[9px] text-slate-400 hover:text-emerald-400 font-mono flex items-center space-x-0.5 mt-0.5 cursor-pointer"
                          >
                            {copiedTxId === record.id ? (
                              <>
                                <Check className="w-2.5 h-2.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-2.5 h-2.5" />
                                <span>Copy Ref</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Close */}
          <div className="p-3 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center space-x-1 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Instant Payouts & 256-Bit Escrow Security</span>
            </div>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
