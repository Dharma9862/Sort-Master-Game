import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Bell,
  BellRing,
  Send,
  Sparkles,
  Clock,
  CheckCircle2,
  Trash2,
  AlertCircle,
  ExternalLink,
  Flame,
  Zap,
  Coins,
  Building2,
  Trophy,
  Bot,
  Filter,
  CheckCheck,
  Smartphone,
  Globe,
  Sliders,
  Play,
  RotateCcw,
} from 'lucide-react';
import { AppNotification, NotificationType } from '../types/game';
import {
  NOTIFICATION_PRESETS,
  NotificationPreset,
  getWebNotificationPermission,
  requestWebNotificationPermission,
  triggerBrowserNotification,
  createNotification,
} from '../utils/notifications';
import { sounds } from '../utils/audio';

interface ScheduledItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  actionType?: AppNotification['actionType'];
  actionData?: any;
  sendWebPush: boolean;
  scheduledTime: number; // target timestamp
  timerId: number;
}

interface NotificationModalProps {
  isOpen: boolean;
  notifications: AppNotification[];
  notificationsEnabled: boolean;
  browserPushEnabled: boolean;
  onSendNotification: (notif: AppNotification, showToast?: boolean, triggerWebPush?: boolean) => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onClearAllNotifications: () => void;
  onToggleNotifications: () => void;
  onToggleBrowserPush: (enabled: boolean) => void;
  onNavigateAction: (actionType: string, actionData?: any) => void;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  notifications = [],
  notificationsEnabled = true,
  browserPushEnabled = false,
  onSendNotification,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAllNotifications,
  onToggleNotifications,
  onToggleBrowserPush,
  onNavigateAction,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'sender' | 'inbox'>('sender');
  const [filterType, setFilterType] = useState<string>('all');
  const [webPermission, setWebPermission] = useState<NotificationPermission | 'unsupported'>('default');

  // Custom Notification Composer State
  const [customTitle, setCustomTitle] = useState<string>('🎉 Level Milestone Reward Ready!');
  const [customMessage, setCustomMessage] = useState<string>('You earned a special Mystery Chest with +350 Coins and 1 Free Undo booster.');
  const [customType, setCustomType] = useState<NotificationType>('reward');
  const [customAction, setCustomAction] = useState<string>('coins');
  const [deliveryMode, setDeliveryMode] = useState<'both' | 'toast' | 'push'>('both');
  const [delaySeconds, setDelaySeconds] = useState<number>(0); // 0 = instant, 5, 15, 30, 60

  // Scheduled timers list
  const [scheduledItems, setScheduledItems] = useState<ScheduledItem[]>([]);
  const [sendSuccessToast, setSendSuccessToast] = useState<string | null>(null);

  // Sync web permission status on open
  useEffect(() => {
    if (isOpen) {
      setWebPermission(getWebNotificationPermission());
    }
  }, [isOpen]);

