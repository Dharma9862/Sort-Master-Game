import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Flame, Gift, Check, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

interface DailyRewardModalProps {
  isOpen: boolean;
  streak: number;
  claimedDays: number[];
  canClaimToday: boolean;
  onClaimDay: (day: number) => void;
  onClose: () => void;
}

const DAILY_REWARDS_CONFIG = [
  { day: 1, type: 'coins', amount: 100, points: 5000, label: '100 🪙 + 5k ⭐', icon: '🪙' },
  { day: 2, type: 'coins', amount: 150, points: 10000, label: '150 🪙 + 10k ⭐', icon: '🪙' },
  { day: 3, type: 'hints', amount: 2, points: 15000, label: '+2 💡 + 15k ⭐', icon: '💡' },
  { day: 4, type: 'coins', amount: 250, points: 20000, label: '250 🪙 + 20k ⭐', icon: '🪙' },
  { day: 5, type: 'shuffles', amount: 2, points: 30000, label: '+2 🔀 + 30k ⭐', icon: '🔀' },
  { day: 6, type: 'coins', amount: 500, points: 50000, label: '500 🪙 + 50k ⭐', icon: '💰' },
  { day: 7, type: 'mystery', amount: 1000, points: 100000, label: '1 Lakh ⭐ Chest', icon: '🎁' },
];

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
  isOpen,
  streak,
  claimedDays,
  canClaimToday,
  onClaimDay,
  onClose,
}) => {
  if (!isOpen) return null;

  // Determine current active day index (1-indexed, loop every 7 days)
  const currentDayIndex = ((streak - 1) % 7) + 1;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.93 }}
          className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-amber-500/40 shadow-2xl text-white flex flex-col p-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
                <Flame className="w-6 h-6 fill-orange-400 text-orange-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">Daily Calendar</h3>
                <div className="flex items-center space-x-1 text-xs text-orange-400 font-semibold">
                  <span>{streak} Day Streak!</span>
                  <span>🔥</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subtitle */}
          <p className="text-xs text-slate-300 my-3 text-center">
            Log in each day to claim escalating rewards & unlock the Day 7 Mega Mystery Chest!
          </p>

          {/* 7 Days Grid */}
          <div className="grid grid-cols-3 gap-2.5 my-2">
            {DAILY_REWARDS_CONFIG.slice(0, 6).map((item) => {
              const isClaimed = claimedDays.includes(item.day);
              const isToday = item.day === currentDayIndex;
              const isEligibleToClaim = isToday && canClaimToday && !isClaimed;

              return (
                <div
                  key={item.day}
                  className={`relative p-3 rounded-2xl border flex flex-col items-center text-center transition-all ${
                    isClaimed
                      ? 'bg-slate-800/50 border-slate-700/60 opacity-70'
                      : isEligibleToClaim
                      ? 'bg-gradient-to-b from-amber-500/20 to-orange-500/20 border-amber-400 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/40'
                      : 'bg-slate-800/70 border-slate-700'
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Day {item.day}
                  </span>
                  <div className="text-2xl my-1">{item.icon}</div>
                  <span className="text-xs font-bold text-white leading-tight">{item.label}</span>

                  {isClaimed && (
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px] rounded-2xl flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
                        <Check className="w-4 h-4" />
                      </div>
                    </div>
                  )}

                  {isEligibleToClaim && (
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playCoin();
                        onClaimDay(item.day);
                      }}
                      className="mt-2 w-full py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black uppercase tracking-wide animate-bounce cursor-pointer shadow"
                    >
                      Claim
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Day 7 Mega Card */}
          {(() => {
            const day7 = DAILY_REWARDS_CONFIG[6];
            const isClaimed7 = claimedDays.includes(7);
            const isToday7 = currentDayIndex === 7;
            const isEligible7 = isToday7 && canClaimToday && !isClaimed7;

            return (
              <div
                className={`relative mt-2 p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                  isClaimed7
                    ? 'bg-slate-800/50 border-slate-700/60 opacity-70'
                    : isEligible7
                    ? 'bg-gradient-to-r from-amber-950 via-purple-950 to-amber-950 border-amber-400 shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/50'
                    : 'bg-gradient-to-r from-slate-800 to-indigo-950/60 border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-3xl shadow">
                    🎁
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">
                      Day 7 Ultimate Reward
                    </div>
                    <div className="text-sm font-black text-white">1 Lakh ⭐ Mega Chest</div>
                    <div className="text-[11px] text-emerald-400 font-semibold">1,000 Coins + 100k Cash Points (₹10.00)</div>
                  </div>
                </div>

                {isClaimed7 ? (
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center space-x-1">
                    <Check className="w-4 h-4" />
                    <span>Claimed</span>
                  </div>
                ) : isEligible7 ? (
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playPowerup();
                      onClaimDay(7);
                    }}
                    className="py-2 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wide animate-pulse cursor-pointer shadow-lg shadow-amber-500/30"
                  >
                    Claim 🎁
                  </button>
                ) : (
                  <div className="text-xs text-slate-400 font-semibold px-2 py-1 bg-slate-800 rounded-lg">
                    Locked
                  </div>
                )}
              </div>
            );
          })()}

          {/* Footer Status */}
          <div className="mt-4 text-center text-xs text-slate-400">
            {canClaimToday ? (
              <span className="text-emerald-400 font-semibold flex items-center justify-center space-x-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Today's reward is ready to claim!</span>
              </span>
            ) : (
              <span>Come back tomorrow for your next reward!</span>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
