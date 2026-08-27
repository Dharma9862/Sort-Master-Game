import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Building2,
  Wallet,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Zap,
  TrendingUp,
  Receipt,
  Gift,
  HelpCircle,
  Smartphone,
  CreditCard,
  ChevronRight,
  ExternalLink,
  Coins,
  DollarSign,
  AlertCircle,
  Copy,
  Check,
  Lock,
  Unlock,
  Award,
  WifiOff,
  Wifi,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PlayerProfile, WithdrawalRecord, PayoutMethod } from '../types/game';
import { sounds } from '../utils/audio';

interface WithdrawModalProps {
  isOpen: boolean;
  profile: PlayerProfile;
  isOnline?: boolean;
  onWithdrawSuccess: (record: WithdrawalRecord) => void;
  onBonusPointsClaimed?: (bonusPoints: number) => void;
  onClose: () => void;
}

// Currency Conversion Matrix (100,000 Points = 1 Lakh Points = ₹10.00 INR)
const CURRENCIES: Record<string, { symbol: string; ratePerLakh: number; name: string; minPoints: number }> = {
  INR: { symbol: '₹', ratePerLakh: 10.0, name: 'Indian Rupee', minPoints: 100000 },
  USD: { symbol: '$', ratePerLakh: 0.12, name: 'US Dollar', minPoints: 100000 },
  BDT: { symbol: '৳', ratePerLakh: 14.0, name: 'Bangladeshi Taka', minPoints: 100000 },
  EUR: { symbol: '€', ratePerLakh: 0.11, name: 'Euro', minPoints: 100000 },
  GBP: { symbol: '£', ratePerLakh: 0.095, name: 'British Pound', minPoints: 100000 },
  CAD: { symbol: 'C$', ratePerLakh: 0.16, name: 'Canadian Dollar', minPoints: 100000 },
  AUD: { symbol: 'A$', ratePerLakh: 0.18, name: 'Australian Dollar', minPoints: 100000 },
};

// Points Converter Level Requirements
// Level 50 for 1 Lakh (100,000 pts)
// Level 100 for 2 Lakhs (200,000 pts)
// Level 150 for 3 Lakhs (300,000 pts)
// Level 200 for 4-5 Lakhs (400,000 - 500,000 pts)
export function getRequiredLevelForPoints(points: number): number {
  if (points <= 100000) return 50;
  if (points <= 200000) return 100;
  if (points <= 300000) return 150;
  return 200;
}

