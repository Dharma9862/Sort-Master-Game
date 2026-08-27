import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  BarChart3,
  Trophy,
  Flame,
  Clock,
  Zap,
  Target,
  Sparkles,
  Award,
  Coins,
  Building2,
  Share2,
  CheckCircle2,
  Copy,
  Download,
  Upload,
} from 'lucide-react';
import { PlayerProfile } from '../types/game';
import { sounds } from '../utils/audio';
import { exportSaveData, importSaveData } from '../utils/storage';

interface StatsModalProps {
  isOpen: boolean;
  profile: PlayerProfile;
  onImportProfile: (imported: PlayerProfile) => void;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  profile,
  onImportProfile,
  onClose,
}) => {
  const [copiedSave, setCopiedSave] = useState<boolean>(false);
  const [importJson, setImportJson] = useState<string>('');
  const [showImportBox, setShowImportBox] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalLevelsCompleted = profile.stats.levelsCompleted || profile.completedLevels.length;
  const perfectClears = profile.stats.perfectLevels || 0;
  const winRate = totalLevelsCompleted > 0
    ? Math.min(100, Math.round((perfectClears / Math.max(1, totalLevelsCompleted)) * 100))
    : 100;
  const avgMoves = totalLevelsCompleted > 0
    ? (profile.stats.totalMoves / totalLevelsCompleted).toFixed(1)
    : '0.0';

  // Format playtime
  const playtimeSecs = profile.totalPlaytimeSeconds || Math.max(60, totalLevelsCompleted * 45);
  const hours = Math.floor(playtimeSecs / 3600);
  const minutes = Math.floor((playtimeSecs % 3600) / 60);

  const handleCopySave = () => {
    const data = exportSaveData(profile);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(data);
      setCopiedSave(true);
      sounds.playCoin();
      setTimeout(() => setCopiedSave(false), 2500);
    }
  };

  const handleApplyImport = () => {
    setImportError(null);
    if (!importJson.trim()) {
      setImportError('Please paste valid JSON save data');
      return;
    }
    const imported = importSaveData(importJson);
    if (imported) {
      sounds.playWin();
      onImportProfile(imported);
      setShowImportBox(false);
      setImportJson('');
    } else {
      sounds.playError();
      setImportError('Invalid save format. Check backup string.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.93 }}
          className="relative w-full max-w-md max-h-[88vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl text-white flex flex-col p-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Player Analytics & Stats</h3>
                <p className="text-xs text-slate-400">Mastery performance metrics & sync</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2.5 my-4">
            {/* Levels Cleared */}
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Completed</span>
                <Trophy className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-2 text-xl font-black font-mono text-amber-300">
                {totalLevelsCompleted} <span className="text-xs text-slate-500 font-normal">/ 200</span>
              </div>
            </div>

            {/* 3-Star Perfect Rate */}
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>3-Star Perfect</span>
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="mt-2 text-xl font-black font-mono text-yellow-300">
                {perfectClears} <span className="text-xs text-slate-500 font-normal">({winRate}%)</span>
              </div>
            </div>

            {/* Total Moves Made */}
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Total Moves</span>
                <Zap className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="mt-2 text-xl font-black font-mono text-cyan-300">
                {(profile.stats.totalMoves || 0).toLocaleString()}
              </div>
            </div>

            {/* Avg Moves / Level */}
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Avg Moves/Lvl</span>
                <Target className="w-4 h-4 text-purple-400" />
              </div>
              <div className="mt-2 text-xl font-black font-mono text-purple-300">
                {avgMoves}
              </div>
            </div>

            {/* Daily Streak */}
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Login Streak</span>
                <Flame className="w-4 h-4 text-orange-400" />
              </div>
              <div className="mt-2 text-xl font-black font-mono text-orange-400">
                Day {profile.dailyStreak || 1}
              </div>
            </div>

            {/* Total Playtime */}
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Est. Playtime</span>
                <Clock className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-2 text-lg font-black font-mono text-emerald-300">
                {hours > 0 ? `${hours}h ` : ''}{minutes}m
              </div>
            </div>
          </div>

          {/* Cash Points & Financial Milestones */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/30 space-y-2 mb-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center space-x-1.5">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Total Points Accumulated</span>
              </span>
              <span className="font-mono font-black text-amber-300">
                ⭐ {(profile.stats.totalPointsEarned || profile.rewardPoints || 100000).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
              <span className="text-slate-400">Total Bank Withdrawals</span>
              <span className="font-mono font-black text-emerald-400">
                ₹{(profile.stats.totalWithdrawnAmount || 10.0).toFixed(2)} INR
              </span>
            </div>
          </div>

          {/* Cloud & Local Backup / Restore Section */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">Save Data Backup & Sync</h4>
                <p className="text-[11px] text-slate-400">Export or restore your progress JSON across devices</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopySave}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center space-x-1.5 border border-slate-700 cursor-pointer"
              >
                {copiedSave ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
                <span>{copiedSave ? 'Copied JSON!' : 'Export Backup'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowImportBox((prev) => !prev)}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center space-x-1.5 border border-slate-700 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-purple-400" />
                <span>Restore Backup</span>
              </button>
            </div>

            {/* Import JSON input box */}
            {showImportBox && (
              <div className="pt-2 space-y-2">
                <textarea
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  placeholder="Paste your JSON backup data here..."
                  className="w-full h-20 p-2 text-xs font-mono bg-slate-900 border border-slate-700 rounded-xl text-slate-300 focus:outline-none focus:border-indigo-500"
                />
                {importError && (
                  <p className="text-[11px] text-rose-400 font-semibold">{importError}</p>
                )}
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowImportBox(false)}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyImport}
                    className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black"
                  >
                    Apply Save Data
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
