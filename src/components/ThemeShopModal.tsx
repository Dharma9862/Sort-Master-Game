import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Lock, Sparkles, Palette } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GAME_THEMES } from '../data/themes';
import { ItemThemeId } from '../types/game';
import { sounds } from '../utils/audio';
import { triggerHaptic } from '../utils/storage';

interface ThemeShopModalProps {
  isOpen: boolean;
  coins: number;
  currentTheme: ItemThemeId;
  unlockedThemes: ItemThemeId[];
  unlockedLevel: number;
  onSelectTheme: (themeId: ItemThemeId) => void;
  onBuyTheme: (themeId: ItemThemeId, cost: number) => void;
  onClose: () => void;
}

export const ThemeShopModal: React.FC<ThemeShopModalProps> = ({
  isOpen,
  coins,
  currentTheme,
  unlockedThemes,
  unlockedLevel,
  onSelectTheme,
  onBuyTheme,
  onClose,
}) => {
  if (!isOpen) return null;

  const themesList = Object.values(GAME_THEMES);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.93 }}
          className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl text-white flex flex-col p-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <Palette className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">Theme Wardrobe</h3>
                <p className="text-xs text-purple-300 font-medium">10 Unique Item & Bottle Themes</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5 px-3 py-1 bg-slate-800 rounded-full border border-amber-500/30 text-amber-400 text-xs font-bold">
                <span>🪙</span>
                <span>{coins.toLocaleString()}</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Themes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-4">
            {themesList.map((theme) => {
              const isUnlocked = unlockedThemes.includes(theme.id);
              const isEquipped = currentTheme === theme.id;
              const meetsLevelReq = !theme.requiredLevel || unlockedLevel >= theme.requiredLevel;
              const canAfford = coins >= theme.cost;

              return (
                <div
                  key={theme.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isEquipped
                      ? 'bg-gradient-to-b from-purple-950/70 to-slate-900 border-purple-400 shadow-lg shadow-purple-500/20 ring-2 ring-purple-400/40'
                      : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  <div>
                    {/* Title and Icon */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{theme.icon}</span>
                        <div>
                          <h4 className="text-sm font-bold text-white leading-tight">{theme.name}</h4>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">
                            {theme.category}
                          </span>
                        </div>
                      </div>
                      {isEquipped && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/40">
                          Active
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">
                      {theme.description}
                    </p>

                    {/* Preview Swatches */}
                    <div className="flex items-center space-x-1.5 p-2 bg-slate-950/60 rounded-xl border border-slate-800/80 mb-3">
                      {theme.itemPalette.slice(0, 5).map((item) => (
                        <div
                          key={item.id}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shadow-inner"
                          style={{
                            backgroundColor: item.color,
                            boxShadow: `0 0 8px ${item.color}40`,
                          }}
                          title={item.name}
                        >
                          {item.emoji}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div>
                    {isEquipped ? (
                      <div className="w-full py-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center justify-center space-x-1.5">
                        <Check className="w-4 h-4" />
                        <span>Equipped</span>
                      </div>
                    ) : isUnlocked ? (
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          onSelectTheme(theme.id);
                        }}
                        className="w-full py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Equip Theme
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={!canAfford}
                        onClick={() => {
                          if (canAfford) {
                            sounds.playPowerup();
                            triggerHaptic();
                            try {
                              confetti({
                                particleCount: 60,
                                spread: 60,
                                origin: { y: 0.6 },
                                colors: ['#A855F7', '#EC4899', '#F59E0B', '#3B82F6'],
                              });
                            } catch {
                              // Ignored
                            }
                            onBuyTheme(theme.id, theme.cost);
                          } else {
                            sounds.playError();
                          }
                        }}
                        className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-transform active:scale-98 cursor-pointer ${
                          canAfford
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Unlock ({theme.cost} 🪙)</span>
                      </button>
                    )}

                    {!isUnlocked && theme.requiredLevel && (
                      <div className="text-[10px] text-slate-400 text-center mt-1">
                        Unlocked at Level {theme.requiredLevel}
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
