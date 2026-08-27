import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Video, RotateCcw, AlertTriangle, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

interface GameOverModalProps {
  isOpen: boolean;
  reason: 'moves' | 'time' | 'stuck';
  lives: number;
  coins: number;
  onContinueWithAd: () => void;
  onContinueWithCoins: () => void;
  onRestartLevel: () => void;
  onRefillLivesWithAd: () => void;
  onClose: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  reason,
  lives,
  coins,
  onContinueWithAd,
  onContinueWithCoins,
  onRestartLevel,
  onRefillLivesWithAd,
  onClose,
}) => {
  if (!isOpen) return null;

  const canAffordCoins = coins >= 50;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-rose-500/40 shadow-2xl text-white flex flex-col p-6 text-center"
        >
          {/* Top Icon */}
          <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-3xl mb-3 shadow-lg">
            {reason === 'time' ? '⏳' : '⚠️'}
          </div>

          <h3 className="text-xl font-extrabold text-white mb-1">
            {reason === 'time' ? "Time's Up!" : 'Out of Moves!'}
          </h3>
          <p className="text-xs text-slate-300 mb-4">
            {reason === 'time'
              ? 'You ran out of time on this speed challenge.'
              : 'Don’t give up! Get 5 extra moves to finish sorting.'}
          </p>

          {/* Continue Options */}
          <div className="space-y-2.5 my-2">
            {/* Rewarded Ad Continue */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onContinueWithAd();
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs uppercase tracking-wide shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 transition-transform transform active:scale-98 cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>Watch Ad → +5 Moves (Free)</span>
            </button>

            {/* Coins Continue */}
            <button
              type="button"
              disabled={!canAffordCoins}
              onClick={() => {
                if (canAffordCoins) {
                  sounds.playCoin();
                  onContinueWithCoins();
                } else {
                  sounds.playError();
                }
              }}
              className={`w-full py-3 px-4 rounded-2xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                canAffordCoins
                  ? 'bg-slate-800 hover:bg-slate-700 border-amber-500/40 text-amber-400'
                  : 'bg-slate-950/60 border-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Spend 50 Coins → +5 Moves</span>
              <span>🪙</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center my-3">
            <div className="flex-1 h-[1px] bg-slate-800" />
            <span className="px-3 text-[10px] uppercase font-bold text-slate-500">Or</span>
            <div className="flex-1 h-[1px] bg-slate-800" />
          </div>

          {/* Restart Button & Lives check */}
          {lives > 0 ? (
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onRestartLevel();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restart Level (-1 Life)</span>
              <span className="text-rose-400 font-normal">({lives} ❤️ left)</span>
            </button>
          ) : (
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-center space-x-1.5">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                <span>Out of Lives!</span>
              </div>
              <button
                type="button"
                onClick={onRefillLivesWithAd}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer shadow"
              >
                <Video className="w-4 h-4" />
                <span>Watch Ad → Refill Full Lives ❤️</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
