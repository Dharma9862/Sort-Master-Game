import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Coins,
  Crown,
  Settings,
  RotateCcw,
  Lightbulb,
  Shuffle,
  PlusCircle,
  Map,
  Palette,
  Gift,
  Trophy,
  Flame,
  Clock,
  Sparkles,
  HelpCircle,
  Video,
  Volume2,
  VolumeX,
  Building2,
  Wallet,
  Bot,
  BarChart3,
  Eye,
  Sliders,
  Bell,
  BellRing,
} from 'lucide-react';

import { ContainerData, LevelConfig, PlayerProfile, ItemThemeId, MoveSnapshot, WithdrawalRecord, WalletLedgerEntry, AppNotification } from './types/game';
import { GAME_THEMES } from './data/themes';
import { generateLevel, getTierInfo } from './utils/levelGenerator';
import { findBestMove, isStateSolved } from './utils/solver';
import { sounds } from './utils/audio';
import { loadProfile, saveProfile, getTodayDateString, triggerHaptic } from './utils/storage';
import { triggerBrowserNotification } from './utils/notifications';

// Modals
import { ContainerTube } from './components/ContainerTube';
import { VictoryModal } from './components/VictoryModal';
import { GameOverModal } from './components/GameOverModal';
import { AdModal, AdType } from './components/AdModal';
import { VipModal } from './components/VipModal';
import { DailyRewardModal } from './components/DailyRewardModal';
import { ThemeShopModal } from './components/ThemeShopModal';
import { AchievementsModal } from './components/AchievementsModal';
import { SettingsModal } from './components/SettingsModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { WithdrawModal } from './components/WithdrawModal';
import { WalletModal } from './components/WalletModal';
import { AiSolverModal } from './components/AiSolverModal';
import { StatsModal } from './components/StatsModal';
import { CustomLevelModal } from './components/CustomLevelModal';
import { NotificationModal } from './components/NotificationModal';

// Calculate scaled Withdrawable Cash Points per level (100,000 Points = ₹10.00 INR)
export function getLevelPointsReward(levelNum: number): number {
  if (levelNum <= 25) return 2500; // Beginner: 2.5k pts = ₹0.25
  if (levelNum <= 50) return 5000; // Easy: 5k pts = ₹0.50
  if (levelNum <= 75) return 10000; // Normal: 10k pts = ₹1.00
  if (levelNum <= 100) return 15000; // Medium: 15k pts = ₹1.50
  if (levelNum <= 125) return 25000; // Hard: 25k pts = ₹2.50
  if (levelNum <= 150) return 35000; // Expert: 35k pts = ₹3.50
  if (levelNum <= 175) return 50000; // Master: 50k pts = ₹5.00
  if (levelNum === 200) return 100000; // Grand Finale Level 200: 1 Lakh Points = ₹10.00!
  return 75000; // Grandmaster 176-199: 75k pts = ₹7.50
}

