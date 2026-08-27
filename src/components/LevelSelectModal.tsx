import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Lock, Play, ChevronRight, Trophy, Sparkles } from 'lucide-react';
import { ALL_LEVEL_METAS, getTierInfo } from '../utils/levelGenerator';
import { sounds } from '../utils/audio';

interface LevelSelectModalProps {
  isOpen: boolean;
  unlockedLevel: number;
  currentPlayingLevel: number;
  levelStars: Record<number, number>;
  onSelectLevel: (levelNum: number) => void;
  onClose: () => void;
}

const TIER_CHAPTERS = [
  { tier: 1, name: 'Beginner', range: '1-25', start: 1, end: 25, color: 'from-emerald-600 to-teal-800' },
  { tier: 2, name: 'Easy', range: '26-50', start: 26, end: 50, color: 'from-sky-600 to-blue-800' },
  { tier: 3, name: 'Normal', range: '51-75', start: 51, end: 75, color: 'from-amber-600 to-orange-800' },
  { tier: 4, name: 'Advanced', range: '76-100', start: 76, end: 100, color: 'from-orange-600 to-red-800' },
  { tier: 5, name: 'Hard', range: '101-125', start: 101, end: 125, color: 'from-rose-600 to-pink-800' },
  { tier: 6, name: 'Very Hard', range: '126-150', start: 126, end: 150, color: 'from-purple-600 to-indigo-800' },
  { tier: 7, name: 'Expert', range: '151-175', start: 151, end: 175, color: 'from-indigo-600 to-violet-800' },
  { tier: 8, name: 'Master', range: '176-199', start: 176, end: 199, color: 'from-fuchsia-600 to-pink-900' },
  { tier: 9, name: 'Ultimate 200', range: '200', start: 200, end: 200, color: 'from-amber-400 to-yellow-600' },
];

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  isOpen,
  unlockedLevel,
  currentPlayingLevel,
  levelStars,
  onSelectLevel,
  onClose,
}) => {
  // Determine default selected chapter from current level
  const initialChapter = TIER_CHAPTERS.find(
    (c) => currentPlayingLevel >= c.start && currentPlayingLevel <= c.end
  )?.tier || 1;

  const [selectedTier, setSelectedTier] = useState<number>(initialChapter);

  if (!isOpen) return null;

  const currentChapter = TIER_CHAPTERS.find((c) => c.tier === selectedTier) || TIER_CHAPTERS[0];
  const levelsInChapter = ALL_LEVEL_METAS.slice(currentChapter.start - 1, currentChapter.end);

  // Total stars in game
  const totalStars = Object.values(levelStars).reduce<number>((acc, s) => acc + Number(s || 0), 0);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.93 }}
          className="relative w-full max-w-lg max-h-[92vh] overflow-hidden rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl text-white flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 pb-3 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">200 Level Roadmap</h3>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-amber-400 font-bold flex items-center space-x-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{totalStars} / 600 Stars</span>
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300 font-medium">Level {unlockedLevel} Unlocked</span>
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

          {/* Chapter Selector Tabs (Scrollable Horizontal) */}
          <div className="flex items-center space-x-2 px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 overflow-x-auto no-scrollbar">
            {TIER_CHAPTERS.map((chap) => {
              const isSelected = chap.tier === selectedTier;
              const isChapUnlocked = unlockedLevel >= chap.start;

              return (
                <button
                  key={chap.tier}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setSelectedTier(chap.tier);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer shrink-0 ${
                    isSelected
                      ? `bg-gradient-to-r ${chap.color} text-white shadow-lg ring-2 ring-white/20`
                      : isChapUnlocked
                      ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                      : 'bg-slate-900 text-slate-500 border border-slate-800 opacity-60'
                  }`}
                >
                  {!isChapUnlocked && <Lock className="w-3 h-3 text-slate-500" />}
                  <span>{chap.name}</span>
                  <span className="text-[10px] opacity-75 font-normal">({chap.range})</span>
                </button>
              );
            })}
          </div>

          {/* Levels Grid (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Chapter Banner */}
            <div className={`p-4 rounded-2xl bg-gradient-to-r ${currentChapter.color} shadow-lg relative overflow-hidden flex items-center justify-between`}>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-white/80">
                  Chapter {currentChapter.tier} of 9
                </span>
                <h4 className="text-xl font-extrabold text-white">{currentChapter.name}</h4>
                <p className="text-xs text-white/90">Levels {currentChapter.range}</p>
              </div>

              <div className="text-3xl opacity-80">
                {currentChapter.tier === 9 ? '👑' : currentChapter.tier >= 7 ? '⚡' : '🧪'}
              </div>
            </div>

            {/* Grid of level badges */}
            <div className="grid grid-cols-5 gap-2.5 sm:gap-3">
              {levelsInChapter.map((lvl) => {
                const isUnlocked = lvl.levelNumber <= unlockedLevel;
                const isCurrent = lvl.levelNumber === currentPlayingLevel;
                const stars = levelStars[lvl.levelNumber] || 0;

                return (
                  <button
                    key={lvl.levelNumber}
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => {
                      if (isUnlocked) {
                        sounds.playClick();
                        onSelectLevel(lvl.levelNumber);
                      }
                    }}
                    className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center p-1 transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-gradient-to-b from-amber-400 to-yellow-600 text-slate-950 font-black shadow-xl shadow-amber-500/30 ring-4 ring-amber-300 animate-pulse'
                        : isUnlocked
                        ? stars > 0
                          ? 'bg-slate-800 hover:bg-slate-700 border-2 border-amber-500/50 text-white shadow'
                          : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white'
                        : 'bg-slate-950/80 border border-slate-800/80 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    {isUnlocked ? (
                      <>
                        {lvl.levelNumber === 100 && (
                          <span className="absolute -top-2 -right-1 px-1 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-black text-[7px] shadow animate-pulse z-10">
                            +TUBE
                          </span>
                        )}
                        {lvl.levelNumber === 50 && (
                          <span className="absolute -top-2 -right-1 px-1 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[7px] shadow z-10">
                            CONVERT
                          </span>
                        )}
                        <span className={`text-sm sm:text-base font-extrabold ${isCurrent ? 'text-slate-950' : 'text-white'}`}>
                          {lvl.levelNumber}
                        </span>

                        {/* Stars */}
                        <div className="flex items-center space-x-0.5 mt-0.5">
                          {[1, 2, 3].map((s) => (
                            <Star
                              key={s}
                              className={`w-2.5 h-2.5 ${
                                s <= stars
                                  ? isCurrent
                                    ? 'fill-slate-950 text-slate-950'
                                    : 'fill-amber-400 text-amber-400'
                                  : isCurrent
                                  ? 'text-slate-800'
                                  : 'text-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    ) : (
                      <Lock className="w-5 h-5 text-slate-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Jump to current active level */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Current progress: <strong>Level {unlockedLevel}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onSelectLevel(unlockedLevel);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow flex items-center space-x-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Resume Level {unlockedLevel}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
