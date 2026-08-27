import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Wifi,
  WifiOff,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Zap,
  Building2,
  Bot,
  Video,
  Share2,
  TrendingUp,
  RotateCcw,
  Palette,
  Trophy,
  Sliders,
  ShieldCheck,
  Lightbulb,
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface NetworkHubModalProps {
  isOpen: boolean;
  isOnline: boolean;
  isSimulatedOffline: boolean;
  isDeviceOnline: boolean;
  onToggleSimulatedOffline: () => void;
  onClose: () => void;
}

export const NetworkHubModal: React.FC<NetworkHubModalProps> = ({
  isOpen,
  isOnline,
  isSimulatedOffline,
  isDeviceOnline,
  onToggleSimulatedOffline,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl text-white flex flex-col p-4 sm:p-5 no-scrollbar"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div
                className={`p-2 rounded-2xl border ${
                  isOnline
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}
              >
                {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center space-x-2">
                  <span>Network & Offline Mode</span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                      isOnline
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {isOnline ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  {isOnline
                    ? 'All online & offline features active'
                    : 'Playing in offline-ready local mode'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Status Banner */}
          <div
            className={`mt-4 p-3.5 rounded-2xl border text-xs flex items-start space-x-3 ${
              isOnline
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isOnline ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
            </div>
            <div>
              <p className="font-bold text-white mb-0.5">
                {isOnline
                  ? 'Connected to Internet'
                  : isSimulatedOffline
                  ? 'Simulated Offline Mode Active'
                  : 'No Internet Connection Detected'}
              </p>
              <p className="text-[11px] opacity-90 leading-relaxed">
                {isOnline
                  ? 'All puzzle games, Point Converters, Point Increasers, Multipliers, Cloud AI Solvers, and Bank Transfers are fully operational.'
                  : 'You can play all 200 puzzle levels, unlock themes, track achievements, and enjoy sound effects offline. Online features like Point Converter, Point Increasers, and Ads are paused until reconnected.'}
              </p>
            </div>
          </div>

          {/* Offline vs Online Feature Matrix */}
          <div className="mt-4 space-y-3">
            {/* Section 1: Offline Works 100% */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center space-x-2 text-xs font-black text-emerald-400 mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>100% PLAYABLE OFFLINE</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div className="flex items-center space-x-2 p-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>200 Progressive Levels</span>
                </div>
                <div className="flex items-center space-x-2 p-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <Lightbulb className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                  <span>Local BFS Move Hint</span>
                </div>
                <div className="flex items-center space-x-2 p-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <RotateCcw className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Undo & Restart System</span>
                </div>
                <div className="flex items-center space-x-2 p-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <Palette className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  <span>10 Themes & Tube Skins</span>
                </div>
                <div className="flex items-center space-x-2 p-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Badges & Achievements</span>
                </div>
                <div className="flex items-center space-x-2 p-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Custom Level Studio</span>
                </div>
              </div>
            </div>

            {/* Section 2: Online-Only Features */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center space-x-2 text-xs font-black text-amber-400 mb-2">
                <Wifi className="w-4 h-4" />
                <span>ONLINE-ONLY FEATURES (Paused in Offline Mode)</span>
              </div>
              <div className="space-y-1.5 text-[11px] text-slate-300">
                <div className="flex items-start space-x-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300">Point Converter:</span>
                    <span className="text-slate-400 ml-1">
                      Converts points to live bank cash balance with real-time rate verification.
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-300">Point Increaser / Scratch Cards:</span>
                    <span className="text-slate-400 ml-1">
                      Multiplies level rewards & scratches bonus points via server verification.
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <Building2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-teal-300">Bank Payouts & Cashouts:</span>
                    <span className="text-slate-400 ml-1">
                      Requires online gateway communication for UPI & Bank transfers.
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <Video className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-purple-300">Rewarded 2× Video Boosters:</span>
                    <span className="text-slate-400 ml-1">
                      Streams sponsored ads to double coin and point rewards.
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <Bot className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-indigo-300">AI Cloud Solver (Gemini):</span>
                    <span className="text-slate-400 ml-1">
                      Cloud multi-step AI puzzle assistant (Local Hint 💡 is always offline-ready!).
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <Share2 className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-pink-300">Referral Verification:</span>
                    <span className="text-slate-400 ml-1">
                      Redeeming friend codes and syncing referral milestone rewards.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Offline Mode Simulator Toggle (For testing & offline preference) */}
          <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white flex items-center space-x-1.5">
                <span>Simulate Offline Mode</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded-md">
                  Testing
                </span>
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Toggle to test offline behavior without disconnecting your Wi-Fi
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onToggleSimulatedOffline();
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isSimulatedOffline ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isSimulatedOffline ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-full mt-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors cursor-pointer"
          >
            Back to Game
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
