import { useState, useEffect, useCallback } from 'react';

const SIMULATED_OFFLINE_STORAGE_KEY = 'sort_master_simulated_offline';

export interface NetworkStatus {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  isDeviceOnline: boolean;
  toggleSimulatedOffline: () => void;
  setSimulatedOffline: (simulated: boolean) => void;
}

export function useNetworkStatus(): NetworkStatus {
  const [isDeviceOnline, setIsDeviceOnline] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });

  const [isSimulatedOffline, setIsSimulatedOfflineState] = useState<boolean>(() => {
    if (typeof localStorage !== 'undefined') {
      try {
        return localStorage.getItem(SIMULATED_OFFLINE_STORAGE_KEY) === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });

  useEffect(() => {
    const handleOnline = () => setIsDeviceOnline(true);
    const handleOffline = () => setIsDeviceOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const setSimulatedOffline = useCallback((simulated: boolean) => {
    setIsSimulatedOfflineState(simulated);
    try {
      localStorage.setItem(SIMULATED_OFFLINE_STORAGE_KEY, simulated ? 'true' : 'false');
    } catch {
      // storage error fallback
    }
  }, []);

  const toggleSimulatedOffline = useCallback(() => {
    setIsSimulatedOfflineState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIMULATED_OFFLINE_STORAGE_KEY, next ? 'true' : 'false');
      } catch {
        // storage error fallback
      }
      return next;
    });
  }, []);

  // Active online state is true ONLY if device is online AND simulation is off
  const isOnline = isDeviceOnline && !isSimulatedOffline;

  return {
    isOnline,
    isSimulatedOffline,
    isDeviceOnline,
    toggleSimulatedOffline,
    setSimulatedOffline,
  };
}
