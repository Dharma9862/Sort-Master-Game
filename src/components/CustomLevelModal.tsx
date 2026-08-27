import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sliders,
  Play,
  Shuffle,
  Sparkles,
  Layers,
  FlaskConical,
  Flame,
} from 'lucide-react';
import { ContainerData, LevelConfig, ItemThemeId } from '../types/game';
import { GAME_THEMES } from '../data/themes';
import { sounds } from '../utils/audio';

interface CustomLevelModalProps {
  isOpen: boolean;
  currentTheme: ItemThemeId;
  onPlayCustomLevel: (config: LevelConfig) => void;
  onClose: () => void;
}

export const CustomLevelModal: React.FC<CustomLevelModalProps> = ({
  isOpen,
  currentTheme,
  onPlayCustomLevel,
  onClose,
}) => {
  const [colorCount, setColorCount] = useState<number>(4);
  const [emptyTubesCount, setEmptyTubesCount] = useState<number>(2);
  const [bottleCapacity, setBottleCapacity] = useState<number>(4);
  const [enableMysteryHidden, setEnableMysteryHidden] = useState<boolean>(false);
  const [enableIce, setEnableIce] = useState<boolean>(false);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);

  if (!isOpen) return null;

  const themeConfig = GAME_THEMES[currentTheme] || GAME_THEMES.colors;
  const availableColors = themeConfig.itemPalette.slice(0, colorCount).map((p) => p.id);

  // Generate a custom randomized level state
  const handleGenerateAndPlay = () => {
    sounds.playPowerup();

    // Create uniform pools
    const itemPool: string[] = [];
    availableColors.forEach((colorId) => {
      for (let i = 0; i < bottleCapacity; i++) {
        itemPool.push(colorId);
      }
    });

    // Fisher-Yates Shuffle
    for (let i = itemPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [itemPool[i], itemPool[j]] = [itemPool[j], itemPool[i]];
    }

    // Distribute into tubes
    const containers: ContainerData[] = [];
    for (let i = 0; i < colorCount; i++) {
      const tubeItems = itemPool.slice(i * bottleCapacity, (i + 1) * bottleCapacity);
      containers.push({
        id: `custom_c_${i + 1}`,
        items: tubeItems,
        capacity: bottleCapacity,
        hasIce: enableIce && i === 0,
      });
    }

    // Add empty bottles
    for (let j = 0; j < emptyTubesCount; j++) {
      containers.push({
        id: `custom_empty_${j + 1}`,
        items: [],
        capacity: bottleCapacity,
      });
    }

    const customConfig: LevelConfig = {
      levelNumber: 999,
      stageTier: 'Custom Sandbox',
      tierNumber: 99,
      containers,
      capacity: bottleCapacity,
      itemType: themeConfig.name,
      coinsReward: 150,
      hasHiddenItems: enableMysteryHidden,
      hasIce: enableIce,
      timeLimitSeconds: timeLimit ?? undefined,
      tutorialTip: '🧪 Custom Sandbox Puzzle — Good luck sorting!',
    };

    onPlayCustomLevel(customConfig);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.93 }}
          className="relative w-full max-w-md max-h-[88vh] overflow-y-auto rounded-3xl bg-slate-900 border border-purple-500/40 shadow-2xl text-white flex flex-col p-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/40">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Custom Puzzle Studio</h3>
                <p className="text-xs text-slate-400">Generate custom sort scenarios with custom rules</p>
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

          <div className="space-y-4 my-3">
            {/* Color Count Slider */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">Number of Colors:</span>
                <span className="font-mono font-black text-purple-400 text-sm bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/30">
                  {colorCount} Colors ({colorCount} Tubes)
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="8"
                step="1"
                value={colorCount}
                onChange={(e) => setColorCount(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>3 (Beginner)</span>
                <span>5 (Normal)</span>
                <span>8 (Expert)</span>
              </div>
            </div>

            {/* Empty Tubes Count */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">Empty Auxiliary Tubes:</span>
                <span className="font-mono font-black text-cyan-400 text-sm bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/30">
                  {emptyTubesCount} Empty {emptyTubesCount === 1 ? 'Tube' : 'Tubes'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setEmptyTubesCount(val);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      emptyTubesCount === val
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 ring-1 ring-cyan-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {val === 1 ? '1 Tube (Hard)' : val === 2 ? '2 Tubes (Standard)' : '3 Tubes (Zen)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Obstacles & Challenges */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Special Game Modifiers
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setEnableMysteryHidden((prev) => !prev);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                    enableMysteryHidden
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-black">❓ Mystery Items</div>
                  <div className="text-[10px] font-normal text-slate-400">Lower items shrouded</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setEnableIce((prev) => !prev);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                    enableIce
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-black">❄️ Frozen Tube</div>
                  <div className="text-[10px] font-normal text-slate-400">Thaws on match</div>
                </button>
              </div>
            </div>

            {/* Launch Button */}
            <button
              type="button"
              onClick={handleGenerateAndPlay}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-black text-sm shadow-xl flex items-center justify-center space-x-2 transition-all cursor-pointer transform active:scale-98"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Generate & Play Custom Puzzle</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
