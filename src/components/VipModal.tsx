import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Crown, Check, Sparkles, Heart, ShieldCheck, Zap } from 'lucide-react';
import { sounds } from '../utils/audio';

interface VipModalProps {
  isOpen: boolean;
  isVip: boolean;
  onUpgradeVip: () => void;
  onBuyCoins: (amount: number, bonusCoins: number, label: string) => void;
  onClose: () => void;
}

export const VipModal: React.FC<VipModalProps> = ({
  isOpen,
  isVip,
  onUpgradeVip,
  onBuyCoins,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-amber-500/40 shadow-2xl text-white flex flex-col p-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Crown className="w-6 h-6 fill-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">Sort Master VIP & Shop</h3>
                <p className="text-xs text-amber-400 font-medium">Unlock Unlimited Premium Play</p>
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

          {/* VIP Pass Card */}
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-amber-950/80 via-slate-900 to-yellow-950/80 border border-amber-500/50 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-2 px-6 py-1 bg-amber-500 text-slate-950 font-black text-[10px] tracking-wider uppercase rotate-12 shadow">
              BEST VALUE
            </div>

            <div className="flex items-center space-x-3 mb-3">
              <Crown className="w-7 h-7 text-amber-400" />
              <div>
                <h4 className="font-extrabold text-base text-amber-300">VIP Sort Master Pass</h4>
                <p className="text-xs text-slate-300">Lifetime access • One-time unlock</p>
              </div>
            </div>

            <div className="space-y-2 my-3 text-xs text-slate-200">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>No Interstitial Ads</strong> – Seamless instant gameplay</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-rose-400 shrink-0 fill-rose-400" />
                <span><strong>Infinite Lives ❤️</strong> – Never wait to play again</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span><strong>Instant +1,000 Coins + 1 Lakh Cash Points (₹10.00) ⭐</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span><strong>VIP Crown Badge</strong> on all leaderboards</span>
              </div>
            </div>

            {isVip ? (
              <div className="w-full py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-center text-xs flex items-center justify-center space-x-1.5">
                <Check className="w-4 h-4" />
                <span>VIP Status Active (Lifetime)</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  sounds.playPowerup();
                  onUpgradeVip();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/30 flex items-center justify-center space-x-2 transition-transform transform active:scale-98 cursor-pointer"
              >
                <Crown className="w-4 h-4 fill-slate-950" />
                <span>Unlock VIP ($3.99 / One-Time)</span>
              </button>
            )}
          </div>

          {/* Coin Packs */}
          <div className="mt-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Coin Packages</span>
            </h4>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  sounds.playCoin();
                  onBuyCoins(500, 0, 'Pouch of Coins');
                }}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 flex flex-col items-center text-center transition-all cursor-pointer hover:border-amber-500/40"
              >
                <div className="text-2xl mb-1">🪙</div>
                <div className="font-extrabold text-sm text-white">500 Coins</div>
                <div className="text-[11px] text-amber-400 font-semibold mt-1.5 py-0.5 px-2 bg-amber-500/10 rounded-md">
                  $0.99
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playCoin();
                  onBuyCoins(1200, 200, 'Sack of Coins');
                }}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-amber-500/30 flex flex-col items-center text-center transition-all cursor-pointer relative"
              >
                <div className="text-2xl mb-1">💰</div>
                <div className="font-extrabold text-sm text-white">1,400 Coins</div>
                <div className="text-[10px] text-emerald-400 font-bold">+200 Bonus</div>
                <div className="text-[11px] text-amber-400 font-semibold mt-1 py-0.5 px-2 bg-amber-500/10 rounded-md">
                  $1.99
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playCoin();
                  onBuyCoins(3500, 1000, 'Chest of Coins');
                }}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-amber-500/50 flex flex-col items-center text-center transition-all cursor-pointer relative"
              >
                <div className="text-2xl mb-1">👑</div>
                <div className="font-extrabold text-sm text-white">4,500 Coins</div>
                <div className="text-[10px] text-emerald-400 font-bold">+1,000 Bonus</div>
                <div className="text-[11px] text-amber-400 font-semibold mt-1 py-0.5 px-2 bg-amber-500/10 rounded-md">
                  $4.99
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playCoin();
                  onBuyCoins(10000, 3000, 'Treasury of Coins');
                }}
                className="p-3 rounded-xl bg-gradient-to-b from-amber-950/40 to-slate-800 border border-amber-500/60 flex flex-col items-center text-center transition-all cursor-pointer relative"
              >
                <div className="text-2xl mb-1">🏛️</div>
                <div className="font-extrabold text-sm text-amber-300">13,000 Coins</div>
                <div className="text-[10px] text-emerald-400 font-bold">+3,000 Bonus</div>
                <div className="text-[11px] text-amber-400 font-semibold mt-1 py-0.5 px-2 bg-amber-500/10 rounded-md">
                  $9.99
                </div>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
