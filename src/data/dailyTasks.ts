import { DailyTask, DailyTasksState, PlayerProfile } from '../types/game';

export interface DailyTaskTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'levels' | 'moves' | 'stars' | 'powerup' | 'tubes';
  target: number;
  rewardCoins: number;
  rewardPoints: number;
}

export const DAILY_TASKS_TEMPLATES: DailyTaskTemplate[] = [
  {
    id: 'task_levels_3',
    title: 'Daily Sprinter',
    description: 'Solve and clear any 3 levels today',
    icon: '🏆',
    category: 'levels',
    target: 3,
    rewardCoins: 150,
    rewardPoints: 10000, // 10k pts = ₹1.00
  },
  {
    id: 'task_moves_25',
    title: 'Flow Master',
    description: 'Perform 25 liquid tube sorting moves',
    icon: '🧪',
    category: 'moves',
    target: 25,
    rewardCoins: 100,
    rewardPoints: 10000, // 10k pts = ₹1.00
  },
  {
    id: 'task_stars_2',
    title: 'Triple Star Perfection',
    description: 'Achieve 3 Stars on 2 different levels',
    icon: '⭐',
    category: 'stars',
    target: 2,
    rewardCoins: 200,
    rewardPoints: 15000, // 15k pts = ₹1.50
  },
  {
    id: 'task_powerup_1',
    title: 'Tactical Edge',
    description: 'Use any powerup (Undo, Hint, Shuffle or +Tube)',
    icon: '⚡',
    category: 'powerup',
    target: 1,
    rewardCoins: 100,
    rewardPoints: 5000, // 5k pts = ₹0.50
  },
  {
    id: 'task_tubes_5',
    title: 'Complex Chemist',
    description: 'Play a level featuring 5 or more test tubes',
    icon: '🎯',
    category: 'tubes',
    target: 1,
    rewardCoins: 150,
    rewardPoints: 10000, // 10k pts = ₹1.00
  },
];

export const DAILY_BONUS_TARGET = {
  requiredTasks: 3,
  rewardCoins: 500,
  rewardPoints: 50000, // 50k pts = ₹5.00
  extraBottles: 1,
};

export function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getOrCreateDailyTasksState(existingState?: DailyTasksState): DailyTasksState {
  const today = getTodayDateString();

  if (existingState && existingState.date === today && existingState.tasks) {
    // Check if all templates exist in tasks
    const updatedTasks = { ...existingState.tasks };
    let changed = false;
    DAILY_TASKS_TEMPLATES.forEach((tpl) => {
      if (!updatedTasks[tpl.id]) {
        updatedTasks[tpl.id] = { current: 0, completed: false, claimed: false };
        changed = true;
      }
    });
    return changed ? { ...existingState, tasks: updatedTasks } : existingState;
  }

  // Brand new day -> initialize fresh state
  const initialTasks: Record<string, { current: number; completed: boolean; claimed: boolean }> = {};
  DAILY_TASKS_TEMPLATES.forEach((tpl) => {
    initialTasks[tpl.id] = { current: 0, completed: false, claimed: false };
  });

  return {
    date: today,
    tasks: initialTasks,
    bonusClaimed: false,
  };
}

export function getResolvedDailyTasks(state: DailyTasksState): DailyTask[] {
  return DAILY_TASKS_TEMPLATES.map((tpl) => {
    const taskRecord = state.tasks[tpl.id] || { current: 0, completed: false, claimed: false };
    const current = taskRecord.current || 0;
    const completed = current >= tpl.target;
    return {
      id: tpl.id,
      title: tpl.title,
      description: tpl.description,
      icon: tpl.icon,
      category: tpl.category,
      target: tpl.target,
      current: Math.min(tpl.target, current),
      rewardCoins: tpl.rewardCoins,
      rewardPoints: tpl.rewardPoints,
      completed,
      claimed: !!taskRecord.claimed,
    };
  });
}

export function countUnclaimedDailyTasks(state?: DailyTasksState): number {
  if (!state) return 0;
  const todayState = getOrCreateDailyTasksState(state);
  const tasks = getResolvedDailyTasks(todayState);
  let count = tasks.filter((t) => t.completed && !t.claimed).length;

  const completedCount = tasks.filter((t) => t.completed || t.claimed).length;
  if (completedCount >= DAILY_BONUS_TARGET.requiredTasks && !todayState.bonusClaimed) {
    count += 1;
  }
  return count;
}

export function recordDailyTaskProgress(
  prevProfile: PlayerProfile,
  category: 'levels' | 'moves' | 'stars' | 'powerup' | 'tubes',
  amount = 1
): PlayerProfile {
  const currentState = getOrCreateDailyTasksState(prevProfile.dailyTasksState);
  const updatedTasks = { ...currentState.tasks };
  let hasChanges = false;

  DAILY_TASKS_TEMPLATES.forEach((tpl) => {
    if (tpl.category === category) {
      const taskRecord = updatedTasks[tpl.id] || { current: 0, completed: false, claimed: false };
      if (!taskRecord.claimed) {
        const nextCurrent = (taskRecord.current || 0) + amount;
        const isCompleted = nextCurrent >= tpl.target;
        updatedTasks[tpl.id] = {
          ...taskRecord,
          current: nextCurrent,
          completed: isCompleted,
        };
        hasChanges = true;
      }
    }
  });

  if (!hasChanges) return prevProfile;

  return {
    ...prevProfile,
    dailyTasksState: {
      ...currentState,
      tasks: updatedTasks,
    },
  };
}

