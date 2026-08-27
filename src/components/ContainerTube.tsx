import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Sparkles, Snowflake, Clock, Check } from 'lucide-react';
import { ContainerData, ThemeConfig } from '../types/game';

interface ContainerTubeProps {
  container: ContainerData;
  theme: ThemeConfig;
  isSelected: boolean;
  isHintSource: boolean;
  isHintTarget: boolean;
  isComplete: boolean;
  hasHiddenItems?: boolean;
  colorblindMode?: boolean;
  onSelect: () => void;
}

// Geometric accessibility patterns for colorblind users
const COLORBLIND_SYMBOLS: Record<string, string> = {
  red: '🔺',
  blue: '🟦',
  green: '🟢',
  yellow: '⭐',
  purple: '💎',
  orange: '🔶',
  pink: '💖',
  cyan: '❄️',
  lime: '🍀',
  indigo: '🌙',
  amber: '⚡',
  teal: '💠',
};

export const ContainerTube: React.FC<ContainerTubeProps> = ({
  container,
  theme,
  isSelected,
  isHintSource,
  isHintTarget,
  isComplete,
  hasHiddenItems,
  colorblindMode,
  onSelect,
}) => {
  const { items, capacity, isLocked, lockMovesRemaining, hasIce, isTemporary, tempMovesRemaining } = container;

  // Find theme item config by id
  const getItemConfig = (itemId: string) => {
    return theme.itemPalette.find((p) => p.id === itemId) || {
      id: itemId,
      name: 'Item',
      color: '#3B82F6',
      gradient: 'from-blue-400 to-indigo-600',
      emoji: '🔵',
    };
  };

  // Top item if selected
  const topIndex = items.length - 1;
  const isTubeFullAndUniform = items.length === capacity && items.every((c) => c === items[0]);

  // Determine bottle shape styles
  const getShapeClasses = () => {
    switch (theme.containerShape) {
      case 'flask':
        return 'rounded-b-3xl rounded-t-lg';
      case 'jar':
        return 'rounded-2xl';
      case 'beaker':
        return 'rounded-b-2xl rounded-t-sm';
      case 'bamboo':
        return 'rounded-xl border-emerald-600/50';
      case 'tube':
      default:
        return 'rounded-b-[2rem] rounded-t-xl';
    }
  };

  return (
    <div className="relative flex flex-col items-center select-none group cursor-pointer" onClick={onSelect}>
      {/* Floating Selected Top Item above the rim */}
      <div className="h-10 w-full flex items-center justify-center relative pointer-events-none mb-1">
        <AnimatePresence>
          {isSelected && items.length > 0 && (
            <motion.div
              initial={{ y: 20, scale: 0.8, opacity: 0 }}
              animate={{ y: 0, scale: 1.15, opacity: 1 }}
              exit={{ y: 20, scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              className="absolute z-30"
            >
              {(() => {
                const topItem = items[topIndex];
                const conf = getItemConfig(topItem);
                return (
                  <div
                    className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${conf.gradient} border-2 border-white/80 shadow-2xl flex items-center justify-center text-xl`}
                    style={{
                      boxShadow: `0 0 20px ${conf.color}90`,
                    }}
                  >
                    {conf.emoji}
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hint Indicator Arrow / Ring */}
        {isHintSource && (
          <div className="absolute top-1 text-xs font-black text-amber-300 bg-amber-500/30 px-2 py-0.5 rounded-full border border-amber-400 animate-bounce">
            PICK 👆
          </div>
        )}
        {isHintTarget && (
          <div className="absolute top-1 text-xs font-black text-emerald-300 bg-emerald-500/30 px-2 py-0.5 rounded-full border border-emerald-400 animate-bounce">
            POUR 👇
          </div>
        )}
      </div>

      {/* Glass Container Outer Shell */}
      <motion.div
        whileTap={{ scale: 0.96 }}
        className={`relative w-14 sm:w-16 h-48 sm:h-52 p-1.5 flex flex-col-reverse items-center justify-start border-2 backdrop-blur-md transition-all duration-200 ${getShapeClasses()} ${
          isComplete
            ? 'border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.4)] bg-emerald-950/30 ring-2 ring-emerald-400/50'
            : isSelected
            ? 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.5)] bg-slate-800/80 ring-2 ring-amber-400/60 -translate-y-1.5'
            : isHintSource
            ? 'border-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.6)] ring-2 ring-amber-400 animate-pulse'
            : isHintTarget
            ? 'border-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.6)] ring-2 ring-emerald-400 animate-pulse'
            : 'border-slate-600/60 bg-slate-900/50 hover:border-slate-500 hover:bg-slate-800/60'
        }`}
      >
        {/* Glass reflection highlight bar on left */}
        <div className="absolute left-1 top-2 bottom-2 w-1 bg-white/20 rounded-full pointer-events-none" />
        <div className="absolute right-1 top-2 bottom-2 w-0.5 bg-white/10 rounded-full pointer-events-none" />

        {/* Liquid / Ball items stacked from bottom to top */}
        <div className="w-full h-full flex flex-col-reverse justify-start items-center space-y-reverse space-y-1.5 pb-1">
          {items.map((itemId, idx) => {
            const conf = getItemConfig(itemId);
            const isTopItem = idx === topIndex;
            const isFloating = isSelected && isTopItem;

            // Hidden mystery item check: middle/bottom items shrouded if level has hidden items
            const isHidden = hasHiddenItems && idx < topIndex && !isTubeFullAndUniform;

            return (
              <motion.div
                key={`${container.id}_item_${idx}`}
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: isFloating ? 0 : 1,
                  opacity: isFloating ? 0 : 1,
                }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className={`relative w-11 sm:w-12 h-9 sm:h-10 rounded-2xl flex items-center justify-center text-lg sm:text-xl shadow-md border border-white/20 transition-all ${
                  isHidden
                    ? 'bg-slate-800 border-slate-600 text-slate-400'
                    : `bg-gradient-to-tr ${conf.gradient} text-white`
                }`}
                style={{
                  boxShadow: isHidden ? 'none' : `0 0 10px ${conf.color}40`,
                }}
              >
                {isHidden ? (
                  <span className="text-sm font-black font-mono">?</span>
                ) : colorblindMode && COLORBLIND_SYMBOLS[itemId] ? (
                  <div className="flex items-center justify-center space-x-0.5">
                    <span className="text-sm drop-shadow">{COLORBLIND_SYMBOLS[itemId]}</span>
                  </div>
                ) : (
                  <span>{conf.emoji}</span>
                )}

                {/* Ice overlay on item */}
                {hasIce && isTopItem && (
                  <div className="absolute inset-0 rounded-2xl bg-cyan-200/40 backdrop-blur-[1px] border border-cyan-300 flex items-center justify-center shadow-inner">
                    <Snowflake className="w-4 h-4 text-cyan-100 animate-spin" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Sealed Victory Cap when container is full & solved */}
        {isComplete && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-3.5 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider flex items-center space-x-1 shadow-lg"
          >
            <Check className="w-3 h-3" />
            <span>SOLVED</span>
          </motion.div>
        )}

        {/* Locked Container Overlay */}
        {isLocked && (lockMovesRemaining ?? 0) > 0 && (
          <div className="absolute inset-0 rounded-b-[2rem] bg-slate-950/80 backdrop-blur-[2px] flex flex-col items-center justify-center p-2 text-center z-20">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow mb-1">
              <Lock className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-wide">
              {lockMovesRemaining} moves
            </span>
          </div>
        )}

        {/* Temporary Bottle Countdown */}
        {isTemporary && (tempMovesRemaining ?? 0) > 0 && (
          <div className="absolute -top-3 px-2 py-0.5 rounded-full bg-purple-600 text-white font-bold text-[9px] uppercase tracking-wider flex items-center space-x-1 shadow">
            <Clock className="w-2.5 h-2.5" />
            <span>{tempMovesRemaining} left</span>
          </div>
        )}
      </motion.div>
    </div>
  );
};
