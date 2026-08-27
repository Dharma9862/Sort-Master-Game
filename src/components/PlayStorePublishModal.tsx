import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Smartphone,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Terminal,
  Key,
  Package,
  Layers,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  FileCode,
  FileText,
  AlertTriangle,
  Play,
  Share2,
  Tv,
  CheckSquare,
  Square,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';

interface PlayStorePublishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'workflow' | 'store_listing' | 'configs' | 'checklist' | 'data_safety';

const PLAY_STORE_LISTING = {
  title: 'Sort Master: Color Puzzle Game',
  shortDescription: 'Addictive color water sorting puzzle with 200+ levels, brain teasers & rewards!',
  fullDescription: `🎉 Welcome to Sort Master — The Ultimate Mobile Water Color Sorting Puzzle Game!

Are you ready to test your brain, relax your mind, and master colorful liquid puzzles? Sort Master challenges your logic with over 200 handcrafted levels, vibrant themes, smart AI move solvers, and an engaging virtual rewards system!

🧪 HOW TO PLAY:
• Tap any bottle to pour the top colored liquid into another bottle.
• You can only pour if both bottles have the same color on top and there is enough space!
• Sort all tubes until every bottle contains a single, pure color to achieve Victory!
• Stuck? Use intelligent power-ups like Undo, AI Hint Solver, or Add Extra Bottle!

🌟 EXCITING GAME FEATURES:
✨ 200+ Progressive Levels — From gentle Beginner stages to mind-bending Master puzzles.
🎨 10 Vibrant Collectible Themes — Neon Glow, Cyberpunk 2077, Candy Pastel, Retro 8-bit, Gold Luxury & more!
🤖 Smart AI Hint Solver — Instant step-by-step solutions whenever you need guidance.
👥 Refer & Earn Bonus — Invite friends with your unique referral code for +100 Points bonus!
🎁 Daily Login Rewards & Streaks — Multipliers, free lives, golden coins, and achievement gifts.
🪙 Virtual Wallet & Rewards — Convert solved puzzle points into virtual wallet balance with simulated UPI withdrawals.
⚡ 100% Offline Playable — No Wi-Fi or data connection required!
🎮 Smooth 60FPS Mobile Physics — Satisfying liquid pouring physics and realistic water audio effects.

Designed with love for puzzle lovers of all ages! Download Sort Master today and start pouring your way to victory!`,
  category: 'Games > Puzzle / Casual / Single Player / Brain Games',
  contentRating: 'Everyone (PEGI 3, USK 0, ESRB Everyone)',
  tags: 'Color sort, Water puzzle, Liquid sort, Brain games, Logic puzzle, Offline games, Casual puzzle',
};

const ANDROID_MANIFEST_XML = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.sortmaster.puzzle.app">

    <!-- Permissions required for Sort Master Mobile Game -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:hardwareAccelerated="true">

        <!-- Google AdMob Mobile Ads App ID (Sample Test ID) -->
        <meta-data
            android:name="com.google.android.gms.ads.APPLICATION_ID"
            android:value="ca-app-pub-3940256099942544~3347511713"/>

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:label="@string/title_activity_main"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:launchMode="singleTask"
            android:screenOrientation="portrait"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

const CAPACITOR_CONFIG_CONTENT = `import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sortmaster.puzzle.app',
  appName: 'Sort Master',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#030712',
    buildOptions: {
      keystorePath: 'sortmaster-release-key.jks',
      keystoreAlias: 'sortmaster',
    },
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#030712',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#030712',
      overlaysWebView: false,
    },
  },
};

export default config;`;

const GRADLE_SIGNING_BLOCK = `android {
    ...
    defaultConfig {
        applicationId "com.sortmaster.puzzle.app"
        minSdkVersion 22
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }

    signingConfigs {
        release {
            storeFile file("sortmaster-release-key.jks")
            storePassword "YourKeystorePassword"
            keyAlias "sortmaster"
            keyPassword "YourKeyPassword"
        }
    }

    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release
        }
    }
}`;

