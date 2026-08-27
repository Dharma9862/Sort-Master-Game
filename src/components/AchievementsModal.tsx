import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Check, Sparkles } from 'lucide-react';
import { INITIAL_ACHIEVEMENTS } from '../data/achievements';
import { PlayerProfile } from '../types/game';
import { sounds } from '../utils/audio';

interface AchievementsModalProps {
  isOpen: boolean;
  profile: PlayerProfile;
  onClaimAchievement: (achievementId: string, coinsReward: number, pointsReward?: number) => void;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  profile,
  onClaimAchievement,
  onClose,
}) => {
  if (!isOpen) return null;

  // Calculate dynamic progress for each achievement
  const getProgress = (id: string, target: number): { current: number; isComplete: boolean } => {
    let current = 0;
    switch (id) {
      case 'first_win':
      case 'level_10':
      case 'level_25':
      case 'level_50':
      case 'level_100':
      case 'level_200':
        current = profile.stats.levelsCompleted;
        break;
      case 'no_hint_10':
        current = Math.max(0, profile.stats.levelsCompleted - profile.stats.hintsUsed);
        break;
      case 'perfect_5':
        current = profile.stats.perfectLevels;
        break;
      case 'theme_collector_3':
      case 'theme_collector_all':
        current = profile.unlockedThemes.length;
        break;
      case 'streak_3':
      case 'streak_7':
        current = profile.dailyStreak;
        break;
      case 'undo_fan':
        current = profile.stats.totalMoves;
        break;
      case 'ad_watcher':
        current = profile.stats.adsWatched;
        break;
      default:
        current = profile.achievements[id]?.progress || 0;
    }
    return {
      current: Math.min(target, current),
      isComplete: current >= target,
    };
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.93 }}
          className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl text-white flex flex-col p-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">Achievements</h3>
                <p className="text-xs text-amber-400 font-medium">Earn Badges & Free Coin Bounties</p>
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

          {/* Achievements List */}
          <div className="space-y-3 my-4">
            {INITIAL_ACHIEVEMENTS.map((item) => {
              const { current, isComplete } = getProgress(item.id, item.target);
              const isClaimed = profile.achievements[item.id]?.claimed || false;
              const canClaim = isComplete && !isClaimed;
              const pct = Math.min(100, Math.round((current / item.target) * 100));

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between space-x-3 ${
                    canClaim
                      ? 'bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border-amber-500/60 shadow-lg shadow-amber-500/20'
                      : isClaimed
                      ? 'bg-slate-800/40 border-slate-800 opacity-70'
                      : 'bg-slate-800/80 border-slate-700/80'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="w-11 h-11 rounded-2xl bg-slate-950/80 border border-slate-700 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                      {item.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 truncate">
                          <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                          {item.id === 'level_100' && (
                            <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-extrabold text-[9px] uppercase tracking-tight shrink-0">
                              +Tube Powerup
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                          <span className="text-[11px] font-bold text-amber-400 flex items-center space-x-0.5">
                            <span>+{item.rewardCoins}</span>
                            <span>🪙</span>
                          </span>
                          {item.rewardPoints && (
                            <span className="text-[11px] font-bold text-emerald-400 flex items-center space-x-0.5">
                              <span>+{item.rewardPoints}</span>
                              <span>⭐</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 truncate mb-1.5">{item.description}</p>

                      {/* Progress bar */}
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 h-1.5 bg-slate-950 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isComplete
                                ? 'bg-emerald-500'
                                : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 font-semibold shrink-0">
                          {current}/{item.target}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Claim Button / State */}
                  <div className="shrink-0">
                    {isClaimed ? (
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                    ) : canClaim ? (
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playCoin();
                          onClaimAchievement(item.id, item.rewardCoins, item.rewardPoints);
                        }}
                        className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider animate-bounce shadow-md shadow-amber-500/30 cursor-pointer"
                      >
                        Claim
                      </button>
                    ) : (
                      <div className="text-[11px] text-slate-500 font-bold px-2 py-1 bg-slate-950/60 rounded-lg">
                        {pct}%
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