export default function App() {
  // Player Profile
  const [profile, setProfile] = useState<PlayerProfile>(loadProfile);

  // Active Game State
  const [currentLevelNum, setCurrentLevelNum] = useState<number>(() => profile.unlockedLevel || 1);
  const [levelConfig, setLevelConfig] = useState<LevelConfig>(() => generateLevel(profile.unlockedLevel || 1));
  const [containers, setContainers] = useState<ContainerData[]>(() => levelConfig.containers);
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);
  const [moveHistory, setMoveHistory] = useState<MoveSnapshot[]>([]);
  const [movesUsed, setMovesUsed] = useState<number>(0);
  const [remainingMoves, setRemainingMoves] = useState<number | null>(levelConfig.maxMoves ?? null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(levelConfig.timeLimitSeconds ?? null);

  // Modals & UI View Flags
  const [isVictoryOpen, setIsVictoryOpen] = useState<boolean>(false);
  const [isGameOverOpen, setIsGameOverOpen] = useState<boolean>(false);
  const [gameOverReason, setGameOverReason] = useState<'moves' | 'time' | 'stuck'>('moves');
  const [starsEarned, setStarsEarned] = useState<number>(3);

  const [isVipOpen, setIsVipOpen] = useState<boolean>(false);
  const [isDailyOpen, setIsDailyOpen] = useState<boolean>(false);
  const [isThemeShopOpen, setIsThemeShopOpen] = useState<boolean>(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState<boolean>(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState<boolean>(false);
  const [isWalletOpen, setIsWalletOpen] = useState<boolean>(false);
  const [isAiSolverOpen, setIsAiSolverOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isCustomStudioOpen, setIsCustomStudioOpen] = useState<boolean>(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [activeNotificationToast, setActiveNotificationToast] = useState<AppNotification | null>(null);
  const notificationToastTimerRef = useRef<number | null>(null);
  const [comboToast, setComboToast] = useState<string | null>(null);

  // Ad Modal State
  const [isAdOpen, setIsAdOpen] = useState<boolean>(false);
  const [adType, setAdType] = useState<AdType>('rewarded');
  const [adRewardTitle, setAdRewardTitle] = useState<string>('');
  const [adRewardDesc, setAdRewardDesc] = useState<string>('');
  const adCallbackRef = useRef<() => void>(() => {});

  // Hint State
  const [hintMove, setHintMove] = useState<{ fromId: string; toId: string } | null>(null);
  const [levelTubesAdded, setLevelTubesAdded] = useState<number>(0);
  const [tubeLockMessage, setTubeLockMessage] = useState<string | null>(null);

  // Multi-stage state
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);

  // Life recharge timer ticker
  const [timeToNextLife, setTimeToNextLife] = useState<string>('');

  // Sync Audio Settings & Volume Profiles
  useEffect(() => {
    sounds.setSoundEnabled(profile.soundEnabled);
    sounds.setMusicEnabled(profile.musicEnabled);
    if (profile.soundVolume !== undefined) {
      sounds.setSoundVolume(profile.soundVolume);
    }
    if (profile.musicVolume !== undefined) {
      sounds.setMusicVolume(profile.musicVolume);
    }
    if (profile.soundPack) {
      sounds.setSoundPack(profile.soundPack);
    }
  }, [profile.soundEnabled, profile.musicEnabled, profile.soundVolume, profile.musicVolume, profile.soundPack]);

  // Track playtime in background
  useEffect(() => {
    const playTimer = setInterval(() => {
      setProfile((prev) => {
        const nextSec = (prev.totalPlaytimeSeconds || 0) + 10;
        const next = { ...prev, totalPlaytimeSeconds: nextSec };
        saveProfile(next);
        return next;
      });
    }, 10000);
    return () => clearInterval(playTimer);
  }, []);

  // Save profile helper
  const updateProfile = useCallback((updater: (prev: PlayerProfile) => PlayerProfile) => {
    setProfile((prev) => {
      const next = updater(prev);
      saveProfile(next);
      return next;
    });
  }, []);

  // Life recharge countdown calculator
  useEffect(() => {
    const updateLifeTimer = () => {
      if (profile.lives >= profile.maxLives) {
        setTimeToNextLife('');
        return;
      }
      const LIFE_MS = 15 * 60 * 1000;
      const now = Date.now();
      const elapsed = now - profile.lastLifeRechargeTime;
      if (elapsed >= LIFE_MS) {
        updateProfile((p) => {
          const added = Math.min(p.maxLives - p.lives, Math.floor(elapsed / LIFE_MS));
          return {
            ...p,
            lives: p.lives + added,
            lastLifeRechargeTime: now - (elapsed % LIFE_MS),
          };
        });
      } else {
        const leftSec = Math.max(0, Math.ceil((LIFE_MS - elapsed) / 1000));
        const mins = Math.floor(leftSec / 60);
        const secs = leftSec % 60;
        setTimeToNextLife(`${mins}:${String(secs).padStart(2, '0')}`);
      }
    };

    updateLifeTimer();
    const interval = setInterval(updateLifeTimer, 1000);
    return () => clearInterval(interval);
  }, [profile.lives, profile.maxLives, profile.lastLifeRechargeTime, updateProfile]);

  // Level Countdown Timer (for speed challenges)
  useEffect(() => {
    if (timeRemaining === null || isVictoryOpen || isGameOverOpen) return;
    if (timeRemaining <= 0) {
      sounds.playError();
      setGameOverReason('time');
      setIsGameOverOpen(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((t) => (t !== null ? Math.max(0, t - 1) : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isVictoryOpen, isGameOverOpen]);

  // Start / Load Level
  const loadLevel = useCallback((lvlNum: number, stageIdx: number = 0) => {
    const config = generateLevel(lvlNum);
    setLevelConfig(config);

    if (config.stagesCount && config.stagesCount > 1 && config.multiStageContainers) {
      const stageContainers = config.multiStageContainers[stageIdx] || config.containers;
      setContainers(stageContainers.map((c) => ({ ...c, items: [...c.items] })));
      setCurrentStageIndex(stageIdx);
    } else {
      setContainers(config.containers.map((c) => ({ ...c, items: [...c.items] })));
      setCurrentStageIndex(0);
    }

    setCurrentLevelNum(lvlNum);
    setSelectedContainerId(null);
    setMoveHistory([]);
    setMovesUsed(0);
    setRemainingMoves(config.maxMoves ?? null);
    setTimeRemaining(config.timeLimitSeconds ?? null);
    setIsVictoryOpen(false);
    setIsGameOverOpen(false);
    setHintMove(null);
    setLevelTubesAdded(0);
  }, []);

  // Initialize level on mount
  useEffect(() => {
    loadLevel(profile.unlockedLevel || 1);
  }, [loadLevel]);

  // Check victory condition
  const checkVictory = useCallback(
    (currentContainers: ContainerData[], usedMoves: number) => {
      const stringArr = currentContainers.map((c) => [...c.items]);
      if (isStateSolved(stringArr, levelConfig.capacity)) {
        // Solved!
        const isMulti = (levelConfig.stagesCount ?? 1) > 1;
        const isFinalStage = !isMulti || currentStageIndex >= (levelConfig.stagesCount! - 1);

        // Calculate Stars
        let stars = 3;
        if (levelConfig.maxMoves) {
          const ratio = usedMoves / levelConfig.maxMoves;
          if (ratio > 0.85) stars = 1;
          else if (ratio > 0.65) stars = 2;
        }
        setStarsEarned(stars);

        if (isFinalStage) {
          // Calculate Cash Points based on level difficulty
          const pointsReward = getLevelPointsReward(currentLevelNum);

          // Award Coins, Points & Level Progress
          updateProfile((p) => {
            const nextLvl = Math.min(200, Math.max(p.unlockedLevel, currentLevelNum + 1));
            const newStars = { ...p.levelStars, [currentLevelNum]: Math.max(p.levelStars[currentLevelNum] || 0, stars) };
            const isFirstTimeClearing = !p.completedLevels.includes(currentLevelNum);
            const newCompleted = isFirstTimeClearing
              ? [...p.completedLevels, currentLevelNum]
              : p.completedLevels;

            // Level 100 milestone bonus: +3 Extra Tubes for the newly unlocked powerup!
            const bonusExtraTubes = currentLevelNum === 100 && isFirstTimeClearing ? 3 : 0;

            return {
              ...p,
              coins: p.coins + levelConfig.coinsReward,
              rewardPoints: (p.rewardPoints || 0) + pointsReward,
              extraBottleCount: p.extraBottleCount + bonusExtraTubes,
              unlockedLevel: nextLvl,
              levelStars: newStars,
              completedLevels: newCompleted,
              stats: {
                ...p.stats,
                levelsCompleted: p.stats.levelsCompleted + 1,
                perfectLevels: stars === 3 ? p.stats.perfectLevels + 1 : p.stats.perfectLevels,
                totalPointsEarned: (p.stats.totalPointsEarned || 0) + pointsReward,
              },
            };
          });

          // Check if milestone level for Interstitial Ad
          if (!profile.vipAdFree && currentLevelNum % 5 === 0 && currentLevelNum < 200) {
            setTimeout(() => {
              setAdType('interstitial');
              setAdRewardTitle('Milestone Reached!');
              setAdRewardDesc(`Awesome job clearing Level ${currentLevelNum}!`);
              adCallbackRef.current = () => {};
              setIsAdOpen(true);
            }, 800);
          }
        }

        setIsVictoryOpen(true);
      }
    },
    [currentLevelNum, currentStageIndex, levelConfig, profile.vipAdFree, updateProfile]
  );

  // Handle Container Tap
  const handleContainerTap = (containerId: string) => {
    if (isVictoryOpen || isGameOverOpen) return;
    if (profile.hapticsEnabled) triggerHaptic();

    const targetContainer = containers.find((c) => c.id === containerId);
    if (!targetContainer) return;

    // Locked container check
    if (targetContainer.isLocked && (targetContainer.lockMovesRemaining ?? 0) > 0) {
      sounds.playError();
      return;
    }

    // If no container currently selected -> Select this one
    if (selectedContainerId === null) {
      if (targetContainer.items.length === 0) {
        sounds.playError();
        return; // Can't pick from empty
      }
      sounds.playLift();
      setSelectedContainerId(containerId);
      setHintMove(null);
      return;
    }

    // If same container tapped again -> Deselect
    if (selectedContainerId === containerId) {
      sounds.playClick();
      setSelectedContainerId(null);
      return;
    }

    // Try moving from selectedContainerId -> containerId
    const sourceContainer = containers.find((c) => c.id === selectedContainerId);
    if (!sourceContainer || sourceContainer.items.length === 0) {
      setSelectedContainerId(null);
      return;
    }

    const topSourceItem = sourceContainer.items[sourceContainer.items.length - 1];

    // Destination checks
    if (targetContainer.items.length >= targetContainer.capacity) {
      sounds.playError();
      setSelectedContainerId(containerId); // switch selection
      return;
    }

    if (
      targetContainer.items.length > 0 &&
      targetContainer.items[targetContainer.items.length - 1] !== topSourceItem
    ) {
      sounds.playError();
      // Switch selection if target is valid
      if (targetContainer.items.length > 0) {
        setSelectedContainerId(containerId);
        sounds.playLift();
      }
      return;
    }

    // Perform valid move!
    sounds.playPour();

    // Snapshot for Undo
    const snapshot: MoveSnapshot = {
      containers: containers.map((c) => ({ ...c, items: [...c.items] })),
      movesUsed,
      fromId: sourceContainer.id,
      toId: targetContainer.id,
      movedItem: topSourceItem,
    };
    setMoveHistory((prev) => [...prev, snapshot]);

    const newContainers = containers.map((c) => {
      if (c.id === sourceContainer.id) {
        return {
          ...c,
          items: c.items.slice(0, -1),
        };
      }
      if (c.id === targetContainer.id) {
        const nextItems = [...c.items, topSourceItem];
        // Check if this container just became full and complete
        if (nextItems.length === c.capacity && nextItems.every((item) => item === nextItems[0])) {
          setTimeout(() => sounds.playBottleComplete(), 150);
        }
        return {
          ...c,
          items: nextItems,
          // Unfreeze ice if any
          hasIce: false,
        };
      }

      // Unlock countdown decrement
      if (c.isLocked && (c.lockMovesRemaining ?? 0) > 0) {
        const remain = Math.max(0, (c.lockMovesRemaining ?? 1) - 1);
        return {
          ...c,
          lockMovesRemaining: remain,
          isLocked: remain > 0,
        };
      }

      return c;
    });

    const nextMovesUsed = movesUsed + 1;
    setContainers(newContainers);
    setSelectedContainerId(null);
    setMovesUsed(nextMovesUsed);

    // Update remaining moves
    if (remainingMoves !== null) {
      const nextRemain = remainingMoves - 1;
      setRemainingMoves(nextRemain);
      if (nextRemain <= 0) {
        // Out of moves check after state updates
        setTimeout(() => {
          const stringArr = newContainers.map((c) => [...c.items]);
          if (!isStateSolved(stringArr, levelConfig.capacity)) {
            sounds.playError();
            setGameOverReason('moves');
            setIsGameOverOpen(true);
          }
        }, 300);
      }
    }

    // Update profile stats
    updateProfile((p) => ({
      ...p,
      stats: {
        ...p.stats,
        totalMoves: p.stats.totalMoves + 1,
      },
    }));

    // Check Victory
    checkVictory(newContainers, nextMovesUsed);
  };

  // Direct move execution from AI Solver Walkthrough
  const handleExecuteSolverMove = (fromIdx: number, toIdx: number) => {
    if (fromIdx < 0 || fromIdx >= containers.length || toIdx < 0 || toIdx >= containers.length) return;
    const src = containers[fromIdx];
    const tgt = containers[toIdx];
    if (!src || !tgt || src.items.length === 0) return;

    setSelectedContainerId(src.id);
    setTimeout(() => {
      handleContainerTap(tgt.id);
    }, 50);
  };

  // Deduct reward points for AI solver use (250 points per solve)
  const handleDeductPointsForSolver = (amount: number, reason: string = 'AI Solver'): boolean => {
    if ((profile.rewardPoints || 0) < amount) {
      return false;
    }

    sounds.playCoin();
    updateProfile((p) => {
      const newPoints = Math.max(0, (p.rewardPoints || 0) - amount);
      const txEntry: WalletLedgerEntry = {
        id: `solv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Date.now(),
        type: 'ai_solver',
        title: 'AI Solver Assistance',
        description: `${reason} (-${amount} pts)`,
        amountChange: 0,
        pointsChange: -amount,
        currency: p.preferredCurrency || 'INR',
        referenceId: `SOLV-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'completed',
      };

      return {
        ...p,
        rewardPoints: newPoints,
        walletTransactions: [txEntry, ...(p.walletTransactions || [])],
      };
    });

    setComboToast(`⭐ -${amount} Points (AI Solver)`);
    setTimeout(() => setComboToast(null), 3000);
    return true;
  };

  // Play custom level from Sandbox Studio
  const handlePlayCustomLevel = (config: LevelConfig) => {
    setLevelConfig(config);
    setContainers(config.containers.map((c) => ({ ...c, items: [...c.items] })));
    setCurrentLevelNum(999);
    setSelectedContainerId(null);
    setMoveHistory([]);
    setMovesUsed(0);
    setRemainingMoves(config.maxMoves ?? null);
    setTimeRemaining(config.timeLimitSeconds ?? null);
    setIsVictoryOpen(false);
    setIsGameOverOpen(false);
    setHintMove(null);
    setLevelTubesAdded(0);
  };

  // --- NOTIFICATION SYSTEM HANDLERS ---
  const handleSendNotification = useCallback(
    (notif: AppNotification, showToast: boolean = true, triggerWebPush: boolean = true) => {
      updateProfile((p) => {
        const existing = p.notifications || [];
        const updated = [notif, ...existing.filter((n) => n.id !== notif.id)].slice(0, 40);
        return {
          ...p,
          notifications: updated,
          stats: {
            ...p.stats,
            notificationsSent: (p.stats.notificationsSent || 0) + 1,
          },
        };
      });

      if (showToast && (profile.notificationsEnabled ?? true)) {
        setActiveNotificationToast(notif);
        if (notificationToastTimerRef.current) {
          clearTimeout(notificationToastTimerRef.current);
        }
        notificationToastTimerRef.current = window.setTimeout(() => {
          setActiveNotificationToast(null);
        }, 4500);
      }

      if (triggerWebPush && profile.browserPushEnabled) {
        triggerBrowserNotification(notif.title, notif.message);
      }
    },
    [profile.notificationsEnabled, profile.browserPushEnabled, updateProfile]
  );

  const handleMarkNotificationAsRead = (id: string) => {
    updateProfile((p) => {
      const updated = (p.notifications || []).map((n) => (n.id === id ? { ...n, read: true } : n));
      return { ...p, notifications: updated };
    });
  };

  const handleMarkAllNotificationsAsRead = () => {
    updateProfile((p) => {
      const updated = (p.notifications || []).map((n) => ({ ...n, read: true }));
      return { ...p, notifications: updated };
    });
  };

  const handleDeleteNotification = (id: string) => {
    updateProfile((p) => {
      const updated = (p.notifications || []).filter((n) => n.id !== id);
      return { ...p, notifications: updated };
    });
  };

  const handleClearAllNotifications = () => {
    updateProfile((p) => ({ ...p, notifications: [] }));
  };

  const handleNavigateNotificationAction = (actionType: string, actionData?: any) => {
    if (actionType === 'daily') {
      setIsDailyOpen(true);
    } else if (actionType === 'withdraw') {
      setIsWithdrawOpen(true);
    } else if (actionType === 'themes') {
      setIsThemeShopOpen(true);
    } else if (actionType === 'solver') {
      setIsAiSolverOpen(true);
    } else if (actionType === 'lives') {
      updateProfile((p) => ({ ...p, lives: p.maxLives }));
      sounds.playWin();
      setComboToast('⚡ Lives Fully Restored!');
      setTimeout(() => setComboToast(null), 2500);
    } else if (actionType === 'coins') {
      updateProfile((p) => ({ ...p, coins: p.coins + 250 }));
      sounds.playCoin();
      setComboToast('🪙 +250 Bonus Coins Added!');
      setTimeout(() => setComboToast(null), 2500);
    }
  };

  // --- POWER-UPS & BOOSTERS ---

  // 1. Undo Move
  const handleUndo = () => {
    if (moveHistory.length === 0) {
      sounds.playError();
      return;
    }

    if (profile.undoCount <= 0 && profile.coins < 25) {
      // Prompt rewarded ad for free undos
      triggerRewardedAd('+3 Free Undos', 'Watch this video to refill your undos!', () => {
        updateProfile((p) => ({ ...p, undoCount: p.undoCount + 3 }));
      });
      return;
    }

    sounds.playPowerup();
    const lastSnapshot = moveHistory[moveHistory.length - 1];
    setContainers(lastSnapshot.containers);
    setMovesUsed(lastSnapshot.movesUsed);
    if (remainingMoves !== null) {
      setRemainingMoves((r) => (r !== null ? r + 1 : null));
    }
    setMoveHistory((prev) => prev.slice(0, -1));
    setSelectedContainerId(null);
    setHintMove(null);

    // Deduct cost
    updateProfile((p) => {
      if (p.undoCount > 0) {
        return { ...p, undoCount: p.undoCount - 1 };
      }
      return { ...p, coins: Math.max(0, p.coins - 25) };
    });
  };

  // 2. Hint Solver
  const handleHint = () => {
    if (hintMove) return;

    const executeHint = () => {
      const best = findBestMove(containers, levelConfig.capacity);
      if (best) {
        sounds.playPowerup();
        const fromId = containers[best.fromIndex].id;
        const toId = containers[best.toIndex].id;
        setHintMove({ fromId, toId });
        updateProfile((p) => ({
          ...p,
          stats: { ...p.stats, hintsUsed: p.stats.hintsUsed + 1 },
        }));
      } else {
        sounds.playError();
      }
    };

    if (profile.hintsCount > 0) {
      updateProfile((p) => ({ ...p, hintsCount: p.hintsCount - 1 }));
      executeHint();
    } else if (profile.coins >= 50) {
      sounds.playCoin();
      updateProfile((p) => ({ ...p, coins: p.coins - 50 }));
      executeHint();
    } else {
      // Trigger Ad for free Hint
      triggerRewardedAd('Free Solver Hint', 'Watch a short ad to reveal the next optimal move!', () => {
        updateProfile((p) => ({ ...p, hintsCount: p.hintsCount + 1 }));
        setTimeout(executeHint, 300);
      });
    }
  };

  // 3. Shuffle Board
  const handleShuffle = () => {
    const doShuffle = () => {
      sounds.playPowerup();
      // Extract all movable items (skip full solved tubes)
      const nonSolvedTubes = containers.filter(
        (c) => !(c.items.length === c.capacity && c.items.every((i) => i === c.items[0]))
      );
      const allItems = nonSolvedTubes.flatMap((c) => c.items);

      // Scramble array
      for (let i = allItems.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allItems[i], allItems[j]] = [allItems[j], allItems[i]];
      }

      // Re-distribute
      let itemIdx = 0;
      const nextContainers = containers.map((c) => {
        if (c.items.length === c.capacity && c.items.every((i) => i === c.items[0])) {
          return c; // preserve solved tubes
        }
        const count = c.items.length;
        const newItems = allItems.slice(itemIdx, itemIdx + count);
        itemIdx += count;
        return {
          ...c,
          items: newItems,
        };
      });

      setContainers(nextContainers);
      setSelectedContainerId(null);
      setHintMove(null);
    };

    if (profile.shuffleCount > 0) {
      updateProfile((p) => ({ ...p, shuffleCount: p.shuffleCount - 1 }));
      doShuffle();
    } else if (profile.coins >= 50) {
      sounds.playCoin();
      updateProfile((p) => ({ ...p, coins: p.coins - 50 }));
      doShuffle();
    } else {
      triggerRewardedAd('Free Shuffle', 'Watch an ad to scramble blocked items and reset flow!', () => {
        updateProfile((p) => ({ ...p, shuffleCount: p.shuffleCount + 1 }));
        setTimeout(doShuffle, 300);
      });
    }
  };

  // 4. +1 Extra Bottle (+Tube Booster) - Exclusive: only 5 times at Level 100 and 5 times at Level 200
  const handleAddExtraBottle = () => {
    const isBossLevel = currentLevelNum === 100 || currentLevelNum === 200;

    if (!isBossLevel) {
      sounds.playError();
      setTubeLockMessage(
        `🔒 +Tube Booster is exclusive to Milestone Levels 100 & 200 (5 uses each)! You are on Level ${currentLevelNum}.`
      );
      setTimeout(() => setTubeLockMessage(null), 4000);
      return;
    }

    if (levelTubesAdded >= 5) {
      sounds.playError();
      setTubeLockMessage(
        `⚠️ Limit Reached: You have already added all 5 extra tubes allowed for Level ${currentLevelNum}!`
      );
      setTimeout(() => setTubeLockMessage(null), 4000);
      return;
    }

    const doAddBottle = () => {
      sounds.playPowerup();
      const newBottle: ContainerData = {
        id: `extra_bottle_${Date.now()}_${levelTubesAdded + 1}`,
        items: [],
        capacity: levelConfig.capacity,
        isExtraBottle: true,
      };
      setContainers((prev) => [...prev, newBottle]);
      setLevelTubesAdded((prev) => prev + 1);
      setHintMove(null);

      setComboToast(`🧪 +1 Extra Tube added (${levelTubesAdded + 1}/5 for Level ${currentLevelNum})`);
      setTimeout(() => setComboToast(null), 2500);
    };

    if (profile.extraBottleCount > 0) {
      updateProfile((p) => ({ ...p, extraBottleCount: p.extraBottleCount - 1 }));
      doAddBottle();
    } else if (profile.coins >= 100) {
      sounds.playCoin();
      updateProfile((p) => ({ ...p, coins: p.coins - 100 }));
      doAddBottle();
    } else {
      triggerRewardedAd(
        `Extra Empty Tube (${levelTubesAdded + 1}/5)`,
        `Watch a short video to add tube #${levelTubesAdded + 1} for Level ${currentLevelNum}!`,
        () => {
          updateProfile((p) => ({ ...p, extraBottleCount: p.extraBottleCount + 1 }));
          setTimeout(doAddBottle, 300);
        }
      );
    }
  };

  // Trigger Rewarded Ad Helper
  const triggerRewardedAd = (title: string, desc: string, onComplete: () => void) => {
    setAdType('rewarded');
    setAdRewardTitle(title);
    setAdRewardDesc(desc);
    adCallbackRef.current = onComplete;
    setIsAdOpen(true);
  };

  const handleAdCompleted = () => {
    setIsAdOpen(false);
    updateProfile((p) => ({
      ...p,
      stats: { ...p.stats, adsWatched: p.stats.adsWatched + 1 },
    }));
    adCallbackRef.current();
  };

  // Convert points to cash handler for Virtual Wallet
  const handleConvertPointsToCash = (points: number, cashAmount: number, currency: string) => {
    updateProfile((p) => {
      const txEntry: WalletLedgerEntry = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Date.now(),
        type: 'conversion',
        title: `Converted ${(points / 100000).toFixed(1)} Lakh Points`,
        description: `Instant credit of ${currency === 'INR' ? '₹' : '$'}${cashAmount.toFixed(2)} to Virtual Wallet`,
        amountChange: cashAmount,
        pointsChange: -points,
        currency: currency,
        referenceId: `CNV-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'completed',
      };

      return {
        ...p,
        rewardPoints: Math.max(0, (p.rewardPoints || 0) - points),
        bankBalance: (p.bankBalance || 0) + cashAmount,
        walletTransactions: [txEntry, ...(p.walletTransactions || [])],
        preferredCurrency: currency,
        stats: {
          ...p.stats,
          totalWithdrawnAmount: (p.stats.totalWithdrawnAmount || 0) + cashAmount,
        },
      };
    });
  };

  // Current Theme Config
  const activeTheme = GAME_THEMES[profile.currentTheme] || GAME_THEMES.colors;
  const tierInfo = getTierInfo(currentLevelNum);

  return (
    <div
      className={`min-h-screen w-full bg-gradient-to-b ${activeTheme.backgroundGradient} text-white flex flex-col items-center justify-between p-2 sm:p-4 select-none overflow-x-hidden font-sans`}
    >
      {/* Mobile Game Container Shell */}
      <div className="w-full max-w-md h-full flex-1 flex flex-col justify-between relative">
        {/* TOP BAR */}
        <header id="game-header" className="w-full pt-4 pb-2 flex flex-col space-y-2">
          <div className="flex items-center justify-between px-2">
            {/* Lives & Refill */}
            <button
              type="button"
              onClick={() => {
                if (profile.lives < profile.maxLives) {
                  triggerRewardedAd('Refill Lives', 'Watch a video to instantly restore full 5 Lives ❤️', () => {
                    updateProfile((p) => ({ ...p, lives: p.maxLives }));
                  });
                }
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-rose-500/40 shadow-lg cursor-pointer hover:scale-105 transition-transform"
            >
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
              <span className="text-xs font-black text-rose-300">
                {profile.vipAdFree ? '∞' : profile.lives}
              </span>
              {timeToNextLife && !profile.vipAdFree && (
                <span className="text-[10px] font-mono text-slate-400">({timeToNextLife})</span>
              )}
            </button>

            {/* Level & Tier Badge */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setIsLevelSelectOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700 shadow-lg cursor-pointer hover:border-amber-400 transition-colors"
            >
              <span className="text-xs font-black text-white">Lvl {currentLevelNum}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tierInfo.badgeColor}`}>
                {levelConfig.stageTier}
              </span>
            </button>

            {/* Right Controls: Notification Sender, AI Solver, Colorblind, Coins, Settings */}
            <div className="flex items-center space-x-1.5">
              {/* Notification Sender & Center */}
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setIsNotificationOpen(true);
                }}
                className="p-1.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-pink-500/40 hover:border-pink-400 text-pink-300 hover:text-white transition-colors cursor-pointer shadow-lg relative"
                title="Notification Sender & Inbox"
              >
                <Bell className="w-4 h-4" />
                {(profile.notifications || []).some((n) => !n.read) && (
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500 ring-2 ring-slate-900 animate-pulse absolute -top-0.5 -right-0.5 flex items-center justify-center" />
                )}
              </button>

              {/* Quick AI Solver Walkthrough */}
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setIsAiSolverOpen(true);
                }}
                className="px-2 py-1.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-indigo-500/40 hover:border-indigo-400 text-indigo-300 hover:text-white transition-colors cursor-pointer shadow-lg flex items-center space-x-1"
                title="AI Solver Walkthrough (250 ⭐ Points per solve)"
              >
                <Bot className="w-4 h-4" />
                <span className="text-[9px] font-mono font-bold text-amber-300 hidden sm:inline">-250⭐</span>
              </button>

              {/* Quick Colorblind Mode toggle */}
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  updateProfile((p) => ({ ...p, colorblindMode: !p.colorblindMode }));
                }}
                className={`p-1.5 rounded-2xl backdrop-blur-md border transition-colors cursor-pointer shadow-lg ${
                  profile.colorblindMode
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-400'
                    : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'
                }`}
                title="Toggle Colorblind Mode"
              >
                <Eye className="w-4 h-4" />
              </button>

              {/* Coins & Add Coins */}
              <button
                type="button"
                onClick={() => {
                  triggerRewardedAd('+100 Free Coins', 'Watch an ad to get 100 free coins!', () => {
                    sounds.playCoin();
                    updateProfile((p) => ({ ...p, coins: p.coins + 100 }));
                  });
                }}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-amber-500/40 shadow-lg cursor-pointer hover:scale-105 transition-transform"
              >
                <span className="text-xs">🪙</span>
                <span className="text-xs font-black text-amber-300 font-mono">
                  {profile.coins.toLocaleString()}
                </span>
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] flex items-center justify-center">
                  +
                </span>
              </button>

              {/* Menu / Settings */}
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setIsSettingsOpen(true);
                }}
                className="p-2 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white transition-colors cursor-pointer relative"
                title="Settings & Wallet Hub"
              >
                <Settings className="w-4 h-4" />
                {(profile.rewardPoints || 0) >= 100000 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse absolute -top-0.5 -right-0.5" />
                )}
              </button>
            </div>
          </div>

          {/* Floating Interactive Toast Notification Banner */}
          <AnimatePresence>
            {activeNotificationToast && (
              <motion.div
                initial={{ opacity: 0, y: -16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.95 }}
                className="p-3 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-400/50 shadow-2xl text-white flex items-center justify-between space-x-3 cursor-pointer"
                onClick={() => {
                  sounds.playClick();
                  handleMarkNotificationAsRead(activeNotificationToast.id);
                  if (activeNotificationToast.actionType) {
                    handleNavigateNotificationAction(activeNotificationToast.actionType, activeNotificationToast.actionData);
                  } else {
                    setIsNotificationOpen(true);
                  }
                  setActiveNotificationToast(null);
                }}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex-shrink-0 animate-bounce">
                    <BellRing className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-white truncate flex items-center space-x-1.5">
                      <span>{activeNotificationToast.title}</span>
                      <span className="text-[9px] font-bold text-indigo-300 bg-indigo-500/20 px-1 rounded">
                        NEW
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 truncate">
                      {activeNotificationToast.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 flex-shrink-0">
                  {activeNotificationToast.actionType && (
                    <span className="text-[10px] font-black text-indigo-300 bg-indigo-600/40 hover:bg-indigo-600/60 px-2 py-1 rounded-lg border border-indigo-400/40 transition-colors">
                      Action →
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveNotificationToast(null);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Secondary Sub-Bar (Moves / Timer / Multi-stage tracker) */}
          <div className="flex items-center justify-between px-3 py-1 bg-slate-950/40 backdrop-blur-sm rounded-2xl border border-slate-800/80 text-xs">
            {/* Moves remaining or moves used */}
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400 font-semibold">Moves:</span>
              <span
                className={`font-mono font-bold ${
                  remainingMoves !== null && remainingMoves <= 5
                    ? 'text-rose-400 animate-pulse text-sm'
                    : 'text-amber-400'
                }`}
              >
                {remainingMoves !== null ? `${remainingMoves} left` : movesUsed}
              </span>
            </div>

            {/* Multi-stage indicator */}
            {levelConfig.stagesCount && levelConfig.stagesCount > 1 && (
              <div className="flex items-center space-x-1 font-bold text-cyan-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  Stage {currentStageIndex + 1}/{levelConfig.stagesCount}
                </span>
              </div>
            )}

            {/* Time challenge counter */}
            {timeRemaining !== null && (
              <div className="flex items-center space-x-1 font-mono font-bold text-amber-300 bg-slate-900/80 px-2 py-0.5 rounded-lg border border-amber-500/30">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
                </span>
              </div>
            )}

            {/* Daily Streak Flame */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setIsDailyOpen(true);
              }}
              className="flex items-center space-x-1 text-orange-400 font-bold hover:scale-105 transition-transform cursor-pointer"
            >
              <Flame className="w-4 h-4 fill-orange-400" />
              <span>{profile.dailyStreak}d Streak</span>
            </button>
          </div>

          {/* Tutorial Tip Pill if applicable */}
          {levelConfig.tutorialTip && movesUsed < 3 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-2 p-2 bg-gradient-to-r from-indigo-950/90 to-purple-950/90 border border-purple-500/40 rounded-2xl text-[11px] text-purple-200 text-center flex items-center justify-center space-x-1.5 shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{levelConfig.tutorialTip}</span>
            </motion.div>
          )}
        </header>

        {/* CENTER GAMEPLAY CANVAS (Interactive Bottles Grid) */}
        <main className="flex-1 flex flex-col items-center justify-center py-2 px-1 relative">
          <div
            className={`w-full grid gap-x-2 gap-y-4 sm:gap-x-4 sm:gap-y-6 place-items-center ${
              containers.length <= 4
                ? 'grid-cols-3 sm:grid-cols-4 max-w-sm'
                : containers.length <= 6
                ? 'grid-cols-3 max-w-sm'
                : containers.length <= 8
                ? 'grid-cols-4 max-w-md'
                : containers.length <= 10
                ? 'grid-cols-4 sm:grid-cols-5 max-w-lg'
                : 'grid-cols-4 sm:grid-cols-6 max-w-xl'
            }`}
          >
            {containers.map((container, idx) => {
              const isSelected = selectedContainerId === container.id;
              const isHintSrc = hintMove?.fromId === container.id;
              const isHintTgt = hintMove?.toId === container.id;
              const isComplete =
                container.items.length === container.capacity &&
                container.items.every((it) => it === container.items[0]);

              return (
                <ContainerTube
                  key={container.id}
                  container={container}
                  theme={activeTheme}
                  isSelected={isSelected}
                  isHintSource={isHintSrc}
                  isHintTarget={isHintTgt}
                  isComplete={isComplete}
                  hasHiddenItems={levelConfig.hasHiddenItems}
                  colorblindMode={profile.colorblindMode}
                  onSelect={() => handleContainerTap(container.id)}
                />
              );
            })}
          </div>
        </main>

        {/* BOTTOM SECTION: POWERUPS & META TABS */}
        <footer className="w-full flex flex-col space-y-2.5 pb-2">
          {/* Tube Locked Toast Notification */}
          <AnimatePresence>
            {tubeLockMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="mx-1 p-2.5 rounded-2xl bg-gradient-to-r from-amber-950/90 via-slate-900/90 to-amber-950/90 border border-amber-500/60 shadow-xl shadow-amber-500/20 text-center text-xs text-amber-200 font-medium"
              >
                {tubeLockMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Powerups Bar */}
          <div className="grid grid-cols-4 gap-2 px-1">
            {/* Undo */}
            <button
              type="button"
              disabled={moveHistory.length === 0}
              onClick={handleUndo}
              className={`p-2.5 rounded-2xl flex flex-col items-center justify-center border transition-all cursor-pointer ${
                moveHistory.length > 0
                  ? 'bg-slate-900/80 border-slate-700 hover:border-amber-400 active:scale-95 shadow-md text-white'
                  : 'bg-slate-950/40 border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <RotateCcw className="w-5 h-5 mb-0.5 text-sky-400" />
              <span className="text-[10px] font-bold">Undo</span>
              <span className="text-[9px] text-slate-400 font-mono">
                {profile.undoCount > 0 ? `${profile.undoCount} left` : '25 🪙'}
              </span>
            </button>

            {/* Hint */}
            <button
              type="button"
              onClick={handleHint}
              className="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-700 hover:border-amber-400 active:scale-95 shadow-md flex flex-col items-center justify-center text-white transition-all cursor-pointer"
            >
              <Lightbulb className="w-5 h-5 mb-0.5 text-amber-400 animate-pulse" />
              <span className="text-[10px] font-bold">Hint</span>
              <span className="text-[9px] text-slate-400 font-mono">
                {profile.hintsCount > 0 ? `${profile.hintsCount} left` : '50 🪙'}
              </span>
            </button>

            {/* Shuffle */}
            <button
              type="button"
              onClick={handleShuffle}
              className="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-700 hover:border-purple-400 active:scale-95 shadow-md flex flex-col items-center justify-center text-white transition-all cursor-pointer"
            >
              <Shuffle className="w-5 h-5 mb-0.5 text-purple-400" />
              <span className="text-[10px] font-bold">Shuffle</span>
              <span className="text-[9px] text-slate-400 font-mono">
                {profile.shuffleCount > 0 ? `${profile.shuffleCount} left` : '50 🪙'}
              </span>
            </button>

            {/* +1 Bottle (+Tube Booster) - Exclusive 5 uses on Level 100 and 5 uses on Level 200 */}
            <button
              type="button"
              disabled={(currentLevelNum === 100 || currentLevelNum === 200) && levelTubesAdded >= 5}
              onClick={handleAddExtraBottle}
              className={`p-2.5 rounded-2xl flex flex-col items-center justify-center border transition-all cursor-pointer relative ${
                (currentLevelNum === 100 || currentLevelNum === 200) && levelTubesAdded < 5
                  ? 'bg-gradient-to-b from-slate-900/90 to-emerald-950/40 border-emerald-500/60 hover:border-emerald-400 active:scale-95 shadow-lg shadow-emerald-950/40 text-white'
                  : (currentLevelNum === 100 || currentLevelNum === 200) && levelTubesAdded >= 5
                  ? 'bg-slate-950/40 border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-950/60 border-amber-500/30 hover:border-amber-400 text-slate-400'
              }`}
            >
              {/* Badge for Level 100 & 200 exclusivity & count remaining */}
              {currentLevelNum === 100 || currentLevelNum === 200 ? (
                <span
                  className={`absolute -top-1.5 -right-1 px-1.5 py-0.2 rounded-full font-black text-[7.5px] border shadow ${
                    levelTubesAdded >= 5
                      ? 'bg-slate-800 text-slate-400 border-slate-700'
                      : 'bg-emerald-500 text-slate-950 border-emerald-300 animate-pulse'
                  }`}
                >
                  {levelTubesAdded >= 5 ? '5/5 USED' : `${5 - levelTubesAdded}/5 LEFT`}
                </span>
              ) : (
                <span className="absolute -top-1.5 -right-1 px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-300 font-black text-[7px] border border-amber-500/40 shadow">
                  🔒 LVL 100 & 200
                </span>
              )}

              <PlusCircle
                className={`w-5 h-5 mb-0.5 ${
                  (currentLevelNum === 100 || currentLevelNum === 200) && levelTubesAdded < 5
                    ? 'text-emerald-400'
                    : currentLevelNum === 100 || currentLevelNum === 200
                    ? 'text-slate-600'
                    : 'text-amber-400/80'
                }`}
              />
              <span className="text-[10px] font-bold">+1 Tube</span>
              <span className="text-[9px] text-slate-400 font-mono">
                {currentLevelNum === 100 || currentLevelNum === 200
                  ? levelTubesAdded >= 5
                    ? '5/5 Used'
                    : `${5 - levelTubesAdded} left`
                  : 'Lvl 100 & 200'}
              </span>
            </button>
          </div>

          {/* Bottom Meta Navigation Menu */}
          <div className="grid grid-cols-4 gap-1 p-2 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-slate-800/80 shadow-2xl">
            {/* Levels Map */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setIsLevelSelectOpen(true);
              }}
              className="flex flex-col items-center space-y-1 py-1 px-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900/60 transition-all cursor-pointer"
            >
              <Map className="w-4 h-4 text-sky-400" />
              <span className="text-[10px] font-bold">200 Levels</span>
            </button>

            {/* Badges / Achievements */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setIsAchievementsOpen(true);
              }}
              className="flex flex-col items-center space-y-1 py-1 px-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900/60 transition-all cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-[10px] font-bold">Badges</span>
            </button>

            {/* Daily Gift / Daily Login */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setIsDailyOpen(true);
              }}
              className="flex flex-col items-center space-y-1 py-1 px-1 rounded-xl text-amber-400 hover:text-amber-300 hover:bg-amber-950/30 transition-all cursor-pointer relative"
            >
              <Gift className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-bold">Daily Gift</span>
              {profile.lastDailyClaimDate !== getTodayDateString() && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse absolute top-0.5 right-3" />
              )}
            </button>

            {/* VIP Shop */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setIsVipOpen(true);
              }}
              className="flex flex-col items-center space-y-1 py-1 px-1 rounded-xl text-amber-400 hover:text-amber-300 hover:bg-amber-950/30 transition-all cursor-pointer"
            >
              <Crown className="w-4 h-4 fill-amber-400" />
              <span className="text-[10px] font-black">VIP Shop</span>
            </button>
          </div>
        </footer>
      </div>

      {/* MODALS */}
      {/* 1. Victory Celebration Modal */}
      <VictoryModal
        isOpen={isVictoryOpen}
        levelNumber={currentLevelNum}
        starsEarned={starsEarned}
        baseCoins={levelConfig.coinsReward}
        pointsEarned={getLevelPointsReward(currentLevelNum)}
        currencySymbol="₹"
        currencyRatePerLakh={10.0}
        totalPoints={profile.rewardPoints || 0}
        movesUsed={movesUsed}
        maxMoves={levelConfig.maxMoves}
        isMultiStage={(levelConfig.stagesCount ?? 1) > 1}
        currentStage={currentStageIndex + 1}
        totalStages={levelConfig.stagesCount ?? 1}
        onNextLevel={() => {
          if (levelConfig.stagesCount && currentStageIndex < levelConfig.stagesCount - 1) {
            // Next stage in multi-stage level
            loadLevel(currentLevelNum, currentStageIndex + 1);
          } else {
            // Next Level
            const nextLvl = Math.min(200, currentLevelNum + 1);
            loadLevel(nextLvl);
          }
        }}
        onReplayLevel={() => loadLevel(currentLevelNum, currentStageIndex)}
        onWatchAdDoubleCoins={() => {
          const pts = getLevelPointsReward(currentLevelNum);

          triggerRewardedAd('2× Double Rewards', 'Watch an ad to double your level coins & points!', () => {
            sounds.playCoin();
            updateProfile((p) => ({
              ...p,
              coins: p.coins + levelConfig.coinsReward,
              rewardPoints: (p.rewardPoints || 0) + pts,
              stats: {
                ...p.stats,
                totalPointsEarned: (p.stats.totalPointsEarned || 0) + pts,
              },
            }));
            setIsVictoryOpen(false);
          });
        }}
        onOpenWithdraw={() => {
          setIsVictoryOpen(false);
          setIsWithdrawOpen(true);
        }}
        onOpenWallet={() => {
          setIsVictoryOpen(false);
          setIsWalletOpen(true);
        }}
      />

      {/* 2. Defeat / Game Over Modal */}
      <GameOverModal
        isOpen={isGameOverOpen}
        reason={gameOverReason}
        lives={profile.lives}
        coins={profile.coins}
        onContinueWithAd={() => {
          triggerRewardedAd('+5 Free Moves', 'Watch this ad to get 5 moves and continue playing!', () => {
            setIsGameOverOpen(false);
            setRemainingMoves((r) => (r !== null ? r + 5 : 5));
            setTimeRemaining((t) => (t !== null ? t + 30 : null));
          });
        }}
        onContinueWithCoins={() => {
          updateProfile((p) => ({ ...p, coins: p.coins - 50 }));
          setIsGameOverOpen(false);
          setRemainingMoves((r) => (r !== null ? r + 5 : 5));
          setTimeRemaining((t) => (t !== null ? t + 30 : null));
        }}
        onRestartLevel={() => {
          if (!profile.vipAdFree) {
            updateProfile((p) => ({ ...p, lives: Math.max(0, p.lives - 1) }));
          }
          loadLevel(currentLevelNum);
        }}
        onRefillLivesWithAd={() => {
          triggerRewardedAd('Full Lives Refill', 'Watch an ad to instantly restore all 5 Lives!', () => {
            updateProfile((p) => ({ ...p, lives: p.maxLives }));
            loadLevel(currentLevelNum);
          });
        }}
        onClose={() => setIsGameOverOpen(false)}
      />

      {/* 3. Rewarded & Interstitial Ad Simulator */}
      <AdModal
        isOpen={isAdOpen}
        adType={adType}
        rewardTitle={adRewardTitle}
        rewardDescription={adRewardDesc}
        onAdCompleted={handleAdCompleted}
        onClose={() => setIsAdOpen(false)}
      />

      {/* 4. VIP Pass & Coin Store Modal */}
      <VipModal
        isOpen={isVipOpen}
        isVip={profile.vipAdFree}
        onUpgradeVip={() => {
          updateProfile((p) => ({
            ...p,
            vipAdFree: true,
            lives: p.maxLives,
            coins: p.coins + 1000,
            rewardPoints: (p.rewardPoints || 0) + 100000,
            stats: {
              ...p.stats,
              totalPointsEarned: (p.stats.totalPointsEarned || 0) + 100000,
            },
          }));
        }}
        onBuyCoins={(amount, bonus) => {
          updateProfile((p) => ({
            ...p,
            coins: p.coins + amount + bonus,
          }));
        }}
        onClose={() => setIsVipOpen(false)}
      />

      {/* 5. Daily Reward & Streak Calendar Modal */}
      <DailyRewardModal
        isOpen={isDailyOpen}
        streak={profile.dailyStreak}
        claimedDays={profile.claimedDailyDays}
        canClaimToday={profile.lastDailyClaimDate !== getTodayDateString()}
        onClaimDay={(day) => {
          const todayStr = getTodayDateString();
          updateProfile((p) => {
            let coinsAdd = 0;
            let pointsAdd = 0;
            let hintsAdd = 0;
            let shufflesAdd = 0;
            let undoAdd = 0;
            let extraAdd = 0;

            if (day === 1) {
              coinsAdd = 100;
              pointsAdd = 5000;
            } else if (day === 2) {
              coinsAdd = 150;
              pointsAdd = 10000;
            } else if (day === 3) {
              hintsAdd = 2;
              pointsAdd = 15000;
            } else if (day === 4) {
              coinsAdd = 250;
              pointsAdd = 20000;
            } else if (day === 5) {
              shufflesAdd = 2;
              pointsAdd = 30000;
            } else if (day === 6) {
              coinsAdd = 500;
              pointsAdd = 50000;
            } else if (day === 7) {
              coinsAdd = 1000;
              pointsAdd = 100000; // 1 Lakh Points = ₹10.00!
              hintsAdd = 3;
              undoAdd = 3;
              shufflesAdd = 2;
              extraAdd = 2;
            }

            return {
              ...p,
              coins: p.coins + coinsAdd,
              rewardPoints: (p.rewardPoints || 0) + pointsAdd,
              hintsCount: p.hintsCount + hintsAdd,
              shuffleCount: p.shuffleCount + shufflesAdd,
              undoCount: p.undoCount + undoAdd,
              extraBottleCount: p.extraBottleCount + extraAdd,
              dailyStreak: p.dailyStreak + 1,
              lastDailyClaimDate: todayStr,
              claimedDailyDays: [...p.claimedDailyDays, day],
              stats: {
                ...p.stats,
                totalPointsEarned: (p.stats.totalPointsEarned || 0) + pointsAdd,
              },
            };
          });
        }}
        onClose={() => setIsDailyOpen(false)}
      />

      {/* 6. Theme Wardrobe & Closet Shop Modal */}
      <ThemeShopModal
        isOpen={isThemeShopOpen}
        coins={profile.coins}
        currentTheme={profile.currentTheme}
        unlockedThemes={profile.unlockedThemes}
        unlockedLevel={profile.unlockedLevel}
        onSelectTheme={(themeId) => {
          updateProfile((p) => ({ ...p, currentTheme: themeId }));
        }}
        onBuyTheme={(themeId, cost) => {
          updateProfile((p) => ({
            ...p,
            coins: p.coins - cost,
            unlockedThemes: [...p.unlockedThemes, themeId],
            currentTheme: themeId,
          }));
        }}
        onClose={() => setIsThemeShopOpen(false)}
      />

      {/* 7. Achievements & Badges Modal */}
      <AchievementsModal
        isOpen={isAchievementsOpen}
        profile={profile}
        onClaimAchievement={(id, coins, points = 0) => {
          updateProfile((p) => ({
            ...p,
            coins: p.coins + coins,
            rewardPoints: (p.rewardPoints || 0) + points,
            achievements: {
              ...p.achievements,
              [id]: { unlocked: true, claimed: true, progress: 999 },
            },
            stats: {
              ...p.stats,
              totalPointsEarned: (p.stats.totalPointsEarned || 0) + points,
            },
          }));
        }}
        onClose={() => setIsAchievementsOpen(false)}
      />

      {/* 8. Bank Payout & Points Withdrawal Modal */}
      <WithdrawModal
        isOpen={isWithdrawOpen}
        profile={profile}
        onWithdrawSuccess={(record) => {
          updateProfile((p) => ({
            ...p,
            rewardPoints: Math.max(0, (p.rewardPoints || 0) - record.pointsUsed),
            bankBalance: (p.bankBalance || 0) + record.amount,
            withdrawHistory: [record, ...(p.withdrawHistory || [])],
            stats: {
              ...p.stats,
              totalWithdrawnAmount: (p.stats.totalWithdrawnAmount || 0) + record.amount,
            },
          }));
        }}
        onBonusPointsClaimed={(bonus) => {
          updateProfile((p) => ({
            ...p,
            rewardPoints: (p.rewardPoints || 0) + bonus,
            stats: {
              ...p.stats,
              totalPointsEarned: (p.stats.totalPointsEarned || 0) + bonus,
            },
          }));
        }}
        onClose={() => setIsWithdrawOpen(false)}
      />

      {/* 9. Settings & Wallet / Hub / Themes / Daily / APK Guide Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        soundEnabled={profile.soundEnabled}
        musicEnabled={profile.musicEnabled}
        hapticsEnabled={profile.hapticsEnabled}
        colorblindMode={profile.colorblindMode}
        soundVolume={profile.soundVolume ?? 0.8}
        musicVolume={profile.musicVolume ?? 0.5}
        soundPack={profile.soundPack || 'water'}
        notificationsEnabled={profile.notificationsEnabled ?? true}
        rewardPoints={profile.rewardPoints || 0}
        bankBalance={profile.bankBalance || 0}
        preferredCurrency={profile.preferredCurrency || 'INR'}
        unlockedLevel={profile.unlockedLevel || 1}
        currentTheme={profile.currentTheme}
        unlockedThemes={profile.unlockedThemes}
        dailyStreak={profile.dailyStreak || 1}
        isDailyClaimable={profile.lastDailyClaimDate !== getTodayDateString()}
        onToggleSound={() => updateProfile((p) => ({ ...p, soundEnabled: !p.soundEnabled }))}
        onToggleMusic={() => updateProfile((p) => ({ ...p, musicEnabled: !p.musicEnabled }))}
        onToggleHaptics={() => updateProfile((p) => ({ ...p, hapticsEnabled: !p.hapticsEnabled }))}
        onToggleColorblind={() => updateProfile((p) => ({ ...p, colorblindMode: !p.colorblindMode }))}
        onToggleNotifications={() =>
          updateProfile((p) => ({ ...p, notificationsEnabled: !p.notificationsEnabled }))
        }
        onChangeSoundVolume={(vol) => updateProfile((p) => ({ ...p, soundVolume: vol }))}
        onChangeMusicVolume={(vol) => updateProfile((p) => ({ ...p, musicVolume: vol }))}
        onSelectSoundPack={(pack) => updateProfile((p) => ({ ...p, soundPack: pack }))}
        onOpenWithdraw={() => setIsWithdrawOpen(true)}
        onOpenWallet={() => setIsWalletOpen(true)}
        onOpenDaily={() => setIsDailyOpen(true)}
        onOpenThemes={() => setIsThemeShopOpen(true)}
        onOpenAiSolver={() => {
          setIsSettingsOpen(false);
          setIsAiSolverOpen(true);
        }}
        onOpenStats={() => {
          setIsSettingsOpen(false);
          setIsStatsOpen(true);
        }}
        onOpenCustomStudio={() => {
          setIsSettingsOpen(false);
          setIsCustomStudioOpen(true);
        }}
        onOpenNotifications={() => {
          setIsSettingsOpen(false);
          setIsNotificationOpen(true);
        }}
        onSelectTheme={(themeId) => updateProfile((p) => ({ ...p, currentTheme: themeId }))}
        onResetProgress={() => {
          localStorage.clear();
          window.location.reload();
        }}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* 10. Dedicated Virtual Wallet Modal */}
      <WalletModal
        isOpen={isWalletOpen}
        profile={profile}
        onClose={() => setIsWalletOpen(false)}
        onOpenWithdraw={() => {
          setIsWalletOpen(false);
          setIsWithdrawOpen(true);
        }}
        onConvertPointsToCash={handleConvertPointsToCash}
        onCurrencyChange={(curr) => updateProfile((p) => ({ ...p, preferredCurrency: curr }))}
        onClaimDaily={() => {
          setIsWalletOpen(false);
          setIsDailyOpen(true);
        }}
      />

      {/* 11. 200 Levels Roadmap Modal */}
      <LevelSelectModal
        isOpen={isLevelSelectOpen}
        unlockedLevel={profile.unlockedLevel}
        currentPlayingLevel={currentLevelNum}
        levelStars={profile.levelStars}
        onSelectLevel={(lvlNum) => {
          loadLevel(lvlNum);
          setIsLevelSelectOpen(false);
        }}
        onClose={() => setIsLevelSelectOpen(false)}
      />

      {/* 12. Professional AI Solver Step-by-Step Walkthrough Modal */}
      <AiSolverModal
        isOpen={isAiSolverOpen}
        containers={containers}
        capacity={levelConfig.capacity}
        theme={activeTheme}
        rewardPoints={profile.rewardPoints || 0}
        levelNumber={currentLevelNum}
        onApplyMove={handleExecuteSolverMove}
        onDeductPoints={handleDeductPointsForSolver}
        onRequestWatchAd={(title, desc, onComplete) => triggerRewardedAd(title, desc, onComplete)}
        onClose={() => setIsAiSolverOpen(false)}
      />

      {/* 13. Professional Stats & Save Data Management Modal */}
      <StatsModal
        isOpen={isStatsOpen}
        profile={profile}
        onImportProfile={(imported) => {
          setProfile(imported);
          saveProfile(imported);
          loadLevel(imported.unlockedLevel || 1);
        }}
        onClose={() => setIsStatsOpen(false)}
      />

      {/* 14. Professional Custom Sandbox Studio Modal */}
      <CustomLevelModal
        isOpen={isCustomStudioOpen}
        currentTheme={profile.currentTheme}
        onPlayCustomLevel={(customConfig) => {
          handlePlayCustomLevel(customConfig);
          setIsCustomStudioOpen(false);
        }}
        onClose={() => setIsCustomStudioOpen(false)}
      />

      {/* 15. Notification Center & Sender Studio Modal */}
      <NotificationModal
        isOpen={isNotificationOpen}
        notifications={profile.notifications || []}
        notificationsEnabled={profile.notificationsEnabled ?? true}
        browserPushEnabled={profile.browserPushEnabled ?? false}
        onSendNotification={handleSendNotification}
        onMarkAsRead={handleMarkNotificationAsRead}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
        onDeleteNotification={handleDeleteNotification}
        onClearAllNotifications={handleClearAllNotifications}
        onToggleNotifications={() =>
          updateProfile((p) => ({ ...p, notificationsEnabled: !p.notificationsEnabled }))
        }
        onToggleBrowserPush={(enabled) =>
          updateProfile((p) => ({ ...p, browserPushEnabled: enabled }))
        }
        onNavigateAction={handleNavigateNotificationAction}
        onClose={() => setIsNotificationOpen(false)}
      />
    </div>
  );
}