const PRIVACY_POLICY_MD = `# Privacy Policy for Sort Master Mobile Game

Last updated: August 2026

Sort Master ("we", "our", or "us") is dedicated to protecting user privacy. This Privacy Policy outlines how your information is handled when playing the Sort Master mobile application and web game.

## 1. Information Collection and Storage
Sort Master is designed to respect user privacy:
- **Game Progress & Scores**: Saved locally on your device (levels solved, themes unlocked, coin balance, and referral stats).
- **No Personal Data Collected**: We do not collect names, phone numbers, physical addresses, or passwords.

## 2. Third-Party Services and Advertising
Sort Master may integrate Google Mobile Ads (AdMob) to display optional rewarded video and interstitial ads. These third-party ad networks may use anonymous device identifiers (such as Google Advertising ID) in accordance with Google Play Developer Policies.

## 3. Virtual Wallet and Rewards Disclaimer
All Cash Points, Coins, and UPI references inside Sort Master are part of a simulated game progression mechanic and entertainment system. No real money or financial banking credentials are ever stored or transferred directly from your device.

## 4. Children's Privacy (COPPA Compliance)
Sort Master does not knowingly collect any personally identifiable information from children under 13.

## 5. Contact Us
For any inquiries regarding this Privacy Policy, please contact our support team at: support@sortmastergame.com`;

const INITIAL_CHECKLIST = [
  { id: 'step_build', label: 'Run `npm run build` to generate static assets in dist/', completed: true },
  { id: 'step_cap_init', label: 'Initialize Capacitor Android project (`npx cap add android`)', completed: false },
  { id: 'step_icon', label: 'Add 512x512 Store Icon and Adaptive Mipmap Icons in Android Studio', completed: false },
  { id: 'step_keystore', label: 'Generate production release Keystore (.jks) with keytool', completed: false },
  { id: 'step_bundle', label: 'Build Signed Release AAB (`./gradlew bundleRelease`)', completed: false },
  { id: 'step_console', label: 'Create App on Google Play Console (Sort Master, Free, Game/Puzzle)', completed: false },
  { id: 'step_listing', label: 'Fill Store Listing (Title, Short Desc, Full Desc, Screenshots, Feature Graphic)', completed: false },
  { id: 'step_safety', label: 'Complete IARC Content Rating & Data Safety questionnaires', completed: false },
  { id: 'step_testers', label: 'Run Closed Testing track with 20 testers for 14 days (Play Store policy)', completed: false },
  { id: 'step_publish', label: 'Submit App Bundle (.aab) to Production Release for Google Review', completed: false },
];

