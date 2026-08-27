export type ItemThemeId = 
  | 'colors'
  | 'candy'
  | 'food'
  | 'jewels'
  | 'nature'
  | 'vehicles'
  | 'animals'
  | 'space'
  | 'ocean'
  | 'india_royal';

export interface ThemeConfig {
  id: ItemThemeId;
  name: string;
  category: string;
  icon: string;
  description: string;
  cost: number;
  unlockedByDefault: boolean;
  requiredLevel?: number;
  containerShape: 'tube' | 'flask' | 'jar' | 'beaker' | 'bamboo';
  backgroundGradient: string;
  containerBorderColor: string;
  containerLiquidBg: string;
  itemPalette: {
    id: string;
    name: string;
    color: string;
    gradient: string;
    emoji: string;
    textColor?: string;
  }[];
}

export interface ContainerData {
  id: string;
  items: string[]; // List of item ids from bottom to top
  capacity: number;
  isLocked?: boolean;
  lockMovesRemaining?: number;
  isTemporary?: boolean;
  tempMovesRemaining?: number;
  hasIce?: boolean;
  isExtraBottle?: boolean;
}

export interface LevelConfig {
  levelNumber: number;
  stageTier: string;
  tierNumber: number;
  containers: ContainerData[];
  maxMoves?: number;
  capacity: number;
  itemType: string;
  hasHiddenItems?: boolean;
  hasLockedContainers?: boolean;
  hasIce?: boolean;
  timeLimitSeconds?: number;
  coinsReward: number;
  tutorialTip?: string;
  stagesCount?: number;
  currentStage?: number;
  multiStageContainers?: ContainerData[][];
}

export interface MoveSnapshot {
  containers: ContainerData[];
  movesUsed: number;
  fromId: string;
  toId: string;
  movedItem: string;
  revealedItemIndex?: { containerId: string; itemIndex: number };
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  rewardCoins: number;
  rewardPoints?: number;
  unlocked: boolean;
  claimed: boolean;
  currentValue: number;
}

export type PayoutMethod = 'bank_transfer' | 'upi' | 'paypal' | 'wire' | 'gift_card';

export interface WithdrawalRecord {
  id: string;
  timestamp: number;
  pointsUsed: number;
  amount: number;
  currency: string;
  method: PayoutMethod;
  recipientDetail: string; // e.g. "Chase Bank ****9482"
  accountHolderName: string;
  bankName?: string;
  routingNumber?: string;
  status: 'completed' | 'processing';
  transactionRef: string;
}

export type WalletTransactionType = 'conversion' | 'withdrawal' | 'daily_reward' | 'achievement_reward' | 'coin_exchange' | 'ad_bonus';

export interface WalletLedgerEntry {
  id: string;
  timestamp: number;
  type: WalletTransactionType;
  title: string;
  description: string;
  amountChange: number; // in fiat or currency value
  pointsChange?: number;
  coinsChange?: number;
  currency: string;
  referenceId: string;
  status: 'completed' | 'pending';
}

export type DailyTaskCategory = 'levels' | 'moves' | 'stars' | 'powerup' | 'tubes';

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: DailyTaskCategory;
  target: number;
  current: number;
  rewardCoins: number;
  rewardPoints: number;
  completed: boolean;
  claimed: boolean;
}

export interface DailyTasksState {
  date: string; // YYYY-MM-DD
  tasks: Record<string, { current: number; completed: boolean; claimed: boolean }>;
  bonusClaimed: boolean;
}

export interface PlayerProfile {
  coins: number;
  rewardPoints: number; // Cash points convertible to bank balance (e.g., 1,000 pts = $1.00)
  bankBalance: number; // Converted real-money virtual bank account balance
  preferredCurrency: string; // 'USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'
  withdrawHistory: WithdrawalRecord[];
  walletTransactions?: WalletLedgerEntry[];
  dailyTasksState?: DailyTasksState;
  lives: number;
  maxLives: number;
  lastLifeRechargeTime: number; // timestamp
  unlockedLevel: number;
  levelStars: Record<number, number>; // levelNumber -> stars (1-3)
  completedLevels: number[];
  currentTheme: ItemThemeId;
  unlockedThemes: ItemThemeId[];
  hintsCount: number;
  undoCount: number;
  shuffleCount: number;
  extraBottleCount: number;
  dailyStreak: number;
  lastDailyClaimDate: string; // YYYY-MM-DD
  claimedDailyDays: number[]; // e.g. [1, 2, 3]
  achievements: Record<string, { unlocked: boolean; claimed: boolean; progress: number }>;
  vipAdFree: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
  hapticsEnabled: boolean;
  colorblindMode?: boolean;
  soundVolume?: number; // 0.0 to 1.0
  musicVolume?: number; // 0.0 to 1.0
  soundPack?: 'water' | 'arcade' | 'marimba' | 'synth';
  gameMode?: 'adventure' | 'zen' | 'rush';
  rushHighScore?: number;
  totalPlaytimeSeconds?: number;
  notificationsEnabled?: boolean;
  browserPushEnabled?: boolean;
  notifications?: AppNotification[];
  stats: {
    totalMoves: number;
    levelsCompleted: number;
    perfectLevels: number;
    hintsUsed: number;
    adsWatched: number;
    totalPointsEarned: number;
    totalWithdrawnAmount: number;
    bottlesSolved?: number;
    rushLevelsCompleted?: number;
    customLevelsSolved?: number;
    notificationsSent?: number;
  };
}

export type NotificationType =
  | 'reward'
  | 'life'
  | 'achievement'
  | 'alert'
  | 'system'
  | 'streak'
  | 'withdrawal'
  | 'custom';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: number;
  read: boolean;
  actionType?: 'daily' | 'withdraw' | 'themes' | 'lives' | 'solver' | 'coins';
  actionData?: any;
}
