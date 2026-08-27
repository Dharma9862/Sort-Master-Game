import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Volume2,
  VolumeX,
  Music,
  Smartphone,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Layers,
  Award,
  ExternalLink,
  Code2,
  Building2,
  ArrowRight,
  Wallet,
  ShieldCheck,
  Palette,
  Check,
  Gift,
  Flame,
  Calendar,
  Target,
} from 'lucide-react';
import { sounds } from '../utils/audio';
import { GAME_THEMES } from '../data/themes';
import { ItemThemeId } from '../types/game';

interface SettingsModalProps {
  isOpen: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
  hapticsEnabled: boolean;
  rewardPoints?: number;
  bankBalance?: number;
  preferredCurrency?: string;
  unlockedLevel?: number;
  currentTheme?: ItemThemeId;
  unlockedThemes?: ItemThemeId[];
  dailyStreak?: number;
  isDailyClaimable?: boolean;
  unclaimedDailyTasksCount?: number;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onToggleHaptics: () => void;
  onResetProgress: () => void;
  onOpenWithdraw?: () => void;
  onOpenWallet?: () => void;
  onOpenDaily?: () => void;
  onOpenDailyTasks?: () => void;
  onOpenThemes?: () => void;
  onSelectTheme?: (themeId: ItemThemeId) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  soundEnabled,
  musicEnabled,
  hapticsEnabled,
  rewardPoints = 100000,
  bankBalance = 0.0,
  preferredCurrency = 'INR',
  unlockedLevel = 1,
  currentTheme = 'colors',
  unlockedThemes = ['colors'],
  dailyStreak = 1,
  isDailyClaimable = false,
  unclaimedDailyTasksCount = 0,
  onToggleSound,
  onToggleMusic,
  onToggleHaptics,
  onResetProgress,
  onOpenWithdraw,
  onOpenWallet,
  onOpenDaily,
  onOpenDailyTasks,
  onOpenThemes,
  onSelectTheme,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'guide' | 'apk'>('settings');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const currentThemeConfig = GAME_THEMES[currentTheme] || GAME_THEMES.colors;

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
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-white tracking-wide">Sort Master Menu</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center p-1 bg-slate-950/80 rounded-xl border border-slate-800 my-4">
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'settings'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Settings & Hub
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('guide')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'guide'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              How to Play
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('apk')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'apk'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                  : 'text-amber-400/80 hover:text-amber-300'
              }`}
            >
              📱 APK / Store
            </button>
          </div>

          {/* Tab 1: Audio, Themes & Controls */}
          {activeTab === 'settings' && (
            <div className="space-y-3.5 my-2">
              {/* Bank Balance & Cash Points Withdrawal Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/40 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">Bank Balance & Withdraw</h4>
                      <p className="text-[11px] text-emerald-300/90 font-medium">
                        1 Lakh (100,000 ⭐) = ₹10.00 INR
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider animate-pulse">
                    UPI / IMPS
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Reward Points</div>
                    <div className="text-base font-black text-amber-300 font-mono flex items-center space-x-1">
                      <span>⭐</span>
                      <span>{rewardPoints.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Bank Balance</div>
                    <div className="text-base font-black text-emerald-400 font-mono">
                      ₹{bankBalance.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Level 50/100 Converter & +Tube Booster Unlock Status */}
                <div className="space-y-1.5">
                  <div className={`p-2 rounded-xl border text-xs flex items-center justify-between ${
                    unlockedLevel >= 50
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                      : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                  }`}>
                    <span className="font-semibold text-[11px]">
                      {unlockedLevel >= 50
                        ? `🔓 Points Converter Active (Lvl ${unlockedLevel})`
                        : `🔒 Converter Unlocks at Level 50 (Lvl ${unlockedLevel}/50)`}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-slate-950/80">
                      {unlockedLevel >= 100
                        ? '2+ Lakhs Tier'
                        : unlockedLevel >= 50
                        ? '1 Lakh Tier'
                        : `${50 - unlockedLevel} lvls left`}
                    </span>
                  </div>

                  <div className={`p-2 rounded-xl border text-xs flex items-center justify-between ${
                    unlockedLevel >= 100
                      ? 'bg-purple-950/40 border-purple-500/30 text-purple-300'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400'
                  }`}>
                    <span className="font-semibold text-[11px] flex items-center space-x-1">
                      <span>{unlockedLevel >= 100 ? '🧪 +Tube Booster Badge Active' : '🔒 +Tube Booster Badge (Level 100)'}</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-slate-950/80 text-amber-300">
                      {unlockedLevel >= 100 ? 'UNLOCKED' : `Lvl ${unlockedLevel}/100`}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {onOpenWallet && (
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        onClose();
                        onOpenWallet();
                      }}
                      className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs border border-slate-600 shadow-md flex items-center justify-center space-x-1.5 transition-all cursor-pointer transform active:scale-98"
                    >
                      <Wallet className="w-4 h-4 text-emerald-400" />
                      <span>Virtual Wallet</span>
                    </button>
                  )}

                  {onOpenWithdraw && (
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        onClose();
                        onOpenWithdraw();
                      }}
                      className={`py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer transform active:scale-98 ${
                        !onOpenWallet ? 'col-span-2' : ''
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-slate-950" />
                      <span>Bank Payout</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Daily Task Targets Card */}
              {onOpenDailyTasks && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-sky-950/70 border border-sky-500/30 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white flex items-center space-x-1.5">
                          <span>Daily Task Targets</span>
                          {unclaimedDailyTasksCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-950 text-[9px] font-black animate-bounce">
                              {unclaimedDailyTasksCount} REWARDS
                            </span>
                          )}
                        </h4>
                        <p className="text-[11px] text-sky-300 font-medium">
                          Clear daily missions to earn Coins & Cash Points
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-black uppercase">
                      DAILY MISSIONS
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">
                      🎁 3 Missions = 50,000 ⭐ Chest (₹5.00)
                    </span>
                    <span className="text-amber-400 font-bold font-mono">+1 🧪 Tube</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      onClose();
                      onOpenDailyTasks();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer transform active:scale-98"
                  >
                    <Target className="w-4 h-4 text-slate-950" />
                    <span>Open Daily Task Targets</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Daily Login Rewards Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/70 via-slate-900 to-yellow-950/70 border border-amber-500/30 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <Gift className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center space-x-1.5">
                        <span>Daily Login Rewards</span>
                        {isDailyClaimable && (
                          <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black animate-pulse">
                            READY
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-amber-300 font-medium flex items-center space-x-1">
                        <Flame className="w-3.5 h-3.5 text-orange-400" />
                        <span>Current Streak: <strong>Day {dailyStreak}</strong></span>
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase">
                    7-DAY CALENDAR
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">
                    {isDailyClaimable ? '✨ Today’s reward is ready to collect!' : '✅ Today’s login reward already claimed!'}
                  </span>
                  <span className="text-amber-400 font-bold">Up to 1 Lakh ⭐</span>
                </div>

                {onOpenDaily && (
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      onClose();
                      onOpenDaily();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer transform active:scale-98"
                  >
                    <Calendar className="w-4 h-4 text-slate-950" />
                    <span>Open Daily Rewards Calendar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Theme Wardrobe & Customization Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/70 via-slate-900 to-indigo-950/70 border border-purple-500/30 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      <Palette className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center space-x-1.5">
                        <span>Themes & Skins</span>
                        <span className="text-base">{currentThemeConfig.icon}</span>
                      </h4>
                      <p className="text-[11px] text-purple-300 font-medium">
                        Active: <strong className="text-white">{currentThemeConfig.name}</strong>
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-black uppercase">
                    10 THEMES
                  </span>
                </div>

                {/* Quick Theme Selector (Unlocked Themes) */}
                <div className="space-y-1.5">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    Quick Theme Switcher
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {Object.values(GAME_THEMES).slice(0, 6).map((theme) => {
                      const isUnlocked = unlockedThemes.includes(theme.id as ItemThemeId);
                      const isSelected = currentTheme === theme.id;

                      return (
                        <button
                          key={theme.id}
                          type="button"
                          disabled={!isUnlocked}
                          onClick={() => {
                            if (isUnlocked && onSelectTheme) {
                              sounds.playClick();
                              onSelectTheme(theme.id as ItemThemeId);
                            }
                          }}
                          className={`p-2 rounded-xl border text-center flex flex-col items-center justify-center transition-all relative ${
                            isSelected
                              ? 'bg-purple-500/30 border-purple-400 text-white ring-1 ring-purple-400 shadow-md'
                              : isUnlocked
                              ? 'bg-slate-950/60 border-slate-800 hover:border-purple-500/40 text-slate-300 cursor-pointer'
                              : 'bg-slate-950/30 border-slate-800/40 text-slate-600 cursor-not-allowed opacity-50'
                          }`}
                        >
                          <span className="text-base">{theme.icon}</span>
                          <span className="text-[10px] font-bold truncate max-w-full mt-0.5">
                            {theme.name.split(' ')[0]}
                          </span>
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-purple-500 flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {onOpenThemes && (
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      onClose();
                      onOpenThemes();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-xs shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer transform active:scale-98"
                  >
                    <Palette className="w-4 h-4 text-white" />
                    <span>Open Theme Wardrobe & Bottle Shop</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {/* Sound SFX */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-slate-700 text-slate-300">
                    {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Sound Effects (SFX)</h4>
                    <p className="text-xs text-slate-400">Pours, bubble pops, and win fanfares</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onToggleSound();
                  }}
                  className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                    soundEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ease-in-out shadow ${
                      soundEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Music */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-slate-700 text-slate-300">
                    <Music className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Ambient Zen Music</h4>
                    <p className="text-xs text-slate-400">Calming generative lofi chords</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onToggleMusic();
                  }}
                  className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                    musicEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ease-in-out shadow ${
                      musicEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Haptics */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-slate-700 text-slate-300">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Haptic Vibration</h4>
                    <p className="text-xs text-slate-400">Tactile taps on mobile devices</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onToggleHaptics();
                  }}
                  className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                    hapticsEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ease-in-out shadow ${
                      hapticsEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Reset Data */}
              <div className="pt-2">
                {!showResetConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset Game Progress</span>
                  </button>
                ) : (
                  <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl space-y-2 text-center">
                    <p className="text-xs text-rose-200 font-semibold">
                      Are you sure? All stars, coins, and levels will be reset!
                    </p>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowResetConfirm(false)}
                        className="flex-1 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onResetProgress();
                          setShowResetConfirm(false);
                        }}
                        className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                      >
                        Confirm Reset
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: How to Play */}
          {activeTab === 'guide' && (
            <div className="space-y-3 my-2 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                <h4 className="font-bold text-white mb-1 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>1. Goal of Sort Master</span>
                </h4>
                <p>
                  Organize all colors or themed objects so that each container is completely filled with
                  identical items or left completely empty.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                <h4 className="font-bold text-white mb-1 flex items-center space-x-1.5">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>2. Movement Rules</span>
                </h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Tap a container to lift its top item.</li>
                  <li>Tap another container to pour/drop the item into it.</li>
                  <li>You can only place an item on an <strong>empty container</strong> or onto a <strong>matching color/item</strong>!</li>
                  <li>Containers have a fixed capacity of 4 items.</li>
                </ul>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                <h4 className="font-bold text-white mb-1 flex items-center space-x-1.5">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>3. Power-Ups & Obstacles</span>
                </h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>Undo ↩️:</strong> Reverses your last move.</li>
                  <li><strong>Hint 💡:</strong> Calculates the next optimal move using AI solver.</li>
                  <li><strong>Shuffle 🔀:</strong> Reorders items to break stalemates.</li>
                  <li><strong>+1 Bottle 🧪:</strong> Adds an emergency empty tube!</li>
                  <li><strong>Locked / Ice:</strong> Make moves or match adjacent colors to unfreeze.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab 3: APK & Google Play Publishing Guide */}
          {activeTab === 'apk' && (
            <div className="space-y-3 my-2 text-xs text-slate-300">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/60 to-slate-900 border border-amber-500/40">
                <div className="flex items-center space-x-2 text-amber-400 font-bold mb-1">
                  <Smartphone className="w-4 h-4" />
                  <span className="text-sm">Ready for Android APK & Play Store</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  This game is built with 100% responsive portrait mobile viewport, touch events,
                  offline Web Audio API synth, and zero heavy dependencies.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                <h4 className="font-bold text-white mb-1 flex items-center space-x-1.5">
                  <Code2 className="w-4 h-4 text-cyan-400" />
                  <span>1. Export with Capacitor (Quickest)</span>
                </h4>
                <div className="font-mono bg-slate-950 p-2 rounded-lg text-[10px] text-emerald-300 space-y-1 my-1 overflow-x-auto">
                  <div># 1. Build web assets</div>
                  <div>npm run build</div>
                  <div className="text-slate-500"># 2. Add Capacitor Android</div>
                  <div>npm i @capacitor/core @capacitor/android @capacitor/cli</div>
                  <div>npx cap init "Sort Master" "com.sortmaster.puzzle"</div>
                  <div>npx cap add android</div>
                  <div>npx cap open android</div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Android Studio will open immediately! Click <strong>Build &gt; Generate Signed Bundle / APK</strong>.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                <h4 className="font-bold text-white mb-1 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span>2. Google Play AdMob Integration</span>
                </h4>
                <p className="text-[11px] text-slate-300">
                  In Android Studio or via `@capacitor-community/admob`, replace the rewarded ad trigger
                  with your official AdMob App ID and Ad Unit IDs (`ca-app-pub-XXXX`).
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
