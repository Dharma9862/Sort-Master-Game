import { PlayerProfile } from '../types/game';

const STORAGE_KEY = 'sort_master_player_v1';
const LIFE_RECHARGE_MS = 15 * 60 * 1000; // 15 minutes per life

export const DEFAULT_PROFILE: PlayerProfile = {
  coins: 200,
  rewardPoints: 100000, // Starts with 1 Lakh (100,000) Cash Points (₹10.00 welcome bonus!)
  bankBalance: 0.0,
  preferredCurrency: 'INR',
  withdrawHistory: [
    {
      id: 'tx_init_sample',
      timestamp: Date.now() - 86400000 * 2,
      pointsUsed: 100000,
      amount: 10.0,
      currency: 'INR',
      method: 'bank_transfer',
      recipientDetail: 'State Bank of India (****7019)',
      accountHolderName: 'Rahul Sharma',
      bankName: 'State Bank of India',
      status: 'completed',
      transactionRef: 'PAY-892147-INR',
    },
  ],
  lives: 5,
  maxLives: 5,
  lastLifeRechargeTime: Date.now(),
  unlockedLevel: 1,
  levelStars: {},
  completedLevels: [],
  currentTheme: 'colors',
  unlockedThemes: ['colors'],
  hintsCount: 3,
  undoCount: 5,
  shuffleCount: 2,
  extraBottleCount: 1,
  dailyStreak: 1,
  lastDailyClaimDate: '',
  claimedDailyDays: [],
  achievements: {},
  vipAdFree: false,
  soundEnabled: true,
  musicEnabled: true,
  hapticsEnabled: true,
  stats: {
    totalMoves: 0,
    levelsCompleted: 0,
    perfectLevels: 0,
    hintsUsed: 0,
    adsWatched: 0,
    totalPointsEarned: 200000,
    totalWithdrawnAmount: 10.0,
  },
};

export function loadProfile(): PlayerProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);

    // Merge with default profile to ensure missing fields are populated
    const merged: PlayerProfile = {
      ...DEFAULT_PROFILE,
      ...parsed,
      stats: {
        ...DEFAULT_PROFILE.stats,
        ...(parsed.stats || {}),
      },
    };

    // Calculate regenerated lives
    if (merged.lives < merged.maxLives) {
      const now = Date.now();
      const elapsed = now - (merged.lastLifeRechargeTime || now);
      const livesToAdd = Math.floor(elapsed / LIFE_RECHARGE_MS);
      if (livesToAdd > 0) {
        merged.lives = Math.min(merged.maxLives, merged.lives + livesToAdd);
        merged.lastLifeRechargeTime = now - (elapsed % LIFE_RECHARGE_MS);
      }
    }

    // Ensure starter points balance is at least 1 Lakh (100,000 pts) if user just started
    if (!merged.rewardPoints || merged.rewardPoints < 100000) {
      merged.rewardPoints = Math.max(100000, merged.rewardPoints || 0);
    }
    if (!merged.preferredCurrency) {
      merged.preferredCurrency = 'INR';
    }

    return merged;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: PlayerProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // LocalStorage write failed
  }
}

export function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function triggerHaptic() {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(25);
    } catch {
      // ignore
    }
  }
}