export const PlayStorePublishModal: React.FC<PlayStorePublishModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('workflow');
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<number>(1);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [checklist, setChecklist] = useState(INITIAL_CHECKLIST);
  const [keystoreAlias, setKeystoreAlias] = useState<string>('sortmaster');
  const [keystoreFilename, setKeystoreFilename] = useState<string>('sortmaster-release-key.jks');

  if (!isOpen) return null;

  const completedCount = checklist.filter((item) => item.completed).length;
  const progressPercent = Math.round((completedCount / checklist.length) * 100);

  const keytoolCommand = `keytool -genkey -v -keystore ${keystoreFilename} -alias ${keystoreAlias} -keyalg RSA -keysize 2048 -validity 10000`;

  const handleCopy = (text: string, keyName: string) => {
    sounds.playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(keyName);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const toggleChecklistItem = (id: string) => {
    sounds.playClick();
    setChecklist((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item));
      if (next.every((item) => item.completed)) {
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#10b981', '#3b82f6', '#ec4899', '#f59e0b'],
          });
        } catch {
          // ignore
        }
      }
      return next;
    });
  };

  const handleDownloadStarterZip = () => {
    sounds.playWin();
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // ignore
    }

    // Create a combined bundle text file download
    const bundleContent = `=====================================================
SORT MASTER — MOBILE APP & PLAY STORE PUBLISH BUNDLE
Package Name: com.sortmaster.puzzle.app
App Title: Sort Master: Color Puzzle Game
=====================================================

1. CAPACITOR CONFIG (capacitor.config.ts):
${CAPACITOR_CONFIG_CONTENT}

2. ANDROID MANIFEST (AndroidManifest.xml):
${ANDROID_MANIFEST_XML}

3. BUILD.GRADLE SIGNING CONFIG:
${GRADLE_SIGNING_BLOCK}

4. KEYTOOL RELEASE COMMAND:
${keytoolCommand}

5. PLAY STORE METADATA:
Title: ${PLAY_STORE_LISTING.title}
Short Description: ${PLAY_STORE_LISTING.shortDescription}
Category: ${PLAY_STORE_LISTING.category}
Content Rating: ${PLAY_STORE_LISTING.contentRating}

Full Description:
${PLAY_STORE_LISTING.fullDescription}

6. PRIVACY POLICY:
${PRIVACY_POLICY_MD}
`;

    const blob = new Blob([bundleContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sort-master-playstore-publish-bundle.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-2xl max-h-[92vh] overflow-hidden rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl text-white flex flex-col"
        >
          {/* Header Banner */}
          <div className="p-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border-b border-emerald-500/30 flex items-center justify-between relative overflow-hidden">
            <div className="flex items-center space-x-3 relative z-10">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-lg border border-emerald-400/40">
                <Smartphone className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-black text-white flex items-center space-x-2">
                  <span>Web to Mobile App & Play Store Hub</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black tracking-wide">
                    APK & AAB READY
                  </span>
                </h3>
                <p className="text-xs text-slate-300">
                  Complete end-to-end guide, files & tools to package and publish to Google Play Console
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800/80 text-slate-300 hover:text-white cursor-pointer relative z-10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Progress Indicator Bar */}
          <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-bold text-slate-300">Play Store Readiness:</span>
              <span className="font-mono font-black text-emerald-400">{progressPercent}%</span>
              <span className="text-[10px] text-slate-500">
                ({completedCount}/{checklist.length} items checked)
              </span>
            </div>

            <div className="w-32 sm:w-44 bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950/40 px-3 pt-2 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('workflow');
              }}
              className={`px-3 pb-2.5 text-xs font-black flex items-center space-x-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'workflow'
                  ? 'text-emerald-400 border-emerald-500'
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Step-by-Step Workflow</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('store_listing');
              }}
              className={`px-3 pb-2.5 text-xs font-black flex items-center space-x-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'store_listing'
                  ? 'text-emerald-400 border-emerald-500'
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Store Listing Kit</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('configs');
              }}
              className={`px-3 pb-2.5 text-xs font-black flex items-center space-x-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'configs'
                  ? 'text-emerald-400 border-emerald-500'
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Config Files</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('checklist');
              }}
              className={`px-3 pb-2.5 text-xs font-black flex items-center space-x-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'checklist'
                  ? 'text-emerald-400 border-emerald-500'
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Publish Checklist ({completedCount}/{checklist.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('data_safety');
              }}
              className={`px-3 pb-2.5 text-xs font-black flex items-center space-x-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'data_safety'
                  ? 'text-emerald-400 border-emerald-500'
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Privacy & Safety</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* TAB 1: STEP-BY-STEP WORKFLOW */}
            {activeTab === 'workflow' && (
              <div className="space-y-4">
                {/* 5-Stage Step Selector */}
                <div className="grid grid-cols-5 gap-1.5 p-1.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  {[
                    { step: 1, label: '1. Capacitor', icon: Terminal },
                    { step: 2, label: '2. Android Studio', icon: Smartphone },
                    { step: 3, label: '3. Keystore', icon: Key },
                    { step: 4, label: '4. Build AAB', icon: Package },
                    { step: 5, label: '5. Play Console', icon: Play },
                  ].map((s) => {
                    const Icon = s.icon;
                    const isActive = activeWorkflowStep === s.step;
                    return (
                      <button
                        key={s.step}
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setActiveWorkflowStep(s.step);
                        }}
                        className={`py-2 px-1 rounded-xl text-xs font-black flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="text-[10px] leading-tight">{s.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* STAGE 1: CAPACITOR SETUP */}
                {activeWorkflowStep === 1 && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-white flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black">
                          1
                        </span>
                        <span>Initialize Native Android Project via Capacitor</span>
                      </h4>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                        CLI COMMANDS
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">
                      Capacitor wraps your React + Vite game code into an ultra-fast, native Android Studio project with full hardware acceleration and zero latency.
                    </p>

                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-slate-400">Execute in your terminal root:</div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-300 space-y-1 relative group">
                        <div># 1. Install Capacitor Native Core & CLI</div>
                        <div className="text-white font-bold">npm install @capacitor/core @capacitor/cli @capacitor/android</div>
                        <div className="pt-2 text-slate-400"># 2. Build production web bundle into dist/</div>
                        <div className="text-white font-bold">npm run build</div>
                        <div className="pt-2 text-slate-400"># 3. Add Android platform directory</div>
                        <div className="text-white font-bold">npx cap add android</div>
                        <div className="pt-2 text-slate-400"># 4. Sync assets & open project in Android Studio</div>
                        <div className="text-white font-bold">npx cap sync && npx cap open android</div>

                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(
                              'npm install @capacitor/core @capacitor/cli @capacitor/android && npm run build && npx cap add android && npx cap sync && npx cap open android',
                              'cap_cli'
                            )
                          }
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center space-x-1"
                        >
                          {copiedKey === 'cap_cli' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span className="text-[10px]">{copiedKey === 'cap_cli' ? 'Copied' : 'Copy All'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STAGE 2: ANDROID STUDIO & ASSETS */}
                {activeWorkflowStep === 2 && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-white flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black">
                          2
                        </span>
                        <span>Configure App Icons, Splash & Target SDK in Android Studio</span>
                      </h4>
                      <span className="text-[10px] text-teal-400 font-mono font-bold bg-teal-500/10 px-2 py-0.5 rounded">
                        ASSETS & SDK
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-300">
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                        <span className="font-bold text-white block">A. Generate Adaptive App Icons:</span>
                        <p className="text-slate-400">
                          In Android Studio, right-click <code className="text-emerald-400">app &gt; res</code>, select <strong className="text-white">New &gt; Image Asset</strong>. Choose Icon Type: <em>Launcher Icons (Adaptive and Legacy)</em>. Set Background Color: <code className="text-purple-300">#030712</code>.
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                        <span className="font-bold text-white block">B. Target SDK 34/35 Requirement:</span>
                        <p className="text-slate-400">
                          Ensure <code className="text-emerald-400">android/variables.gradle</code> or <code className="text-emerald-400">app/build.gradle</code> has <strong className="text-white">targetSdkVersion = 34</strong> (Google Play requires Target SDK 34+ for new app submissions).
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                        <span className="font-bold text-white block">C. AdMob App ID in AndroidManifest.xml:</span>
                        <p className="text-slate-400">
                          Replace the sample AdMob Application ID (<code className="text-amber-300">ca-app-pub-3940...</code>) with your live AdMob App ID from your AdMob Console.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* STAGE 3: KEYSTORE RELEASE SIGNING */}
                {activeWorkflowStep === 3 && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-white flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black">
                          3
                        </span>
                        <span>Generate Production Release Keystore (.jks)</span>
                      </h4>
                      <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                        KEYTOOL
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">
                      Google Play requires all Android App Bundles (.aab) to be digitally signed with a private cryptographic release key.
                    </p>

                    {/* Interactive Keystore Builder */}
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] text-slate-400 font-bold block mb-1">Keystore Filename:</label>
                          <input
                            type="text"
                            value={keystoreFilename}
                            onChange={(e) => setKeystoreFilename(e.target.value)}
                            className="w-full py-1.5 px-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 font-bold block mb-1">Key Alias:</label>
                          <input
                            type="text"
                            value={keystoreAlias}
                            onChange={(e) => setKeystoreAlias(e.target.value)}
                            className="w-full py-1.5 px-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-white"
                          />
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300 relative group">
                        <div className="pr-16 text-[11px] break-all">{keytoolCommand}</div>
                        <button
                          type="button"
                          onClick={() => handleCopy(keytoolCommand, 'keytool_cmd')}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center space-x-1"
                        >
                          {copiedKey === 'keytool_cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span className="text-[10px]">{copiedKey === 'keytool_cmd' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STAGE 4: BUILD RELEASE AAB */}
                {activeWorkflowStep === 4 && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-white flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black">
                          4
                        </span>
                        <span>Compile Android App Bundle (.aab)</span>
                      </h4>
                      <span className="text-[10px] text-purple-400 font-mono font-bold bg-purple-500/10 px-2 py-0.5 rounded">
                        GRADLEW
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">
                      Google Play only accepts the modern <strong>.aab (Android App Bundle)</strong> format for release publishing instead of raw APKs.
                    </p>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-purple-300 space-y-1 relative">
                      <div className="text-slate-400"># Navigate to android directory and compile signed bundle</div>
                      <div className="text-white font-bold">cd android && ./gradlew bundleRelease</div>
                      <div className="pt-2 text-slate-400"># Output bundle file location:</div>
                      <div className="text-emerald-400 font-bold text-[11px] break-all">
                        android/app/build/outputs/bundle/release/app-release.aab
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopy('cd android && ./gradlew bundleRelease', 'gradle_cmd')}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center space-x-1"
                      >
                        {copiedKey === 'gradle_cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="text-[10px]">{copiedKey === 'gradle_cmd' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* STAGE 5: PLAY CONSOLE & 20-TESTER TRACK */}
                {activeWorkflowStep === 5 && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-white flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black">
                          5
                        </span>
                        <span>Google Play Console Track Progression & 20 Testers</span>
                      </h4>
                      <span className="text-[10px] text-blue-400 font-mono font-bold bg-blue-500/10 px-2 py-0.5 rounded">
                        RELEASE TRACKS
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-300">
                      <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 space-y-1">
                        <span className="font-bold text-blue-300 flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                          <span>1. Internal Testing Track (Instant & No Review)</span>
                        </span>
                        <p className="text-slate-300 text-[11px]">
                          Upload your <code className="text-blue-300">app-release.aab</code> to Internal Testing. Add up to 100 email testers to verify on real Android phones immediately.
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 space-y-1">
                        <span className="font-bold text-purple-300 flex items-center space-x-1.5">
                          <UsersIcon className="w-3.5 h-3.5 text-purple-400" />
                          <span>2. Mandatory 20 Testers for 14 Days (Closed Beta)</span>
                        </span>
                        <p className="text-slate-300 text-[11px]">
                          For personal Play Console developer accounts created after Nov 2023, Google requires at least 20 opted-in testers for 14 continuous days before Production Access can be unlocked.
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-1">
                        <span className="font-bold text-emerald-300 flex items-center space-x-1.5">
                          <Zap className="w-3.5 h-3.5 text-emerald-400" />
                          <span>3. Production Track & Google Review</span>
                        </span>
                        <p className="text-slate-300 text-[11px]">
                          Once closed testing is complete, click <strong>Apply for Production</strong>. Submit your release for Google Play automated security scans and policy review (typically approved in 24–48 hours).
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: STORE LISTING METADATA KIT */}
            {activeTab === 'store_listing' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 border border-purple-500/40 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-purple-300">
                    Google Play Console Ready
                  </span>
                  <h4 className="text-sm font-black text-white">Store Listing Copy & Asset Specs</h4>
                  <p className="text-xs text-slate-300">
                    Copy and paste these pre-formatted, optimized metadata strings directly into your Google Play Console store listing dashboard.
                  </p>
                </div>

                {/* App Title */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">App Title (Max 30 characters):</span>
                    <span className="font-mono text-purple-400 text-[10px]">{PLAY_STORE_LISTING.title.length}/30</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-xs font-bold text-white">{PLAY_STORE_LISTING.title}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(PLAY_STORE_LISTING.title, 'app_title')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center space-x-1"
                    >
                      {copiedKey === 'app_title' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[10px]">{copiedKey === 'app_title' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Short Description */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">Short Description (Max 80 characters):</span>
                    <span className="font-mono text-purple-400 text-[10px]">
                      {PLAY_STORE_LISTING.shortDescription.length}/80
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-xs text-white leading-relaxed">{PLAY_STORE_LISTING.shortDescription}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(PLAY_STORE_LISTING.shortDescription, 'short_desc')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center space-x-1 flex-shrink-0 ml-2"
                    >
                      {copiedKey === 'short_desc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[10px]">{copiedKey === 'short_desc' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Full Description */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">Full Description (Max 4000 characters):</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(PLAY_STORE_LISTING.fullDescription, 'full_desc')}
                      className="p-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer text-xs flex items-center space-x-1"
                    >
                      {copiedKey === 'full_desc' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[10px]">{copiedKey === 'full_desc' ? 'Copied' : 'Copy Full Description'}</span>
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 max-h-40 overflow-y-auto text-[11px] text-slate-300 whitespace-pre-line leading-relaxed font-sans">
                    {PLAY_STORE_LISTING.fullDescription}
                  </div>
                </div>

                {/* Graphic Requirements */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-[10px] font-bold text-purple-400 uppercase">App Icon Specification</div>
                    <div className="text-xs font-black text-white">512 × 512 px</div>
                    <div className="text-[10px] text-slate-400">32-bit PNG, Max 1024 KB</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-[10px] font-bold text-emerald-400 uppercase">Feature Graphic Spec</div>
                    <div className="text-xs font-black text-white">1024 × 500 px</div>
                    <div className="text-[10px] text-slate-400">JPG or 24-bit PNG (no alpha)</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CONFIG FILES & CODE EXPORTER */}
            {activeTab === 'configs' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Ready-to-Use Native Project Files:</span>
                  <button
                    type="button"
                    onClick={handleDownloadStarterZip}
                    className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center space-x-1.5 cursor-pointer shadow transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Bundle File (.txt)</span>
                  </button>
                </div>

                {/* AndroidManifest.xml */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-300 flex items-center space-x-1.5">
                      <FileCode className="w-3.5 h-3.5" />
                      <span>android/app/src/main/AndroidManifest.xml</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(ANDROID_MANIFEST_XML, 'manifest_code')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center space-x-1"
                    >
                      {copiedKey === 'manifest_code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[10px]">{copiedKey === 'manifest_code' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 max-h-36 overflow-y-auto text-[10px] text-slate-300 font-mono leading-relaxed">
                    {ANDROID_MANIFEST_XML}
                  </pre>
                </div>

                {/* capacitor.config.ts */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-purple-300 flex items-center space-x-1.5">
                      <FileCode className="w-3.5 h-3.5" />
                      <span>capacitor.config.ts</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(CAPACITOR_CONFIG_CONTENT, 'cap_code')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center space-x-1"
                    >
                      {copiedKey === 'cap_code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[10px]">{copiedKey === 'cap_code' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 max-h-36 overflow-y-auto text-[10px] text-slate-300 font-mono leading-relaxed">
                    {CAPACITOR_CONFIG_CONTENT}
                  </pre>
                </div>

                {/* Signing Config block */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-300 flex items-center space-x-1.5">
                      <FileCode className="w-3.5 h-3.5" />
                      <span>android/app/build.gradle (signingConfigs)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(GRADLE_SIGNING_BLOCK, 'gradle_code')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center space-x-1"
                    >
                      {copiedKey === 'gradle_code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[10px]">{copiedKey === 'gradle_code' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 max-h-36 overflow-y-auto text-[10px] text-slate-300 font-mono leading-relaxed">
                    {GRADLE_SIGNING_BLOCK}
                  </pre>
                </div>
              </div>
            )}

            {/* TAB 4: PUBLISH CHECKLIST */}
            {activeTab === 'checklist' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">Publish Verification Roadmap</span>
                  <span className="font-mono text-emerald-400 font-black">{progressPercent}% complete</span>
                </div>

                <div className="space-y-2">
                  {checklist.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleChecklistItem(item.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3 ${
                        item.completed
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-white'
                          : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-600 flex-shrink-0" />
                      )}
                      <span className={`text-xs font-bold leading-snug ${item.completed ? 'text-white' : 'text-slate-300'}`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: PRIVACY POLICY & DATA SAFETY */}
            {activeTab === 'data_safety' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-400 flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Google Play Data Safety & Privacy Policy</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(PRIVACY_POLICY_MD, 'privacy_policy')}
                      className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      {copiedKey === 'privacy_policy' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[10px]">{copiedKey === 'privacy_policy' ? 'Copied' : 'Copy Privacy Policy'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-300">
                    Google Play mandates a live public Privacy Policy URL. You can host this privacy policy on GitHub Pages, Notion, or your custom domain.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 max-h-56 overflow-y-auto text-[11px] text-slate-300 whitespace-pre-line leading-relaxed font-sans">
                  {PRIVACY_POLICY_MD}
                </div>

                {/* Google Play Data Safety Declaration Summary */}
                <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-white block">Data Safety Questionnaire Answers:</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Data Collection:</span>
                      <strong className="text-emerald-400">No personal data collected</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Data Sharing:</span>
                      <strong className="text-emerald-400">No data shared with 3rd parties</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Encryption:</span>
                      <strong className="text-white">Data encrypted in transit (HTTPS)</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Target Audience:</span>
                      <strong className="text-white">Everyone / Casual Players (13+)</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Action Bar */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between space-x-2">
            <button
              type="button"
              onClick={handleDownloadStarterZip}
              className="py-2.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download Bundle</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                handleCopy(
                  'npm install @capacitor/core @capacitor/cli @capacitor/android && npm run build && npx cap add android && npx cap sync && npx cap open android',
                  'btn_cap_all'
                );
              }}
              className="flex-1 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-98"
            >
              <Terminal className="w-4 h-4" />
              <span>{copiedKey === 'btn_cap_all' ? 'Copied Terminal Commands!' : 'Copy Mobile Build Commands'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
