import { AppNotification, NotificationType } from '../types/game';
import { sounds } from './audio';

export interface SendNotificationOptions {
  title: string;
  message: string;
  type: NotificationType;
  actionType?: AppNotification['actionType'];
  actionData?: any;
  sendWebPush?: boolean;
  delayMs?: number;
}

export interface NotificationPreset {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  actionType?: AppNotification['actionType'];
  badgeLabel: string;
  iconColor: string;
}

export const NOTIFICATION_PRESETS: NotificationPreset[] = [
  {
    id: 'preset_referral',
    title: '👥 Referral Bonus Credited (+100 Points)!',
    message: 'A friend joined using your referral code. +100 Cash Points added to your wallet!',
    type: 'reward',
    actionType: 'referral',
    badgeLabel: 'Referral Bonus',
    iconColor: 'from-purple-500 to-pink-500',
  },
  {
    id: 'preset_energy',
    title: '⚡ Energy Fully Restored!',
    message: 'Your lives have fully recharged to 5/5. Tap to jump back into sorting!',
    type: 'life',
    actionType: 'lives',
    badgeLabel: 'Energy Refill',
    iconColor: 'from-amber-500 to-orange-500',
  },
  {
    id: 'preset_daily',
    title: '🎁 Daily Login Gift Ready',
    message: 'Day Streak Reward is waiting! Claim +200 Coins and extra hints.',
    type: 'reward',
    actionType: 'daily',
    badgeLabel: 'Daily Bonus',
    iconColor: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'preset_coins',
    title: '💎 Golden Coin Drop (+500 Coins)!',
    message: 'A mystery puzzle bonus package has dropped into your inventory.',
    type: 'reward',
    actionType: 'coins',
    badgeLabel: 'Coin Drop',
    iconColor: 'from-yellow-500 to-amber-400',
  },
  {
    id: 'preset_upi',
    title: '💸 UPI Payout Confirmation',
    message: '₹50.00 INR has been processed and credited to your virtual bank wallet.',
    type: 'withdrawal',
    actionType: 'withdraw',
    badgeLabel: 'Bank Transfer',
    iconColor: 'from-emerald-600 to-green-500',
  },
  {
    id: 'preset_achievement',
    title: '🏆 Achievement Unlocked: Sort Wizard!',
    message: 'You have perfected 10 levels with 3 stars! Claim your mastery badge.',
    type: 'achievement',
    actionType: 'themes',
    badgeLabel: 'Achievement',
    iconColor: 'from-purple-500 to-indigo-500',
  },
  {
    id: 'preset_streak',
    title: '🔥 Streak Protection Alert!',
    message: 'Solve 1 level today before midnight to maintain your continuous streak bonus.',
    type: 'streak',
    actionType: 'daily',
    badgeLabel: 'Streak Alert',
    iconColor: 'from-rose-500 to-red-500',
  },
  {
    id: 'preset_solver',
    title: '🤖 AI Puzzle Solver Hint Ready',
    message: 'Stuck on a tricky tube? The AI Solver found an optimal 5-move victory path.',
    type: 'alert',
    actionType: 'solver',
    badgeLabel: 'AI Solver',
    iconColor: 'from-cyan-500 to-blue-500',
  },
];

/**
 * Check browser notification support
 */
export function isWebNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current browser notification permission status
 */
export function getWebNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isWebNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Request notification permission from the user
 */
export async function requestWebNotificationPermission(): Promise<boolean> {
  if (!isWebNotificationSupported()) return false;
  try {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  } catch (err) {
    console.warn('Failed to request notification permission', err);
    return false;
  }
}

/**
 * Trigger real browser notification if permission granted
 */
export function triggerBrowserNotification(title: string, body: string, icon?: string): boolean {
  if (!isWebNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    const notif = new Notification(title, {
      body,
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'sort-master-alert',
      silent: false,
    });

    notif.onclick = () => {
      window.focus();
      notif.close();
    };

    return true;
  } catch (err) {
    console.warn('Could not fire browser Notification:', err);
    return false;
  }
}

/**
 * Create a new formatted AppNotification entity
 */
export function createNotification(opts: SendNotificationOptions): AppNotification {
  return {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    title: opts.title,
    message: opts.message,
    type: opts.type,
    timestamp: Date.now(),
    read: false,
    actionType: opts.actionType,
    actionData: opts.actionData,
  };
}
