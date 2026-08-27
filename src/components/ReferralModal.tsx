import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Gift,
  Users,
  Copy,
  Check,
  Share2,
  Sparkles,
  TrendingUp,
  Award,
  Wallet,
  CheckCircle2,
  ArrowRight,
  Send,
  MessageCircle,
  ExternalLink,
  Zap,
  HelpCircle,
  RefreshCw,
  Coins,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PlayerProfile, ReferralRecord } from '../types/game';
import { sounds } from '../utils/audio';

interface ReferralModalProps {
  isOpen: boolean;
  profile: PlayerProfile;
  onClose: () => void;
  onClaimReferralBonus: (points: number, friendName: string, code: string) => void;
  onEnterFriendCode: (code: string) => { success: boolean; message: string };
  onOpenWallet: () => void;
}

const MILESTONES = [
  { count: 1, rewardPoints: 100, label: '1 Friend', badge: '🌱 Novice Referrer' },
  { count: 5, rewardPoints: 500, label: '5 Friends', badge: '🥉 Bronze Ambassador' },
  { count: 10, rewardPoints: 1000, label: '10 Friends', badge: '🥈 Silver Ambassador' },
  { count: 25, rewardPoints: 2500, label: '25 Friends', badge: '👑 Diamond Legend' },
];

const SAMPLE_NAMES = [
  'Rahul V.',
  'Sophia Chen',
  'Alex Rivera',
  'Deepak Gupta',
  'Liam Johnson',
  'Priya Patel',
  'Elena Rostova',
  'Carlos Silva',
  'Arjun Sharma',
  'Maya Lin',
];

