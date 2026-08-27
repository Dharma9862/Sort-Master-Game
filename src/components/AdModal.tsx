import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Award, Sparkles, Volume2, VolumeX, ShieldCheck } from 'lucide-react';
import { sounds } from '../utils/audio';

export type AdType = 'rewarded' | 'interstitial';

export interface AdModalProps {
  isOpen: boolean;
  adType: AdType;
  rewardTitle: string;
  rewardDescription: string;
  onAdCompleted: () => void;
  onClose: () => void;
}

const AD_SPONSORS = [
  {
    name: 'Mythic Puzzle Quest 3D',
    tagline: 'Match gems, tame dragons, and conquer kingdoms!',
    cta: 'Install Now',
    icon: '🐉',
    color: 'from-purple-600 to-indigo-900',
    stars: 4.8,
  },
  {
    name: 'Royal Blast Match',
    tagline: 'Help King Robert restore his castle gardens!',
    cta: 'Play Free',
    icon: '👑',
    color: 'from-amber-500 to-yellow-800',
    stars: 4.9,
  },
  {
    name: 'Cyber Blade Runner 2099',
    tagline: 'High-speed cyberpunk action RPG adventure.',
    cta: 'Download',
    icon: '⚡',
    color: 'from-cyan-500 to-blue-900',
    stars: 4.7,
  },
];

export const AdModal: React.FC<AdModalProps> = ({
  isOpen,
  adType,
  rewardTitle,
  rewardDescription,
  onAdCompleted,
  onClose,
}) => {
  const [countdown, setCountdown] = useState<number>(adType === 'rewarded' ? 5 : 3);
  const [canClose, setCanClose] = useState<boolean>(false);
  const [adMuted, setAdMuted] = useState<boolean>(false);
  const [sponsor] = useState(() => AD_SPONSORS[Math.floor(Math.random() * AD_SPONSORS.length)]);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(adType === 'rewarded' ? 5 : 3);
      setCanClose(false);
      setProgress(0);
      return;
    }

    const duration = adType === 'rewarded' ? 5 : 3;
    const interval = 100;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      const pct = Math.min(100, (elapsed / (duration * 1000)) * 100);
      setProgress(pct);

      const remain = Math.max(0, Math.ceil(duration - elapsed / 1000));
      setCountdown(remain);

      if (elapsed >= duration * 1000) {
        clearInterval(timer);
        setCanClose(true);
        sounds.playCoin();
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isOpen, adType]);

  if (!isOpen) return null;

  const handleClaim = () => {
    sounds.playPowerup();
    onAdCompleted();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-white flex flex-col"
        >
          {/* Ad Top Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded">
                AD {adType === 'rewarded' ? 'REWARDED' : 'SPONSORED'}
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setAdMuted(!adMuted)}
                className="text-slate-400 hover:text-white p-1"
                aria-label="Toggle Ad Mute"
              >
                {adMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {canClose ? (
                <button
                  type="button"
                  onClick={adType === 'rewarded' ? handleClaim : onClose}
                  className="p-1 text-slate-300 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700"
                  aria-label="Close Ad"
                >
                  <X className="w-5 h-5" />
                </button>
              ) : (
                <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-mono bg-slate-900 px-2 py-1 rounded-full border border-slate-700">
                  <Play className="w-3 h-3 fill-amber-400 animate-pulse" />
                  <span>{countdown}s</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-1">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Ad Simulated Video Content */}
          <div className={`relative h-64 p-6 bg-gradient-to-br ${sponsor.color} flex flex-col items-center justify-center text-center overflow-hidden`}>
            {/* Animated background glow */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-black" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-4xl shadow-xl mb-3 animate-bounce">
                {sponsor.icon}
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white mb-1 drop-shadow">
                {sponsor.name}
              </h3>
              <p className="text-xs text-white/80 max-w-[220px] mb-2 drop-shadow-sm">
                {sponsor.tagline}
              </p>
              <div className="flex items-center space-x-1 text-xs text-amber-300 mb-3 font-semibold">
                <span>★ {sponsor.stars}</span>
                <span className="text-white/60">• 10M+ Downloads</span>
              </div>

              <div className="px-5 py-2 rounded-full bg-white text-slate-950 font-bold text-xs shadow-lg hover:scale-105 transition-transform flex items-center space-x-1.5 cursor-pointer">
                <span>{sponsor.cta}</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </div>
            </div>
          </div>

          {/* Bottom Reward Bar */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white truncate">{rewardTitle}</h4>
                <p className="text-xs text-slate-400 truncate">{rewardDescription}</p>
              </div>
            </div>

            {canClose ? (
              <button
                type="button"
                onClick={handleClaim}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 transition-all transform active:scale-98 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Claim Reward Now</span>
              </button>
            ) : (
              <div className="w-full py-2.5 text-center text-xs text-slate-400 bg-slate-900 rounded-xl border border-slate-800">
                Reward unlocks when video finishes ({countdown}s)
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
