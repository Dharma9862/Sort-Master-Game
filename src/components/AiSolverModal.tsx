import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Bot,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Zap,
  Coins,
  Video,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { ContainerData, ThemeConfig } from '../types/game';
import { SolverMove, findFullSolutionPath } from '../utils/solver';
import { sounds } from '../utils/audio';

export const AI_SOLVER_POINTS_COST = 250;

interface AiSolverModalProps {
  isOpen: boolean;
  containers: ContainerData[];
  capacity: number;
  theme: ThemeConfig;
  rewardPoints: number;
  levelNumber?: number;
  isOnline?: boolean;
  onApplyMove: (fromIdx: number, toIdx: number) => void;
  onDeductPoints?: (amount: number, reason?: string) => boolean;
  onRequestWatchAd?: (title: string, desc: string, onComplete: () => void) => void;
  onClose: () => void;
}

export const AiSolverModal: React.FC<AiSolverModalProps> = ({
  isOpen,
  containers,
  capacity,
  theme,
  rewardPoints,
  levelNumber = 1,
  isOnline = true,
  onApplyMove,
  onDeductPoints,
  onRequestWatchAd,
  onClose,
}) => {
  const [solutionMoves, setSolutionMoves] = useState<SolverMove[] | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 2x, 3x
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [hasDeductedPoints, setHasDeductedPoints] = useState<boolean>(false);
  const [isAdUnlocked, setIsAdUnlocked] = useState<boolean>(false);
  const [deductionFailed, setDeductionFailed] = useState<boolean>(false);

  // Initialize and compute solution path
  const runSolver = (forceFree: boolean = false) => {
    // Check points if not ad unlocked or free
    if (!forceFree && !isAdUnlocked) {
      if (rewardPoints < AI_SOLVER_POINTS_COST) {
        setDeductionFailed(true);
        setIsCalculating(false);
        return;
      }

      if (onDeductPoints && !hasDeductedPoints) {
        const success = onDeductPoints(AI_SOLVER_POINTS_COST, `AI Solver for Level ${levelNumber}`);
        if (!success) {
          setDeductionFailed(true);
          setIsCalculating(false);
          return;
        }
        setHasDeductedPoints(true);
      }
    }

    setDeductionFailed(false);
    setIsCalculating(true);
    setCurrentStepIndex(0);

    // Give UI a moment to render calculating spinner
    const timer = setTimeout(() => {
      const moves = findFullSolutionPath(containers, capacity, 5000);
      setSolutionMoves(moves);
      setIsCalculating(false);
    }, 120);

    return () => clearTimeout(timer);
  };

  // Trigger solve on modal open
  useEffect(() => {
    if (!isOpen) {
      setIsAutoPlaying(false);
      setHasDeductedPoints(false);
      setIsAdUnlocked(false);
      setDeductionFailed(false);
      setSolutionMoves(null);
      return;
    }

    runSolver();
  }, [isOpen, containers, capacity]);

  // Auto-play timer
  useEffect(() => {
    if (!isAutoPlaying || !solutionMoves || solutionMoves.length === 0) return;

    if (currentStepIndex >= solutionMoves.length) {
      setIsAutoPlaying(false);
      return;
    }

    const intervalTime = Math.max(350, 1000 / playbackSpeed);
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        const next = prev + 1;
        sounds.playClick();
        if (next >= solutionMoves.length) {
          setIsAutoPlaying(false);
          sounds.playWin();
          return solutionMoves.length;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isAutoPlaying, currentStepIndex, solutionMoves, playbackSpeed]);

  if (!isOpen) return null;

  const currentMove = solutionMoves && currentStepIndex < solutionMoves.length
    ? solutionMoves[currentStepIndex]
    : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.93 }}
          className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-indigo-500/40 shadow-2xl text-white flex flex-col p-5 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shadow-inner">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white flex items-center space-x-1.5">
                  <span>AI Solver Walkthrough</span>
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-indigo-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-black">
                    -250 ⭐ / solve
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Step-by-step mathematical solution path</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Points Status Strip */}
          <div className="mt-3 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 text-slate-300">
              <span className="text-slate-400">Your Balance:</span>
              <span className="font-mono font-black text-amber-300 flex items-center space-x-1">
                <span>⭐</span>
                <span>{rewardPoints.toLocaleString()}</span>
              </span>
            </div>
            {isAdUnlocked ? (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Ad Pass Active (Free)</span>
              </span>
            ) : hasDeductedPoints ? (
              <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded-full flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-indigo-300" />
                <span>250 Points Paid</span>
              </span>
            ) : (
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-full">
                Cost: 250 Points
              </span>
            )}
          </div>

          {/* Insufficient Points Screen */}
          {deductionFailed && !isAdUnlocked && (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-lg animate-pulse">
                <Lock className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-black text-white">250 Reward Points Required</h4>
                <p className="text-xs text-slate-300 max-w-xs mx-auto">
                  Using the AI Solver costs <strong>250 ⭐ Points</strong> per solve. You currently have{' '}
                  <strong className="text-amber-300">{rewardPoints.toLocaleString()} ⭐</strong>.
                </p>
              </div>

              <div className="w-full space-y-2 pt-2">
                {onRequestWatchAd && (
                  <button
                    type="button"
                    disabled={!isOnline}
                    onClick={() => {
                      if (!isOnline) return;
                      sounds.playClick();
                      onRequestWatchAd('Free AI Solver Pass', 'Watch a short video to unlock 1 free AI Solver walkthrough!', () => {
                        setIsAdUnlocked(true);
                        setDeductionFailed(false);
                        runSolver(true);
                      });
                    }}
                    className={`w-full py-3 px-4 rounded-2xl font-black text-xs shadow-xl flex items-center justify-center space-x-2 transition-all ${
                      isOnline
                        ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:to-pink-400 text-white cursor-pointer transform active:scale-98'
                        : 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    <span>{isOnline ? 'Watch Video for 1 Free AI Solve' : 'Video Ads Unavailable Offline'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-colors cursor-pointer"
                >
                  Play Levels to Earn More Points
                </button>
              </div>
            </div>
          )}

          {/* Calculating State */}
          {isCalculating && !deductionFailed && (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-indigo-300 font-bold">Analyzing puzzle state graph...</p>
              <p className="text-xs text-slate-400">Finding shortest optimal move tree</p>
            </div>
          )}

          {/* Solution Ready */}
          {!isCalculating && !deductionFailed && solutionMoves && solutionMoves.length > 0 && (
            <div className="space-y-4 my-3">
              {/* Progress Summary Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border border-indigo-500/30">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-indigo-300 flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Total Steps to Victory: {solutionMoves.length}</span>
                  </span>
                  <span className="font-mono font-black text-amber-300 bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-800">
                    Step {Math.min(currentStepIndex + 1, solutionMoves.length)} / {solutionMoves.length}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    animate={{ width: `${(currentStepIndex / solutionMoves.length) * 100}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </div>

              {/* Active Step Visualizer */}
              {currentMove ? (
                <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col items-center justify-center space-y-3">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Recommended Action
                  </div>

                  <div className="flex items-center justify-center space-x-4">
                    <div className="flex flex-col items-center space-y-1">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-400/80 text-amber-300 font-mono font-black text-lg flex items-center justify-center shadow-lg animate-pulse">
                        #{currentMove.fromIndex + 1}
                      </div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase">Pick From</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <ArrowRight className="w-6 h-6 text-indigo-400 animate-bounce" />
                    </div>

                    <div className="flex flex-col items-center space-y-1">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400/80 text-emerald-300 font-mono font-black text-lg flex items-center justify-center shadow-lg">
                        #{currentMove.toIndex + 1}
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase">Pour Into</span>
                    </div>
                  </div>

                  <p className="text-xs text-center text-slate-300 font-medium">
                    Pour top item from <strong>Tube #{currentMove.fromIndex + 1}</strong> into <strong>Tube #{currentMove.toIndex + 1}</strong>.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
                  <h4 className="text-sm font-black text-white">Full Solution Complete!</h4>
                  <p className="text-xs text-emerald-300 font-medium">
                    All tubes have been sorted into uniform colors.
                  </p>
                </div>
              )}

              {/* Playback Controls */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                <button
                  type="button"
                  disabled={currentStepIndex <= 0}
                  onClick={() => {
                    sounds.playClick();
                    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
                  }}
                  className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-bold text-xs flex items-center justify-center space-x-1 border border-slate-700 cursor-pointer"
                >
                  <SkipBack className="w-4 h-4" />
                  <span>Prev</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setIsAutoPlaying((prev) => !prev);
                  }}
                  className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1 border cursor-pointer ${
                    isAutoPlaying
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500'
                  }`}
                >
                  {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isAutoPlaying ? 'Pause' : 'Auto'}</span>
                </button>

                <button
                  type="button"
                  disabled={currentStepIndex >= solutionMoves.length}
                  onClick={() => {
                    sounds.playClick();
                    setCurrentStepIndex((prev) => Math.min(solutionMoves.length, prev + 1));
                  }}
                  className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-bold text-xs flex items-center justify-center space-x-1 border border-slate-700 cursor-pointer"
                >
                  <span>Next</span>
                  <SkipForward className="w-4 h-4" />
                </button>

                {/* Speed Switcher */}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setPlaybackSpeed((s) => (s === 1 ? 2 : s === 2 ? 3 : 1));
                  }}
                  className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono font-bold text-xs flex items-center justify-center border border-slate-700 cursor-pointer"
                >
                  {playbackSpeed}x Speed
                </button>
              </div>

              {/* Action Button: Apply Move to Live Game */}
              {currentMove && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playPour();
                    onApplyMove(currentMove.fromIndex, currentMove.toIndex);
                    onClose();
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl flex items-center justify-center space-x-2 transition-all cursor-pointer transform active:scale-98"
                >
                  <Zap className="w-4 h-4 text-slate-950 fill-current" />
                  <span>Execute Move #{currentStepIndex + 1} on Board</span>
                </button>
              )}
            </div>
          )}

          {/* No Solution Possible / Already Solved */}
          {!isCalculating && !deductionFailed && (!solutionMoves || solutionMoves.length === 0) && (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-black text-white">Already Solved or No Moves Needed</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                The current puzzle state is either already sorted, or use a <strong>+1 Tube</strong> powerup to create open movement slots.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