export const ReferralModal: React.FC<ReferralModalProps> = ({
  isOpen,
  profile,
  onClose,
  onClaimReferralBonus,
  onEnterFriendCode,
  onOpenWallet,
}) => {
  const [activeTab, setActiveTab] = useState<'invite' | 'history' | 'claim_code'>('invite');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [friendCodeInput, setFriendCodeInput] = useState<string>('');
  const [codeClaimResult, setCodeClaimResult] = useState<{ success: boolean; message: string } | null>(null);
  const [simulatedFriendName, setSimulatedFriendName] = useState<string>('');
  const [inviteSuccessToast, setInviteSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const myReferralCode = profile.referralCode || 'SORT-8492X';
  const referralLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/?ref=${myReferralCode}` 
    : `https://sortmaster.app/?ref=${myReferralCode}`;
  
  const referralsList = profile.referralsList || [];
  const referralCount = referralsList.length;
  const totalPointsEarnedFromReferrals = referralsList.reduce((sum, item) => sum + item.pointsAwarded, 0);

  const handleCopyCode = () => {
    sounds.playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(myReferralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyLink = () => {
    sounds.playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(referralLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    sounds.playClick();
    const shareText = `Play Sort Master with me! Sort tubes, earn real cash points and withdraw via UPI. Use my referral code: ${myReferralCode} to get +100 Points bonus! 🎮✨\n${referralLink}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Sort Master - Play & Earn',
          text: shareText,
          url: referralLink,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsAppShare = () => {
    sounds.playClick();
    const text = encodeURIComponent(
      `🎉 Join me on Sort Master! Sort colorful bottles, solve puzzles, and earn real cash points with instant UPI bank payouts. Use my invite code: ${myReferralCode} for a +100 Points bonus! 💰✨\n${referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleTelegramShare = () => {
    sounds.playClick();
    const text = encodeURIComponent(
      `🎉 Join me on Sort Master! Use my referral code ${myReferralCode} to claim +100 Cash Points! 💰\n${referralLink}`
    );
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${text}`, '_blank');
  };

  const handleSimulateReferral = () => {
    sounds.playClick();
    const chosenName = simulatedFriendName.trim() || SAMPLE_NAMES[Math.floor(Math.random() * SAMPLE_NAMES.length)];
    
    // Trigger confetti explosion
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'],
      });
    } catch {
      // ignore
    }

    onClaimReferralBonus(100, chosenName, myReferralCode);
    setInviteSuccessToast(`🎉 ${chosenName} joined using your code! +100 Points credited!`);
    setSimulatedFriendName('');
    setTimeout(() => setInviteSuccessToast(null), 3500);
  };

  const handleSubmitFriendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendCodeInput.trim()) return;

    sounds.playClick();
    const res = onEnterFriendCode(friendCodeInput.trim());
    setCodeClaimResult(res);
    if (res.success) {
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#fbbf24'],
        });
      } catch {
        // ignore
      }
      setFriendCodeInput('');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 15 }}
          className="relative w-full max-w-lg max-h-[90vh] overflow-hidden rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl text-white flex flex-col"
        >
          {/* Top Banner & Header */}
          <div className="p-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 border-b border-purple-500/30 flex items-center justify-between relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center space-x-3 relative z-10">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white shadow-lg border border-pink-400/40">
                <Gift className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-black text-white flex items-center space-x-2">
                  <span>Refer & Earn Bonus</span>
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[10px] font-black tracking-wide shadow">
                    +100 PTS / REFER
                  </span>
                </h3>
                <p className="text-xs text-purple-200">Invite friends & get instant withdrawable Cash Points</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800/80 text-slate-300 hover:text-white cursor-pointer relative z-10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Toast Notification Banner */}
          {inviteSuccessToast && (
            <div className="bg-emerald-600 text-white text-xs font-bold py-2 px-4 flex items-center justify-between animate-fadeIn border-b border-emerald-500">
              <span className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{inviteSuccessToast}</span>
              </span>
              <button
                type="button"
                onClick={() => setInviteSuccessToast(null)}
                className="text-xs text-emerald-200 hover:text-white"
              >
                ✕
              </button>
            </div>
          )}

          {/* Quick Stats Summary Strip */}
          <div className="grid grid-cols-3 gap-2 px-4 py-3 bg-slate-950/60 border-b border-slate-800 text-center">
            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-[10px] font-bold text-slate-400">Total Friends</div>
              <div className="text-sm font-black text-white flex items-center justify-center space-x-1 mt-0.5">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>{referralCount}</span>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-[10px] font-bold text-slate-400">Points Earned</div>
              <div className="text-sm font-black text-amber-400 flex items-center justify-center space-x-1 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>+{totalPointsEarnedFromReferrals.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-[10px] font-bold text-slate-400">Rate Per Refer</div>
              <div className="text-sm font-black text-emerald-400 flex items-center justify-center space-x-1 mt-0.5">
                <Zap className="w-3.5 h-3.5" />
                <span>100 Pts</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 pt-2">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('invite');
              }}
              className={`flex-1 pb-2.5 text-xs font-black flex items-center justify-center space-x-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'invite'
                  ? 'text-purple-400 border-purple-500'
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share & Invite</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('claim_code');
              }}
              className={`flex-1 pb-2.5 text-xs font-black flex items-center justify-center space-x-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'claim_code'
                  ? 'text-purple-400 border-purple-500'
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Enter Friend's Code</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('history');
              }}
              className={`flex-1 pb-2.5 text-xs font-black flex items-center justify-center space-x-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'text-purple-400 border-purple-500'
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Invited Friends ({referralCount})</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* TAB 1: INVITE & SHARE */}
            {activeTab === 'invite' && (
              <div className="space-y-4">
                {/* Visual Reward Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/40 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-purple-300">
                        Unlimited Referral Program
                      </span>
                      <h4 className="text-base font-black text-white mt-0.5">
                        Give 100 Points, Get 100 Points!
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 max-w-xs leading-relaxed">
                        Every friend who joins using your link or code earns you <span className="text-amber-400 font-bold">100 Cash Points</span> instantly credited to your withdrawal wallet.
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex flex-col items-center justify-center shadow-lg flex-shrink-0">
                      <Coins className="w-7 h-7 text-amber-400 animate-bounce" />
                      <span className="text-xs font-black text-amber-300 mt-1">+100 PTS</span>
                    </div>
                  </div>
                </div>

                {/* Referral Code Copy Box */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Your Unique Referral Code:</span>
                    <span className="text-[10px] text-purple-400 font-mono">100 PTS / USE</span>
                  </label>

                  <div className="flex items-center space-x-2">
                    <div className="flex-1 py-2.5 px-3.5 rounded-xl bg-slate-900 border border-purple-500/30 font-mono text-sm font-black text-purple-300 tracking-wider flex items-center justify-between">
                      <span>{myReferralCode}</span>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-sans font-bold">
                        ACTIVE
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow ${
                        copiedCode
                          ? 'bg-emerald-600 text-white'
                          : 'bg-purple-600 hover:bg-purple-500 text-white'
                      }`}
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 1-Tap Social Share Buttons */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 block">
                    Share Instantly to Socials:
                  </span>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={handleWhatsAppShare}
                      className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleTelegramShare}
                      className="py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow"
                    >
                      <Send className="w-4 h-4" />
                      <span>Telegram</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNativeShare}
                      className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>More Apps</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center space-x-2 border border-slate-700 transition-all cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Invite Link Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Full Invite Link</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Interactive Instant Simulate Referral Tool (For instant testing & fun) */}
                <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-indigo-500/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-indigo-300 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Simulate Friend Join (+100 Pts)</span>
                    </span>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono font-bold">
                      TESTER
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={simulatedFriendName}
                      onChange={(e) => setSimulatedFriendName(e.target.value)}
                      placeholder="Enter friend name (e.g. Maya L.)"
                      className="flex-1 py-2 px-3 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />

                    <button
                      type="button"
                      onClick={handleSimulateReferral}
                      className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow transition-all cursor-pointer flex items-center space-x-1 flex-shrink-0"
                    >
                      <span>Add Refer (+100)</span>
                    </button>
                  </div>
                </div>

                {/* Milestone Rewards Tier */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span>Referral Milestones & Badges</span>
                    <span className="text-purple-400 font-mono">{referralCount} friends invited</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {MILESTONES.map((m) => {
                      const isUnlocked = referralCount >= m.count;
                      return (
                        <div
                          key={m.count}
                          className={`p-2.5 rounded-xl border transition-all text-center flex flex-col justify-between ${
                            isUnlocked
                              ? 'bg-purple-950/40 border-purple-500/50 text-white shadow-md ring-1 ring-purple-500/20'
                              : 'bg-slate-950/40 border-slate-800 text-slate-500'
                          }`}
                        >
                          <div className="text-[10px] font-bold font-mono">
                            {m.label}
                          </div>
                          <div className="my-1">
                            <span className={`text-xs font-black ${isUnlocked ? 'text-amber-400' : 'text-slate-400'}`}>
                              +{m.rewardPoints} Pts
                            </span>
                          </div>
                          <div className="text-[9px] truncate font-medium text-purple-300">
                            {m.badge}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ENTER FRIEND'S REFERRAL CODE */}
            {activeTab === 'claim_code' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/40 space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-400 text-xs font-black">
                    <Gift className="w-4 h-4" />
                    <span>Have a Friend's Referral Code?</span>
                  </div>
                  <h4 className="text-sm font-black text-white">
                    Claim +100 Points Welcome Gift!
                  </h4>
                  <p className="text-xs text-slate-300">
                    If someone invited you to Sort Master, enter their referral code below to receive an instant <strong className="text-emerald-400">+100 Cash Points</strong> bonus credited to your wallet balance.
                  </p>
                </div>

                {profile.referredByCode ? (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <h4 className="text-sm font-black text-white">Referral Bonus Already Claimed!</h4>
                    <p className="text-xs text-slate-400">
                      You used code <span className="font-mono text-emerald-300 font-bold">{profile.referredByCode}</span> and claimed your +100 Points welcome reward.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitFriendCode} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <label className="text-xs font-bold text-slate-300 block">
                      Enter Friend's Referral Code:
                    </label>

                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={friendCodeInput}
                        onChange={(e) => setFriendCodeInput(e.target.value.toUpperCase())}
                        placeholder="e.g. SORT-5839X"
                        className="flex-1 py-2.5 px-3.5 rounded-xl bg-slate-900 border border-slate-700 font-mono text-sm uppercase text-white focus:outline-none focus:border-emerald-500 tracking-wider"
                      />

                      <button
                        type="submit"
                        className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all cursor-pointer shadow flex items-center space-x-1"
                      >
                        <span>Claim +100</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {codeClaimResult && (
                      <div
                        className={`p-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 ${
                          codeClaimResult.success
                            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                            : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
                        }`}
                      >
                        {codeClaimResult.success ? (
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        ) : (
                          <HelpCircle className="w-4 h-4 flex-shrink-0" />
                        )}
                        <span>{codeClaimResult.message}</span>
                      </div>
                    )}
                  </form>
                )}

                {/* How it works info list */}
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-300">How Referral Bonuses Work:</div>
                  <ul className="text-[11px] text-slate-400 space-y-1.5 list-disc pl-4">
                    <li>100 Points are worth ₹0.01 INR or converted equivalent fiat currency.</li>
                    <li>Points automatically accumulate toward your withdrawable bank balance.</li>
                    <li>No limit on referrals — invite 10 friends for 1,000 pts or 100 friends for 10,000 pts!</li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 3: REFERRAL HISTORY */}
            {activeTab === 'history' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>Referral Activity Log</span>
                  <span className="text-amber-400 font-mono font-bold">
                    +{totalPointsEarnedFromReferrals} Points Total
                  </span>
                </div>

                {referralsList.length > 0 ? (
                  <div className="space-y-2">
                    {referralsList.map((refItem) => (
                      <div
                        key={refItem.id}
                        className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between hover:border-purple-500/40 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            <Users className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-black text-white flex items-center space-x-1.5">
                              <span>{refItem.friendName}</span>
                              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-mono">
                                JOINED
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {new Date(refItem.date).toLocaleDateString()} via {refItem.code}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-black text-amber-400 flex items-center justify-end space-x-1">
                            <Sparkles className="w-3 h-3" />
                            <span>+{refItem.pointsAwarded} Pts</span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-mono">
                            Credited ✓
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center space-y-2">
                    <Users className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400 font-bold">No friends invited yet</p>
                    <p className="text-[11px] text-slate-500">
                      Share your code on WhatsApp or simulate invites to earn +100 Points!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Action Bar */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between space-x-2">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onClose();
                onOpenWallet();
              }}
              className="py-2.5 px-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-colors"
            >
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>View Wallet ({profile.rewardPoints?.toLocaleString()} pts)</span>
            </button>

            <button
              type="button"
              onClick={handleCopyCode}
              className="flex-1 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-98"
            >
              <Copy className="w-4 h-4" />
              <span>{copiedCode ? 'Code Copied!' : 'Copy Invite Code'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
