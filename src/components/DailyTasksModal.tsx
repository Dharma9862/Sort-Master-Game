import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Target,
  CheckCircle2,
  Gift,
  Coins,
  Sparkles,
  Clock,
  Flame,
  Award,
  ChevronRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DailyTask, DailyTasksState, PlayerProfile } from '../types/game';
import {
  DAILY_BONUS_TARGET,
  getOrCreateDailyTasksState,
  getResolvedDailyTasks,
} from '../data/dailyTasks';
import { sounds } from '../utils/audio';

interface DailyTasksModalProps {
  isOpen: boolean;
  profile: PlayerProfile;
  onClose: () => void;
  onClaimTask: (taskId: string, coins: number, points: number) => void;
  onClaimDailyBonus: (coins: number, points: number, extraBottles: number) => void;
  onOpenDailyCalendar?: () => void;
}

export const DailyTasksModal: React.FC<DailyTasksModalProps> = ({
  isOpen,
  profile,
  onClose,
  onClaimTask,
  onClaimDailyBonus,
  onOpenDailyCalendar,
}) => {
  const [timeLeftToReset, setTimeLeftToReset] = useState<string>('');

  // Daily reset countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diffMs = midnight.getTime() - now.getTime();

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeLeftToReset(
        `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  const dailyState: DailyTasksState = getOrCreateDailyTasksState(profile.dailyTasksState);
  const tasks: DailyTask[] = getResolvedDailyTasks(dailyState);

  const completedCount = tasks.filter((t) => t.completed || t.claimed).length;
  const isBonusEligible =
    completedCount >= DAILY_BONUS_TARGET.requiredTasks && !dailyState.bonusClaimed;
  const isBonusClaimed = !!dailyState.bonusClaimed;

  const handleClaim = (task: DailyTask) => {
    sounds.playCoin();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#3B82F6'],
      });
    } catch {
      // ignore
    }
    onClaimTask(task.id, task.rewardCoins, task.rewardPoints);
  };

  const handleClaimBonus = () => {
    sounds.playVictory();
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#EC4899', '#F59E0B', '#10B981', '#8B5CF6'],
      });
    } catch {
      // ignore
    }
    onClaimDailyBonus(
      DAILY_BONUS_TARGET.rewardCoins,
      DAILY_BONUS_TARGET.rewardPoints,
      DAILY_BONUS_TARGET.extraBottles
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-b from-slate-800 to-slate-900 border-b border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h2 className="text-lg font-black text-white tracking-tight">Daily Targets</h2>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-extrabold text-[9px] uppercase">
                    Missions
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Resets in: <strong className="font-mono text-slate-200">{timeLeftToReset}</strong></span>
                  </span>
                </div>
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

          {/* Scrollable Tasks Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            {/* Grand Mega Daily Chest Banner */}
            <div
              className={`relative overflow-hidden rounded-2xl p-4 border transition-all ${
                isBonusClaimed
                  ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                  : isBonusEligible
                  ? 'bg-gradient-to-r from-amber-950 via-purple-950 to-amber-950 border-amber-400 shadow-xl shadow-amber-500/20 ring-1 ring-amber-400'
                  : 'bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/70 border-slate-700/80'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl shadow">
                    🎁
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                        Mega Target Milestone
                      </span>
                      <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[9px] font-black">
                        {completedCount}/{DAILY_BONUS_TARGET.requiredTasks} Done
                      </span>
                    </div>
                    <div className="text-sm font-black text-white">Daily Master Chest</div>
                    <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                      +500 🪙 &nbsp;•&nbsp; +50k ⭐ (₹5.00) &nbsp;•&nbsp; +1 🧪 Tube
                    </div>
                  </div>
                </div>

                {/* Claim or Status Badge */}
                <div>
                  {isBonusClaimed ? (
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Claimed</span>
                    </div>
                  ) : isBonusEligible ? (
                    <button
                      type="button"
                      onClick={handleClaimBonus}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/30 animate-bounce cursor-pointer"
                    >
                      Open Chest
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 font-mono bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800">
                      Need {Math.max(0, DAILY_BONUS_TARGET.requiredTasks - completedCount)} more
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar for chest */}
              <div className="mt-3 w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (completedCount / DAILY_BONUS_TARGET.requiredTasks) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Daily Tasks List */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
                <span>Today's Target Missions</span>
                <span className="text-amber-400 font-mono">
                  {tasks.filter((t) => t.claimed).length}/{tasks.length} Completed
                </span>
              </div>

              {tasks.map((task) => {
                const percent = Math.min(100, Math.round((task.current / task.target) * 100));

                return (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      task.claimed
                        ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                        : task.completed
                        ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border-emerald-500/40 shadow-md shadow-emerald-500/10'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xl shrink-0 mt-0.5">
                          {task.icon}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white leading-tight">
                            {task.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                            {task.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-1 text-[10px] font-bold">
                            <span className="text-amber-300 flex items-center space-x-0.5">
                              <span>🪙</span>
                              <span>+{task.rewardCoins}</span>
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className="text-emerald-400 font-mono">
                              +{(task.rewardPoints / 1000).toFixed(0)}k ⭐ (₹{(task.rewardPoints / 10000).toFixed(2)})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action / Claim Button */}
                      <div className="shrink-0 ml-2">
                        {task.claimed ? (
                          <div className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-500 text-[10px] font-bold flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Done</span>
                          </div>
                        ) : task.completed ? (
                          <button
                            type="button"
                            onClick={() => handleClaim(task)}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
                          >
                            Claim
                          </button>
                        ) : (
                          <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                            {task.current}/{task.target}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    {!task.claimed && (
                      <div className="mt-2.5 w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            task.completed ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Daily Calendar / Streak Link */}
            {onOpenDailyCalendar && (
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onClose();
                  onOpenDailyCalendar();
                }}
                className="w-full p-3 rounded-2xl bg-slate-950/70 border border-orange-500/30 hover:border-orange-500/60 text-xs text-slate-300 flex items-center justify-between transition-colors cursor-pointer group"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400">
                    <Flame className="w-4 h-4 fill-orange-400" />
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-white block">
                      Daily Streak Calendar ({profile.dailyStreak || 1} Days)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Claim today's login reward & Mystery Chest
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-orange-400 transition-colors" />
              </button>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-3 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center space-x-1 text-amber-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Targets refresh every midnight automatically</span>
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