  // Clean up scheduled timers on unmount
  useEffect(() => {
    return () => {
      scheduledItems.forEach((item) => clearTimeout(item.timerId));
    };
  }, [scheduledItems]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleRequestPermission = async () => {
    sounds.playClick();
    const granted = await requestWebNotificationPermission();
    setWebPermission(getWebNotificationPermission());
    if (granted) {
      onToggleBrowserPush(true);
      triggerBrowserNotification(
        '🔔 Push Notifications Activated!',
        'Sort Master will keep you notified on lives recharge, bonuses & bank payouts.'
      );
      sounds.playWin();
    }
  };

  const dispatchNow = (
    title: string,
    message: string,
    type: NotificationType,
    actionType?: AppNotification['actionType'],
    sendPush: boolean = true
  ) => {
    const newNotif = createNotification({
      title,
      message,
      type,
      actionType,
    });

    sounds.playNotificationChime();
    onSendNotification(newNotif, true, sendPush && (browserPushEnabled || webPermission === 'granted'));

    if (sendPush && webPermission === 'granted') {
      triggerBrowserNotification(title, message);
    }

    setSendSuccessToast(`Dispatched: "${title}"`);
    setTimeout(() => setSendSuccessToast(null), 3000);
  };

  const handleSendCustom = () => {
    if (!customTitle.trim() || !customMessage.trim()) return;

    sounds.playClick();
    const sendPush = deliveryMode === 'both' || deliveryMode === 'push';

    if (delaySeconds === 0) {
      dispatchNow(customTitle, customMessage, customType, customAction as any, sendPush);
    } else {
      // Schedule delayed notification
      const scheduleId = `sched_${Date.now()}`;
      const targetTime = Date.now() + delaySeconds * 1000;

      const timerId = window.setTimeout(() => {
        dispatchNow(customTitle, customMessage, customType, customAction as any, sendPush);
        setScheduledItems((prev) => prev.filter((s) => s.id !== scheduleId));
      }, delaySeconds * 1000);

      const newItem: ScheduledItem = {
        id: scheduleId,
        title: customTitle,
        message: customMessage,
        type: customType,
        actionType: customAction as any,
        sendWebPush: sendPush,
        scheduledTime: targetTime,
        timerId,
      };

      setScheduledItems((prev) => [...prev, newItem]);
      setSendSuccessToast(`⏰ Scheduled notification in ${delaySeconds}s!`);
      setTimeout(() => setSendSuccessToast(null), 3000);
    }
  };

  const handleCancelScheduled = (id: string, timerId: number) => {
    sounds.playClick();
    clearTimeout(timerId);
    setScheduledItems((prev) => prev.filter((s) => s.id !== id));
  };

  const handleQuickPresetSend = (preset: NotificationPreset) => {
    dispatchNow(preset.title, preset.message, preset.type, preset.actionType, true);
  };

  // Filtered notifications for inbox
  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'all') return true;
    if (filterType === 'unread') return !n.read;
    return n.type === filterType;
  });

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'reward':
        return <Coins className="w-4 h-4 text-amber-400" />;
      case 'life':
        return <Zap className="w-4 h-4 text-amber-300" />;
      case 'withdrawal':
        return <Building2 className="w-4 h-4 text-emerald-400" />;
      case 'achievement':
        return <Trophy className="w-4 h-4 text-purple-400" />;
      case 'streak':
        return <Flame className="w-4 h-4 text-orange-400" />;
      case 'alert':
        return <Bot className="w-4 h-4 text-cyan-400" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-400" />;
    }
  };

  const formatTimestamp = (ts: number) => {
    const diffMs = Date.now() - ts;
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.93 }}
          className="relative w-full max-w-lg max-h-[90vh] overflow-hidden rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl text-white flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg border border-indigo-400/40">
                <BellRing className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-black text-white flex items-center space-x-2">
                  <span>Notification Center & Sender</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[11px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400">Push alert dispatcher, triggers & message inbox</p>
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

          {/* Toast feedback banner */}
          {sendSuccessToast && (
            <div className="bg-emerald-600/90 text-white text-xs font-bold py-2 px-4 flex items-center justify-between animate-fadeIn">
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{sendSuccessToast}</span>
              </span>
              <button
                type="button"
                onClick={() => setSendSuccessToast(null)}
                className="text-xs text-emerald-200 hover:text-white"
              >
                ✕
              </button>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 pt-2">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('sender');
              }}
              className={`flex-1 pb-2.5 text-xs font-black flex items-center justify-center space-x-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'sender'
                  ? 'text-indigo-400 border-indigo-500'
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Notification Sender Studio</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('inbox');
              }}
              className={`flex-1 pb-2.5 text-xs font-black flex items-center justify-center space-x-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'inbox'
                  ? 'text-indigo-400 border-indigo-500'
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Inbox & History ({notifications.length})</span>
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* TAB 1: SENDER STUDIO */}
            {activeTab === 'sender' && (
              <div className="space-y-4">
                {/* Browser Web Push Permission Card */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/60 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-white flex items-center space-x-1.5">
                        <span>Web Push Alerts</span>
                        {webPermission === 'granted' ? (
                          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                            GRANTED
                          </span>
                        ) : webPermission === 'denied' ? (
                          <span className="text-[10px] text-rose-400 font-mono bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/30">
                            BLOCKED
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                            NEEDS PERMISSION
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">Receive system notifications when energy is full</p>
                    </div>
                  </div>

                  {webPermission !== 'granted' && (
                    <button
                      type="button"
                      onClick={handleRequestPermission}
                      className="py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition-all cursor-pointer"
                    >
                      Enable Web Push
                    </button>
                  )}
                </div>

                {/* 1-Tap Quick Presets Sender */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>1-Tap Instant Notification Presets</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Click to test dispatch</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {NOTIFICATION_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          handleQuickPresetSend(preset);
                        }}
                        className="p-2.5 rounded-2xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 text-left transition-all group cursor-pointer flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-indigo-300">
                            {preset.badgeLabel}
                          </span>
                          <span className="text-xs">{preset.title.slice(0, 2)}</span>
                        </div>
                        <div className="text-xs font-bold text-white line-clamp-1 group-hover:text-indigo-200">
                          {preset.title.replace(/^[\p{Emoji}\s]+/u, '')}
                        </div>
                        <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                          {preset.message}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Notification Composer */}
                <div className="p-4 rounded-2xl bg-slate-950/90 border border-indigo-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-1.5">
                      <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Custom Notification Sender</span>
                    </span>
                    <span className="text-[10px] text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded font-mono font-bold">
                      STUDIO
                    </span>
                  </div>

                  {/* Title Field */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Notification Title
                    </label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="e.g. 🎁 Mystery Reward Drop"
                      className="w-full py-2 px-3 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Message Body Field */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Message Content
                    </label>
                    <textarea
                      rows={2}
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="e.g. You received +500 Coins for your sorting victory!"
                      className="w-full py-2 px-3 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Category & Action Options */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Category Type</label>
                      <select
                        value={customType}
                        onChange={(e) => setCustomType(e.target.value as NotificationType)}
                        className="w-full py-1.5 px-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="reward">🎁 Reward & Coins</option>
                        <option value="life">⚡ Energy & Lives</option>
                        <option value="withdrawal">💳 Bank & UPI</option>
                        <option value="achievement">🏆 Achievement</option>
                        <option value="streak">🔥 Streak Alert</option>
                        <option value="alert">🤖 AI Puzzle Hint</option>
                        <option value="custom">💬 Custom Info</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Action Button</label>
                      <select
                        value={customAction}
                        onChange={(e) => setCustomAction(e.target.value)}
                        className="w-full py-1.5 px-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="referral">👥 Refer & Earn (+100 Pts)</option>
                        <option value="coins">⭐ Add +250 Coins</option>
                        <option value="lives">⚡ Refill Lives</option>
                        <option value="daily">📅 Daily Streak</option>
                        <option value="withdraw">💳 Bank Withdrawal</option>
                        <option value="solver">🤖 AI Solver</option>
                        <option value="themes">🎨 Themes Shop</option>
                      </select>
                    </div>
                  </div>

                  {/* Timing & Delay Dispatch Selector */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                      <span>Dispatch Delay Timer:</span>
                      <span className="font-mono text-indigo-400 font-bold">
                        {delaySeconds === 0 ? '⚡ Instant Dispatch' : `⏰ In ${delaySeconds} seconds`}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      {[0, 5, 15, 30].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => {
                            sounds.playClick();
                            setDelaySeconds(sec);
                          }}
                          className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            delaySeconds === sec
                              ? 'bg-indigo-600/30 text-indigo-300 border-indigo-400'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {sec === 0 ? 'Instant' : `${sec}s Delay`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dispatch Button */}
                  <button
                    type="button"
                    onClick={handleSendCustom}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:to-pink-400 text-white font-black text-xs shadow-xl flex items-center justify-center space-x-2 transition-all cursor-pointer transform active:scale-98"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {delaySeconds === 0 ? 'Send Notification to User' : `Schedule Notification (${delaySeconds}s)`}
                    </span>
                  </button>
                </div>

                {/* Scheduled Countdown Queue (if any) */}
                {scheduledItems.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-2">
                    <span className="text-xs font-black text-amber-400 flex items-center space-x-1.5">
                      <Clock className="w-4 h-4" />
                      <span>Pending Scheduled Notifications ({scheduledItems.length})</span>
                    </span>

                    <div className="space-y-1.5">
                      {scheduledItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                        >
                          <div>
                            <div className="font-bold text-white">{item.title}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Delivering in ~{Math.max(1, Math.round((item.scheduledTime - Date.now()) / 1000))}s
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCancelScheduled(item.id, item.timerId)}
                            className="p-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-[10px] font-bold"
                          >
                            Cancel
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: NOTIFICATION INBOX & HISTORY */}
            {activeTab === 'inbox' && (
              <div className="space-y-3">
                {/* Inbox Control Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {['all', 'unread', 'reward', 'life', 'withdrawal'].map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setFilterType(f);
                        }}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer ${
                          filterType === f
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          onMarkAllAsRead();
                        }}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Mark Read</span>
                      </button>
                    )}

                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          onClearAllNotifications();
                        }}
                        className="text-[11px] text-slate-500 hover:text-rose-400 font-bold flex items-center space-x-1 cursor-pointer ml-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Clear</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Notifications List */}
                {filteredNotifications.length > 0 ? (
                  <div className="space-y-2">
                    {filteredNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (!notif.read) onMarkAsRead(notif.id);
                        }}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col space-y-2 ${
                          notif.read
                            ? 'bg-slate-950/50 border-slate-800/80 text-slate-400'
                            : 'bg-slate-950 border-indigo-500/40 text-white shadow-md ring-1 ring-indigo-500/20'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2.5">
                            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                              {getTypeIcon(notif.type)}
                            </div>
                            <div>
                              <div className="text-xs font-black text-white flex items-center space-x-1.5">
                                <span>{notif.title}</span>
                                {!notif.read && (
                                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {formatTimestamp(notif.timestamp)}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              sounds.playClick();
                              onDeleteNotification(notif.id);
                            }}
                            className="text-slate-600 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <p className="text-xs text-slate-300 pl-10 font-medium">
                          {notif.message}
                        </p>

                        {/* Action Trigger button (if attached) */}
                        {notif.actionType && (
                          <div className="pl-10 pt-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                sounds.playClick();
                                if (!notif.read) onMarkAsRead(notif.id);
                                onNavigateAction(notif.actionType!, notif.actionData);
                                onClose();
                              }}
                              className="py-1.5 px-3 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-[11px] font-bold inline-flex items-center space-x-1 cursor-pointer transition-all"
                            >
                              <span>
                                {notif.actionType === 'daily'
                                  ? 'Claim Daily Reward 🎁'
                                  : notif.actionType === 'referral'
                                  ? 'Open Refer & Earn (+100 Pts) 👥'
                                  : notif.actionType === 'lives'
                                  ? 'Use Energy Refill ⚡'
                                  : notif.actionType === 'withdraw'
                                  ? 'Open Bank Wallet 💳'
                                  : notif.actionType === 'coins'
                                  ? 'Claim +250 Coins ⭐'
                                  : notif.actionType === 'solver'
                                  ? 'Launch AI Solver 🤖'
                                  : 'Open Rewards'}
                              </span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center space-y-2">
                    <Bell className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400 font-bold">No notifications in this filter</p>
                    <p className="text-[11px] text-slate-500">
                      Use the <strong>Notification Sender Studio</strong> tab to dispatch alerts!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
