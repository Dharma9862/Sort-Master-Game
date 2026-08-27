import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Play, RotateCcw, Sparkles, Award, Video, Wallet, WifiOff } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';

interface VictoryModalProps {
  isOpen: boolean;
  levelNumber: number;
  starsEarned: number;
  baseCoins: number;
  pointsEarned?: number;
  totalPoints?: number;
  currencySymbol?: string;
  currencyRatePerLakh?: number;
  movesUsed: number;
  maxMoves?: number;
  isMultiStage?: boolean;
  currentStage?: number;
  totalStages?: number;
  isOnline?: boolean;
  onNextLevel: () => void;
  onReplayLevel: () => void;
  onWatchAdDoubleCoins: () => void;
  onOpenWithdraw?: () => void;
  onOpenWallet?: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  levelNumber,
  starsEarned,
  baseCoins,
  pointsEarned = 2500,
  totalPoints = 0,
  currencySymbol = '₹',
  currencyRatePerLakh = 10.0,
  movesUsed,
  maxMoves,
  isMultiStage,
  currentStage = 1,
  totalStages = 1,
  isOnline = true,
  onNextLevel,
  onReplayLevel,
  onWatchAdDoubleCoins,
  onOpenWithdraw,
  onOpenWallet,
}) => {
  useEffect(() => {
    if (isOpen) {
      sounds.playWin();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'],
        });
      } catch {
        // confetti fallback
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isStageIntermediate = isMultiStage && currentStage < totalStages;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 20 }}
          className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-amber-500/50 shadow-2xl text-white flex flex-col p-6 text-center overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Level Header */}
          <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 mb-1">
            {isStageIntermediate ? `STAGE ${currentStage} OF ${totalStages}` : `LEVEL ${levelNumber}`}
          </span>
          <h3 className="text-2xl font-black tracking-tight text-white mb-4">
            {isStageIntermediate ? 'Stage Complete!' : levelNumber === 200 ? '👑 SORT MASTER CHAMPION!' : 'Level Cleared!'}
          </h3>

          {/* 3-Star Rating Animation */}
          <div className="flex items-center justify-center space-x-3 my-2">
            {[1, 2, 3].map((starIndex) => {
              const isFilled = starIndex <= starsEarned;
              return (
                <motion.div
                  key={starIndex}
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: isFilled ? [1, 1.3, 1] : 1, rotate: 0 }}
                  transition={{ delay: 0.2 + starIndex * 0.18, duration: 0.35 }}
                  className="relative"
                >
                  <Star
                    className={`w-12 h-12 drop-shadow-md ${
                      isFilled
                        ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                        : 'fill-slate-800 text-slate-700'
                    }`}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Level Milestone Badges */}
          {levelNumber === 100 && !isStageIntermediate && (
            <div className="p-3 mb-3 bg-gradient-to-r from-purple-950/90 via-indigo-950/90 to-emerald-950/90 rounded-2xl border border-purple-500/50 text-center animate-pulse">
              <div className="flex items-center justify-center space-x-2 text-xs font-black text-amber-300">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>LEVEL 100 BADGE EARNED!</span>
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </div>
              <p className="text-[11px] text-emerald-300 font-bold mt-0.5">
                🧪 +Tube Booster Unlocked & 2 Lakhs Bank Converter Enabled!
              </p>
            </div>
          )}

          {levelNumber === 50 && !isStageIntermediate && (
            <div className="p-3 mb-3 bg-gradient-to-r from-amber-950/90 via-slate-900 to-emerald-950/90 rounded-2xl border border-amber-500/50 text-center">
              <div className="flex items-center justify-center space-x-1.5 text-xs font-black text-amber-300">
                <Award className="w-4 h-4 text-amber-400" />
                <span>LEVEL 50 MILESTONE CLEARED!</span>
              </div>
              <p className="text-[11px] text-emerald-300 font-bold mt-0.5">
                🔓 1 Lakh Points Bank Converter is now active!
              </p>
            </div>
          )}

          {/* Stats Badges */}
          <div className="grid grid-cols-2 gap-2 my-3 p-3 bg-slate-950/70 rounded-2xl border border-slate-800">
            <div className="text-center p-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Moves</span>
              <div className="text-sm font-extrabold text-white font-mono">
                {movesUsed} {maxMoves ? `/ ${maxMoves}` : ''}
              </div>
            </div>
            <div className="text-center p-1 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <span className="text-[10px] uppercase font-bold text-amber-300 block">Coin Reward</span>
              <div className="text-sm font-extrabold text-amber-400 flex items-center justify-center space-x-1">
                <span>+{baseCoins}</span>
                <span>🪙</span>
              </div>
            </div>
          </div>

          {/* Withdrawable Cash Points Earned Banner */}
          {!isStageIntermediate && (
            <div className="p-3 mb-3 bg-gradient-to-r from-emerald-950/80 to-teal-950/80 rounded-2xl border border-emerald-500/40 text-center relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="text-base">⭐</span>
                  <div className="text-left">
                    <div className="text-xs font-black text-emerald-300">
                      +{pointsEarned.toLocaleString()} Withdrawable Points
                    </div>
                    <div className="text-[10px] text-slate-300">
                      ≈ +{currencySymbol}{((pointsEarned / 100000) * currencyRatePerLakh).toFixed(2)} Direct Bank Cash
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  {onOpenWallet && (
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        onOpenWallet();
                      }}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-[10px] rounded-lg border border-emerald-500/30 shadow flex items-center space-x-1 cursor-pointer"
                    >
                      <Wallet className="w-3 h-3 text-emerald-400" />
                      <span>Wallet</span>
                    </button>
                  )}

                  {onOpenWithdraw && (
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        onOpenWithdraw();
                      }}
                      className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] rounded-lg shadow cursor-pointer"
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Double Coins & Points Rewarded Ad Prompt */}
          {!isStageIntermediate && (
            isOnline ? (
              <button
                type="button"
                onClick={onWatchAdDoubleCoins}
                className="w-full py-2.5 px-4 mb-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 hover:bg-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow"
              >
                <Video className="w-4 h-4 text-amber-400" />
                <span>Watch Ad for 2× Rewards (+{baseCoins} 🪙 & +{pointsEarned} ⭐)</span>
              </button>
            ) : (
              <div className="w-full py-2 px-3 mb-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-400 text-[11px] font-medium flex items-center justify-center space-x-2">
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span>2× Point Increaser paused (Offline Mode)</span>
              </div>
            )
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 mt-2">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onReplayLevel();
              }}
              className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center justify-center cursor-pointer"
              title="Replay Level"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onNextLevel();
              }}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center space-x-2 transition-transform transform active:scale-98 cursor-pointer"
            >
              <span>{isStageIntermediate ? 'Next Stage' : 'Next Level'}</span>
              <Play className="w-4 h-4 fill-white" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
