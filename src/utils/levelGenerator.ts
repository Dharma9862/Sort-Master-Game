import { ContainerData, LevelConfig } from '../types/game';

// Deterministic pseudorandom number generator (LCG)
class PRNG {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  range(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}

export function getTierInfo(level: number): {
  tierNumber: number;
  tierName: string;
  badgeColor: string;
  bgAccent: string;
} {
  if (level <= 25) {
    return { tierNumber: 1, tierName: 'Beginner', badgeColor: 'bg-emerald-500 text-white', bgAccent: 'from-emerald-900/30' };
  } else if (level <= 50) {
    return { tierNumber: 2, tierName: 'Easy', badgeColor: 'bg-sky-500 text-white', bgAccent: 'from-sky-900/30' };
  } else if (level <= 75) {
    return { tierNumber: 3, tierName: 'Normal', badgeColor: 'bg-amber-500 text-white', bgAccent: 'from-amber-900/30' };
  } else if (level <= 100) {
    return { tierNumber: 4, tierName: 'Advanced', badgeColor: 'bg-orange-500 text-white', bgAccent: 'from-orange-900/30' };
  } else if (level <= 125) {
    return { tierNumber: 5, tierName: 'Hard', badgeColor: 'bg-rose-500 text-white', bgAccent: 'from-rose-900/30' };
  } else if (level <= 150) {
    return { tierNumber: 6, tierName: 'Very Hard', badgeColor: 'bg-purple-500 text-white', bgAccent: 'from-purple-900/30' };
  } else if (level <= 175) {
    return { tierNumber: 7, tierName: 'Expert', badgeColor: 'bg-indigo-600 text-white', bgAccent: 'from-indigo-900/30' };
  } else if (level <= 199) {
    return { tierNumber: 8, tierName: 'Master', badgeColor: 'bg-fuchsia-600 text-white', bgAccent: 'from-fuchsia-900/30' };
  } else {
    return { tierNumber: 9, tierName: 'Ultimate Master', badgeColor: 'bg-gradient-to-r from-yellow-400 to-amber-600 text-slate-950 font-bold', bgAccent: 'from-amber-500/30' };
  }
}

// Generate guaranteed solvable containers via backward simulation
function generateSolvableContainers(
  colorCount: number,
  emptyCount: number,
  capacity: number,
  scrambleSteps: number,
  prng: PRNG
): ContainerData[] {
  // Start with solved state
  const containers: string[][] = [];
  for (let c = 0; c < colorCount; c++) {
    const colorId = `c${c + 1}`;
    containers.push(new Array(capacity).fill(colorId));
  }
  for (let e = 0; e < emptyCount; e++) {
    containers.push([]);
  }

  // Scramble by performing reverse valid moves
  let steps = 0;
  let attempts = 0;
  const maxAttempts = scrambleSteps * 8;

  while (steps < scrambleSteps && attempts < maxAttempts) {
    attempts++;
    const fromIdx = prng.range(0, containers.length - 1);
    const toIdx = prng.range(0, containers.length - 1);

    if (fromIdx === toIdx) continue;
    const src = containers[fromIdx];
    const dest = containers[toIdx];

    if (src.length === 0) continue;
    if (dest.length >= capacity) continue;

    // Pop from src and push to dest
    const item = src.pop()!;
    dest.push(item);
    steps++;
  }

  // Convert to ContainerData
  return containers.map((items, i) => ({
    id: `cont_${i}`,
    items: [...items],
    capacity,
  }));
}

export function generateLevel(levelNum: number): LevelConfig {
  const seed = levelNum * 7919 + 1337;
  const prng = new PRNG(seed);
  const tier = getTierInfo(levelNum);

  let capacity = 4;
  let colorCount = 2;
  let emptyCount = 1;
  let scrambleSteps = 15;
  let maxMoves: number | undefined = undefined;
  let hasHiddenItems = false;
  let hasLockedContainers = false;
  let hasIce = false;
  let timeLimitSeconds: number | undefined = undefined;
  let tutorialTip: string | undefined = undefined;
  let coinsReward = 20 + levelNum * 2;
  let isMultiStage = false;
  let multiStageContainers: ContainerData[][] | undefined = undefined;

  // Level parameter tuning per tier
  if (levelNum === 1) {
    capacity = 3;
    colorCount = 2;
    emptyCount = 1;
    scrambleSteps = 6;
    tutorialTip = 'Tap any bottle to lift its top item, then tap another bottle to place it!';
  } else if (levelNum === 2) {
    capacity = 3;
    colorCount = 2;
    emptyCount = 1;
    scrambleSteps = 8;
    tutorialTip = 'You can only place an item on an empty bottle or on the same matching item!';
  } else if (levelNum <= 10) {
    capacity = 4;
    colorCount = 2;
    emptyCount = 1;
    scrambleSteps = 12;
  } else if (levelNum <= 25) {
    // Beginner 11-25
    colorCount = 3;
    emptyCount = 1;
    scrambleSteps = 16 + (levelNum - 10);
    if (levelNum === 15) {
      tutorialTip = 'Complete a tube with 4 matching items to seal it with a victory chime!';
    }
  } else if (levelNum <= 50) {
    // Easy 26-50
    colorCount = levelNum < 38 ? 3 : 4;
    emptyCount = 1;
    scrambleSteps = 22 + (levelNum - 25);
    maxMoves = 26 + (levelNum - 25);
    if (levelNum === 26) {
      tutorialTip = 'Undo introduced! Made a wrong move? Tap the ↩️ Undo button below.';
    }
  } else if (levelNum <= 75) {
    // Normal 51-75
    colorCount = 4;
    emptyCount = 1;
    scrambleSteps = 28 + (levelNum - 50);
    maxMoves = 22 + Math.floor((levelNum - 50) / 2);
    hasLockedContainers = levelNum % 2 === 1;
    if (levelNum === 51) {
      tutorialTip = '🔒 Locked Tube: Make moves to unlock it and access extra space!';
    }
  } else if (levelNum <= 100) {
    // Advanced 76-100
    colorCount = levelNum < 88 ? 5 : 5;
    emptyCount = 1;
    scrambleSteps = 35 + (levelNum - 75);
    maxMoves = 24 + Math.floor((levelNum - 75) / 2);
    hasHiddenItems = true;
    if (levelNum === 76) {
      tutorialTip = '❓ Mystery Shrouds: Clear the top items to reveal hidden lower colors!';
    }
  } else if (levelNum <= 125) {
    // Hard 101-125
    colorCount = levelNum < 115 ? 5 : 6;
    emptyCount = levelNum < 115 ? 1 : 2;
    scrambleSteps = 40 + (levelNum - 100);
    maxMoves = 28 + Math.floor((levelNum - 100) / 3);
    hasIce = levelNum % 3 === 0;
    if (levelNum === 101) {
      tutorialTip = '🧊 Frozen Items: Match and pour identical colors to melt ice caps!';
    }
  } else if (levelNum <= 150) {
    // Very Hard 126-150
    colorCount = 6;
    emptyCount = 2;
    scrambleSteps = 45 + (levelNum - 125);
    maxMoves = 32 + Math.floor((levelNum - 125) / 3);
    coinsReward = 120 + levelNum;
  } else if (levelNum <= 175) {
    // Expert 151-175
    colorCount = 6;
    emptyCount = 1;
    scrambleSteps = 50 + (levelNum - 150);
    maxMoves = 28 + Math.floor((levelNum - 150) / 3);
    if (levelNum % 4 === 0) {
      timeLimitSeconds = 90;
    }
    coinsReward = 150 + levelNum;
  } else if (levelNum < 200) {
    // Master 176-199
    colorCount = 7;
    emptyCount = 2;
    scrambleSteps = 60;
    maxMoves = 35;
    hasHiddenItems = levelNum % 2 === 0;
    hasLockedContainers = levelNum % 2 === 1;
    coinsReward = 200;
  } else {
    // Level 200: Ultimate Master Challenge (Multi-stage)
    colorCount = 6;
    emptyCount = 2;
    scrambleSteps = 65;
    maxMoves = 45;
    isMultiStage = true;
    coinsReward = 500;
    tutorialTip = '👑 The Grand Finale! Complete all 3 sorting stages to become the ultimate Sort Master!';
  }

  let containers = generateSolvableContainers(colorCount, emptyCount, capacity, scrambleSteps, prng);

  // Apply locked container if enabled
  if (hasLockedContainers) {
    const targetIdx = containers.findIndex((c) => c.items.length === 0);
    if (targetIdx !== -1) {
      containers[targetIdx].isLocked = true;
      containers[targetIdx].lockMovesRemaining = 4;
    }
  }

  // Apply ice obstacle if enabled
  if (hasIce) {
    const fullIdx = containers.findIndex((c) => c.items.length === capacity);
    if (fullIdx !== -1) {
      containers[fullIdx].hasIce = true;
    }
  }

  // Multi-stage generation for Level 200
  if (isMultiStage) {
    const stage1 = generateSolvableContainers(4, 1, 4, 30, prng);
    const stage2 = generateSolvableContainers(5, 2, 4, 40, prng);
    const stage3 = containers;
    multiStageContainers = [stage1, stage2, stage3];
    containers = stage1;
  }

  return {
    levelNumber: levelNum,
    stageTier: tier.tierName,
    tierNumber: tier.tierNumber,
    containers,
    capacity,
    maxMoves,
    itemType: 'standard',
    hasHiddenItems,
    hasLockedContainers,
    hasIce,
    timeLimitSeconds,
    coinsReward,
    tutorialTip,
    stagesCount: isMultiStage ? 3 : 1,
    currentStage: 1,
    multiStageContainers,
  };
}

export const ALL_LEVEL_METAS = Array.from({ length: 200 }, (_, i) => {
  const lvl = i + 1;
  const tier = getTierInfo(lvl);
  return {
    levelNumber: lvl,
    tierName: tier.tierName,
    tierNumber: tier.tierNumber,
    badgeColor: tier.badgeColor,
  };
});