export const POINT_TIERS = [
  { points: 100000, label: '1 Lakh', requiredLevel: 50, popular: true },
  { points: 200000, label: '2 Lakh', requiredLevel: 100, popular: false },
  { points: 300000, label: '3 Lakh', requiredLevel: 150, popular: false },
  { points: 400000, label: '4 Lakh', requiredLevel: 200, popular: false },
  { points: 500000, label: '5 Lakh', requiredLevel: 200, popular: false, max: true },
];

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  profile,
  isOnline = true,
  onWithdrawSuccess,
  onBonusPointsClaimed,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'withdraw' | 'bank' | 'history' | 'scratch'>('withdraw');
  const [selectedCurrency, setSelectedCurrency] = useState<string>(profile.preferredCurrency || 'INR');
  const [selectedAmountTier, setSelectedAmountTier] = useState<number>(100000); // in points (Default 1 Lakh = 10 INR)
  const [customPoints, setCustomPoints] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod>('bank_transfer');

  // Form Fields
  const [accountHolder, setAccountHolder] = useState<string>('Rahul Sharma');
  const [bankName, setBankName] = useState<string>('State Bank of India');
  const [accountNumber, setAccountNumber] = useState<string>('38921470198');
  const [routingOrIfsc, setRoutingOrIfsc] = useState<string>('SBIN0001234');
  const [upiOrEmail, setUpiOrEmail] = useState<string>('rahul.sharma@okaxis');

  // Transaction Processing State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<number>(0);
  const [completedTx, setCompletedTx] = useState<WithdrawalRecord | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<WithdrawalRecord | null>(null);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);

  // Scratch card state
  const [isScratched, setIsScratched] = useState<boolean>(false);
  const [scratchReward, setScratchReward] = useState<number>(25000); // 25,000 pts = ₹2.50
  const [scratchClaimed, setScratchClaimed] = useState<boolean>(false);

  if (!isOpen) return null;

  const currencyConfig = CURRENCIES[selectedCurrency] || CURRENCIES.INR;
  const currentPoints = profile.rewardPoints || 0;
  const playerLevel = profile.unlockedLevel || 1;

  const pointsToWithdraw = isCustom ? (parseInt(customPoints, 10) || 0) : selectedAmountTier;
  // 1 Lakh Points (100,000) = 10 INR
  const fiatEquivalent = (pointsToWithdraw / 100000) * currencyConfig.ratePerLakh;
  const hasEnoughPoints = currentPoints >= pointsToWithdraw && pointsToWithdraw >= currencyConfig.minPoints;

  // Level unlock milestone checks
  const requiredLevel = getRequiredLevelForPoints(pointsToWithdraw);
  const isLevelUnlocked = playerLevel >= requiredLevel;
  const levelsNeeded = Math.max(0, requiredLevel - playerLevel);
  const isReadyToWithdraw = isOnline && hasEnoughPoints && isLevelUnlocked;

  // Process Interactive Bank Payout
  const handleInitiateWithdrawal = () => {
    if (!isOnline || !isReadyToWithdraw || isProcessing) {
      sounds.playError();
      return;
    }

    sounds.playClick();
    setIsProcessing(true);
    setProcessingStep(1);

    // Step 1: Security Verification
    setTimeout(() => {
      setProcessingStep(2);
      // Step 2: Gateway connect
      setTimeout(() => {
        setProcessingStep(3);
        // Step 3: Complete payout
        setTimeout(() => {
          sounds.playCashout();
          try {
            confetti({
              particleCount: 100,
              spread: 80,
              origin: { y: 0.5 },
              colors: ['#10B981', '#34D399', '#F59E0B', '#60A5FA', '#FBBF24'],
            });
          } catch {
            // confetti fallback
          }

          let recipientDesc = '';
          if (payoutMethod === 'bank_transfer' || payoutMethod === 'wire') {
            const masked = accountNumber.length > 4 ? `****${accountNumber.slice(-4)}` : accountNumber;
            recipientDesc = `${bankName} (${masked})`;
          } else if (payoutMethod === 'upi') {
            recipientDesc = `UPI: ${upiOrEmail}`;
          } else if (payoutMethod === 'paypal') {
            recipientDesc = `PayPal: ${upiOrEmail}`;
          } else {
            recipientDesc = `Digital Card (${upiOrEmail})`;
          }

          const newRecord: WithdrawalRecord = {
            id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            timestamp: Date.now(),
            pointsUsed: pointsToWithdraw,
            amount: parseFloat(fiatEquivalent.toFixed(2)),
            currency: selectedCurrency,
            method: payoutMethod,
            recipientDetail: recipientDesc,
            accountHolderName: accountHolder,
            bankName: bankName,
            routingNumber: routingOrIfsc,
            status: 'completed',
            transactionRef: `PAY-${Math.floor(100000 + Math.random() * 900000)}-${selectedCurrency}`,
          };

          setIsProcessing(false);
          setProcessingStep(0);
          setCompletedTx(newRecord);
          onWithdrawSuccess(newRecord);
        }, 1200);
      }, 1300);
    }, 1200);
  };

  // Scratch card claim
  const handleClaimScratch = () => {
    if (scratchClaimed) return;
    sounds.playWin();
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
    setScratchClaimed(true);
    if (onBonusPointsClaimed) {
      onBonusPointsClaimed(scratchReward);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-2xl text-white flex flex-col p-4 sm:p-5 no-scrollbar"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center space-x-2">
                  <span>Points to Bank Transfer</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/40">
                    Instant Payout
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Convert Points directly to Bank Balance</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User Live Balance Summary Card */}
          <div className="mt-3 p-4 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/40 shadow-lg relative overflow-hidden">
            {!isOnline && (
              <div className="mb-3 p-2.5 rounded-xl bg-amber-950/70 border border-amber-500/50 text-amber-200 text-xs flex items-start space-x-2">
                <WifiOff className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300">Offline Mode Active:</span>
                  <span className="text-amber-200/90 ml-1">
                    Points-to-Bank conversion & cashouts require an active internet connection.
                  </span>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1.5 text-xs text-emerald-300 font-bold">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Withdrawable Balance</span>
              </div>
              {/* Currency Selector */}
              <div className="flex items-center space-x-1">
                <span className="text-[10px] text-slate-400">Currency:</span>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="bg-slate-950 text-emerald-300 text-xs font-bold px-2 py-1 rounded-xl border border-emerald-500/30 focus:outline-none cursor-pointer"
                >
                  {Object.keys(CURRENCIES).map((cur) => (
                    <option key={cur} value={cur}>
                      {cur} ({CURRENCIES[cur].symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white flex items-center space-x-1.5 font-mono">
                  <span className="text-amber-400">⭐</span>
                  <span>{currentPoints.toLocaleString()}</span>
                  <span className="text-xs font-bold text-slate-400 ml-1">Points</span>
                </div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">
                  ≈ {currencyConfig.symbol}
                  {((currentPoints / 100000) * currencyConfig.ratePerLakh).toFixed(2)} {selectedCurrency} Bank Cash
                </div>
              </div>

              {/* Linked Bank Balance Indicator */}
              <div className="text-right bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Bank Account Balance</span>
                <span className="text-sm font-black text-emerald-300 font-mono">
                  {currencyConfig.symbol}
                  {(profile.bankBalance || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Rate & Unlock Milestone Banner */}
            <div className="mt-3 pt-2.5 border-t border-emerald-500/20 flex flex-col space-y-1.5 text-[11px] text-slate-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center space-x-1.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    <strong className="text-emerald-300 font-bold">1 Lakh Points (100,000 ⭐)</strong> ={' '}
                    <strong className="text-white font-bold">{currencyConfig.symbol}{(1 * currencyConfig.ratePerLakh).toFixed(2)}</strong>
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-amber-300 font-bold text-[10px] sm:text-[11px]">
                  <Award className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                  <span>Level 50 per 1 Lakh points</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800">
                <span>Unlock Milestones:</span>
                <span className="text-emerald-300 font-medium">
                  Lvl 50: 1 Lakh | Lvl 100: 2 Lakh | Lvl 150: 3 Lakh | Lvl 200: 5 Lakh
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 my-3">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('withdraw');
                setCompletedTx(null);
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                activeTab === 'withdraw'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Withdraw</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('bank');
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                activeTab === 'bank'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>My Bank</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('history');
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer relative ${
                activeTab === 'history'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>History</span>
              {(profile.withdrawHistory || []).length > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('scratch');
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                activeTab === 'scratch'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>+Pts Gift</span>
            </button>
          </div>

          {/* TAB 1: WITHDRAW FORM */}
          {activeTab === 'withdraw' && (
            <div className="space-y-3.5">
              {/* SUCCESS RECEIPT VIEW */}
              {completedTx ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-2xl bg-gradient-to-b from-emerald-950/60 to-slate-950 border border-emerald-500/50 text-center space-y-3"
                >
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                      Transfer Completed
                    </span>
                    <h4 className="text-xl font-black text-white">
                      {currencyConfig.symbol}
                      {completedTx.amount.toFixed(2)} Deposited!
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Converted {completedTx.pointsUsed.toLocaleString()} Points to {completedTx.recipientDetail}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-left text-xs space-y-1.5 font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Transaction Ref:</span>
                      <span className="text-white font-bold">{completedTx.transactionRef}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Recipient:</span>
                      <span className="text-white">{completedTx.accountHolderName}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Method:</span>
                      <span className="text-emerald-400 uppercase font-bold">{completedTx.method.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Date & Time:</span>
                      <span className="text-white">{new Date(completedTx.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setCompletedTx(null)}
                      className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg cursor-pointer"
                    >
                      Make Another Withdrawal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setActiveTab('history');
                      }}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 cursor-pointer"
                    >
                      View All History
                    </button>
                  </div>
                </motion.div>
              ) : isProcessing ? (
                /* LIVE TRANSACTION PROCESSING ANIMATION */
                <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/40 text-center space-y-4">
                  <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                      className="w-16 h-16 rounded-full border-4 border-emerald-500/30 border-t-emerald-400"
                    />
                    <Building2 className="w-6 h-6 text-emerald-400 absolute" />
                  </div>

                  <div>
                    <h4 className="text-base font-black text-white">
                      Processing Bank Transfer...
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Converting {pointsToWithdraw.toLocaleString()} Points to {currencyConfig.symbol}
                      {fiatEquivalent.toFixed(2)}
                    </p>
                  </div>

                  {/* Processing Step Indicators */}
                  <div className="space-y-2 text-left max-w-xs mx-auto text-xs">
                    <div className={`flex items-center space-x-2 ${processingStep >= 1 ? 'text-emerald-300' : 'text-slate-500'}`}>
                      <CheckCircle2 className={`w-4 h-4 ${processingStep >= 1 ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <span>Security & Identity Verification</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${processingStep >= 2 ? 'text-emerald-300' : 'text-slate-500'}`}>
                      <CheckCircle2 className={`w-4 h-4 ${processingStep >= 2 ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <span>Connecting with Instant Bank Gateway</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${processingStep >= 3 ? 'text-emerald-300' : 'text-slate-500'}`}>
                      <CheckCircle2 className={`w-4 h-4 ${processingStep >= 3 ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <span>Crediting Bank Account Balance</span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Step 1: Select Amount Tier */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 flex items-center justify-between mb-2">
                      <span className="flex items-center space-x-1.5">
                        <span>1. Select Points Tier</span>
                        <span className="text-[10px] text-amber-300 font-normal">
                          (Lvl 50 per 1 Lakh)
                        </span>
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        Payout: {currencyConfig.symbol}{fiatEquivalent.toFixed(2)}
                      </span>
                    </label>

                    <div className="grid grid-cols-3 gap-2">
                      {POINT_TIERS.map((tier) => {
                        const tierFiat = (tier.points / 100000) * currencyConfig.ratePerLakh;
                        const isSelected = !isCustom && selectedAmountTier === tier.points;
                        const isAffordable = currentPoints >= tier.points;
                        const isTierLevelUnlocked = playerLevel >= tier.requiredLevel;

                        return (
                          <button
                            key={tier.points}
                            type="button"
                            onClick={() => {
                              sounds.playClick();
                              setSelectedAmountTier(tier.points);
                              setIsCustom(false);
                            }}
                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer relative ${
                              isSelected
                                ? isTierLevelUnlocked
                                  ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-lg ring-1 ring-emerald-400'
                                  : 'bg-amber-500/20 border-amber-400 text-white shadow-lg ring-1 ring-amber-400'
                                : isAffordable && isTierLevelUnlocked
                                ? 'bg-slate-800/80 border-slate-700 hover:border-slate-500 text-slate-200'
                                : !isTierLevelUnlocked
                                ? 'bg-slate-950/60 border-amber-500/30 text-slate-400'
                                : 'bg-slate-950/40 border-slate-800/80 text-slate-500'
                            }`}
                          >
                            {tier.popular && (
                              <span className="absolute -top-1.5 -right-1 px-1 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-black text-[7px] tracking-tight">
                                POPULAR
                              </span>
                            )}
                            {tier.max && (
                              <span className="absolute -top-1.5 -right-1 px-1 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[7px] tracking-tight">
                                MAX
                              </span>
                            )}

                            {/* Level requirement badge */}
                            <div className="flex items-center justify-center space-x-1 mb-1">
                              {isTierLevelUnlocked ? (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[8px] font-bold">
                                  <Unlock className="w-2.5 h-2.5 mr-0.5" />
                                  Lvl {tier.requiredLevel}+
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[8px] font-black border border-amber-500/40">
                                  <Lock className="w-2.5 h-2.5 mr-0.5" />
                                  Lvl {tier.requiredLevel}
                                </span>
                              )}
                            </div>

                            <div className="text-xs font-bold font-mono">
                              ⭐ {tier.label}
                            </div>
                            <div className="text-xs font-extrabold text-emerald-300 mt-0.5">
                              {currencyConfig.symbol}
                              {tierFiat.toFixed(2)}
                            </div>
                          </button>
                        );
                      })}

                      {/* Custom Amount Button */}
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setIsCustom(true);
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          isCustom
                            ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-lg ring-1 ring-emerald-400'
                            : 'bg-slate-800/80 border-slate-700 hover:border-slate-500 text-slate-200'
                        }`}
                      >
                        <div className="text-xs font-bold">Custom</div>
                        <div className="text-[10px] text-slate-400">Enter points</div>
                      </button>
                    </div>

                    {isCustom && (
                      <div className="mt-2 flex items-center space-x-2">
                        <input
                          type="number"
                          placeholder="e.g. 100000 (1 Lakh)"
                          value={customPoints}
                          onChange={(e) => setCustomPoints(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-emerald-400 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setCustomPoints(String(currentPoints))}
                          className="px-3 py-2 rounded-xl bg-slate-800 text-amber-300 text-xs font-bold border border-slate-700 hover:bg-slate-700 cursor-pointer"
                        >
                          Max All
                        </button>
                      </div>
                    )}

                    {/* Level Requirement Status Progress Card */}
                    <div className="mt-2.5">
                      {!isLevelUnlocked ? (
                        <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5 font-bold text-amber-300">
                              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                              <span>Converter Locked: Requires Level {requiredLevel}</span>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                              Level {playerLevel} / {requiredLevel}
                            </span>
                          </div>

                          {/* Level Progress Bar */}
                          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-amber-500/30">
                            <div
                              className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, Math.max(5, (playerLevel / requiredLevel) * 100))}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-amber-200/90 pt-0.5">
                            <span>
                              Complete <strong>{levelsNeeded} more level{levelsNeeded === 1 ? '' : 's'}</strong> to enable this transfer!
                            </span>
                            <span className="text-[10px] text-amber-400 font-bold">
                              {Math.round((playerLevel / requiredLevel) * 100)}%
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                          <div className="flex items-center space-x-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="font-semibold">
                              Level {requiredLevel} Unlocked! (Your Level: {playerLevel})
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-400">
                            Ready to Convert
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 2: Select Payout Method */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-2">
                      2. Choose Withdrawal Destination
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setPayoutMethod('bank_transfer');
                        }}
                        className={`p-2.5 rounded-xl border flex items-center space-x-2.5 transition-all text-left cursor-pointer ${
                          payoutMethod === 'bank_transfer'
                            ? 'bg-emerald-500/20 border-emerald-400 text-white ring-1 ring-emerald-400'
                            : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <Building2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div>
                          <div className="text-xs font-bold">Bank Transfer</div>
                          <div className="text-[10px] text-slate-400">ACH / Wire / IBAN</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setPayoutMethod('upi');
                        }}
                        className={`p-2.5 rounded-xl border flex items-center space-x-2.5 transition-all text-left cursor-pointer ${
                          payoutMethod === 'upi'
                            ? 'bg-emerald-500/20 border-emerald-400 text-white ring-1 ring-emerald-400'
                            : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <Smartphone className="w-5 h-5 text-cyan-400 shrink-0" />
                        <div>
                          <div className="text-xs font-bold">Fast UPI / Mobile</div>
                          <div className="text-[10px] text-slate-400">GPay / PhonePe / bKash</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setPayoutMethod('paypal');
                        }}
                        className={`p-2.5 rounded-xl border flex items-center space-x-2.5 transition-all text-left cursor-pointer ${
                          payoutMethod === 'paypal'
                            ? 'bg-emerald-500/20 border-emerald-400 text-white ring-1 ring-emerald-400'
                            : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <Wallet className="w-5 h-5 text-sky-400 shrink-0" />
                        <div>
                          <div className="text-xs font-bold">PayPal / CashApp</div>
                          <div className="text-[10px] text-slate-400">Instant e-wallet</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setPayoutMethod('gift_card');
                        }}
                        className={`p-2.5 rounded-xl border flex items-center space-x-2.5 transition-all text-left cursor-pointer ${
                          payoutMethod === 'gift_card'
                            ? 'bg-emerald-500/20 border-emerald-400 text-white ring-1 ring-emerald-400'
                            : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <Gift className="w-5 h-5 text-amber-400 shrink-0" />
                        <div>
                          <div className="text-xs font-bold">Digital Gift Card</div>
                          <div className="text-[10px] text-slate-400">Amazon / Play Store</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Step 3: Account Form Fields */}
                  <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2 text-xs">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Account Beneficiary Full Name
                      </label>
                      <input
                        type="text"
                        value={accountHolder}
                        onChange={(e) => setAccountHolder(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-400 focus:outline-none"
                      />
                    </div>

                    {payoutMethod === 'bank_transfer' ? (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-bold text-slate-400 block mb-1">
                            Bank Name
                          </label>
                          <input
                            type="text"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            placeholder="Chase / Wells Fargo / HDFC"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-400 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-400 block mb-1">
                            Account Number / IBAN
                          </label>
                          <input
                            type="text"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            placeholder="1234567890"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:border-emerald-400 focus:outline-none"
                          />
                        </div>
                      </div>
                    ) : payoutMethod === 'upi' ? (
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">
                          UPI ID / Mobile Wallet Number
                        </label>
                        <input
                          type="text"
                          value={upiOrEmail}
                          onChange={(e) => setUpiOrEmail(e.target.value)}
                          placeholder="user@upi or 9876543210"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:border-emerald-400 focus:outline-none"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">
                          PayPal Email or Recipient ID
                        </label>
                        <input
                          type="email"
                          value={upiOrEmail}
                          onChange={(e) => setUpiOrEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-400 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* Convert & Submit Button */}
                  <button
                    type="button"
                    disabled={!isReadyToWithdraw}
                    onClick={handleInitiateWithdrawal}
                    className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                      isReadyToWithdraw
                        ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/30 transform active:scale-98'
                        : !isOnline
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40 cursor-not-allowed'
                        : !isLevelUnlocked
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40 cursor-not-allowed'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    {!isOnline ? (
                      <>
                        <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Offline: Connect to Internet to Convert Points</span>
                      </>
                    ) : !isLevelUnlocked ? (
                      <>
                        <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>
                          Locked: Reach Level {requiredLevel} (You are Lvl {playerLevel})
                        </span>
                      </>
                    ) : !hasEnoughPoints ? (
                      <>
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>
                          Need {Math.max(0, pointsToWithdraw - currentPoints).toLocaleString()} More Points
                        </span>
                      </>
                    ) : (
                      <>
                        <Building2 className="w-5 h-5" />
                        <span>
                          Convert & Transfer {currencyConfig.symbol}{fiatEquivalent.toFixed(2)} to Bank
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          )}

          {/* TAB 2: LINKED BANK ACCOUNT & VAULT */}
          {activeTab === 'bank' && (
            <div className="space-y-3.5">
              {/* Bank Card Aesthetic */}
              <div className="p-5 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-emerald-950 border border-emerald-500/40 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-6 h-6 text-emerald-400" />
                    <span className="font-extrabold text-sm text-white tracking-wider uppercase">
                      {bankName || 'Direct Payout Bank'}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/40 flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                </div>

                <div className="my-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Accumulated Bank Balance
                  </span>
                  <div className="text-3xl font-black text-emerald-300 font-mono tracking-tight">
                    {currencyConfig.symbol}
                    {(profile.bankBalance || 0).toFixed(2)} {selectedCurrency}
                  </div>
                </div>

                <div className="flex items-end justify-between pt-2 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Account Holder</span>
                    <span className="font-bold text-white">{accountHolder}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Account Number</span>
                    <span className="font-mono text-slate-300 font-bold">
                      •••• •••• {accountNumber.slice(-4) || '8921'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bank Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">
                    Total Lifetime Withdrawn
                  </span>
                  <span className="text-sm font-black text-white font-mono">
                    {currencyConfig.symbol}
                    {(profile.stats.totalWithdrawnAmount || 0).toFixed(2)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">
                    Total Points Earned
                  </span>
                  <span className="text-sm font-black text-amber-400 font-mono">
                    ⭐ {(profile.stats.totalPointsEarned || currentPoints).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="font-bold text-white flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Bank Payout Guarantee</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Every level you clear adds free cash points to your wallet. You can convert these points
                  at any time and transfer them directly into your linked bank balance or e-wallet without hidden fees.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: TRANSACTION HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Recent Withdrawals</span>
                <span className="text-emerald-400 font-mono text-[10px]">
                  {(profile.withdrawHistory || []).length} Records
                </span>
              </h4>

              {(profile.withdrawHistory || []).length === 0 ? (
                <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 text-slate-400 space-y-2">
                  <Receipt className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-xs font-bold">No withdrawals yet</p>
                  <p className="text-[11px] text-slate-500">
                    Solve levels to earn points and complete your first payout!
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {(profile.withdrawHistory || []).map((record) => (
                    <div
                      key={record.id}
                      onClick={() => setSelectedReceipt(record)}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 transition-all flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                            <span>{record.recipientDetail}</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(record.timestamp).toLocaleDateString()} • {record.transactionRef}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-black text-emerald-400 font-mono">
                          +{CURRENCIES[record.currency]?.symbol || '$'}
                          {record.amount.toFixed(2)}
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase">
                          {record.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: BONUS POINTS GIFT & SCRATCH */}
          {activeTab === 'scratch' && (
            <div className="space-y-3 text-center">
              {!isOnline && (
                <div className="p-3 rounded-2xl bg-amber-950/70 border border-amber-500/50 text-amber-200 text-xs flex items-center space-x-2 text-left">
                  <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold text-amber-300">Point Increaser Offline:</span>
                    <span className="text-amber-200/90 ml-1">
                      Bonus point multipliers and scratch tickets require an online connection to verify reward distribution.
                    </span>
                  </div>
                </div>
              )}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-950/50 via-slate-900 to-slate-950 border border-amber-500/40 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400">
                  <Gift className="w-6 h-6" />
                </div>

                <div>
                  <h4 className="text-base font-black text-white">Daily Lucky Scratch Ticket</h4>
                  <p className="text-xs text-slate-300">
                    Scratch to reveal instant bonus Cash Points for your bank balance!
                  </p>
                </div>

                {/* Scratch Surface */}
                <div
                  onClick={() => {
                    if (!isOnline) {
                      sounds.playError();
                      return;
                    }
                    if (!isScratched) {
                      sounds.playPowerup();
                      setIsScratched(true);
                    }
                  }}
                  className={`mx-auto w-full max-w-xs h-32 rounded-2xl border flex flex-col items-center justify-center transition-all relative overflow-hidden ${
                    !isOnline
                      ? 'bg-slate-950/60 border-slate-800 text-slate-500 cursor-not-allowed opacity-75'
                      : isScratched
                      ? 'bg-gradient-to-tr from-amber-500/20 via-yellow-500/20 to-emerald-500/20 border-amber-400 cursor-pointer'
                      : 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 border-amber-300 hover:scale-[1.02] shadow-xl cursor-pointer'
                  }`}
                >
                  {!isOnline ? (
                    <div className="text-slate-400 font-bold text-xs flex flex-col items-center space-y-1">
                      <WifiOff className="w-6 h-6 text-amber-400" />
                      <span>Point Increaser Paused</span>
                      <span className="text-[10px] text-slate-500">Connect to internet to scratch</span>
                    </div>
                  ) : !isScratched ? (
                    <div className="text-slate-950 font-black text-sm flex flex-col items-center space-y-1">
                      <Sparkles className="w-6 h-6 animate-bounce" />
                      <span>✨ TAP TO SCRATCH ✨</span>
                      <span className="text-[10px] font-semibold opacity-90">Win up to 50,000 Cash Points (₹5.00)</span>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="space-y-1"
                    >
                      <div className="text-3xl font-black text-amber-300 font-mono">
                        +{scratchReward.toLocaleString()} ⭐
                      </div>
                      <div className="text-xs font-bold text-emerald-400">
                        = {currencyConfig.symbol}{((scratchReward / 100000) * currencyConfig.ratePerLakh).toFixed(2)} Instant Bank Cash!
                      </div>
                    </motion.div>
                  )}
                </div>

                {isScratched && !scratchClaimed && isOnline && (
                  <button
                    type="button"
                    onClick={handleClaimScratch}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center space-x-1.5 cursor-pointer transform active:scale-98"
                  >
                    <Sparkles className="w-4 h-4 fill-slate-950" />
                    <span>Claim +{scratchReward.toLocaleString()} Points to Wallet</span>
                  </button>
                )}

                {scratchClaimed && (
                  <div className="py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Bonus Claimed! Added to your points</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* POPUP RECEIPT SLIP MODAL */}
          {selectedReceipt && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm rounded-3xl bg-slate-900 border border-emerald-500/50 p-5 text-white space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Receipt className="w-5 h-5 text-emerald-400" />
                    <span className="font-black text-sm">Official Bank Receipt</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedReceipt(null)}
                    className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Reference ID:</span>
                    <span className="text-emerald-400 font-bold">{selectedReceipt.transactionRef}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Amount:</span>
                    <span className="text-white font-bold">
                      {CURRENCIES[selectedReceipt.currency]?.symbol || '$'}
                      {selectedReceipt.amount.toFixed(2)} {selectedReceipt.currency}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Points Converted:</span>
                    <span className="text-amber-400 font-bold">
                      {selectedReceipt.pointsUsed.toLocaleString()} pts
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Beneficiary:</span>
                    <span className="text-white">{selectedReceipt.accountHolderName}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Destination:</span>
                    <span className="text-white">{selectedReceipt.recipientDetail}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Status:</span>
                    <span className="text-emerald-400 uppercase font-black">
                      ✅ {selectedReceipt.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Timestamp:</span>
                    <span className="text-slate-300">
                      {new Date(selectedReceipt.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setSelectedReceipt(null);
                  }}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl cursor-pointer"
                >
                  Close Receipt
                </button>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
